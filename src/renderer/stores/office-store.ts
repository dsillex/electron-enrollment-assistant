import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { OfficeLocation } from '@shared/types'

interface OfficeState {
  offices: OfficeLocation[]
  selectedOffices: Set<string>
  searchQuery: string
  isLoading: boolean
  error: string | null
  
  // Actions
  setOffices: (offices: OfficeLocation[]) => void
  addOffice: (office: OfficeLocation) => void
  updateOffice: (office: OfficeLocation) => void
  removeOffice: (id: string) => void
  selectOffice: (id: string) => void
  deselectOffice: (id: string) => void
  selectAllOffices: () => void
  deselectAllOffices: () => void
  setSelectedOffices: (ids: Set<string>) => void
  setSearchQuery: (query: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Computed
  getSelectedOfficeIds: () => string[]
  getSelectedOffices: () => OfficeLocation[]
  getFilteredOffices: () => OfficeLocation[]
  getOfficesByProvider: (providerId: string) => OfficeLocation[]
}

export const useOfficeStore = create<OfficeState>()(
  devtools(
    (set, get) => ({
      offices: [],
      selectedOffices: new Set(),
      searchQuery: '',
      isLoading: false,
      error: null,

      setOffices: (offices) => set({ offices }),
      
      addOffice: (office) => set((state) => ({
        offices: [...state.offices, office]
      })),
      
      updateOffice: (updatedOffice) => set((state) => ({
        offices: state.offices.map(office =>
          office.id === updatedOffice.id ? updatedOffice : office
        )
      })),
      
      removeOffice: (id) => set((state) => {
        const newSelectedOffices = new Set(state.selectedOffices)
        newSelectedOffices.delete(id)
        return {
          offices: state.offices.filter(office => office.id !== id),
          selectedOffices: newSelectedOffices
        }
      }),
      
      selectOffice: (id) => set((state) => {
        const newSelected = new Set(state.selectedOffices)
        newSelected.add(id)
        return { selectedOffices: newSelected }
      }),
      
      deselectOffice: (id) => set((state) => {
        const newSelected = new Set(state.selectedOffices)
        newSelected.delete(id)
        return { selectedOffices: newSelected }
      }),
      
      selectAllOffices: () => set((state) => ({
        selectedOffices: new Set(
          state.getFilteredOffices().map(office => office.id)
        )
      })),
      
      deselectAllOffices: () => set({ selectedOffices: new Set() }),
      
      setSelectedOffices: (ids) => set({ selectedOffices: ids }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      getSelectedOfficeIds: () => Array.from(get().selectedOffices),
      
      getSelectedOffices: () => {
        const state = get()
        return state.offices.filter(office => 
          state.selectedOffices.has(office.id)
        )
      },
      
      getFilteredOffices: () => {
        const { offices, searchQuery } = get()
        if (!searchQuery.trim()) return offices
        
        const query = searchQuery.toLowerCase()
        return offices.filter(office =>
          office.locationName.toLowerCase().includes(query) ||
          office.addressLine1.toLowerCase().includes(query) ||
          office.city.toLowerCase().includes(query) ||
          office.state.toLowerCase().includes(query) ||
          office.zipCode.includes(query)
        )
      },
      
      getOfficesByProvider: (providerId: string) => {
        const { offices } = get()
        return offices.filter(office => 
          office.providerIds.includes(providerId)
        )
      }
    }),
    { name: 'office-store' }
  )
)