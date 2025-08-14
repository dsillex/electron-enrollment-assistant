import { PDFDocument, PDFForm, PDFField, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown } from 'pdf-lib'
import { DocumentField, FieldMapping } from '@shared/types'
import { BaseDocumentProcessor, ProcessingOptions, ProcessingResult, FillResult } from './base-processor'

export class PdfProcessor extends BaseDocumentProcessor {
  private pdfDocument: PDFDocument | null = null
  private pdfForm: PDFForm | null = null

  getDocumentType(): string {
    return 'pdf'
  }

  canProcess(): boolean {
    try {
      // Basic validation - check if it starts with PDF header
      const header = this.fileBuffer.slice(0, 4).toString()
      return header === '%PDF'
    } catch {
      return false
    }
  }

  async analyzeDocument(options: ProcessingOptions = {}): Promise<ProcessingResult> {
    try {
      // Load PDF document
      this.pdfDocument = await PDFDocument.load(this.fileBuffer)
      this.pdfForm = this.pdfDocument.getForm()

      const result: ProcessingResult = {
        success: true,
        fields: [],
        pages: this.pdfDocument.getPageCount(),
        metadata: await this.extractMetadata()
      }

      if (options.detectFields !== false) {
        result.fields = await this.extractFields()
      }

      return result
    } catch (error) {
      return {
        success: false,
        fields: [],
        error: `Failed to analyze PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  async fillDocument(
    mappings: FieldMapping[],
    data: Record<string, any>,
    outputPath: string
  ): Promise<FillResult> {
    try {
      console.log(`PDF fillDocument called with ${mappings.length} mappings`)
      console.log(`Data keys:`, Object.keys(data))
      console.log(`Output path:`, outputPath)
      
      if (!this.pdfDocument || !this.pdfForm) {
        throw new Error('Document not loaded or has no form fields. Call analyzeDocument first.')
      }

      if (!mappings || mappings.length === 0) {
        console.warn('No field mappings provided - document will be saved without changes')
      }

      const warnings: string[] = []
      const documentFields = await this.extractFields()
      console.log(`Document has ${documentFields.length} fillable fields:`, documentFields.map(f => f.id))
      
      const validationWarnings = this.validateMappings(mappings, documentFields)
      warnings.push(...validationWarnings)

      // Fill each mapped field
      for (const mapping of mappings) {
        try {
          console.log(`Processing mapping for field: ${mapping.documentFieldId} -> ${mapping.sourcePath}`)
          const fieldValue = this.getFieldValue(mapping, data)
          console.log(`Field value resolved to:`, fieldValue)
          await this.fillField(mapping.documentFieldId, fieldValue, mapping.documentFieldType)
          console.log(`Successfully filled field: ${mapping.documentFieldId}`)
        } catch (error) {
          console.error(`Failed to fill field "${mapping.documentFieldName}":`, error)
          warnings.push(`Failed to fill field "${mapping.documentFieldName}": ${error}`)
        }
      }

      // Save the filled PDF
      const filledPdfBytes = await this.pdfDocument.save()
      const fs = await import('fs-extra')
      
      // Ensure output directory exists
      const path = await import('path')
      const outputDir = path.dirname(outputPath)
      await fs.ensureDir(outputDir)
      console.log(`Ensured output directory exists: ${outputDir}`)
      
      await fs.writeFile(outputPath, filledPdfBytes)
      console.log(`Successfully wrote PDF to: ${outputPath}`)

      return {
        success: true,
        outputPath,
        warnings: warnings.length > 0 ? warnings : undefined
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to fill PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  async getPreviewData(): Promise<any> {
    try {
      if (!this.pdfDocument) {
        this.pdfDocument = await PDFDocument.load(this.fileBuffer)
      }

      const pages = this.pdfDocument.getPages()
      const pageData = pages.map((page, index) => ({
        pageNumber: index + 1,
        width: page.getWidth(),
        height: page.getHeight(),
        rotation: page.getRotation().angle
      }))

      return {
        pageCount: pages.length,
        pages: pageData,
        metadata: await this.extractMetadata()
      }
    } catch (error) {
      throw new Error(`Failed to get preview data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async extractText(): Promise<string> {
    try {
      // Dynamic import to avoid pdf-parse debug code execution during bundling
      const pdfParse = (await import('pdf-parse')).default
      const parsed = await pdfParse(this.fileBuffer)
      return parsed.text
    } catch (error) {
      throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async extractFields(): Promise<DocumentField[]> {
    if (!this.pdfForm) {
      return []
    }

    const fields: DocumentField[] = []
    const pdfFields = this.pdfForm.getFields()

    for (const pdfField of pdfFields) {
      try {
        const field = this.convertPdfField(pdfField)
        if (field) {
          fields.push(field)
        }
      } catch (error) {
        console.warn(`Failed to convert PDF field: ${error}`)
      }
    }

    return fields
  }

  private convertPdfField(pdfField: PDFField): DocumentField | null {
    const name = pdfField.getName()
    
    try {
      if (pdfField instanceof PDFTextField) {
        return {
          id: name,
          name: this.cleanFieldName(name),
          type: 'text',
          value: pdfField.getText() || undefined,
          required: this.isFieldRequired(pdfField)
        }
      }

      if (pdfField instanceof PDFCheckBox) {
        return {
          id: name,
          name: this.cleanFieldName(name),
          type: 'checkbox',
          value: pdfField.isChecked(),
          required: this.isFieldRequired(pdfField)
        }
      }

      if (pdfField instanceof PDFRadioGroup) {
        let options: string[] = []
        try {
          // Try different methods to get radio options
          if (typeof pdfField.getOptions === 'function') {
            options = pdfField.getOptions()
          } else if (typeof (pdfField as any).getExportValues === 'function') {
            options = (pdfField as any).getExportValues()
          } else if (typeof (pdfField as any).getWidgets === 'function') {
            // Get widgets and extract their values
            const widgets = (pdfField as any).getWidgets()
            options = widgets.map((w: any) => w.getOnValue?.() || w.getName?.() || 'option').filter(Boolean)
          }
        } catch (error) {
          console.warn(`Error extracting radio options for field "${name}":`, error)
          options = []
        }
        console.log(`Radio field "${name}" options:`, options)
        const field = {
          id: name,
          name: this.cleanFieldName(name),
          type: 'radio',
          value: pdfField.getSelected() || undefined,
          required: this.isFieldRequired(pdfField),
          options: options.length > 0 ? options : undefined // Only include if we have options
        }
        console.log(`Returning radio field:`, field)
        return field
      }

      if (pdfField instanceof PDFDropdown) {
        let options: string[] = []
        try {
          // Try different methods to get dropdown options
          if (typeof pdfField.getOptions === 'function') {
            options = pdfField.getOptions()
          } else if (typeof (pdfField as any).getExportValues === 'function') {
            options = (pdfField as any).getExportValues()
          } else if (typeof (pdfField as any).getChoices === 'function') {
            options = (pdfField as any).getChoices()
          }
        } catch (error) {
          console.warn(`Error extracting dropdown options for field "${name}":`, error)
          options = []
        }
        console.log(`Dropdown field "${name}" options:`, options)
        const field = {
          id: name,
          name: this.cleanFieldName(name),
          type: 'dropdown',
          value: pdfField.getSelected() || undefined,
          required: this.isFieldRequired(pdfField),
          options: options.length > 0 ? options : undefined // Only include if we have options
        }
        console.log(`Returning dropdown field:`, field)
        return field
      }

      // Handle other field types as text
      return {
        id: name,
        name: this.cleanFieldName(name),
        type: 'text',
        required: this.isFieldRequired(pdfField)
      }
    } catch (error) {
      console.warn(`Error processing field ${name}:`, error)
      return null
    }
  }

  private async fillField(fieldId: string, value: any, fieldType: string): Promise<void> {
    if (!this.pdfForm) {
      throw new Error('PDF form not available')
    }

    try {
      const field = this.pdfForm.getField(fieldId)

      if (field instanceof PDFTextField) {
        field.setText(String(value || ''))
      } else if (field instanceof PDFCheckBox) {
        if (this.isTruthyValue(value)) {
          field.check()
        } else {
          field.uncheck()
        }
      } else if (field instanceof PDFRadioGroup) {
        if (value) {
          field.select(String(value))
        }
      } else if (field instanceof PDFDropdown) {
        if (value) {
          field.select(String(value))
        }
      }
    } catch (error) {
      throw new Error(`Failed to fill field ${fieldId}: ${error}`)
    }
  }

  private async extractMetadata(): Promise<Record<string, any>> {
    if (!this.pdfDocument) {
      return this.getBaseMetadata()
    }

    try {
      const metadata = {
        ...this.getBaseMetadata(),
        title: this.pdfDocument.getTitle() || undefined,
        author: this.pdfDocument.getAuthor() || undefined,
        subject: this.pdfDocument.getSubject() || undefined,
        creator: this.pdfDocument.getCreator() || undefined,
        producer: this.pdfDocument.getProducer() || undefined,
        creationDate: this.pdfDocument.getCreationDate()?.toISOString() || undefined,
        modificationDate: this.pdfDocument.getModificationDate()?.toISOString() || undefined,
        pageCount: this.pdfDocument.getPageCount(),
        hasForm: this.pdfForm ? this.pdfForm.getFields().length > 0 : false,
        fieldCount: this.pdfForm ? this.pdfForm.getFields().length : 0,
        format: 'PDF'
      }

      return metadata
    } catch (error) {
      console.warn('Failed to extract full metadata:', error)
      return this.getBaseMetadata()
    }
  }

  private cleanFieldName(name: string): string {
    // Convert field names to human-readable format
    return name
      .replace(/[_-]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim()
  }

  private isFieldRequired(field: PDFField): boolean {
    // PDF fields don't have a built-in required property
    // We can infer this from field name or other indicators
    const name = field.getName().toLowerCase()
    const requiredKeywords = ['required', 'mandatory', 'must', '*']
    
    return requiredKeywords.some(keyword => name.includes(keyword))
  }

  private isTruthyValue(value: any): boolean {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim()
      return ['true', 'yes', '1', 'on', 'checked', 'x'].includes(lower)
    }
    if (typeof value === 'number') return value !== 0
    return Boolean(value)
  }
}