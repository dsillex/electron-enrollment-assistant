import React from 'react'
import { DocumentField } from '@shared/types'
import { Badge } from '../ui/badge'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'

interface FieldOverlayProps {
  fields: DocumentField[]
  pageData: {
    width: number
    height: number
    scale: number
  }
  currentPage: number
}

export function FieldOverlay({ fields, pageData, currentPage }: FieldOverlayProps) {
  // Filter fields for current page (if position data is available)
  const pageFields = fields.filter(field => {
    if (field.position) {
      return field.position.page === currentPage
    }
    // If no position data, show all fields (they might be on any page)
    return true
  })

  const getFieldTypeColor = (type: string) => {
    switch (type) {
      case 'text':
        return 'bg-blue-500/20 border-blue-500'
      case 'checkbox':
        return 'bg-green-500/20 border-green-500'
      case 'radio':
        return 'bg-purple-500/20 border-purple-500'
      case 'dropdown':
        return 'bg-orange-500/20 border-orange-500'
      case 'date':
        return 'bg-pink-500/20 border-pink-500'
      default:
        return 'bg-gray-500/20 border-gray-500'
    }
  }

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return '📝'
      case 'checkbox':
        return '☑️'
      case 'radio':
        return '🔘'
      case 'dropdown':
        return '📋'
      case 'date':
        return '📅'
      default:
        return '📄'
    }
  }

  return (
    <TooltipProvider>
      <div className="absolute inset-0 pointer-events-none">
        {pageFields.map((field, index) => {
          // If the field has position data, use it; otherwise, create a simple indicator
          if (field.position && pageData) {
            const { x, y, width, height } = field.position
            const scaledX = x * pageData.scale
            const scaledY = y * pageData.scale
            const scaledWidth = width * pageData.scale
            const scaledHeight = height * pageData.scale

            return (
              <Tooltip key={field.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <div
                    className={`absolute border-2 rounded-sm pointer-events-auto cursor-pointer transition-opacity hover:opacity-80 ${getFieldTypeColor(field.type)}`}
                    style={{
                      left: scaledX + 16, // 16px for padding
                      top: scaledY + 16,
                      width: scaledWidth,
                      height: scaledHeight,
                      minWidth: '20px',
                      minHeight: '20px'
                    }}
                  >
                    <div className="absolute -top-6 left-0">
                      <Badge variant="secondary" className="text-xs">
                        {getFieldTypeIcon(field.type)} {field.name}
                      </Badge>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">{field.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Type: {field.type}
                      {field.required && ' (Required)'}
                    </p>
                    {field.value && (
                      <p className="text-xs">Current: {String(field.value)}</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          }

          // Fallback for fields without position data - show as a list
          return (
            <div
              key={field.id}
              className="absolute top-4 right-4 pointer-events-auto"
              style={{ transform: `translateY(${index * 32}px)` }}
            >
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-secondary/80"
                  >
                    {getFieldTypeIcon(field.type)} {field.name}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">{field.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Type: {field.type}
                      {field.required && ' (Required)'}
                    </p>
                    {field.value && (
                      <p className="text-xs">Current: {String(field.value)}</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          )
        })}
      </div>
    </TooltipProvider>
  )
}