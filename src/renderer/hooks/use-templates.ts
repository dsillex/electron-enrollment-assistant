import { useEffect } from 'react'
import { useTemplateStore } from '../stores/template-store'
import { Template, FieldMapping } from '@shared/types'

export function useTemplates() {
  const {
    templates,
    selectedTemplate,
    isLoading,
    error,
    searchQuery,
    setTemplates,
    setSelectedTemplate,
    setLoading,
    setError,
    setSearchQuery,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    exportTemplate,
    importTemplate,
    getFilteredTemplates,
    getTemplatesByDocumentType,
    validateTemplate
  } = useTemplateStore()

  // Load templates on mount
  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  // Helper function to create template from field mappings
  const createTemplateFromMappings = async (
    name: string,
    description: string,
    documentType: 'pdf' | 'docx' | 'xlsx',
    mappings: FieldMapping[],
    documentHash?: string
  ): Promise<Template | null> => {
    const templateData = {
      name,
      description,
      documentType,
      documentHash,
      mappings,
      conditionalRules: []
    }

    return await createTemplate(templateData)
  }

  // Helper function to apply template to get ready-to-use mappings
  const getTemplateMappings = (templateId: string): FieldMapping[] => {
    const template = templates.find(t => t.id === templateId)
    return template ? template.mappings : []
  }

  // Get templates compatible with current document
  const getCompatibleTemplates = (documentType: 'pdf' | 'docx' | 'xlsx', documentHash?: string): Template[] => {
    const typeMatches = getTemplatesByDocumentType(documentType)
    
    if (documentHash) {
      // Prefer templates with matching document hash (exact same document)
      const exactMatches = typeMatches.filter(t => t.documentHash === documentHash)
      const otherMatches = typeMatches.filter(t => t.documentHash !== documentHash)
      return [...exactMatches, ...otherMatches]
    }
    
    return typeMatches
  }

  // Get recent templates (last 5 updated)
  const getRecentTemplates = (): Template[] => {
    return [...templates]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  }

  // Get template statistics
  const getTemplateStats = () => {
    const stats = {
      total: templates.length,
      byType: {
        pdf: templates.filter(t => t.documentType === 'pdf').length,
        docx: templates.filter(t => t.documentType === 'docx').length,
        xlsx: templates.filter(t => t.documentType === 'xlsx').length
      },
      recent: getRecentTemplates()
    }
    return stats
  }

  return {
    // State
    templates,
    filteredTemplates: getFilteredTemplates(),
    selectedTemplate,
    isLoading,
    error,
    searchQuery,

    // Actions
    setSelectedTemplate,
    setSearchQuery,
    clearError: () => setError(null),

    // Template operations
    loadTemplates,
    createTemplate,
    createTemplateFromMappings,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    exportTemplate,
    importTemplate,
    validateTemplate,

    // Helper functions
    getTemplateMappings,
    getCompatibleTemplates,
    getRecentTemplates,
    getTemplateStats,
    getTemplatesByDocumentType
  }
}