import React from 'react'
import { DocumentField } from '@shared/types'
import { AlertCircle } from 'lucide-react'

interface WordViewerProps {
  filePath: string
  currentPage: number
  zoom: number
  showFields: boolean
  fields: DocumentField[]
  onPageChange: (page: number) => void
}

export function WordViewer({
  filePath,
  currentPage,
  zoom,
  showFields,
  fields,
  onPageChange
}: WordViewerProps) {
  // TODO: Implement Word document viewer using mammoth or similar
  return (
    <div className="flex items-center justify-center h-64 p-4">
      <div className="text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
        <div>
          <p className="font-medium">Word Viewer</p>
          <p className="text-sm text-muted-foreground">Word document preview coming soon</p>
          <p className="text-xs text-muted-foreground mt-2">
            File: {filePath.split('/').pop()}
          </p>
          {fields.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {fields.length} field{fields.length !== 1 ? 's' : ''} detected
            </p>
          )}
        </div>
      </div>
    </div>
  )
}