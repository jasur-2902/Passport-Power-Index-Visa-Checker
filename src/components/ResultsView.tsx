import { useState, useRef, useCallback } from 'react';
import { ChevronDown, Clock, Heart, MapPin, ShieldCheck } from 'lucide-react';
import { countryByCode } from '../data/countries';
import { type GroupResult, type VisaCategory, getCategoryLabel } from '../data/visaUtils';
import { visaHoldingTypeMap, type AccessSource } from '../data/visaBenefits';
import type { Traveler } from '../App';

type EnhancedGroupResult = GroupResult & {
  source: AccessSource;
  visaHoldingId?: string;
  conditions?: string[];
};

interface Props {
  results: EnhancedGroupResult[];
  travelers: Traveler[];
  totalResults: number;
  isFavorite: (code: string) => boolean;
  onToggleFavorite: (code: string) => void;
  onCardClick?: (code: string) => void;
}

export default function ResultsView({ results, travelers, totalResults, isFavorite, onToggleFavorite, onCardClick }: Props) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const activeTravelers = travelers.filter(t => t.passports.length > 0);
  const isGroup = activeTravelers.length > 1;

  const visaCount = results.filter(r => r.source === 'visa_benefit').length;

  if (results.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in-up">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-7 h-7 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">
          No destinations found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          Try adjusting your filters or search to find more destinations.
        </p>
      </div>
    );
  }

  return (
    <div role="region" aria-label="Destination results" aria-live="polite">
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-200">{results.length}</span>
          {' '}of {totalResults} destinations
          {isGroup && (
            <span className="text-blue-500 font-medium ml-1">
              — common for all travelers
            </span>
          )}
          {visaCount > 0 && (
            <span className="text-emerald-500 font-medium ml-1">
              ({visaCount} via visas)
            </span>
          )}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((result, index) => (
          <DestinationCard
            key={`${result.destination}-${result.source}`}
            result={result}
            index={index}
            isGroup={isGroup}
            isExpanded={expandedCard === result.destination}
            onToggleExpand={() => setExpandedCard(prev => prev === result.destination ? null : result.destination)}
            isFavorite={isFavorite(result.destination)}
            onToggleFavorite={() => onToggleFavorite(result.destination)}
            activeTravelers={activeTravelers}
            onCardClick={onCardClick ? () => onCardClick(result.destination) : undefined}
          />
        ))}
      </div>

      {/* Disclaimer when visa benefits are shown */}
      {visaCount > 0 && (
        <p className="mt-6 text-[11px] text-slate-400 dark:text-slate-500 text-center max-w-lg mx-auto leading-relaxed">
          Visa benefit data is for reference only. Always verify requirements with the destination
          country's embassy or official immigration website before travel.
        </p>
      )}
    </div>
  );
}

function DestinationCard({
  result,
  index,
  isGroup,
  isExpanded,
  onToggleExpand,
  isFavorite: fav,
  onToggleFavorite,
  activeTravelers,
  onCardClick,
}: {
  result: EnhancedGroupResult;
  index: number;
  isGroup: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  activeTravelers: Traveler[];
  onCardClick?: () => void;
}) {
  const country = countryByCode[result.destination];
  const heartRef = useRef<HTMLButtonElement>(null);
  const isVisaBenefit = result.source === 'visa_benefit';
  const visaType = result.visaHoldingId ? visaHoldingTypeMap.get(result.visaHoldingId) : null;

  const handleFavClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite();
    if (heartRef.current) {
      heartRef.current.classList.remove('animate-heart-pop');
      void heartRef.current.offsetWidth;
      heartRef.current.classList.add('animate-heart-pop');
    }
  }, [onToggleFavorite]);

  if (!country) return null;

  return (
    <div
      className={`card-enter bg-white dark:bg-slate-800 rounded-2xl border shadow-sm hover-lift overflow-hidden ${
        isVisaBenefit ? 'border-emerald-200 dark:border-emerald-500/30' : 'border-slate-100 dark:border-slate-700'
      }${onCardClick ? ' cursor-pointer card-press' : ''}`}
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
      onClick={onCardClick}
      onKeyDown={onCardClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick(); } } : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      role={onCardClick ? 'button' : undefined}
      aria-label={onCardClick ? `View details for ${country?.name}` : undefined}
    >
      {/* Visa benefit indicator strip */}
      {isVisaBenefit && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 px-4 py-1.5 flex items-center gap-1.5 border-b border-emerald-100 dark:border-emerald-500/20">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            Via {visaType?.shortName ?? 'Visa'}
          </span>
        </div>
      )}

      {/* Main content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span
            className="text-[32px] leading-none flex-shrink-0 mt-0.5"
            role="img"
            aria-label={`${country.name} flag`}
          >
            {country.flag}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-[15px] truncate leading-tight">
                  {country.name}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{country.region}</p>
              </div>

              <button
                ref={heartRef}
                onClick={handleFavClick}
                aria-label={fav ? `Remove ${country.name} from saved` : `Save ${country.name}`}
                aria-pressed={fav}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all flex-shrink-0 ${
                  fav
                    ? 'text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-500/10'
                    : 'text-slate-300 dark:text-slate-600 hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-500/10'
                }`}
              >
                <Heart className={`w-[18px] h-[18px] ${fav ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Badge + days row */}
            <div className="flex items-center gap-2 mt-2">
              <CategoryBadge category={result.category} />
              {result.days != null && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {result.days} days
                </span>
              )}
            </div>

            {/* Conditions for visa benefits */}
            {isVisaBenefit && result.conditions && result.conditions.length > 0 && (
              <div className="mt-2 space-y-0.5">
                {result.conditions.slice(0, 2).map((cond, i) => (
                  <p key={i} className="text-[10px] text-slate-400 leading-tight">
                    {cond}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Group expand toggle */}
        {isGroup && !isVisaBenefit && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Hide' : 'Show'} per-traveler details for ${country.name}`}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            Per-traveler details
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Expanded per-traveler details */}
      <div className={`expand-transition ${isExpanded && isGroup && !isVisaBenefit ? 'expanded' : ''}`}>
        <div>
          <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/50 px-4 py-3">
            <div className="space-y-2">
              {activeTravelers.map(t => {
                const personResult = result.perPerson[t.id] ?? t.passports.map(p => result.perPerson[p]).find(Boolean);
                if (!personResult) return null;
                return (
                  <div key={t.id} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">{t.name}</span>
                    <div className="flex items-center gap-2">
                      {personResult.days != null && (
                        <span className="text-xs text-slate-400 tabular-nums">{personResult.days}d</span>
                      )}
                      <CategoryBadge category={personResult.category} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryBadge({ category, small = false }: { category: VisaCategory; small?: boolean }) {
  const styles: Record<VisaCategory, string> = {
    'visa-free': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
    'eta': 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-500/30',
    'e-visa': 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
    'visa-on-arrival': 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
    'visa-required': 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30',
    'no-admission': 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600',
    'self': 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600',
  };

  return (
    <span className={`inline-flex items-center rounded-lg font-medium border ${styles[category]} ${
      small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
    }`}>
      {getCategoryLabel(category)}
    </span>
  );
}
