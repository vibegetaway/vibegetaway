import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

countries.registerLocale(enLocale);

function isUpperAlpha(code: string, len: number) {
  return code.length === len && /^[A-Z]+$/.test(code)
}

export function getCountryName(countryCode: string): string {
  if (!countryCode) return countryCode
  const trimmed = countryCode.trim()
  if (!trimmed) return countryCode

  // If it's not an ISO-ish code, assume it's already a display name.
  if (!isUpperAlpha(trimmed, 3) && !isUpperAlpha(trimmed, 2)) return trimmed

  if (isUpperAlpha(trimmed, 3)) {
    const alpha2 = countries.alpha3ToAlpha2(trimmed)
    if (!alpha2) return trimmed
    return countries.getName(alpha2, 'en') || trimmed
  }

  // alpha-2
  return countries.getName(trimmed, 'en') || trimmed
}

