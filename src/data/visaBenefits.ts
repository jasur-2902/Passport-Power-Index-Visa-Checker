/**
 * Visa Benefits Database
 *
 * Maps visa/residency holdings to additional countries that can be accessed.
 * Only HIGH and MEDIUM confidence data is included.
 *
 * Sources: Official government immigration websites, IATA, embassy pages.
 * Last verified: February 2025
 */

export type VisaHoldingCategory = 'residency' | 'long_term_visa' | 'short_term_visa' | 'special_permit';

export type BenefitAccessType = 'visa_free' | 'visa_on_arrival' | 'e_visa_simplified' | 'transit_free';

export type ConfidenceLevel = 'high' | 'medium';

export interface VisaHoldingType {
  id: string;
  name: string;
  shortName: string;
  category: VisaHoldingCategory;
  issuingCountry: string; // ISO2
  icon: string; // emoji
  description: string;
}

export interface VisaBenefit {
  destination: string; // ISO2 country code
  accessType: BenefitAccessType;
  days?: number;
  conditions: string[];
  confidence: ConfidenceLevel;
}

export interface VisaHolding {
  typeId: string;
  // Future: could add expiry date, specific visa subtype, etc.
}

// ─── Visa/Residency Types ────────────────────────────────────────────────────

export const visaHoldingTypes: VisaHoldingType[] = [
  // US
  {
    id: 'us-green-card',
    name: 'US Permanent Residency (Green Card)',
    shortName: 'US Green Card',
    category: 'residency',
    issuingCountry: 'US',
    icon: '🟢',
    description: 'US Lawful Permanent Resident card',
  },
  {
    id: 'us-visa',
    name: 'Valid US Visa (B1/B2, F1, H1B, etc.)',
    shortName: 'US Visa',
    category: 'short_term_visa',
    issuingCountry: 'US',
    icon: '🇺🇸',
    description: 'Any valid, unexpired US visa stamp',
  },

  // Schengen
  {
    id: 'schengen-visa',
    name: 'Schengen Visa',
    shortName: 'Schengen Visa',
    category: 'short_term_visa',
    issuingCountry: 'EU',
    icon: '🇪🇺',
    description: 'Valid Schengen area short-stay visa (type C)',
  },
  {
    id: 'schengen-residence',
    name: 'Schengen/EU Residence Permit',
    shortName: 'EU Residence',
    category: 'residency',
    issuingCountry: 'EU',
    icon: '🏠',
    description: 'Residence permit from any Schengen/EU member state',
  },

  // UK
  {
    id: 'uk-visa',
    name: 'Valid UK Visa / BRP',
    shortName: 'UK Visa',
    category: 'short_term_visa',
    issuingCountry: 'GB',
    icon: '🇬🇧',
    description: 'Valid UK visa or Biometric Residence Permit',
  },

  // Canada
  {
    id: 'ca-pr',
    name: 'Canadian Permanent Residency',
    shortName: 'Canada PR',
    category: 'residency',
    issuingCountry: 'CA',
    icon: '🍁',
    description: 'Canadian Permanent Resident card',
  },
  {
    id: 'ca-visa',
    name: 'Valid Canadian Visa',
    shortName: 'Canada Visa',
    category: 'short_term_visa',
    issuingCountry: 'CA',
    icon: '🇨🇦',
    description: 'Valid Canadian temporary resident visa',
  },

  // Australia
  {
    id: 'au-pr',
    name: 'Australian Permanent Residency',
    shortName: 'Australia PR',
    category: 'residency',
    issuingCountry: 'AU',
    icon: '🦘',
    description: 'Australian Permanent Resident visa',
  },

  // UAE
  {
    id: 'uae-residence',
    name: 'UAE Residence Visa',
    shortName: 'UAE Residence',
    category: 'residency',
    issuingCountry: 'AE',
    icon: '🏙️',
    description: 'UAE residence visa/permit',
  },

  // Japan
  {
    id: 'jp-visa',
    name: 'Valid Japanese Visa',
    shortName: 'Japan Visa',
    category: 'short_term_visa',
    issuingCountry: 'JP',
    icon: '🇯🇵',
    description: 'Valid Japanese visa or residence card',
  },

  // GCC
  {
    id: 'gcc-residence',
    name: 'GCC Residency (Saudi/Qatar/Oman/Bahrain/Kuwait)',
    shortName: 'GCC Residence',
    category: 'residency',
    issuingCountry: 'SA',
    icon: '🌙',
    description: 'Residence permit from any GCC member state',
  },

  // Singapore
  {
    id: 'sg-visa',
    name: 'Singapore Work/Residence Permit',
    shortName: 'Singapore Permit',
    category: 'long_term_visa',
    issuingCountry: 'SG',
    icon: '🇸🇬',
    description: 'Singapore Employment Pass, S Pass, or PR',
  },

  // APEC
  {
    id: 'apec-card',
    name: 'APEC Business Travel Card',
    shortName: 'APEC Card',
    category: 'special_permit',
    issuingCountry: 'XX',
    icon: '🌏',
    description: 'APEC Business Travel Card (ABTC) for expedited border crossing',
  },
];

export const visaHoldingTypeMap = new Map(visaHoldingTypes.map(t => [t.id, t]));

// ─── Benefits Database ───────────────────────────────────────────────────────

// Schengen member states (as of 2025 — 29 countries including Bulgaria, Romania)
const SCHENGEN_STATES = [
  'AT', 'BE', 'BG', 'HR', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE',
  'GR', 'HU', 'IS', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'NO',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'CH', 'LI',
];

function schengenBenefits(): VisaBenefit[] {
  return SCHENGEN_STATES.map(code => ({
    destination: code,
    accessType: 'visa_free' as BenefitAccessType,
    days: 90,
    conditions: ['Within 90/180-day rule', 'Must have valid Schengen visa'],
    confidence: 'high' as ConfidenceLevel,
  }));
}

/**
 * The benefits database: visa holding ID → countries unlocked
 */
export const benefitsDatabase: Record<string, VisaBenefit[]> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // US GREEN CARD
  // ═══════════════════════════════════════════════════════════════════════════
  'us-green-card': [
    { destination: 'MX', accessType: 'visa_free', days: 180, conditions: ['Must obtain FMM tourist card on arrival', 'Valid passport required'], confidence: 'high' },
    { destination: 'CA', accessType: 'visa_free', days: 180, conditions: ['Must hold valid passport', 'May be admitted for up to 6 months at officer discretion'], confidence: 'high' },
    { destination: 'CR', accessType: 'visa_free', days: 30, conditions: ['Green card must be valid', 'Extensions possible at Office of Migration'], confidence: 'high' },
    { destination: 'PA', accessType: 'visa_free', days: 30, conditions: ['Valid US residency document required'], confidence: 'high' },
    { destination: 'BS', accessType: 'visa_free', days: 30, conditions: ['Valid passport and green card required'], confidence: 'high' },
    { destination: 'BZ', accessType: 'visa_free', days: 30, conditions: ['Valid passport required'], confidence: 'medium' },
    { destination: 'BM', accessType: 'visa_free', days: 90, conditions: ['Valid passport required'], confidence: 'medium' },
    { destination: 'DO', accessType: 'visa_free', days: 30, conditions: ['Tourist card may be required on arrival'], confidence: 'medium' },
    { destination: 'SV', accessType: 'visa_free', days: 90, conditions: ['Valid passport and green card'], confidence: 'medium' },
    { destination: 'GT', accessType: 'visa_free', days: 90, conditions: ['CA-4 agreement country', '90 days shared with Honduras, El Salvador, Nicaragua'], confidence: 'medium' },
    { destination: 'HN', accessType: 'visa_free', days: 90, conditions: ['CA-4 agreement country', '90 days shared with Guatemala, El Salvador, Nicaragua'], confidence: 'medium' },
    { destination: 'NI', accessType: 'visa_free', days: 90, conditions: ['CA-4 agreement country'], confidence: 'medium' },
    { destination: 'JM', accessType: 'visa_free', days: 30, conditions: ['Valid passport and return ticket required'], confidence: 'medium' },
    { destination: 'AG', accessType: 'visa_free', days: 30, conditions: ['Valid passport required'], confidence: 'medium' },
    { destination: 'AI', accessType: 'visa_free', days: 90, conditions: ['British Overseas Territory'], confidence: 'medium' },
    { destination: 'KY', accessType: 'visa_free', days: 30, conditions: ['Valid passport required'], confidence: 'medium' },
    { destination: 'TC', accessType: 'visa_free', days: 90, conditions: ['Valid passport required'], confidence: 'medium' },
    { destination: 'CW', accessType: 'visa_free', days: 30, conditions: ['Valid green card required'], confidence: 'medium' },
    { destination: 'BQ', accessType: 'visa_free', days: 30, conditions: ['Dutch Caribbean territory'], confidence: 'medium' },
    { destination: 'SX', accessType: 'visa_free', days: 30, conditions: ['Dutch side of the island'], confidence: 'medium' },
    { destination: 'GE', accessType: 'visa_free', days: 90, conditions: ['Valid green card must be presented'], confidence: 'high' },
    { destination: 'AL', accessType: 'visa_free', days: 90, conditions: ['Must have multiple-entry green card (standard green cards qualify)'], confidence: 'high' },
    { destination: 'BA', accessType: 'visa_free', days: 30, conditions: ['Valid green card required'], confidence: 'medium' },
    { destination: 'ME', accessType: 'visa_free', days: 30, conditions: ['Valid green card required'], confidence: 'medium' },
    { destination: 'RS', accessType: 'visa_free', days: 90, conditions: ['Valid green card required'], confidence: 'medium' },
    { destination: 'TR', accessType: 'e_visa_simplified', days: 30, conditions: ['E-visa available online', 'Green card holders can apply for simplified e-visa'], confidence: 'high' },
    { destination: 'MA', accessType: 'visa_free', days: 90, conditions: ['Valid passport required'], confidence: 'medium' },
    { destination: 'KR', accessType: 'visa_free', days: 30, conditions: ['K-ETA may be required', 'Check current requirements'], confidence: 'medium' },
    { destination: 'TW', accessType: 'visa_free', days: 30, conditions: ['Travel Authorization Certificate may be required for some nationalities'], confidence: 'medium' },
    { destination: 'SG', accessType: 'visa_free', days: 30, conditions: ['Valid green card and passport required'], confidence: 'medium' },
    { destination: 'MY', accessType: 'visa_free', days: 30, conditions: ['Valid green card and passport required'], confidence: 'medium' },
    { destination: 'PH', accessType: 'visa_free', days: 30, conditions: ['Valid green card and passport required'], confidence: 'medium' },
    { destination: 'AM', accessType: 'visa_free', days: 180, conditions: ['Valid passport required'], confidence: 'medium' },
    { destination: 'BH', accessType: 'visa_on_arrival', days: 14, conditions: ['Visa on arrival available for US green card holders'], confidence: 'medium' },
    { destination: 'QA', accessType: 'visa_on_arrival', days: 30, conditions: ['Valid green card required'], confidence: 'medium' },
    { destination: 'OM', accessType: 'visa_on_arrival', days: 14, conditions: ['E-visa or visa on arrival available'], confidence: 'medium' },
    { destination: 'AE', accessType: 'visa_free', days: 30, conditions: ['Valid passport required'], confidence: 'medium' },
    { destination: 'CL', accessType: 'visa_free', days: 90, conditions: ['Valid passport required'], confidence: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // US VISA (B1/B2, F1, H1B, etc.)
  // ═══════════════════════════════════════════════════════════════════════════
  'us-visa': [
    { destination: 'MX', accessType: 'visa_free', days: 180, conditions: ['All valid used/unused multiple-entry US visas accepted', 'FMM tourist card required'], confidence: 'high' },
    { destination: 'CA', accessType: 'visa_free', days: 180, conditions: ['Valid used/unused multiple-entry non-immigrant US visas only: B1, B2, B1/B2, F, M, J, H, L types', 'Must also hold valid passport'], confidence: 'high' },
    { destination: 'PA', accessType: 'visa_free', days: 30, conditions: ['Must have valid US visa with at least 2 prior entries to US'], confidence: 'high' },
    { destination: 'CR', accessType: 'visa_free', days: 30, conditions: ['Must have valid multiple-entry US visa'], confidence: 'high' },
    { destination: 'AL', accessType: 'visa_free', days: 90, conditions: ['Must have valid multiple-entry US visa that has been used at least once prior to arrival'], confidence: 'high' },
    { destination: 'GE', accessType: 'visa_free', days: 90, conditions: ['Valid US visa required'], confidence: 'high' },
    { destination: 'TR', accessType: 'e_visa_simplified', days: 30, conditions: ['E-visa available online for holders of valid US visa', 'Some nationalities may need sticker visa'], confidence: 'high' },
    { destination: 'CO', accessType: 'visa_free', days: 90, conditions: ['Valid US visa required', 'Some nationalities eligible'], confidence: 'medium' },
    { destination: 'GT', accessType: 'visa_free', days: 90, conditions: ['CA-4 agreement', 'Valid US visa required'], confidence: 'medium' },
    { destination: 'HN', accessType: 'visa_free', days: 90, conditions: ['CA-4 agreement', 'Valid US visa required'], confidence: 'medium' },
    { destination: 'SV', accessType: 'visa_free', days: 90, conditions: ['CA-4 agreement', 'Valid US visa required'], confidence: 'medium' },
    { destination: 'NI', accessType: 'visa_free', days: 90, conditions: ['CA-4 agreement', 'Valid US visa required'], confidence: 'medium' },
    { destination: 'DO', accessType: 'visa_free', days: 30, conditions: ['Tourist card fee may apply', 'Valid US visa required'], confidence: 'medium' },
    { destination: 'AW', accessType: 'visa_free', days: 30, conditions: ['Valid US visa required', 'ED card application needed'], confidence: 'medium' },
    { destination: 'BS', accessType: 'visa_free', days: 30, conditions: ['Valid US visa required'], confidence: 'medium' },
    { destination: 'BM', accessType: 'visa_free', days: 21, conditions: ['Valid US visa required'], confidence: 'medium' },
    { destination: 'BA', accessType: 'visa_free', days: 30, conditions: ['Valid multiple-entry US visa required'], confidence: 'medium' },
    { destination: 'ME', accessType: 'visa_free', days: 30, conditions: ['Valid US visa required'], confidence: 'medium' },
    { destination: 'RS', accessType: 'visa_free', days: 90, conditions: ['Valid US visa required'], confidence: 'medium' },
    { destination: 'MK', accessType: 'visa_free', days: 15, conditions: ['Valid multiple-entry US visa required'], confidence: 'medium' },
    { destination: 'AE', accessType: 'visa_free', days: 14, conditions: ['Valid US visa required', 'Some nationality restrictions apply'], confidence: 'medium' },
    { destination: 'SG', accessType: 'transit_free', days: 4, conditions: ['96-hour Visa Free Transit Facility', 'Must be transiting to/from a third country by air with valid US visa', 'Available to Chinese and Indian nationals'], confidence: 'high' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // SCHENGEN VISA
  // ═══════════════════════════════════════════════════════════════════════════
  'schengen-visa': [
    ...schengenBenefits(),
    // Third countries accepting Schengen visa
    { destination: 'AL', accessType: 'visa_free', days: 90, conditions: ['Must have multiple-entry Schengen visa', 'Must have used the visa at least once in a Schengen country before arrival', '90 days within 180-day period'], confidence: 'high' },
    { destination: 'BA', accessType: 'visa_free', days: 30, conditions: ['Valid multiple-entry Schengen visa required'], confidence: 'high' },
    { destination: 'ME', accessType: 'visa_free', days: 30, conditions: ['Valid Schengen visa required'], confidence: 'high' },
    { destination: 'MK', accessType: 'visa_free', days: 15, conditions: ['Valid Schengen visa required'], confidence: 'high' },
    { destination: 'RS', accessType: 'visa_free', days: 90, conditions: ['Valid Schengen visa required', '90 days within 6-month period'], confidence: 'high' },
    { destination: 'XK', accessType: 'visa_free', days: 15, conditions: ['Valid Schengen visa required'], confidence: 'medium' },
    { destination: 'GE', accessType: 'visa_free', days: 90, conditions: ['Valid Schengen visa or residence permit required'], confidence: 'high' },
    { destination: 'TR', accessType: 'e_visa_simplified', days: 30, conditions: ['E-visa required, available online', 'Valid Schengen visa simplifies e-visa process', 'Some nationalities only'], confidence: 'high' },
    { destination: 'CO', accessType: 'visa_free', days: 90, conditions: ['Valid Schengen visa must have at least 180 days validity on arrival', 'No prior Schengen entry required'], confidence: 'high' },
    { destination: 'PA', accessType: 'visa_free', days: 30, conditions: ['Valid Schengen visa required'], confidence: 'medium' },
    { destination: 'CR', accessType: 'visa_free', days: 30, conditions: ['Valid multiple-entry Schengen visa required'], confidence: 'medium' },
    { destination: 'DO', accessType: 'visa_free', days: 30, conditions: ['Valid Schengen visa required'], confidence: 'medium' },
    { destination: 'RO', accessType: 'visa_free', days: 90, conditions: ['Now part of Schengen as of Jan 2025', 'Schengen visa valid for entry'], confidence: 'high' },
    { destination: 'BG', accessType: 'visa_free', days: 90, conditions: ['Now part of Schengen as of Jan 2025', 'Schengen visa valid for entry'], confidence: 'high' },
    { destination: 'CY', accessType: 'visa_free', days: 90, conditions: ['EU member but NOT in Schengen', 'Accepts Schengen visa for entry', 'Days do NOT count against Schengen 90/180 limit'], confidence: 'medium' },
    { destination: 'AM', accessType: 'visa_free', days: 180, conditions: ['Valid Schengen visa accepted'], confidence: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // SCHENGEN/EU RESIDENCE PERMIT
  // ═══════════════════════════════════════════════════════════════════════════
  'schengen-residence': [
    ...schengenBenefits().map(b => ({
      ...b,
      conditions: ['Valid EU/Schengen residence permit'],
    })),
    { destination: 'AL', accessType: 'visa_free', days: 90, conditions: ['Valid Schengen residence permit required'], confidence: 'high' },
    { destination: 'BA', accessType: 'visa_free', days: 30, conditions: ['Valid Schengen residence permit required'], confidence: 'high' },
    { destination: 'ME', accessType: 'visa_free', days: 30, conditions: ['Valid Schengen residence permit required'], confidence: 'high' },
    { destination: 'RS', accessType: 'visa_free', days: 90, conditions: ['Valid Schengen residence permit required'], confidence: 'high' },
    { destination: 'MK', accessType: 'visa_free', days: 15, conditions: ['Valid Schengen residence permit required'], confidence: 'high' },
    { destination: 'GE', accessType: 'visa_free', days: 90, conditions: ['Valid Schengen residence permit required'], confidence: 'high' },
    { destination: 'CO', accessType: 'visa_free', days: 90, conditions: ['Accepts both temporary and permanent Schengen residence permits'], confidence: 'high' },
    { destination: 'MX', accessType: 'visa_free', days: 180, conditions: ['IMPORTANT: As of 2025, Mexico only accepts PERMANENT residence permits', 'Temporary residence permit holders may be denied boarding or deported'], confidence: 'high' },
    { destination: 'TR', accessType: 'e_visa_simplified', days: 30, conditions: ['E-visa available online with valid Schengen residence permit'], confidence: 'high' },
    { destination: 'PA', accessType: 'visa_free', days: 30, conditions: ['Valid Schengen residence permit required'], confidence: 'medium' },
    { destination: 'CR', accessType: 'visa_free', days: 30, conditions: ['Valid Schengen residence permit required'], confidence: 'medium' },
    { destination: 'CY', accessType: 'visa_free', days: 90, conditions: ['EU member, not in Schengen', 'Accepts Schengen residence permits'], confidence: 'medium' },
    { destination: 'AM', accessType: 'visa_free', days: 180, conditions: ['Valid Schengen residence permit accepted'], confidence: 'medium' },
    { destination: 'IE', accessType: 'visa_free', days: 90, conditions: ['Short Stay Visa Waiver for certain nationalities with EU residence'], confidence: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // UK VISA / BRP
  // ═══════════════════════════════════════════════════════════════════════════
  'uk-visa': [
    { destination: 'AL', accessType: 'visa_free', days: 90, conditions: ['Must have used UK visa once in issuing country before arrival'], confidence: 'high' },
    { destination: 'GE', accessType: 'visa_free', days: 90, conditions: ['90 days within 180-day period', 'Valid UK residence permit required'], confidence: 'high' },
    { destination: 'GI', accessType: 'visa_free', days: 21, conditions: ['Tourism only', 'No work permitted'], confidence: 'high' },
    { destination: 'ME', accessType: 'visa_free', days: 90, conditions: ['Valid UK BRP/eVisa required'], confidence: 'high' },
    { destination: 'RS', accessType: 'visa_free', days: 90, conditions: ['Valid UK BRP/eVisa required'], confidence: 'high' },
    { destination: 'MK', accessType: 'visa_free', days: 15, conditions: ['Valid UK BRP/eVisa required'], confidence: 'medium' },
    { destination: 'MX', accessType: 'visa_free', days: 180, conditions: ['FMM form required', 'One of the longest visa-free stays available'], confidence: 'high' },
    { destination: 'PA', accessType: 'visa_free', days: 90, conditions: ['Valid UK BRP/eVisa required'], confidence: 'medium' },
    { destination: 'BB', accessType: 'visa_free', days: 180, conditions: ['Tourism only'], confidence: 'medium' },
    { destination: 'AI', accessType: 'visa_free', days: 90, conditions: ['Tourism/business', 'Return ticket may be required'], confidence: 'medium' },
    { destination: 'AG', accessType: 'visa_free', days: 30, conditions: ['Tourism only', 'Proof of accommodation required'], confidence: 'medium' },
    { destination: 'AW', accessType: 'visa_free', days: 30, conditions: ['Tourism only', 'ED card application required'], confidence: 'medium' },
    { destination: 'BS', accessType: 'visa_free', days: 90, conditions: ['Tourism/business', 'Return ticket required'], confidence: 'medium' },
    { destination: 'BM', accessType: 'visa_free', days: 90, conditions: ['Tourism/business', 'TA form required'], confidence: 'medium' },
    { destination: 'JM', accessType: 'visa_free', days: 90, conditions: ['Tourism only', 'Return ticket required'], confidence: 'medium' },
    { destination: 'AM', accessType: 'visa_free', days: 90, conditions: ['Passport nationality must not separately require visa for Armenia'], confidence: 'medium' },
    { destination: 'TR', accessType: 'e_visa_simplified', days: 30, conditions: ['E-visa required', 'Most popular BRP destination', 'Apply online'], confidence: 'high' },
    { destination: 'BH', accessType: 'e_visa_simplified', days: 14, conditions: ['E-visa required', 'Apply online before travel'], confidence: 'medium' },
    { destination: 'AE', accessType: 'visa_free', days: 30, conditions: ['Some nationalities excluded'], confidence: 'medium' },
    { destination: 'IE', accessType: 'visa_free', conditions: ['British-Irish Visa Scheme (BIVS) — select nationalities'], confidence: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // CANADIAN PR
  // ═══════════════════════════════════════════════════════════════════════════
  'ca-pr': [
    { destination: 'MX', accessType: 'visa_free', days: 180, conditions: ['FMM tourist card required', 'Valid Canadian PR card and passport'], confidence: 'high' },
    { destination: 'CR', accessType: 'visa_free', days: 30, conditions: ['Valid Canadian PR card required'], confidence: 'high' },
    { destination: 'PA', accessType: 'visa_free', days: 30, conditions: ['Valid Canadian PR card required'], confidence: 'medium' },
    { destination: 'BS', accessType: 'visa_free', days: 30, conditions: ['Valid passport and PR card'], confidence: 'medium' },
    { destination: 'AW', accessType: 'visa_free', days: 90, conditions: ['Dutch Caribbean territory'], confidence: 'medium' },
    { destination: 'CW', accessType: 'visa_free', days: 90, conditions: ['Dutch Caribbean territory'], confidence: 'medium' },
    { destination: 'BQ', accessType: 'visa_free', days: 90, conditions: ['Dutch Caribbean territory'], confidence: 'medium' },
    { destination: 'SX', accessType: 'visa_free', days: 90, conditions: ['Dutch Caribbean territory'], confidence: 'medium' },
    { destination: 'AI', accessType: 'visa_free', days: 90, conditions: ['Valid passport and PR card'], confidence: 'medium' },
    { destination: 'AG', accessType: 'visa_free', days: 30, conditions: ['Valid passport and PR card'], confidence: 'medium' },
    { destination: 'BZ', accessType: 'visa_free', days: 30, conditions: ['Valid passport and PR card'], confidence: 'medium' },
    { destination: 'BM', accessType: 'visa_free', days: 30, conditions: ['Valid passport and PR card'], confidence: 'medium' },
    { destination: 'KY', accessType: 'visa_free', days: 30, conditions: ['Valid passport and PR card'], confidence: 'medium' },
    { destination: 'AM', accessType: 'visa_free', days: 90, conditions: ['Valid passport and Canadian PR card'], confidence: 'medium' },
    { destination: 'GE', accessType: 'visa_free', days: 90, conditions: ['Valid passport and Canadian PR card'], confidence: 'medium' },
    { destination: 'MD', accessType: 'visa_free', days: 90, conditions: ['Valid Canadian PR card required'], confidence: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // CANADIAN VISA
  // ═══════════════════════════════════════════════════════════════════════════
  'ca-visa': [
    { destination: 'MX', accessType: 'visa_free', days: 180, conditions: ['Valid Canadian visa'], confidence: 'medium' },
    { destination: 'CR', accessType: 'visa_free', days: 30, conditions: ['Valid Canadian visa'], confidence: 'medium' },
    { destination: 'PA', accessType: 'visa_free', days: 30, conditions: ['Valid Canadian visa'], confidence: 'medium' },
    { destination: 'GE', accessType: 'visa_free', days: 90, conditions: ['Valid Canadian visa'], confidence: 'medium' },
    { destination: 'GT', accessType: 'visa_free', days: 90, conditions: ['Valid Canadian visa'], confidence: 'medium' },
    { destination: 'HN', accessType: 'visa_free', days: 90, conditions: ['Valid Canadian visa'], confidence: 'medium' },
    { destination: 'SV', accessType: 'visa_free', days: 90, conditions: ['Valid Canadian visa'], confidence: 'medium' },
    { destination: 'NI', accessType: 'visa_free', days: 90, conditions: ['Valid Canadian visa'], confidence: 'medium' },
    { destination: 'AL', accessType: 'visa_free', days: 90, conditions: ['Valid Canadian visa'], confidence: 'medium' },
    { destination: 'DO', accessType: 'visa_free', days: 30, conditions: ['Valid Canadian visa'], confidence: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // AUSTRALIAN PR
  // ═══════════════════════════════════════════════════════════════════════════
  'au-pr': [
    { destination: 'NZ', accessType: 'visa_free', days: 90, conditions: ['Australian PR holders traveling on Australian passport do not need visa or NZeTA', 'Other passport holders with Australian PR need NZeTA'], confidence: 'high' },
    { destination: 'SG', accessType: 'transit_free', days: 4, conditions: ['96-hour Visa Free Transit Facility for certain nationalities (Chinese, Indian) holding valid Australian visa', 'Must transit by air to/from third country'], confidence: 'high' },
    { destination: 'AL', accessType: 'visa_free', days: 90, conditions: ['Valid multiple-entry Australian visa that has been used at least once'], confidence: 'medium' },
    { destination: 'GE', accessType: 'visa_free', days: 90, conditions: ['Valid Australian visa or residence permit required'], confidence: 'medium' },
    { destination: 'TR', accessType: 'e_visa_simplified', days: 30, conditions: ['E-visa available for holders of valid Australian visa'], confidence: 'medium' },
    { destination: 'MX', accessType: 'visa_free', days: 180, conditions: ['Valid Australian PR accepted', 'FMM tourist card required'], confidence: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // UAE RESIDENCE
  // ═══════════════════════════════════════════════════════════════════════════
  'uae-residence': [
    { destination: 'GE', accessType: 'visa_free', days: 90, conditions: ['Must have multiple-entry UAE residence permit valid for at least 1 year on date of entry', 'Stricter rules from May 2025'], confidence: 'high' },
    { destination: 'OM', accessType: 'visa_free', days: 14, conditions: ['UAE residents can enter visa-free for 14 days'], confidence: 'high' },
    { destination: 'TR', accessType: 'visa_free', days: 90, conditions: ['UAE residents enjoy visa-free access', '90 days within 180-day period'], confidence: 'high' },
    { destination: 'AL', accessType: 'visa_free', days: 90, conditions: ['Valid UAE residence permit required'], confidence: 'medium' },
    { destination: 'BA', accessType: 'visa_free', days: 30, conditions: ['Valid UAE residence permit required'], confidence: 'medium' },
    { destination: 'RS', accessType: 'visa_free', days: 30, conditions: ['Valid UAE residence permit required'], confidence: 'medium' },
    { destination: 'ME', accessType: 'visa_free', days: 30, conditions: ['Valid UAE residence permit required'], confidence: 'medium' },
    { destination: 'AM', accessType: 'visa_free', days: 90, conditions: ['Valid UAE residence permit and passport'], confidence: 'medium' },
    { destination: 'AZ', accessType: 'e_visa_simplified', days: 30, conditions: ['E-visa available for UAE residents'], confidence: 'medium' },
    { destination: 'BH', accessType: 'visa_free', days: 14, conditions: ['GCC resident benefit', 'Inter-GCC travel facilitated'], confidence: 'high' },
    { destination: 'KW', accessType: 'visa_free', days: 90, conditions: ['GCC resident benefit', 'Some profession restrictions may apply'], confidence: 'medium' },
    { destination: 'QA', accessType: 'visa_free', days: 30, conditions: ['GCC resident benefit'], confidence: 'medium' },
    { destination: 'SA', accessType: 'e_visa_simplified', days: 90, conditions: ['E-visa available for GCC residents'], confidence: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // JAPAN VISA
  // ═══════════════════════════════════════════════════════════════════════════
  'jp-visa': [
    { destination: 'AL', accessType: 'visa_free', days: 90, conditions: ['Valid multiple-entry Japan visa that has been used at least once'], confidence: 'medium' },
    { destination: 'GE', accessType: 'visa_free', days: 90, conditions: ['Valid Japan visa or residence permit required'], confidence: 'medium' },
    { destination: 'TR', accessType: 'e_visa_simplified', days: 30, conditions: ['E-visa available for Japan visa holders'], confidence: 'medium' },
    { destination: 'SG', accessType: 'transit_free', days: 4, conditions: ['96-hour VFTF for Chinese/Indian nationals with valid Japan visa, transiting by air'], confidence: 'high' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // GCC RESIDENCE (Saudi Arabia, Qatar, Oman, Bahrain, Kuwait)
  // ═══════════════════════════════════════════════════════════════════════════
  'gcc-residence': [
    // Intra-GCC benefits
    { destination: 'GE', accessType: 'visa_free', days: 365, conditions: ['Must have multiple-entry GCC residence permit valid for at least 1 year', 'Stricter rules from May 2025 including new stay limits for certain nationalities'], confidence: 'high' },
    { destination: 'TR', accessType: 'e_visa_simplified', days: 30, conditions: ['E-visa available online for GCC residents', 'Simplified application'], confidence: 'high' },
    { destination: 'AL', accessType: 'visa_free', days: 90, conditions: ['Valid GCC residence permit required', 'Must have been used'], confidence: 'medium' },
    { destination: 'BA', accessType: 'visa_free', days: 30, conditions: ['Valid GCC residence permit required'], confidence: 'medium' },
    { destination: 'AE', accessType: 'visa_free', days: 30, conditions: ['Inter-GCC travel', 'GCC residents from other GCC states can enter'], confidence: 'high' },
    { destination: 'BH', accessType: 'visa_free', days: 14, conditions: ['Inter-GCC travel facilitated'], confidence: 'high' },
    { destination: 'KW', accessType: 'visa_free', days: 90, conditions: ['Inter-GCC travel', 'GCC residents can enter with GCC ID card', 'Some profession restrictions for Oman'], confidence: 'high' },
    { destination: 'OM', accessType: 'visa_free', days: 14, conditions: ['Approved professions list may apply', 'Check current requirements'], confidence: 'medium' },
    { destination: 'QA', accessType: 'visa_free', days: 30, conditions: ['Inter-GCC travel facilitated'], confidence: 'high' },
    { destination: 'SA', accessType: 'e_visa_simplified', days: 90, conditions: ['E-visa available for GCC residents', 'May have profession/salary requirements'], confidence: 'medium' },
    { destination: 'EG', accessType: 'visa_on_arrival', days: 30, conditions: ['Visa on arrival for GCC residents'], confidence: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // SINGAPORE PERMIT
  // ═══════════════════════════════════════════════════════════════════════════
  'sg-visa': [
    { destination: 'KR', accessType: 'transit_free', days: 30, conditions: ['Transit with Singapore work permit'], confidence: 'medium' },
    { destination: 'GE', accessType: 'visa_free', days: 90, conditions: ['Singapore residence permit'], confidence: 'medium' },
    { destination: 'TR', accessType: 'e_visa_simplified', days: 30, conditions: ['Singapore permit enables e-Visa'], confidence: 'medium' },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // APEC BUSINESS TRAVEL CARD
  // ═══════════════════════════════════════════════════════════════════════════
  'apec-card': [
    // APEC members that participate in ABTC scheme
    { destination: 'AU', accessType: 'visa_free', days: 90, conditions: ['Pre-cleared ABTC holders', 'Business purposes', 'Fast-track immigration lanes'], confidence: 'high' },
    { destination: 'BN', accessType: 'visa_free', days: 90, conditions: ['Pre-cleared ABTC holders', 'Business purposes'], confidence: 'high' },
    { destination: 'CL', accessType: 'visa_free', days: 90, conditions: ['Pre-cleared ABTC holders', 'Business purposes'], confidence: 'high' },
    { destination: 'CN', accessType: 'visa_free', days: 60, conditions: ['Pre-cleared ABTC holders', 'Business purposes'], confidence: 'high' },
    { destination: 'HK', accessType: 'visa_free', days: 60, conditions: ['Pre-cleared ABTC holders', 'Business purposes'], confidence: 'high' },
    { destination: 'ID', accessType: 'visa_free', days: 60, conditions: ['Pre-cleared ABTC holders', 'Business purposes'], confidence: 'high' },
    { destination: 'JP', accessType: 'visa_free', days: 90, conditions: ['Pre-cleared ABTC holders', 'Business purposes', 'Fast-track lanes at major airports'], confidence: 'high' },
    { destination: 'KR', accessType: 'visa_free', days: 90, conditions: ['Pre-cleared ABTC holders', 'Business purposes'], confidence: 'high' },
    { destination: 'MY', accessType: 'visa_free', days: 60, conditions: ['Pre-cleared ABTC holders', 'Business purposes'], confidence: 'high' },
    { destination: 'MX', accessType: 'visa_free', days: 90, conditions: ['Pre-cleared ABTC holders', 'Business purposes'], confidence: 'high' },
    { destination: 'NZ', accessType: 'visa_free', days: 90, conditions: ['Pre-cleared ABTC holders', 'Business purposes'], confidence: 'high' },
    { destination: 'PG', accessType: 'visa_free', days: 60, conditions: ['Pre-cleared ABTC holders', 'Business purposes'], confidence: 'high' },
    { destination: 'PE', accessType: 'visa_free', days: 90, conditions: ['Pre-cleared ABTC holders', 'Business purposes'], confidence: 'high' },
    { destination: 'PH', accessType: 'visa_free', days: 59, conditions: ['Pre-cleared ABTC holders', 'Business purposes'], confidence: 'high' },
    { destination: 'RU', accessType: 'visa_free', days: 90, conditions: ['Pre-cleared ABTC holders', 'NOTE: Participation may be affected by sanctions', 'Verify current status'], confidence: 'medium' },
    { destination: 'SG', accessType: 'visa_free', days: 60, conditions: ['Pre-cleared ABTC holders', 'Business purposes'], confidence: 'high' },
    { destination: 'TW', accessType: 'visa_free', days: 90, conditions: ['Pre-cleared ABTC holders', 'Business purposes'], confidence: 'high' },
    { destination: 'TH', accessType: 'visa_free', days: 90, conditions: ['Pre-cleared ABTC holders', 'Business purposes'], confidence: 'high' },
    { destination: 'VN', accessType: 'visa_free', days: 60, conditions: ['Pre-cleared ABTC holders', 'Business purposes'], confidence: 'high' },
  ],
};

// ─── Calculation Logic ───────────────────────────────────────────────────────

export type AccessSource = 'passport' | 'visa_benefit';

export interface EnhancedResult {
  destination: string;
  category: import('./visaUtils').VisaCategory;
  days?: number;
  source: AccessSource;
  /** Which visa holding unlocked this (null if passport-based) */
  visaHoldingId?: string;
  /** Conditions for visa-based access */
  conditions?: string[];
  /** Confidence level for visa-based access */
  confidence?: ConfidenceLevel;
}

/**
 * Map BenefitAccessType to VisaCategory for unified display
 */
function benefitToCategory(accessType: BenefitAccessType): import('./visaUtils').VisaCategory {
  switch (accessType) {
    case 'visa_free': return 'visa-free';
    case 'visa_on_arrival': return 'visa-on-arrival';
    case 'e_visa_simplified': return 'e-visa';
    case 'transit_free': return 'visa-free';
  }
}

const catPriority: Record<string, number> = {
  'visa-free': 0, 'eta': 1, 'e-visa': 2, 'visa-on-arrival': 3,
  'visa-required': 4, 'no-admission': 5, 'self': 6,
};

/**
 * Get additional destinations unlocked by visa holdings that aren't
 * already accessible (or are better access) through passports.
 */
export function getVisaBenefitResults(
  visaHoldings: VisaHolding[],
  passportResults: Map<string, { category: import('./visaUtils').VisaCategory; days?: number }>
): EnhancedResult[] {
  const results: EnhancedResult[] = [];
  const bestByDest = new Map<string, EnhancedResult>();

  for (const holding of visaHoldings) {
    const benefits = benefitsDatabase[holding.typeId];
    if (!benefits) continue;

    for (const benefit of benefits) {
      const passportAccess = passportResults.get(benefit.destination);
      const benefitCategory = benefitToCategory(benefit.accessType);
      const benefitPri = catPriority[benefitCategory] ?? 6;

      // Skip if passport already gives equal or better access
      if (passportAccess) {
        const passportPri = catPriority[passportAccess.category] ?? 6;
        if (passportPri <= benefitPri) continue;
      }

      const result: EnhancedResult = {
        destination: benefit.destination,
        category: benefitCategory,
        days: benefit.days,
        source: 'visa_benefit',
        visaHoldingId: holding.typeId,
        conditions: benefit.conditions,
        confidence: benefit.confidence,
      };

      // Keep best benefit per destination
      const existing = bestByDest.get(benefit.destination);
      if (!existing || benefitPri < (catPriority[existing.category] ?? 6)) {
        bestByDest.set(benefit.destination, result);
      }
    }
  }

  bestByDest.forEach(r => results.push(r));
  return results;
}

/**
 * Count of new destinations unlocked per visa holding
 */
export function getVisaBenefitSummary(
  visaHoldings: VisaHolding[],
  passportResults: Map<string, { category: import('./visaUtils').VisaCategory; days?: number }>
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const holding of visaHoldings) {
    const benefits = benefitsDatabase[holding.typeId];
    if (!benefits) { counts[holding.typeId] = 0; continue; }

    let newDests = 0;
    for (const benefit of benefits) {
      const passportAccess = passportResults.get(benefit.destination);
      const benefitCategory = benefitToCategory(benefit.accessType);
      const benefitPri = catPriority[benefitCategory] ?? 6;

      if (!passportAccess || (catPriority[passportAccess.category] ?? 6) > benefitPri) {
        newDests++;
      }
    }
    counts[holding.typeId] = newDests;
  }

  return counts;
}
