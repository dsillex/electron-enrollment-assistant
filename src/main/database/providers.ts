import * as fs from 'fs-extra'
import * as path from 'node:path'
import { randomUUID } from 'node:crypto'
import { app } from 'electron'
import { Provider } from '@shared/types'

const getDataPath = () => {
  const userDataPath = app.getPath('userData')
  console.log('🔍 Electron userData path:', userDataPath)
  const dataPath = path.join(userDataPath, 'data')
  console.log('🔍 Final data path:', dataPath)
  return dataPath
}

const getProvidersFilePath = () => {
  return path.join(getDataPath(), 'providers.json')
}

export class ProviderDatabase {
  private providers: Provider[] = []
  private initialized = false

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      const dataPath = getDataPath()
      console.log('🔍 Provider Database - Data path:', dataPath)
      
      await fs.ensureDir(dataPath)
      const providersFile = getProvidersFilePath()
      console.log('🔍 Provider Database - Looking for file at:', providersFile)
      
      if (await fs.pathExists(providersFile)) {
        console.log('✅ Provider Database - File exists, loading data...')
        const data = await fs.readJson(providersFile)
        this.providers = Array.isArray(data) ? data : []
        console.log(`📊 Provider Database - Loaded ${this.providers.length} providers`)
      } else {
        console.log('❌ Provider Database - File not found, creating empty file')
        this.providers = []
        await this.saveToFile()
      }
      
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize provider database:', error)
      this.providers = []
      this.initialized = true
    }
  }

  private async saveToFile(): Promise<void> {
    try {
      await fs.writeJson(getProvidersFilePath(), this.providers, { spaces: 2 })
    } catch (error) {
      console.error('Failed to save providers to file:', error)
      throw new Error('Failed to save provider data')
    }
  }

  async getAll(): Promise<Provider[]> {
    await this.initialize()
    return [...this.providers]
  }

  async getById(id: string): Promise<Provider | null> {
    await this.initialize()
    return this.providers.find(provider => provider.id === id) || null
  }

  async create(providerData: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<Provider> {
    console.log('Provider database create method called with:', JSON.stringify(providerData, null, 2))
    await this.initialize()
    
    const now = new Date().toISOString()
    const provider: Provider = {
      ...providerData,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now
    }

    console.log('Created provider object:', JSON.stringify(provider, null, 2))
    console.log('Current providers count before adding:', this.providers.length)
    
    this.providers.push(provider)
    console.log('Current providers count after adding:', this.providers.length)
    
    await this.saveToFile()
    console.log('Provider saved to file successfully')
    
    return provider
  }

  async update(id: string, updates: Partial<Omit<Provider, 'id' | 'createdAt'>>): Promise<Provider | null> {
    await this.initialize()
    
    const index = this.providers.findIndex(provider => provider.id === id)
    if (index === -1) return null

    const updatedProvider: Provider = {
      ...this.providers[index],
      ...updates,
      id, // Ensure ID cannot be changed
      updatedAt: new Date().toISOString()
    }

    this.providers[index] = updatedProvider
    await this.saveToFile()
    
    return updatedProvider
  }

  async delete(id: string): Promise<boolean> {
    await this.initialize()
    
    const index = this.providers.findIndex(provider => provider.id === id)
    if (index === -1) return false

    this.providers.splice(index, 1)
    await this.saveToFile()
    
    return true
  }

  async search(query: string): Promise<Provider[]> {
    await this.initialize()
    
    if (!query.trim()) return this.getAll()
    
    const searchTerm = query.toLowerCase()
    return this.providers.filter(provider => 
      provider.firstName.toLowerCase().includes(searchTerm) ||
      provider.lastName.toLowerCase().includes(searchTerm) ||
      provider.npi.includes(searchTerm) ||
      provider.email.toLowerCase().includes(searchTerm) ||
      provider.specialties.some(specialty => 
        specialty.toLowerCase().includes(searchTerm)
      )
    )
  }

  async getBySpecialty(specialty: string): Promise<Provider[]> {
    await this.initialize()
    
    return this.providers.filter(provider =>
      provider.specialties.some(s => 
        s.toLowerCase() === specialty.toLowerCase()
      )
    )
  }

  async getActive(): Promise<Provider[]> {
    await this.initialize()
    
    return this.providers.filter(provider => provider.isActive)
  }

  async backup(backupPath: string): Promise<void> {
    await this.initialize()
    
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      providers: this.providers
    }
    
    await fs.writeJson(backupPath, backupData, { spaces: 2 })
  }

  async restore(backupPath: string): Promise<void> {
    try {
      const backupData = await fs.readJson(backupPath)
      
      if (Array.isArray(backupData.providers)) {
        this.providers = backupData.providers
      } else if (Array.isArray(backupData)) {
        // Handle legacy backup format
        this.providers = backupData
      } else {
        throw new Error('Invalid backup file format')
      }
      
      await this.saveToFile()
      this.initialized = true
    } catch (error) {
      console.error('Failed to restore from backup:', error)
      throw new Error('Failed to restore provider data from backup')
    }
  }

  async import(providers: Provider[]): Promise<{ imported: number; errors: string[] }> {
    await this.initialize()
    
    const errors: string[] = []
    let imported = 0
    
    for (const provider of providers) {
      try {
        // Check if provider already exists by NPI
        const existing = this.providers.find(p => p.npi === provider.npi)
        if (existing) {
          errors.push(`Provider with NPI ${provider.npi} already exists`)
          continue
        }
        
        const now = new Date().toISOString()
        const newProvider: Provider = {
          ...provider,
          id: provider.id || randomUUID(),
          createdAt: provider.createdAt || now,
          updatedAt: now
        }
        
        this.providers.push(newProvider)
        imported++
      } catch (error) {
        errors.push(`Failed to import provider: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    if (imported > 0) {
      await this.saveToFile()
    }
    
    return { imported, errors }
  }
}

// Singleton instance
export const providerDb = new ProviderDatabase()