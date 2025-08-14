import { useEffect } from 'react'
import { Provider } from '@shared/types'
import { useProviderStore } from '@renderer/stores/provider-store'

export function useProviders() {
  const {
    providers,
    isLoading,
    error,
    setProviders,
    addProvider,
    updateProvider,
    removeProvider,
    setLoading,
    setError
  } = useProviderStore()

  // Load providers on mount
  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      setLoading(true)
      setError(null)
      const providersData = await window.electronAPI.getProviders()
      setProviders(providersData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load providers'
      setError(errorMessage)
      console.error('Failed to load providers:', err)
    } finally {
      setLoading(false)
    }
  }

  const createProvider = async (providerData: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<Provider> => {
    try {
      console.log('=== useProviders createProvider Called ===')
      console.log('Provider data:', JSON.stringify(providerData, null, 2))
      
      setLoading(true)
      setError(null)
      
      console.log('Calling window.electronAPI.saveProvider...')
      const newProvider = await window.electronAPI.saveProvider(providerData)
      console.log('Received new provider from API:', JSON.stringify(newProvider, null, 2))
      
      console.log('Adding provider to store...')
      addProvider(newProvider)
      console.log('=== useProviders createProvider Completed Successfully ===')
      return newProvider
    } catch (err) {
      console.error('=== useProviders createProvider Failed ===')
      console.error('Error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create provider'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const editProvider = async (provider: Provider): Promise<Provider> => {
    try {
      setLoading(true)
      setError(null)
      const updatedProvider = await window.electronAPI.saveProvider(provider)
      if (updatedProvider) {
        updateProvider(updatedProvider)
        return updatedProvider
      }
      throw new Error('Failed to update provider')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update provider'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteProviderById = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const success = await window.electronAPI.deleteProvider(id)
      if (success) {
        removeProvider(id)
        return true
      }
      throw new Error('Failed to delete provider')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete provider'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const searchProviders = async (query: string) => {
    try {
      setLoading(true)
      setError(null)
      const results = await window.electronAPI.searchProviders(query)
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search providers'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const importProviders = async (providersData: Provider[]) => {
    try {
      setLoading(true)
      setError(null)
      const result = await window.electronAPI.importProviders(providersData)
      
      // Reload providers to get the updated list
      await loadProviders()
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import providers'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const duplicateProvider = async (originalProvider: Provider) => {
    try {
      // Create a copy without the ID and with modified name
      const providerCopy = {
        ...originalProvider,
        firstName: `${originalProvider.firstName} (Copy)`,
        npi: '', // Clear unique fields
        email: '',
        licenseNumber: '',
        ssn: '',
        taxId: ''
      }
      
      // Remove fields that should not be copied
      delete (providerCopy as any).id
      delete (providerCopy as any).createdAt
      delete (providerCopy as any).updatedAt
      
      return await createProvider(providerCopy)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate provider'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return {
    providers,
    isLoading,
    error,
    loadProviders,
    createProvider,
    editProvider,
    deleteProvider: deleteProviderById,
    searchProviders,
    importProviders,
    duplicateProvider
  }
}