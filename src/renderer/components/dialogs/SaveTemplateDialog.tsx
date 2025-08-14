import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { 
  Save, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Loader2 
} from 'lucide-react'
import { FieldMapping } from '@shared/types'

const saveTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional()
})

type SaveTemplateFormData = z.infer<typeof saveTemplateSchema>

interface SaveTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mappings: FieldMapping[]
  documentType?: 'pdf' | 'docx' | 'xlsx'
  documentName?: string
  onSave: (templateData: { name: string; description: string; mappings: FieldMapping[] }) => Promise<void>
}

export function SaveTemplateDialog({
  open,
  onOpenChange,
  mappings,
  documentType,
  documentName,
  onSave
}: SaveTemplateDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<SaveTemplateFormData>({
    resolver: zodResolver(saveTemplateSchema),
    defaultValues: {
      name: documentName ? `Template for ${documentName}` : '',
      description: ''
    }
  })

  // Ensure input field gets focus when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        form.setFocus('name')
      }, 100)
    }
  }, [open, form])

  const handleSave = async (data: SaveTemplateFormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await onSave({
        name: data.name,
        description: data.description || '',
        mappings
      })
      
      // Reset form and close dialog on success
      form.reset()
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to save template:', err)
      setError(err instanceof Error ? err.message : 'Failed to save template')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    setError(null)
    onOpenChange(false)
  }

  // Calculate mapping statistics
  const mappingStats = {
    total: mappings.length,
    required: mappings.filter(m => m.isRequired).length,
    withTransformations: mappings.filter(m => m.transformation).length,
    withDefaults: mappings.filter(m => m.defaultValue).length
  }

  const sourceTypeCounts = mappings.reduce((acc, mapping) => {
    acc[mapping.sourceType] = (acc[mapping.sourceType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Save className="h-5 w-5" />
            <span>Save Field Mapping Template</span>
          </DialogTitle>
          <DialogDescription>
            Save your field mappings as a reusable template for future documents
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            {/* Template Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter template name..."
                      {...field}
                      disabled={isLoading}
                      autoFocus={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Template Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description of this template..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe when to use this template or what document type it's for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mapping Summary */}
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium text-sm">Template Summary</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Mappings:</span>
                    <Badge variant="outline">{mappingStats.total}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Required Fields:</span>
                    <Badge variant={mappingStats.required > 0 ? "default" : "outline"}>
                      {mappingStats.required}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>With Transformations:</span>
                    <Badge variant={mappingStats.withTransformations > 0 ? "default" : "outline"}>
                      {mappingStats.withTransformations}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Document Type:</span>
                    <Badge variant="secondary">
                      {documentType?.toUpperCase() || 'Unknown'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Default Values:</span>
                    <Badge variant={mappingStats.withDefaults > 0 ? "default" : "outline"}>
                      {mappingStats.withDefaults}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Source Type Breakdown */}
              {Object.keys(sourceTypeCounts).length > 0 && (
                <div className="space-y-2">
                  <span className="font-medium text-sm">Data Sources:</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(sourceTypeCounts).map(([type, count]) => (
                      <Badge 
                        key={type} 
                        variant="outline" 
                        className={`text-xs ${
                          type === 'provider' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          type === 'office' ? 'bg-green-50 text-green-700 border-green-200' :
                          type === 'mailing' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          type === 'static' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                          'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        {type} ({count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Validation */}
            {mappingStats.total > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Template is ready to save with {mappingStats.total} field mapping{mappingStats.total !== 1 ? 's' : ''}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || mappingStats.total === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Template
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}