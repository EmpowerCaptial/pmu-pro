"use client"

import { memo, useMemo } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

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
        width={760}
        renderAnnotationLayer={false}
        renderTextLayer
        loading={
          <div className="flex items-center justify-center p-6 text-sm text-gray-600">
            Rendering page…
          </div>
        }
      />
    </Document>
  )
})
