import React from 'react'
import { MoreHorizontal, Copy, Edit, Archive } from 'lucide-react'
import { OfficeLocation } from '@shared/types'
import { Button } from '@renderer/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@renderer/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@renderer/components/ui/table'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { Badge } from '@renderer/components/ui/badge'
import { useOfficeStore } from '@renderer/stores/office-store'

interface OfficeTableProps {
  offices: OfficeLocation[]
  onEdit: (office: OfficeLocation) => void
  onDuplicate: (office: OfficeLocation) => void
  onArchive: (officeId: string) => void
}

export function OfficeTable({ 
  offices, 
  onEdit, 
  onDuplicate, 
  onArchive 
}: OfficeTableProps) {
  const { 
    selectedOffices,
    selectOffice,
    deselectOffice,
    selectAllOffices,
    deselectAllOffices
  } = useOfficeStore()

  const isAllSelected = offices.length > 0 && offices.every(office => selectedOffices.has(office.id))
  const isIndeterminate = offices.some(office => selectedOffices.has(office.id)) && !isAllSelected

  const handleSelectAll = () => {
    if (isAllSelected) {
      deselectAllOffices()
    } else {
      selectAllOffices()
    }
  }

  const handleSelectOffice = (officeId: string) => {
    if (selectedOffices.has(officeId)) {
      deselectOffice(officeId)
    } else {
      selectOffice(officeId)
    }
  }

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const getLocationTypeColor = (type: OfficeLocation['locationType']) => {
    switch (type) {
      case 'primary':
        return 'bg-blue-100 text-blue-800'
      case 'satellite':
        return 'bg-green-100 text-green-800'
      case 'hospital':
        return 'bg-red-100 text-red-800'
      case 'clinic':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (offices.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No offices found. Click "Add Office" to get started.
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onCheckedChange={handleSelectAll}
                aria-label="Select all offices"
              />
            </TableHead>
            <TableHead>Location Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Providers</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {offices.map((office) => (
            <TableRow key={office.id}>
              <TableCell>
                <Checkbox
                  checked={selectedOffices.has(office.id)}
                  onCheckedChange={() => handleSelectOffice(office.id)}
                  aria-label={`Select ${office.locationName}`}
                />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{office.locationName}</div>
                  {office.addressLine2 && (
                    <div className="text-sm text-muted-foreground">
                      {office.addressLine2}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={getLocationTypeColor(office.locationType)}
                >
                  {office.locationType.charAt(0).toUpperCase() + office.locationType.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">{office.addressLine1}</div>
                  <div className="text-sm text-muted-foreground">
                    {office.city}, {office.state} {office.zipCode}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">{formatPhone(office.mainPhone)}</div>
                  {office.fax && (
                    <div className="text-xs text-muted-foreground">
                      Fax: {formatPhone(office.fax)}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {office.providerIds.length} provider{office.providerIds.length !== 1 ? 's' : ''}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={office.isActive ? 'default' : 'secondary'}>
                  {office.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEdit(office)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(office)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onArchive(office.id)}
                      className="text-destructive"
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
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