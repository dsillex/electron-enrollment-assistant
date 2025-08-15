import { DocumentField, FieldMapping, ExcelConfiguration } from '@shared/types'
import { BaseDocumentProcessor, ProcessingOptions, ProcessingResult, FillResult } from './base-processor'
import { Workbook, Worksheet, Row, Cell } from 'exceljs'


export class ExcelProcessor extends BaseDocumentProcessor {
  private workbook: Workbook | null = null

  getDocumentType(): string {
    return 'xlsx'
  }

  canProcess(): boolean {
    // Check for Excel document signatures
    const header = this.fileBuffer.slice(0, 4)
    return header.equals(Buffer.from([0x50, 0x4B, 0x03, 0x04])) // ZIP signature (XLSX)
  }

  async analyzeDocument(options: ProcessingOptions = {}): Promise<ProcessingResult> {
    try {
      console.log('=== Excel Analysis Starting ===')
      
      // Load the Excel workbook
      this.workbook = new Workbook()
      await this.workbook.xlsx.load(this.fileBuffer)

      const result: ProcessingResult = {
        success: true,
        fields: [],
        pages: this.workbook.worksheets.length,
        metadata: await this.extractMetadata()
      }

      if (options.detectFields !== false) {
        console.log('Creating simple column-based fields for Excel document...')
        
        // Just create simple column fields for the first sheet
        const worksheet = this.workbook.worksheets[0]
        if (worksheet) {
          const columnCount = Math.min(worksheet.actualColumnCount || 10, 200) // Default to 10, max 200
          result.fields = []
          
          for (let col = 1; col <= columnCount; col++) {
            const columnLetter = this.numberToColumnLetter(col)
            result.fields.push({
              id: `${worksheet.name}!${columnLetter}`,
              name: `Column ${columnLetter}`,
              type: 'text' as const,
              required: false
            })
          }
        } else {
          result.fields = []
        }
      }

      console.log(`Excel analysis complete: ${result.fields.length} fields detected`)
      return result

    } catch (error) {
      console.error('Excel analysis failed:', error)
      return {
        success: false,
        fields: [],
        error: `Failed to analyze Excel: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  async fillDocument(
    mappings: FieldMapping[],
    data: Record<string, any>,
    outputPath: string,
    excelConfig?: ExcelConfiguration
  ): Promise<FillResult> {
    try {
      console.log(`=== Excel Fill Starting ===`)
      console.log(`Mappings: ${mappings.length}`)
      console.log(`Data keys:`, Object.keys(data))
      console.log(`Output: ${outputPath}`)

      if (!this.workbook) {
        throw new Error('Document not analyzed yet. Call analyzeDocument first.')
      }

      const warnings: string[] = []
      
      // Get the first worksheet (main sheet)
      const worksheet = this.workbook.worksheets[0]
      if (!worksheet) {
        throw new Error('No worksheets found in Excel document')
      }

      // Get providers array from data
      const providers = data.providers || (data.provider ? [data.provider] : [])
      if (!Array.isArray(providers) || providers.length === 0) {
        warnings.push('No provider data found')
        console.log('No providers to fill')
      } else {
        console.log(`Filling ${providers.length} provider(s) into Excel sheet`)
        
        // Determine data start row from configuration or default to row 2
        const dataStartRow = excelConfig?.dataStartRow || 2
        console.log(`Using data start row: ${dataStartRow}`)
        
        // Fill each provider as a row starting from configured data start row
        for (let i = 0; i < providers.length; i++) {
          const provider = providers[i]
          const rowNumber = dataStartRow + i
          
          console.log(`Filling provider ${i + 1} into row ${rowNumber}`)
          
          // Use Excel configuration for column mapping if available
          if (excelConfig?.columnMappings) {
            await this.fillProviderRowWithConfig(worksheet, rowNumber, provider, excelConfig.columnMappings)
          } else {
            await this.fillProviderRow(worksheet, rowNumber, provider, mappings)
          }
        }
      }

      // Force recalculation of formulas after filling data
      await this.recalculateWorkbook()
      
      // Save the filled workbook
      const fs = await import('fs-extra')
      const path = await import('path')
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath)
      await fs.ensureDir(outputDir)
      console.log(`Ensured output directory exists: ${outputDir}`)
      
      // Write the workbook
      await this.workbook.xlsx.writeFile(outputPath)
      console.log(`Successfully wrote Excel file to: ${outputPath}`)

      return {
        success: true,
        outputPath,
        warnings: warnings.length > 0 ? warnings : undefined
      }

    } catch (error) {
      console.error('Excel fill failed:', error)
      return {
        success: false,
        error: `Failed to fill Excel: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  async getPreviewData(): Promise<any> {
    try {
      console.log('=== Excel getPreviewData Starting ===')
      
      if (!this.workbook) {
        console.log('Loading workbook from file buffer...')
        this.workbook = new Workbook()
        await this.workbook.xlsx.load(this.fileBuffer)
        console.log('Workbook loaded successfully')
      }

      const sheets = this.workbook.worksheets.map((sheet, index) => ({
        id: sheet.id,
        name: sheet.name,
        index: index,
        rowCount: sheet.rowCount,
        columnCount: sheet.columnCount,
        actualRowCount: sheet.actualRowCount,
        actualColumnCount: sheet.actualColumnCount
      }))
      
      console.log('Excel sheets found:', sheets.length)
      if (sheets.length > 0) {
        console.log('First sheet info:', sheets[0])
      }

      // Get preview data from first sheet (or main sheet)
      const mainSheet = this.workbook.worksheets[0]
      const previewRows: any[] = []
      
      // Only process if we have a valid worksheet
      if (mainSheet) {
        console.log('Main sheet found:', mainSheet.name)
        console.log('Main sheet actualRowCount:', mainSheet.actualRowCount)
        console.log('Main sheet actualColumnCount:', mainSheet.actualColumnCount)
        
        // Always ensure minimum 50x10 grid for roster preview, regardless of actual content
        const actualRows = mainSheet.actualRowCount || 0
        const actualCols = mainSheet.actualColumnCount || 0
        const rowCount = Math.max(50, Math.min(100, actualRows))
        
        // Find the maximum column with data by scanning first 20 rows
        let maxColumnWithData = 10 // minimum for roster files
        const rowsToScan = Math.min(20, actualRows || 10)
        
        console.log(`Scanning ${rowsToScan} rows to find maximum column with data...`)
        for (let rowNum = 1; rowNum <= rowsToScan; rowNum++) {
          const row = mainSheet.getRow(rowNum)
          
          // Check columns up to 200 to find the last one with data
          for (let col = 1; col <= 200; col++) {
            const cell = row.getCell(col)
            if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
              maxColumnWithData = Math.max(maxColumnWithData, col)
            }
          }
        }
        
        // Add buffer columns and ensure reasonable limits
        const colCount = Math.min(200, Math.max(50, maxColumnWithData + 10))
        
        console.log('Column detection results:')
        console.log('- actualColumnCount:', actualCols)
        console.log('- maxColumnWithData found:', maxColumnWithData)
        console.log('- final colCount used:', colCount)
        console.log('Using rowCount:', rowCount, 'colCount:', colCount)
        
        // Get rows for preview (always at least 50x10 grid for roster viewing)
        for (let rowNum = 1; rowNum <= rowCount; rowNum++) {
          const row = mainSheet.getRow(rowNum)
          const cells: any[] = []
          
          for (let colNum = 1; colNum <= colCount; colNum++) {
            const cell = row.getCell(colNum)
            const cellText = this.getCellTextSafely(cell)
            cells.push({
              address: cell.address,
              value: cell.value,
              type: cell.type,
              text: cellText
            })
            
            // Log first few cells to see what we're getting
            if (rowNum <= 2 && colNum <= 10) {
              console.log(`Cell ${cell.address}: value="${cell.value}", text="${cellText}", type="${cell.type}"`)
            }
          }
          
          previewRows.push({
            number: rowNum,
            cells: cells
          })
          
          // Log first few rows to debug column content
          if (rowNum <= 2) {
            console.log(`Row ${rowNum} has ${cells.length} cells (should be ${colCount}):`, cells.slice(0, 10).map(c => c.text || c.value || 'empty'))
          }
        }
      } else {
        console.warn('No main sheet found!')
      }
      
      console.log('Generated previewRows count:', previewRows.length)
      if (previewRows.length > 0) {
        console.log('First row cells count:', previewRows[0].cells?.length)
        console.log('Sample first row:', previewRows[0])
      }

      const result = {
        sheets,
        previewData: previewRows,
        tableInfo: null,
        metadata: await this.extractMetadata()
      }
      
      console.log('Final getPreviewData result structure:')
      console.log('- sheets count:', result.sheets.length)
      console.log('- previewData count:', result.previewData.length)
      console.log('- tableInfo:', result.tableInfo)
      console.log('=== Excel getPreviewData Complete ===')
      
      return result

    } catch (error) {
      console.error('Excel getPreviewData failed:', error)
      throw new Error(`Failed to get Excel preview: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async extractText(): Promise<string> {
    try {
      if (!this.workbook) {
        this.workbook = new Workbook()
        await this.workbook.xlsx.load(this.fileBuffer)
      }

      const allText: string[] = []
      
      for (const worksheet of this.workbook.worksheets) {
        allText.push(`Sheet: ${worksheet.name}`)
        
        worksheet.eachRow((row, rowNumber) => {
          const rowText: string[] = []
          row.eachCell((cell) => {
            const cellText = this.getCellTextSafely(cell)
            if (cellText) {
              rowText.push(cellText)
            }
          })
          if (rowText.length > 0) {
            allText.push(rowText.join('\t'))
          }
        })
        
        allText.push('') // Blank line between sheets
      }

      return allText.join('\n')

    } catch (error) {
      throw new Error(`Failed to extract Excel text: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }





  private async fillProviderRow(
    worksheet: Worksheet, 
    rowNumber: number, 
    provider: any, 
    mappings: FieldMapping[]
  ): Promise<void> {
    const row = worksheet.getRow(rowNumber)
    const formulaCells: Array<{ cell: Cell; originalFormula: string }> = []
    
    // Fill mapped data values
    for (const mapping of mappings) {
      try {
        // Extract column letter from field ID (e.g., "Sheet1!B" -> "B")
        const columnMatch = mapping.documentFieldId.match(/!([A-Z]+)$/)
        if (!columnMatch) {
          console.warn(`Could not parse column from field ID: ${mapping.documentFieldId}`)
          continue
        }
        
        const columnLetter = columnMatch[1]
        const columnNumber = this.columnLetterToNumber(columnLetter)
        const cell = row.getCell(columnNumber)
        
        // Collect existing formulas before modifying
        if (cell.formula) {
          formulaCells.push({
            cell: cell,
            originalFormula: cell.formula
          })
          console.log(`Preserved formula in ${columnLetter}${rowNumber}: ${cell.formula}`)
          continue // Skip cells with formulas
        }
        
        // Get the value to fill
        const value = this.getFieldValue(mapping, { provider, providers: [provider] })
        
        // Set the cell value
        if (value !== null && value !== undefined) {
          cell.value = value
          console.log(`Filled ${columnLetter}${rowNumber} = ${value}`)
        }
        
      } catch (error) {
        console.error(`Failed to fill field ${mapping.documentFieldName}:`, error)
      }
    }
    
    // Restore and update formulas if needed
    formulaCells.forEach(({ cell, originalFormula }) => {
      try {
        // Check if formula needs row adjustment
        const updatedFormula = this.adjustFormulaReferences(originalFormula, rowNumber)
        if (updatedFormula !== originalFormula) {
          cell.formula = updatedFormula
          console.log(`Updated formula: ${originalFormula} -> ${updatedFormula}`)
        }
      } catch (error) {
        console.error('Error updating formula:', error)
        // Keep the original formula if update fails
        cell.formula = originalFormula
      }
    })
    
    // Commit the row
    row.commit()
  }

  private adjustFormulaReferences(formula: string, currentRow: number): string {
    try {
      // Simple formula adjustment for relative references
      // This handles basic cases like SUM(A1:A10) when adding rows
      
      // For now, we'll keep formulas as-is since ExcelJS will handle most cases
      // More sophisticated formula parsing would require a dedicated formula parser
      
      return formula
    } catch (error) {
      console.error('Error adjusting formula references:', error)
      return formula
    }
  }

  private async fillProviderRowWithConfig(
    worksheet: Worksheet, 
    rowNumber: number, 
    provider: any, 
    columnMappings: import('@shared/types').ExcelColumnMapping[]
  ): Promise<void> {
    console.log(`Filling provider row ${rowNumber} with Excel configuration`)
    
    const row = worksheet.getRow(rowNumber)
    
    // Fill each mapped column with the corresponding provider data
    for (const mapping of columnMappings) {
      if (!mapping.providerFieldPath) continue
      
      try {
        // Get the value from the provider using the field path
        const value = this.getNestedValue(provider, mapping.providerFieldPath)
        
        if (value !== null && value !== undefined) {
          // Convert column letter to column number
          const columnNumber = this.columnLetterToNumber(mapping.columnLetter)
          const cell = row.getCell(columnNumber)
          
          // Set the cell value
          cell.value = value
          
          console.log(`Set ${mapping.columnLetter}${rowNumber} (${mapping.headerText}) = ${value}`)
        }
      } catch (error) {
        console.warn(`Error filling column ${mapping.columnLetter} for provider:`, error)
      }
    }
    
    // Commit the row to save changes
    row.commit()
  }

  private async expandTableIfNeeded(worksheet: Worksheet, providerCount: number): Promise<void> {
    console.log(`Table expansion check: ${providerCount} providers added`)
    
    try {
      // Simple approach: ensure we have enough rows for all providers
      // Start from row 2 (assuming row 1 might be headers)
      const lastRowNeeded = 1 + providerCount
      const currentMaxRow = worksheet.actualRowCount
      
      if (lastRowNeeded > currentMaxRow) {
        const rowsToAdd = lastRowNeeded - currentMaxRow
        console.log(`Need to add ${rowsToAdd} rows to accommodate ${providerCount} providers`)
        
        // Insert blank rows to make room for data
        for (let i = 0; i < rowsToAdd; i++) {
          const newRowNumber = currentMaxRow + i + 1
          const newRow = worksheet.getRow(newRowNumber)
          newRow.commit()
        }
        
        console.log(`Added ${rowsToAdd} rows to worksheet`)
      }
      
    } catch (error) {
      console.error('Error during table expansion:', error)
      // Don't throw - table expansion is a nice-to-have feature
    }
  }

  private async expandExcelTables(worksheet: Worksheet, providerCount: number): Promise<void> {
    try {
      // Simple approach: apply basic formatting if there are existing styles
      const headerRow = worksheet.getRow(1) // Assume row 1 is header
      const headerStyle = this.captureRowStyle(headerRow)
      
      // Apply consistent formatting to data rows
      for (let i = 0; i < providerCount; i++) {
        const dataRowNumber = 2 + i // Start from row 2
        const dataRow = worksheet.getRow(dataRowNumber)
        
        // Apply basic formatting to maintain table appearance if headers have formatting
        if (headerStyle.hasBorders) {
          // Apply border formatting to match header style
          for (let col = 1; col <= 20; col++) { // Apply to first 20 columns
            const cell = dataRow.getCell(col)
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            }
          }
        }
        
        dataRow.commit()
      }
      
      console.log(`Applied table formatting to ${providerCount} data rows`)
      
    } catch (error) {
      console.error('Error expanding Excel tables:', error)
    }
  }

  protected getFieldValue(mapping: FieldMapping, data: any): any {
    try {
      // Handle static values
      if (mapping.sourceType === 'static') {
        return mapping.staticValue
      }

      // Handle provider slot mappings
      if (mapping.sourceType === 'provider-slot' && mapping.providerSlot && mapping.slotField) {
        const providers = data.providers || []
        const providerIndex = mapping.providerSlot - 1 // Convert to 0-based index
        if (providerIndex >= 0 && providerIndex < providers.length) {
          const provider = providers[providerIndex]
          return this.getNestedValue(provider, mapping.slotField)
        }
        return null
      }

      // Handle regular data paths
      if (mapping.sourcePath) {
        let value = this.getNestedValue(data, mapping.sourcePath)
        
        // Apply transformations if configured
        if (mapping.transformation && value) {
          value = this.applyTransformation(value, mapping.transformation, data)
        }
        
        return value
      }

      // Use default value if available
      return mapping.defaultValue || null
    } catch (error) {
      console.warn(`Error getting field value for ${mapping.documentFieldName}:`, error)
      return mapping.defaultValue || null
    }
  }

  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return null
    
    const keys = path.split('.')
    let current = obj
    
    for (const key of keys) {
      if (current == null) return null
      current = current[key]
    }
    
    return current
  }

  protected applyTransformation(value: any, transformation: any, data: any): any {
    try {
      switch (transformation.type) {
        case 'nameFormat':
          return this.formatName(value, transformation.config, data)
        case 'concatenate':
          return this.concatenateFields(transformation.config, data)
        case 'format':
          return this.formatExcelValue(value, transformation.config)
        default:
          return value
      }
    } catch (error) {
      console.warn('Error applying transformation:', error)
      return value
    }
  }

  private formatName(value: any, config: any, data: any): string {
    const provider = data.provider || (data.providers && data.providers[0])
    if (!provider) return value?.toString() || ''

    const first = provider.firstName || ''
    const middle = provider.middleName || ''
    const last = provider.lastName || ''

    switch (config.format) {
      case 'firstLast':
        return `${first} ${last}`.trim()
      case 'lastFirst':
        return `${last}, ${first}`.trim()
      case 'full':
        return `${first} ${middle} ${last}`.replace(/\s+/g, ' ').trim()
      case 'lastFirstMI':
        const mi = middle ? middle.charAt(0) + '.' : ''
        return `${last}, ${first} ${mi}`.trim()
      default:
        return value?.toString() || ''
    }
  }

  private concatenateFields(config: any, data: any): string {
    const sources = config.sources || []
    const separator = config.separator || ' '
    
    const values = sources.map((sourcePath: string) => {
      return this.getNestedValue(data, sourcePath) || ''
    }).filter((v: string) => v.length > 0)
    
    return values.join(separator)
  }

  private formatExcelValue(value: any, config: any): any {
    // Basic value formatting - can be extended
    if (config.type === 'date' && value) {
      return new Date(value).toLocaleDateString()
    }
    if (config.type === 'currency' && value) {
      return `$${parseFloat(value).toFixed(2)}`
    }
    return value
  }

  private captureRowStyle(row: Row): { hasBorders: boolean; hasBackground: boolean } {
    let hasBorders = false
    let hasBackground = false
    
    try {
      // Check first few cells to determine if this row has table styling
      for (let col = 1; col <= 5; col++) {
        const cell = row.getCell(col)
        
        if (cell.border && (
          cell.border.top?.style || 
          cell.border.left?.style || 
          cell.border.bottom?.style || 
          cell.border.right?.style
        )) {
          hasBorders = true
        }
        
        if (cell.fill && cell.fill !== 'none') {
          hasBackground = true
        }
      }
    } catch (error) {
      console.warn('Error capturing row style:', error)
    }
    
    return { hasBorders, hasBackground }
  }

  private getCellTextSafely(cell: Cell): string {
    try {
      // AVOID cell.text property entirely - it causes the null.toString() error
      // Only use cell.value directly
      if (!cell.value) {
        return ''
      }

      // Handle different value types
      if (typeof cell.value === 'string') {
        return cell.value.trim()
      }
      
      if (typeof cell.value === 'number') {
        return cell.value.toString()
      }
      
      if (typeof cell.value === 'boolean') {
        return cell.value.toString()
      }
      
      // Handle rich text objects
      if (typeof cell.value === 'object' && cell.value !== null) {
        // ExcelJS rich text object
        if ('richText' in cell.value) {
          const richText = cell.value as any
          if (Array.isArray(richText.richText)) {
            return richText.richText.map((rt: any) => rt.text || '').join('').trim()
          }
        }
        
        // Formula result object
        if ('result' in cell.value) {
          const result = (cell.value as any).result
          return result ? result.toString().trim() : ''
        }
        
        // Try to stringify other objects
        return cell.value.toString().trim()
      }

      return ''
    } catch (error) {
      console.warn(`Error getting cell text at ${cell.address}:`, error)
      return ''
    }
  }

  private async recalculateWorkbook(): Promise<void> {
    if (!this.workbook) return
    
    try {
      console.log('Triggering formula recalculation for workbook')
      
      // Set calculation properties to ensure formulas recalculate
      this.workbook.calcProperties = {
        calcId: Date.now(), // Force recalculation with new calc ID
        calcMode: 'automatic',
        refMode: 'A1',
        iterate: false,
        iterateCount: 100,
        iterateDelta: 0.001
      }
      
      // Force recalculation on all worksheets
      for (const worksheet of this.workbook.worksheets) {
        // Mark worksheet for recalculation
        if (worksheet.properties) {
          worksheet.properties.defaultRowHeight = worksheet.properties.defaultRowHeight || 15
        }
        
        // Process all cells with formulas to mark them for recalc
        worksheet.eachRow((row) => {
          row.eachCell((cell) => {
            if (cell.formula) {
              // Force Excel to recalculate by clearing and resetting formula
              const formula = cell.formula
              cell.value = { formula }
              console.log(`Marked formula for recalculation: ${cell.address} = ${formula}`)
            }
          })
        })
      }
      
      console.log('Formula recalculation setup complete')
      
    } catch (error) {
      console.error('Error during formula recalculation:', error)
      // Don't throw - recalculation is a nice-to-have feature
    }
  }

  private numberToColumnLetter(columnNumber: number): string {
    let result = ''
    while (columnNumber > 0) {
      columnNumber--
      result = String.fromCharCode(65 + (columnNumber % 26)) + result
      columnNumber = Math.floor(columnNumber / 26)
    }
    return result
  }

  private columnLetterToNumber(columnLetter: string): number {
    let result = 0
    for (let i = 0; i < columnLetter.length; i++) {
      result = result * 26 + (columnLetter.charCodeAt(i) - 65 + 1)
    }
    return result
  }

  private async extractMetadata(): Promise<Record<string, any>> {
    if (!this.workbook) {
      return this.getBaseMetadata()
    }

    try {
      const metadata = {
        ...this.getBaseMetadata(),
        title: this.workbook.title || undefined,
        subject: this.workbook.subject || undefined,
        creator: this.workbook.creator || undefined,
        lastModifiedBy: this.workbook.lastModifiedBy || undefined,
        created: this.workbook.created?.toISOString() || undefined,
        modified: this.workbook.modified?.toISOString() || undefined,
        sheetCount: this.workbook.worksheets.length,
        sheetNames: this.workbook.worksheets.map(ws => ws.name),
        format: 'Excel'
      }

      return metadata
    } catch (error) {
      console.warn('Failed to extract full metadata:', error)
      return this.getBaseMetadata()
    }
  }
}