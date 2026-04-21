"use client"

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { normalizeLocale, type AppLocale } from '@/lib/i18n'

type LanguageSwitcherProps = {
  className?: string
  redirectToLogin?: boolean
}

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

export default function LanguageSwitcher({ className, redirectToLogin = false }: LanguageSwitcherProps) {
  const t = useTranslations('Common')
  const router = useRouter()
  const locale = normalizeLocale(useLocale())
  const [isPending, startTransition] = useTransition()

  const setLocale = (nextLocale: AppLocale) => {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`
  }

  const handleChange = (value: string) => {
    const nextLocale = normalizeLocale(value)
    setLocale(nextLocale)

    if (redirectToLogin) {
      router.push('/auth/login')
      return
    }

    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <label className={className || 'inline-flex items-center gap-2 text-sm'}>
      <span>{t('language')}</span>
      <select
        aria-label={t('language')}
        value={locale}
        onChange={(event) => handleChange(event.target.value)}
        disabled={isPending}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
      >
        <option value="en">{t('english')}</option>
        <option value="es">{t('spanish')}</option>
      </select>
    </label>
  )
}
