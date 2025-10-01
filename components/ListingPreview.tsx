import React, { useState, useEffect } from 'react';
import { GeneratedListing, HistoryListing, Platform, PriceAnalysis } from '../types';

interface ListingPreviewProps {
  listing: HistoryListing | null;
  isLoading: boolean;
  error: string | null;
  platform: Platform;
  onSave?: () => void;
  isSaved?: boolean;
}

const LOADING_MESSAGES = [
  "The AI is analyzing your product...",
  "Consulting market data for pricing...",
  "Crafting the perfect description...",
  "Identifying key features and specs...",
  "Almost there, finalizing the details...",
];

const CopyIcon: React.FC<{ copied: boolean }> = ({ copied }) => {
  return copied ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-primary">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v3.75m-8.166-4.388a2.25 2.25 0 012.166-1.638h3c1.03 0 1.9.693 2.166 1.638m0 0C14.155 4.302 14 4.655 14 5v3.75m-8.166-4.388c-.055.194-.084.4-.084.612v3.75m0 0a2.25 2.25 0 002.25 2.25h3.75a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25h-3.75a2.25 2.25 0 00-2.25-2.25z" />
    </svg>
  );
};

const CopyToClipboard: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button onClick={copy} className="group p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
      <CopyIcon copied={copied} />
    </button>
  );
};

const ConfidenceBadge: React.FC<{ confidence: 'High' | 'Medium' | 'Low' }> = ({ confidence }) => {
    const confidenceStyles = {
        High: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        Low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return (
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${confidenceStyles[confidence]}`}>
            {confidence} Confidence
        </span>
    );
};

const ResourceLink: React.FC<{ href: string; icon: React.ReactElement; label: string }> = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-900/80 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/60 transition-colors group"
  >
    <span className="text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-secondary">{icon}</span>
    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
  </a>
);


export const ListingPreview: React.FC<ListingPreviewProps> = React.memo(({ listing, isLoading, error, platform, onSave, isSaved }) => {
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = LOADING_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
          return LOADING_MESSAGES[nextIndex];
        });
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Generating your listing...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{loadingMessage}</p>
        </div>
      );
    }
    if (error) {
      return (
         <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="mt-4 text-lg font-semibold text-red-700 dark:text-red-400">An Error Occurred</p>
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        </div>
      );
    }
    if (!listing) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Your Generated Listing Will Appear Here</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fill out the details on the left and click "Generate Listing" to start.</p>
        </div>
      );
    }

    // Backward compatibility for old history items with string price
    const priceInfo: PriceAnalysis = typeof listing.suggestedPrice === 'string'
      ? { range: listing.suggestedPrice, analysis: 'No pricing analysis available for this older entry.', confidence: 'Medium' }
      : listing.suggestedPrice;
      
    return (
      <div className="space-y-6 p-1">
        <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Identified Item</label>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex-1">{listing.itemName}</p>
                    <CopyToClipboard text={listing.itemName} />
                </div>
            </div>
             {onSave && (
                <button
                  onClick={onSave}
                  disabled={isSaved}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isSaved
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 cursor-default'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                  {isSaved ? 'Saved' : 'Save Listing'}
                </button>
            )}
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-3">
            <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Suggested Price</label>
                <div className="flex items-center gap-2 mt-1">
                    <p className="flex-1 text-xl font-semibold text-green-600 dark:text-green-400">{priceInfo.range}</p>
                    <div className="flex items-center gap-2">
                        <ConfidenceBadge confidence={priceInfo.confidence} />
                        <CopyToClipboard text={priceInfo.range} />
                    </div>
                </div>
            </div>
             <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Price Analysis</label>
                <div className="flex items-start gap-2 mt-1">
                    <p className="flex-1 text-xs text-gray-500 dark:text-gray-400 italic">{priceInfo.analysis}</p>
                    <CopyToClipboard text={priceInfo.analysis} />
                </div>
            </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
             <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</label>
                <div className="flex items-center gap-2 mt-1">
                    <p className="flex-1 p-3 bg-gray-100 dark:bg-gray-900 rounded-md font-mono text-sm">{listing.listing.title}</p>
                    <CopyToClipboard text={listing.listing.title} />
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                 <div className="flex items-start gap-2 mt-1">
                    {platform === Platform.Ebay ? (
                        <div className="prose prose-sm max-w-none flex-1 p-3 bg-gray-100 dark:bg-gray-900 rounded-md" dangerouslySetInnerHTML={{ __html: listing.listing.description }} />
                    ) : (
                        <p className="flex-1 p-3 bg-gray-100 dark:bg-gray-900 rounded-md font-mono text-sm whitespace-pre-wrap">{listing.listing.description}</p>
                    )}
                    <CopyToClipboard text={listing.listing.description} />
                </div>
            </div>

            {listing.listing.tags && listing.listing.tags.length > 0 && (
                <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</label>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 p-3 bg-gray-100 dark:bg-gray-900 rounded-md text-sm flex flex-wrap gap-2">
                            {listing.listing.tags.map(tag => (
                                <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">#{tag}</span>
                            ))}
                        </div>
                        <CopyToClipboard text={listing.listing.tags.join(', ')} />
                    </div>
                </div>
            )}
        </div>

        {listing.itemName && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
              Find More Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ResourceLink
                href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`"${listing.itemName}" official product images`)}`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>}
                label="Product Images"
              />
              <ResourceLink
                href={`https://www.google.com/search?q=${encodeURIComponent(`"${listing.itemName}" official documentation specs manual`)}`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
                label="Docs & Specs"
              />
              <ResourceLink
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`"${listing.itemName}" review`)}`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>}
                label="Video Reviews"
              />
              <ResourceLink
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`"${listing.itemName}" tutorial setup`)}`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.502L16.25 22l-.648-1.498a3.375 3.375 0 00-2.456-2.456L11.25 18l1.498-.648a3.375 3.375 0 002.456-2.456L16.25 13l.648 1.498a3.375 3.375 0 002.456 2.456L21 18l-1.498.648a3.375 3.375 0 00-2.456 2.456z" /></svg>}
                label="Tutorials & Setup"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-full p-6">
      {renderContent()}
    </div>
  );
});