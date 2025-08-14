import { ipcMain } from 'electron'
import * as fs from 'fs-extra'
import * as path from 'path'
import { ProcessorFactory } from '../document-processors/processor-factory'
import { ProcessingOptions } from '../document-processors/base-processor'
import { FieldMapping } from '@shared/types'

export function registerDocumentHandlers() {
  // Analyze document and extract fields
  ipcMain.handle('document:analyze', async (_, filePath: string, options?: ProcessingOptions) => {
    try {
      if (!await fs.pathExists(filePath)) {
        throw new Error('File does not exist')
      }

      if (!ProcessorFactory.isSupported(filePath)) {
        throw new Error(`Unsupported file type: ${path.extname(filePath)}`)
      }

      const fileBuffer = await fs.readFile(filePath)
      const processor = ProcessorFactory.createProcessor(filePath, fileBuffer)

      if (!processor.canProcess()) {
        throw new Error('File appears to be corrupted or invalid')
      }

      const result = await processor.analyzeDocument(options)
      return result
    } catch (error) {
      console.error('Document analysis failed:', error)
      return {
        success: false,
        fields: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Fill document with data
  ipcMain.handle('document:fill', async (
    _,
    filePath: string,
    mappings: FieldMapping[],
    data: Record<string, any>,
    outputPath: string
  ) => {
    try {
      if (!await fs.pathExists(filePath)) {
        throw new Error('Source file does not exist')
      }

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath)
      await fs.ensureDir(outputDir)

      const fileBuffer = await fs.readFile(filePath)
      const processor = ProcessorFactory.createProcessor(filePath, fileBuffer)

      if (!processor.canProcess()) {
        throw new Error('File appears to be corrupted or invalid')
      }

      // Analyze first to load the document
      await processor.analyzeDocument()

      // Fill the document
      const result = await processor.fillDocument(mappings, data, outputPath)
      return result
    } catch (error) {
      console.error('Document filling failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Get document preview data
  ipcMain.handle('document:getPreview', async (_, filePath: string) => {
    try {
      if (!await fs.pathExists(filePath)) {
        throw new Error('File does not exist')
      }

      const fileBuffer = await fs.readFile(filePath)
      const processor = ProcessorFactory.createProcessor(filePath, fileBuffer)

      if (!processor.canProcess()) {
        throw new Error('File appears to be corrupted or invalid')
      }

      const previewData = await processor.getPreviewData()
      return {
        success: true,
        data: previewData
      }
    } catch (error) {
      console.error('Failed to get preview data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Extract text from document
  ipcMain.handle('document:extractText', async (_, filePath: string) => {
    try {
      if (!await fs.pathExists(filePath)) {
        throw new Error('File does not exist')
      }

      const fileBuffer = await fs.readFile(filePath)
      const processor = ProcessorFactory.createProcessor(filePath, fileBuffer)

      if (!processor.canProcess()) {
        throw new Error('File appears to be corrupted or invalid')
      }

      const text = await processor.extractText()
      return {
        success: true,
        text
      }
    } catch (error) {
      console.error('Text extraction failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Get supported file types
  ipcMain.handle('document:getSupportedTypes', async () => {
    try {
      const extensions = ProcessorFactory.getSupportedExtensions()
      const types = extensions.map(ext => ({
        extension: ext,
        category: ProcessorFactory.getFileTypeCategory(`file${ext}`),
        name: getFileTypeName(ext)
      }))

      return {
        success: true,
        types
      }
    } catch (error) {
      console.error('Failed to get supported types:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Check if file type is supported
  ipcMain.handle('document:isSupported', async (_, filePath: string) => {
    try {
      return {
        success: true,
        supported: ProcessorFactory.isSupported(filePath),
        category: ProcessorFactory.getFileTypeCategory(filePath)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Batch process multiple documents
  ipcMain.handle('document:batchProcess', async (
    _,
    jobs: Array<{
      filePath: string
      mappings: FieldMapping[]
      data: Record<string, any>
      outputPath: string
    }>
  ) => {
    console.log(`Starting batch processing of ${jobs.length} documents`)
    const results = []

    for (const job of jobs) {
      try {
        console.log(`Processing document: ${job.filePath}`)
        console.log(`Output path: ${job.outputPath}`)
        console.log(`Number of mappings: ${job.mappings?.length || 0}`)
        
        const fileBuffer = await fs.readFile(job.filePath)
        const processor = ProcessorFactory.createProcessor(job.filePath, fileBuffer)

        // Analyze document first
        console.log(`Analyzing document...`)
        await processor.analyzeDocument()

        // Fill the document
        console.log(`Filling document with ${job.mappings.length} mappings...`)
        const result = await processor.fillDocument(job.mappings, job.data, job.outputPath)
        console.log(`Document processing result:`, result)
        results.push({
          ...result,
          inputPath: job.filePath,
          outputPath: job.outputPath
        })
        if (result.success) {
          console.log(`Successfully processed document: ${job.filePath}`)
        } else {
          console.error(`Failed to process document: ${job.filePath}`, result.error)
        }
      } catch (error) {
        console.error(`Failed to process document ${job.filePath}:`, error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        console.error(`Error details: ${errorMessage}`)
        results.push({
          success: false,
          inputPath: job.filePath,
          outputPath: job.outputPath,
          error: errorMessage
        })
      }
    }

    return {
      success: true,
      results,
      successCount: results.filter(r => r.success).length,
      totalCount: results.length
    }
  })
}

function getFileTypeName(extension: string): string {
  switch (extension) {
    case '.pdf':
      return 'PDF Document'
    case '.docx':
      return 'Word Document (Modern)'
    case '.doc':
      return 'Word Document (Legacy)'
    case '.xlsx':
      return 'Excel Spreadsheet (Modern)'
    case '.xls':
      return 'Excel Spreadsheet (Legacy)'
    default:
      return 'Unknown Document'
  }
}