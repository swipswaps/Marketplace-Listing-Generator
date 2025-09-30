import React from 'react';
import { GeneratedListing, Platform } from '../types';

interface ListingPreviewProps {
  listing: GeneratedListing | null;
  isLoading: boolean;
  error: string | null;
  platform: Platform;
  onSave?: () => void;
  isSaved?: boolean;
}

const CopyIcon: React.FC<{ copied: boolean }> = ({ copied }) => {
  return copied ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 group-hover:text-primary">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v3.75m-8.166-4.388a2.25 2.25 0 012.166-1.638h3c1.03 0 1.9.693 2.166 1.638m0 0C14.155 4.302 14 4.655 14 5v3.75m-8.166-4.388c-.055.194-.084.4-.084.612v3.75m0 0a2.25 2.25 0 002.25 2.25h3.75a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25h-3.75a2.25 2.25 0 00-2.25 2.25z" />
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


export const ListingPreview: React.FC<ListingPreviewProps> = ({ listing, isLoading, error, platform, onSave, isSaved }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Generating your listing...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">The AI is analyzing your product. This may take a moment.</p>
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
    return (
      <div className="space-y-6 p-1">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Identified Item</h3>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{listing.itemName}</p>
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
        <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Suggested Price</h3>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">{listing.suggestedPrice}</p>
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
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-full p-6">
      {renderContent()}
    </div>
  );
};