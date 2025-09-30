import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PlatformSelector } from './components/PlatformSelector';
import { InputArea } from './components/InputArea';
import { ListingPreview } from './components/ListingPreview';
import { HistoryList } from './components/HistoryList';
import { Platform, GeneratedListing, ImageFile, HistoryItem } from './types';
import { generateListing } from './services/geminiService';

const APP_HISTORY_KEY = 'marketplaceListingHistory';

const App: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(Platform.Ebay);
  const [textInput, setTextInput] = useState<string>('');
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [generatedListing, setGeneratedListing] = useState<GeneratedListing | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<number | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(APP_HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      localStorage.removeItem(APP_HISTORY_KEY);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!textInput && !imageFile) {
      setError('Please provide an image or a text description.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedListing(null);
    setActiveHistoryId(null); // Clear active history item on new generation

    try {
      const result = await generateListing(selectedPlatform, textInput, imageFile ?? undefined);
      setGeneratedListing(result);

      // Create and save new history item
      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        platform: selectedPlatform,
        input: { text: textInput, image: imageFile },
        listingData: result,
        timestamp: new Date().toISOString(),
      };

      setHistory(prevHistory => {
        const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, 50); // Limit history to 50 items
        localStorage.setItem(APP_HISTORY_KEY, JSON.stringify(updatedHistory));
        return updatedHistory;
      });

    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlatform, textInput, imageFile]);

  // Handler to select a history item
  const handleHistorySelect = (item: HistoryItem) => {
    setActiveHistoryId(item.id);
    // Restore the inputs for user convenience
    setSelectedPlatform(item.platform);
    setTextInput(item.input.text);
    setImageFile(item.input.image);
    // Clear any current "live" generation data
    setGeneratedListing(null);
    setError(null);
  };
  
  // Determine what to display in the preview
  const activeHistoryItem = history.find(item => item.id === activeHistoryId);
  const listingToShow = activeHistoryItem ? activeHistoryItem.listingData : generatedListing;
  const platformToShow = activeHistoryItem ? activeHistoryItem.platform : selectedPlatform;

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-gray-900 dark:text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-6">
            <PlatformSelector
              selectedPlatform={selectedPlatform}
              onPlatformChange={(platform) => {
                setSelectedPlatform(platform);
                setActiveHistoryId(null); // Deselect history when platform changes
              }}
            />
            <InputArea
              text={textInput}
              onTextChange={(text) => {
                setTextInput(text);
                setActiveHistoryId(null); // Deselect history when input changes
              }}
              image={imageFile}
              onImageChange={(image) => {
                setImageFile(image);
                setActiveHistoryId(null); // Deselect history when input changes
              }}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
            <HistoryList
              history={history}
              onSelect={handleHistorySelect}
              activeItemId={activeHistoryId}
            />
          </div>
          <div className="lg:sticky top-8 self-start">
             <ListingPreview 
                listing={listingToShow}
                isLoading={isLoading}
                error={error}
                platform={platformToShow}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
