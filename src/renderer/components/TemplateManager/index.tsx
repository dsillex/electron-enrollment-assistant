import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { 
  Search, 
  Plus, 
  Download, 
  Upload, 
  Copy, 
  Edit, 
  Trash2, 
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useTemplates } from '../../hooks/use-templates'
import { Template } from '@shared/types'
import { TemplateForm } from './TemplateForm'
import { TemplateList } from './TemplateList'
import { TemplatePreview } from './TemplatePreview'

interface TemplateManagerProps {
  onTemplateSelect?: (template: Template) => void
  selectedDocumentType?: 'pdf' | 'docx' | 'xlsx'
  className?: string
}

export function TemplateManager({ onTemplateSelect, selectedDocumentType, className }: TemplateManagerProps) {
  const {
    filteredTemplates,
    selectedTemplate,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    setSelectedTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    exportTemplate,
    importTemplate,
    clearError,
    getTemplateStats
  } = useTemplates()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [view, setView] = useState<'list' | 'preview'>('list')

  const stats = getTemplateStats()

  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setShowCreateForm(true)
  }

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setShowCreateForm(true)
  }

  const handleCloseForm = () => {
    setShowCreateForm(false)
    setEditingTemplate(null)
  }

  const handleSaveTemplate = async (templateData: any) => {
    try {
      let result
      if (editingTemplate) {
        result = await updateTemplate(editingTemplate.id, templateData)
      } else {
        result = await createTemplate(templateData)
      }

      if (result) {
        handleCloseForm()
        if (onTemplateSelect) {
          onTemplateSelect(result)
        }
      }
    } catch (error) {
      console.error('Failed to save template:', error)
    }
  }

  const handleDeleteTemplate = async (template: Template) => {
    if (window.confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      await deleteTemplate(template.id)
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(null)
      }
    }
  }

  const handleDuplicateTemplate = async (template: Template) => {
    const newName = `${template.name} (Copy)`
    await duplicateTemplate(template.id, newName)
  }

  const handleExportTemplate = async (template: Template) => {
    const filePath = await exportTemplate(template.id)
    if (filePath) {
      // Could show success message or open file location
      console.log('Template exported to:', filePath)
    }
  }

  const handleImportTemplate = async () => {
    const imported = await importTemplate()
    if (imported && onTemplateSelect) {
      onTemplateSelect(imported)
    }
  }

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    if (onTemplateSelect) {
      onTemplateSelect(template)
    }
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-800'
      case 'docx':
        return 'bg-blue-100 text-blue-800'
      case 'xlsx':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄'
      case 'docx':
        return '📝'
      case 'xlsx':
        return '📊'
      default:
        return '📄'
    }
  }

  // Filter templates by selected document type if specified
  const displayTemplates = selectedDocumentType 
    ? filteredTemplates.filter(t => t.documentType === selectedDocumentType)
    : filteredTemplates

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Template Manager</CardTitle>
            <CardDescription>
              Create, edit, and manage document templates
              {selectedDocumentType && ` for ${selectedDocumentType.toUpperCase()} documents`}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setView(view === 'list' ? 'preview' : 'list')}>
              {view === 'list' ? 'Preview' : 'List'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>{stats.total} templates</span>
          <span>•</span>
          <span>PDF: {stats.byType.pdf}</span>
          <span>•</span>
          <span>Word: {stats.byType.docx}</span>
          <span>•</span>
          <span>Excel: {stats.byType.xlsx}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleImportTemplate}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button size="sm" onClick={handleCreateTemplate}>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                {error}
                <Button variant="ghost" size="sm" onClick={clearError}>
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading templates...</span>
            </div>
          </div>
        ) : displayTemplates.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-2" />
              <p>No templates found</p>
              <p className="text-sm">
                {searchQuery ? 'Try a different search term' : 'Create your first template to get started'}
              </p>
            </div>
          </div>
        ) : view === 'list' ? (
          <TemplateList
            templates={displayTemplates}
            selectedTemplate={selectedTemplate}
            onSelect={handleTemplateSelect}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
            onDuplicate={handleDuplicateTemplate}
            onExport={handleExportTemplate}
          />
        ) : (
          <TemplatePreview
            template={selectedTemplate}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
            onDuplicate={handleDuplicateTemplate}
            onExport={handleExportTemplate}
          />
        )}
      </CardContent>

      {/* Template Form Modal */}
      {showCreateForm && (
        <TemplateForm
          template={editingTemplate}
          onSave={handleSaveTemplate}
          onCancel={handleCloseForm}
          documentType={selectedDocumentType}
        />
      )}
    </Card>
  )
}