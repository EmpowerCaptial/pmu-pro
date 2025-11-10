"use client"

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import workerMeta from '@/generated/pdfjs-worker-version.json'

const workerExtension = workerMeta.extension ?? 'js'
const workerSrc = `/pdf.worker.${workerMeta.version}.min.${workerExtension}`
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

interface TrainingPdfViewerProps {
  fileUrl: string | null
  pageNumber: number
  onDocumentLoadSuccess?: (numPages: number) => void
  onDocumentLoadError?: (error: Error) => void
}

export const TrainingPdfViewer = memo(function TrainingPdfViewer({
  fileUrl,
  pageNumber,
  onDocumentLoadSuccess,
  onDocumentLoadError
}: TrainingPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [renderWidth, setRenderWidth] = useState<number>(760)

  useEffect(() => {
    const updateWidth = () => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.offsetWidth
      if (!containerWidth) return

      const nextWidth = Math.min(760, Math.max(320, containerWidth - 16))
      setRenderWidth(nextWidth)
    }

    updateWidth()

    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      const observer = new ResizeObserver(() => updateWidth())
      observer.observe(containerRef.current)
      return () => observer.disconnect()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateWidth)
      return () => window.removeEventListener('resize', updateWidth)
    }

    return
  }, [])

  const file = useMemo(() => {
    if (!fileUrl) {
      return null
    }
    return { url: fileUrl }
  }, [fileUrl])

  if (!file) {
    return null
  }

  return (
    <div ref={containerRef} className="w-full overflow-x-auto">
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => {
          onDocumentLoadSuccess?.(numPages)
        }}
        onLoadError={(error) => {
          onDocumentLoadError?.(error as Error)
        }}
        className="flex justify-center"
        loading={
          <div className="flex items-center justify-center p-6 text-sm text-gray-600">
            Loading PDF…
          </div>
        }
      >
        <Page
          pageNumber={pageNumber}
          width={renderWidth}
          renderAnnotationLayer={false}
          renderTextLayer
          loading={
            <div className="flex items-center justify-center p-6 text-sm text-gray-600">
              Rendering page…
            </div>
          }
        />
      </Document>
    </div>
  )
})
