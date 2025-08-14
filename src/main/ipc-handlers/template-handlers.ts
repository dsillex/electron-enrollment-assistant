import { ipcMain, dialog } from 'electron'
import { TemplateDatabase } from '../database/templates'
import { Template } from '@shared/types'

let templateDb: TemplateDatabase

export function registerTemplateHandlers() {
  templateDb = new TemplateDatabase()

  // Get all templates
  ipcMain.handle('template:getAll', async () => {
    try {
      const templates = await templateDb.getAllTemplates()
      return {
        success: true,
        templates
      }
    } catch (error) {
      console.error('Failed to get templates:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Get single template by ID
  ipcMain.handle('template:get', async (_, id: string) => {
    try {
      const template = await templateDb.getTemplate(id)
      return {
        success: true,
        template
      }
    } catch (error) {
      console.error('Failed to get template:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Create new template
  ipcMain.handle('template:create', async (_, templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    try {
      // Validate template data first
      const tempTemplate = {
        ...templateData,
        id: 'temp',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      } as Template

      const validation = await templateDb.validateTemplate(tempTemplate)
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Template validation failed',
          validationErrors: validation.errors
        }
      }

      const template = await templateDb.createTemplate(templateData)
      return {
        success: true,
        template
      }
    } catch (error) {
      console.error('Failed to create template:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Update existing template
  ipcMain.handle('template:update', async (_, id: string, updates: Partial<Omit<Template, 'id' | 'createdAt' | 'version'>>) => {
    try {
      const template = await templateDb.updateTemplate(id, updates)
      return {
        success: true,
        template
      }
    } catch (error) {
      console.error('Failed to update template:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Delete template
  ipcMain.handle('template:delete', async (_, id: string) => {
    try {
      const deleted = await templateDb.deleteTemplate(id)
      return {
        success: deleted,
        error: deleted ? undefined : 'Template not found'
      }
    } catch (error) {
      console.error('Failed to delete template:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Duplicate template
  ipcMain.handle('template:duplicate', async (_, id: string, newName?: string) => {
    try {
      const template = await templateDb.duplicateTemplate(id, newName)
      return {
        success: true,
        template
      }
    } catch (error) {
      console.error('Failed to duplicate template:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Get templates by document type
  ipcMain.handle('template:getByDocumentType', async (_, documentType: 'pdf' | 'docx' | 'xlsx') => {
    try {
      const templates = await templateDb.getTemplatesByDocumentType(documentType)
      return {
        success: true,
        templates
      }
    } catch (error) {
      console.error('Failed to get templates by document type:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Search templates
  ipcMain.handle('template:search', async (_, query: string) => {
    try {
      const templates = await templateDb.searchTemplates(query)
      return {
        success: true,
        templates
      }
    } catch (error) {
      console.error('Failed to search templates:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Export template
  ipcMain.handle('template:export', async (_, id: string) => {
    try {
      const template = await templateDb.getTemplate(id)
      if (!template) {
        return {
          success: false,
          error: 'Template not found'
        }
      }

      const result = await dialog.showSaveDialog({
        title: 'Export Template',
        defaultPath: `${template.name.replace(/[^a-zA-Z0-9]/g, '_')}_template.json`,
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled || !result.filePath) {
        return {
          success: false,
          error: 'Export cancelled'
        }
      }

      const exportData = {
        ...template,
        exportedAt: new Date().toISOString(),
        exportVersion: '1.0'
      }

      const fs = await import('fs-extra')
      await fs.writeJSON(result.filePath, exportData, { spaces: 2 })

      return {
        success: true,
        filePath: result.filePath
      }
    } catch (error) {
      console.error('Failed to export template:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Import template
  ipcMain.handle('template:import', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Import Template',
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      })

      if (result.canceled || result.filePaths.length === 0) {
        return {
          success: false,
          error: 'Import cancelled'
        }
      }

      const filePath = result.filePaths[0]
      const template = await templateDb.importTemplate(filePath)

      return {
        success: true,
        template
      }
    } catch (error) {
      console.error('Failed to import template:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Validate template
  ipcMain.handle('template:validate', async (_, template: Template) => {
    try {
      const validation = await templateDb.validateTemplate(template)
      return {
        success: true,
        validation
      }
    } catch (error) {
      console.error('Failed to validate template:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })

  // Get template statistics
  ipcMain.handle('template:getStatistics', async () => {
    try {
      const statistics = await templateDb.getTemplateStatistics()
      return {
        success: true,
        statistics
      }
    } catch (error) {
      console.error('Failed to get template statistics:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  })
}