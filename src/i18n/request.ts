import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import { DEFAULT_LOCALE, normalizeLocale } from '@/lib/i18n'

export default getRequestConfig(async () => {
  const locale = normalizeLocale(cookies().get('NEXT_LOCALE')?.value || DEFAULT_LOCALE)

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  }
})
