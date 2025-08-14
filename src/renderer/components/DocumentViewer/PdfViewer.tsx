import React, { useEffect, useRef, useState } from 'react'
import { DocumentField } from '@shared/types'
import { FieldOverlay } from './FieldOverlay'
import { Button } from '../ui/button'
import { AlertCircle, Loader2 } from 'lucide-react'

interface PdfViewerProps {
  filePath: string
  currentPage: number
  zoom: number
  showFields: boolean
  fields: DocumentField[]
  onPageChange: (page: number) => void
}

export function PdfViewer({
  filePath,
  currentPage,
  zoom,
  showFields,
  fields,
  onPageChange
}: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfDocument, setPdfDocument] = useState<any>(null)
  const [pageData, setPageData] = useState<any>(null)

  useEffect(() => {
    loadPdf()
  }, [filePath])

  useEffect(() => {
    if (pdfDocument) {
      renderPage()
    }
  }, [pdfDocument, currentPage, zoom])

  const loadPdf = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Dynamically import pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist')
      
      // Set worker path for pdf.js
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

      // Read the PDF file
      const fileBuffer = await window.electronAPI.readFile(filePath)
      const arrayBuffer = fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength
      )

      // Load the PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setPdfDocument(pdf)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load PDF'
      setError(errorMessage)
      console.error('PDF loading failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const renderPage = async () => {
    if (!pdfDocument || !canvasRef.current) return

    try {
      setIsLoading(true)

      const page = await pdfDocument.getPage(currentPage)
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      // Calculate scale based on zoom
      const viewport = page.getViewport({ scale: 1 })
      const scale = (zoom / 100) * (canvas.parentElement?.clientWidth || 800) / viewport.width
      const scaledViewport = page.getViewport({ scale })

      // Set canvas dimensions
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height
      canvas.style.width = `${scaledViewport.width}px`
      canvas.style.height = `${scaledViewport.height}px`

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height)

      // Render the page
      await page.render({
        canvasContext: context,
        viewport: scaledViewport
      }).promise

      setPageData({
        width: scaledViewport.width,
        height: scaledViewport.height,
        scale
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to render page'
      setError(errorMessage)
      console.error('Page rendering failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    loadPdf()
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <p className="font-medium text-destructive">Failed to load PDF</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" onClick={handleRetry}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="relative flex justify-center overflow-auto bg-gray-100 dark:bg-gray-800"
      style={{ minHeight: '400px' }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Rendering page...</span>
          </div>
        </div>
      )}

      <div className="relative p-4">
        <canvas
          ref={canvasRef}
          className="border shadow-lg bg-white"
          style={{ display: 'block' }}
        />

        {/* Field Overlay */}
        {showFields && pageData && fields.length > 0 && (
          <FieldOverlay
            fields={fields}
            pageData={pageData}
            currentPage={currentPage}
          />
        )}
      </div>
    </div>
  )
}