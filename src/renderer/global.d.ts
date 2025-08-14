// Global type declarations for the renderer process

interface FileInfo {
  path: string
  name: string
  extension: string
  size: number
  type: string
  lastModified?: Date
  created?: Date
}

declare global {
  interface Window {
    electronAPI: {
      // App info
      getAppVersion: () => Promise<string>
      getAppName: () => Promise<string>

      // File operations
      openFile: (filters?: { name: string; extensions: string[] }[]) => Promise<FileInfo | null>
      saveFile: (data: any, defaultPath?: string) => Promise<string | null>
      readFile: (filePath: string) => Promise<Buffer>
      getFileInfo: (filePath: string) => Promise<FileInfo>
      
      // Provider data operations
      getProviders: () => Promise<any[]>
      getProvider: (id: string) => Promise<any | null>
      saveProvider: (provider: any) => Promise<any>
      deleteProvider: (id: string) => Promise<void>
      searchProviders: (query: string) => Promise<any[]>
      getActiveProviders: () => Promise<any[]>
      importProviders: (providers: any[]) => Promise<void>

      // Office data operations
      getOffices: () => Promise<any[]>
      getOffice: (id: string) => Promise<any | null>
      saveOffice: (office: any) => Promise<any>
      deleteOffice: (id: string) => Promise<void>
      getOfficesByProvider: (providerId: string) => Promise<any[]>
      addProviderToOffice: (officeId: string, providerId: string) => Promise<void>
      removeProviderFromOffice: (officeId: string, providerId: string) => Promise<void>
      searchOffices: (query: string) => Promise<any[]>
      getActiveOffices: () => Promise<any[]>
      importOffices: (offices: any[]) => Promise<void>

      // Address data operations
      getAddresses: () => Promise<any[]>
      getAddress: (id: string) => Promise<any | null>
      saveAddress: (address: any) => Promise<any>
      deleteAddress: (id: string) => Promise<void>
      setPrimaryAddress: (id: string) => Promise<void>
      getPrimaryAddress: () => Promise<any | null>
      getAddressesByProvider: (providerId: string) => Promise<any[]>
      addProviderToAddress: (addressId: string, providerId: string) => Promise<void>
      removeProviderFromAddress: (addressId: string, providerId: string) => Promise<void>
      searchAddresses: (query: string) => Promise<any[]>
      getActiveAddresses: () => Promise<any[]>
      importAddresses: (addresses: any[]) => Promise<void>

      // Template operations
      getTemplates: () => Promise<any>
      getTemplate: (id: string) => Promise<any>
      createTemplate: (templateData: any) => Promise<any>
      updateTemplate: (id: string, updates: any) => Promise<any>
      deleteTemplate: (id: string) => Promise<any>
      duplicateTemplate: (id: string, newName?: string) => Promise<any>
      getTemplatesByDocumentType: (documentType: string) => Promise<any>
      searchTemplates: (query: string) => Promise<any>
      exportTemplate: (id: string) => Promise<any>
      importTemplate: () => Promise<any>
      validateTemplate: (template: any) => Promise<any>
      getTemplateStatistics: () => Promise<any>

      // Document processing
      analyzeDocument: (filePath: string, options?: any) => Promise<any>
      fillDocument: (filePath: string, mappings: any[], data: any, outputPath: string) => Promise<any>
      getDocumentPreview: (filePath: string) => Promise<any>
      extractDocumentText: (filePath: string) => Promise<any>
      getSupportedDocumentTypes: () => Promise<any>
      isDocumentSupported: (filePath: string) => Promise<any>
      batchProcessDocuments: (jobs: any[]) => Promise<any>
      
      // Security
      encryptData: (data: string) => Promise<string>
      decryptData: (encryptedData: string) => Promise<string>
    }
  }
}

export {}