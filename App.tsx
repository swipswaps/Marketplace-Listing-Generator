import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { PlatformSelector } from './components/PlatformSelector';
import { InputArea } from './components/InputArea';
import { ListingPreview } from './components/ListingPreview';
import { HistoryList } from './components/HistoryList';
import { SavedListings } from './components/SavedListings';
import { SettingsModal } from './components/SettingsModal';
import { SaveListingModal } from './components/SaveListingModal';
import { EditListingModal } from './components/EditListingModal';
import { ExportModal } from './components/ExportModal';
import { useStore } from './store';
import { Platform, GeneratedListing, ImageFile, HistoryItem, HistoryListing, PriceHistoryPoint } from './types';
import { generateListing } from './services/geminiService';
import { fetchPriceHistory } from './services/ebayService';

/**
 * Defines the available sorting options for the history and saved lists.
 */
type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'platform-asc' | 'platform-desc';

/**
 * The main application component.
 * It orchestrates the entire UI and manages both local component state
 * for the generation process and interactions with the global Zustand store.
 */
const App: React.FC = () => {
  // =================================================================
  // Local State for the current generation process
  // These states manage the user's immediate inputs and the resulting output.
  // They are considered ephemeral and are reset between generations.
  // =================================================================
  /** The currently selected marketplace platform (e.g., Ebay, Facebook). */
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(Platform.Ebay);
  /** The text content of the user's description input. */
  const [textInput, setTextInput] = useState<string>('');
  /** The user's uploaded or captured image file. */
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  /** The AI-generated listing data from the last successful generation. */
  const [generatedListing, setGeneratedListing] = useState<GeneratedListing | null>(null);
  /** A loading flag to show spinners and disable buttons during API calls. */
  const [isLoading, setIsLoading] = useState<boolean>(false);
  /** Any error message from the API or validation checks. */
  const [error, setError] = useState<string | null>(null);
  /** The data for the price history chart, fetched from the eBay service. */
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[] | null>(null);
  /** A loading flag specifically for the price history fetch. */
  const [isFetchingHistory, setIsFetchingHistory] = useState<boolean>(false);
  /** A flag to indicate that a generation has just completed, used to show the "Start New Listing" button. */
  const [isGenerationComplete, setIsGenerationComplete] = useState<boolean>(false);
  
  /** A ref to the preview pane for scrolling to the top and for PDF export. */
  const previewRef = useRef<HTMLDivElement>(null);

  // =================================================================
  // Global State from Zustand store
  // Hooks into the central store for persistent data (history, saved items, keys)
  // and shared UI state (modals, search queries, etc.).
  // =================================================================
  const {
    history, savedListings, apiKeys, activeHistoryId, activeSavedId,
    activeTab, searchQuery, sortOption,
    isSettingsModalOpen, isSaveModalOpen, isEditModalOpen, isExportModalOpen,
    itemToEdit, itemToExport,
    setApiKeys, addHistoryItem, deleteHistoryItem,
    addSavedListing, updateSavedListing, deleteSavedListing,
    setActiveHistoryId, setActiveSavedId, setActiveTab,
    setSearchQuery, setSortOption,
    openSettingsModal, openSaveModal, openEditModal, openExportModal, closeAllModals
  } = useStore();

  /**
   * Main handler for generating a new listing.
   * It validates inputs, calls the Gemini service, and updates the state with the result.
   */
  const handleGenerate = useCallback(async () => {
    // 1. Pre-flight checks for API key and inputs.
    if (!apiKeys.gemini) {
      setError('Google Gemini API key is missing. Please add it in the Settings panel.');
      return;
    }
    if (!textInput && !imageFile) {
      setError('Please provide an image or a text description.');
      return;
    }

    // 2. Reset the UI state for a new generation.
    setIsLoading(true);
    setError(null);
    setGeneratedListing(null);
    setPriceHistory(null);
    setActiveHistoryId(null);
    setActiveSavedId(null);
    setIsGenerationComplete(false);

    try {
      // 3. Call the Gemini service.
      const result = await generateListing(selectedPlatform, textInput, apiKeys.gemini, imageFile ?? undefined);
      setGeneratedListing(result);
      setIsGenerationComplete(true); // Signal that generation is done.

      // 4. Create and store a new history item in the global store.
      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        platform: selectedPlatform,
        input: { text: textInput, image: imageFile },
        listingData: result,
        timestamp: new Date().toISOString(),
      };
      addHistoryItem(newHistoryItem);

      // 5. If an eBay API key is present, fetch the price history for the identified item.
      if (apiKeys.ebay && result.itemName) {
          setIsFetchingHistory(true);
          fetchPriceHistory(result.itemName, apiKeys.ebay)
            .then(data => setPriceHistory(data))
            .catch(err => console.error("Failed to fetch price history", err))
            .finally(() => setIsFetchingHistory(false));
      }

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlatform, textInput, imageFile, apiKeys.gemini, apiKeys.ebay, addHistoryItem, setActiveHistoryId, setActiveSavedId]);

  /**
   * Resets the input and output panes to start a new listing from scratch.
   * This is triggered by the "Start New Listing" button.
   */
  const handleStartNewListing = useCallback(() => {
    setTextInput('');
    setImageFile(null);
    setGeneratedListing(null);
    setError(null);
    setPriceHistory(null);
    setActiveHistoryId(null);
    setActiveSavedId(null);
    setIsGenerationComplete(false);
    if (previewRef.current) {
      previewRef.current.scrollTop = 0; // Scroll preview pane to top
    }
  }, [setActiveHistoryId, setActiveSavedId]);

  /**
   * A helper function to deselect any active history/saved item.
   * This is called when the user changes an input, signaling they are creating a new listing.
   */
  const deselectItems = useCallback(() => {
    setActiveHistoryId(null);
    setActiveSavedId(null);
    setPriceHistory(null);
    setIsGenerationComplete(false);
  }, [setActiveHistoryId, setActiveSavedId]);
  
  // Handlers for user actions that modify inputs. They deselect any active item.
  const onPlatformChange = useCallback((platform: Platform) => { setSelectedPlatform(platform); deselectItems(); }, [deselectItems]);
  const onTextChange = useCallback((text: string) => { setTextInput(text); deselectItems(); }, [deselectItems]);
  const onImageChange = useCallback((image: ImageFile | null) => { setImageFile(image); deselectItems(); }, [deselectItems]);

  /**
   * Handles selecting an item from the history list to view it in the preview pane.
   */
  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setActiveHistoryId(item.id);
    setSelectedPlatform(item.platform);
    setTextInput(item.input.text);
    setImageFile(item.input.image);
    // Clear ephemeral state to show the selected item's data instead.
    setGeneratedListing(null);
    setPriceHistory(null);
    setError(null);
    setIsGenerationComplete(true); // Show "Start New" button when viewing history
  }, [setActiveHistoryId]);
  
  /**
   * Handles selecting an item from the saved list to view it in the preview pane.
   */
  const handleSelectSavedListing = useCallback((item: HistoryItem) => {
    setActiveSavedId(item.id);
    setSelectedPlatform(item.platform);
    setTextInput(item.input.text);
    setImageFile(item.input.image);
    // Clear ephemeral state.
    setGeneratedListing(null);
    setPriceHistory(null);
    setError(null);
    setIsGenerationComplete(true); // Show "Start New" button when viewing saved items
  }, [setActiveSavedId]);

  /**
   * Handles saving a newly generated listing with a custom title via the Save modal.
   */
  const handleSaveListing = useCallback((customTitle: string) => {
    const listingToSave = generatedListing;
    if (!listingToSave) return;

    const itemToSave: HistoryItem = {
      id: Date.now(),
      platform: selectedPlatform,
      input: { text: textInput, image: imageFile },
      listingData: listingToSave,
      timestamp: new Date().toISOString(),
      customTitle,
    };

    addSavedListing(itemToSave);
    handleStartNewListing(); // Reset the interface after saving
  }, [generatedListing, selectedPlatform, textInput, imageFile, addSavedListing, handleStartNewListing]);

  /**
   * Handles deleting a listing from the saved list.
   */
  const handleDeleteSavedListing = useCallback((itemId: number) => {
    if (window.confirm("Are you sure you want to delete this saved listing?")) {
      deleteSavedListing(itemId);
    }
  }, [deleteSavedListing]);
  
  /**
   * Handles deleting an item from the history list.
   */
  const handleDeleteHistory = useCallback((itemId: number) => {
    if (window.confirm("Are you sure you want to delete this history item?")) {
      deleteHistoryItem(itemId);
    }
  }, [deleteHistoryItem]);

  /**
   * Handles saving changes to an edited saved listing from the Edit modal.
   */
  const handleUpdateListing = useCallback((updatedItem: HistoryItem) => {
      updateSavedListing(updatedItem);
      // Force a re-render of the preview if the active item was edited.
      // This is a small trick: deselect and re-select to trigger the `useMemo` hooks.
      if(activeSavedId === updatedItem.id) {
          setActiveSavedId(null);
          setTimeout(() => setActiveSavedId(updatedItem.id), 0);
      }
  }, [activeSavedId, updateSavedListing, setActiveSavedId]);

  /**
   * Memoized calculation to determine which item is currently active (from history or saved).
   * This prevents re-finding the item on every render.
   */
  const activeItem = useMemo(() => {
      return history.find(h => h.id === activeHistoryId) || savedListings.find(s => s.id === activeSavedId) || null;
  }, [activeHistoryId, activeSavedId, history, savedListings]);

  /**
   * Memoized calculation to determine what content to display in the preview pane.
   * It prioritizes an active history/saved item, falling back to a newly generated listing.
   */
  const { listingToShow, platformToShow } = useMemo(() => {
    if (activeItem) {
        return { listingToShow: activeItem.listingData, platformToShow: activeItem.platform };
    }
    return { listingToShow: generatedListing as HistoryListing | null, platformToShow: selectedPlatform };
  }, [activeItem, generatedListing, selectedPlatform]);
  
  /**
   * Memoized logic for filtering and sorting the history and saved lists based on user input.
   * `useCallback` is used here because the function itself is passed as a prop.
   */
  const sortAndFilterListings = useCallback((list: HistoryItem[]) => {
      // 1. Sort the list based on the selected sort option.
      const sortedList = [...list].sort((a, b) => {
          switch (sortOption) {
              case 'date-asc': return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
              case 'name-asc': return (a.customTitle || a.listingData.listing.title).localeCompare(b.customTitle || b.listingData.listing.title);
              case 'name-desc': return (b.customTitle || b.listingData.listing.title).localeCompare(a.customTitle || a.listingData.listing.title);
              case 'platform-asc': return a.platform.localeCompare(b.platform);
              case 'platform-desc': return b.platform.localeCompare(a.platform);
              default: return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); // 'date-desc' is default
          }
      });
      // 2. If no search query, return the sorted list.
      if (!searchQuery) return sortedList;
      // 3. Filter the sorted list based on the search query.
      const lowercasedQuery = searchQuery.toLowerCase();
      return sortedList.filter(item =>
        (item.customTitle && item.customTitle.toLowerCase().includes(lowercasedQuery)) ||
        item.listingData.listing.title.toLowerCase().includes(lowercasedQuery) ||
        item.listingData.listing.description.toLowerCase().includes(lowercasedQuery) ||
        item.input.text.toLowerCase().includes(lowercasedQuery)
      );
  }, [searchQuery, sortOption]);

  const filteredHistory = useMemo(() => sortAndFilterListings(history), [history, sortAndFilterListings]);
  const filteredSavedListings = useMemo(() => sortAndFilterListings(savedListings), [savedListings, sortAndFilterListings]);
  
  /**
   * Prepares the data for the export modal. It uses the active item or the newly generated listing.
   */
  const handleOpenExportModal = useCallback(() => {
      const item = activeItem || (generatedListing ? {
          id: 0, platform: selectedPlatform, input: { text: textInput, image: imageFile },
          listingData: generatedListing, timestamp: new Date().toISOString()
      } : null);
      if (item) {
          openExportModal(item);
      }
  }, [activeItem, generatedListing, selectedPlatform, textInput, imageFile, openExportModal]);

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-gray-900 dark:text-gray-100 font-sans">
      <Header onOpenSettings={openSettingsModal} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Inputs and History/Saved Lists */}
          <div className="flex flex-col space-y-6 non-printable">
            <PlatformSelector
              selectedPlatform={selectedPlatform}
              onPlatformChange={onPlatformChange}
            />
            <InputArea
              text={textInput}
              onTextChange={onTextChange}
              image={imageFile}
              onImageChange={onImageChange}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              isGenerationComplete={isGenerationComplete}
              onStartNew={handleStartNewListing}
            />
            
            {(history.length > 0 || savedListings.length > 0) && (
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search listings..."
                      className="w-full p-2.5 pl-10 text-sm text-gray-900 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary transition"
                    />
                  </div>
                   <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as SortOption)}
                        className="p-2.5 text-sm text-gray-900 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary transition"
                    >
                        <option value="date-desc">Sort by: Newest First</option>
                        <option value="date-asc">Sort by: Oldest First</option>
                        <option value="name-asc">Sort by: Name (A-Z)</option>
                        <option value="name-desc">Sort by: Name (Z-A)</option>
                        <option value="platform-asc">Sort by: Platform (A-Z)</option>
                        <option value="platform-desc">Sort by: Platform (Z-A)</option>
                    </select>
                </div>
                
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'history' ? 'border-b-2 border-primary text-primary dark:border-secondary dark:text-secondary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                    History
                  </button>
                  <button onClick={() => setActiveTab('saved')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'saved' ? 'border-b-2 border-primary text-primary dark:border-secondary dark:text-secondary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                    Saved ({savedListings.length})
                  </button>
                </div>

                <div className="mt-4">
                  {activeTab === 'history' ? (
                     <HistoryList
                      history={filteredHistory}
                      onSelect={handleHistorySelect}
                      onDelete={handleDeleteHistory}
                      activeItemId={activeHistoryId}
                      hasSearchQuery={searchQuery.length > 0}
                    />
                  ) : (
                    <SavedListings
                      listings={filteredSavedListings}
                      onSelect={handleSelectSavedListing}
                      onDelete={handleDeleteSavedListing}
                      onEdit={openEditModal}
                      activeItemId={activeSavedId}
                      hasSearchQuery={searchQuery.length > 0}
                    />
                  )}
                </div>
              </div>
            )}

          </div>
          {/* Right Column: Listing Preview */}
          <div ref={previewRef} className="lg:sticky top-8 self-start printable-area">
             <ListingPreview 
                listing={listingToShow}
                isLoading={isLoading}
                error={error}
                platform={platformToShow}
                onSave={generatedListing ? openSaveModal : undefined}
                onExport={!generatedListing ? handleOpenExportModal : undefined}
                isNewGeneration={!!generatedListing}
                priceHistory={priceHistory}
                isFetchingHistory={isFetchingHistory}
            />
          </div>
        </div>
      </main>
      
      {/* Modals are rendered here at the top level */}
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={closeAllModals}
        onSave={setApiKeys}
        initialKeys={apiKeys}
      />
      <SaveListingModal
        isOpen={isSaveModalOpen}
        onClose={closeAllModals}
        onSave={handleSaveListing}
        initialTitle={generatedListing?.itemName || ''}
      />
      <EditListingModal
        isOpen={isEditModalOpen}
        onClose={closeAllModals}
        item={itemToEdit}
        onSave={handleUpdateListing}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={closeAllModals}
        item={itemToExport}
        previewRef={previewRef}
      />
    </div>
  );
};

export default App;