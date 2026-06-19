'use client';

import { useState } from 'react';
import { 
  FileSearch, Upload, FileText, CheckCircle2, AlertTriangle, 
  CreditCard, TrendingDown, ArrowUpRight, ArrowDownLeft, Sparkles,
  RefreshCw, Check, X
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { addExpensesBulk } from '@/actions/expenses';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface DetectedTransaction {
  date: string;
  description: string;
  amount: number; // Negative for debits, positive for credits
  category: string;
  merchant: string;
}

interface AnalysisResults {
  transactions: DetectedTransaction[];
  totalCredits: number;
  totalDebits: number;
  subscriptions: { name: string; amount: number; frequency: string }[];
  unusualSpending: { description: string; amount: number; reason: string }[];
}

export default function AnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [selectedTxIdxs, setSelectedTxIdxs] = useState<number[]>([]);
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'expenses' | 'all' | 'income'>('expenses');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setResults(null);
    setInfoMessage(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setLoadingStep('Reading file contents...');

    try {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      let fileContent = '';

      if (fileType === 'csv') {
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        setLoadingStep('Parsing CSV columns...');
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        fileContent = JSON.stringify(parsed.data);

      } else if (fileType === 'xlsx' || fileType === 'xls') {
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });

        setLoadingStep('Reading Excel sheets...');
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);
        fileContent = JSON.stringify(rows);

      } else if (fileType === 'pdf') {
        setLoadingStep('Encoding PDF statement...');
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const raw = e.target?.result as string;
            resolve(raw.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        fileContent = base64;
      } else {
        throw new Error('Unsupported file type. Please upload a PDF, CSV, or Excel file.');
      }

      setLoadingStep('Analyzing statement pattern with Gemini AI...');

      const response = await fetch('/api/ai/analyze-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType, fileContent })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze statement');
      }

      setResults(data.results);
      if (data.info) {
        setInfoMessage(data.info);
      }

      // Pre-select all expense (debit) transactions
      const expenseIdxs = data.results.transactions
        .map((tx: DetectedTransaction, idx: number) => (tx.amount < 0 ? idx : -1))
        .filter((idx: number) => idx !== -1);
      setSelectedTxIdxs(expenseIdxs);

      toast.success('Statement analyzed successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to process statement');
    } finally {
      setAnalyzing(false);
      setLoadingStep('');
    }
  };

  const handleToggleSelectAll = () => {
    if (!results) return;
    const filterTxs = results.transactions.map((tx, idx) => ({ tx, idx }));
    
    // Determine target transactions based on the active tab
    const viewableExpenses = filterTxs.filter(item => item.tx.amount < 0);
    
    const allSelected = viewableExpenses.every(item => selectedTxIdxs.includes(item.idx));
    
    if (allSelected) {
      // Uncheck all viewable expenses
      setSelectedTxIdxs(prev => prev.filter(idx => !viewableExpenses.map(item => item.idx).includes(idx)));
    } else {
      // Check all viewable expenses
      setSelectedTxIdxs(prev => {
        const union = new Set([...prev, ...viewableExpenses.map(item => item.idx)]);
        return Array.from(union);
      });
    }
  };

  const handleToggleTx = (idx: number) => {
    setSelectedTxIdxs(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleImport = async () => {
    if (!results || selectedTxIdxs.length === 0) return;

    setImporting(true);
    try {
      const expensesToImport = selectedTxIdxs.map(idx => {
        const tx = results.transactions[idx];
        return {
          category: tx.category || 'Others',
          amount: Math.abs(tx.amount), // Save positive value for DB expense
          description: tx.description,
          merchant: tx.merchant || '',
          date: tx.date
        };
      });

      const res = await addExpensesBulk(expensesToImport);

      if (res.error) {
        throw new Error(res.error);
      }

      toast.success(`Successfully imported ${res.count} transactions to expenses!`);
      // Clear selected list
      setSelectedTxIdxs([]);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to import transactions');
    } finally {
      setImporting(false);
    }
  };

  // Compute category breakdown from results
  const computeCategoryBreakdown = () => {
    if (!results) return [];
    const categories: Record<string, number> = {};
    let totalDebit = 0;

    results.transactions.forEach(tx => {
      if (tx.amount < 0) {
        const absVal = Math.abs(tx.amount);
        categories[tx.category] = (categories[tx.category] || 0) + absVal;
        totalDebit += absVal;
      }
    });

    return Object.entries(categories).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalDebit > 0 ? parseFloat(((amount / totalDebit) * 100).toFixed(1)) : 0
    })).sort((a, b) => b.amount - a.amount);
  };

  const categoryBreakdown = computeCategoryBreakdown();

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-ai" /> Statement Analyzer
          </h1>
          <p className="text-sm text-text-muted mt-1">Upload PDF, CSV, or Excel bank statements to automatically classify transactions and review spending</p>
        </div>
        
        {results && (
          <button 
            onClick={() => { setResults(null); setFile(null); setSelectedTxIdxs([]); setInfoMessage(null); }} 
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-text-secondary hover:bg-surface-hover hover:text-text transition-colors self-start"
          >
            <RefreshCw className="w-4 h-4" /> Analyze Another
          </button>
        )}
      </div>

      {infoMessage && (
        <div className="bg-ai/10 border border-ai/20 rounded-xl p-4 flex gap-3 text-xs text-ai animate-slide-up">
          <Sparkles className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold mb-0.5">Analyzer Insight</p>
            <p>{infoMessage}</p>
          </div>
        </div>
      )}

      {!results ? (
        <div className="animate-slide-up">
          {/* Upload area */}
          <div
            className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-surface"
            onClick={() => document.getElementById('file-input')?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-primary/50'); }}
            onDragLeave={e => e.currentTarget.classList.remove('border-primary/50')}
            onDrop={e => { e.preventDefault(); if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]); }}
          >
            <input 
              id="file-input" 
              type="file" 
              className="hidden" 
              accept=".pdf,.csv,.xlsx,.xls" 
              onChange={handleFileChange} 
            />
            <Upload className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-base font-semibold text-text mb-1">Upload Statement</h3>
            <p className="text-sm text-text-muted mb-4">Drag & drop or click to browse bank statement files</p>
            <div className="flex items-center justify-center gap-3 text-xs text-text-muted">
              <span className="px-2.5 py-1 bg-background border border-border rounded-lg font-mono">PDF</span>
              <span className="px-2.5 py-1 bg-background border border-border rounded-lg font-mono">CSV</span>
              <span className="px-2.5 py-1 bg-background border border-border rounded-lg font-mono">Excel</span>
            </div>
          </div>

          {file && (
            <div className="mt-4 bg-surface border border-border rounded-xl p-4 flex items-center justify-between animate-slide-up">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-ai" />
                <div>
                  <p className="text-sm font-medium text-text">{file.name}</p>
                  <p className="text-xs text-text-muted">{(file.size / 1024).toFixed(1)} KB • {file.name.split('.').pop()?.toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="px-5 py-2.5 bg-ai hover:bg-ai/90 text-background text-sm font-semibold rounded-lg transition-all shadow-lg shadow-ai/10 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {analyzing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    <span>{loadingStep}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Statement</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface border border-border rounded-xl p-5">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Transactions</p>
              <p className="text-2xl font-bold text-text mt-2">{results.transactions.length}</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Deposits / Credits</p>
              <p className="text-2xl font-bold text-success mt-2">{formatCurrency(results.totalCredits)}</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-5">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Withdrawals / Debits</p>
              <p className="text-2xl font-bold text-danger mt-2">{formatCurrency(results.totalDebits)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subscriptions */}
            <div className="bg-surface border border-border rounded-xl p-5 lg:col-span-1 flex flex-col">
              <h3 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-ai" /> Detected Subscriptions
              </h3>
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[350px] pr-1">
                {results.subscriptions.length === 0 ? (
                  <p className="text-xs text-text-muted py-8 text-center bg-background rounded-lg border border-border/50">No recurring subscriptions detected</p>
                ) : (
                  results.subscriptions.map(s => (
                    <div key={s.name} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50">
                      <div>
                        <p className="text-sm font-semibold text-text">{s.name}</p>
                        <p className="text-[10px] text-text-muted">{s.frequency}</p>
                      </div>
                      <span className="text-sm font-bold text-text">{formatCurrency(s.amount)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Unusual */}
            <div className="bg-surface border border-border rounded-xl p-5 lg:col-span-1 flex flex-col">
              <h3 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" /> Unusual Outflows
              </h3>
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[350px] pr-1">
                {results.unusualSpending.length === 0 ? (
                  <p className="text-xs text-text-muted py-8 text-center bg-background rounded-lg border border-border/50">No high-value/anomaly spendings detected</p>
                ) : (
                  results.unusualSpending.map((u, i) => (
                    <div key={i} className="p-3 bg-warning/5 border border-warning/10 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <p className="text-xs font-semibold text-text truncate max-w-[70%]">{u.description}</p>
                        <span className="text-xs font-bold text-warning">{formatCurrency(u.amount)}</span>
                      </div>
                      <p className="text-[10px] text-text-muted">{u.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-surface border border-border rounded-xl p-5 lg:col-span-1 flex flex-col">
              <h3 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-danger" /> Category Distribution
              </h3>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-1">
                {categoryBreakdown.length === 0 ? (
                  <p className="text-xs text-text-muted py-8 text-center bg-background rounded-lg border border-border/50">No expense distribution metrics available</p>
                ) : (
                  categoryBreakdown.map(c => (
                    <div key={c.category}>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-text-secondary font-medium">{c.category}</span>
                        <span className="font-semibold text-text">{formatCurrency(c.amount)} ({c.percentage}%)</span>
                      </div>
                      <div className="h-1.5 bg-background rounded-full overflow-hidden border border-border/35">
                        <div className="h-full bg-ai rounded-full" style={{ width: `${c.percentage}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Transaction Table / Review Manager */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-hover/30">
              <div>
                <h3 className="text-base font-bold text-text flex items-center gap-2">
                  Review & Import Transactions
                </h3>
                <p className="text-xs text-text-muted mt-0.5">Select statement entries to import as expenses in your database</p>
              </div>

              {/* Import Action */}
              <button
                onClick={handleImport}
                disabled={importing || selectedTxIdxs.length === 0}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-background text-sm font-bold rounded-lg transition-all shadow-lg shadow-primary/10 disabled:opacity-50 flex items-center gap-2 cursor-pointer shrink-0"
              >
                {importing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Import Selected ({selectedTxIdxs.length})</span>
                  </>
                )}
              </button>
            </div>

            {/* Tabs & Table Header actions */}
            <div className="px-5 py-3 border-b border-border flex justify-between items-center bg-background/50">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('expenses')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'expenses' ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-text'
                  }`}
                >
                  Expenses Only
                </button>
                <button
                  onClick={() => setActiveTab('income')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'income' ? 'bg-success/10 text-success' : 'text-text-secondary hover:text-text'
                  }`}
                >
                  Deposits Only
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTab === 'all' ? 'bg-surface-hover text-text' : 'text-text-secondary hover:text-text'
                  }`}
                >
                  All Entries
                </button>
              </div>

              {activeTab === 'expenses' && (
                <button
                  onClick={handleToggleSelectAll}
                  className="text-xs text-primary font-semibold hover:underline bg-transparent border-0 cursor-pointer"
                >
                  {results.transactions.filter(t => t.amount < 0).every(t => selectedTxIdxs.includes(results.transactions.indexOf(t)))
                    ? 'Deselect All'
                    : 'Select All Expenses'}
                </button>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-background/30 text-xs text-text-muted font-semibold">
                    {activeTab === 'expenses' && <th className="p-4 w-[50px] text-center">Import</th>}
                    <th className="p-4 w-[120px]">Date</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 w-[150px]">Category</th>
                    <th className="p-4 w-[150px] text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {results.transactions
                    .map((tx, idx) => ({ tx, idx }))
                    .filter(item => {
                      if (activeTab === 'expenses') return item.tx.amount < 0;
                      if (activeTab === 'income') return item.tx.amount > 0;
                      return true;
                    })
                    .map(({ tx, idx }) => {
                      const isExpense = tx.amount < 0;
                      const isSelected = selectedTxIdxs.includes(idx);
                      
                      return (
                        <tr 
                          key={idx} 
                          className={`hover:bg-surface-hover/30 transition-colors ${
                            isSelected ? 'bg-primary/5' : ''
                          }`}
                        >
                          {activeTab === 'expenses' && (
                            <td className="p-4 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleTx(idx)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-opacity-20 cursor-pointer"
                              />
                            </td>
                          )}
                          <td className="p-4 font-mono text-xs text-text-secondary whitespace-nowrap">
                            {tx.date}
                          </td>
                          <td className="p-4 font-medium text-text">
                            <div className="flex flex-col">
                              <span>{tx.description}</span>
                              {tx.merchant && (
                                <span className="text-[10px] text-text-muted mt-0.5">Merchant: {tx.merchant}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              isExpense 
                                ? 'bg-danger/5 border-danger/10 text-danger' 
                                : 'bg-success/5 border-success/10 text-success'
                            }`}>
                              {tx.category}
                            </span>
                          </td>
                          <td className={`p-4 text-right font-mono font-bold whitespace-nowrap ${
                            isExpense ? 'text-text' : 'text-success'
                          }`}>
                            {isExpense ? '-' : '+'}{formatCurrency(Math.abs(tx.amount))}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
