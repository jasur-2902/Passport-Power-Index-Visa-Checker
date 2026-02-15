import { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { countryByCode } from './data/countries';
import { getGroupResults, type VisaCategory, type GroupResult } from './data/visaUtils';
import { getVisaBenefitResults, getVisaBenefitSummary, type AccessSource } from './data/visaBenefits';
import { useFavorites } from './hooks/useFavorites';
import { useShareUrl } from './hooks/useShareUrl';
import PassportSelector from './components/PassportSelector';
import ResultsView from './components/ResultsView';
import StatsBar from './components/StatsBar';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import PassportCompare from './components/PassportCompare';
import WelcomeBanner from './components/WelcomeBanner';
import DestinationSuggestions from './components/DestinationSuggestions';
import ExportButton from './components/ExportButton';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import DestinationModal from './components/DestinationModal';
import './index.css';

export interface Traveler {
  id: string;
  name: string;
  passports: string[];
  visaHoldings: string[];
}

export type SortOption = 'name' | 'days-desc' | 'category' | 'region';

function App() {
  const [travelers, setTravelers] = useState<Traveler[]>([
    { id: '1', name: 'Traveler 1', passports: [], visaHoldings: [] },
  ]);
  const [activeFilter, setActiveFilter] = useState<VisaCategory | 'accessible' | 'all' | 'favorites'>('accessible');
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');

  const { favorites, toggle: toggleFavorite, isFavorite, count: favCount } = useFavorites();
  const { share } = useShareUrl(travelers, setTravelers);

  const handleShare = useCallback(async () => {
    const ok = await share();
    if (ok) {
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2500);
    }
  }, [share]);

  const allPassportCodes = useMemo(() => {
    const codes = new Set<string>();
    travelers.forEach(t => t.passports.forEach(p => codes.add(p)));
    return [...codes];
  }, [travelers]);

  // Compute merged results and per-traveler visa benefit counts in one pass
  const { mergedResults, perTravelerVisaBenefitCounts } = useMemo(() => {
    const activeTravelers = travelers.filter(t => t.passports.length > 0);
    if (activeTravelers.length === 0) {
      return { mergedResults: [] as (GroupResult & { source: AccessSource; visaHoldingId?: string; conditions?: string[] })[], perTravelerVisaBenefitCounts: {} as Record<string, Record<string, number>> };
    }

    type MergedResult = GroupResult & { source: AccessSource; visaHoldingId?: string; conditions?: string[] };
    type AccessEntry = { category: VisaCategory; days?: number; source: AccessSource; visaHoldingId?: string; conditions?: string[] };

    // Per-traveler: compute passport results + visa benefits + full access map
    const travelerAccess = activeTravelers.map(traveler => {
      // Get passport-based results
      const passportResults = getGroupResults(traveler.passports);

      // Deduplicate passport results (best per destination)
      const passportMap = new Map<string, { category: VisaCategory; days?: number }>();
      passportResults.forEach(r => {
        const existing = passportMap.get(r.destination);
        if (!existing || catPri(r.category) < catPri(existing.category)) {
          passportMap.set(r.destination, { category: r.category, days: r.days });
        }
      });

      // Get visa benefit results for this traveler's holdings
      const holdings = traveler.visaHoldings.map(id => ({ typeId: id }));
      const visaBenefits = holdings.length > 0
        ? getVisaBenefitResults(holdings, passportMap)
        : [];

      const visaBenefitCounts = holdings.length > 0
        ? getVisaBenefitSummary(holdings, passportMap)
        : {};

      // Build full access map: passport results + visa benefits
      const fullAccess = new Map<string, AccessEntry>();
      passportMap.forEach((data, dest) => {
        fullAccess.set(dest, { ...data, source: 'passport' });
      });
      visaBenefits.forEach(vb => {
        fullAccess.set(vb.destination, {
          category: vb.category,
          days: vb.days,
          source: 'visa_benefit',
          visaHoldingId: vb.visaHoldingId,
          conditions: vb.conditions,
        });
      });

      return { traveler, passportResults, passportMap, visaBenefits, visaBenefitCounts, fullAccess };
    });

    // Build per-traveler visa benefit counts for badge display
    const perTravelerVisaBenefitCounts: Record<string, Record<string, number>> = {};
    travelerAccess.forEach(ta => {
      perTravelerVisaBenefitCounts[ta.traveler.id] = ta.visaBenefitCounts;
    });

    // Single traveler: return all their access directly
    if (activeTravelers.length === 1) {
      const ta = travelerAccess[0];
      const merged: MergedResult[] = [];

      ta.passportMap.forEach((data, dest) => {
        merged.push({
          destination: dest,
          category: data.category,
          days: data.days,
          perPerson: {},
          source: 'passport' as AccessSource,
        });
      });

      ta.visaBenefits.forEach(vb => {
        merged.push({
          destination: vb.destination,
          category: vb.category,
          days: vb.days,
          perPerson: {},
          source: 'visa_benefit' as AccessSource,
          visaHoldingId: vb.visaHoldingId,
          conditions: vb.conditions,
        });
      });

      return { mergedResults: merged, perTravelerVisaBenefitCounts };
    }

    // Multi-traveler: intersect full access across all travelers
    const fullAccessMaps = travelerAccess.map(ta => ta.fullAccess);
    const commonDests = [...fullAccessMaps[0].keys()].filter(dest =>
      fullAccessMaps.every(m => m.has(dest))
    );

    const merged: MergedResult[] = commonDests.map(dest => {
      const perPerson: Record<string, { destination: string; category: VisaCategory; days?: number; raw: string }> = {};
      let worstCat: VisaCategory = 'visa-free';
      let minDays: number | undefined;
      let source: AccessSource = 'passport';
      let visaHoldingId: string | undefined;
      let conditions: string[] | undefined;

      activeTravelers.forEach((t, i) => {
        const access = fullAccessMaps[i].get(dest)!;
        perPerson[t.id] = { destination: dest, category: access.category, days: access.days, raw: '' };

        if (catPri(access.category) > catPri(worstCat)) worstCat = access.category;
        if (access.days !== undefined && (minDays === undefined || access.days < minDays)) minDays = access.days;
        if (access.source === 'visa_benefit') {
          source = 'visa_benefit';
          visaHoldingId = access.visaHoldingId;
          conditions = access.conditions;
        }
      });

      return {
        destination: dest,
        category: worstCat,
        days: worstCat === 'visa-free' ? minDays : undefined,
        perPerson,
        source,
        visaHoldingId,
        conditions,
      };
    });

    return { mergedResults: merged, perTravelerVisaBenefitCounts };
  }, [travelers]);

  const filteredResults = useMemo(() => {
    let filtered = mergedResults;

    if (activeFilter === 'favorites') {
      filtered = filtered.filter(r => favorites.has(r.destination));
    } else if (activeFilter === 'accessible') {
      filtered = filtered.filter(r =>
        ['visa-free', 'eta', 'e-visa', 'visa-on-arrival'].includes(r.category)
      );
    } else if (activeFilter !== 'all') {
      filtered = filtered.filter(r => r.category === activeFilter);
    }

    if (regionFilter !== 'all') {
      filtered = filtered.filter(r => countryByCode[r.destination]?.region === regionFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r => countryByCode[r.destination]?.name.toLowerCase().includes(q));
    }

    return [...filtered].sort((a, b) => {
      if (activeFilter !== 'favorites') {
        const aFav = favorites.has(a.destination) ? 0 : 1;
        const bFav = favorites.has(b.destination) ? 0 : 1;
        if (aFav !== bFav) return aFav - bFav;
      }

      // Passport results before visa benefits
      const aSrc = a.source === 'passport' ? 0 : 1;
      const bSrc = b.source === 'passport' ? 0 : 1;
      if (aSrc !== bSrc) return aSrc - bSrc;

      switch (sortBy) {
        case 'days-desc':
          return (b.days ?? 0) - (a.days ?? 0);
        case 'category':
          return catPri(a.category) - catPri(b.category);
        case 'region': {
          const ra = countryByCode[a.destination]?.region ?? '';
          const rb = countryByCode[b.destination]?.region ?? '';
          return ra.localeCompare(rb) || (countryByCode[a.destination]?.name ?? '').localeCompare(countryByCode[b.destination]?.name ?? '');
        }
        default:
          return (countryByCode[a.destination]?.name ?? '').localeCompare(countryByCode[b.destination]?.name ?? '');
      }
    });
  }, [mergedResults, activeFilter, regionFilter, searchQuery, sortBy, favorites]);

  const addTraveler = useCallback(() => {
    setTravelers(prev => [...prev, {
      id: String(Date.now()),
      name: `Traveler ${prev.length + 1}`,
      passports: [],
      visaHoldings: [],
    }]);
  }, []);

  const removeTraveler = useCallback((id: string) => {
    setTravelers(prev => prev.length <= 1 ? prev : prev.filter(t => t.id !== id));
  }, []);

  const updateTraveler = useCallback((id: string, updates: Partial<Traveler>) => {
    setTravelers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const handleReset = useCallback(() => {
    setTravelers([{ id: '1', name: 'Traveler 1', passports: [], visaHoldings: [] }]);
    setActiveFilter('accessible');
    setSearchQuery('');
    setRegionFilter('all');
    setSortBy('name');
  }, []);

  const hasPassports = allPassportCodes.length > 0;

  const totalCountries = useMemo(() => Object.keys(countryByCode).length, []);

  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onShare={hasPassports ? handleShare : undefined}
        shareState={shareState}
        totalCountries={totalCountries}
        onReset={hasPassports ? handleReset : undefined}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 w-full flex-1">
        <WelcomeBanner />

        <section className="mb-8" aria-label="Select passports">
          <PassportSelector
            travelers={travelers}
            onAddTraveler={addTraveler}
            onRemoveTraveler={removeTraveler}
            onUpdateTraveler={updateTraveler}
            perTravelerVisaBenefitCounts={perTravelerVisaBenefitCounts}
          />
        </section>

        {hasPassports && (
          <div className="animate-fade-in-up">
            <DestinationSuggestions
              results={mergedResults}
              favorites={favorites}
              onSelectDestination={setSelectedDestination}
            />

            <SummaryCards results={mergedResults} />

            <StatsBar
              results={mergedResults}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              regionFilter={regionFilter}
              onRegionChange={setRegionFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              favCount={favCount}
            />

            <div className="flex justify-end mb-3">
              <ExportButton results={filteredResults} travelers={travelers} />
            </div>

            <ResultsView
              results={filteredResults}
              travelers={travelers}
              totalResults={mergedResults.length}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onCardClick={setSelectedDestination}
            />

            {((travelers.length === 1 && travelers[0].passports.length === 2) ||
              (travelers.length === 2 && travelers[0].passports.length >= 1 && travelers[1].passports.length >= 1)) && (
              <PassportCompare
                passport1={travelers[0].passports[0]}
                passport2={travelers.length === 1 ? travelers[0].passports[1] : travelers[1].passports[0]}
              />
            )}
          </div>
        )}

        {!hasPassports && (
          <div className="text-center py-16 sm:py-24 animate-fade-in-up">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl" role="img" aria-label="World map">🗺️</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Where can you travel?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
              Select your passport above to discover visa-free destinations.
              Add a travel companion to find places you can both visit.
            </p>
          </div>
        )}
      </main>

      <footer className="text-center py-6 px-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Data from{' '}
          <a
            href="https://github.com/ilyankou/passport-index-dataset"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 dark:text-slate-400 hover:text-blue-500 underline underline-offset-2 transition-colors"
          >
            Passport Index Dataset
          </a>
          {' '} (MIT). Updated Jan 2025. Always verify with official sources before travel.
        </p>
        <p className="text-[13px] italic text-slate-500 dark:text-slate-400 mt-3">
          Made with ❤️ for Morgan — so she always knows where we can travel together.
        </p>
      </footer>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 w-11 h-11 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-700 dark:hover:bg-slate-300 transition-colors press-effect animate-back-to-top-in z-50"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      <KeyboardShortcuts />

      {/* Destination detail modal - controlled by App state.
          To fully integrate: pass onCardClick={setSelectedDestination} to ResultsView */}
      <DestinationModal
        destinationCode={selectedDestination}
        results={mergedResults}
        onClose={() => setSelectedDestination(null)}
      />
    </div>
  );
}

function catPri(cat: VisaCategory): number {
  const order: Record<VisaCategory, number> = {
    'visa-free': 0, 'eta': 1, 'e-visa': 2, 'visa-on-arrival': 3,
    'visa-required': 4, 'no-admission': 5, 'self': 6,
  };
  return order[cat] ?? 6;
}

export default App;
