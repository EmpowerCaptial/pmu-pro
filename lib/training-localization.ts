import type { AppLocale } from '@/lib/i18n'

export type LocalizedField = {
  en: string
  es?: string
}

export type LocalizedLessonSection = {
  heading: LocalizedField
  body: LocalizedField
}

export type LocalizedLesson = {
  title: LocalizedField
  description: LocalizedField
  sections: LocalizedLessonSection[]
}

export function getLocalized(field: LocalizedField, locale: AppLocale): string {
  return field[locale] || field.en
}

export const SPANISH_CONTENT_FALLBACK = 'Este contenido esta disponible actualmente en ingles.'

type MaybeLocalizedField = string | LocalizedField | null | undefined

export function hasSpanishTranslation(field: MaybeLocalizedField): boolean {
  if (!field) return false
  if (typeof field === 'string') return false
  return typeof field.es === 'string' && field.es.trim().length > 0
}

export function shouldShowSpanishFallback(locale: AppLocale, fields: MaybeLocalizedField[]): boolean {
  if (locale !== 'es') return false
  return fields.some(field => !hasSpanishTranslation(field))
}
