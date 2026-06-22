'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDashboardData } from '@/actions/dashboard';

interface DataContextType {
  loading: boolean;
  incomes: any[];
  expenses: any[];
  accounts: any[];
  investments: any[];
  lendings: any[];
  borrowings: any[];
  goals: any[];
  notes: any[];
  subscriptions: any[];
  user: any;
  refetch: (showLoader?: boolean) => Promise<void>;
  updateData: (updater: (prev: any) => any) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    incomes: [],
    expenses: [],
    accounts: [],
    investments: [],
    lendings: [],
    borrowings: [],
    goals: [],
    notes: [],
    subscriptions: [],
    user: null,
  });

  const refetch = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }
    try {
      const res = await getDashboardData();
      if (res && 'success' in res && res.success) {
        setData({
          incomes: res.incomes || [],
          expenses: res.expenses || [],
          accounts: res.accounts || [],
          investments: res.investments || [],
          lendings: res.lendings || [],
          borrowings: res.borrowings || [],
          goals: res.goals || [],
          notes: res.notes || [],
          subscriptions: res.subscriptions || [],
          user: res.user || null,
        });
      }
    } catch (err) {
      console.error('Error fetching context data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch(true);
  }, [refetch]);

  const updateData = useCallback((updater: (prev: any) => any) => {
    setData((prev: any) => updater(prev));
  }, []);

  return (
    <DataContext.Provider
      value={{
        loading,
        ...data,
        refetch,
        updateData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
