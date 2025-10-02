import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../types';

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: HistoryItem | null;
  onSave: (updatedItem: HistoryItem) => void;
}

export const EditListingModal: React.FC<EditListingModalProps> = ({ isOpen, onClose, item, onSave }) => {
    const [formData, setFormData] = useState({ customTitle: '', title: '', description: '' });

    useEffect(() => {
        if (item) {
            setFormData({
                customTitle: item.customTitle || item.listingData.itemName,
                title: item.listingData.listing.title,
                description: item.listingData.listing.description,
            });
        }
    }, [item]);

    if (!isOpen || !item) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSave = () => {
        const updatedItem: HistoryItem = {
            ...item,
            customTitle: formData.customTitle,
            listingData: {
                ...item.listingData,
                listing: {
                    ...item.listingData.listing,
                    title: formData.title,
                    description: formData.description,
                }
            }
        };
        onSave(updatedItem);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 m-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Edit Listing</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="customTitle" className="block text-sm font-medium">Custom Title</label>
                        <input id="customTitle" value={formData.customTitle} onChange={handleChange} className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium">Listing Title</label>
                        <input id="title" value={formData.title} onChange={handleChange} className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium">Description</label>
                        <textarea id="description" value={formData.description} onChange={handleChange} rows={8} className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-md">Cancel</button>
                    <button onClick={handleSave} className="bg-primary text-white font-bold px-4 py-2 rounded-md">Save Changes</button>
                </div>
            </div>
        </div>
    );
};
