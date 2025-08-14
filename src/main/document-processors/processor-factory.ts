import * as path from 'path'
import { BaseDocumentProcessor } from './base-processor'
import { PdfProcessor } from './pdf-processor'
import { WordProcessor } from './word-processor'
import { ExcelProcessor } from './excel-processor'

export class ProcessorFactory {
  /**
   * Create appropriate document processor based on file extension
   */
  static createProcessor(filePath: string, fileBuffer: Buffer): BaseDocumentProcessor {
    const extension = path.extname(filePath).toLowerCase()

    switch (extension) {
      case '.pdf':
        return new PdfProcessor(filePath, fileBuffer)
      case '.docx':
      case '.doc':
        return new WordProcessor(filePath, fileBuffer)
      case '.xlsx':
      case '.xls':
        return new ExcelProcessor(filePath, fileBuffer)
      default:
        throw new Error(`Unsupported file type: ${extension}`)
    }
  }

  /**
   * Get supported file extensions
   */
  static getSupportedExtensions(): string[] {
    return ['.pdf', '.docx', '.doc', '.xlsx', '.xls']
  }

  /**
   * Check if file type is supported
   */
  static isSupported(filePath: string): boolean {
    const extension = path.extname(filePath).toLowerCase()
    return this.getSupportedExtensions().includes(extension)
  }

  /**
   * Get file type category from extension
   */
  static getFileTypeCategory(filePath: string): 'pdf' | 'word' | 'excel' | 'unknown' {
    const extension = path.extname(filePath).toLowerCase()

    switch (extension) {
      case '.pdf':
        return 'pdf'
      case '.docx':
      case '.doc':
        return 'word'
      case '.xlsx':
      case '.xls':
        return 'excel'
      default:
        return 'unknown'
    }
  }
}