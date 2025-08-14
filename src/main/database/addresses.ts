import * as fs from 'fs-extra'
import * as path from 'node:path'
import { randomUUID } from 'node:crypto'
import { app } from 'electron'
import { MailingAddress } from '@shared/types'

const getDataPath = () => {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'data')
}

const getAddressesFilePath = () => {
  return path.join(getDataPath(), 'mailing-addresses.json')
}

export class AddressDatabase {
  private addresses: MailingAddress[] = []
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      await fs.ensureDir(getDataPath())
      const addressesFile = getAddressesFilePath()
      
      if (await fs.pathExists(addressesFile)) {
        const data = await fs.readJson(addressesFile)
        this.addresses = Array.isArray(data) ? data : []
      } else {
        this.addresses = []
        await this.saveToFile()
      }
      
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize address database:', error)
      this.addresses = []
      this.initialized = true
    }
  }

  private async saveToFile(): Promise<void> {
    try {
      await fs.writeJson(getAddressesFilePath(), this.addresses, { spaces: 2 })
    } catch (error) {
      console.error('Failed to save addresses to file:', error)
      throw new Error('Failed to save address data')
    }
  }

  async getAll(): Promise<MailingAddress[]> {
    await this.initialize()
    return [...this.addresses]
  }

  async getById(id: string): Promise<MailingAddress | null> {
    await this.initialize()
    return this.addresses.find(address => address.id === id) || null
  }

  async create(addressData: Omit<MailingAddress, 'id'>): Promise<MailingAddress> {
    await this.initialize()
    
    const address: MailingAddress = {
      ...addressData,
      id: randomUUID()
    }

    // If this is being set as primary, unset any existing primary addresses
    if (address.isPrimary) {
      await this.unsetAllPrimary()
    }

    this.addresses.push(address)
    await this.saveToFile()
    
    return address
  }

  async update(id: string, updates: Partial<Omit<MailingAddress, 'id'>>): Promise<MailingAddress | null> {
    await this.initialize()
    
    const index = this.addresses.findIndex(address => address.id === id)
    if (index === -1) return null

    // If setting as primary, unset other primary addresses
    if (updates.isPrimary === true) {
      await this.unsetAllPrimary()
    }

    const updatedAddress: MailingAddress = {
      ...this.addresses[index],
      ...updates,
      id // Ensure ID cannot be changed
    }

    this.addresses[index] = updatedAddress
    await this.saveToFile()
    
    return updatedAddress
  }

  async delete(id: string): Promise<boolean> {
    await this.initialize()
    
    const index = this.addresses.findIndex(address => address.id === id)
    if (index === -1) return false

    this.addresses.splice(index, 1)
    await this.saveToFile()
    
    return true
  }

  private async unsetAllPrimary(): Promise<void> {
    this.addresses.forEach(address => {
      address.isPrimary = false
    })
  }

  async setPrimary(id: string): Promise<boolean> {
    await this.initialize()
    
    const address = this.addresses.find(a => a.id === id)
    if (!address) return false

    // Unset all other primary addresses
    await this.unsetAllPrimary()
    
    // Set this one as primary
    address.isPrimary = true
    await this.saveToFile()
    
    return true
  }

  async getPrimary(): Promise<MailingAddress | null> {
    await this.initialize()
    
    return this.addresses.find(address => address.isPrimary) || null
  }

  async getByProvider(providerId: string): Promise<MailingAddress[]> {
    await this.initialize()
    
    return this.addresses.filter(address => 
      address.providerIds?.includes(providerId)
    )
  }

  async getByOffice(officeId: string): Promise<MailingAddress[]> {
    await this.initialize()
    
    return this.addresses.filter(address => 
      address.officeIds?.includes(officeId)
    )
  }

  async addProviderToAddress(addressId: string, providerId: string): Promise<boolean> {
    await this.initialize()
    
    const address = this.addresses.find(a => a.id === addressId)
    if (!address) return false

    if (!address.providerIds) address.providerIds = []
    if (!address.providerIds.includes(providerId)) {
      address.providerIds.push(providerId)
      await this.saveToFile()
    }
    
    return true
  }

  async removeProviderFromAddress(addressId: string, providerId: string): Promise<boolean> {
    await this.initialize()
    
    const address = this.addresses.find(a => a.id === addressId)
    if (!address || !address.providerIds) return false

    const index = address.providerIds.indexOf(providerId)
    if (index > -1) {
      address.providerIds.splice(index, 1)
      await this.saveToFile()
    }
    
    return true
  }

  async search(query: string): Promise<MailingAddress[]> {
    await this.initialize()
    
    if (!query.trim()) return this.getAll()
    
    const searchTerm = query.toLowerCase()
    return this.addresses.filter(address => 
      address.addressName.toLowerCase().includes(searchTerm) ||
      address.addressLine1.toLowerCase().includes(searchTerm) ||
      address.city.toLowerCase().includes(searchTerm) ||
      address.state.toLowerCase().includes(searchTerm) ||
      address.zipCode.includes(searchTerm) ||
      address.attentionTo?.toLowerCase().includes(searchTerm)
    )
  }

  async getActive(): Promise<MailingAddress[]> {
    await this.initialize()
    
    return this.addresses.filter(address => address.isActive)
  }

  async getByType(addressType: MailingAddress['addressType']): Promise<MailingAddress[]> {
    await this.initialize()
    
    return this.addresses.filter(address => address.addressType === addressType)
  }

  async backup(backupPath: string): Promise<void> {
    await this.initialize()
    
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      addresses: this.addresses
    }
    
    await fs.writeJson(backupPath, backupData, { spaces: 2 })
  }

  async restore(backupPath: string): Promise<void> {
    try {
      const backupData = await fs.readJson(backupPath)
      
      if (Array.isArray(backupData.addresses)) {
        this.addresses = backupData.addresses
      } else if (Array.isArray(backupData)) {
        this.addresses = backupData
      } else {
        throw new Error('Invalid backup file format')
      }
      
      await this.saveToFile()
      this.initialized = true
    } catch (error) {
      console.error('Failed to restore from backup:', error)
      throw new Error('Failed to restore address data from backup')
    }
  }

  async import(addresses: MailingAddress[]): Promise<{ imported: number; errors: string[] }> {
    await this.initialize()
    
    const errors: string[] = []
    let imported = 0
    
    for (const address of addresses) {
      try {
        const newAddress: MailingAddress = {
          ...address,
          id: address.id || randomUUID()
        }
        
        this.addresses.push(newAddress)
        imported++
      } catch (error) {
        errors.push(`Failed to import address: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    if (imported > 0) {
      await this.saveToFile()
    }
    
    return { imported, errors }
  }
}

export const addressDb = new AddressDatabase()