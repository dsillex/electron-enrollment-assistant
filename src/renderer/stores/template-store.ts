import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Template, FieldMapping } from '@shared/types'

interface TemplateState {
  templates: Template[]
  selectedTemplate: Template | null
  isLoading: boolean
  error: string | null
  searchQuery: string

  // Actions
  setTemplates: (templates: Template[]) => void
  setSelectedTemplate: (template: Template | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (query: string) => void
  
  // Template operations
  loadTemplates: () => Promise<void>
  createTemplate: (templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<Template | null>
  updateTemplate: (id: string, updates: Partial<Omit<Template, 'id' | 'createdAt' | 'version'>>) => Promise<Template | null>
  deleteTemplate: (id: string) => Promise<boolean>
  duplicateTemplate: (id: string, newName?: string) => Promise<Template | null>
  exportTemplate: (id: string) => Promise<string | null>
  importTemplate: () => Promise<Template | null>
  
  // Utility functions
  getFilteredTemplates: () => Template[]
  getTemplatesByDocumentType: (documentType: 'pdf' | 'docx' | 'xlsx') => Template[]
  validateTemplate: (template: Template) => Promise<{ isValid: boolean; errors: string[] }>
}

export const useTemplateStore = create<TemplateState>()(
  devtools(
    (set, get) => ({
      templates: [],
      selectedTemplate: null,
      isLoading: false,
      error: null,
      searchQuery: '',

      setTemplates: (templates) => set({ templates }),
      setSelectedTemplate: (template) => set({ selectedTemplate: template }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      loadTemplates: async () => {
        set({ isLoading: true, error: null })
        try {
          const result = await window.electronAPI.getTemplates()
          if (result.success) {
            set({ templates: result.templates })
          } else {
            set({ error: result.error || 'Failed to load templates' })
          }
        } catch (error) {
          console.error('Failed to load templates:', error)
          set({ error: 'Failed to load templates' })
        } finally {
          set({ isLoading: false })
        }
      },

      createTemplate: async (templateData) => {
        set({ isLoading: true, error: null })
        try {
          console.log('=== Template Store: Creating template ===')
          console.log('Template data:', templateData)
          
          const result = await window.electronAPI.createTemplate(templateData)
          console.log('Template creation result:', result)
          
          if (result.success && result.template) {
            const { templates } = get()
            set({ templates: [...templates, result.template] })
            console.log('Template created successfully in store:', result.template.id)
            return result.template
          } else {
            const errorMsg = result.error || 'Failed to create template'
            console.error('Template creation failed:', errorMsg)
            if (result.validationErrors) {
              console.error('Validation errors:', result.validationErrors)
            }
            set({ error: errorMsg })
            return null
          }
        } catch (error) {
          console.error('Exception during template creation:', error)
          set({ error: 'Failed to create template' })
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      updateTemplate: async (id, updates) => {
        set({ isLoading: true, error: null })
        try {
          const result = await window.electronAPI.updateTemplate(id, updates)
          if (result.success && result.template) {
            const { templates, selectedTemplate } = get()
            const updatedTemplates = templates.map(t => 
              t.id === id ? result.template : t
            )
            set({ 
              templates: updatedTemplates,
              selectedTemplate: selectedTemplate?.id === id ? result.template : selectedTemplate
            })
            return result.template
          } else {
            set({ error: result.error || 'Failed to update template' })
            return null
          }
        } catch (error) {
          console.error('Failed to update template:', error)
          set({ error: 'Failed to update template' })
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      deleteTemplate: async (id) => {
        set({ isLoading: true, error: null })
        try {
          const result = await window.electronAPI.deleteTemplate(id)
          if (result.success) {
            const { templates, selectedTemplate } = get()
            const filteredTemplates = templates.filter(t => t.id !== id)
            set({ 
              templates: filteredTemplates,
              selectedTemplate: selectedTemplate?.id === id ? null : selectedTemplate
            })
            return true
          } else {
            set({ error: result.error || 'Failed to delete template' })
            return false
          }
        } catch (error) {
          console.error('Failed to delete template:', error)
          set({ error: 'Failed to delete template' })
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      duplicateTemplate: async (id, newName) => {
        set({ isLoading: true, error: null })
        try {
          const result = await window.electronAPI.duplicateTemplate(id, newName)
          if (result.success && result.template) {
            const { templates } = get()
            set({ templates: [...templates, result.template] })
            return result.template
          } else {
            set({ error: result.error || 'Failed to duplicate template' })
            return null
          }
        } catch (error) {
          console.error('Failed to duplicate template:', error)
          set({ error: 'Failed to duplicate template' })
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      exportTemplate: async (id) => {
        set({ isLoading: true, error: null })
        try {
          const result = await window.electronAPI.exportTemplate(id)
          if (result.success && result.filePath) {
            return result.filePath
          } else {
            set({ error: result.error || 'Failed to export template' })
            return null
          }
        } catch (error) {
          console.error('Failed to export template:', error)
          set({ error: 'Failed to export template' })
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      importTemplate: async () => {
        set({ isLoading: true, error: null })
        try {
          const result = await window.electronAPI.importTemplate()
          if (result.success && result.template) {
            const { templates } = get()
            set({ templates: [...templates, result.template] })
            return result.template
          } else {
            set({ error: result.error || 'Failed to import template' })
            return null
          }
        } catch (error) {
          console.error('Failed to import template:', error)
          set({ error: 'Failed to import template' })
          return null
        } finally {
          set({ isLoading: false })
        }
      },

      getFilteredTemplates: () => {
        const { templates, searchQuery } = get()
        if (!searchQuery.trim()) {
          return templates
        }
        
        const lowercaseQuery = searchQuery.toLowerCase()
        return templates.filter(template =>
          template.name.toLowerCase().includes(lowercaseQuery) ||
          template.description.toLowerCase().includes(lowercaseQuery)
        )
      },

      getTemplatesByDocumentType: (documentType) => {
        const { templates } = get()
        return templates.filter(template => template.documentType === documentType)
      },

      validateTemplate: async (template) => {
        try {
          const result = await window.electronAPI.validateTemplate(template)
          if (result.success) {
            return result.validation
          } else {
            console.error('Failed to validate template:', result.error)
            return { isValid: false, errors: ['Failed to validate template'] }
          }
        } catch (error) {
          console.error('Failed to validate template:', error)
          return { isValid: false, errors: ['Failed to validate template'] }
        }
      }
    }),
    { name: 'template-store' }
  )
)