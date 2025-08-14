import { contextBridge, ipcRenderer } from 'electron'

// Define the API that will be exposed to the renderer process
const electronAPI = {
  // App info
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  getAppName: () => ipcRenderer.invoke('app:getName'),

  // File operations
  openFile: (filters?: { name: string; extensions: string[] }[]) => 
    ipcRenderer.invoke('file:open', filters),
  saveFile: (data: any, defaultPath?: string) => 
    ipcRenderer.invoke('file:save', data, defaultPath),
  readFile: (filePath: string) => 
    ipcRenderer.invoke('file:read', filePath),
  getFileInfo: (filePath: string) => 
    ipcRenderer.invoke('file:getInfo', filePath),
  
  // Provider data operations
  getProviders: () => ipcRenderer.invoke('data:getProviders'),
  getProvider: (id: string) => ipcRenderer.invoke('data:getProvider', id),
  saveProvider: (provider: any) => ipcRenderer.invoke('data:saveProvider', provider),
  deleteProvider: (id: string) => ipcRenderer.invoke('data:deleteProvider', id),
  searchProviders: (query: string) => ipcRenderer.invoke('data:searchProviders', query),
  getActiveProviders: () => ipcRenderer.invoke('data:getActiveProviders'),
  importProviders: (providers: any[]) => ipcRenderer.invoke('data:importProviders', providers),

  // Office data operations
  getOffices: () => ipcRenderer.invoke('data:getOffices'),
  getOffice: (id: string) => ipcRenderer.invoke('data:getOffice', id),
  saveOffice: (office: any) => ipcRenderer.invoke('data:saveOffice', office),
  deleteOffice: (id: string) => ipcRenderer.invoke('data:deleteOffice', id),
  getOfficesByProvider: (providerId: string) => ipcRenderer.invoke('data:getOfficesByProvider', providerId),
  addProviderToOffice: (officeId: string, providerId: string) => ipcRenderer.invoke('data:addProviderToOffice', officeId, providerId),
  removeProviderFromOffice: (officeId: string, providerId: string) => ipcRenderer.invoke('data:removeProviderFromOffice', officeId, providerId),
  searchOffices: (query: string) => ipcRenderer.invoke('data:searchOffices', query),
  getActiveOffices: () => ipcRenderer.invoke('data:getActiveOffices'),
  importOffices: (offices: any[]) => ipcRenderer.invoke('data:importOffices', offices),

  // Address data operations
  getAddresses: () => ipcRenderer.invoke('data:getAddresses'),
  getAddress: (id: string) => ipcRenderer.invoke('data:getAddress', id),
  saveAddress: (address: any) => ipcRenderer.invoke('data:saveAddress', address),
  deleteAddress: (id: string) => ipcRenderer.invoke('data:deleteAddress', id),
  setPrimaryAddress: (id: string) => ipcRenderer.invoke('data:setPrimaryAddress', id),
  getPrimaryAddress: () => ipcRenderer.invoke('data:getPrimaryAddress'),
  getAddressesByProvider: (providerId: string) => ipcRenderer.invoke('data:getAddressesByProvider', providerId),
  addProviderToAddress: (addressId: string, providerId: string) => ipcRenderer.invoke('data:addProviderToAddress', addressId, providerId),
  removeProviderFromAddress: (addressId: string, providerId: string) => ipcRenderer.invoke('data:removeProviderFromAddress', addressId, providerId),
  searchAddresses: (query: string) => ipcRenderer.invoke('data:searchAddresses', query),
  getActiveAddresses: () => ipcRenderer.invoke('data:getActiveAddresses'),
  importAddresses: (addresses: any[]) => ipcRenderer.invoke('data:importAddresses', addresses),

  // Template operations
  getTemplates: () => ipcRenderer.invoke('template:getAll'),
  getTemplate: (id: string) => ipcRenderer.invoke('template:get', id),
  createTemplate: (templateData: any) => ipcRenderer.invoke('template:create', templateData),
  updateTemplate: (id: string, updates: any) => ipcRenderer.invoke('template:update', id, updates),
  deleteTemplate: (id: string) => ipcRenderer.invoke('template:delete', id),
  duplicateTemplate: (id: string, newName?: string) => ipcRenderer.invoke('template:duplicate', id, newName),
  getTemplatesByDocumentType: (documentType: string) => ipcRenderer.invoke('template:getByDocumentType', documentType),
  searchTemplates: (query: string) => ipcRenderer.invoke('template:search', query),
  exportTemplate: (id: string) => ipcRenderer.invoke('template:export', id),
  importTemplate: () => ipcRenderer.invoke('template:import'),
  validateTemplate: (template: any) => ipcRenderer.invoke('template:validate', template),
  getTemplateStatistics: () => ipcRenderer.invoke('template:getStatistics'),

  // Document processing
  analyzeDocument: (filePath: string, options?: any) => 
    ipcRenderer.invoke('document:analyze', filePath, options),
  fillDocument: (filePath: string, mappings: any[], data: any, outputPath: string) => 
    ipcRenderer.invoke('document:fill', filePath, mappings, data, outputPath),
  getDocumentPreview: (filePath: string) => 
    ipcRenderer.invoke('document:getPreview', filePath),
  extractDocumentText: (filePath: string) => 
    ipcRenderer.invoke('document:extractText', filePath),
  getSupportedDocumentTypes: () => 
    ipcRenderer.invoke('document:getSupportedTypes'),
  isDocumentSupported: (filePath: string) => 
    ipcRenderer.invoke('document:isSupported', filePath),
  batchProcessDocuments: (jobs: any[]) => 
    ipcRenderer.invoke('document:batchProcess', jobs),
  
  // Security
  encryptData: (data: string) => ipcRenderer.invoke('security:encrypt', data),
  decryptData: (encryptedData: string) => ipcRenderer.invoke('security:decrypt', encryptedData)
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Type definitions for the exposed API
export type ElectronAPI = typeof electronAPI