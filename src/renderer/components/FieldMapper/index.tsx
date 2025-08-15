import React, { useState, useCallback } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Separator } from '../ui/separator'
import { 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  Zap
} from 'lucide-react'
import { DocumentField, FieldMapping, Template } from '@shared/types'
import { DataSourcePanel } from './DataSourcePanel'
import { DocumentFieldsPanel } from './DocumentFieldsPanel'
import { MappingsList } from './MappingsList'
import { MappingConnection } from './MappingConnection'
import { useTemplates } from '../../hooks/use-templates'

interface FieldMapperProps {
  documentFields: DocumentField[]
  mappings: FieldMapping[]
  onMappingsChange: (mappings: FieldMapping[]) => void
  onSaveTemplate?: (mappings: FieldMapping[]) => void
  selectedTemplate?: Template | null
  documentType?: 'pdf' | 'docx' | 'xlsx'
  className?: string
}

export function FieldMapper({
  documentFields,
  mappings,
  onMappingsChange,
  onSaveTemplate,
  selectedTemplate,
  documentType,
  className
}: FieldMapperProps) {
  // Debug logging for documentFields
  console.log('FieldMapper received documentFields:', documentFields)
  console.log('FieldMapper fields with options:', documentFields.filter(f => f.options && f.options.length > 0))
  const { createTemplateFromMappings, updateTemplate } = useTemplates()
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null)
  const [showConnections, setShowConnections] = useState(true)
  const [autoSuggestMode, setAutoSuggestMode] = useState(false)

  // Handle dropping a data source onto a document field
  const handleFieldMapping = useCallback((
    documentField: DocumentField,
    dataSource: { type: string; path: string; label: string; slotNumber?: number }
  ) => {
    const existingMappingIndex = mappings.findIndex(m => m.documentFieldId === documentField.id)
    
    let transformation: any = undefined
    let sourceType = dataSource.type as any
    let sourcePath = dataSource.path
    let staticValue: any = undefined
    let providerSlot: number | undefined = undefined
    let slotField: string | undefined = undefined

    // Handle provider-slot sources
    if (dataSource.type === 'provider-slot' && dataSource.slotNumber) {
      providerSlot = dataSource.slotNumber
      // Extract the field name from the path (e.g., provider[1].firstName -> firstName)
      const match = dataSource.path.match(/provider\[\d+\]\.(.+)/)
      if (match) {
        slotField = match[1]
        sourcePath = `provider.${slotField}` // Normalize to standard provider path
      }
    }

    // Handle static Y/N values
    if (dataSource.path.startsWith('static.')) {
      const staticValueMap: Record<string, string> = {
        'static.Y': 'Y',
        'static.N': 'N', 
        'static.YES': 'YES',
        'static.NO': 'NO',
        'static.Yes': 'Yes',
        'static.No': 'No',
        'static.TRUE': 'TRUE',
        'static.FALSE': 'FALSE',
        'static.True': 'True',
        'static.False': 'False'
      }
      
      if (staticValueMap[dataSource.path]) {
        sourceType = 'static'
        sourcePath = undefined
        staticValue = staticValueMap[dataSource.path]
      }
    }

    // Auto-detect and configure transformations based on data source
    if (dataSource.path.startsWith('combined.')) {
      switch (dataSource.path) {
        case 'combined.fullName':
          transformation = { type: 'nameFormat', config: { format: 'firstLast' } }
          sourceType = 'provider'
          sourcePath = 'provider.firstName'
          break
        case 'combined.fullNameWithMiddle':
          transformation = { type: 'nameFormat', config: { format: 'full' } }
          sourceType = 'provider'
          sourcePath = 'provider.firstName'
          break
        case 'combined.lastFirstMI':
          transformation = { type: 'nameFormat', config: { format: 'lastFirstMI' } }
          sourceType = 'provider'
          sourcePath = 'provider.firstName'
          break
        case 'combined.fullAddress':
          transformation = { 
            type: 'concatenate', 
            config: { 
              sources: ['office.addressLine1', 'office.city', 'office.state', 'office.zipCode'], 
              separator: ', ' 
            } 
          }
          sourceType = 'office'
          sourcePath = 'office.addressLine1'
          break
        case 'combined.cityStateZip':
          transformation = { 
            type: 'concatenate', 
            config: { 
              sources: ['office.city', 'office.state', 'office.zipCode'], 
              separator: ', ' 
            } 
          }
          sourceType = 'office'
          sourcePath = 'office.city'
          break
        case 'combined.credentials':
          transformation = { 
            type: 'concatenate', 
            config: { 
              sources: ['provider.firstName', 'provider.lastName', 'provider.medicalSchool.degree'], 
              separator: ' ' 
            } 
          }
          sourceType = 'provider'
          sourcePath = 'provider.firstName'
          break
      }
    }

    // Auto-detect checkbox fields and set up static value (only for checkboxes, not radio/dropdown)
    if (documentField.type === 'checkbox') {
      staticValue = true // Default to checked
      sourceType = 'static'
      sourcePath = undefined
      // No transformation needed - static value is sufficient for checkboxes
    }
    
    const newMapping: FieldMapping = {
      documentFieldId: documentField.id,
      documentFieldName: documentField.name,
      documentFieldType: documentField.type,
      sourceType: sourceType,
      sourcePath: sourcePath,
      isRequired: documentField.required,
      defaultValue: undefined,
      transformation: transformation,
      staticValue: staticValue,
      providerSlot: providerSlot,
      slotField: slotField
    }

    let updatedMappings: FieldMapping[]
    if (existingMappingIndex >= 0) {
      // Update existing mapping
      updatedMappings = [...mappings]
      updatedMappings[existingMappingIndex] = newMapping
    } else {
      // Add new mapping
      updatedMappings = [...mappings, newMapping]
    }

    onMappingsChange(updatedMappings)
  }, [mappings, onMappingsChange])

  // Handle direct value selection from DocumentFieldsPanel
  const handleDirectValueSelection = useCallback((documentField: DocumentField, value: any) => {
    console.log(`Direct value selection for field: ${documentField.id} -> ${value}`)
    
    const existingMappingIndex = mappings.findIndex(m => m.documentFieldId === documentField.id)
    
    const newMapping: FieldMapping = {
      documentFieldId: documentField.id,
      documentFieldName: documentField.name,
      documentFieldType: documentField.type,
      sourceType: 'static',
      sourcePath: undefined,
      isRequired: documentField.required,
      defaultValue: undefined,
      transformation: undefined,
      staticValue: value
    }

    let updatedMappings: FieldMapping[]
    if (existingMappingIndex >= 0) {
      // Update existing mapping
      updatedMappings = [...mappings]
      updatedMappings[existingMappingIndex] = newMapping
    } else {
      // Add new mapping
      updatedMappings = [...mappings, newMapping]
    }

    onMappingsChange(updatedMappings)
  }, [mappings, onMappingsChange])

  // Remove a mapping
  const handleRemoveMapping = useCallback((documentFieldId: string) => {
    const updatedMappings = mappings.filter(m => m.documentFieldId !== documentFieldId)
    onMappingsChange(updatedMappings)
  }, [mappings, onMappingsChange])

  // Update mapping properties
  const handleUpdateMapping = useCallback((documentFieldId: string, updates: Partial<FieldMapping>) => {
    const updatedMappings = mappings.map(mapping =>
      mapping.documentFieldId === documentFieldId
        ? { ...mapping, ...updates }
        : mapping
    )
    onMappingsChange(updatedMappings)
  }, [mappings, onMappingsChange])

  // Auto-suggest mappings based on field names
  const handleAutoSuggest = useCallback(() => {
    const autoMappings: FieldMapping[] = []
    
    documentFields.forEach(docField => {
      const fieldNameLower = docField.name.toLowerCase().replace(/[^a-z]/g, '')
      
      // Standard auto-matching rules
      let suggestedSource = null
      
      if (fieldNameLower.includes('name') && fieldNameLower.includes('first')) {
        suggestedSource = { type: 'provider', path: 'provider.firstName', label: 'Provider First Name' }
      } else if (fieldNameLower.includes('name') && fieldNameLower.includes('last')) {
        suggestedSource = { type: 'provider', path: 'provider.lastName', label: 'Provider Last Name' }
      } else if (fieldNameLower.includes('npi')) {
        suggestedSource = { type: 'provider', path: 'provider.npi', label: 'Provider NPI' }
      } else if (fieldNameLower.includes('license')) {
        suggestedSource = { type: 'provider', path: 'provider.licenseNumber', label: 'License Number' }
      } else if (fieldNameLower.includes('email')) {
        suggestedSource = { type: 'provider', path: 'provider.email', label: 'Provider Email' }
      } else if (fieldNameLower.includes('phone')) {
        suggestedSource = { type: 'provider', path: 'provider.phone', label: 'Provider Phone' }
      } else if (fieldNameLower.includes('address') && fieldNameLower.includes('1')) {
        suggestedSource = { type: 'office', path: 'office.addressLine1', label: 'Office Address Line 1' }
      } else if (fieldNameLower.includes('city')) {
        suggestedSource = { type: 'office', path: 'office.city', label: 'Office City' }
      } else if (fieldNameLower.includes('state')) {
        suggestedSource = { type: 'office', path: 'office.state', label: 'Office State' }
      } else if (fieldNameLower.includes('zip')) {
        suggestedSource = { type: 'office', path: 'office.zipCode', label: 'Office ZIP Code' }
      }

      if (suggestedSource) {
        const mapping: FieldMapping = {
          documentFieldId: docField.id,
          documentFieldName: docField.name,
          documentFieldType: docField.type,
          sourceType: suggestedSource.type as any,
          sourcePath: suggestedSource.path,
          isRequired: docField.required,
          defaultValue: undefined,
          transformation: undefined,
          staticValue: undefined
        }
        autoMappings.push(mapping)
      }
    })

    // Merge with existing mappings, prioritizing existing ones
    const existingFieldIds = new Set(mappings.map(m => m.documentFieldId))
    const newMappings = autoMappings.filter(m => !existingFieldIds.has(m.documentFieldId))
    
    onMappingsChange([...mappings, ...newMappings])
  }, [documentFields, mappings, onMappingsChange])

  // Save mappings as template
  const handleSaveAsTemplate = async () => {
    if (onSaveTemplate) {
      onSaveTemplate(mappings)
    }
  }

  // Get mapping statistics
  const mappingStats = {
    total: documentFields.length,
    mapped: mappings.length,
    unmapped: documentFields.length - mappings.length,
    required: documentFields.filter(f => f.required).length,
    requiredMapped: mappings.filter(m => m.isRequired).length
  }

  const completionPercentage = documentFields.length > 0 
    ? Math.round((mappings.length / documentFields.length) * 100)
    : 0

  return (
    <DndProvider backend={HTML5Backend}>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Field Mapping</CardTitle>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                <span>{mappingStats.mapped} of {mappingStats.total} fields mapped</span>
                <span>•</span>
                <span>{completionPercentage}% complete</span>
                {mappingStats.required > 0 && (
                  <>
                    <span>•</span>
                    <span className={mappingStats.requiredMapped === mappingStats.required ? 'text-green-600' : 'text-orange-600'}>
                      {mappingStats.requiredMapped} of {mappingStats.required} required fields
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConnections(!showConnections)}
              >
                {showConnections ? 'Hide' : 'Show'} Connections
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoSuggest}
                disabled={documentFields.length === 0}
              >
                <Zap className="mr-2 h-4 w-4" />
                Auto-Suggest
              </Button>
              <Button
                size="sm"
                onClick={handleSaveAsTemplate}
                disabled={mappings.length === 0}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Status Alerts */}
          {mappingStats.required > mappingStats.requiredMapped && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {mappingStats.required - mappingStats.requiredMapped} required field{mappingStats.required - mappingStats.requiredMapped !== 1 ? 's' : ''} still need to be mapped
              </AlertDescription>
            </Alert>
          )}

          {selectedTemplate && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Using template: <strong>{selectedTemplate.name}</strong> 
                <span className="ml-2 text-xs text-muted-foreground">
                  ({selectedTemplate.mappings.length} mappings)
                </span>
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 relative">
            {/* Data Sources Panel */}
            <div className="border-r">
              <DataSourcePanel documentType={documentType} />
            </div>

            {/* Mapping Connections (Middle Column) */}
            <div className="border-r relative">
              {showConnections && (
                <MappingConnection
                  mappings={mappings}
                  documentFields={documentFields}
                  selectedMapping={selectedMapping}
                  onMappingSelect={setSelectedMapping}
                />
              )}
              
              {!showConnections && (
                <MappingsList
                  mappings={mappings}
                  documentFields={documentFields}
                  selectedMapping={selectedMapping}
                  onMappingSelect={setSelectedMapping}
                  onMappingUpdate={handleUpdateMapping}
                  onMappingRemove={handleRemoveMapping}
                />
              )}
            </div>

            {/* Document Fields Panel */}
            <div>
              <DocumentFieldsPanel
                documentFields={documentFields}
                mappings={mappings}
                onFieldMapping={handleFieldMapping}
                onDirectValueMapping={handleDirectValueSelection}
                onRemoveMapping={handleRemoveMapping}
                selectedMapping={selectedMapping}
                onMappingSelect={setSelectedMapping}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </DndProvider>
  )
}