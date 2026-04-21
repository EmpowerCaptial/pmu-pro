export const SUPPORTED_LOCALES = ['en', 'es'] as const

export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'en'

export function isSupportedLocale(value: string | undefined | null): value is AppLocale {
  return !!value && SUPPORTED_LOCALES.includes(value as AppLocale)
}

export function normalizeLocale(value: string | undefined | null): AppLocale {
  if (isSupportedLocale(value)) {
    return value
  }
  return DEFAULT_LOCALE
}
