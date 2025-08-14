import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Provider } from '@shared/types'

interface ProviderState {
  providers: Provider[]
  selectedProviders: Set<string>
  searchQuery: string
  isLoading: boolean
  error: string | null
  
  // Actions
  setProviders: (providers: Provider[]) => void
  addProvider: (provider: Provider) => void
  updateProvider: (provider: Provider) => void
  removeProvider: (id: string) => void
  selectProvider: (id: string) => void
  deselectProvider: (id: string) => void
  selectAllProviders: () => void
  deselectAllProviders: () => void
  setSelectedProviders: (ids: Set<string>) => void
  setSearchQuery: (query: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Computed
  getSelectedProviderIds: () => string[]
  getSelectedProviders: () => Provider[]
  getFilteredProviders: () => Provider[]
}

export const useProviderStore = create<ProviderState>()(
  devtools(
    (set, get) => ({
      providers: [],
      selectedProviders: new Set(),
      searchQuery: '',
      isLoading: false,
      error: null,

      setProviders: (providers) => set({ providers }),
      
      addProvider: (provider) => set((state) => ({
        providers: [...state.providers, provider]
      })),
      
      updateProvider: (updatedProvider) => set((state) => ({
        providers: state.providers.map(provider =>
          provider.id === updatedProvider.id ? updatedProvider : provider
        )
      })),
      
      removeProvider: (id) => set((state) => {
        const newSelectedProviders = new Set(state.selectedProviders)
        newSelectedProviders.delete(id)
        return {
          providers: state.providers.filter(provider => provider.id !== id),
          selectedProviders: newSelectedProviders
        }
      }),
      
      selectProvider: (id) => set((state) => {
        const newSelected = new Set(state.selectedProviders)
        newSelected.add(id)
        return { selectedProviders: newSelected }
      }),
      
      deselectProvider: (id) => set((state) => {
        const newSelected = new Set(state.selectedProviders)
        newSelected.delete(id)
        return { selectedProviders: newSelected }
      }),
      
      selectAllProviders: () => set((state) => ({
        selectedProviders: new Set(
          state.getFilteredProviders().map(provider => provider.id)
        )
      })),
      
      deselectAllProviders: () => set({ selectedProviders: new Set() }),
      
      setSelectedProviders: (ids) => set({ selectedProviders: ids }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      getSelectedProviderIds: () => Array.from(get().selectedProviders),
      
      getSelectedProviders: () => {
        const state = get()
        return state.providers.filter(provider => 
          state.selectedProviders.has(provider.id)
        )
      },
      
      getFilteredProviders: () => {
        const { providers, searchQuery } = get()
        if (!searchQuery.trim()) return providers
        
        const query = searchQuery.toLowerCase()
        return providers.filter(provider =>
          provider.firstName.toLowerCase().includes(query) ||
          provider.lastName.toLowerCase().includes(query) ||
          provider.npi.includes(query) ||
          provider.email.toLowerCase().includes(query) ||
          provider.specialties.some(specialty => 
            specialty.toLowerCase().includes(query)
          )
        )
      }
    }),
    { name: 'provider-store' }
  )
)