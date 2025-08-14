import { useState, useEffect } from 'react'
import { Search, Filter, Users, Building, MapPin, FileText } from 'lucide-react'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Input } from './components/ui/input'
import { ProviderTable } from './components/tables/provider-table'
import { ProviderFormWizard } from './components/forms/provider-form-wizard'
import { OfficeTable } from './components/tables/office-table'
import { OfficeFormWizard } from './components/forms/office-form-wizard'
import { DocumentViewer } from './components/DocumentViewer'
import { TemplateManager } from './components/TemplateManager'
import { FieldMapper } from './components/FieldMapper'
import { SaveTemplateDialog } from './components/dialogs/SaveTemplateDialog'
import { FillDocumentDialog } from './components/dialogs/FillDocumentDialog'
import { Toaster } from './components/ui/toaster'
import { useProviders } from './hooks/use-providers'
import { useOffices } from './hooks/use-offices'
import { useTemplates } from './hooks/use-templates'
import { useProviderStore } from './stores/provider-store'
import { useOfficeStore } from './stores/office-store'
import { useToast } from './hooks/use-toast'
import { Provider, OfficeLocation, DocumentField, Template, FieldMapping } from '@shared/types'
import { ProviderFormData, OfficeLocationFormData } from '@shared/validation/schemas'

function App() {
  const [appInfo, setAppInfo] = useState<{ name: string; version: string }>({
    name: 'Loading...',
    version: 'Loading...'
  })

  // Provider management state
  const { providers, isLoading, error, createProvider, editProvider, duplicateProvider, deleteProvider } = useProviders()
  const { 
    searchQuery, 
    setSearchQuery, 
    getFilteredProviders,
    selectedProviders 
  } = useProviderStore()

  // Office management state
  const { 
    offices, 
    isLoading: officesLoading, 
    error: officesError, 
    createOffice, 
    editOffice, 
    duplicateOffice, 
    deleteOffice 
  } = useOffices()
  const { 
    searchQuery: officeSearchQuery,
    setSearchQuery: setOfficeSearchQuery,
    getFilteredOffices,
    selectedOffices
  } = useOfficeStore()

  // Template management
  const { templates, createTemplateFromMappings } = useTemplates()
  const { toast } = useToast()

  // Form state
  const [showProviderForm, setShowProviderForm] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [showOfficeForm, setShowOfficeForm] = useState(false)
  const [editingOffice, setEditingOffice] = useState<OfficeLocation | null>(null)
  
  // Document state
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null)
  const [isLoadingDocument, setIsLoadingDocument] = useState(false)
  const [detectedFields, setDetectedFields] = useState<DocumentField[]>([])
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([])
  const [loadedTemplate, setLoadedTemplate] = useState<Template | null>(null)
  const [availableTemplateId, setAvailableTemplateId] = useState<string>('')
  const [showFieldMapper, setShowFieldMapper] = useState(false)
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false)
  const [showFillDocumentDialog, setShowFillDocumentDialog] = useState(false)

  useEffect(() => {
    const loadAppInfo = async () => {
      try {
        const [name, version] = await Promise.all([
          window.electronAPI.getAppName(),
          window.electronAPI.getAppVersion()
        ])
        setAppInfo({ name, version })
      } catch (error) {
        console.error('Failed to load app info:', error)
        setAppInfo({ name: 'Provider Enrollment Assistant', version: '1.0.0' })
      }
    }

    loadAppInfo()
  }, [])

  const handleAddProvider = () => {
    setEditingProvider(null)
    setShowProviderForm(true)
  }

  const handleEditProvider = (provider: Provider) => {
    setEditingProvider(provider)
    setShowProviderForm(true)
  }

  const handleDuplicateProvider = async (provider: Provider) => {
    try {
      await duplicateProvider(provider)
    } catch (error) {
      console.error('Failed to duplicate provider:', error)
    }
  }

  const handleArchiveProvider = async (providerId: string) => {
    try {
      await deleteProvider(providerId)
    } catch (error) {
      console.error('Failed to archive provider:', error)
    }
  }

  const handleFormSubmit = async (data: ProviderFormData) => {
    try {
      console.log('=== App.tsx handleFormSubmit Called ===')
      console.log('Form data:', JSON.stringify(data, null, 2))
      console.log('editingProvider:', editingProvider)
      
      if (editingProvider) {
        console.log('Editing existing provider...')
        await editProvider({ ...data, id: editingProvider.id } as Provider)
        console.log('Provider edit completed')
      } else {
        console.log('Creating new provider...')
        await createProvider(data)
        console.log('Provider creation completed')
      }
      console.log('=== App.tsx handleFormSubmit Completed Successfully ===')
    } catch (error) {
      console.error('=== App.tsx handleFormSubmit Failed ===')
      console.error('Failed to save provider:', error)
      throw error
    }
  }

  // Office handlers
  const handleAddOffice = () => {
    setEditingOffice(null)
    setShowOfficeForm(true)
  }

  const handleEditOffice = (office: OfficeLocation) => {
    setEditingOffice(office)
    setShowOfficeForm(true)
  }

  const handleDuplicateOffice = async (office: OfficeLocation) => {
    try {
      await duplicateOffice(office)
    } catch (error) {
      console.error('Failed to duplicate office:', error)
    }
  }

  const handleArchiveOffice = async (officeId: string) => {
    try {
      await deleteOffice(officeId)
    } catch (error) {
      console.error('Failed to archive office:', error)
    }
  }

  const handleOfficeFormSubmit = async (data: OfficeLocationFormData) => {
    try {
      console.log('=== App.tsx handleOfficeFormSubmit Called ===')
      console.log('Office form data:', JSON.stringify(data, null, 2))
      console.log('editingOffice:', editingOffice)
      
      if (editingOffice) {
        console.log('Editing existing office...')
        await editOffice({ ...data, id: editingOffice.id } as OfficeLocation)
        console.log('Office edit completed')
      } else {
        console.log('Creating new office...')
        await createOffice(data)
        console.log('Office creation completed')
      }
      console.log('=== App.tsx handleOfficeFormSubmit Completed Successfully ===')
    } catch (error) {
      console.error('=== App.tsx handleOfficeFormSubmit Failed ===')
      console.error('Failed to save office:', error)
      throw error
    }
  }

  const handleOpenDocument = async () => {
    try {
      setIsLoadingDocument(true)
      setDocumentError(null)
      setDetectedFields([])
      
      const fileInfo = await window.electronAPI.openFile([
        { name: 'PDF Files', extensions: ['pdf'] },
        { name: 'Word Documents', extensions: ['docx', 'doc'] },
        { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
        { name: 'All Documents', extensions: ['pdf', 'docx', 'doc', 'xlsx', 'xls'] }
      ])
      
      if (fileInfo) {
        setSelectedDocument(fileInfo)
        console.log('Selected document:', fileInfo)
      }
    } catch (error) {
      console.error('Failed to open document:', error)
      setDocumentError(error instanceof Error ? error.message : 'Failed to open document')
    } finally {
      setIsLoadingDocument(false)
    }
  }

  const handleFieldsDetected = (fields: DocumentField[]) => {
    setDetectedFields(fields)
    setShowFieldMapper(fields.length > 0)
    console.log('Detected fields:', fields)
  }

  const handleDocumentError = (error: string) => {
    setDocumentError(error)
  }

  const handleClearDocument = () => {
    setSelectedDocument(null)
    setDetectedFields([])
    setDocumentError(null)
    setFieldMappings([])
    setLoadedTemplate(null)
    setAvailableTemplateId('')
    setShowFieldMapper(false)
  }

  const handleMappingsChange = (mappings: FieldMapping[]) => {
    setFieldMappings(mappings)
  }

  const handleLoadTemplate = () => {
    const template = templates.find(t => t.id === availableTemplateId)
    if (template) {
      setFieldMappings(template.mappings)
      setLoadedTemplate(template)
      toast({
        title: "Template Loaded",
        description: `Applied ${template.mappings.length} field mappings from "${template.name}"`,
        variant: "default"
      })
    }
  }

  const handleClearTemplate = () => {
    setFieldMappings([])
    setLoadedTemplate(null)
    setAvailableTemplateId('')
    toast({
      title: "Template Cleared",
      description: "All field mappings have been cleared",
      variant: "default"
    })
  }

  const handleSaveTemplate = async (mappings: FieldMapping[]) => {
    setShowSaveTemplateDialog(true)
  }

  const handleSaveTemplateConfirm = async (templateData: { name: string; description: string; mappings: FieldMapping[] }) => {
    try {
      const documentType = (selectedDocument?.extension?.replace('.', '') as 'pdf' | 'docx' | 'xlsx') || 'pdf'
      
      const template = await createTemplateFromMappings(
        templateData.name,
        templateData.description,
        documentType,
        templateData.mappings,
        selectedDocument?.name // Use as document hash for compatibility
      )
      
      if (template) {
        setSelectedTemplate(template)
        toast({
          title: "Template Saved",
          description: `Template "${templateData.name}" has been saved successfully.`,
          variant: "success"
        })
      } else {
        throw new Error('Failed to create template')
      }
    } catch (error) {
      console.error('Failed to save template:', error)
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : 'Failed to save template',
        variant: "destructive"
      })
      throw error // Re-throw to let dialog handle it
    }
  }

  const handleFillDocument = async (selections: {
    providerIds: string[]
    officeIds: string[]
    mailingAddressIds: string[]
    outputDirectory: string
    fileNamePattern: string
  }) => {
    try {
      if (!selectedDocument || fieldMappings.length === 0) {
        throw new Error('No document or mappings available')
      }

      // Build jobs for batch processing
      const jobs = []
      const selectedProviders = providers.filter(p => selections.providerIds.includes(p.id))
      const selectedOffices = offices.filter(o => selections.officeIds.includes(o.id))

      for (const provider of selectedProviders) {
        // If offices are selected, create one document per provider-office combination
        // Otherwise, create one document per provider
        const officesToUse = selectedOffices.length > 0 ? selectedOffices : [null]
        
        for (const office of officesToUse) {
          // Generate output filename
          let fileName = selections.fileNamePattern
          fileName = fileName.replace('{provider.lastName}', provider.lastName || 'Provider')
          fileName = fileName.replace('{provider.firstName}', provider.firstName || '')
          fileName = fileName.replace('{documentName}', selectedDocument.name.split('.')[0])
          fileName = fileName.replace('{date}', new Date().toISOString().split('T')[0])
          
          if (office) {
            fileName = fileName.replace('{office.locationName}', office.locationName || 'Office')
          }
          
          // Clean up filename
          fileName = fileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')
          const outputPath = `${selections.outputDirectory}/${fileName}.pdf`

          // Prepare data for this combination
          const data = {
            provider,
            office,
            mailingAddress: null, // TODO: Add mailing address support
            custom: {}
          }

          jobs.push({
            filePath: selectedDocument.path,
            mappings: fieldMappings,
            data,
            outputPath
          })
        }
      }

      console.log(`Batch processing ${jobs.length} documents...`)

      // Execute batch processing
      const result = await window.electronAPI.batchProcessDocuments(jobs)

      if (result.success) {
        const successCount = result.successCount || 0
        const totalCount = result.totalCount || jobs.length
        
        toast({
          title: "Documents Generated",
          description: `Successfully generated ${successCount} of ${totalCount} document(s)`,
          variant: successCount === totalCount ? "success" : "default"
        })

        // Show warnings for any failures
        if (successCount < totalCount) {
          const failures = result.results.filter((r: any) => !r.success)
          console.warn('Some documents failed to generate:', failures)
        }
      } else {
        throw new Error(result.error || 'Batch processing failed')
      }
    } catch (error) {
      console.error('Failed to fill documents:', error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Failed to generate documents',
        variant: "destructive"
      })
      throw error
    }
  }

  const filteredProviders = getFilteredProviders()
  const filteredOffices = getFilteredOffices()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{appInfo.name}</h1>
              <p className="text-sm text-muted-foreground">Version {appInfo.version}</p>
            </div>
            <Button variant="outline">Settings</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="document-processing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="document-processing">Document Processing</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="providers">Provider Management</TabsTrigger>
            <TabsTrigger value="offices">Offices</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>

          <TabsContent value="document-processing" className="space-y-6">
            {!showFieldMapper ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Provider & Address Selection */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Provider & Address Selection</CardTitle>
                    <CardDescription>
                      Select providers and addresses for document processing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Providers</h4>
                        <div className="text-sm text-muted-foreground">
                          {providers.length === 0 
                            ? 'No providers loaded. Add providers in the Provider Management tab.'
                            : `${providers.length} provider${providers.length !== 1 ? 's' : ''} available`
                          }
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Offices</h4>
                        <div className="text-sm text-muted-foreground">
                          {offices.length === 0 
                            ? 'No offices loaded. Add offices in the Offices tab.'
                            : `${offices.length} office${offices.length !== 1 ? 's' : ''} available`
                          }
                        </div>
                      </div>
                      <Button className="w-full" disabled={!selectedDocument || detectedFields.length === 0 || fieldMappings.length === 0}>
                        Generate Documents
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Document Preview */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Document Preview</CardTitle>
                    <CardDescription>
                      Open a document to start field mapping
                    </CardDescription>
                    <div className="flex space-x-2 mt-2">
                      <Button variant="outline" size="sm" onClick={handleOpenDocument} disabled={isLoadingDocument}>
                        {isLoadingDocument ? 'Opening...' : selectedDocument ? 'Change Document' : 'Open Document'}
                      </Button>
                      {selectedDocument && (
                        <Button variant="outline" size="sm" onClick={handleClearDocument}>
                          Clear
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <DocumentViewer
                      filePath={selectedDocument?.path || null}
                      onFieldsDetected={handleFieldsDetected}
                      onError={handleDocumentError}
                    />
                    {documentError && (
                      <div className="p-4">
                        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                          {documentError}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Document Header */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Field Mapping - {selectedDocument?.name}</CardTitle>
                        <CardDescription>
                          Map your data to document fields using drag and drop
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={handleOpenDocument}>
                          Change Document
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowFieldMapper(false)}>
                          Back to Document View
                        </Button>
                        {fieldMappings.length > 0 && (
                          <Button 
                            size="sm" 
                            onClick={() => setShowFillDocumentDialog(true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Fill Document
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Template Loader */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Load Template</span>
                      {loadedTemplate && (
                        <Badge variant="secondary" className="text-xs">
                          {loadedTemplate.name} ({loadedTemplate.mappings.length} mappings)
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {loadedTemplate ? 
                        `Currently using template: ${loadedTemplate.name}` : 
                        'Load a saved template to populate field mappings'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Select 
                          value={availableTemplateId} 
                          onValueChange={setAvailableTemplateId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a template..." />
                          </SelectTrigger>
                          <SelectContent>
                            {templates
                              .filter(t => !selectedDocument?.extension || 
                                t.documentType === selectedDocument.extension.replace('.', ''))
                              .map(template => (
                                <SelectItem key={template.id} value={template.id}>
                                  <div className="flex items-center space-x-2">
                                    <span>{template.name}</span>
                                    <Badge variant="outline" className="text-xs ml-2">
                                      {template.mappings.length} fields
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handleLoadTemplate}
                        disabled={!availableTemplateId}
                        size="sm"
                      >
                        Load Template
                      </Button>
                      {loadedTemplate && (
                        <Button 
                          onClick={handleClearTemplate}
                          variant="outline"
                          size="sm"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Field Mapper */}
                <FieldMapper
                  documentFields={detectedFields}
                  mappings={fieldMappings}
                  onMappingsChange={handleMappingsChange}
                  onSaveTemplate={handleSaveTemplate}
                  selectedTemplate={selectedTemplate}
                  documentType={selectedDocument?.extension?.replace('.', '') as 'pdf' | 'docx' | 'xlsx' | undefined}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <TemplateManager
              onTemplateSelect={(template) => setSelectedTemplate(template)}
              selectedDocumentType={selectedDocument?.type as 'pdf' | 'docx' | 'xlsx' | undefined}
            />
          </TabsContent>

          <TabsContent value="providers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Provider Management
                </CardTitle>
                <CardDescription>
                  Manage healthcare provider information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Button onClick={handleAddProvider}>
                      Add Provider
                    </Button>
                    <Button variant="outline">Import CSV</Button>
                    <Button variant="outline">Export</Button>
                    {selectedProviders.size > 0 && (
                      <Button variant="outline">
                        Bulk Edit ({selectedProviders.size})
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search providers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </div>

                {error && (
                  <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
                    {error}
                  </div>
                )}

                {isLoading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Loading providers...
                  </div>
                ) : (
                  <ProviderTable
                    providers={filteredProviders}
                    onEdit={handleEditProvider}
                    onDuplicate={handleDuplicateProvider}
                    onArchive={handleArchiveProvider}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Office Management
                </CardTitle>
                <CardDescription>
                  Manage office locations and practice information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Button onClick={handleAddOffice}>
                      Add Office
                    </Button>
                    <Button variant="outline">Import CSV</Button>
                    <Button variant="outline">Export</Button>
                    {selectedOffices.size > 0 && (
                      <Button variant="outline">
                        Bulk Edit ({selectedOffices.size})
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search offices..."
                      value={officeSearchQuery}
                      onChange={(e) => setOfficeSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </div>

                {officesError && (
                  <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md mb-4">
                    {officesError}
                  </div>
                )}

                {officesLoading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Loading offices...
                  </div>
                ) : (
                  <OfficeTable
                    offices={filteredOffices}
                    onEdit={handleEditOffice}
                    onDuplicate={handleDuplicateOffice}
                    onArchive={handleArchiveOffice}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Mailing Address Management
                </CardTitle>
                <CardDescription>
                  Manage mailing and correspondence addresses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Button>Add Address</Button>
                    <Button variant="outline">Import</Button>
                  </div>
                </div>
                <div className="text-center py-12 text-muted-foreground">
                  No addresses found. Click "Add Address" to get started.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Provider Form Wizard */}
      <ProviderFormWizard
        open={showProviderForm}
        onOpenChange={setShowProviderForm}
        provider={editingProvider}
        onSubmit={handleFormSubmit}
      />

      {/* Office Form Wizard */}
      <OfficeFormWizard
        open={showOfficeForm}
        onOpenChange={setShowOfficeForm}
        office={editingOffice}
        onSubmit={handleOfficeFormSubmit}
      />

      {/* Save Template Dialog */}
      <SaveTemplateDialog
        open={showSaveTemplateDialog}
        onOpenChange={setShowSaveTemplateDialog}
        mappings={fieldMappings}
        documentType={selectedDocument?.extension?.replace('.', '') as 'pdf' | 'docx' | 'xlsx' | undefined}
        documentName={selectedDocument?.name}
        onSave={handleSaveTemplateConfirm}
      />

      {/* Fill Document Dialog */}
      <FillDocumentDialog
        open={showFillDocumentDialog}
        onOpenChange={setShowFillDocumentDialog}
        documentName={selectedDocument?.name || 'Document'}
        mappings={fieldMappings}
        providers={providers}
        offices={offices}
        mailingAddresses={[]} // TODO: Add mailing addresses when implemented
        onFill={handleFillDocument}
      />

      <Toaster />
    </div>
  )
}

export default App