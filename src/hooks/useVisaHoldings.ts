import { useState, useCallback } from 'react';
import type { VisaHolding } from '../data/visaBenefits';

const STORAGE_KEY = 'visacheck-visa-holdings';

function loadHoldings(): VisaHolding[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useVisaHoldings() {
  const [holdings, setHoldings] = useState<VisaHolding[]>(loadHoldings);

  const add = useCallback((typeId: string) => {
    setHoldings(prev => {
      if (prev.some(h => h.typeId === typeId)) return prev;
      const next = [...prev, { typeId }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((typeId: string) => {
    setHoldings(prev => {
      const next = prev.filter(h => h.typeId !== typeId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const has = useCallback((typeId: string) => {
    return holdings.some(h => h.typeId === typeId);
  }, [holdings]);

  return { holdings, add, remove, has };
}
