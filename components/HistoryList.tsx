import React from 'react';
import { HistoryItem } from '../types';
import { PLATFORMS } from '../constants';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  activeItemId: number | null;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, activeItemId }) => {
  if (history.length === 0) {
    return null; // Don't render anything if there's no history
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
        Generation History
      </h2>
      <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
        {history.map(item => {
          const platformInfo = PLATFORMS.find(p => p.id === item.platform);
          const isActive = item.id === activeItemId;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-4 transition-colors duration-150 ${
                isActive 
                  ? 'bg-blue-100 dark:bg-blue-900/50 ring-2 ring-primary dark:ring-secondary'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex-shrink-0">
                {item.input.image ? (
                  <img src={`data:${item.input.image.mimeType};base64,${item.input.image.base64}`} alt="preview" className="w-12 h-12 rounded-md object-cover bg-gray-200" />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-primary dark:text-secondary">{platformInfo?.icon}</span>
                  <p className="font-bold text-gray-800 dark:text-gray-100 truncate">{item.listingData.listing.title}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                  {item.input.text ? `Input: "${item.input.text}"` : `Generated on ${new Date(item.timestamp).toLocaleDateString()}`}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
