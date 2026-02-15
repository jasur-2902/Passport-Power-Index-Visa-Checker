import visaData from './visa-requirements.json';
import { countryByCode } from './countries';

export type VisaCategory = 'visa-free' | 'visa-on-arrival' | 'e-visa' | 'eta' | 'visa-required' | 'no-admission' | 'self';

export interface VisaResult {
  destination: string;
  category: VisaCategory;
  days?: number;
  raw: string;
}

export interface GroupResult {
  destination: string;
  category: VisaCategory; // worst case among group
  days?: number;
  perPerson: Record<string, VisaResult>; // passport code -> their result
}

const data = visaData as Record<string, Record<string, string>>;

function categorize(raw: string): { category: VisaCategory; days?: number } {
  if (raw === '-1') return { category: 'self' };
  if (raw === 'no admission') return { category: 'no-admission' };
  if (raw === 'visa required') return { category: 'visa-required' };
  if (raw === 'e-visa') return { category: 'e-visa' };
  if (raw === 'eta') return { category: 'eta' };
  if (raw === 'visa on arrival') return { category: 'visa-on-arrival' };
  if (raw === 'visa free') return { category: 'visa-free' };
  // Numeric = visa-free with day count
  const days = parseInt(raw);
  if (!isNaN(days)) return { category: 'visa-free', days };
  return { category: 'visa-required' };
}

// Cache: passport code → results (static data never changes)
const visaResultsCache = new Map<string, VisaResult[]>();

export function getVisaResults(passportCode: string): VisaResult[] {
  const cached = visaResultsCache.get(passportCode);
  if (cached) return cached;

  const passportData = data[passportCode];
  if (!passportData) return [];

  const results = Object.entries(passportData)
    .map(([dest, raw]) => {
      const { category, days } = categorize(raw);
      return { destination: dest, category, days, raw };
    })
    .filter(r => r.category !== 'self' && countryByCode[r.destination]);

  visaResultsCache.set(passportCode, results);
  return results;
}

// Priority order for "worst case" logic (lower = better access)
const categoryPriority: Record<VisaCategory, number> = {
  'visa-free': 0,
  'eta': 1,
  'e-visa': 2,
  'visa-on-arrival': 3,
  'visa-required': 4,
  'no-admission': 5,
  'self': 6,
};

// Cache: sorted passport codes key → group results
const groupResultsCache = new Map<string, GroupResult[]>();

export function getGroupResults(passportCodes: string[]): GroupResult[] {
  if (passportCodes.length === 0) return [];

  const cacheKey = [...passportCodes].sort().join(',');
  const cached = groupResultsCache.get(cacheKey);
  if (cached) return cached;

  if (passportCodes.length === 1) {
    return getVisaResults(passportCodes[0]).map(r => ({
      destination: r.destination,
      category: r.category,
      days: r.days,
      perPerson: { [passportCodes[0]]: r },
    }));
  }

  // Get results for each passport
  const allResults = passportCodes.map(code => {
    const results = getVisaResults(code);
    const map: Record<string, VisaResult> = {};
    results.forEach(r => { map[r.destination] = r; });
    return { code, map };
  });

  // Find common destinations (all passports have data for)
  const allDestinations = new Set<string>();
  allResults.forEach(({ map }) => {
    Object.keys(map).forEach(d => allDestinations.add(d));
  });

  const groupResults: GroupResult[] = [];

  allDestinations.forEach(dest => {
    // Skip if any passport is missing data for this destination
    const perPerson: Record<string, VisaResult> = {};
    let worstCategory: VisaCategory = 'visa-free';
    let minDays: number | undefined;
    let allHaveData = true;

    for (const { code, map } of allResults) {
      const result = map[dest];
      if (!result) {
        allHaveData = false;
        break;
      }
      perPerson[code] = result;

      if (categoryPriority[result.category] > categoryPriority[worstCategory]) {
        worstCategory = result.category;
      }

      if (result.days !== undefined) {
        if (minDays === undefined || result.days < minDays) {
          minDays = result.days;
        }
      }
    }

    if (!allHaveData) return;
    if (worstCategory === 'self') return;

    groupResults.push({
      destination: dest,
      category: worstCategory,
      days: worstCategory === 'visa-free' ? minDays : undefined,
      perPerson,
    });
  });

  groupResultsCache.set(cacheKey, groupResults);
  return groupResults;
}

export function getCategoryLabel(category: VisaCategory): string {
  switch (category) {
    case 'visa-free': return 'Visa Free';
    case 'visa-on-arrival': return 'Visa on Arrival';
    case 'e-visa': return 'e-Visa';
    case 'eta': return 'ETA';
    case 'visa-required': return 'Visa Required';
    case 'no-admission': return 'No Admission';
    default: return category;
  }
}

export function getCategoryColor(category: VisaCategory): string {
  switch (category) {
    case 'visa-free': return 'bg-visa-free';
    case 'visa-on-arrival': return 'bg-visa-arrival';
    case 'e-visa': return 'bg-e-visa';
    case 'eta': return 'bg-eta';
    case 'visa-required': return 'bg-visa-required';
    case 'no-admission': return 'bg-no-admission';
    default: return 'bg-gray-400';
  }
}

export function getCategoryTextColor(category: VisaCategory): string {
  switch (category) {
    case 'visa-free': return 'text-visa-free';
    case 'visa-on-arrival': return 'text-visa-arrival';
    case 'e-visa': return 'text-e-visa';
    case 'eta': return 'text-eta';
    case 'visa-required': return 'text-visa-required';
    case 'no-admission': return 'text-no-admission';
    default: return 'text-gray-400';
  }
}

export const accessibleCategories: VisaCategory[] = ['visa-free', 'eta', 'e-visa', 'visa-on-arrival'];
export const allCategories: VisaCategory[] = ['visa-free', 'eta', 'e-visa', 'visa-on-arrival', 'visa-required', 'no-admission'];
