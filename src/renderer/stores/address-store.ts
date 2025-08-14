import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { MailingAddress } from '@shared/types'

interface AddressState {
  addresses: MailingAddress[]
  selectedAddresses: Set<string>
  searchQuery: string
  isLoading: boolean
  error: string | null
  
  // Actions
  setAddresses: (addresses: MailingAddress[]) => void
  addAddress: (address: MailingAddress) => void
  updateAddress: (address: MailingAddress) => void
  removeAddress: (id: string) => void
  selectAddress: (id: string) => void
  deselectAddress: (id: string) => void
  selectAllAddresses: () => void
  deselectAllAddresses: () => void
  setSelectedAddresses: (ids: Set<string>) => void
  setSearchQuery: (query: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Computed
  getSelectedAddressIds: () => string[]
  getSelectedAddresses: () => MailingAddress[]
  getFilteredAddresses: () => MailingAddress[]
  getAddressesByProvider: (providerId: string) => MailingAddress[]
  getPrimaryAddress: () => MailingAddress | null
}

export const useAddressStore = create<AddressState>()(
  devtools(
    (set, get) => ({
      addresses: [],
      selectedAddresses: new Set(),
      searchQuery: '',
      isLoading: false,
      error: null,

      setAddresses: (addresses) => set({ addresses }),
      
      addAddress: (address) => set((state) => ({
        addresses: [...state.addresses, address]
      })),
      
      updateAddress: (updatedAddress) => set((state) => ({
        addresses: state.addresses.map(address =>
          address.id === updatedAddress.id ? updatedAddress : address
        )
      })),
      
      removeAddress: (id) => set((state) => {
        const newSelectedAddresses = new Set(state.selectedAddresses)
        newSelectedAddresses.delete(id)
        return {
          addresses: state.addresses.filter(address => address.id !== id),
          selectedAddresses: newSelectedAddresses
        }
      }),
      
      selectAddress: (id) => set((state) => {
        const newSelected = new Set(state.selectedAddresses)
        newSelected.add(id)
        return { selectedAddresses: newSelected }
      }),
      
      deselectAddress: (id) => set((state) => {
        const newSelected = new Set(state.selectedAddresses)
        newSelected.delete(id)
        return { selectedAddresses: newSelected }
      }),
      
      selectAllAddresses: () => set((state) => ({
        selectedAddresses: new Set(
          state.getFilteredAddresses().map(address => address.id)
        )
      })),
      
      deselectAllAddresses: () => set({ selectedAddresses: new Set() }),
      
      setSelectedAddresses: (ids) => set({ selectedAddresses: ids }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      getSelectedAddressIds: () => Array.from(get().selectedAddresses),
      
      getSelectedAddresses: () => {
        const state = get()
        return state.addresses.filter(address => 
          state.selectedAddresses.has(address.id)
        )
      },
      
      getFilteredAddresses: () => {
        const { addresses, searchQuery } = get()
        if (!searchQuery.trim()) return addresses
        
        const query = searchQuery.toLowerCase()
        return addresses.filter(address =>
          address.addressName.toLowerCase().includes(query) ||
          address.addressLine1.toLowerCase().includes(query) ||
          address.city.toLowerCase().includes(query) ||
          address.state.toLowerCase().includes(query) ||
          address.zipCode.includes(query) ||
          address.attentionTo?.toLowerCase().includes(query)
        )
      },
      
      getAddressesByProvider: (providerId: string) => {
        const { addresses } = get()
        return addresses.filter(address => 
          address.providerIds?.includes(providerId)
        )
      },
      
      getPrimaryAddress: () => {
        const { addresses } = get()
        return addresses.find(address => address.isPrimary) || null
      }
    }),
    { name: 'address-store' }
  )
)