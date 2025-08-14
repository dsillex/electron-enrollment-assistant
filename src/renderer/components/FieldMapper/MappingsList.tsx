import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
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
  ArrowRight, 
  Settings,
  Trash2,
  AlertCircle,
  CheckCircle,
  Edit3,
  MoreVertical
} from 'lucide-react'
import { DocumentField, FieldMapping } from '@shared/types'

interface MappingsListProps {
  mappings: FieldMapping[]
  documentFields: DocumentField[]
  selectedMapping: string | null
  onMappingSelect: (mappingId: string | null) => void
  onMappingUpdate: (documentFieldId: string, updates: Partial<FieldMapping>) => void
  onMappingRemove: (documentFieldId: string) => void
}

interface MappingItemProps {
  mapping: FieldMapping
  documentField?: DocumentField
  isSelected: boolean
  onSelect: (fieldId: string) => void
  onUpdate: (fieldId: string, updates: Partial<FieldMapping>) => void
  onRemove: (fieldId: string) => void
}

function MappingItem({ 
  mapping, 
  documentField,
  isSelected, 
  onSelect, 
  onUpdate, 
  onRemove 
}: MappingItemProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [defaultValue, setDefaultValue] = React.useState(mapping.defaultValue || '')
  const [staticValue, setStaticValue] = React.useState(mapping.staticValue || '')

  const getMappingTypeColor = () => {
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

  const getSourceLabel = (path: string | undefined): string => {
    if (!path) return 'Static Value'
    const parts = path.split('.')
    const fieldName = parts[parts.length - 1]
    return fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  const handleSaveDefaultValue = () => {
    onUpdate(mapping.documentFieldId, { defaultValue: defaultValue || undefined })
    setIsEditing(false)
  }

  const handleSaveStaticValue = () => {
    onUpdate(mapping.documentFieldId, { staticValue: staticValue || undefined })
  }

  const getDefaultTransformationConfig = (type: string) => {
    switch (type) {
      case 'boolean':
        return { defaultValue: true }
      case 'nameFormat':
        return { format: 'firstLast' }
      case 'extract':
        return { part: 'firstName' }
      case 'format':
        return { caseTransform: 'title' }
      default:
        return {}
    }
  }

  const handleTransformationChange = (transformationType: string) => {
    if (transformationType === 'none') {
      onUpdate(mapping.documentFieldId, { transformation: undefined })
    } else {
      const config = getDefaultTransformationConfig(transformationType)
      onUpdate(mapping.documentFieldId, { 
        transformation: { 
          type: transformationType as any, 
          config 
        } 
      })
    }
  }

  const handleTransformationConfigChange = (configUpdates: any) => {
    if (mapping.transformation) {
      onUpdate(mapping.documentFieldId, {
        transformation: {
          ...mapping.transformation,
          config: { ...mapping.transformation.config, ...configUpdates }
        }
      })
    }
  }

  const getTransformationDescription = (transformation: any) => {
    const { type, config } = transformation
    
    switch (type) {
      case 'nameFormat':
        const formatLabels = {
          'firstLast': 'First Last',
          'lastFirst': 'Last, First',
          'lastFirstMI': 'Last, First MI',
          'firstMI': 'First + Middle Initial',
          'first': 'First Name Only',
          'last': 'Last Name Only',
          'full': 'Full Name with Middle'
        }
        return `→ ${formatLabels[config.format] || config.format}`
      
      case 'concatenate':
        const sources = config.sources || []
        if (sources.length <= 3) {
          return `→ Combines ${sources.length} fields`
        } else {
          return `→ Combines ${sources.length} fields with "${config.separator || ' '}"`
        }
      
      case 'boolean':
        return `→ ${config.defaultValue ? 'Checked' : 'Unchecked'} by default`
      
      case 'extract':
        const partLabels = {
          'firstName': 'First Name',
          'lastName': 'Last Name',
          'middleName': 'Middle Name',
          'middleInitial': 'Middle Initial'
        }
        return `→ Extract ${partLabels[config.part] || config.part}`
      
      case 'format':
        if (config.caseTransform) {
          const caseLabels = {
            'upper': 'UPPERCASE',
            'lower': 'lowercase',
            'title': 'Title Case'
          }
          return `→ ${caseLabels[config.caseTransform] || config.caseTransform}`
        }
        return '→ Format text'
      
      default:
        return `→ ${type} transformation`
    }
  }

  const renderTransformationConfig = () => {
    if (!mapping.transformation) return null

    const { type, config } = mapping.transformation

    switch (type) {
      case 'boolean':
        return (
          <div className="p-2 bg-muted/50 rounded space-y-2">
            <div className="flex items-center space-x-2">
              <Label className="text-xs">Default Value:</Label>
              <Select
                value={config.defaultValue ? 'true' : 'false'}
                onValueChange={(value) => handleTransformationConfigChange({ defaultValue: value === 'true' })}
              >
                <SelectTrigger className="h-6 w-20 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'nameFormat':
        return (
          <div className="p-2 bg-muted/50 rounded space-y-2">
            <div className="flex items-center space-x-2">
              <Label className="text-xs">Format:</Label>
              <Select
                value={config.format || 'firstLast'}
                onValueChange={(value) => handleTransformationConfigChange({ format: value })}
              >
                <SelectTrigger className="h-6 flex-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="firstLast">First Last</SelectItem>
                  <SelectItem value="lastFirst">Last, First</SelectItem>
                  <SelectItem value="lastFirstMI">Last, First MI</SelectItem>
                  <SelectItem value="firstMI">First MI</SelectItem>
                  <SelectItem value="first">First Only</SelectItem>
                  <SelectItem value="last">Last Only</SelectItem>
                  <SelectItem value="middle">Middle Only</SelectItem>
                  <SelectItem value="initial">First Initial</SelectItem>
                  <SelectItem value="full">Full Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'extract':
        return (
          <div className="p-2 bg-muted/50 rounded space-y-2">
            <div className="flex items-center space-x-2">
              <Label className="text-xs">Extract:</Label>
              <Select
                value={config.part || 'firstName'}
                onValueChange={(value) => handleTransformationConfigChange({ part: value })}
              >
                <SelectTrigger className="h-6 flex-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="firstName">First Name</SelectItem>
                  <SelectItem value="middleName">Middle Name</SelectItem>
                  <SelectItem value="lastName">Last Name</SelectItem>
                  <SelectItem value="middleInitial">Middle Initial</SelectItem>
                  <SelectItem value="suffix">Suffix</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'format':
        return (
          <div className="p-2 bg-muted/50 rounded space-y-2">
            <div className="flex items-center space-x-2">
              <Label className="text-xs">Case:</Label>
              <Select
                value={config.caseTransform || 'none'}
                onValueChange={(value) => handleTransformationConfigChange({ 
                  caseTransform: value === 'none' ? undefined : value 
                })}
              >
                <SelectTrigger className="h-6 flex-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Change</SelectItem>
                  <SelectItem value="upper">UPPERCASE</SelectItem>
                  <SelectItem value="lower">lowercase</SelectItem>
                  <SelectItem value="title">Title Case</SelectItem>
                  <SelectItem value="sentence">Sentence case</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'conditional':
        return (
          <div className="p-2 bg-muted/50 rounded text-xs text-muted-foreground">
            Conditional logic: {config.condition?.field} {config.condition?.operator} {config.condition?.value}
          </div>
        )

      case 'lookup':
        return (
          <div className="p-2 bg-muted/50 rounded text-xs text-muted-foreground">
            Lookup table with {Object.keys(config.lookupTable || {}).length} entries
          </div>
        )

      case 'concatenate':
        return (
          <div className="p-2 bg-muted/50 rounded text-xs text-muted-foreground">
            Concatenating {config.sources?.length || 0} fields with separator: "{config.separator || ' '}"
          </div>
        )

      default:
        return (
          <div className="p-2 bg-muted/50 rounded text-xs text-muted-foreground">
            {type} transformation
          </div>
        )
    }
  }

  return (
    <div
      className={`
        border rounded-lg p-3 transition-all cursor-pointer
        ${isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
      `}
      onClick={() => onSelect(mapping.documentFieldId)}
    >
      <div className="space-y-3">
        {/* Mapping Overview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <Badge className={`text-xs ${getMappingTypeColor()}`}>
                {mapping.sourceType}
              </Badge>
              <span className="text-sm font-medium truncate">
                {mapping.staticValue !== undefined 
                  ? `Static: ${mapping.staticValue}`
                  : getSourceLabel(mapping.sourcePath)
                }
              </span>
              <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-sm truncate">
                {mapping.documentFieldName}
              </span>
              {/* Transformation indicator */}
              {mapping.transformation && (
                <Badge variant="secondary" className="text-xs ml-2 bg-indigo-100 text-indigo-700">
                  {mapping.transformation.type === 'nameFormat' && '👤'}
                  {mapping.transformation.type === 'concatenate' && '🔗'}
                  {mapping.transformation.type === 'boolean' && '☑️'}
                  {mapping.transformation.type === 'extract' && '✂️'}
                  {mapping.transformation.type === 'format' && '📝'}
                  {mapping.transformation.type}
                </Badge>
              )}
            </div>
            {documentField?.required && (
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
                <Edit3 className="mr-2 h-3 w-3" />
                Edit Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onRemove(mapping.documentFieldId)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Remove Mapping
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Field Types and Status */}
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            {mapping.documentFieldType}
          </Badge>
          {documentField?.required ? (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>Required field mapped</span>
            </div>
          ) : (
            <span>Optional field</span>
          )}
        </div>

        {/* Checkbox Quick Controls */}
        {mapping.documentFieldType === 'checkbox' && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-blue-800">
                Checkbox State
              </Label>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-blue-600">
                  {mapping.staticValue === true ? 'Checked' : 
                   mapping.staticValue === false ? 'Unchecked' : 'Not Set'}
                </span>
                <Switch
                  checked={mapping.staticValue === true}
                  onCheckedChange={(checked) => {
                    onUpdate(mapping.documentFieldId, { 
                      staticValue: checked,
                      sourceType: 'static',
                      sourcePath: undefined
                    })
                  }}
                  className="h-4 w-7"
                />
              </div>
            </div>
            {mapping.staticValue !== undefined && (
              <div className="text-xs text-blue-600">
                This checkbox will be {mapping.staticValue ? 'checked' : 'unchecked'} when the document is filled.
              </div>
            )}
          </div>
        )}

        {/* Radio Button and Dropdown Quick Controls */}
        {(mapping.documentFieldType === 'radio' || mapping.documentFieldType === 'dropdown') && (() => {
          console.log(`Checking field ${mapping.documentFieldId}:`, {
            type: mapping.documentFieldType,
            documentField,
            hasOptions: !!documentField?.options,
            options: documentField?.options
          })
          return documentField?.options
        })() && (
          <div className="bg-orange-50 border border-orange-200 rounded p-2 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-orange-800">
                {mapping.documentFieldType === 'radio' ? 'Radio Button Options' : 'Dropdown Options'}
              </Label>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-orange-600">Available Options:</Label>
              <Select
                value={mapping.staticValue || ''}
                onValueChange={(value) => {
                  onUpdate(mapping.documentFieldId, { 
                    staticValue: value,
                    sourceType: 'static',
                    sourcePath: undefined
                  })
                }}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select an option..." />
                </SelectTrigger>
                <SelectContent>
                  {documentField.options.map((option) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mapping.staticValue && (
                <div className="text-xs text-orange-600">
                  Will select "{mapping.staticValue}" when the document is filled.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Input for Radio/Dropdown Fields (when options not available) */}
        {(mapping.documentFieldType === 'radio' || mapping.documentFieldType === 'dropdown') && !documentField?.options && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-yellow-800">
                {mapping.documentFieldType === 'radio' ? 'Radio Button Value' : 'Dropdown Value'}
              </Label>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-yellow-600">Manual Input Required (options not detected):</Label>
              <div className="flex space-x-1">
                <Input
                  value={mapping.staticValue || ''}
                  onChange={(e) => setStaticValue(e.target.value)}
                  placeholder="Enter the exact option value..."
                  className="h-7 text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onUpdate(mapping.documentFieldId, { 
                      staticValue: staticValue,
                      sourceType: 'static',
                      sourcePath: undefined
                    })
                  }}
                  className="h-7 px-2"
                >
                  Set
                </Button>
              </div>
              {mapping.staticValue && (
                <div className="text-xs text-yellow-600">
                  Will use "{mapping.staticValue}" when the document is filled.
                </div>
              )}
              <div className="text-xs text-yellow-500 bg-yellow-100 p-1 rounded">
                💡 Common values: YES/NO, TRUE/FALSE, or check the PDF for exact options
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions for Name Fields */}
        {!isEditing && mapping.documentFieldName.toLowerCase().includes('name') && (
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-green-800">Name Field Actions</Label>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Set up concatenation of first + last name
                    onUpdate(mapping.documentFieldId, {
                      transformation: {
                        type: 'nameFormat',
                        config: { format: 'firstLast' }
                      },
                      sourceType: 'provider',
                      sourcePath: 'provider.firstName'
                    })
                  }}
                  className="h-6 px-2 text-xs text-green-700 border-green-300 hover:bg-green-100"
                >
                  Combine Names
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Set up extraction of first name only
                    onUpdate(mapping.documentFieldId, {
                      transformation: {
                        type: 'extract',
                        config: { part: 'firstName' }
                      },
                      sourceType: 'provider',
                      sourcePath: 'provider.firstName'
                    })
                  }}
                  className="h-6 px-2 text-xs text-green-700 border-green-300 hover:bg-green-100"
                >
                  First Only
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Set up extraction of last name only
                    onUpdate(mapping.documentFieldId, {
                      transformation: {
                        type: 'extract',
                        config: { part: 'lastName' }
                      },
                      sourceType: 'provider',
                      sourcePath: 'provider.lastName'
                    })
                  }}
                  className="h-6 px-2 text-xs text-green-700 border-green-300 hover:bg-green-100"
                >
                  Last Only
                </Button>
              </div>
            </div>
            <div className="text-xs text-green-600 mt-1">
              Quick setup for common name field configurations
            </div>
          </div>
        )}

        {/* Editing Panel */}
        {isEditing && (
          <div className="space-y-3 p-3 bg-muted/30 rounded border">
            <div className="grid grid-cols-3 gap-3">
              {/* Transformation */}
              <div className="space-y-1">
                <Label className="text-xs">Transformation</Label>
                <Select
                  value={mapping.transformation?.type || 'none'}
                  onValueChange={handleTransformationChange}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="format">Format</SelectItem>
                    <SelectItem value="concatenate">Concatenate</SelectItem>
                    <SelectItem value="conditional">Conditional</SelectItem>
                    <SelectItem value="lookup">Lookup</SelectItem>
                    <SelectItem value="boolean">Boolean (Checkbox)</SelectItem>
                    <SelectItem value="nameFormat">Name Format</SelectItem>
                    <SelectItem value="extract">Extract Name Part</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Default Value */}
              <div className="space-y-1">
                <Label className="text-xs">Default Value</Label>
                <div className="flex space-x-1">
                  <Input
                    value={defaultValue}
                    onChange={(e) => setDefaultValue(e.target.value)}
                    placeholder="Enter default value..."
                    className="h-7 text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveDefaultValue}
                    className="h-7 px-2"
                  >
                    Save
                  </Button>
                </div>
              </div>

              {/* Static Value */}
              <div className="space-y-1">
                <Label className="text-xs">Static Value</Label>
                <div className="flex space-x-1">
                  <Input
                    value={staticValue}
                    onChange={(e) => setStaticValue(e.target.value)}
                    placeholder="Enter static value..."
                    className="h-7 text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveStaticValue}
                    className="h-7 px-2"
                  >
                    Set
                  </Button>
                </div>
              </div>
            </div>

            {/* Transformation Config */}
            {mapping.transformation && mapping.transformation.type !== 'none' && (
              <div className="space-y-2">
                <Label className="text-xs">Transformation Settings</Label>
                {renderTransformationConfig()}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="h-7 px-3"
              >
                Done
              </Button>
            </div>
          </div>
        )}

        {/* Current Values Display (when not editing) */}
        {!isEditing && (mapping.transformation || mapping.defaultValue || mapping.staticValue !== undefined) && (
          <div className="space-y-1 text-xs">
            {mapping.transformation && (
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Transform:</span>
                <Badge variant="outline" className="text-xs">
                  {mapping.transformation.type}
                </Badge>
                <span className="text-muted-foreground">
                  {getTransformationDescription(mapping.transformation)}
                </span>
              </div>
            )}
            {mapping.staticValue !== undefined && (
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Static:</span>
                <span className="font-mono bg-muted px-1 rounded">
                  {mapping.staticValue}
                </span>
              </div>
            )}
            {mapping.defaultValue && (
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Default:</span>
                <span className="font-mono bg-muted px-1 rounded">
                  {mapping.defaultValue}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function MappingsList({
  mappings,
  documentFields,
  selectedMapping,
  onMappingSelect,
  onMappingUpdate,
  onMappingRemove
}: MappingsListProps) {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterBy, setFilterBy] = React.useState<'all' | 'provider' | 'office' | 'mailing' | 'static'>('all')

  // Create document field lookup
  const documentFieldLookup = React.useMemo(() => {
    return documentFields.reduce((acc, field) => {
      acc[field.id] = field
      return acc
    }, {} as Record<string, DocumentField>)
  }, [documentFields])

  // Filter mappings
  const filteredMappings = React.useMemo(() => {
    let filtered = mappings

    if (searchTerm) {
      filtered = filtered.filter(mapping =>
        mapping.documentFieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.sourcePath.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterBy !== 'all') {
      filtered = filtered.filter(mapping => mapping.sourceType === filterBy)
    }

    return filtered.sort((a, b) => a.documentFieldName.localeCompare(b.documentFieldName))
  }, [mappings, searchTerm, filterBy])

  const requiredMappings = mappings.filter(m => m.isRequired).length
  const totalRequired = documentFields.filter(f => f.required).length

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Field Mappings</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {mappings.length} mapping{mappings.length !== 1 ? 's' : ''} configured
              {totalRequired > 0 && (
                <span className="ml-2">
                  • {requiredMappings} of {totalRequired} required
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="space-y-2 mt-3">
          <Input
            placeholder="Search mappings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-sm"
          />
          
          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="provider">Provider Only</SelectItem>
              <SelectItem value="office">Office Only</SelectItem>
              <SelectItem value="mailing">Mailing Only</SelectItem>
              <SelectItem value="static">Static/Custom Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 h-[600px] overflow-y-auto">
        {filteredMappings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {mappings.length === 0 
                ? 'No field mappings configured'
                : 'No mappings match your filters'
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
          filteredMappings.map((mapping) => (
            <MappingItem
              key={mapping.documentFieldId}
              mapping={mapping}
              documentField={documentFieldLookup[mapping.documentFieldId]}
              isSelected={selectedMapping === mapping.documentFieldId}
              onSelect={onMappingSelect}
              onUpdate={onMappingUpdate}
              onRemove={onMappingRemove}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}