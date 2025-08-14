import React, { useState, useEffect } from 'react'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Alert, AlertDescription } from '../ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Template } from '@shared/types'

interface TemplateFormProps {
  template?: Template | null
  onSave: (templateData: any) => Promise<void>
  onCancel: () => void
  documentType?: 'pdf' | 'docx' | 'xlsx'
}

export function TemplateForm({ template, onSave, onCancel, documentType }: TemplateFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    documentType: documentType || 'pdf' as 'pdf' | 'docx' | 'xlsx'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        documentType: template.documentType
      })
    }
  }, [template])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Template name is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const templateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        documentType: formData.documentType,
        mappings: template?.mappings || [],
        conditionalRules: template?.conditionalRules || []
      }

      await onSave(templateData)
    } catch (error) {
      console.error('Failed to save template:', error)
      setError('Failed to save template. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {template ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              {template 
                ? 'Update the template details below.'
                : 'Create a new template for mapping document fields to data sources.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter template name..."
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter template description..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="documentType">Document Type *</Label>
              <Select
                value={formData.documentType}
                onValueChange={(value) => handleInputChange('documentType', value)}
                disabled={!!documentType} // Disable if document type is pre-selected
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center space-x-2">
                      <span>📄</span>
                      <span>PDF Document</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="docx">
                    <div className="flex items-center space-x-2">
                      <span>📝</span>
                      <span>Word Document</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="xlsx">
                    <div className="flex items-center space-x-2">
                      <span>📊</span>
                      <span>Excel Spreadsheet</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {template && (
              <div className="text-sm text-muted-foreground">
                <p>Field mappings and rules will be preserved from the original template.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {template ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}