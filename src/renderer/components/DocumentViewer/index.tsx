import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, FileText, AlertCircle } from 'lucide-react'
import { PdfViewer } from './PdfViewer'
import { WordViewer } from './WordViewer'
import { ExcelViewer } from './ExcelViewer'
import { ViewerControls } from './ViewerControls'
import { DocumentField, ExcelConfiguration } from '@shared/types'

interface DocumentViewerProps {
  filePath: string | null
  className?: string
  onFieldsDetected?: (fields: DocumentField[]) => void
  onError?: (error: string) => void
  onExcelConfigurationComplete?: (configuration: ExcelConfiguration) => void
}

interface FileInfo {
  path: string
  name: string
  extension: string
  size: number
  type: string
}

interface AnalysisResult {
  success: boolean
  fields: DocumentField[]
  pages?: number
  error?: string
  metadata?: Record<string, any>
}

export function DocumentViewer({ filePath, className, onFieldsDetected, onError, onExcelConfigurationComplete }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [showFields, setShowFields] = useState(true)

  useEffect(() => {
    if (filePath) {
      analyzeDocument()
    } else {
      setAnalysisResult(null)
      setFileInfo(null)
      setCurrentPage(1)
      setZoom(100)
    }
  }, [filePath])

  const analyzeDocument = async () => {
    if (!filePath) return

    setIsLoading(true)
    try {
      // Get file info first
      const info = await window.electronAPI.getFileInfo(filePath)
      setFileInfo(info)

      // Check if file type is supported
      const supportCheck = await window.electronAPI.isDocumentSupported(filePath)
      if (!supportCheck.success || !supportCheck.supported) {
        throw new Error(`Unsupported file type: ${info.extension}`)
      }

      // Analyze document
      const result = await window.electronAPI.analyzeDocument(filePath, {
        detectFields: true,
        extractText: false,
        preserveFormatting: true
      })

      setAnalysisResult(result)

      if (result.success && result.fields && onFieldsDetected) {
        console.log('DocumentViewer received fields:', result.fields)
        console.log('Fields with options:', result.fields.filter(f => f.options && f.options.length > 0))
        onFieldsDetected(result.fields)
      }

      if (!result.success && result.error && onError) {
        onError(result.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze document'
      const errorResult: AnalysisResult = {
        success: false,
        fields: [],
        error: errorMessage
      }
      setAnalysisResult(errorResult)
      
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25))
  }

  const handleResetZoom = () => {
    setZoom(100)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRetryAnalysis = () => {
    analyzeDocument()
  }

  const renderViewer = () => {
    if (!filePath || !fileInfo || !analysisResult) return null

    const commonProps = {
      filePath,
      currentPage,
      zoom,
      showFields,
      fields: analysisResult.fields || [],
      onPageChange: handlePageChange,
      onConfigurationComplete: onExcelConfigurationComplete
    }

    switch (fileInfo.type) {
      case 'pdf':
        return <PdfViewer {...commonProps} />
      case 'word':
        return <WordViewer {...commonProps} />
      case 'excel':
        return <ExcelViewer {...commonProps} />
      default:
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-2" />
              <p>Preview not available for this file type</p>
            </div>
          </div>
        )
    }
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {/* Controls */}
        {filePath && fileInfo && (
          <ViewerControls
            fileName={fileInfo.name}
            fileType={fileInfo.type}
            currentPage={currentPage}
            totalPages={analysisResult?.pages || 1}
            zoom={zoom}
            showFields={showFields}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
            onToggleFields={() => setShowFields(!showFields)}
            onPageChange={handlePageChange}
          />
        )}

        {/* Content */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Analyzing document...</span>
              </div>
            </div>
          )}

          {!filePath && (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <p>No document selected</p>
                <p className="text-sm">Open a document to start mapping fields</p>
              </div>
            </div>
          )}

          {filePath && analysisResult?.success === false && (
            <div className="p-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>{analysisResult.error}</p>
                    <Button variant="outline" size="sm" onClick={handleRetryAnalysis}>
                      Retry Analysis
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {filePath && analysisResult?.success && (
            <div className="min-h-64">
              {renderViewer()}
            </div>
          )}

          {/* Field Statistics */}
          {analysisResult?.success && analysisResult.fields.length > 0 && (
            <div className="border-t p-4 bg-muted/20">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {analysisResult.fields.length} field{analysisResult.fields.length !== 1 ? 's' : ''} detected
                </span>
                {analysisResult.metadata?.format && (
                  <span>
                    {analysisResult.metadata.format}
                    {analysisResult.pages && ` • ${analysisResult.pages} page${analysisResult.pages !== 1 ? 's' : ''}`}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}