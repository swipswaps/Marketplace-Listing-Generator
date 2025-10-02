import React from 'react';
import { HistoryItem } from '../types';
import { PLATFORMS } from '../constants';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (itemId: number) => void;
  activeItemId: number | null;
  hasSearchQuery: boolean;
}

export const HistoryList: React.FC<HistoryListProps> = React.memo(({ history, onSelect, onDelete, activeItemId, hasSearchQuery }) => {
  if (history.length === 0) {
    return (
        <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d={hasSearchQuery ? "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" : "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"} />
            </svg>
            <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {hasSearchQuery ? 'No Results Found' : 'No Recent History'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {hasSearchQuery ? 'Try a different search term.' : 'Your generated listings will appear here.'}
            </p>
        </div>
    );
  }

  return (
    <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
      {history.map(item => {
        const platformInfo = PLATFORMS.find(p => p.id === item.platform);
        const isActive = item.id === activeItemId;
        return (
          <div key={item.id} className="group flex items-center gap-2">
            <button
              onClick={() => onSelect(item)}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-4 transition-colors duration-150 flex-1 ${
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
                  <p className="font-bold text-gray-800 dark:text-gray-100 truncate">{item.customTitle || item.listingData.listing.title}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                  {`Generated on ${new Date(item.timestamp).toLocaleDateString()}`}
                </p>
              </div>
            </button>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-gray-500 hover:text-red-500"
                aria-label="Delete history item"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.077-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
});