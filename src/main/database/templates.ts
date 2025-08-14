import * as fs from 'fs-extra'
import * as path from 'path'
import { app } from 'electron'
import { randomUUID } from 'crypto'
import { Template, FieldMapping, ConditionalRule } from '@shared/types'

export class TemplateDatabase {
  private dataDir: string
  private templatesFile: string
  private templatesDir: string

  constructor() {
    this.dataDir = path.join(app.getPath('userData'), 'data')
    this.templatesFile = path.join(this.dataDir, 'templates.json')
    this.templatesDir = path.join(this.dataDir, 'templates')
    this.ensureDirectories()
  }

  private async ensureDirectories(): Promise<void> {
    await fs.ensureDir(this.dataDir)
    await fs.ensureDir(this.templatesDir)
  }

  private async loadTemplates(): Promise<Template[]> {
    try {
      if (await fs.pathExists(this.templatesFile)) {
        const data = await fs.readJSON(this.templatesFile)
        return Array.isArray(data) ? data : []
      }
      return []
    } catch (error) {
      console.error('Failed to load templates:', error)
      return []
    }
  }

  private async saveTemplates(templates: Template[]): Promise<void> {
    try {
      await this.ensureDirectories()
      await fs.writeJSON(this.templatesFile, templates, { spaces: 2 })
    } catch (error) {
      console.error('Failed to save templates:', error)
      throw new Error('Failed to save templates')
    }
  }

  async getAllTemplates(): Promise<Template[]> {
    return this.loadTemplates()
  }

  async getTemplate(id: string): Promise<Template | null> {
    const templates = await this.loadTemplates()
    return templates.find(t => t.id === id) || null
  }

  async createTemplate(templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Template> {
    const templates = await this.loadTemplates()
    
    const template: Template = {
      ...templateData,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    }

    templates.push(template)
    await this.saveTemplates(templates)

    return template
  }

  async updateTemplate(id: string, updates: Partial<Omit<Template, 'id' | 'createdAt' | 'version'>>): Promise<Template> {
    const templates = await this.loadTemplates()
    const index = templates.findIndex(t => t.id === id)
    
    if (index === -1) {
      throw new Error(`Template with id ${id} not found`)
    }

    const existingTemplate = templates[index]
    const updatedTemplate: Template = {
      ...existingTemplate,
      ...updates,
      id: existingTemplate.id,
      createdAt: existingTemplate.createdAt,
      updatedAt: new Date().toISOString(),
      version: existingTemplate.version + 1
    }

    templates[index] = updatedTemplate
    await this.saveTemplates(templates)

    return updatedTemplate
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const templates = await this.loadTemplates()
    const initialLength = templates.length
    const filteredTemplates = templates.filter(t => t.id !== id)
    
    if (filteredTemplates.length === initialLength) {
      return false // Template not found
    }

    await this.saveTemplates(filteredTemplates)
    return true
  }

  async duplicateTemplate(id: string, newName?: string): Promise<Template> {
    const originalTemplate = await this.getTemplate(id)
    
    if (!originalTemplate) {
      throw new Error(`Template with id ${id} not found`)
    }

    const duplicatedTemplate = await this.createTemplate({
      name: newName || `${originalTemplate.name} (Copy)`,
      description: originalTemplate.description,
      documentType: originalTemplate.documentType,
      documentHash: originalTemplate.documentHash,
      mappings: [...originalTemplate.mappings],
      conditionalRules: originalTemplate.conditionalRules ? [...originalTemplate.conditionalRules] : undefined
    })

    return duplicatedTemplate
  }

  async getTemplatesByDocumentType(documentType: 'pdf' | 'docx' | 'xlsx'): Promise<Template[]> {
    const templates = await this.loadTemplates()
    return templates.filter(t => t.documentType === documentType)
  }

  async searchTemplates(query: string): Promise<Template[]> {
    const templates = await this.loadTemplates()
    const lowercaseQuery = query.toLowerCase()
    
    return templates.filter(template => 
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery)
    )
  }

  async exportTemplate(id: string): Promise<string> {
    const template = await this.getTemplate(id)
    
    if (!template) {
      throw new Error(`Template with id ${id} not found`)
    }

    const exportData = {
      ...template,
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0'
    }

    const fileName = `${template.name.replace(/[^a-zA-Z0-9]/g, '_')}_template.json`
    const filePath = path.join(this.templatesDir, fileName)
    
    await fs.writeJSON(filePath, exportData, { spaces: 2 })
    return filePath
  }

  async importTemplate(filePath: string): Promise<Template> {
    try {
      const importData = await fs.readJSON(filePath)
      
      // Validate the imported data
      if (!importData.name || !importData.documentType || !Array.isArray(importData.mappings)) {
        throw new Error('Invalid template file format')
      }

      // Create new template from imported data (without id to generate new one)
      const templateData = {
        name: importData.name,
        description: importData.description || '',
        documentType: importData.documentType,
        documentHash: importData.documentHash,
        mappings: importData.mappings,
        conditionalRules: importData.conditionalRules
      }

      return await this.createTemplate(templateData)
    } catch (error) {
      console.error('Failed to import template:', error)
      throw new Error(`Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async validateTemplate(template: Template): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = []

    console.log('=== Template Validation Debug ===')
    console.log('Template name:', template.name)
    console.log('Template document type:', template.documentType)
    console.log('Mappings count:', template.mappings?.length || 0)

    // Basic validation
    if (!template.name || template.name.trim().length === 0) {
      errors.push('Template name is required')
    }

    if (!template.documentType || !['pdf', 'docx', 'xlsx'].includes(template.documentType)) {
      errors.push('Valid document type is required (pdf, docx, xlsx)')
    }

    if (!Array.isArray(template.mappings) || template.mappings.length === 0) {
      errors.push('Template must have at least one field mapping')
    }

    // Validate field mappings
    for (const [index, mapping] of template.mappings.entries()) {
      console.log(`Mapping ${index + 1}:`, {
        documentFieldId: mapping.documentFieldId,
        sourceType: mapping.sourceType,
        sourcePath: mapping.sourcePath,
        providerSlot: mapping.providerSlot,
        slotField: mapping.slotField,
        staticValue: mapping.staticValue
      })

      if (!mapping.documentFieldId || mapping.documentFieldId.trim().length === 0) {
        errors.push(`Mapping ${index + 1}: Document field ID is required`)
      }

      if (!mapping.documentFieldName || mapping.documentFieldName.trim().length === 0) {
        errors.push(`Mapping ${index + 1}: Document field name is required`)
      }

      if (!mapping.documentFieldType || !['text', 'checkbox', 'radio', 'dropdown', 'date'].includes(mapping.documentFieldType)) {
        errors.push(`Mapping ${index + 1}: Valid field type is required`)
      }

      if (!mapping.sourceType || !['provider', 'provider-slot', 'office', 'mailing', 'custom', 'static'].includes(mapping.sourceType)) {
        errors.push(`Mapping ${index + 1}: Valid source type is required`)
      }

      // Validate source data based on sourceType
      if (mapping.sourceType === 'provider-slot') {
        // For provider-slot, require providerSlot and slotField
        if (!mapping.providerSlot || mapping.providerSlot < 1) {
          errors.push(`Mapping ${index + 1}: Provider slot number is required (must be >= 1)`)
        }
        if (!mapping.slotField || mapping.slotField.trim().length === 0) {
          errors.push(`Mapping ${index + 1}: Slot field is required for provider-slot mappings`)
        }
      } else if (mapping.sourceType === 'static') {
        // For static, staticValue can be any value including empty string, so just check if it exists
        if (mapping.staticValue === undefined || mapping.staticValue === null) {
          errors.push(`Mapping ${index + 1}: Static value is required for static mappings`)
        }
      } else {
        // For all other types, require sourcePath
        if (!mapping.sourcePath || mapping.sourcePath.trim().length === 0) {
          errors.push(`Mapping ${index + 1}: Source path is required`)
        }
      }
    }

    // Validate conditional rules if present
    if (template.conditionalRules) {
      for (const [index, rule] of template.conditionalRules.entries()) {
        if (!rule.condition || rule.condition.trim().length === 0) {
          errors.push(`Conditional rule ${index + 1}: Condition is required`)
        }

        if (!rule.action || !['setValue', 'hideField', 'showField'].includes(rule.action)) {
          errors.push(`Conditional rule ${index + 1}: Valid action is required`)
        }
      }
    }

    console.log('Validation errors:', errors)
    console.log('=== End Template Validation Debug ===')

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  async getTemplateStatistics(): Promise<{
    totalTemplates: number
    byDocumentType: { pdf: number; docx: number; xlsx: number }
    recentTemplates: Template[]
    mostUsedTemplates: Template[]
  }> {
    const templates = await this.loadTemplates()

    const stats = {
      totalTemplates: templates.length,
      byDocumentType: {
        pdf: templates.filter(t => t.documentType === 'pdf').length,
        docx: templates.filter(t => t.documentType === 'docx').length,
        xlsx: templates.filter(t => t.documentType === 'xlsx').length
      },
      recentTemplates: templates
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
      mostUsedTemplates: templates // TODO: Add usage tracking
        .slice(0, 5)
    }

    return stats
  }
}