type SpanishFallbackNoticeProps = {
  className?: string
}

export function SpanishFallbackNotice({ className }: SpanishFallbackNoticeProps) {
  return (
    <div className={className || 'rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800'}>
      Este contenido está disponible actualmente en inglés.
    </div>
  )
}
