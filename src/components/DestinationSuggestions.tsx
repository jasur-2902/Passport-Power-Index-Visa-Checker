import { useMemo } from 'react';
import { Sparkles, Clock, Gem, TrendingUp } from 'lucide-react';
import { countryByCode } from '../data/countries';
import type { GroupResult } from '../data/visaUtils';
import type { AccessSource } from '../data/visaBenefits';

type EnhancedGroupResult = GroupResult & {
  source: AccessSource;
  visaHoldingId?: string;
  conditions?: string[];
};

interface Props {
  results: EnhancedGroupResult[];
  favorites: Set<string>;
  onSelectDestination: (code: string) => void;
}

const POPULAR_DESTINATIONS = ['TH', 'JP', 'FR', 'ES', 'IT', 'TR', 'AE', 'SG', 'GB', 'US', 'MY', 'GR', 'PT', 'KR', 'MX'];

export default function DestinationSuggestions({ results, favorites, onSelectDestination }: Props) {
  const visaFreeResults = useMemo(
    () => results.filter(r => r.category === 'visa-free' && r.source === 'passport'),
    [results],
  );

  const longestStays = useMemo(
    () => [...visaFreeResults]
      .filter(r => r.days != null && r.days > 0)
      .sort((a, b) => (b.days ?? 0) - (a.days ?? 0))
      .slice(0, 5),
    [visaFreeResults],
  );

  const easyGems = useMemo(() => {
    const favRegions = new Set<string>();
    favorites.forEach(code => {
      const c = countryByCode[code];
      if (c) favRegions.add(c.region);
    });
    return visaFreeResults
      .filter(r => {
        const c = countryByCode[r.destination];
        return c && (favRegions.size === 0 || !favRegions.has(c.region));
      })
      .sort((a, b) => (b.days ?? 0) - (a.days ?? 0))
      .slice(0, 5);
  }, [visaFreeResults, favorites]);

  const popularPicks = useMemo(
    () => POPULAR_DESTINATIONS
      .filter(code => visaFreeResults.some(r => r.destination === code))
      .map(code => visaFreeResults.find(r => r.destination === code)!)
      .slice(0, 5),
    [visaFreeResults],
  );

  if (visaFreeResults.length === 0) return null;

  const sections = [
    { title: 'Longest stays', icon: Clock, items: longestStays },
    { title: 'Easy access gems', icon: Gem, items: easyGems },
    { title: 'Popular picks', icon: TrendingUp, items: popularPicks },
  ].filter(s => s.items.length > 0);

  if (sections.length === 0) return null;

  return (
    <div className="mb-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Suggested for you</h2>
      </div>

      <div className="space-y-4">
        {sections.map(({ title, icon: Icon, items }) => (
          <div key={title}>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</span>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
              {items.map(result => {
                const country = countryByCode[result.destination];
                if (!country) return null;
                return (
                  <button
                    key={result.destination}
                    onClick={() => onSelectDestination(result.destination)}
                    className="flex-shrink-0 flex items-center gap-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-sm transition-all group"
                  >
                    <span className="text-xl">{country.flag}</span>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors whitespace-nowrap">
                        {country.name}
                      </p>
                      {result.days != null && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">{result.days} days</p>
                      )}
                    </div>
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-200 dark:border-emerald-500/30">
                      Free
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
