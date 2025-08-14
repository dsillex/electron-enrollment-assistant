import React from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  FileText
} from 'lucide-react'

interface ViewerControlsProps {
  fileName: string
  fileType: string
  currentPage: number
  totalPages: number
  zoom: number
  showFields: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onToggleFields: () => void
  onPageChange: (page: number) => void
}

export function ViewerControls({
  fileName,
  fileType,
  currentPage,
  totalPages,
  zoom,
  showFields,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFields,
  onPageChange
}: ViewerControlsProps) {
  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄'
      case 'word':
        return '📝'
      case 'excel':
        return '📊'
      default:
        return '📄'
    }
  }

  const getFileTypeName = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'PDF'
      case 'word':
        return 'Word'
      case 'excel':
        return 'Excel'
      default:
        return 'Document'
    }
  }

  const handlePageInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(event.target.value)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  const handlePageInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const page = parseInt((event.target as HTMLInputElement).value)
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        onPageChange(page)
      }
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border-b bg-muted/20">
      {/* File Info */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getFileTypeIcon(fileType)}</span>
          <div>
            <p className="font-medium text-sm truncate max-w-[200px]" title={fileName}>
              {fileName}
            </p>
            <Badge variant="secondary" className="text-xs">
              {getFileTypeName(fileType)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-2">
        {/* Page Navigation */}
        {totalPages > 1 && (
          <>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-1 text-sm">
                <Input
                  type="number"
                  value={currentPage}
                  onChange={handlePageInputChange}
                  onKeyDown={handlePageInputKeyDown}
                  className="w-16 h-8 text-center"
                  min={1}
                  max={totalPages}
                />
                <span className="text-muted-foreground">of {totalPages}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Separator orientation="vertical" className="h-6" />
          </>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={onZoomOut} disabled={zoom <= 25}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={onResetZoom} className="min-w-[60px]">
            <span className="text-sm">{zoom}%</span>
          </Button>
          
          <Button variant="ghost" size="sm" onClick={onZoomIn} disabled={zoom >= 200}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Field Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFields}
          className={showFields ? 'bg-primary/10 text-primary' : ''}
        >
          {showFields ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          <span className="ml-1 text-sm">Fields</span>
        </Button>
      </div>
    </div>
  )
}