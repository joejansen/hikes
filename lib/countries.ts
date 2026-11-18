// Country name (as written in data/hikes.yaml) -> ISO 3166-1 alpha-2 code.
// The schema rejects any country missing from this table, so a new country
// fails the build instead of silently rendering a placeholder flag.
export const COUNTRY_CODES: Record<string, string> = {
  Albania: "AL",
  Argentina: "AR",
  Australia: "AU",
  Austria: "AT",
  Belize: "BZ",
  Bhutan: "BT",
  Bolivia: "BO",
  "Bosnia and Herzegovina": "BA",
  Brazil: "BR",
  Bulgaria: "BG",
  Canada: "CA",
  "Cape Verde": "CV",
  "Caribbean Netherlands": "BQ",
  Chile: "CL",
  China: "CN",
  Colombia: "CO",
  "Costa Rica": "CR",
  Croatia: "HR",
  Cuba: "CU",
  Dominica: "DM",
  "Dominican Republic": "DO",
  Ecuador: "EC",
  Egypt: "EG",
  "El Salvador": "SV",
  Ethiopia: "ET",
  France: "FR",
  Georgia: "GE",
  Germany: "DE",
  Greece: "GR",
  Guatemala: "GT",
  Honduras: "HN",
  "Hong Kong": "HK",
  Iceland: "IS",
  India: "IN",
  Indonesia: "ID",
  Ireland: "IE",
  Italy: "IT",
  Jamaica: "JM",
  Japan: "JP",
  Jordan: "JO",
  Kazakhstan: "KZ",
  Kosovo: "XK",
  Kyrgyzstan: "KG",
  Laos: "LA",
  Madagascar: "MG",
  Malawi: "MW",
  Malaysia: "MY",
  Mexico: "MX",
  Mongolia: "MN",
  Montenegro: "ME",
  Morocco: "MA",
  Myanmar: "MM",
  Nepal: "NP",
  "New Zealand": "NZ",
  Nicaragua: "NI",
  "North Macedonia": "MK",
  Norway: "NO",
  Pakistan: "PK",
  Panama: "PA",
  Peru: "PE",
  Philippines: "PH",
  Poland: "PL",
  Portugal: "PT",
  Romania: "RO",
  "Réunion (France)": "RE",
  "Saint Kitts and Nevis": "KN",
  "Saint Lucia": "LC",
  Slovakia: "SK",
  Slovenia: "SI",
  "South Africa": "ZA",
  "South Korea": "KR",
  Spain: "ES",
  Sweden: "SE",
  Switzerland: "CH",
  Taiwan: "TW",
  Tajikistan: "TJ",
  Tanzania: "TZ",
  Thailand: "TH",
  "Trinidad and Tobago": "TT",
  Turkey: "TR",
  Uganda: "UG",
  "United Kingdom": "GB",
  "United States": "US",
  Uzbekistan: "UZ",
  Vietnam: "VN",
};

const REGIONAL_INDICATOR_A = 0x1f1e6;

export function flagFromCode(code: string): string {
  return [...code.toUpperCase()]
    .map((c) =>
      String.fromCodePoint(REGIONAL_INDICATOR_A + c.charCodeAt(0) - 65),
    )
    .join("");
}

export function isKnownCountry(country: string): boolean {
  return Object.hasOwn(COUNTRY_CODES, country);
}

export function countryFlag(country: string): string {
  const code = COUNTRY_CODES[country];
  return code ? flagFromCode(code) : "";
}
