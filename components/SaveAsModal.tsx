import React, { useState, useEffect } from 'react';

interface SaveAsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customTitle: string) => void;
  initialTitle: string;
}

export const SaveAsModal: React.FC<SaveAsModalProps> = ({ isOpen, onClose, onSave, initialTitle }) => {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
    }
  }, [isOpen, initialTitle]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim());
      onClose();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleSave();
      }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="save-as-modal-title">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="save-as-modal-title" className="text-xl font-bold">Save Listing As</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4 pt-5">
           <div>
            <label htmlFor="customTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Custom Title
            </label>
            <div className="mt-1">
                <input
                  type="text"
                  id="customTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., 'Grandma's Vintage Lamp'"
                  className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  autoFocus
                />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Give this listing a memorable name.</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
                type="button"
                className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                onClick={onClose}
            >
                Cancel
            </button>
          <button
            type="button"
            className="bg-primary hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
