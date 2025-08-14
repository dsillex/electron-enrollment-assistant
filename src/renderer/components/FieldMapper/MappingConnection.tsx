import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  ArrowRight, 
  Zap,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react'
import { DocumentField, FieldMapping } from '@shared/types'

interface MappingConnectionProps {
  mappings: FieldMapping[]
  documentFields: DocumentField[]
  selectedMapping: string | null
  onMappingSelect: (mappingId: string | null) => void
}

interface ConnectionLineProps {
  mapping: FieldMapping
  documentField?: DocumentField
  isSelected: boolean
  onSelect: (fieldId: string) => void
}

function ConnectionLine({ mapping, documentField, isSelected, onSelect }: ConnectionLineProps) {
  const getMappingTypeColor = () => {
    switch (mapping.sourceType) {
      case 'provider':
        return 'from-blue-200 to-blue-400'
      case 'office':
        return 'from-green-200 to-green-400'
      case 'mailing':
        return 'from-purple-200 to-purple-400'
      case 'static':
        return 'from-gray-200 to-gray-400'
      default:
        return 'from-orange-200 to-orange-400'
    }
  }

  const getSourceLabel = (path: string | undefined): string => {
    if (!path) return 'Static Value'
    const parts = path.split('.')
    const fieldName = parts[parts.length - 1]
    return fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  return (
    <div
      className={`
        relative flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all
        ${isSelected 
          ? 'bg-primary/10 border-2 border-primary' 
          : 'hover:bg-muted/50 border-2 border-transparent'
        }
      `}
      onClick={() => onSelect(mapping.documentFieldId)}
    >
      {/* Source Side */}
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <Badge 
          className={`text-xs ${
            mapping.sourceType === 'provider' ? 'bg-blue-100 text-blue-800 border-blue-200' :
            mapping.sourceType === 'office' ? 'bg-green-100 text-green-800 border-green-200' :
            mapping.sourceType === 'mailing' ? 'bg-purple-100 text-purple-800 border-purple-200' :
            mapping.sourceType === 'static' ? 'bg-gray-100 text-gray-800 border-gray-200' :
            'bg-orange-100 text-orange-800 border-orange-200'
          }`}
        >
          {mapping.sourceType}
        </Badge>
        <span className="text-sm font-medium truncate">
          {getSourceLabel(mapping.sourcePath)}
        </span>
      </div>

      {/* Connection Visualization */}
      <div className="flex items-center mx-4">
        {/* Animated connection line */}
        <div className={`h-0.5 w-8 bg-gradient-to-r ${getMappingTypeColor()} relative overflow-hidden`}>
          <div className={`
            absolute inset-0 w-2 h-full bg-white/60 animate-pulse
            ${isSelected ? 'animate-bounce' : ''}
          `} />
        </div>
        <ArrowRight className={`h-4 w-4 mx-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>

      {/* Target Side */}
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <span className="text-sm truncate">
          {mapping.documentFieldName}
        </span>
        
        <div className="flex items-center space-x-1">
          <Badge variant="outline" className="text-xs">
            {mapping.documentFieldType}
          </Badge>
          
          {documentField?.required ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <div className="h-4 w-4" /> // Spacer
          )}
          
          {mapping.transformation && (
            <Zap className="h-3 w-3 text-orange-500" />
          )}
        </div>
      </div>
    </div>
  )
}

function ConnectionStats({ mappings, documentFields }: { mappings: FieldMapping[], documentFields: DocumentField[] }) {
  const sourceTypeCounts = mappings.reduce((acc, mapping) => {
    acc[mapping.sourceType] = (acc[mapping.sourceType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const requiredFieldsMapped = mappings.filter(m => m.isRequired).length
  const totalRequiredFields = documentFields.filter(f => f.required).length
  const transformationsUsed = mappings.filter(m => m.transformation).length

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Source Breakdown</h4>
        <div className="space-y-1">
          {Object.entries(sourceTypeCounts).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between text-xs">
              <Badge 
                variant="outline" 
                className={`
                  ${type === 'provider' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    type === 'office' ? 'bg-green-50 text-green-700 border-green-200' :
                    type === 'mailing' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    type === 'static' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                    'bg-orange-50 text-orange-700 border-orange-200'
                  }
                `}
              >
                {type}
              </Badge>
              <span className="font-mono">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Mapping Stats</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span>Required Fields:</span>
            <span className={`font-mono ${requiredFieldsMapped === totalRequiredFields ? 'text-green-600' : 'text-orange-600'}`}>
              {requiredFieldsMapped}/{totalRequiredFields}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Transformations:</span>
            <span className="font-mono">{transformationsUsed}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Total Mappings:</span>
            <span className="font-mono">{mappings.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MappingConnection({
  mappings,
  documentFields,
  selectedMapping,
  onMappingSelect
}: MappingConnectionProps) {
  // Create document field lookup
  const documentFieldLookup = React.useMemo(() => {
    return documentFields.reduce((acc, field) => {
      acc[field.id] = field
      return acc
    }, {} as Record<string, DocumentField>)
  }, [documentFields])

  // Group mappings by source type for better visualization
  const groupedMappings = React.useMemo(() => {
    const groups = mappings.reduce((acc, mapping) => {
      if (!acc[mapping.sourceType]) {
        acc[mapping.sourceType] = []
      }
      acc[mapping.sourceType].push(mapping)
      return acc
    }, {} as Record<string, FieldMapping[]>)

    // Sort each group by document field name
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.documentFieldName.localeCompare(b.documentFieldName))
    })

    return groups
  }, [mappings])

  const unmappedRequiredFields = documentFields.filter(field => 
    field.required && !mappings.find(m => m.documentFieldId === field.id)
  )

  if (mappings.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Mapping Connections</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <ArrowRight className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">No Field Mappings</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Drag data sources from the left panel onto document fields on the right to create mappings
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Mapping Connections</CardTitle>
        <p className="text-xs text-muted-foreground">
          Visual representation of data source to document field mappings
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4 h-[600px] overflow-y-auto">
        {/* Connection Statistics */}
        <ConnectionStats mappings={mappings} documentFields={documentFields} />

        {/* Unmapped Required Fields Warning */}
        {unmappedRequiredFields.length > 0 && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-800">
                  {unmappedRequiredFields.length} required field{unmappedRequiredFields.length !== 1 ? 's' : ''} unmapped
                </p>
                <div className="mt-1 space-y-1">
                  {unmappedRequiredFields.map(field => (
                    <p key={field.id} className="text-xs text-orange-700">
                      • {field.name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connection Visualizations */}
        <div className="space-y-4">
          {Object.entries(groupedMappings).map(([sourceType, sourceMappings]) => (
            <div key={sourceType} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge 
                  className={`text-xs ${
                    sourceType === 'provider' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    sourceType === 'office' ? 'bg-green-100 text-green-800 border-green-200' :
                    sourceType === 'mailing' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                    sourceType === 'static' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                    'bg-orange-100 text-orange-800 border-orange-200'
                  }`}
                >
                  {sourceType} ({sourceMappings.length})
                </Badge>
              </div>
              
              <div className="space-y-1">
                {sourceMappings.map((mapping) => (
                  <ConnectionLine
                    key={mapping.documentFieldId}
                    mapping={mapping}
                    documentField={documentFieldLookup[mapping.documentFieldId]}
                    isSelected={selectedMapping === mapping.documentFieldId}
                    onSelect={onMappingSelect}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 p-3 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Legend</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Required field</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="h-3 w-3 text-orange-500" />
              <span>Has transformation</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}