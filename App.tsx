import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { PlatformSelector } from './components/PlatformSelector';
import { InputArea } from './components/InputArea';
import { ListingPreview } from './components/ListingPreview';
import { HistoryList } from './components/HistoryList';
import { SavedListings } from './components/SavedListings';
import { SettingsModal } from './components/SettingsModal';
// Fix: Import `HistoryListing` to use it as a type for `listingToShow`.
import { Platform, GeneratedListing, ImageFile, HistoryItem, ApiKeys, HistoryListing } from './types';
import { generateListing } from './services/geminiService';

const APP_HISTORY_KEY = 'marketplaceListingHistory';
const SAVED_LISTINGS_KEY = 'marketplaceSavedListings';
const API_KEYS_KEY = 'marketplaceApiKeys';

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
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ ebay: '', x: '', gemini: '', openai: '' });

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(APP_HISTORY_KEY);
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
    }
     try {
      const storedSaved = localStorage.getItem(SAVED_LISTINGS_KEY);
      if (storedSaved) setSavedListings(JSON.parse(storedSaved));
    } catch (e) {
      console.error("Failed to parse saved listings from localStorage", e);
    }
    try {
      const storedApiKeys = localStorage.getItem(API_KEYS_KEY);
      if (storedApiKeys) {
        // Ensure all keys are present, even if loading from older versions
        const loadedKeys = JSON.parse(storedApiKeys);
        setApiKeys(prevKeys => ({ ...prevKeys, ...loadedKeys }));
      }
    } catch (e) {
      console.error("Failed to parse API keys from localStorage", e);
    }
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

    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError('An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlatform, textInput, imageFile, apiKeys.gemini]);

  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setActiveHistoryId(item.id);
    setActiveSavedId(null);
    setSelectedPlatform(item.platform);
    setTextInput(item.input.text);
    setImageFile(item.input.image);
    setGeneratedListing(null);
    setError(null);
  }, []);
  
  const handleSelectSavedListing = useCallback((item: HistoryItem) => {
    setActiveSavedId(item.id);
    setActiveHistoryId(null);
    setSelectedPlatform(item.platform);
    setTextInput(item.input.text);
    setImageFile(item.input.image);
    setGeneratedListing(null);
    setError(null);
  }, []);

  const handleSaveListing = useCallback(() => {
    if (!generatedListing) return;

    const itemToSave: HistoryItem = {
      id: Date.now(),
      platform: selectedPlatform,
      input: { text: textInput, image: imageFile },
      listingData: generatedListing,
      timestamp: new Date().toISOString(),
    };

    setSavedListings(prevSaved => {
        const updatedSaved = [itemToSave, ...prevSaved];
        localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify(updatedSaved));
        return updatedSaved;
    });
  }, [generatedListing, selectedPlatform, textInput, imageFile]);

  const handleDeleteListing = useCallback((itemId: number) => {
    if (window.confirm("Are you sure you want to delete this saved listing? This action cannot be undone.")) {
      setSavedListings(prevSaved => {
          const updatedSaved = prevSaved.filter(item => item.id !== itemId);
          localStorage.setItem(SAVED_LISTINGS_KEY, JSON.stringify(updatedSaved));
          return updatedSaved;
      });
      if (activeSavedId === itemId) {
          setActiveSavedId(null);
      }
    }
  }, [activeSavedId]);
  
  const { listingToShow, platformToShow } = useMemo(() => {
    const activeHistoryItem = history.find(item => item.id === activeHistoryId);
    if (activeHistoryItem) {
      return { listingToShow: activeHistoryItem.listingData, platformToShow: activeHistoryItem.platform };
    }

    const activeSavedItem = savedListings.find(item => item.id === activeSavedId);
    if (activeSavedItem) {
      return { listingToShow: activeSavedItem.listingData, platformToShow: activeSavedItem.platform };
    }

    return { listingToShow: generatedListing as HistoryListing | null, platformToShow: selectedPlatform };
  }, [activeHistoryId, activeSavedId, generatedListing, history, savedListings, selectedPlatform]);


  const isCurrentListingSaved = useMemo(() => {
    if (!generatedListing) return false;
    return savedListings.some(item => 
        item.listingData.listing.title === generatedListing.listing.title && 
        item.listingData.listing.description === generatedListing.listing.description
    );
  }, [generatedListing, savedListings]);

  const deselectItems = useCallback(() => {
    setActiveHistoryId(null);
    setActiveSavedId(null);
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


  return (
    <div className="min-h-screen bg-light dark:bg-dark text-gray-900 dark:text-gray-100 font-sans">
      <Header onOpenSettings={() => setIsSettingsModalOpen(true)} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-6">
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
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                  <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'history' ? 'border-b-2 border-primary text-primary dark:border-secondary dark:text-secondary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                    History
                  </button>
                  <button onClick={() => setActiveTab('saved')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'saved' ? 'border-b-2 border-primary text-primary dark:border-secondary dark:text-secondary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
                    Saved ({savedListings.length})
                  </button>
                </div>

                {activeTab === 'history' ? (
                   <HistoryList
                    history={history}
                    onSelect={handleHistorySelect}
                    activeItemId={activeHistoryId}
                  />
                ) : (
                  <SavedListings
                    listings={savedListings}
                    onSelect={handleSelectSavedListing}
                    onDelete={handleDeleteListing}
                    activeItemId={activeSavedId}
                  />
                )}
              </div>
            )}

          </div>
          <div className="lg:sticky top-8 self-start">
             <ListingPreview 
                listing={listingToShow}
                isLoading={isLoading}
                error={error}
                platform={platformToShow}
                onSave={generatedListing && !activeHistoryId && !activeSavedId ? handleSaveListing : undefined}
                isSaved={isCurrentListingSaved}
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
    </div>
  );
};

export default App;