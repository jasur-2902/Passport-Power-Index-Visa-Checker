import { useEffect, useCallback } from 'react';
import type { Traveler } from '../App';

export function encodeShareUrl(travelers: Traveler[]): string {
  const params = new URLSearchParams();
  travelers.forEach((t, i) => {
    if (t.passports.length > 0) {
      // Format: Name:PASSPORT1,PASSPORT2;visa1,visa2
      let val = `${t.name}:${t.passports.join(',')}`;
      if (t.visaHoldings.length > 0) {
        val += `;${t.visaHoldings.join(',')}`;
      }
      params.set(`t${i}`, val);
    }
  });
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

export function decodeShareUrl(): Traveler[] | null {
  const params = new URLSearchParams(window.location.search);
  const travelers: Traveler[] = [];
  let i = 0;
  while (params.has(`t${i}`)) {
    const val = params.get(`t${i}`)!;
    const [name, rest] = val.split(':');
    if (name && rest) {
      // rest format: PASSPORT1,PASSPORT2;visa1,visa2
      const [passportsStr, visasStr] = rest.split(';');
      travelers.push({
        id: String(i + 1),
        name,
        passports: passportsStr.split(',').filter(Boolean),
        visaHoldings: visasStr ? visasStr.split(',').filter(Boolean) : [],
      });
    }
    i++;
  }
  return travelers.length > 0 ? travelers : null;
}

export function useShareUrl(travelers: Traveler[], setTravelers: (t: Traveler[]) => void) {
  // Load from URL on mount
  useEffect(() => {
    const fromUrl = decodeShareUrl();
    if (fromUrl) {
      setTravelers(fromUrl);
      // Clean URL without reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [setTravelers]);

  const share = useCallback(async () => {
    const url = encodeShareUrl(travelers);
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  }, [travelers]);

  return { share };
}
