import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { 
  Edit, 
  Copy, 
  Download, 
  Trash2,
  Calendar,
  Hash,
  FileText,
  Tag
} from 'lucide-react'
import { Template } from '@shared/types'
import { format } from 'date-fns'

interface TemplatePreviewProps {
  template: Template | null
  onEdit: (template: Template) => void
  onDelete: (template: Template) => void
  onDuplicate: (template: Template) => void
  onExport: (template: Template) => void
}

export function TemplatePreview({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onExport
}: TemplatePreviewProps) {
  if (!template) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-2" />
          <p>Select a template to preview</p>
        </div>
      </div>
    )
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'docx':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'xlsx':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄'
      case 'docx':
        return '📝'
      case 'xlsx':
        return '📊'
      default:
        return '📄'
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

  const getSourceTypeColor = (type: string) => {
    switch (type) {
      case 'provider':
        return 'bg-blue-100 text-blue-800'
      case 'office':
        return 'bg-green-100 text-green-800'
      case 'mailing':
        return 'bg-purple-100 text-purple-800'
      case 'custom':
        return 'bg-orange-100 text-orange-800'
      case 'static':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Template Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center space-x-2">
                <span>{getDocumentTypeIcon(template.documentType)}</span>
                <span>{template.name}</span>
              </CardTitle>
              <CardDescription>{template.description}</CardDescription>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Badge variant="secondary" className={getDocumentTypeColor(template.documentType)}>
                    {template.documentType.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <Hash className="h-3 w-3" />
                  <span>{template.mappings.length} fields</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Tag className="h-3 w-3" />
                  <span>v{template.version}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Updated {format(new Date(template.updatedAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(template)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDuplicate(template)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </Button>
              <Button variant="outline" size="sm" onClick={() => onExport(template)}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(template)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Field Mappings */}
      <Card>
        <CardHeader>
          <CardTitle>Field Mappings ({template.mappings.length})</CardTitle>
          <CardDescription>
            How document fields are mapped to data sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {template.mappings.map((mapping, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span>{getFieldTypeIcon(mapping.documentFieldType)}</span>
                      <span className="font-medium">{mapping.documentFieldName}</span>
                      <Badge variant="outline" className="text-xs">
                        {mapping.documentFieldType}
                      </Badge>
                      {mapping.isRequired && (
                        <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                          Required
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Field ID: <code className="text-xs bg-muted px-1 rounded">{mapping.documentFieldId}</code>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Maps to:</span>
                      <Badge variant="outline" className={getSourceTypeColor(mapping.sourceType)}>
                        {mapping.sourceType}
                      </Badge>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{mapping.sourcePath}</code>
                    </div>

                    {mapping.transformation && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Transformation:</span>
                        <Badge variant="outline" className="text-xs">
                          {mapping.transformation.type}
                        </Badge>
                      </div>
                    )}

                    {mapping.defaultValue && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Default:</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{String(mapping.defaultValue)}</code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conditional Rules */}
      {template.conditionalRules && template.conditionalRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conditional Rules ({template.conditionalRules.length})</CardTitle>
            <CardDescription>
              Rules that conditionally control field behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {template.conditionalRules.map((rule, index) => (
                <div key={index} className="p-3 border rounded-lg text-sm">
                  <div className="font-mono text-xs">
                    IF <code className="bg-muted px-1 rounded">{rule.condition}</code> THEN <code className="bg-muted px-1 rounded">{rule.action}</code>
                    {rule.value && <> = <code className="bg-muted px-1 rounded">{String(rule.value)}</code></>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}