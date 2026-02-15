import { useState, useCallback } from 'react';

const STORAGE_KEY = 'visacheck-favorites';

function loadFavorites(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites);

  const toggle = useCallback((code: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isFavorite = useCallback((code: string) => favorites.has(code), [favorites]);

  return { favorites, toggle, isFavorite, count: favorites.size };
}
