import { useMemo, useState } from 'react';
import { countryByCode } from '../data/countries';
import { getVisaResults, type VisaCategory } from '../data/visaUtils';
import { ArrowLeftRight } from 'lucide-react';

interface Props {
  passport1: string;
  passport2: string;
}

export default function PassportCompare({ passport1, passport2 }: Props) {
  const [showOnlyDiffs, setShowOnlyDiffs] = useState(false);

  const comparison = useMemo(() => {
    const r1 = getVisaResults(passport1);
    const r2 = getVisaResults(passport2);

    const map1 = new Map(r1.map(r => [r.destination, r]));
    const map2 = new Map(r2.map(r => [r.destination, r]));

    const allDests = new Set([...map1.keys(), ...map2.keys()]);

    let only1Better = 0, only2Better = 0, same = 0;
    const rows: { dest: string; cat1: VisaCategory | null; cat2: VisaCategory | null; days1?: number; days2?: number; diff: boolean }[] = [];

    allDests.forEach(dest => {
      if (!countryByCode[dest]) return;
      const a = map1.get(dest);
      const b = map2.get(dest);
      const cat1 = a?.category ?? null;
      const cat2 = b?.category ?? null;
      const diff = cat1 !== cat2;

      if (!diff) same++;
      else if (catPri(cat1) < catPri(cat2)) only1Better++;
      else only2Better++;

      rows.push({ dest, cat1, cat2, days1: a?.days, days2: b?.days, diff });
    });

    rows.sort((a, b) => {
      const nameA = countryByCode[a.dest]?.name ?? '';
      const nameB = countryByCode[b.dest]?.name ?? '';
      return nameA.localeCompare(nameB);
    });

    return { rows, only1Better, only2Better, same };
  }, [passport1, passport2]);

  const c1 = countryByCode[passport1];
  const c2 = countryByCode[passport2];
  if (!c1 || !c2) return null;

  const visibleRows = showOnlyDiffs ? comparison.rows.filter(r => r.diff) : comparison.rows;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mt-8 animate-fade-in-up">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <ArrowLeftRight className="w-4 h-4 text-slate-400" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Passport Comparison</h3>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">{c1.flag} {c1.name}</span>
          <span className="text-slate-300 dark:text-slate-600 text-xs">vs</span>
          <span className="font-medium text-slate-700 dark:text-slate-200">{c2.flag} {c2.name}</span>
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-3 mt-3">
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
            {c1.flag} +{comparison.only1Better}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium">
            = {comparison.same}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium">
            {c2.flag} +{comparison.only2Better}
          </span>
          <label className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showOnlyDiffs}
              onChange={(e) => setShowOnlyDiffs(e.target.checked)}
              className="rounded border-slate-300 text-blue-500 w-3.5 h-3.5"
            />
            Differences only
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="max-h-80 overflow-y-auto overscroll-contain">
        <table className="w-full text-sm" role="grid">
          <thead className="sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm">
            <tr>
              <th className="text-left px-4 py-2 text-xs text-slate-500 dark:text-slate-400 font-medium" scope="col">Country</th>
              <th className="text-center px-3 py-2 text-xs text-slate-500 dark:text-slate-400 font-medium w-16" scope="col">{c1.flag}</th>
              <th className="text-center px-3 py-2 text-xs text-slate-500 dark:text-slate-400 font-medium w-16" scope="col">{c2.flag}</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(row => {
              const country = countryByCode[row.dest];
              if (!country) return null;
              const winner = getWinner(row.cat1, row.cat2);
              return (
                <tr
                  key={row.dest}
                  className={`border-t border-slate-50 dark:border-slate-700/50 ${row.diff ? 'bg-amber-50/30 dark:bg-amber-500/5' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                >
                  <td className="px-4 py-2">
                    <span className="mr-1.5 text-sm" role="img" aria-hidden="true">{country.flag}</span>
                    <span className="text-slate-700 dark:text-slate-200 text-[13px]">{country.name}</span>
                  </td>
                  <td className="text-center px-3 py-2">
                    <MiniCategory category={row.cat1} days={row.days1} isWinner={winner === 1} />
                  </td>
                  <td className="text-center px-3 py-2">
                    <MiniCategory category={row.cat2} days={row.days2} isWinner={winner === 2} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MiniCategory({ category, days, isWinner }: { category: VisaCategory | null; days?: number; isWinner: boolean }) {
  if (!category) return <span className="text-slate-300 dark:text-slate-600 text-xs">--</span>;

  const colorMap: Record<VisaCategory, string> = {
    'visa-free': 'text-emerald-600 dark:text-emerald-400',
    'eta': 'text-violet-600 dark:text-violet-400',
    'e-visa': 'text-blue-600 dark:text-blue-400',
    'visa-on-arrival': 'text-amber-600 dark:text-amber-400',
    'visa-required': 'text-red-400 dark:text-red-400',
    'no-admission': 'text-slate-400 dark:text-slate-500',
    'self': 'text-slate-300 dark:text-slate-600',
  };

  const shortLabels: Record<VisaCategory, string> = {
    'visa-free': days ? `${days}d` : 'Free',
    'eta': 'ETA',
    'e-visa': 'eVisa',
    'visa-on-arrival': 'VoA',
    'visa-required': 'Visa',
    'no-admission': 'No',
    'self': '--',
  };

  return (
    <span className={`text-xs ${colorMap[category]} ${isWinner ? 'font-semibold' : ''}`}>
      {shortLabels[category]}
    </span>
  );
}

function catPri(cat: VisaCategory | null): number {
  if (!cat) return 99;
  const order: Record<VisaCategory, number> = {
    'visa-free': 0, 'eta': 1, 'e-visa': 2, 'visa-on-arrival': 3,
    'visa-required': 4, 'no-admission': 5, 'self': 6,
  };
  return order[cat] ?? 6;
}

function getWinner(cat1: VisaCategory | null, cat2: VisaCategory | null): 0 | 1 | 2 {
  const p1 = catPri(cat1);
  const p2 = catPri(cat2);
  if (p1 === p2) return 0;
  return p1 < p2 ? 1 : 2;
}
