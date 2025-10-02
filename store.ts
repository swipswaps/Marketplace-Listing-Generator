import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { HistoryItem, ApiKeys } from './types';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'platform-asc' | 'platform-desc';

interface AppState {
  history: HistoryItem[];
  savedListings: HistoryItem[];
  apiKeys: ApiKeys;
  activeHistoryId: number | null;
  activeSavedId: number | null;
  activeTab: 'history' | 'saved';
  searchQuery: string;
  sortOption: SortOption;
  isSettingsModalOpen: boolean;
  isSaveModalOpen: boolean;
  isEditModalOpen: boolean;
  isExportModalOpen: boolean;
  itemToEdit: HistoryItem | null;
  itemToExport: HistoryItem | null;

  setApiKeys: (keys: ApiKeys) => void;
  addHistoryItem: (item: HistoryItem) => void;
  deleteHistoryItem: (itemId: number) => void;
  addSavedListing: (item: HistoryItem) => void;
  updateSavedListing: (updatedItem: HistoryItem) => void;
  deleteSavedListing: (itemId: number) => void;
  setActiveHistoryId: (id: number | null) => void;
  setActiveSavedId: (id: number | null) => void;
  setActiveTab: (tab: 'history' | 'saved') => void;
  setSearchQuery: (query: string) => void;
  setSortOption: (option: SortOption) => void;
  openSettingsModal: () => void;
  openSaveModal: () => void;
  openEditModal: (item: HistoryItem) => void;
  openExportModal: (item: HistoryItem) => void;
  closeAllModals: () => void;
}

const ZUSTAND_STORAGE_KEY = 'marketplace-app-storage';

// A one-time script to migrate from the old localStorage format to the new Zustand format.
const runMigration = () => {
  // 1. If the new key already exists, migration is complete or not needed.
  if (localStorage.getItem(ZUSTAND_STORAGE_KEY)) {
    return;
  }

  // 2. Check for the existence of old keys.
  const oldHistoryStr = localStorage.getItem('marketplaceListingHistory');
  const oldSavedStr = localStorage.getItem('marketplaceSavedListings');
  const oldKeysStr = localStorage.getItem('marketplaceApiKeys');

  if (!oldHistoryStr && !oldSavedStr && !oldKeysStr) {
    return; // No old data to migrate.
  }

  console.log("Old storage format detected. Migrating to Zustand...");

  try {
    const history = JSON.parse(oldHistoryStr || '[]');
    const savedListings = JSON.parse(oldSavedStr || '[]');
    const oldKeys = JSON.parse(oldKeysStr || '{}');

    // 3. Construct the new state shape that Zustand's persist middleware expects.
    const newPersistedState = {
      state: {
        history,
        savedListings,
        apiKeys: {
          gemini: oldKeys.gemini || '',
          openai: oldKeys.openai || '',
          ebay: oldKeys.ebay || '',
          x: oldKeys.x || '',
        },
      },
      version: 0,
    };

    // 4. Save the new state and clean up the old keys.
    localStorage.setItem(ZUSTAND_STORAGE_KEY, JSON.stringify(newPersistedState));
    localStorage.removeItem('marketplaceListingHistory');
    localStorage.removeItem('marketplaceSavedListings');
    localStorage.removeItem('marketplaceApiKeys');
    console.log("Migration successful. Old storage keys have been removed.");
  } catch (error) {
    console.error("Failed to migrate data from old storage:", error);
    // Clean up old keys even if migration fails to avoid repeated attempts.
    localStorage.removeItem('marketplaceListingHistory');
    localStorage.removeItem('marketplaceSavedListings');
    localStorage.removeItem('marketplaceApiKeys');
  }
};

// Run the migration before the store is created.
runMigration();

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // State
      history: [],
      savedListings: [],
      apiKeys: { ebay: '', x: '', gemini: '', openai: '' },
      activeHistoryId: null,
      activeSavedId: null,
      activeTab: 'history',
      searchQuery: '',
      sortOption: 'date-desc',
      isSettingsModalOpen: false,
      isSaveModalOpen: false,
      isEditModalOpen: false,
      isExportModalOpen: false,
      itemToEdit: null,
      itemToExport: null,

      // Actions
      setApiKeys: (keys) => set({ apiKeys: keys }),
      addHistoryItem: (item) => set((state) => ({ history: [item, ...state.history].slice(0, 50) })),
      deleteHistoryItem: (itemId) => set((state) => {
        const newHistory = state.history.filter((item) => item.id !== itemId);
        const newActiveHistoryId = state.activeHistoryId === itemId ? null : state.activeHistoryId;
        return { history: newHistory, activeHistoryId: newActiveHistoryId };
      }),
      addSavedListing: (item) => set((state) => ({ savedListings: [item, ...state.savedListings] })),
      updateSavedListing: (updatedItem) => set((state) => ({
        savedListings: state.savedListings.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      })),
      deleteSavedListing: (itemId) => set((state) => {
        const newSavedListings = state.savedListings.filter((item) => item.id !== itemId);
        const newActiveSavedId = state.activeSavedId === itemId ? null : state.activeSavedId;
        return { savedListings: newSavedListings, activeSavedId: newActiveSavedId };
      }),
      setActiveHistoryId: (id) => set({ activeHistoryId: id, activeSavedId: null }),
      setActiveSavedId: (id) => set({ activeSavedId: id, activeHistoryId: null }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSortOption: (option) => set({ sortOption: option }),
      openSettingsModal: () => set({ isSettingsModalOpen: true }),
      openSaveModal: () => set({ isSaveModalOpen: true }),
      openEditModal: (item) => set({ itemToEdit: item, isEditModalOpen: true }),
      openExportModal: (item) => set({ itemToExport: item, isExportModalOpen: true }),
      closeAllModals: () => set({
        isSettingsModalOpen: false,
        isSaveModalOpen: false,
        isEditModalOpen: false,
        isExportModalOpen: false,
        itemToEdit: null,
        itemToExport: null,
      }),
    }),
    {
      name: ZUSTAND_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        history: state.history,
        savedListings: state.savedListings,
        apiKeys: state.apiKeys,
      }),
    }
  )
);