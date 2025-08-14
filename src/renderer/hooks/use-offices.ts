import { useEffect } from 'react'
import { OfficeLocation } from '@shared/types'
import { useOfficeStore } from '@renderer/stores/office-store'

export function useOffices() {
  const {
    offices,
    isLoading,
    error,
    setOffices,
    addOffice,
    updateOffice,
    removeOffice,
    setLoading,
    setError
  } = useOfficeStore()

  // Load offices on mount
  useEffect(() => {
    loadOffices()
  }, [])

  const loadOffices = async () => {
    try {
      setLoading(true)
      setError(null)
      const officesData = await window.electronAPI.getOffices()
      setOffices(officesData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load offices'
      setError(errorMessage)
      console.error('Failed to load offices:', err)
    } finally {
      setLoading(false)
    }
  }

  const createOffice = async (officeData: Omit<OfficeLocation, 'id'>): Promise<OfficeLocation> => {
    try {
      setLoading(true)
      setError(null)
      console.log('=== useOffices createOffice Called ===')
      console.log('Office data:', JSON.stringify(officeData, null, 2))
      
      const newOffice = await window.electronAPI.saveOffice(officeData)
      console.log('Received new office from API:', JSON.stringify(newOffice, null, 2))
      
      addOffice(newOffice)
      console.log('=== useOffices createOffice Completed Successfully ===')
      return newOffice
    } catch (err) {
      console.error('=== useOffices createOffice Failed ===')
      console.error('Error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create office'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const editOffice = async (office: OfficeLocation): Promise<OfficeLocation> => {
    try {
      setLoading(true)
      setError(null)
      console.log('=== useOffices editOffice Called ===')
      console.log('Office data:', JSON.stringify(office, null, 2))
      
      const updatedOffice = await window.electronAPI.saveOffice(office)
      if (updatedOffice) {
        updateOffice(updatedOffice)
        console.log('=== useOffices editOffice Completed Successfully ===')
        return updatedOffice
      }
      throw new Error('Failed to update office')
    } catch (err) {
      console.error('=== useOffices editOffice Failed ===')
      console.error('Error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update office'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteOfficeById = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const success = await window.electronAPI.deleteOffice(id)
      if (success) {
        removeOffice(id)
        return true
      }
      throw new Error('Failed to delete office')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete office'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const searchOffices = async (query: string) => {
    try {
      setLoading(true)
      setError(null)
      const results = await window.electronAPI.searchOffices(query)
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search offices'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const importOffices = async (officesData: OfficeLocation[]) => {
    try {
      setLoading(true)
      setError(null)
      const result = await window.electronAPI.importOffices(officesData)
      
      // Reload offices to get the updated list
      await loadOffices()
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import offices'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const duplicateOffice = async (originalOffice: OfficeLocation) => {
    try {
      // Create a copy without the ID and with modified name
      const officeCopy = {
        ...originalOffice,
        locationName: `${originalOffice.locationName} (Copy)`,
        providerIds: [] // Clear provider associations
      }
      
      // Remove fields that should not be copied
      delete (officeCopy as any).id
      
      return await createOffice(officeCopy)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate office'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return {
    offices,
    isLoading,
    error,
    loadOffices,
    createOffice,
    editOffice,
    deleteOffice: deleteOfficeById,
    searchOffices,
    importOffices,
    duplicateOffice
  }
}