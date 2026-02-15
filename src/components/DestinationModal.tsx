import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, MapPin, Globe, Building2, Info, ExternalLink } from 'lucide-react';
import { countryByCode } from '../data/countries';
import { type VisaCategory, getCategoryLabel } from '../data/visaUtils';
import type { GroupResult } from '../data/visaUtils';
import type { AccessSource } from '../data/visaBenefits';
import { officialLinks } from '../data/officialLinks';

type EnhancedGroupResult = GroupResult & {
  source: AccessSource;
  visaHoldingId?: string;
  conditions?: string[];
};

interface Props {
  destinationCode: string | null;
  results: EnhancedGroupResult[];
  onClose: () => void;
}

export default function DestinationModal({ destinationCode, results, onClose }: Props) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!destinationCode) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [destinationCode, handleKeyDown]);

  if (!destinationCode) return null;

  const country = countryByCode[destinationCode];
  const result = results.find(r => r.destination === destinationCode);
  if (!country) return null;

  // Find nearby countries with similar visa status in same region
  const similarCountries = results
    .filter(r => {
      const c = countryByCode[r.destination];
      return c && c.region === country.region && r.destination !== destinationCode && r.category === result?.category;
    })
    .slice(0, 6);

  const categoryExplanations: Record<VisaCategory, string> = {
    'visa-free': 'You can enter this country without a visa. Just bring your valid passport.',
    'visa-on-arrival': 'You can get a visa when you arrive at the border or airport.',
    'e-visa': 'You need to apply for an electronic visa online before traveling.',
    'eta': 'You need an Electronic Travel Authorization before departure.',
    'visa-required': 'You must apply for a visa at an embassy or consulate before traveling.',
    'no-admission': 'Entry is not permitted with your current passport.',
    'self': '',
  };

  const badgeStyles: Record<VisaCategory, string> = {
    'visa-free': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
    'eta': 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-500/30',
    'e-visa': 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
    'visa-on-arrival': 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
    'visa-required': 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30',
    'no-admission': 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600',
    'self': 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${country.name}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

      {/* Panel */}
      <div
        className="relative w-full sm:w-[420px] sm:h-full bg-white dark:bg-slate-900 sm:shadow-2xl overflow-y-auto
          max-h-[85vh] sm:max-h-full rounded-t-3xl sm:rounded-none
          animate-slide-up sm:animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{country.flag}</span>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{country.name}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">{country.region}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-6">
          {/* Visa category */}
          {result && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Visa Requirement</h3>
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center rounded-lg font-medium border px-2.5 py-1 text-xs ${badgeStyles[result.category]}`}>
                  {getCategoryLabel(result.category)}
                </span>
                {result.days != null && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    {result.days} days allowed
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {categoryExplanations[result.category]}
              </p>
            </div>
          )}

          {/* Conditions (visa benefits) */}
          {result?.conditions && result.conditions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Conditions</h3>
              <ul className="space-y-1.5">
                {result.conditions.map((cond, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    {cond}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Official links */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Resources</h3>
            <div className="space-y-2">
              {officialLinks[destinationCode]?.visaInfo ? (
                <a
                  href={officialLinks[destinationCode].visaInfo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                >
                  <Globe className="w-4 h-4 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Official Visa Info</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{officialLinks[destinationCode].visaInfo}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </a>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl opacity-60">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Official visa information</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">No direct link available</p>
                  </div>
                </div>
              )}
              {officialLinks[destinationCode]?.embassy ? (
                <a
                  href={officialLinks[destinationCode].embassy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                >
                  <Building2 className="w-4 h-4 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Embassy / Consulate Finder</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{officialLinks[destinationCode].embassy}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </a>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl opacity-60">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Embassy information</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">No direct link available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Similar countries in region */}
          {similarCountries.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                <MapPin className="w-3.5 h-3.5 inline mr-1" />
                Similar in {country.region}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {similarCountries.map(sc => {
                  const c = countryByCode[sc.destination];
                  if (!c) return null;
                  return (
                    <div key={sc.destination} className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <span className="text-lg">{c.flag}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{c.name}</p>
                        {sc.days != null && <p className="text-xs text-slate-400">{sc.days}d</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
