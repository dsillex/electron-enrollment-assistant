import { useState, useEffect } from 'react'
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
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Alert, AlertDescription } from '../ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  FileText, 
  Users, 
  Building,
  Play,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Provider, OfficeLocation, MailingAddress, FieldMapping } from '@shared/types'

const fillDocumentSchema = z.object({
  outputDirectory: z.string().min(1, 'Output directory is required'),
  fileNamePattern: z.string().min(1, 'File name pattern is required'),
  fillMode: z.enum(['individual', 'roster'], {
    required_error: 'Please select a fill mode'
  })
})

type FillDocumentFormData = z.infer<typeof fillDocumentSchema>

interface FillDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentName: string
  mappings: FieldMapping[]
  providers: Provider[]
  offices: OfficeLocation[]
  _mailingAddresses?: MailingAddress[]
  onFill: (selections: FillSelections) => Promise<void>
}

type FillMode = 'individual' | 'roster'

interface FillSelections {
  providerIds: string[]
  officeIds: string[]
  mailingAddressIds: string[]
  outputDirectory: string
  fileNamePattern: string
  fillMode: FillMode
  rosterProviders?: RosterProvider[] // For roster mode with positions
}

interface RosterProvider {
  providerId: string
  position: number
}

export function FillDocumentDialog({
  open,
  onOpenChange,
  documentName,
  mappings,
  providers,
  offices,
  _mailingAddresses = [],
  onFill
}: FillDocumentDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Selection states
  const [selectedProviderIds, setSelectedProviderIds] = useState<Set<string>>(new Set())
  const [selectedOfficeIds, setSelectedOfficeIds] = useState<Set<string>>(new Set())
  const [selectedMailingIds, setSelectedMailingIds] = useState<Set<string>>(new Set())
  
  // Roster mode states
  const [fillMode, setFillMode] = useState<FillMode>('individual')
  const [rosterProviders, setRosterProviders] = useState<RosterProvider[]>([])
  const [providerFilter, setProviderFilter] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all')

  const form = useForm<FillDocumentFormData>({
    resolver: zodResolver(fillDocumentSchema),
    defaultValues: {
      outputDirectory: 'C:/Documents/Generated', // Default directory
      fileNamePattern: '{provider.lastName}_{provider.firstName}_{documentName}',
      fillMode: 'individual'
    }
  })

  // Reset selections when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedProviderIds(new Set())
      setSelectedOfficeIds(new Set())
      setSelectedMailingIds(new Set())
      setRosterProviders([])
      setFillMode('individual')
      setProviderFilter('')
      setSpecialtyFilter('all')
      setError(null)
      form.setValue('fillMode', 'individual')
    }
  }, [open, form])

  // Update roster providers when selection or mode changes
  useEffect(() => {
    if (fillMode === 'roster') {
      const currentRoster = rosterProviders.filter(rp => selectedProviderIds.has(rp.providerId))
      const newProviders = Array.from(selectedProviderIds).filter(
        id => !currentRoster.some(rp => rp.providerId === id)
      )
      
      const updatedRoster = [
        ...currentRoster,
        ...newProviders.map((id, index) => ({
          providerId: id,
          position: currentRoster.length + index + 1
        }))
      ]
      
      setRosterProviders(updatedRoster)
    }
  }, [selectedProviderIds, fillMode, rosterProviders])

  const handleFill = async (data: FillDocumentFormData) => {
    if (selectedProviderIds.size === 0) {
      setError('Please select at least one provider')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      await onFill({
        providerIds: Array.from(selectedProviderIds),
        officeIds: Array.from(selectedOfficeIds),
        mailingAddressIds: Array.from(selectedMailingIds),
        outputDirectory: data.outputDirectory,
        fileNamePattern: data.fileNamePattern,
        fillMode: data.fillMode,
        rosterProviders: data.fillMode === 'roster' ? rosterProviders : undefined
      })
      
      // Reset and close on success
      form.reset()
      setSelectedProviderIds(new Set())
      setSelectedOfficeIds(new Set())
      setSelectedMailingIds(new Set())
      onOpenChange(false)
    } catch (err) {
      console.error('Failed to fill documents:', err)
      setError(err instanceof Error ? err.message : 'Failed to fill documents')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    setSelectedProviderIds(new Set())
    setSelectedOfficeIds(new Set())
    setSelectedMailingIds(new Set())
    setError(null)
    onOpenChange(false)
  }

  // Provider selection helpers
  const handleSelectAllProviders = () => {
    setSelectedProviderIds(new Set(providers.map(p => p.id)))
  }

  const handleSelectNoProviders = () => {
    setSelectedProviderIds(new Set())
  }

  const handleProviderToggle = (providerId: string) => {
    const newSet = new Set(selectedProviderIds)
    if (newSet.has(providerId)) {
      newSet.delete(providerId)
    } else {
      newSet.add(providerId)
    }
    setSelectedProviderIds(newSet)
  }

  // Office selection helpers
  const handleSelectAllOffices = () => {
    setSelectedOfficeIds(new Set(offices.map(o => o.id)))
  }

  const handleSelectNoOffices = () => {
    setSelectedOfficeIds(new Set())
  }

  const handleOfficeToggle = (officeId: string) => {
    const newSet = new Set(selectedOfficeIds)
    if (newSet.has(officeId)) {
      newSet.delete(officeId)
    } else {
      newSet.add(officeId)
    }
    setSelectedOfficeIds(newSet)
  }

  // Mailing address selection helpers
  const _handleMailingToggle = (mailingId: string) => {
    const newSet = new Set(selectedMailingIds)
    if (newSet.has(mailingId)) {
      newSet.delete(mailingId)
    } else {
      newSet.add(mailingId)
    }
    setSelectedMailingIds(newSet)
  }

  // Roster mode helpers
  const handleFillModeChange = (mode: FillMode) => {
    setFillMode(mode)
    form.setValue('fillMode', mode)
    
    // Update file name pattern for roster mode
    if (mode === 'roster') {
      form.setValue('fileNamePattern', '{documentName}_Roster_{date}')
    } else {
      form.setValue('fileNamePattern', '{provider.lastName}_{provider.firstName}_{documentName}')
    }
  }

  const handleProviderPositionChange = (providerId: string, newPosition: number) => {
    setRosterProviders(prev => 
      prev.map(rp => 
        rp.providerId === providerId ? { ...rp, position: newPosition } : rp
      ).sort((a, b) => a.position - b.position)
    )
  }

  const handleSelectProvidersBySpecialty = (specialty: string) => {
    const specialtyProviders = providers.filter(p => 
      p.specialties?.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
    )
    const newSet = new Set([...selectedProviderIds, ...specialtyProviders.map(p => p.id)])
    setSelectedProviderIds(newSet)
  }

  // Filter providers based on search and specialty
  const filteredProviders = providers.filter(provider => {
    const nameMatch = providerFilter === '' || 
      `${provider.firstName} ${provider.lastName}`.toLowerCase().includes(providerFilter.toLowerCase())
    
    const specialtyMatch = specialtyFilter === 'all' || 
      provider.specialties?.some(s => s.toLowerCase().includes(specialtyFilter.toLowerCase()))
    
    return nameMatch && specialtyMatch
  })

  // Get unique specialties for filter dropdown
  const availableSpecialties = Array.from(new Set(
    providers.flatMap(p => p.specialties || [])
  )).sort()

  // Get mapping statistics
  const mappingStats = {
    total: mappings.length,
    required: mappings.filter(m => m.isRequired).length,
    providerFields: mappings.filter(m => m.sourceType === 'provider').length,
    officeFields: mappings.filter(m => m.sourceType === 'office').length,
    mailingFields: mappings.filter(m => m.sourceType === 'mailing').length
  }

  // Calculate estimated documents
  const estimatedDocuments = fillMode === 'roster' ? 1 : selectedProviderIds.size * Math.max(1, selectedOfficeIds.size || 1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Fill Document - {documentName}</span>
          </DialogTitle>
          <DialogDescription>
            Select providers, offices, and settings for document generation
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFill)} className="space-y-6">
            {/* Mapping Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Field Mapping Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary">{mappingStats.total}</div>
                    <div className="text-muted-foreground">Total Fields</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{mappingStats.required}</div>
                    <div className="text-muted-foreground">Required</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{mappingStats.providerFields}</div>
                    <div className="text-muted-foreground">Provider</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-600">{mappingStats.officeFields}</div>
                    <div className="text-muted-foreground">Office</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fill Mode Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Document Fill Mode</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="individual-mode"
                      name="fillMode"
                      value="individual"
                      checked={fillMode === 'individual'}
                      onChange={(e) => handleFillModeChange(e.target.value as FillMode)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="individual-mode" className="font-medium">
                      One document per provider (Individual enrollment forms)
                    </Label>
                  </div>
                  <div className="text-sm text-muted-foreground ml-6">
                    Each selected provider gets their own filled document. Best for individual enrollment forms.
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="roster-mode"
                      name="fillMode"
                      value="roster"
                      checked={fillMode === 'roster'}
                      onChange={(e) => handleFillModeChange(e.target.value as FillMode)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="roster-mode" className="font-medium">
                      Multiple providers in one document (Roster updates)
                    </Label>
                  </div>
                  <div className="text-sm text-muted-foreground ml-6">
                    All selected providers are added to a single document. Best for roster updates and bulk submissions.
                  </div>

                  {fillMode === 'roster' && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Roster mode selected. You can choose specific providers and their order in the document.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Selection Tabs */}
            <Tabs defaultValue="providers" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="providers" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Providers ({selectedProviderIds.size})</span>
                </TabsTrigger>
                <TabsTrigger value="offices" className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>Offices ({selectedOfficeIds.size})</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Output Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="providers" className="space-y-4">
                {/* Provider Filters */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Search Providers</Label>
                    <Input
                      placeholder="Search by name..."
                      value={providerFilter}
                      onChange={(e) => setProviderFilter(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Filter by Specialty</Label>
                    <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="All specialties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Specialties</SelectItem>
                        {availableSpecialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty.toLowerCase()}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleSelectAllProviders}>
                      Select All ({filteredProviders.length})
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleSelectNoProviders}>
                      Select None
                    </Button>
                    {availableSpecialties.length > 0 && (
                      <Select onValueChange={handleSelectProvidersBySpecialty}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Quick select by specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSpecialties.map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              Select all {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <Badge variant="outline">
                    {selectedProviderIds.size} of {filteredProviders.length} selected
                  </Badge>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-4">
                  {filteredProviders.map((provider) => {
                    const rosterProvider = rosterProviders.find(rp => rp.providerId === provider.id)
                    const position = rosterProvider?.position || 0
                    
                    return (
                      <div
                        key={provider.id}
                        className={`flex items-center space-x-3 p-2 hover:bg-muted rounded-md ${
                          selectedProviderIds.has(provider.id) && fillMode === 'roster' ? 'bg-blue-50' : ''
                        }`}
                      >
                        <Checkbox
                          id={`provider-${provider.id}`}
                          checked={selectedProviderIds.has(provider.id)}
                          onCheckedChange={() => handleProviderToggle(provider.id)}
                        />
                        
                        {fillMode === 'roster' && selectedProviderIds.has(provider.id) && (
                          <div className="flex items-center space-x-2">
                            <Label className="text-xs">Position:</Label>
                            <Select
                              value={position.toString()}
                              onValueChange={(value) => handleProviderPositionChange(provider.id, parseInt(value))}
                            >
                              <SelectTrigger className="w-16 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: selectedProviderIds.size }, (_, i) => i + 1).map(pos => (
                                  <SelectItem key={pos} value={pos.toString()}>
                                    {pos}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <Label
                            htmlFor={`provider-${provider.id}`}
                            className="font-medium cursor-pointer"
                          >
                            Dr. {provider.firstName} {provider.lastName}
                            {fillMode === 'roster' && selectedProviderIds.has(provider.id) && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                #{position}
                              </Badge>
                            )}
                          </Label>
                          <div className="text-sm text-muted-foreground">
                            NPI: {provider.npi} • {provider.specialties?.join(', ')}
                            {provider.providerType && (
                              <span> • {provider.providerType}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="offices" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleSelectAllOffices}>
                      Select All ({offices.length})
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleSelectNoOffices}>
                      Select None
                    </Button>
                  </div>
                  <Badge variant="outline">
                    {selectedOfficeIds.size} of {offices.length} selected
                  </Badge>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-4">
                  {offices.map((office) => (
                    <div
                      key={office.id}
                      className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md"
                    >
                      <Checkbox
                        id={`office-${office.id}`}
                        checked={selectedOfficeIds.has(office.id)}
                        onCheckedChange={() => handleOfficeToggle(office.id)}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`office-${office.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {office.locationName}
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          {office.addressLine1}, {office.city}, {office.state} {office.zipCode}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {mappingStats.officeFields === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No office fields are mapped in this template. Office selection is optional.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <FormField
                  control={form.control}
                  name="outputDirectory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Output Directory *</FormLabel>
                      <FormControl>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Select output directory..."
                            {...field}
                            disabled={isLoading}
                            readOnly
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => {
                              // For now, set a default directory
                              const defaultDir = 'C:/Users/Documents/Generated'
                              form.setValue('outputDirectory', defaultDir)
                            }}
                          >
                            Browse
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Directory where generated documents will be saved
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fileNamePattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File Name Pattern *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., {provider.lastName}_{provider.firstName}_{documentName}"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Use {`{provider.field}`}, {`{office.field}`}, {`{documentName}`}, {`{date}`} as placeholders
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Generation Preview */}
                {selectedProviderIds.size > 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {fillMode === 'roster' ? (
                        <>
                          Ready to generate <strong>1 roster document</strong> with <strong>{selectedProviderIds.size}</strong> provider{selectedProviderIds.size !== 1 ? 's' : ''}
                          {rosterProviders.length > 0 && (
                            <div className="mt-2 text-xs">
                              Provider order: {rosterProviders
                                .sort((a, b) => a.position - b.position)
                                .map(rp => {
                                  const provider = providers.find(p => p.id === rp.providerId)
                                  return `${rp.position}. ${provider?.lastName}`
                                })
                                .join(', ')
                              }
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          Ready to generate <strong>{estimatedDocuments}</strong> document{estimatedDocuments !== 1 ? 's' : ''} 
                          ({selectedProviderIds.size} provider{selectedProviderIds.size !== 1 ? 's' : ''} × {Math.max(1, selectedOfficeIds.size || 1)} combination{Math.max(1, selectedOfficeIds.size || 1) !== 1 ? 's' : ''})
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
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
                disabled={isLoading || selectedProviderIds.size === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    {fillMode === 'roster' 
                      ? `Generate Roster Document (${selectedProviderIds.size} providers)`
                      : `Generate Documents (${estimatedDocuments})`
                    }
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