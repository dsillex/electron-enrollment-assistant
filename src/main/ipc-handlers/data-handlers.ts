import { ipcMain } from 'electron'
import { providerDb } from '../database/providers'
import { officeDb } from '../database/offices'
import { addressDb } from '../database/addresses'
import { Provider, OfficeLocation, MailingAddress } from '@shared/types'

// Provider Handlers
export function registerProviderHandlers() {
  ipcMain.handle('data:getProviders', async () => {
    try {
      return await providerDb.getAll()
    } catch (error) {
      console.error('Failed to get providers:', error)
      throw new Error('Failed to retrieve provider data')
    }
  })

  ipcMain.handle('data:getProvider', async (_, id: string) => {
    try {
      return await providerDb.getById(id)
    } catch (error) {
      console.error('Failed to get provider:', error)
      throw new Error('Failed to retrieve provider')
    }
  })

  ipcMain.handle('data:saveProvider', async (_, providerData: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'> | Provider) => {
    try {
      console.log('Received provider data in IPC handler:', JSON.stringify(providerData, null, 2))
      
      if ('id' in providerData && providerData.id) {
        // Update existing provider
        const { id, createdAt, ...updates } = providerData
        console.log('Updating existing provider with ID:', id)
        const result = await providerDb.update(id, updates)
        console.log('Provider updated successfully:', result)
        return result
      } else {
        // Create new provider
        console.log('Creating new provider')
        const result = await providerDb.create(providerData as Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>)
        console.log('Provider created successfully:', result)
        return result
      }
    } catch (error) {
      console.error('Failed to save provider:', error)
      throw new Error(`Failed to save provider data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  })

  ipcMain.handle('data:deleteProvider', async (_, id: string) => {
    try {
      return await providerDb.delete(id)
    } catch (error) {
      console.error('Failed to delete provider:', error)
      throw new Error('Failed to delete provider')
    }
  })

  ipcMain.handle('data:searchProviders', async (_, query: string) => {
    try {
      return await providerDb.search(query)
    } catch (error) {
      console.error('Failed to search providers:', error)
      throw new Error('Failed to search providers')
    }
  })

  ipcMain.handle('data:getActiveProviders', async () => {
    try {
      return await providerDb.getActive()
    } catch (error) {
      console.error('Failed to get active providers:', error)
      throw new Error('Failed to retrieve active providers')
    }
  })

  ipcMain.handle('data:importProviders', async (_, providers: Provider[]) => {
    try {
      return await providerDb.import(providers)
    } catch (error) {
      console.error('Failed to import providers:', error)
      throw new Error('Failed to import provider data')
    }
  })
}

// Office Handlers
export function registerOfficeHandlers() {
  ipcMain.handle('data:getOffices', async () => {
    try {
      return await officeDb.getAll()
    } catch (error) {
      console.error('Failed to get offices:', error)
      throw new Error('Failed to retrieve office data')
    }
  })

  ipcMain.handle('data:getOffice', async (_, id: string) => {
    try {
      return await officeDb.getById(id)
    } catch (error) {
      console.error('Failed to get office:', error)
      throw new Error('Failed to retrieve office')
    }
  })

  ipcMain.handle('data:saveOffice', async (_, officeData: Omit<OfficeLocation, 'id'> | OfficeLocation) => {
    try {
      if ('id' in officeData && officeData.id) {
        // Update existing office
        const { id, ...updates } = officeData
        return await officeDb.update(id, updates)
      } else {
        // Create new office
        return await officeDb.create(officeData as Omit<OfficeLocation, 'id'>)
      }
    } catch (error) {
      console.error('Failed to save office:', error)
      throw new Error('Failed to save office data')
    }
  })

  ipcMain.handle('data:deleteOffice', async (_, id: string) => {
    try {
      return await officeDb.delete(id)
    } catch (error) {
      console.error('Failed to delete office:', error)
      throw new Error('Failed to delete office')
    }
  })

  ipcMain.handle('data:getOfficesByProvider', async (_, providerId: string) => {
    try {
      return await officeDb.getByProvider(providerId)
    } catch (error) {
      console.error('Failed to get offices by provider:', error)
      throw new Error('Failed to retrieve provider offices')
    }
  })

  ipcMain.handle('data:addProviderToOffice', async (_, officeId: string, providerId: string) => {
    try {
      return await officeDb.addProviderToOffice(officeId, providerId)
    } catch (error) {
      console.error('Failed to add provider to office:', error)
      throw new Error('Failed to link provider to office')
    }
  })

  ipcMain.handle('data:removeProviderFromOffice', async (_, officeId: string, providerId: string) => {
    try {
      return await officeDb.removeProviderFromOffice(officeId, providerId)
    } catch (error) {
      console.error('Failed to remove provider from office:', error)
      throw new Error('Failed to unlink provider from office')
    }
  })

  ipcMain.handle('data:searchOffices', async (_, query: string) => {
    try {
      return await officeDb.search(query)
    } catch (error) {
      console.error('Failed to search offices:', error)
      throw new Error('Failed to search offices')
    }
  })

  ipcMain.handle('data:getActiveOffices', async () => {
    try {
      return await officeDb.getActive()
    } catch (error) {
      console.error('Failed to get active offices:', error)
      throw new Error('Failed to retrieve active offices')
    }
  })

  ipcMain.handle('data:importOffices', async (_, offices: OfficeLocation[]) => {
    try {
      return await officeDb.import(offices)
    } catch (error) {
      console.error('Failed to import offices:', error)
      throw new Error('Failed to import office data')
    }
  })
}

// Address Handlers
export function registerAddressHandlers() {
  ipcMain.handle('data:getAddresses', async () => {
    try {
      return await addressDb.getAll()
    } catch (error) {
      console.error('Failed to get addresses:', error)
      throw new Error('Failed to retrieve address data')
    }
  })

  ipcMain.handle('data:getAddress', async (_, id: string) => {
    try {
      return await addressDb.getById(id)
    } catch (error) {
      console.error('Failed to get address:', error)
      throw new Error('Failed to retrieve address')
    }
  })

  ipcMain.handle('data:saveAddress', async (_, addressData: Omit<MailingAddress, 'id'> | MailingAddress) => {
    try {
      if ('id' in addressData && addressData.id) {
        // Update existing address
        const { id, ...updates } = addressData
        return await addressDb.update(id, updates)
      } else {
        // Create new address
        return await addressDb.create(addressData as Omit<MailingAddress, 'id'>)
      }
    } catch (error) {
      console.error('Failed to save address:', error)
      throw new Error('Failed to save address data')
    }
  })

  ipcMain.handle('data:deleteAddress', async (_, id: string) => {
    try {
      return await addressDb.delete(id)
    } catch (error) {
      console.error('Failed to delete address:', error)
      throw new Error('Failed to delete address')
    }
  })

  ipcMain.handle('data:setPrimaryAddress', async (_, id: string) => {
    try {
      return await addressDb.setPrimary(id)
    } catch (error) {
      console.error('Failed to set primary address:', error)
      throw new Error('Failed to set primary address')
    }
  })

  ipcMain.handle('data:getPrimaryAddress', async () => {
    try {
      return await addressDb.getPrimary()
    } catch (error) {
      console.error('Failed to get primary address:', error)
      throw new Error('Failed to retrieve primary address')
    }
  })

  ipcMain.handle('data:getAddressesByProvider', async (_, providerId: string) => {
    try {
      return await addressDb.getByProvider(providerId)
    } catch (error) {
      console.error('Failed to get addresses by provider:', error)
      throw new Error('Failed to retrieve provider addresses')
    }
  })

  ipcMain.handle('data:addProviderToAddress', async (_, addressId: string, providerId: string) => {
    try {
      return await addressDb.addProviderToAddress(addressId, providerId)
    } catch (error) {
      console.error('Failed to add provider to address:', error)
      throw new Error('Failed to link provider to address')
    }
  })

  ipcMain.handle('data:removeProviderFromAddress', async (_, addressId: string, providerId: string) => {
    try {
      return await addressDb.removeProviderFromAddress(addressId, providerId)
    } catch (error) {
      console.error('Failed to remove provider from address:', error)
      throw new Error('Failed to unlink provider from address')
    }
  })

  ipcMain.handle('data:searchAddresses', async (_, query: string) => {
    try {
      return await addressDb.search(query)
    } catch (error) {
      console.error('Failed to search addresses:', error)
      throw new Error('Failed to search addresses')
    }
  })

  ipcMain.handle('data:getActiveAddresses', async () => {
    try {
      return await addressDb.getActive()
    } catch (error) {
      console.error('Failed to get active addresses:', error)
      throw new Error('Failed to retrieve active addresses')
    }
  })

  ipcMain.handle('data:importAddresses', async (_, addresses: MailingAddress[]) => {
    try {
      return await addressDb.import(addresses)
    } catch (error) {
      console.error('Failed to import addresses:', error)
      throw new Error('Failed to import address data')
    }
  })
}

// Register all data handlers
export function registerDataHandlers() {
  registerProviderHandlers()
  registerOfficeHandlers()
  registerAddressHandlers()
}