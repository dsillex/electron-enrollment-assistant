import React, { useState, useEffect } from 'react'
import { DocumentField, ExcelConfiguration } from '@shared/types'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { ExcelColumnMapper } from './ExcelColumnMapper'
import { 
  FileSpreadsheet, 
  Grid3x3, 
  Hash, 
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings,
  CheckCircle2 
} from 'lucide-react'

interface ExcelViewerProps {
  filePath: string
  currentPage: number
  zoom: number
  showFields: boolean
  fields: DocumentField[]
  onPageChange: (page: number) => void
  onConfigurationComplete?: (configuration: ExcelConfiguration) => void
}

interface ExcelPreviewData {
  sheets: Array<{
    id: number
    name: string
    index: number
    rowCount: number
    columnCount: number
    actualRowCount: number
    actualColumnCount: number
  }>
  previewData: Array<{
    number: number
    cells: Array<{
      address: string
      value: any
      type: string
      text: string
    }>
  }>
  tableInfo?: {
    sheetName: string
    headerRow: number
    dataStartRow: number
    headers: Record<string, string>
    columnCount: number
  } | null
  metadata?: any
}

export function ExcelViewer({
  filePath,
  currentPage,
  zoom,
  showFields,
  fields,
  onPageChange,
  onConfigurationComplete
}: ExcelViewerProps) {
  const [previewData, setPreviewData] = useState<ExcelPreviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSheet, setActiveSheet] = useState<string>('')
  const [localZoom, setLocalZoom] = useState(zoom)
  
  // Row selection state
  const [rowSelectionMode, setRowSelectionMode] = useState<'none' | 'header' | 'dataStart'>('none')
  const [selectedHeaderRow, setSelectedHeaderRow] = useState<number | null>(null)
  const [selectedDataStartRow, setSelectedDataStartRow] = useState<number | null>(null)
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [showColumnMapper, setShowColumnMapper] = useState(false)
  const [excelConfiguration, setExcelConfiguration] = useState<ExcelConfiguration | null>(null)

  useEffect(() => {
    setLocalZoom(zoom)
  }, [zoom])

  useEffect(() => {
    if (filePath) {
      loadExcelPreview()
    }
  }, [filePath])

  const loadExcelPreview = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('=== ExcelViewer loadExcelPreview Starting ===')
      console.log('Loading Excel preview for:', filePath)
      
      const preview = await window.electronAPI.getDocumentPreview(filePath)
      console.log('Raw Excel preview response:', preview)
      console.log('Preview type:', typeof preview)
      console.log('Preview keys:', Object.keys(preview || {}))
      
      // Handle wrapped response from IPC
      const actualPreviewData = preview.data || preview
      console.log('Actual preview data after unwrapping:', actualPreviewData)
      console.log('Actual preview data type:', typeof actualPreviewData)
      console.log('Actual preview data keys:', Object.keys(actualPreviewData || {}))
      
      if (actualPreviewData) {
        console.log('Preview data sheets:', actualPreviewData.sheets?.length || 0)
        console.log('Preview data previewData length:', actualPreviewData.previewData?.length || 0)
        
        if (actualPreviewData.previewData && actualPreviewData.previewData.length > 0) {
          console.log('First row sample:', actualPreviewData.previewData[0])
          console.log('First row cells count:', actualPreviewData.previewData[0].cells?.length || 0)
        }
      }
      
      setPreviewData(actualPreviewData)
      
      // Set active sheet to first sheet
      if (actualPreviewData.sheets && actualPreviewData.sheets.length > 0) {
        const firstSheet = actualPreviewData.sheets[0].name
        console.log('Setting active sheet to:', firstSheet)
        setActiveSheet(firstSheet)
        
        // Update current page to match sheet index
        const sheetIndex = actualPreviewData.sheets.findIndex(s => s.name === firstSheet)
        if (sheetIndex >= 0) {
          onPageChange(sheetIndex + 1)
        }
      }
      
      console.log('=== ExcelViewer loadExcelPreview Complete ===')
      
    } catch (err) {
      console.error('Failed to load Excel preview:', err)
      setError(err instanceof Error ? err.message : 'Failed to load Excel preview')
    } finally {
      setLoading(false)
    }
  }

  const handleZoomIn = () => {
    setLocalZoom(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setLocalZoom(prev => Math.max(prev - 25, 25))
  }

  const handleResetZoom = () => {
    setLocalZoom(100)
  }

  const handleConfigureRows = () => {
    setIsConfiguring(true)
    setRowSelectionMode('header')
    // Only reset selections if starting fresh (not if returning from column mapper)
    if (!selectedHeaderRow && !selectedDataStartRow) {
      setSelectedHeaderRow(null)
      setSelectedDataStartRow(null)
    }
  }

  const handleRowClick = (rowNumber: number) => {
    if (!isConfiguring) return
    
    if (rowSelectionMode === 'header') {
      setSelectedHeaderRow(rowNumber)
      setRowSelectionMode('dataStart')
    } else if (rowSelectionMode === 'dataStart') {
      if (rowNumber <= (selectedHeaderRow || 0)) {
        // Data start must be after header row
        return
      }
      setSelectedDataStartRow(rowNumber)
      setRowSelectionMode('none')
    }
  }

  const handleCancelConfiguration = () => {
    setIsConfiguring(false)
    setRowSelectionMode('none')
    setSelectedHeaderRow(null)
    setSelectedDataStartRow(null)
  }

  const handleFinishConfiguration = () => {
    if (selectedHeaderRow && selectedDataStartRow) {
      setIsConfiguring(false)
      setRowSelectionMode('none')
      
      // Generate Excel configuration directly without column mapper
      const configuration: ExcelConfiguration = {
        headerRow: selectedHeaderRow,
        dataStartRow: selectedDataStartRow,
        columnMappings: getColumnsForMapper().map(col => ({
          columnIndex: col.index + 1,
          columnLetter: col.letter,
          headerText: col.headerText,
          mappedField: null,
          providerFieldPath: '' // Will be mapped in FieldMapper
        }))
      }
      
      // Pass configuration up to parent (skip column mapper)
      if (onConfigurationComplete) {
        onConfigurationComplete(configuration)
      }
      
      console.log('Row configuration complete, skipping column mapper:', {
        headerRow: selectedHeaderRow,
        dataStartRow: selectedDataStartRow,
        columns: configuration.columnMappings.length
      })
    }
  }

  const handleBackToRowSelection = () => {
    setShowColumnMapper(false)
    setIsConfiguring(true)
    // Reset to header selection mode to allow reconfiguration
    setRowSelectionMode('header')
    // Keep the existing selections so user can see what they had selected
  }

  const handleColumnMappingComplete = (configuration: ExcelConfiguration) => {
    console.log('Excel configuration complete:', configuration)
    setExcelConfiguration(configuration)
    setShowColumnMapper(false)
    
    // Pass configuration up to parent component
    if (onConfigurationComplete) {
      onConfigurationComplete(configuration)
    }
    
    console.log('Excel configuration stored:', {
      headerRow: configuration.headerRow,
      dataStartRow: configuration.dataStartRow,
      mappedColumns: configuration.columnMappings.length
    })
  }


  const getRowClassName = (rowNumber: number) => {
    const baseClass = "hover:bg-muted/50"
    
    if (!isConfiguring) return baseClass
    
    if (selectedHeaderRow === rowNumber) {
      return "bg-blue-100 hover:bg-blue-200 border-l-4 border-blue-500"
    }
    
    if (selectedDataStartRow === rowNumber) {
      return "bg-green-100 hover:bg-green-200 border-l-4 border-green-500"
    }
    
    if (rowSelectionMode === 'header') {
      return "hover:bg-blue-50 cursor-pointer"
    }
    
    if (rowSelectionMode === 'dataStart' && rowNumber > (selectedHeaderRow || 0)) {
      return "hover:bg-green-50 cursor-pointer"
    }
    
    return baseClass
  }

  const getRowNumberClassName = (rowNumber: number) => {
    const baseClass = "text-center font-mono text-sm font-bold border bg-muted/30 sticky left-0 z-10"
    
    if (!isConfiguring) return baseClass
    
    if (selectedHeaderRow === rowNumber) {
      return "text-center font-mono text-sm border bg-blue-500 text-white font-bold sticky left-0 z-10 w-16"
    }
    
    if (selectedDataStartRow === rowNumber) {
      return "text-center font-mono text-sm border bg-green-500 text-white font-bold sticky left-0 z-10 w-16"
    }
    
    return baseClass
  }

  const generateColumnHeaders = (columnCount: number): string[] => {
    const headers: string[] = []
    for (let i = 1; i <= columnCount; i++) {
      headers.push(numberToColumnLetter(i))
    }
    return headers
  }

  const numberToColumnLetter = (columnNumber: number): string => {
    let result = ''
    while (columnNumber > 0) {
      columnNumber--
      result = String.fromCharCode(65 + (columnNumber % 26)) + result
      columnNumber = Math.floor(columnNumber / 26)
    }
    return result
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 p-4">
        <div className="text-center space-y-4">
          <Grid3x3 className="h-12 w-12 text-muted-foreground mx-auto animate-pulse" />
          <div>
            <p className="font-medium">Loading Excel Document</p>
            <p className="text-sm text-muted-foreground">Analyzing spreadsheet...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 p-4">
        <div className="text-center space-y-4">
          <FileSpreadsheet className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <p className="font-medium text-destructive">Failed to Load Excel</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={loadExcelPreview} className="mt-2">
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!previewData) {
    return (
      <div className="flex items-center justify-center h-64 p-4">
        <div className="text-center space-y-4">
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <p className="font-medium">No Preview Available</p>
            <p className="text-sm text-muted-foreground">Unable to preview Excel document</p>
          </div>
        </div>
      </div>
    )
  }

  // Use the column count from the processor, or fall back to cell array length with minimum 50 for rosters
  const maxColumnsFromData = Math.max(...((previewData.previewData || []).map(row => row.cells?.length || 0)), 0)
  const maxColumns = Math.max(maxColumnsFromData, 50) // Always show at least 50 columns for rosters
  const columnHeaders = generateColumnHeaders(Math.min(maxColumns, 200)) // Allow up to 200 columns for wide rosters
  
  // Calculate table width for scrollbar synchronization
  const tableWidth = `${(120 + (columnHeaders.length * 200)) * (localZoom / 100)}px`

  // Filter preview data based on configuration
  const getFilteredPreviewData = () => {
    if (!previewData?.previewData || !selectedHeaderRow || !selectedDataStartRow) {
      // If not configured, show all rows
      return previewData?.previewData || []
    }
    
    // When configured, show only relevant rows:
    // - 1-2 context rows before header (if any)
    // - Header row
    // - All data rows from data start onwards
    const contextRowsBefore = Math.max(1, selectedHeaderRow - 2)
    
    return previewData.previewData.filter(row => {
      return row.number >= contextRowsBefore
    })
  }
  
  const filteredPreviewData = getFilteredPreviewData()

  // Generate column data for mapper
  const getColumnsForMapper = () => {
    if (!selectedHeaderRow || !previewData?.previewData) return []
    
    const headerRowData = previewData.previewData.find(row => row.number === selectedHeaderRow)
    if (!headerRowData) return []
    
    return columnHeaders.map((letter, index) => ({
      letter,
      index,
      headerText: headerRowData.cells?.[index]?.text || headerRowData.cells?.[index]?.value?.toString() || ''
    }))
  }

  console.log('=== ExcelViewer Render Debug ===')
  console.log('previewData exists:', !!previewData)
  console.log('previewData.previewData length:', previewData?.previewData?.length || 0)
  console.log('filteredPreviewData length:', filteredPreviewData?.length || 0)
  console.log('maxColumnsFromData:', maxColumnsFromData)
  console.log('maxColumns (final):', maxColumns)
  console.log('columnHeaders length:', columnHeaders.length)
  console.log('First 10 columnHeaders:', columnHeaders.slice(0, 10))
  console.log('showColumnMapper:', showColumnMapper)
  console.log('selectedHeaderRow:', selectedHeaderRow)
  console.log('selectedDataStartRow:', selectedDataStartRow)
  
  if (previewData?.previewData && previewData.previewData.length > 0) {
    console.log('Sample row for rendering:', previewData.previewData[0])
    console.log('Sample row cells length:', previewData.previewData[0].cells?.length)
    console.log('First 10 cells of sample row:', previewData.previewData[0].cells?.slice(0, 10).map(c => c.text || c.value || 'empty'))
  }

  // Show column mapper if configured
  if (showColumnMapper && selectedHeaderRow && selectedDataStartRow) {
    return (
      <ExcelColumnMapper
        columns={getColumnsForMapper()}
        selectedHeaderRow={selectedHeaderRow}
        selectedDataStartRow={selectedDataStartRow}
        onBack={handleBackToRowSelection}
        onComplete={handleColumnMappingComplete}
      />
    )
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30 overflow-hidden flex-shrink-0">
        <div className="flex items-center space-x-4 min-w-0 flex-shrink">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="font-medium text-sm">
              {filePath.split('/').pop() || filePath.split('\\').pop()}
            </span>
          </div>
          
          
          {fields.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {fields.length} field{fields.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-4 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={localZoom <= 25}>
              <ZoomOut className="h-3 w-3" />
            </Button>
            <span className="text-xs min-w-[60px] text-center">{localZoom}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={localZoom >= 200}>
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetZoom}>
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="h-4 w-px bg-border"></div>
          
          <Button 
            variant={showFields ? "default" : "outline"} 
            size="sm"
            onClick={() => {}}
          >
            {showFields ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            Fields
          </Button>
        </div>
      </div>

      {/* Excel Configuration Section */}
      <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-b overflow-hidden flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Excel Roster Configuration</span>
          </div>
          {excelConfiguration && (
            <div className="flex items-center space-x-2 text-xs text-blue-700">
              <span>Header: Row {excelConfiguration.headerRow}</span>
              <span>•</span>
              <span>Data: Row {excelConfiguration.dataStartRow}</span>
              <span>•</span>
              <span>{excelConfiguration.columnMappings.length} columns mapped</span>
            </div>
          )}
        </div>
        
        <Button 
          variant="default" 
          size="sm" 
          onClick={handleConfigureRows}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Settings className="h-3 w-3 mr-1" />
          {excelConfiguration ? 'Reconfigure Rows' : 'Configure Rows'}
        </Button>
      </div>

      {/* Row Configuration Banner */}
      {isConfiguring && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-yellow-800">
                {rowSelectionMode === 'header' && (
                  <span>👆 <strong>Click on the row</strong> that contains your column headers (e.g., "First Name", "Last Name", "NPI")</span>
                )}
                {rowSelectionMode === 'dataStart' && (
                  <span>👆 <strong>Click on the first row</strong> where provider data begins (after headers)</span>
                )}
                {rowSelectionMode === 'none' && selectedHeaderRow && selectedDataStartRow && (
                  <span>✅ <strong>Configuration complete!</strong> Ready to proceed to column mapping.</span>
                )}
              </div>
              
              {selectedHeaderRow && (
                <div className="text-sm">
                  <span className="font-medium text-blue-600">Header Row:</span> Row {selectedHeaderRow}
                </div>
              )}
              
              {selectedDataStartRow && (
                <div className="text-sm">
                  <span className="font-medium text-green-600">Data Start Row:</span> Row {selectedDataStartRow}
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancelConfiguration}
              >
                Cancel
              </Button>
              
              {selectedHeaderRow && selectedDataStartRow && (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleFinishConfiguration}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Continue to Mapping
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sheet Tabs */}
      {previewData?.sheets?.length > 1 && (
        <Tabs value={activeSheet} onValueChange={setActiveSheet} className="flex-none">
          <TabsList className="w-full justify-start h-8 p-0 bg-muted/50">
            {(previewData?.sheets || []).map((sheet) => (
              <TabsTrigger 
                key={sheet.name} 
                value={sheet.name}
                className="text-xs px-4 h-8"
                onClick={() => onPageChange(sheet.index + 1)}
              >
                {sheet.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}


      {/* Spreadsheet Grid */}
      <div className={`flex-1 relative ${isConfiguring ? 'bg-yellow-50/30' : ''}`}>
        <div className="overflow-auto h-full" style={{ padding: '8px', fontSize: `${localZoom}%` }}>
            <Table 
              className="border-collapse" 
              style={{ 
                width: tableWidth,
                tableLayout: 'fixed',
                minWidth: '100%'
              }}
            >
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead 
                    className="text-center font-mono text-sm font-bold border sticky left-0 bg-muted/50 z-10"
                    style={{ 
                      width: `${120 * (localZoom / 100)}px`, 
                      minWidth: `${120 * (localZoom / 100)}px`, 
                      maxWidth: `${120 * (localZoom / 100)}px` 
                    }}
                  >
                    ROW
                  </TableHead>
                  {columnHeaders.map((letter, index) => (
                    <TableHead 
                      key={letter} 
                      className="text-center font-mono text-sm font-bold border px-2"
                      style={{ 
                        width: `${200 * (localZoom / 100)}px`, 
                        minWidth: `${200 * (localZoom / 100)}px`, 
                        maxWidth: `${200 * (localZoom / 100)}px` 
                      }}
                    >
                      {letter}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(filteredPreviewData && filteredPreviewData.length > 0) ? (
                  filteredPreviewData.map((row) => (
                    <TableRow 
                      key={row.number}
                      className={getRowClassName(row.number)}
                      onClick={() => handleRowClick(row.number)}
                    >
                      <TableCell 
                        className={getRowNumberClassName(row.number)} 
                        style={{ 
                          width: `${120 * (localZoom / 100)}px`, 
                          minWidth: `${120 * (localZoom / 100)}px`, 
                          maxWidth: `${120 * (localZoom / 100)}px` 
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-bold">{row.number}</span>
                          {selectedHeaderRow === row.number && (
                            <span className="text-[9px] font-bold text-white tracking-tight">HDR</span>
                          )}
                          {selectedDataStartRow === row.number && (
                            <span className="text-[9px] font-bold text-white tracking-tight">DATA</span>
                          )}
                        </div>
                      </TableCell>
                      
                      {columnHeaders.map((letter, colIndex) => {
                        const cell = row.cells?.[colIndex]
                        const cellValue = cell?.text || cell?.value?.toString() || ''
                        
                        return (
                          <TableCell 
                            key={`${row.number}-${letter}`}
                            className="text-sm border px-2 py-1 bg-white"
                            style={{ 
                              width: `${200 * (localZoom / 100)}px`, 
                              minWidth: `${200 * (localZoom / 100)}px`, 
                              maxWidth: `${200 * (localZoom / 100)}px` 
                            }}
                            title={cellValue || `${letter}${row.number}`}
                          >
                            <div className="truncate min-h-[20px]">
                              {cellValue || <span className="text-gray-300 text-xs">&nbsp;</span>}
                            </div>
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))
                ) : (
                  // Fallback: Generate empty grid if no preview data
                  Array.from({ length: 10 }, (_, rowIndex) => (
                    <TableRow 
                      key={`fallback-${rowIndex + 1}`}
                      className="hover:bg-muted/50"
                    >
                      <TableCell 
                        className="text-center font-mono text-sm font-bold border bg-muted/30 sticky left-0 z-10" 
                        style={{ 
                          width: `${120 * (localZoom / 100)}px`, 
                          minWidth: `${120 * (localZoom / 100)}px`, 
                          maxWidth: `${120 * (localZoom / 100)}px` 
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-bold">{rowIndex + 1}</span>
                        </div>
                      </TableCell>
                      
                      {columnHeaders.map((letter, colIndex) => (
                        <TableCell 
                          key={`fallback-${rowIndex + 1}-${letter}`}
                          className="text-sm border px-2 py-1 bg-white"
                          style={{ 
                            width: `${200 * (localZoom / 100)}px`, 
                            minWidth: `${200 * (localZoom / 100)}px`, 
                            maxWidth: `${200 * (localZoom / 100)}px` 
                          }}
                        >
                          <div className="truncate min-h-[20px]">
                            <span className="text-gray-300 text-xs">&nbsp;</span>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between p-2 border-t bg-muted/30 text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Click "Configure Rows" to set up Excel roster processing</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>Sheet: {activeSheet}</span>
          <span>Showing {filteredPreviewData?.length || 0} rows × {columnHeaders.length} columns</span>
          {selectedHeaderRow && selectedDataStartRow && (
            <span className="text-blue-600">• Filtered view</span>
          )}
          {maxColumns > 200 && (
            <span className="text-yellow-600 text-xs">(Limited to 200 columns for performance)</span>
          )}
        </div>
      </div>
    </div>
  )
}