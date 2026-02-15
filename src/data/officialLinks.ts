// Official government visa information and embassy/consulate finder URLs
// Only verified, real government URLs are included

export interface OfficialLink {
  visaInfo?: string;
  embassy?: string;
}

export const officialLinks: Record<string, OfficialLink> = {
  // United States
  US: {
    visaInfo: "https://travel.state.gov/content/travel/en/us-visas.html",
    embassy: "https://www.usembassy.gov/",
  },
  // United Kingdom
  GB: {
    visaInfo: "https://www.gov.uk/check-uk-visa",
    embassy: "https://www.gov.uk/world/embassies",
  },
  // Germany
  DE: {
    visaInfo: "https://www.auswaertiges-amt.de/en/visa-service",
    embassy: "https://www.auswaertiges-amt.de/en/about-us/auslandsvertretungen",
  },
  // France
  FR: {
    visaInfo: "https://france-visas.gouv.fr/en/visa-wizard",
    embassy: "https://www.diplomatie.gouv.fr/en/french-foreign-policy/security-disarmament-and-non-proliferation/our-alliances-and-cooperations/",
  },
  // Japan
  JP: {
    visaInfo: "https://www.mofa.go.jp/j_info/visit/visa/",
    embassy: "https://www.mofa.go.jp/about/emb_cons/over/index.html",
  },
  // South Korea
  KR: {
    visaInfo: "https://www.visa.go.kr/",
    embassy: "https://www.mofa.go.kr/eng/overseas/list.do",
  },
  // India
  IN: {
    visaInfo: "https://indianvisaonline.gov.in/",
    embassy: "https://www.mea.gov.in/indian-missions-abroad.htm",
  },
  // China
  CN: {
    visaInfo: "https://en.nia.gov.cn/",
    embassy: "https://www.mfa.gov.cn/eng/wjb_663304/zwjg_665342/",
  },
  // Brazil
  BR: {
    visaInfo: "https://www.gov.br/mre/pt-br/assuntos/portal-consular/vistos",
    embassy: "https://www.gov.br/mre/pt-br/assuntos/representacoes/estrangeiras",
  },
  // United Arab Emirates
  AE: {
    visaInfo: "https://u.ae/en/information-and-services/visa-and-emirates-id",
    embassy: "https://www.mofa.gov.ae/en/missions",
  },
  // Singapore
  SG: {
    visaInfo: "https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements",
    embassy: "https://www.mfa.gov.sg/Overseas-Mission",
  },
  // Thailand
  TH: {
    visaInfo: "https://www.thaievisa.go.th/",
    embassy: "https://www.mfa.go.th/en/page/thai-missions-abroad",
  },
  // Turkey
  TR: {
    visaInfo: "https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa",
    embassy: "https://www.mfa.gov.tr/turkish-representations.en.mfa",
  },
  // Italy
  IT: {
    visaInfo: "https://vistoperitalia.esteri.it/",
    embassy: "https://www.esteri.it/en/ministero/la-rete-diplomatica/",
  },
  // Spain
  ES: {
    visaInfo: "https://www.exteriores.gob.es/en/ServiciosAlCiudadano/Paginas/Visados.aspx",
    embassy: "https://www.exteriores.gob.es/en/EmbajadasConsulados/Paginas/index.aspx",
  },
  // Australia
  AU: {
    visaInfo: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-finder",
    embassy: "https://www.dfat.gov.au/about-us/our-locations/missions",
  },
  // Canada
  CA: {
    visaInfo: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html",
    embassy: "https://www.international.gc.ca/world-monde/country-pays/index.aspx?lang=eng",
  },
  // New Zealand
  NZ: {
    visaInfo: "https://www.immigration.govt.nz/visas/",
    embassy: "https://www.mfat.govt.nz/en/embassies/",
  },
  // Malaysia
  MY: {
    visaInfo: "https://www.imi.gov.my/index.php/en/main-services/visa/",
    embassy: "https://www.kln.gov.my/web/guest/malaysian-mission",
  },
  // Portugal
  PT: {
    visaInfo: "https://vistos.mne.gov.pt/en/",
    embassy: "https://www.portaldascomunidades.mne.gov.pt/en/",
  },
  // Greece
  GR: {
    visaInfo: "https://www.mfa.gr/en/services/visas-for-foreigners-traveling-to-greece/",
    embassy: "https://www.mfa.gr/en/appendix/greek-missions-abroad/",
  },
  // Mexico
  MX: {
    visaInfo: "https://www.inm.gob.mx/sae/publico/en/solicitud.html",
    embassy: "https://directorio.sre.gob.mx/index.php/embajadas-de-mexico-en-el-exterior",
  },
  // Egypt
  EG: {
    visaInfo: "https://visa2egypt.gov.eg/",
    embassy: "https://www.mfa.gov.eg/English/EgyptianMissionsAbroad/Pages/default.aspx",
  },
  // South Africa
  ZA: {
    visaInfo: "https://www.dha.gov.za/index.php/immigration-services/types-of-visas",
    embassy: "https://www.dirco.gov.za/foreign/sa_abroad/index.htm",
  },
  // Indonesia
  ID: {
    visaInfo: "https://evisa.imigrasi.go.id/",
    embassy: "https://kemlu.go.id/portal/en/page/3/perwakilan_ri",
  },
  // Vietnam
  VN: {
    visaInfo: "https://evisa.gov.vn/",
    embassy: "https://www.mofa.gov.vn/en/cn_vakv/",
  },
  // Philippines
  PH: {
    visaInfo: "https://consular.dfa.gov.ph/services/visa/visa-general-info",
    embassy: "https://dfa.gov.ph/list-of-philippine-foreign-service-posts",
  },
  // Saudi Arabia
  SA: {
    visaInfo: "https://visa.visitsaudi.com/",
    embassy: "https://www.mofa.gov.sa/en/KingdomForeignPolicy/SaudiMissionsAbroad/Pages/default.aspx",
  },
  // Qatar
  QA: {
    visaInfo: "https://www.moi.gov.qa/site/english/departments/GeneralPassportDept/index.html",
    embassy: "https://www.mofa.gov.qa/en/the-ministry/qatar-embassies",
  },
  // Netherlands
  NL: {
    visaInfo: "https://www.netherlandsandyou.nl/travel-and-residence/visas-for-the-netherlands",
    embassy: "https://www.netherlandsandyou.nl/your-country-and-the-netherlands",
  },
  // Belgium
  BE: {
    visaInfo: "https://diplomatie.belgium.be/en/travel-belgium/visa-belgium",
    embassy: "https://diplomatie.belgium.be/en/embassies-and-consulates",
  },
  // Switzerland
  CH: {
    visaInfo: "https://www.ch.ch/en/foreign-nationals-in-switzerland/entry-and-stay-in-switzerland/visas-for-foreign-nationals/",
    embassy: "https://www.eda.admin.ch/eda/en/fdfa/representations-and-travel-advice.html",
  },
  // Austria
  AT: {
    visaInfo: "https://www.bmeia.gv.at/en/travel-stay/entry-and-residence-in-austria/",
    embassy: "https://www.bmeia.gv.at/en/embassies-consulates/",
  },
  // Sweden
  SE: {
    visaInfo: "https://www.migrationsverket.se/en/you-want-to-apply/visiting-sweden.html",
    embassy: "https://www.swedenabroad.se/en/",
  },
  // Norway
  NO: {
    visaInfo: "https://www.udi.no/en/want-to-apply/visit-and-holiday/",
    embassy: "https://www.norway.no/en/missions/",
  },
  // Denmark
  DK: {
    visaInfo: "https://um.dk/en/travel-and-residence/how-to-apply-for-a-visa",
    embassy: "https://um.dk/en/about-us/organisation/danish-missions-abroad",
  },
  // Finland
  FI: {
    visaInfo: "https://um.fi/visa-to-visit-finland",
    embassy: "https://um.fi/embassies-and-consulates-general",
  },
  // Ireland
  IE: {
    visaInfo: "https://www.ireland.ie/en/dfa/visas-for-ireland/",
    embassy: "https://www.ireland.ie/en/dfa/embassies/",
  },
  // Poland
  PL: {
    visaInfo: "https://www.gov.pl/web/diplomacy/visas",
    embassy: "https://www.gov.pl/web/diplomacy/polish-missions-abroad",
  },
  // Czech Republic
  CZ: {
    visaInfo: "https://mzv.gov.cz/jnp/en/information_for_aliens/types_of_visas/index.html",
    embassy: "https://mzv.gov.cz/jnp/en/diplomatic_missions/index.html",
  },
  // Hungary
  HU: {
    visaInfo: "https://konzuliszolgalat.kormany.hu/en/visa",
    embassy: "https://konzuliszolgalat.kormany.hu/en/hungarian-missions-abroad",
  },
  // Romania
  RO: {
    visaInfo: "https://www.mae.ro/en/node/2035",
    embassy: "https://www.mae.ro/en/node/2011",
  },
  // Croatia
  HR: {
    visaInfo: "https://mvep.gov.hr/services-for-citizens/visas-for-croatia-22444/22444",
    embassy: "https://mvep.gov.hr/embassy-and-consulates/diplomatic-missions-and-consular-offices-of-the-republic-of-croatia-abroad/22802",
  },
  // Bulgaria
  BG: {
    visaInfo: "https://www.mfa.bg/en/services-travel/consular-services/travel-bulgaria/visa-bulgaria",
    embassy: "https://www.mfa.bg/en/embassyinfo",
  },
  // Serbia
  RS: {
    visaInfo: "https://www.mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
    embassy: "https://www.mfa.gov.rs/en/diplomatic-missions/serbian-diplomatic-missions",
  },
  // Ukraine
  UA: {
    visaInfo: "https://evisa.mfa.gov.ua/",
    embassy: "https://mfa.gov.ua/en/about-ukraine/diplomatic-missions",
  },
  // Georgia
  GE: {
    visaInfo: "https://www.evisa.gov.ge/",
    embassy: "https://mfa.gov.ge/MainNav/Embassies",
  },
  // Armenia
  AM: {
    visaInfo: "https://evisa.mfa.am/",
    embassy: "https://www.mfa.am/en/diplomatic-missions",
  },
  // Azerbaijan
  AZ: {
    visaInfo: "https://evisa.gov.az/en/",
    embassy: "https://www.mfa.gov.az/en/category/azerbaijani-missions-abroad",
  },
  // Kazakhstan
  KZ: {
    visaInfo: "https://egov.kz/cms/en/articles/for_foreigners/visa_regime_for_foreigners",
    embassy: "https://www.gov.kz/memleket/entities/mfa/activities/missions?lang=en",
  },
  // Uzbekistan
  UZ: {
    visaInfo: "https://e-visa.gov.uz/",
    embassy: "https://mfa.uz/en/embassy",
  },
};
