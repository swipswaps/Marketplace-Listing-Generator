
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { PlatformSelector } from './components/PlatformSelector';
import { InputArea } from './components/InputArea';
import { ListingPreview } from './components/ListingPreview';
import { Platform, GeneratedListing, ImageFile } from './types';
import { generateListing } from './services/geminiService';

const App: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(Platform.Ebay);
  const [textInput, setTextInput] = useState<string>('');
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [generatedListing, setGeneratedListing] = useState<GeneratedListing | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!textInput && !imageFile) {
      setError('Please provide an image or a text description.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedListing(null);

    try {
      const result = await generateListing(selectedPlatform, textInput, imageFile ?? undefined);
      setGeneratedListing(result);
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


  return (
    <div className="min-h-screen bg-light dark:bg-dark text-gray-900 dark:text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-6">
            <PlatformSelector
              selectedPlatform={selectedPlatform}
              onPlatformChange={setSelectedPlatform}
            />
            <InputArea
              text={textInput}
              onTextChange={setTextInput}
              image={imageFile}
              onImageChange={setImageFile}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:sticky top-8 self-start">
             <ListingPreview 
                listing={generatedListing}
                isLoading={isLoading}
                error={error}
                platform={selectedPlatform}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
