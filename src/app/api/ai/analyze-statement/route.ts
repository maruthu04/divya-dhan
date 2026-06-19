import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

function localAnalyze(rows: any[]): any {
  if (!rows || !rows.length) {
    return {
      transactions: [],
      totalCredits: 0,
      totalDebits: 0,
      subscriptions: [],
      unusualSpending: []
    };
  }

  const sample = rows[0];
  const keys = Object.keys(sample);

  let dateKey = '';
  let descKey = '';
  let amountKey = '';
  let debitKey = '';
  let creditKey = '';

  for (const k of keys) {
    const kl = k.toLowerCase().trim();
    if (kl.includes('date')) dateKey = k;
    else if (kl.includes('desc') || kl.includes('narr') || kl.includes('part') || kl.includes('memo') || kl.includes('detail')) descKey = k;
    else if (kl.includes('amount') || kl.includes('val')) amountKey = k;
    else if (kl.includes('debit') || kl.includes('withdr')) debitKey = k;
    else if (kl.includes('credit') || kl.includes('depo')) creditKey = k;
  }

  if (!dateKey) dateKey = keys.find(k => k.toLowerCase().includes('dt')) || keys[0];
  if (!descKey) descKey = keys.find(k => k.toLowerCase().includes('text')) || keys[1] || keys[0];
  if (!amountKey && !debitKey && !creditKey) {
    amountKey = keys.find(k => k.toLowerCase().includes('amt')) || keys[2] || keys[0];
  }

  const transactions: any[] = [];
  let totalCredits = 0;
  let totalDebits = 0;
  const subscriptions: any[] = [];
  const unusualSpending: any[] = [];

  for (const row of rows) {
    if (!row[dateKey] && !row[descKey]) continue;

    const rawDate = row[dateKey] ? String(row[dateKey]).trim() : new Date().toISOString().split('T')[0];
    const desc = row[descKey] ? String(row[descKey]).trim() : 'Unspecified Transaction';

    let amount = 0;
    if (debitKey || creditKey) {
      const debit = debitKey && row[debitKey] ? parseFloat(String(row[debitKey]).replace(/[^0-9.-]/g, '')) : 0;
      const credit = creditKey && row[creditKey] ? parseFloat(String(row[creditKey]).replace(/[^0-9.-]/g, '')) : 0;
      if (!isNaN(credit) && credit > 0) {
        amount = credit;
      } else if (!isNaN(debit) && debit > 0) {
        amount = -debit;
      }
    } else if (amountKey && row[amountKey]) {
      amount = parseFloat(String(row[amountKey]).replace(/[^0-9.-]/g, ''));
    }

    if (isNaN(amount)) amount = 0;

    let formattedDate = rawDate;
    try {
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        formattedDate = parsedDate.toISOString().split('T')[0];
      }
    } catch (_) { }

    const descLower = desc.toLowerCase();
    let category = 'Others';
    let merchant = '';

    if (descLower.includes('netflix') || descLower.includes('spotify') || descLower.includes('icloud') || descLower.includes('prime') || descLower.includes('youtube')) {
      category = 'Entertainment';
      if (descLower.includes('netflix')) { merchant = 'Netflix'; subscriptions.push({ name: 'Netflix', amount: Math.abs(amount) || 999, frequency: 'Monthly' }); }
      else if (descLower.includes('spotify')) { merchant = 'Spotify'; subscriptions.push({ name: 'Spotify', amount: Math.abs(amount) || 499, frequency: 'Monthly' }); }
      else if (descLower.includes('icloud')) { merchant = 'iCloud'; subscriptions.push({ name: 'iCloud', amount: Math.abs(amount) || 249, frequency: 'Monthly' }); }
      else if (descLower.includes('prime')) { merchant = 'Amazon Prime'; subscriptions.push({ name: 'Amazon Prime', amount: Math.abs(amount) || 1499, frequency: 'Yearly' }); }
    } else if (descLower.includes('zomato') || descLower.includes('swiggy') || descLower.includes('starbucks') || descLower.includes('restaurant') || descLower.includes('cafe') || descLower.includes('hotel')) {
      category = 'Food & Dining';
      merchant = descLower.includes('zomato') ? 'Zomato' : descLower.includes('swiggy') ? 'Swiggy' : descLower.includes('starbucks') ? 'Starbucks' : '';
    } else if (descLower.includes('amazon') || descLower.includes('flipkart') || descLower.includes('shopping') || descLower.includes('zara') || descLower.includes('myntra') || descLower.includes('mart') || descLower.includes('store')) {
      category = 'Shopping';
      merchant = descLower.includes('amazon') ? 'Amazon' : descLower.includes('flipkart') ? 'Flipkart' : '';
    } else if (descLower.includes('electricity') || descLower.includes('water') || descLower.includes('bescom') || descLower.includes('recharge') || descLower.includes('airtel') || descLower.includes('jio') || descLower.includes('gas') || descLower.includes('bill')) {
      category = 'Bills & Utilities';
      merchant = descLower.includes('airtel') ? 'Airtel' : descLower.includes('jio') ? 'Jio' : '';
    } else if (descLower.includes('uber') || descLower.includes('ola') || descLower.includes('metro') || descLower.includes('cab') || descLower.includes('petrol') || descLower.includes('fuel') || descLower.includes('train')) {
      category = 'Transport';
      merchant = descLower.includes('uber') ? 'Uber' : descLower.includes('ola') ? 'Ola' : '';
    } else if (descLower.includes('salary') || descLower.includes('payroll') || descLower.includes('credit interest') || descLower.includes('direct deposit')) {
      category = 'Salary';
    } else if (descLower.includes('groww') || descLower.includes('zerodha') || descLower.includes('dividend') || descLower.includes('stock') || descLower.includes('mutual fund') || descLower.includes('etf')) {
      category = 'Investments';
    }

    if (amount > 0) {
      totalCredits += amount;
    } else {
      const debitVal = Math.abs(amount);
      totalDebits += debitVal;

      if (debitVal > 15000) {
        unusualSpending.push({
          description: desc,
          amount: debitVal,
          reason: 'High transaction amount'
        });
      }
    }

    transactions.push({
      date: formattedDate,
      description: desc,
      amount,
      category,
      merchant
    });
  }

  return {
    transactions,
    totalCredits,
    totalDebits,
    subscriptions: subscriptions.filter((s, index, self) => self.findIndex(t => t.name === s.name) === index),
    unusualSpending
  };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileType, fileContent } = await req.json();
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      if (fileType === 'pdf') {
        return NextResponse.json({
          error: 'PDF statement analysis requires a Google Gemini API Key. Please add GEMINI_API_KEY in .env.local to proceed. Locally, you can only analyze CSV or Excel files.'
        }, { status: 400 });
      }

      // Run local rule-based parsing
      let parsedRows: any[] = [];
      try {
        parsedRows = JSON.parse(fileContent);
      } catch (e) {
        return NextResponse.json({ error: 'Invalid row data sent to server' }, { status: 400 });
      }

      const results = localAnalyze(parsedRows);
      return NextResponse.json({ results, info: 'Processed locally (no API key configured).' });
    }

    // Prepare system instructions for Gemini
    const systemPrompt = `You are DivyaDhan AI, a premium financial statement analyzer.
Your task is to parse the provided bank statement and return a structured JSON response.
You must return ONLY a valid JSON object matching this schema:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "Cleaned transaction description",
      "amount": -1250.00, // Negative for debit/expense, positive for credit/income
      "category": "Food & Dining", // Categorize into: Food & Dining, Shopping, Bills & Utilities, Transport, Entertainment, Investments, Salary, Others
      "merchant": "Swiggy" // Estimated merchant name, or empty string
    }
  ],
  "totalCredits": 185000, // Sum of all income/credits
  "totalDebits": 112500, // Sum of all expenses/debits (as a positive number)
  "subscriptions": [
    {
      "name": "Netflix",
      "amount": 999,
      "frequency": "Monthly" // Monthly, Yearly, Weekly
    }
  ],
  "unusualSpending": [
    {
      "description": "Electronics purchase",
      "amount": 45000,
      "reason": "Large one-off transaction relative to typical patterns"
    }
  ]
}

Ensure all dates are formatted as YYYY-MM-DD.
Only return the raw JSON object, without markdown code block syntax (do NOT enclose in \`\`\`json).`;

    let contents: any[];

    if (fileType === 'pdf') {
      contents = [
        { text: systemPrompt },
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: fileContent // base64 representation of PDF
          }
        }
      ];
    } else {
      // CSV/Excel text payload
      contents = [
        { text: `${systemPrompt}\n\nHere is the transaction spreadsheet contents as a JSON list of rows:\n${fileContent}` }
      ];
    }

    // Call Gemini API via SDK
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: contents,
      });
    } catch (primaryError: any) {
      console.warn('Primary model gemini-3.5-flash failed, trying fallback gemini-2.5-flash...', primaryError);
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents,
        });
      } catch (fallbackError: any) {
        console.warn('Fallback model gemini-2.5-flash failed, trying second fallback gemini-3.1-flash-lite...', fallbackError);
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: contents,
        });
      }
    }

    let responseText = response.text || '';

    // Clean markdown formats if Gemini wrapped it in codes
    if (responseText.includes('```json')) {
      responseText = responseText.split('```json')[1].split('```')[0].trim();
    } else if (responseText.includes('```')) {
      responseText = responseText.split('```')[1].split('```')[0].trim();
    }

    try {
      const results = JSON.parse(responseText.trim());
      return NextResponse.json({ results });
    } catch (parseErr) {
      console.error('Failed to parse Gemini response as JSON. Response was:', responseText);
      return NextResponse.json({
        error: 'Failed to extract structured data. AI did not return a valid JSON structure.',
        rawText: responseText
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Statement analyzer error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process statement' }, { status: 500 });
  }
}
