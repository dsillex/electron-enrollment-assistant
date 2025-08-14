import React from 'react'
import { useDrop } from 'react-dnd'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { 
  FileText, 
  CheckSquare, 
  Calendar, 
  Type, 
  List,
  Target,
  X,
  ChevronDown,
  Settings,
  AlertCircle
} from 'lucide-react'
import { DocumentField, FieldMapping } from '@shared/types'

interface DocumentFieldsPanelProps {
  documentFields: DocumentField[]
  mappings: FieldMapping[]
  onFieldMapping: (documentField: DocumentField, dataSource: any) => void
  onDirectValueMapping?: (documentField: DocumentField, value: any) => void
  onRemoveMapping: (documentFieldId: string) => void
  selectedMapping: string | null
  onMappingSelect: (mappingId: string | null) => void
}

interface DroppableDocumentFieldProps {
  field: DocumentField
  mapping?: FieldMapping
  isSelected: boolean
  onFieldMapping: (field: DocumentField, dataSource: any) => void
  onDirectValueMapping?: (field: DocumentField, value: any) => void
  onRemoveMapping: (fieldId: string) => void
  onSelect: (fieldId: string) => void
}

function DroppableDocumentField({
  field,
  mapping,
  isSelected,
  onFieldMapping,
  onDirectValueMapping,
  onRemoveMapping,
  onSelect
}: DroppableDocumentFieldProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'dataSource',
    drop: (item: any) => {
      onFieldMapping(field, item)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })

  const getFieldIcon = () => {
    switch (field.type) {
      case 'text':
        return <Type className="h-4 w-4" />
      case 'checkbox':
        return <CheckSquare className="h-4 w-4" />
      case 'date':
        return <Calendar className="h-4 w-4" />
      case 'dropdown':
      case 'radio':
        return <List className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getMappingTypeColor = () => {
    if (!mapping) return ''
    
    switch (mapping.sourceType) {
      case 'provider':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'office':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'mailing':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'static':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200'
    }
  }

  const getFieldLabel = (path: string | undefined): string => {
    // Convert path like 'provider.firstName' to 'First Name'
    if (!path) return 'Static Value'
    const parts = path.split('.')
    const fieldName = parts[parts.length - 1]
    return fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  return (
    <div
      ref={drop}
      onClick={() => onSelect(field.id)}
      className={`
        relative border rounded-lg p-3 transition-all cursor-pointer
        ${isSelected ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-primary/50'}
        ${isOver && canDrop ? 'bg-primary/5 border-primary scale-105' : ''}
        ${mapping ? 'bg-muted/30' : 'bg-background'}
      `}
    >
      {/* Drop target indicator */}
      {isOver && canDrop && (
        <div className="absolute inset-0 border-2 border-dashed border-primary bg-primary/5 rounded-lg flex items-center justify-center">
          <div className="flex items-center space-x-2 text-primary font-medium">
            <Target className="h-4 w-4" />
            <span className="text-sm">Drop to map</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {/* Field header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {getFieldIcon()}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-sm truncate">{field.name}</h4>
                {field.required && (
                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                    Required
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {field.type}
                </Badge>
                {field.value && (
                  <span className="text-xs text-muted-foreground truncate">
                    Current: {String(field.value)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {mapping && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Settings className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelect(field.id)}>
                  Edit Mapping
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onRemoveMapping(field.id)}
                  className="text-destructive"
                >
                  Remove Mapping
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Radio/Dropdown Options UI */}
        {(field.type === 'radio' || field.type === 'dropdown') && field.options && field.options.length > 0 && !mapping && (
          <div className="space-y-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-blue-800">
                {field.type === 'radio' ? 'Radio Options:' : 'Dropdown Options:'}
              </Label>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-blue-600 flex flex-wrap gap-1">
                {field.options.map((option, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {option}
                  </Badge>
                ))}
              </div>
              <Select
                onValueChange={(value) => {
                  if (onDirectValueMapping) {
                    onDirectValueMapping(field, value)
                  } else {
                    // Fallback: create a static mapping
                    const dataSource = { type: 'static', path: 'static.value', label: `Static: ${value}` }
                    onFieldMapping(field, dataSource)
                  }
                }}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select an option..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Checkbox Options UI */}
        {field.type === 'checkbox' && !mapping && (
          <div className="space-y-2 p-2 bg-green-50 border border-green-200 rounded">
            <Label className="text-xs font-medium text-green-800">Checkbox State:</Label>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (onDirectValueMapping) {
                    onDirectValueMapping(field, true)
                  } else {
                    const dataSource = { type: 'static', path: 'static.checked', label: 'Static: Checked' }
                    onFieldMapping(field, dataSource)
                  }
                }}
                className="h-7 px-3 text-xs text-green-700 border-green-300"
              >
                ✓ Checked
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (onDirectValueMapping) {
                    onDirectValueMapping(field, false)
                  } else {
                    const dataSource = { type: 'static', path: 'static.unchecked', label: 'Static: Unchecked' }
                    onFieldMapping(field, dataSource)
                  }
                }}
                className="h-7 px-3 text-xs text-green-700 border-green-300"
              >
                ✗ Unchecked
              </Button>
            </div>
          </div>
        )}

        {/* Mapping status */}
        {mapping ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge className={`text-xs ${getMappingTypeColor()}`}>
                {mapping.sourceType}
              </Badge>
              <span className="text-sm font-medium text-green-700">
                {getFieldLabel(mapping.sourcePath)}
              </span>
            </div>
            
            {mapping.transformation && (
              <div className="text-xs text-muted-foreground">
                Transform: {mapping.transformation.type}
              </div>
            )}
            
            {mapping.defaultValue && (
              <div className="text-xs text-muted-foreground">
                Default: {mapping.defaultValue}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <AlertCircle className="h-3 w-3" />
            <span className="text-xs">
              {canDrop && isOver ? 'Drop data source here' : 'Drag data source here to map'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export function DocumentFieldsPanel({
  documentFields,
  mappings,
  onFieldMapping,
  onDirectValueMapping,
  onRemoveMapping,
  selectedMapping,
  onMappingSelect
}: DocumentFieldsPanelProps) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [showOnlyUnmapped, setShowOnlyUnmapped] = React.useState(false)
  const [sortBy, setSortBy] = React.useState<'name' | 'type' | 'required'>('name')

  // Create mapping lookup for quick access
  const mappingLookup = React.useMemo(() => {
    return mappings.reduce((acc, mapping) => {
      acc[mapping.documentFieldId] = mapping
      return acc
    }, {} as Record<string, FieldMapping>)
  }, [mappings])

  // Filter and sort fields
  const filteredFields = React.useMemo(() => {
    let filtered = documentFields

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(field =>
        field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply unmapped filter
    if (showOnlyUnmapped) {
      filtered = filtered.filter(field => !mappingLookup[field.id])
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'type':
          return a.type.localeCompare(b.type)
        case 'required':
          if (a.required && !b.required) return -1
          if (!a.required && b.required) return 1
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return filtered
  }, [documentFields, searchTerm, showOnlyUnmapped, sortBy, mappingLookup])

  const mappedCount = Object.keys(mappingLookup).length
  const requiredFields = documentFields.filter(f => f.required)
  const requiredMappedCount = requiredFields.filter(f => mappingLookup[f.id]).length

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Document Fields</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {mappedCount} of {documentFields.length} fields mapped
              {requiredFields.length > 0 && (
                <span className="ml-2">
                  • {requiredMappedCount} of {requiredFields.length} required
                </span>
              )}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Sort by {sortBy} <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Sort by Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('type')}>
                Sort by Type
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('required')}>
                Sort by Required
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 mt-3">
          <Input
            placeholder="Search fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-sm"
          />
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showOnlyUnmapped"
              checked={showOnlyUnmapped}
              onChange={(e) => setShowOnlyUnmapped(e.target.checked)}
              className="h-3 w-3"
            />
            <Label htmlFor="showOnlyUnmapped" className="text-xs">
              Show only unmapped fields
            </Label>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 h-[600px] overflow-y-auto">
        {filteredFields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {documentFields.length === 0 
                ? 'No document fields detected'
                : 'No fields match your filters'
              }
            </p>
            {searchTerm && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setSearchTerm('')}
                className="mt-1"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          filteredFields.map((field) => (
            <DroppableDocumentField
              key={field.id}
              field={field}
              mapping={mappingLookup[field.id]}
              isSelected={selectedMapping === field.id}
              onFieldMapping={onFieldMapping}
              onDirectValueMapping={onDirectValueMapping}
              onRemoveMapping={onRemoveMapping}
              onSelect={onMappingSelect}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}