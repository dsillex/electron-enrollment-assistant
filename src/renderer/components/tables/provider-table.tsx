import { Edit, Copy, Archive, MoreHorizontal } from 'lucide-react'
import { Provider } from '@shared/types'
import { useProviderStore } from '@renderer/stores/provider-store'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@renderer/components/ui/table'
import { Checkbox } from '@renderer/components/ui/checkbox'
import { Button } from '@renderer/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@renderer/components/ui/dropdown-menu'

interface ProviderTableProps {
  providers: Provider[]
  onEdit: (provider: Provider) => void
  onDuplicate: (provider: Provider) => void
  onArchive: (providerId: string) => void
}

export function ProviderTable({ 
  providers, 
  onEdit, 
  onDuplicate, 
  onArchive 
}: ProviderTableProps) {
  const { 
    selectedProviders, 
    selectProvider, 
    deselectProvider,
    selectAllProviders,
    deselectAllProviders
  } = useProviderStore()

  const isAllSelected = providers.length > 0 && 
    providers.every(provider => selectedProviders.has(provider.id))

  const handleSelectAll = () => {
    if (isAllSelected) {
      deselectAllProviders()
    } else {
      selectAllProviders()
    }
  }

  const handleSelectProvider = (providerId: string) => {
    if (selectedProviders.has(providerId)) {
      deselectProvider(providerId)
    } else {
      selectProvider(providerId)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (isActive: boolean) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )

  if (providers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No providers found. Click "Add Provider" to get started.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
            />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>NPI</TableHead>
          <TableHead>License</TableHead>
          <TableHead>Specialty</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-12">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {providers.map((provider) => (
          <TableRow key={provider.id}>
            <TableCell>
              <Checkbox
                checked={selectedProviders.has(provider.id)}
                onCheckedChange={() => handleSelectProvider(provider.id)}
              />
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">
                  Dr. {provider.firstName} {provider.lastName}
                  {provider.suffix && `, ${provider.suffix}`}
                </div>
                <div className="text-sm text-muted-foreground">{provider.email}</div>
              </div>
            </TableCell>
            <TableCell className="font-mono">{provider.npi}</TableCell>
            <TableCell>
              <div>
                <div>{provider.licenseNumber}</div>
                <div className="text-sm text-muted-foreground">{provider.licenseState}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="max-w-32">
                {provider.specialties.slice(0, 2).map((specialty, index) => (
                  <div key={index} className="text-sm">
                    {specialty}
                  </div>
                ))}
                {provider.specialties.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{provider.specialties.length - 2} more
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(provider.isActive)}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(provider.createdAt)}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(provider)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(provider)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onArchive(provider.id)}
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
  )
}