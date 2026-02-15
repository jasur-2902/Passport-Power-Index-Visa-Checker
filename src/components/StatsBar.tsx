import { useMemo } from 'react';
import { Search, Heart, X } from 'lucide-react';
import { type VisaCategory, type GroupResult, allCategories } from '../data/visaUtils';
import { regions } from '../data/countries';
import type { SortOption } from '../App';

const VISA_TOOLTIPS: Record<string, string> = {
  'accessible': 'Countries you can enter without a traditional visa',
  'visa-free': 'No visa needed, just show your passport',
  'eta': 'Electronic Travel Authorization — apply online before travel',
  'e-visa': 'Electronic visa — apply online, usually approved in days',
  'visa-on-arrival': 'Get your visa stamp at the airport on arrival',
  'visa-required': 'Must apply at an embassy/consulate before travel',
};

interface Props {
  results: GroupResult[];
  activeFilter: VisaCategory | 'accessible' | 'all' | 'favorites';
  onFilterChange: (filter: VisaCategory | 'accessible' | 'all' | 'favorites') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  regionFilter: string;
  onRegionChange: (r: string) => void;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  favCount: number;
}

export default function StatsBar({
  results,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  regionFilter,
  onRegionChange,
  sortBy,
  onSortChange,
  favCount,
}: Props) {
  const stats = useMemo(() => {
    const counts: Record<string, number> = { accessible: 0, all: results.length };
    allCategories.forEach(cat => { counts[cat] = 0; });
    results.forEach(r => {
      counts[r.category] = (counts[r.category] || 0) + 1;
      if (['visa-free', 'eta', 'e-visa', 'visa-on-arrival'].includes(r.category)) {
        counts.accessible++;
      }
    });
    return counts;
  }, [results]);

  const filterButtons: { key: string; label: string; dotColor?: string }[] = [
    { key: 'accessible', label: 'Accessible' },
    { key: 'visa-free', label: 'Visa Free', dotColor: 'bg-emerald-400' },
    { key: 'eta', label: 'ETA', dotColor: 'bg-violet-400' },
    { key: 'e-visa', label: 'e-Visa', dotColor: 'bg-blue-400' },
    { key: 'visa-on-arrival', label: 'On Arrival', dotColor: 'bg-amber-400' },
    { key: 'visa-required', label: 'Visa Req.', dotColor: 'bg-red-400' },
    { key: 'all', label: 'All' },
  ];

  return (
    <div className="mb-6 space-y-3" role="region" aria-label="Filter and search results">
      {/* Filter pills with horizontal scroll on mobile */}
      <div
        className="flex gap-1.5 filter-pills-scroll sm:flex-wrap"
        role="tablist"
        aria-label="Filter by visa type"
      >
        {filterButtons.map(btn => {
          const isActive = activeFilter === btn.key;
          const count = stats[btn.key] ?? 0;
          const tooltip = VISA_TOOLTIPS[btn.key];
          return (
            <div key={btn.key} className={`flex-shrink-0 ${tooltip ? 'tooltip-container' : ''}`}>
              <button
                role="tab"
                aria-selected={isActive}
                onClick={() => onFilterChange(btn.key as typeof activeFilter)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all press-effect ${
                  isActive
                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {btn.dotColor && (
                  <span className={`w-2 h-2 rounded-full ${btn.dotColor} ${isActive ? 'opacity-80' : ''}`} />
                )}
                {btn.label}
                <span className={`tabular-nums ${isActive ? 'text-white/70 dark:text-slate-900/60' : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
              {tooltip && <span className="tooltip-text">{tooltip}</span>}
            </div>
          );
        })}

        {/* Favorites */}
        <button
          role="tab"
          aria-selected={activeFilter === 'favorites'}
          onClick={() => onFilterChange('favorites')}
          className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all press-effect ${
            activeFilter === 'favorites'
              ? 'bg-pink-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-pink-200 dark:hover:border-pink-500/30 hover:bg-pink-50 dark:hover:bg-pink-500/10'
          }`}
        >
          <Heart className={`w-3 h-3 ${activeFilter === 'favorites' ? 'fill-current' : ''}`} />
          Saved
          <span className={`tabular-nums ${activeFilter === 'favorites' ? 'text-white/70' : 'text-slate-400'}`}>
            {favCount}
          </span>
        </button>
      </div>

      {/* Search and controls */}
      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search destinations..."
            aria-label="Search destinations"
            className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-500 dark:text-slate-300 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          aria-label="Sort results"
          className="px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222.5%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8"
        >
          <option value="name">A → Z</option>
          <option value="days-desc">Stay Duration</option>
          <option value="category">Access Level</option>
          <option value="region">Region</option>
        </select>

        <select
          value={regionFilter}
          onChange={(e) => onRegionChange(e.target.value)}
          aria-label="Filter by region"
          className="px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20 transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222.5%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8"
        >
          <option value="all">All Regions</option>
          {regions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
