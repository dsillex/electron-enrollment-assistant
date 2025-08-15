import { DocumentField, FieldMapping, ProcessedDocument } from '@shared/types'
import { applyTransformation } from './transformations'

export interface ProcessingOptions {
  detectFields?: boolean
  extractText?: boolean
  preserveFormatting?: boolean
}

export interface ProcessingResult {
  success: boolean
  fields: DocumentField[]
  pages?: number
  error?: string
  metadata?: {
    title?: string
    author?: string
    createdDate?: string
    modifiedDate?: string
    format?: string
  }
}

export interface FillResult {
  success: boolean
  outputPath?: string
  error?: string
  warnings?: string[]
}

export abstract class BaseDocumentProcessor {
  protected filePath: string
  protected fileBuffer: Buffer

  constructor(filePath: string, fileBuffer: Buffer) {
    this.filePath = filePath
    this.fileBuffer = fileBuffer
  }

  /**
   * Analyze the document and extract available fields
   */
  abstract analyzeDocument(options?: ProcessingOptions): Promise<ProcessingResult>

  /**
   * Fill the document with provided data using field mappings
   */
  abstract fillDocument(
    mappings: FieldMapping[],
    data: Record<string, any>,
    outputPath: string,
    excelConfig?: any
  ): Promise<FillResult>

  /**
   * Get the document type (pdf, docx, xlsx)
   */
  abstract getDocumentType(): string

  /**
   * Validate if the processor can handle this file
   */
  abstract canProcess(): boolean

  /**
   * Get document preview data (pages, thumbnails, etc.)
   */
  abstract getPreviewData(): Promise<any>

  /**
   * Extract text content from the document
   */
  abstract extractText(): Promise<string>

  /**
   * Get document metadata
   */
  protected getBaseMetadata(): Record<string, any> {
    return {
      filePath: this.filePath,
      fileSize: this.fileBuffer.length,
      processedAt: new Date().toISOString()
    }
  }

  /**
   * Helper method to resolve JSON paths in data objects
   */
  protected resolveJsonPath(data: Record<string, any>, path: string): any {
    return path.split('.').reduce((obj, key) => obj?.[key], data)
  }

  /**
   * Helper method to apply field transformations
   */
  protected applyTransformation(value: any, mapping: FieldMapping, allData?: Record<string, any>): any {
    if (!mapping.transformation) return value

    return applyTransformation(value, mapping.transformation, allData)
  }

  private formatValue(value: any, config: any): string {
    if (!value) return ''

    switch (config.format) {
      case 'date':
        return this.formatDate(value, config.dateFormat || 'MM/dd/yyyy')
      case 'phone':
        return this.formatPhone(value)
      case 'ssn':
        return this.formatSSN(value)
      case 'uppercase':
        return String(value).toUpperCase()
      case 'lowercase':
        return String(value).toLowerCase()
      default:
        return String(value)
    }
  }

  private concatenateValues(value: any, config: any): string {
    const values = Array.isArray(value) ? value : [value]
    const separator = config.separator || ' '
    return values.filter(v => v).join(separator)
  }

  private applyConditional(value: any, config: any): any {
    // Simple conditional logic: if value matches condition, return thenValue, else elseValue
    const { condition, thenValue, elseValue } = config
    
    if (this.evaluateCondition(value, condition)) {
      return thenValue
    }
    return elseValue
  }

  private lookupValue(value: any, config: any): any {
    const { lookupTable } = config
    return lookupTable[value] || value
  }

  private evaluateCondition(value: any, condition: string): boolean {
    // Simple condition evaluation - can be extended
    const [operator, compareValue] = condition.split(' ')
    
    switch (operator) {
      case '==':
        return value == compareValue
      case '!=':
        return value != compareValue
      case '>':
        return Number(value) > Number(compareValue)
      case '<':
        return Number(value) < Number(compareValue)
      case 'contains':
        return String(value).includes(compareValue)
      default:
        return false
    }
  }

  private formatDate(value: any, format: string): string {
    try {
      const date = new Date(value)
      if (isNaN(date.getTime())) return String(value)

      // Simple date formatting - could use date-fns for more complex formatting
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const year = date.getFullYear()

      switch (format) {
        case 'MM/dd/yyyy':
          return `${month}/${day}/${year}`
        case 'dd/MM/yyyy':
          return `${day}/${month}/${year}`
        case 'yyyy-MM-dd':
          return `${year}-${month}-${day}`
        default:
          return date.toLocaleDateString()
      }
    } catch {
      return String(value)
    }
  }

  private formatPhone(value: any): string {
    const phone = String(value).replace(/\D/g, '')
    if (phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
    }
    return String(value)
  }

  private formatSSN(value: any): string {
    const ssn = String(value).replace(/\D/g, '')
    if (ssn.length === 9) {
      return `${ssn.slice(0, 3)}-${ssn.slice(3, 5)}-${ssn.slice(5)}`
    }
    return String(value)
  }

  /**
   * Validate field mappings against document fields
   */
  protected validateMappings(mappings: FieldMapping[], documentFields: DocumentField[]): string[] {
    const warnings: string[] = []
    const documentFieldIds = new Set(documentFields.map(f => f.id))

    for (const mapping of mappings) {
      if (!documentFieldIds.has(mapping.documentFieldId)) {
        warnings.push(`Field "${mapping.documentFieldName}" not found in document`)
      }
    }

    return warnings
  }

  /**
   * Get field value from data using the mapping configuration
   */
  protected getFieldValue(mapping: FieldMapping, data: Record<string, any>): any {
    let value: any

    // If a static value is provided, use it directly
    if (mapping.staticValue !== undefined) {
      value = mapping.staticValue
    } else if (mapping.sourcePath) {
      switch (mapping.sourceType) {
        case 'provider':
          value = this.resolveJsonPath(data.provider, mapping.sourcePath.replace('provider.', ''))
          break
        case 'provider-slot':
          // For roster mode: get provider at specific slot position
          if (mapping.providerSlot && mapping.slotField && data.providers && Array.isArray(data.providers)) {
            const providerIndex = mapping.providerSlot - 1 // Convert 1-based to 0-based index
            const provider = data.providers[providerIndex]
            if (provider) {
              value = this.resolveJsonPath(provider, mapping.slotField)
            }
          }
          break
        case 'office':
          value = this.resolveJsonPath(data.office, mapping.sourcePath.replace('office.', ''))
          break
        case 'mailing':
          value = this.resolveJsonPath(data.mailingAddress, mapping.sourcePath.replace('mailing.', ''))
          break
        case 'custom':
          value = this.resolveJsonPath(data.custom, mapping.sourcePath.replace('custom.', ''))
          break
        case 'static':
          // Handle system-generated values
          if (mapping.sourcePath === 'static.currentDate') {
            value = new Date().toLocaleDateString()
          } else if (mapping.sourcePath === 'static.applicationDate') {
            value = new Date().toLocaleDateString()
          } else {
            value = mapping.defaultValue
          }
          break
        default:
          value = this.resolveJsonPath(data, mapping.sourcePath)
      }
    } else {
      // No source path provided, use default value
      value = mapping.defaultValue
    }

    // Apply transformation if specified
    if (mapping.transformation) {
      value = this.applyTransformation(value, mapping, data)
    }

    // Use default value if no value found and default is specified
    if ((value === undefined || value === null || value === '') && mapping.defaultValue !== undefined) {
      value = mapping.defaultValue
    }

    return value
  }
}