import * as fs from 'fs-extra'
import * as path from 'node:path'
import { randomUUID } from 'node:crypto'
import { app } from 'electron'
import { OfficeLocation } from '@shared/types'

const getDataPath = () => {
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'data')
}

const getOfficesFilePath = () => {
  return path.join(getDataPath(), 'offices.json')
}

export class OfficeDatabase {
  private offices: OfficeLocation[] = []
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      await fs.ensureDir(getDataPath())
      const officesFile = getOfficesFilePath()
      
      if (await fs.pathExists(officesFile)) {
        const data = await fs.readJson(officesFile)
        this.offices = Array.isArray(data) ? data : []
      } else {
        this.offices = []
        await this.saveToFile()
      }
      
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize office database:', error)
      this.offices = []
      this.initialized = true
    }
  }

  private async saveToFile(): Promise<void> {
    try {
      await fs.writeJson(getOfficesFilePath(), this.offices, { spaces: 2 })
    } catch (error) {
      console.error('Failed to save offices to file:', error)
      throw new Error('Failed to save office data')
    }
  }

  async getAll(): Promise<OfficeLocation[]> {
    await this.initialize()
    return [...this.offices]
  }

  async getById(id: string): Promise<OfficeLocation | null> {
    await this.initialize()
    return this.offices.find(office => office.id === id) || null
  }

  async create(officeData: Omit<OfficeLocation, 'id'>): Promise<OfficeLocation> {
    await this.initialize()
    
    const office: OfficeLocation = {
      ...officeData,
      id: randomUUID()
    }

    this.offices.push(office)
    await this.saveToFile()
    
    return office
  }

  async update(id: string, updates: Partial<Omit<OfficeLocation, 'id'>>): Promise<OfficeLocation | null> {
    await this.initialize()
    
    const index = this.offices.findIndex(office => office.id === id)
    if (index === -1) return null

    const updatedOffice: OfficeLocation = {
      ...this.offices[index],
      ...updates,
      id // Ensure ID cannot be changed
    }

    this.offices[index] = updatedOffice
    await this.saveToFile()
    
    return updatedOffice
  }

  async delete(id: string): Promise<boolean> {
    await this.initialize()
    
    const index = this.offices.findIndex(office => office.id === id)
    if (index === -1) return false

    this.offices.splice(index, 1)
    await this.saveToFile()
    
    return true
  }

  async getByProvider(providerId: string): Promise<OfficeLocation[]> {
    await this.initialize()
    
    return this.offices.filter(office => 
      office.providerIds.includes(providerId)
    )
  }

  async addProviderToOffice(officeId: string, providerId: string): Promise<boolean> {
    await this.initialize()
    
    const office = this.offices.find(o => o.id === officeId)
    if (!office) return false

    if (!office.providerIds.includes(providerId)) {
      office.providerIds.push(providerId)
      await this.saveToFile()
    }
    
    return true
  }

  async removeProviderFromOffice(officeId: string, providerId: string): Promise<boolean> {
    await this.initialize()
    
    const office = this.offices.find(o => o.id === officeId)
    if (!office) return false

    const index = office.providerIds.indexOf(providerId)
    if (index > -1) {
      office.providerIds.splice(index, 1)
      await this.saveToFile()
    }
    
    return true
  }

  async search(query: string): Promise<OfficeLocation[]> {
    await this.initialize()
    
    if (!query.trim()) return this.getAll()
    
    const searchTerm = query.toLowerCase()
    return this.offices.filter(office => 
      office.locationName.toLowerCase().includes(searchTerm) ||
      office.addressLine1.toLowerCase().includes(searchTerm) ||
      office.city.toLowerCase().includes(searchTerm) ||
      office.state.toLowerCase().includes(searchTerm) ||
      office.zipCode.includes(searchTerm)
    )
  }

  async getActive(): Promise<OfficeLocation[]> {
    await this.initialize()
    
    return this.offices.filter(office => office.isActive)
  }

  async getByType(locationType: OfficeLocation['locationType']): Promise<OfficeLocation[]> {
    await this.initialize()
    
    return this.offices.filter(office => office.locationType === locationType)
  }

  async backup(backupPath: string): Promise<void> {
    await this.initialize()
    
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      offices: this.offices
    }
    
    await fs.writeJson(backupPath, backupData, { spaces: 2 })
  }

  async restore(backupPath: string): Promise<void> {
    try {
      const backupData = await fs.readJson(backupPath)
      
      if (Array.isArray(backupData.offices)) {
        this.offices = backupData.offices
      } else if (Array.isArray(backupData)) {
        this.offices = backupData
      } else {
        throw new Error('Invalid backup file format')
      }
      
      await this.saveToFile()
      this.initialized = true
    } catch (error) {
      console.error('Failed to restore from backup:', error)
      throw new Error('Failed to restore office data from backup')
    }
  }

  async import(offices: OfficeLocation[]): Promise<{ imported: number; errors: string[] }> {
    await this.initialize()
    
    const errors: string[] = []
    let imported = 0
    
    for (const office of offices) {
      try {
        const newOffice: OfficeLocation = {
          ...office,
          id: office.id || randomUUID()
        }
        
        this.offices.push(newOffice)
        imported++
      } catch (error) {
        errors.push(`Failed to import office: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    if (imported > 0) {
      await this.saveToFile()
    }
    
    return { imported, errors }
  }
}

export const officeDb = new OfficeDatabase()