import { useCallback, useState } from 'react';
import { Download, Check } from 'lucide-react';
import { countryByCode } from '../data/countries';
import { getCategoryLabel } from '../data/visaUtils';
import type { GroupResult } from '../data/visaUtils';
import type { AccessSource } from '../data/visaBenefits';
import type { Traveler } from '../App';

type EnhancedGroupResult = GroupResult & {
  source: AccessSource;
  visaHoldingId?: string;
  conditions?: string[];
};

interface Props {
  results: EnhancedGroupResult[];
  travelers: Traveler[];
}

export default function ExportButton({ results, travelers }: Props) {
  const [exported, setExported] = useState(false);

  const getPassportNames = useCallback(() => {
    const codes = new Set<string>();
    travelers.forEach(t => t.passports.forEach(p => codes.add(p)));
    return [...codes].map(c => countryByCode[c]?.name ?? c).join(', ');
  }, [travelers]);

  const exportCSV = useCallback(() => {
    const headers = ['Country', 'Code', 'Visa Category', 'Days Allowed', 'Region', 'Source'];
    const rows = results.map(r => {
      const country = countryByCode[r.destination];
      return [
        country?.name ?? r.destination,
        r.destination,
        getCategoryLabel(r.category),
        r.days != null ? String(r.days) : '',
        country?.region ?? '',
        r.source === 'visa_benefit' ? 'Visa Benefit' : 'Passport',
      ];
    });

    const passports = getPassportNames();
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const meta = [
      `# VisaCheck Export`,
      `# Passports: ${passports}`,
      `# Date: ${date}`,
      `# Total destinations: ${results.length}`,
      '',
    ];

    const csv = meta.join('\n') + headers.join(',') + '\n' + rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visacheck-results-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 2000);
  }, [results, getPassportNames]);

  const exportText = useCallback(() => {
    const passports = getPassportNames();
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const categories: Record<string, typeof results> = {};
    results.forEach(r => {
      const label = getCategoryLabel(r.category);
      if (!categories[label]) categories[label] = [];
      categories[label].push(r);
    });

    let text = `VisaCheck Results\n`;
    text += `${'='.repeat(40)}\n`;
    text += `Passports: ${passports}\n`;
    text += `Date: ${date}\n`;
    text += `Total: ${results.length} destinations\n\n`;

    Object.entries(categories).forEach(([label, items]) => {
      text += `${label} (${items.length})\n`;
      text += `${'-'.repeat(30)}\n`;
      items.forEach(r => {
        const country = countryByCode[r.destination];
        const days = r.days != null ? ` - ${r.days} days` : '';
        text += `  ${country?.flag ?? ''} ${country?.name ?? r.destination}${days}\n`;
      });
      text += '\n';
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visacheck-results-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 2000);
  }, [results, getPassportNames]);

  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowMenu(prev => !prev)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
          exported
            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
            : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
        aria-label="Export results"
      >
        {exported ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
        {exported ? 'Exported' : 'Export'}
      </button>

      {showMenu && !exported && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 py-1 min-w-[140px] animate-fade-in">
            <button
              onClick={() => { exportCSV(); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Export as CSV
            </button>
            <button
              onClick={() => { exportText(); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Export as Text
            </button>
          </div>
        </>
      )}
    </div>
  );
}
