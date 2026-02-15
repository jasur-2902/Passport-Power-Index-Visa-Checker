import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Search, UserPlus, ShieldCheck } from 'lucide-react';
import { countries, countryByCode } from '../data/countries';
import {
  visaHoldingTypes,
  visaHoldingTypeMap,
  type VisaHoldingCategory,
} from '../data/visaBenefits';
import type { Traveler } from '../App';

const POPULAR_PASSPORTS = [
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'JP', label: 'Japan' },
  { code: 'KR', label: 'South Korea' },
  { code: 'IN', label: 'India' },
  { code: 'CN', label: 'China' },
  { code: 'BR', label: 'Brazil' },
  { code: 'UZ', label: 'Uzbekistan' },
];

const CATEGORY_LABELS: Record<VisaHoldingCategory, string> = {
  residency: 'Residencies',
  long_term_visa: 'Long-term Visas',
  short_term_visa: 'Short-term Visas',
  special_permit: 'Special Permits',
};

const CATEGORY_ORDER: VisaHoldingCategory[] = ['residency', 'long_term_visa', 'short_term_visa', 'special_permit'];

interface Props {
  travelers: Traveler[];
  onAddTraveler: () => void;
  onRemoveTraveler: (id: string) => void;
  onUpdateTraveler: (id: string, updates: Partial<Traveler>) => void;
  perTravelerVisaBenefitCounts: Record<string, Record<string, number>>;
}

export default function PassportSelector({
  travelers, onAddTraveler, onRemoveTraveler, onUpdateTraveler,
  perTravelerVisaBenefitCounts,
}: Props) {
  return (
    <div className="space-y-3" role="region" aria-label="Passport selection">
      {travelers.map((traveler, index) => (
        <TravelerCard
          key={traveler.id}
          traveler={traveler}
          index={index}
          canRemove={travelers.length > 1}
          onRemove={() => onRemoveTraveler(traveler.id)}
          onUpdate={(updates) => onUpdateTraveler(traveler.id, updates)}
          visaBenefitCounts={perTravelerVisaBenefitCounts[traveler.id] ?? {}}
        />
      ))}

      <button
        onClick={onAddTraveler}
        className="w-full py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 dark:text-slate-500 hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2.5 text-sm font-medium press-effect"
        aria-label="Add another traveler"
      >
        <UserPlus className="w-4 h-4" />
        Add Travel Companion
      </button>
    </div>
  );
}

const TRAVELER_COLORS = [
  { gradient: 'from-blue-500 to-indigo-500', ring: 'ring-blue-200' },
  { gradient: 'from-rose-500 to-pink-500', ring: 'ring-rose-200' },
  { gradient: 'from-amber-500 to-orange-500', ring: 'ring-amber-200' },
  { gradient: 'from-emerald-500 to-teal-500', ring: 'ring-emerald-200' },
];

/** Hook to track trigger button position for anchored dropdown */
function useAnchorPosition(isOpen: boolean) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) { setPos(null); return; }
    const update = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left, width: Math.max(320, rect.width) });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen]);

  return { triggerRef, pos };
}

const SM_BREAKPOINT = 640;
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < SM_BREAKPOINT);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < SM_BREAKPOINT);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

function TravelerCard({
  traveler,
  index,
  canRemove,
  onRemove,
  onUpdate,
  visaBenefitCounts,
}: {
  traveler: Traveler;
  index: number;
  canRemove: boolean;
  onRemove: () => void;
  onUpdate: (updates: Partial<Traveler>) => void;
  visaBenefitCounts: Record<string, number>;
}) {
  // Passport search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dropdownPanelRef = useRef<HTMLDivElement>(null);

  const { triggerRef: passportTriggerRef, pos: passportPos } = useAnchorPosition(isSearchOpen);
  const isMobile = useIsMobile();

  const filteredCountries = countries.filter(c =>
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
     c.code.toLowerCase().includes(search.toLowerCase())) &&
    !traveler.passports.includes(c.code)
  );

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearch('');
    setHighlightIndex(0);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchRef.current) searchRef.current.focus();
  }, [isSearchOpen]);

  // Close on outside click (for portal)
  useEffect(() => {
    if (!isSearchOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownPanelRef.current && !dropdownPanelRef.current.contains(e.target as Node)) {
        closeSearch();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isSearchOpen, closeSearch]);

  const addPassport = useCallback((code: string) => {
    onUpdate({ passports: [...traveler.passports, code] });
    closeSearch();
  }, [traveler.passports, onUpdate, closeSearch]);

  const removePassport = useCallback((code: string) => {
    onUpdate({ passports: traveler.passports.filter(p => p !== code) });
  }, [traveler.passports, onUpdate]);

  const addVisa = useCallback((typeId: string) => {
    if (!traveler.visaHoldings.includes(typeId)) {
      onUpdate({ visaHoldings: [...traveler.visaHoldings, typeId] });
    }
  }, [traveler.visaHoldings, onUpdate]);

  const removeVisa = useCallback((typeId: string) => {
    onUpdate({ visaHoldings: traveler.visaHoldings.filter(id => id !== typeId) });
  }, [traveler.visaHoldings, onUpdate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { closeSearch(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(highlightIndex + 1, Math.min(filteredCountries.length - 1, 49));
      setHighlightIndex(next);
      scrollTo(listRef, next);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.max(highlightIndex - 1, 0);
      setHighlightIndex(next);
      scrollTo(listRef, next);
    }
    if (e.key === 'Enter' && filteredCountries.length > 0) {
      e.preventDefault();
      addPassport(filteredCountries[highlightIndex].code);
    }
  };

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>, idx: number) => {
    if (ref.current) {
      const item = ref.current.children[idx] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  };

  const { gradient } = TRAVELER_COLORS[index % TRAVELER_COLORS.length];
  const isEmpty = traveler.passports.length === 0;

  // Compute anchored position for desktop dropdown
  const passportDropdownStyle = (!isMobile && passportPos) ? (() => {
    const maxW = 360;
    const left = Math.min(passportPos.left, window.innerWidth - maxW - 16);
    const maxH = window.innerHeight - passportPos.top - 16;
    return { top: passportPos.top, left: Math.max(8, left), width: maxW, maxHeight: Math.min(maxH, 400) } as React.CSSProperties;
  })() : undefined;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 animate-fade-in-scale relative">
      {/* Colored header bar */}
      <div className={`bg-gradient-to-r ${gradient} px-4 sm:px-5 py-3 flex items-center justify-between rounded-t-2xl`}>
        <label className="sr-only" htmlFor={`traveler-name-${traveler.id}`}>
          Traveler name
        </label>
        <input
          id={`traveler-name-${traveler.id}`}
          type="text"
          value={traveler.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="bg-transparent text-white font-semibold placeholder-white/60 outline-none text-sm w-44 sm:w-56"
          placeholder="Enter name..."
        />
        {canRemove && (
          <button
            onClick={onRemove}
            aria-label={`Remove ${traveler.name}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/15 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Passport pills area */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {traveler.passports.map(code => {
            const country = countryByCode[code];
            if (!country) return null;
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full pl-2.5 pr-1.5 py-1.5 text-sm animate-pill-in hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group"
              >
                <span className="text-base leading-none" role="img" aria-label={country.name}>
                  {country.flag}
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-red-600 transition-colors">
                  {country.name}
                </span>
                <button
                  onClick={() => removePassport(code)}
                  aria-label={`Remove ${country.name} passport`}
                  className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all ml-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            );
          })}

          {/* Add passport trigger */}
          <button
            ref={passportTriggerRef}
            onClick={() => setIsSearchOpen(true)}
            aria-label={isEmpty ? 'Select a passport' : 'Add another passport'}
            aria-haspopup="listbox"
            className={`inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full px-3.5 py-2 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors press-effect ${isSearchOpen ? 'ring-2 ring-blue-300 dark:ring-blue-500' : ''}`}
          >
            <Plus className="w-4 h-4" />
            {isEmpty ? 'Select Passport' : 'Add'}
          </button>

          {/* Passport search dropdown (portal) */}
          {isSearchOpen && createPortal(
            <>
              {/* Backdrop: visible on mobile, transparent on desktop */}
              <div className="fixed inset-0 z-[99] bg-black/30 sm:bg-transparent" onClick={closeSearch} />
              <div
                ref={dropdownPanelRef}
                role="combobox"
                aria-expanded="true"
                className={`fixed z-[100] bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-scale flex flex-col ${
                  isMobile
                    ? 'inset-x-0 bottom-0 rounded-t-xl max-h-[75vh]'
                    : 'rounded-xl'
                }`}
                style={passportDropdownStyle}
              >
                {/* Drag handle for mobile */}
                {isMobile && (
                  <div className="flex justify-center pt-2 pb-1">
                    <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  </div>
                )}
                <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-700">
                  <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setHighlightIndex(0); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search countries..."
                    className="flex-1 outline-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 min-w-0 bg-transparent"
                    role="searchbox"
                    aria-label="Search countries"
                  />
                  <button
                    onClick={closeSearch}
                    aria-label="Close search"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div ref={listRef} role="listbox" className="flex-1 overflow-y-auto overscroll-contain">
                  {filteredCountries.slice(0, 50).map((country, i) => (
                    <button
                      key={country.code}
                      role="option"
                      aria-selected={i === highlightIndex}
                      onClick={() => addPassport(country.code)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors ${
                        i === highlightIndex ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span className="text-lg leading-none" role="img" aria-hidden="true">{country.flag}</span>
                      <span className="text-sm flex-1 min-w-0 truncate">{country.name}</span>
                      <span className="text-xs text-slate-400 font-mono">{country.code}</span>
                    </button>
                  ))}
                  {filteredCountries.length === 0 && (
                    <div className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500 text-center">
                      No countries match &ldquo;{search}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            </>,
            document.body
          )}
        </div>

        {/* Popular passports for empty state */}
        {isEmpty && !isSearchOpen && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Popular:</p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_PASSPORTS.filter(p => !traveler.passports.includes(p.code)).map(p => {
                const c = countryByCode[p.code];
                return (
                  <button
                    key={p.code}
                    onClick={() => addPassport(p.code)}
                    aria-label={`Select ${p.label} passport`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30 transition-all press-effect"
                  >
                    <span role="img" aria-hidden="true">{c?.flag}</span>
                    <span>{p.code}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Per-traveler Visa & Residency section */}
        {!isEmpty && (
          <VisaSection
            visaHoldings={traveler.visaHoldings}
            onAddVisa={addVisa}
            onRemoveVisa={removeVisa}
            visaBenefitCounts={visaBenefitCounts}
          />
        )}
      </div>
    </div>
  );
}

function VisaSection({
  visaHoldings,
  onAddVisa,
  onRemoveVisa,
  visaBenefitCounts,
}: {
  visaHoldings: string[];
  onAddVisa: (typeId: string) => void;
  onRemoveVisa: (typeId: string) => void;
  visaBenefitCounts: Record<string, number>;
}) {
  const [isVisaSearchOpen, setIsVisaSearchOpen] = useState(false);
  const [visaSearch, setVisaSearch] = useState('');
  const [visaHighlight, setVisaHighlight] = useState(0);
  const visaSearchRef = useRef<HTMLInputElement>(null);
  const visaListRef = useRef<HTMLDivElement>(null);
  const visaPanelRef = useRef<HTMLDivElement>(null);

  const { triggerRef: visaTriggerRef, pos: visaPos } = useAnchorPosition(isVisaSearchOpen);
  const isMobile = useIsMobile();

  const heldVisaIds = new Set(visaHoldings);
  const filteredVisas = visaHoldingTypes.filter(t =>
    !heldVisaIds.has(t.id) &&
    (t.name.toLowerCase().includes(visaSearch.toLowerCase()) ||
     t.shortName.toLowerCase().includes(visaSearch.toLowerCase()))
  );

  const closeVisaSearch = useCallback(() => {
    setIsVisaSearchOpen(false);
    setVisaSearch('');
    setVisaHighlight(0);
  }, []);

  useEffect(() => {
    if (isVisaSearchOpen && visaSearchRef.current) visaSearchRef.current.focus();
  }, [isVisaSearchOpen]);

  useEffect(() => {
    if (!isVisaSearchOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (visaPanelRef.current && !visaPanelRef.current.contains(e.target as Node)) {
        closeVisaSearch();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isVisaSearchOpen, closeVisaSearch]);

  const addVisa = useCallback((id: string) => {
    onAddVisa(id);
    closeVisaSearch();
  }, [onAddVisa, closeVisaSearch]);

  const handleVisaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { closeVisaSearch(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(visaHighlight + 1, filteredVisas.length - 1);
      setVisaHighlight(next);
      scrollTo(visaListRef, next);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.max(visaHighlight - 1, 0);
      setVisaHighlight(next);
      scrollTo(visaListRef, next);
    }
    if (e.key === 'Enter' && filteredVisas.length > 0) {
      e.preventDefault();
      addVisa(filteredVisas[visaHighlight].id);
    }
  };

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>, idx: number) => {
    if (ref.current) {
      const item = ref.current.children[idx] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  };

  const groupedVisas = CATEGORY_ORDER.map(cat => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: filteredVisas.filter(t => t.category === cat),
  })).filter(g => g.items.length > 0);

  // Compute anchored position for desktop dropdown
  const visaDropdownStyle = (!isMobile && visaPos) ? (() => {
    const maxW = 380;
    const left = Math.min(visaPos.left, window.innerWidth - maxW - 16);
    const maxH = window.innerHeight - visaPos.top - 16;
    return { top: visaPos.top, left: Math.max(8, left), width: maxW, maxHeight: Math.min(maxH, 420) } as React.CSSProperties;
  })() : undefined;

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-1.5 mb-2">
        <ShieldCheck className="w-3 h-3 text-emerald-500" />
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Visas & Residencies
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {visaHoldings.map(typeId => {
          const type = visaHoldingTypeMap.get(typeId);
          if (!type) return null;
          const newCount = visaBenefitCounts[typeId] ?? 0;
          return (
            <span
              key={typeId}
              className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-full pl-2.5 pr-1.5 py-1.5 text-sm animate-pill-in hover:border-red-200 dark:hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group"
            >
              <span className="text-base leading-none">{type.icon}</span>
              <span className="font-medium text-emerald-700 dark:text-emerald-400 group-hover:text-red-600 transition-colors">
                {type.shortName}
              </span>
              {newCount > 0 && (
                <span className="text-[10px] font-bold bg-emerald-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                  +{newCount}
                </span>
              )}
              <button
                onClick={() => onRemoveVisa(typeId)}
                aria-label={`Remove ${type.shortName}`}
                className="w-6 h-6 flex items-center justify-center rounded-full text-emerald-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all ml-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          );
        })}

        <button
          ref={visaTriggerRef}
          onClick={() => setIsVisaSearchOpen(true)}
          aria-label="Add a visa or residency"
          aria-haspopup="listbox"
          className={`inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full px-3.5 py-2 text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors press-effect ${isVisaSearchOpen ? 'ring-2 ring-emerald-300 dark:ring-emerald-500' : ''}`}
        >
          <Plus className="w-4 h-4" />
          {visaHoldings.length === 0 ? 'Add Visa / Residency' : 'Add'}
        </button>

        {/* Visa search dropdown (portal) */}
        {isVisaSearchOpen && createPortal(
          <>
            <div className="fixed inset-0 z-[99] bg-black/30 sm:bg-transparent" onClick={closeVisaSearch} />
            <div
              ref={visaPanelRef}
              role="combobox"
              aria-expanded="true"
              className={`fixed z-[100] bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-scale flex flex-col ${
                isMobile
                  ? 'inset-x-0 bottom-0 rounded-t-xl max-h-[75vh]'
                  : 'rounded-xl'
              }`}
              style={visaDropdownStyle}
            >
              {isMobile && (
                <div className="flex justify-center pt-2 pb-1">
                  <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                </div>
              )}
              <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-700">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  ref={visaSearchRef}
                  type="text"
                  value={visaSearch}
                  onChange={(e) => { setVisaSearch(e.target.value); setVisaHighlight(0); }}
                  onKeyDown={handleVisaKeyDown}
                  placeholder="Search visas & residencies..."
                  className="flex-1 outline-none text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 min-w-0 bg-transparent"
                  role="searchbox"
                  aria-label="Search visa types"
                />
                <button
                  onClick={closeVisaSearch}
                  aria-label="Close"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div ref={visaListRef} className="flex-1 overflow-y-auto overscroll-contain" role="listbox">
                {visaSearch ? (
                  filteredVisas.map((type, i) => (
                    <button
                      key={type.id}
                      role="option"
                      aria-selected={i === visaHighlight}
                      onClick={() => addVisa(type.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors ${
                        i === visaHighlight ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span className="text-lg leading-none flex-shrink-0">{type.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{type.name}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{type.description}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  groupedVisas.map(group => (
                    <div key={group.category}>
                      <div className="px-3.5 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-700/80 sticky top-0">
                        {group.label}
                      </div>
                      {group.items.map(type => {
                        const flatIdx = filteredVisas.indexOf(type);
                        return (
                          <button
                            key={type.id}
                            role="option"
                            aria-selected={flatIdx === visaHighlight}
                            onClick={() => addVisa(type.id)}
                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors ${
                              flatIdx === visaHighlight ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <span className="text-lg leading-none flex-shrink-0">{type.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{type.name}</div>
                              <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{type.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
                {filteredVisas.length === 0 && (
                  <div className="px-4 py-6 text-sm text-slate-400 dark:text-slate-500 text-center">
                    No visa types match &ldquo;{visaSearch}&rdquo;
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
      </div>

      {visaHoldings.length === 0 && !isVisaSearchOpen && (
        <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          Have a valid visa or residency? Add it to discover extra destinations.
        </p>
      )}
    </div>
  );
}
