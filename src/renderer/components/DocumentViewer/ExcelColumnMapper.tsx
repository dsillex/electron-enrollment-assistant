import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { ScrollArea } from '../ui/scroll-area'
import { ArrowLeft, Check, X, FileSpreadsheet } from 'lucide-react'
import { ExcelConfiguration, ExcelColumnMapping } from '@shared/types'

interface ExcelColumnMapperProps {
  columns: Array<{
    letter: string
    index: number
    headerText: string
  }>
  selectedHeaderRow: number
  selectedDataStartRow: number
  onBack: () => void
  onComplete: (configuration: ExcelConfiguration) => void
}

const PROVIDER_FIELDS = [
  { value: 'firstName', label: 'First Name', category: 'Personal' },
  { value: 'middleName', label: 'Middle Name', category: 'Personal' },
  { value: 'lastName', label: 'Last Name', category: 'Personal' },
  { value: 'suffix', label: 'Suffix', category: 'Personal' },
  { value: 'dateOfBirth', label: 'Date of Birth', category: 'Personal' },
  { value: 'ssn', label: 'SSN', category: 'Personal' },
  
  { value: 'npi', label: 'NPI Number', category: 'Professional' },
  { value: 'licenseNumber', label: 'License Number', category: 'Professional' },
  { value: 'licenseState', label: 'License State', category: 'Professional' },
  { value: 'licenseExpiration', label: 'License Expiration', category: 'Professional' },
  { value: 'deaNumber', label: 'DEA Number', category: 'Professional' },
  { value: 'deaExpiration', label: 'DEA Expiration', category: 'Professional' },
  { value: 'caqhId', label: 'CAQH ID', category: 'Professional' },
  { value: 'providerType', label: 'Provider Type', category: 'Professional' },
  { value: 'hireDate', label: 'Hire Date', category: 'Professional' },
  { value: 'medicareApprovalDate', label: 'Medicare Approval Date', category: 'Professional' },
  { value: 'medicaidApprovalDate', label: 'Medicaid Approval Date', category: 'Professional' },
  
  { value: 'email', label: 'Email', category: 'Contact' },
  { value: 'phone', label: 'Phone', category: 'Contact' },
  { value: 'cellPhone', label: 'Cell Phone', category: 'Contact' },
  { value: 'fax', label: 'Fax', category: 'Contact' },
  
  { value: 'practiceType', label: 'Practice Type', category: 'Practice' },
  { value: 'groupName', label: 'Group Name', category: 'Practice' },
  { value: 'taxId', label: 'Tax ID', category: 'Practice' },
  { value: 'medicareNumber', label: 'Medicare Number', category: 'Practice' },
  { value: 'medicaidNumber', label: 'Medicaid Number', category: 'Practice' },
  
  { value: 'medicalSchool.name', label: 'Medical School Name', category: 'Education' },
  { value: 'medicalSchool.graduationYear', label: 'Medical School Graduation Year', category: 'Education' },
  { value: 'medicalSchool.degree', label: 'Medical Degree', category: 'Education' },
  
  { value: 'specialties', label: 'Specialties', category: 'Other' },
  { value: 'languages', label: 'Languages', category: 'Other' },
]

const FIELD_CATEGORIES = [
  'Personal',
  'Professional', 
  'Contact',
  'Practice',
  'Education',
  'Other'
]

export function ExcelColumnMapper({
  columns,
  selectedHeaderRow,
  selectedDataStartRow,
  onBack,
  onComplete
}: ExcelColumnMapperProps) {
  const [mappings, setMappings] = useState<ExcelColumnMapping[]>(
    columns.map(col => ({
      columnIndex: col.index,
      columnLetter: col.letter,
      headerText: col.headerText,
      mappedField: null,
      providerFieldPath: null
    }))
  )

  const handleFieldMapping = (columnIndex: number, fieldValue: string | null) => {
    const actualValue = fieldValue === '__none__' ? null : fieldValue
    setMappings(prev => prev.map(mapping => 
      mapping.columnIndex === columnIndex 
        ? { ...mapping, mappedField: actualValue, providerFieldPath: actualValue }
        : mapping
    ))
  }

  const getMappedFieldsCount = () => {
    return mappings.filter(m => m.mappedField).length
  }

  const getAvailableFields = (currentMapping: string | null) => {
    const usedFields = mappings
      .filter(m => m.mappedField && m.mappedField !== currentMapping)
      .map(m => m.mappedField)
    
    return PROVIDER_FIELDS.filter(field => !usedFields.includes(field.value))
  }

  const findSuggestedMapping = (headerText: string): string | null => {
    const normalizedHeader = headerText.toLowerCase().trim()
    
    // Smart suggestions based on common header patterns
    const suggestions: Record<string, string> = {
      'first name': 'firstName',
      'firstname': 'firstName',
      'fname': 'firstName',
      'last name': 'lastName', 
      'lastname': 'lastName',
      'lname': 'lastName',
      'middle name': 'middleName',
      'middlename': 'middleName',
      'middle': 'middleName',
      'npi': 'npi',
      'npi number': 'npi',
      'license': 'licenseNumber',
      'license number': 'licenseNumber',
      'license #': 'licenseNumber',
      'state': 'licenseState',
      'license state': 'licenseState',
      'dea': 'deaNumber',
      'dea number': 'deaNumber',
      'dea #': 'deaNumber',
      'caqh': 'caqhId',
      'caqh id': 'caqhId',
      'email': 'email',
      'phone': 'phone',
      'telephone': 'phone',
      'cell': 'cellPhone',
      'mobile': 'cellPhone',
      'fax': 'fax',
      'ssn': 'ssn',
      'social security': 'ssn',
      'dob': 'dateOfBirth',
      'date of birth': 'dateOfBirth',
      'birth date': 'dateOfBirth',
      'specialty': 'specialties',
      'specialties': 'specialties',
      'hire date': 'hireDate',
      'start date': 'hireDate',
      'provider type': 'providerType',
      'type': 'providerType'
    }

    return suggestions[normalizedHeader] || null
  }

  const applySuggestions = () => {
    setMappings(prev => prev.map(mapping => {
      if (!mapping.mappedField) {
        const suggestion = findSuggestedMapping(mapping.headerText)
        const availableFields = getAvailableFields(null).map(f => f.value)
        
        if (suggestion && availableFields.includes(suggestion)) {
          return { ...mapping, mappedField: suggestion }
        }
      }
      return mapping
    }))
  }

  const clearAllMappings = () => {
    setMappings(prev => prev.map(mapping => ({ ...mapping, mappedField: null })))
  }

  const handleComplete = () => {
    const configuration: ExcelConfiguration = {
      headerRow: selectedHeaderRow,
      dataStartRow: selectedDataStartRow,
      columnMappings: mappings.filter(m => m.mappedField)
    }
    onComplete(configuration)
  }

  const groupedFields = useMemo(() => {
    return FIELD_CATEGORIES.reduce((acc, category) => {
      acc[category] = PROVIDER_FIELDS.filter(field => field.category === category)
      return acc
    }, {} as Record<string, typeof PROVIDER_FIELDS>)
  }, [])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back to Rows
          </Button>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="font-medium text-sm">Column Mapping</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Header: Row {selectedHeaderRow} • Data: Row {selectedDataStartRow}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={applySuggestions}>
            <Check className="h-3 w-3 mr-1" />
            Auto-Suggest
          </Button>
          <Button variant="outline" size="sm" onClick={clearAllMappings}>
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={getMappedFieldsCount() === 0}
            size="sm"
          >
            Continue ({getMappedFieldsCount()} mapped)
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-50 border-b">
        <p className="text-sm text-blue-700">
          Map each Excel column to the corresponding provider field. Use "Auto-Suggest" for common field names, 
          or manually select from the dropdowns below.
        </p>
      </div>

      {/* Column Mappings */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {mappings.map((mapping) => {
              const availableFields = getAvailableFields(mapping.mappedField)
              const selectedField = PROVIDER_FIELDS.find(f => f.value === mapping.mappedField)
              
              return (
                <Card key={mapping.columnIndex} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="text-center">
                          <div className="font-mono font-bold text-lg text-blue-600">
                            {mapping.columnLetter}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Column
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {mapping.headerText || <span className="text-muted-foreground italic">No header text</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Excel header from row {selectedHeaderRow}
                          </div>
                        </div>
                      </div>

                      <div className="w-64">
                        <Select
                          value={mapping.mappedField || '__none__'}
                          onValueChange={(value) => handleFieldMapping(mapping.columnIndex, value || null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider field..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">
                              <span className="text-muted-foreground">-- No mapping --</span>
                            </SelectItem>
                            {Object.entries(groupedFields).map(([category, fields]) => (
                              <div key={category}>
                                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/50 sticky top-0">
                                  {category}
                                </div>
                                {fields
                                  .filter(field => availableFields.some(af => af.value === field.value))
                                  .map((field) => (
                                    <SelectItem key={field.value} value={field.value}>
                                      {field.label}
                                    </SelectItem>
                                  ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {selectedField && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {selectedField.category} • {selectedField.label}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t bg-muted/30">
        <div className="text-sm text-muted-foreground">
          {getMappedFieldsCount()} of {columns.length} columns mapped
        </div>
        
        <div className="text-xs text-muted-foreground">
          Unmapped columns will be ignored during processing
        </div>
      </div>
    </div>
  )
}