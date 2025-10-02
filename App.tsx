import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { PlatformSelector } from './components/PlatformSelector';
import { InputArea } from './components/InputArea';
import { ListingPreview } from './components/ListingPreview';
import { HistoryList } from './components/HistoryList';
import { SavedListings } from './components/SavedListings';
import { SettingsModal } from './components/SettingsModal';
import { SaveListingModal } from './components/SaveAsModal';
import { EditListingModal } from './components/EditListingModal';
import { ExportModal } from './components/ExportModal';
import { Platform, GeneratedListing, ImageFile, HistoryItem, ApiKeys, HistoryListing, PriceHistoryPoint } from './types';
import { generateListing } from './services/geminiService';
import { fetchPriceHistory } from './services/ebayService';

const APP_HISTORY_KEY = 'marketplaceListingHistory';
const SAVED_LISTINGS_KEY = 'marketplaceSavedListings';
const API_KEYS_KEY = 'marketplaceApiKeys';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'platform-asc' | 'platform-desc';


// == IN-APP MODAL COMPONENTS == //


const App: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(Platform.Ebay);
  const [textInput, setTextInput] = useState<string>('');
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [generatedListing, setGeneratedListing] = useState<GeneratedListing | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [savedListings, setSavedListings] = useState<HistoryItem[]>([]);
  
  const [activeHistoryId, setActiveHistoryId] = useState<number | null>(null);
  const [activeSavedId, setActiveSavedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'saved'>('history');

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const [itemToEdit, setItemToEdit] = useState<HistoryItem | null>(null);
  const [itemToExport, setItemToExport] = useState<HistoryItem | null>(null);

  const [apiKeys, setApiKeys] = useState<ApiKeys>({ ebay: '', x: '', gemini: '', openai: '' });

  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[] | null>(null);
  const [isFetchingHistory, setIsFetchingHistory] = useState<boolean>(false);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');

  const previewRef = useRef<HTMLDivElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(APP_HISTORY_KEY);
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    } catch (e) { console.error("Failed to parse history", e); }
     try {
      const storedSaved = localStorage.getItem(SAVED_LISTINGS_KEY);
      if (storedSaved) setSavedListings(JSON.parse(storedSaved));
    } catch (e) { console.error("Failed to parse saved listings", e); }
    try {
      const storedApiKeys = localStorage.getItem(API_KEYS_KEY);
      if (storedApiKeys) {
        const loadedKeys = JSON.parse(storedApiKeys);
        setApiKeys(prevKeys => ({ ...prevKeys, ...loadedKeys }));
      }
    } catch (e) { console.error("Failed to parse API keys", e); }
  }, []);
  
  const handleSaveKeys = useCallback((keys: ApiKeys) => {
    setApiKeys(keys);
    localStorage.setItem(API_KEYS_KEY, JSON.stringify(keys));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!apiKeys.gemini) {
      setError('Google Gemini API key is missing. Please add it in the Settings panel.');
      return;
    }
    if (!textInput && !imageFile) {
      setError('Please provide an image or a text description.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedListing(null);
    setPriceHistory(null);
    setActiveHistoryId(null);
    setActiveSavedId(null);

    try {
      const result = await generateListing(selectedPlatform, textInput, apiKeys.gemini, imageFile ?? undefined);
      setGeneratedListing(result);

      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        platform: selectedPlatform,
        input: { text: textInput, image: imageFile },
        listingData: result,
        timestamp: new Date().toISOString(),
      };

      setHistory(prevHistory => {
        const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, 50);
        localStorage.setItem(APP_HISTORY_KEY, JSON.stringify(updatedHistory));
        return updatedHistory;
      });

      if (apiKeys.ebay && result.itemName) {
          setIsFetchingHistory(true);
          fetchPriceHistory(result.itemName, apiKeys.ebay)
            .then(data => setPriceHistory(data))
            .catch(err => console.error("Failed to fetch price history", err))
            .finally(() => setIsFetchingHistory(false));
      }

    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError('An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlatform, textInput, imageFile, apiKeys.gemini, apiKeys.ebay]);

  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setActiveHistoryId(item.id);
    setActiveSavedId(null);
    setSelectedPlatform(item.platform);
    setTextInput(item.input.text);
    setImageFile(item.input.image);
    setGeneratedListing(null);
    setPriceHistory(null);
    setError(null);
  }, []);
  
  const handleSelectSavedListing = useCallback((item: HistoryItem) => {
    setActiveSavedId(item.id);
    setActiveHistoryId(null);
    setSelectedPlatform(item.platform);
    setTextInput(item.input.text);
    setImageFile(item.input.image);
    setGeneratedListing(null);
    setPriceHistory(null);
    setError(null);
  }, []);

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

    setSavedListings(prevSaved => {
        const updatedSaved = [itemToSave, ...prevSaved];
        localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify(updatedSaved));
        return updatedSaved;
    });
    setGeneratedListing(null); // Clear the main view after saving
  }, [generatedListing, selectedPlatform, textInput, imageFile]);

  const handleDeleteSavedListing = useCallback((itemId: number) => {
    if (window.confirm("Are you sure you want to delete this saved listing?")) {
      setSavedListings(prev => {
          const updated = prev.filter(item => item.id !== itemId);
          localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify(updated));
          return updated;
      });
      if (activeSavedId === itemId) setActiveSavedId(null);
    }
  }, [activeSavedId]);
  
  const handleDeleteHistory = useCallback((itemId: number) => {
    if (window.confirm("Are you sure you want to delete this history item?")) {
      setHistory(prev => {
          const updated = prev.filter(item => item.id !== itemId);
          localStorage.setItem(APP_HISTORY_KEY, JSON.stringify(updated));
          return updated;
      });
      if (activeHistoryId === itemId) setActiveHistoryId(null);
    }
  }, [activeHistoryId]);

  const handleOpenEditModal = useCallback((item: HistoryItem) => {
      setItemToEdit(item);
      setIsEditModalOpen(true);
  }, []);

  const handleUpdateListing = useCallback((updatedItem: HistoryItem) => {
      setSavedListings(prev => {
          const updated = prev.map(item => item.id === updatedItem.id ? updatedItem : item);
          localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify(updated));
          return updated;
      });
      if(activeSavedId === updatedItem.id) {
          // Force a re-render of the preview if the active item was edited
          setActiveSavedId(null);
          setTimeout(() => setActiveSavedId(updatedItem.id), 0);
      }
  }, [activeSavedId]);

  const activeItem = useMemo(() => {
      return history.find(h => h.id === activeHistoryId) || savedListings.find(s => s.id === activeSavedId) || null;
  }, [activeHistoryId, activeSavedId, history, savedListings]);

  const { listingToShow, platformToShow } = useMemo(() => {
    if (activeItem) {
        return { listingToShow: activeItem.listingData, platformToShow: activeItem.platform };
    }
    return { listingToShow: generatedListing as HistoryListing | null, platformToShow: selectedPlatform };
  }, [activeItem, generatedListing, selectedPlatform]);

  const deselectItems = useCallback(() => {
    setActiveHistoryId(null);
    setActiveSavedId(null);
    setPriceHistory(null);
  }, []);

  const onPlatformChange = useCallback((platform: Platform) => {
    setSelectedPlatform(platform);
    deselectItems();
  }, [deselectItems]);

  const onTextChange = useCallback((text: string) => {
    setTextInput(text);
    deselectItems();
  }, [deselectItems]);

  const onImageChange = useCallback((image: ImageFile | null) => {
    setImageFile(image);
    deselectItems();
  }, [deselectItems]);
  
  const sortAndFilterListings = useCallback((list: HistoryItem[]) => {
      const sortedList = [...list].sort((a, b) => {
          switch (sortOption) {
              case 'date-asc': return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
              case 'name-asc': return (a.customTitle || a.listingData.listing.title).localeCompare(b.customTitle || b.listingData.listing.title);
              case 'name-desc': return (b.customTitle || b.listingData.listing.title).localeCompare(a.customTitle || a.listingData.listing.title);
              case 'platform-asc': return a.platform.localeCompare(b.platform);
              case 'platform-desc': return b.platform.localeCompare(a.platform);
              default: return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          }
      });
      if (!searchQuery) return sortedList;
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
  
  const handleOpenExportModal = useCallback(() => {
      const item = activeItem || (generatedListing ? {
          id: 0, platform: selectedPlatform, input: { text: textInput, image: imageFile },
          listingData: generatedListing, timestamp: new Date().toISOString()
      } : null);
      if (item) {
          setItemToExport(item);
          setIsExportModalOpen(true);
      }
  }, [activeItem, generatedListing, selectedPlatform, textInput, imageFile]);

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-gray-900 dark:text-gray-100 font-sans">
      <Header onOpenSettings={() => setIsSettingsModalOpen(true)} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            />
            
            {(history.length > 0 || savedListings.length > 0) && (
              <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
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
                      onEdit={handleOpenEditModal}
                      activeItemId={activeSavedId}
                      hasSearchQuery={searchQuery.length > 0}
                    />
                  )}
                </div>
              </div>
            )}

          </div>
          <div ref={previewRef} className="lg:sticky top-8 self-start printable-area">
             <ListingPreview 
                listing={listingToShow}
                isLoading={isLoading}
                error={error}
                platform={platformToShow}
                onSave={generatedListing ? () => setIsSaveModalOpen(true) : undefined}
                onExport={!generatedListing ? handleOpenExportModal : undefined}
                isNewGeneration={!!generatedListing}
                priceHistory={priceHistory}
                isFetchingHistory={isFetchingHistory}
            />
          </div>
        </div>
      </main>
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSaveKeys}
        initialKeys={apiKeys}
      />
      <SaveListingModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveListing}
        initialTitle={generatedListing?.itemName || ''}
      />
      <EditListingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={itemToEdit}
        onSave={handleUpdateListing}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        item={itemToExport}
        previewRef={previewRef}
      />
    </div>
  );
};

export default App;
