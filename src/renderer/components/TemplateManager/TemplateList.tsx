import React from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Download, 
  Trash2,
  Calendar,
  Hash
} from 'lucide-react'
import { Template } from '@shared/types'
import { format } from 'date-fns'

interface TemplateListProps {
  templates: Template[]
  selectedTemplate: Template | null
  onSelect: (template: Template) => void
  onEdit: (template: Template) => void
  onDelete: (template: Template) => void
  onDuplicate: (template: Template) => void
  onExport: (template: Template) => void
}

export function TemplateList({
  templates,
  selectedTemplate,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onExport
}: TemplateListProps) {
  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'docx':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'xlsx':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Template</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Fields</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Version</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow 
              key={template.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedTemplate?.id === template.id ? 'bg-muted' : ''
              }`}
              onClick={() => onSelect(template)}
            >
              <TableCell>
                <div>
                  <p className="font-medium">{template.name}</p>
                  {template.description && (
                    <p className="text-sm text-muted-foreground truncate max-w-xs">
                      {template.description}
                    </p>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant="secondary" className={getDocumentTypeColor(template.documentType)}>
                  <span className="mr-1">{getDocumentTypeIcon(template.documentType)}</span>
                  {template.documentType.toUpperCase()}
                </Badge>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  <span>{template.mappings.length}</span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(template.updatedAt), 'MMM d, yyyy')}</span>
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  v{template.version}
                </Badge>
              </TableCell>
              
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      onEdit(template)
                    }}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      onDuplicate(template)
                    }}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      onExport(template)
                    }}>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(template)
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}