import React from 'react';
import { HistoryItem } from '../types';
import { exportAsTxt, exportAsJson, exportAsCsv, exportAsDoc, exportAsSql, exportAsPdf } from '../services/exportService';

interface SaveAsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: HistoryItem | null;
  previewRef: React.RefObject<HTMLDivElement>;
}

export const SaveAsModal: React.FC<SaveAsModalProps> = ({ isOpen, onClose, item, previewRef }) => {
    if (!isOpen || !item) return null;

    const EXPORT_OPTIONS = [
      { label: 'PDF', icon: '📄', action: () => exportAsPdf(previewRef.current, item) },
      { label: 'Word (DOC)', icon: '📝', action: () => exportAsDoc(item) },
      { label: 'Text (TXT)', icon: '📜', action: () => exportAsTxt(item) },
      { label: 'JSON', icon: '{}', action: () => exportAsJson(item) },
      { label: 'CSV', icon: '📊', action: () => exportAsCsv(item) },
      { label: 'SQL', icon: '💾', action: () => exportAsSql(item) },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Save Listing As...</h2>
                <div className="grid grid-cols-2 gap-4">
                    {EXPORT_OPTIONS.map(({ label, icon, action }) => (
                        <button key={label} onClick={() => { action(); onClose(); }} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <span className="text-3xl">{icon}</span>
                            <span className="mt-2 text-sm font-medium">{label}</span>
                        </button>
                    ))}
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-md">Cancel</button>
                </div>
            </div>
        </div>
    );
};