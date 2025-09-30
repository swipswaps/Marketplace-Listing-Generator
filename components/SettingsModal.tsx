import React, { useState, useEffect } from 'react';
import { ApiKeys } from '../types';
import { verifyApiKey } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: ApiKeys) => void;
  initialKeys: ApiKeys;
}

const EyeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const EyeSlashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" />
    </svg>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialKeys }) => {
  const [keys, setKeys] = useState<ApiKeys>(initialKeys);
  const [visibility, setVisibility] = useState({ gemini: false, openai: false, ebay: false, x: false });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ApiKeys, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setKeys(initialKeys);
      setVisibility({ gemini: false, openai: false, ebay: false, x: false });
      setVerificationError(null);
      setIsVerifying(false);
      setErrors({});
    }
  }, [initialKeys, isOpen]);

  if (!isOpen) {
    return null;
  }

  const toggleVisibility = (key: keyof typeof visibility) => {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const validateKeys = (keysToValidate: ApiKeys): boolean => {
      const newErrors: Partial<Record<keyof ApiKeys, string>> = {};

      // Gemini (required)
      if (!keysToValidate.gemini.trim()) {
        newErrors.gemini = 'Gemini API key is required.';
      } else if (keysToValidate.gemini.length < 35) {
        newErrors.gemini = 'Invalid format. Gemini keys are typically longer.';
      }

      // OpenAI (optional)
      if (keysToValidate.openai.trim() && !keysToValidate.openai.startsWith('sk-')) {
          newErrors.openai = 'Invalid format. OpenAI keys usually start with "sk-".';
      } else if (keysToValidate.openai.trim() && keysToValidate.openai.length < 40) {
        newErrors.openai = 'Invalid format. OpenAI keys are typically much longer.';
      }

      // eBay (optional)
      if (keysToValidate.ebay.trim() && keysToValidate.ebay.length < 20) {
        newErrors.ebay = 'Invalid format. Key seems too short.';
      }

      // X.com (optional)
      if (keysToValidate.x.trim() && keysToValidate.x.length < 25) {
        newErrors.x = 'Invalid format. Key seems too short.';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0; // Returns true if no errors
    };


  const handleSave = async () => {
    setVerificationError(null);

    const isClientValid = validateKeys(keys);
    if (!isClientValid) {
        return; // Stop if local validation fails
    }

    if (keys.gemini) {
        setIsVerifying(true);
        const verificationResult = await verifyApiKey(keys.gemini);
        setIsVerifying(false);

        if (!verificationResult.success) {
            setVerificationError(verificationResult.message || "An unknown verification error occurred.");
            return;
        }
    }
    
    onSave(keys);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const keyId = id as keyof ApiKeys;
    setKeys(prevKeys => ({ ...prevKeys, [keyId]: value }));
    // Clear specific error on change
    if (errors[keyId]) {
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[keyId];
          return newErrors;
        });
    }
     if (keyId === 'gemini') {
        setVerificationError(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="settings-modal-title" className="text-xl font-bold">API Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Close settings">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4 pt-5">
           <div>
            <label htmlFor="gemini" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Google Gemini API Key <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
                <input
                  type={visibility.gemini ? 'text' : 'password'}
                  id="gemini"
                  value={keys.gemini}
                  onChange={handleChange}
                  placeholder="Enter your Gemini API key"
                  className={`block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${errors.gemini || verificationError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                <button type="button" onClick={() => toggleVisibility('gemini')} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" aria-label={visibility.gemini ? 'Hide key' : 'Show key'}>
                    {visibility.gemini ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
            </div>
            {errors.gemini && <p className="mt-1 text-xs text-red-500">{errors.gemini}</p>}
            {verificationError && !errors.gemini && <p className="mt-1 text-xs text-red-500">{verificationError}</p>}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Required for all AI listing generation.</p>
          </div>
           <div>
            <label htmlFor="openai" className="block text-sm font-medium text-gray-700 dark:text-gray-300">OpenAI (ChatGPT) API Key</label>
            <div className="relative mt-1">
                <input
                  type={visibility.openai ? 'text' : 'password'}
                  id="openai"
                  value={keys.openai}
                  onChange={handleChange}
                  placeholder="Enter your OpenAI API key"
                  className={`block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${errors.openai ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                />
                <button type="button" onClick={() => toggleVisibility('openai')} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" aria-label={visibility.openai ? 'Hide key' : 'Show key'}>
                    {visibility.openai ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
            </div>
             {errors.openai && <p className="mt-1 text-xs text-red-500">{errors.openai}</p>}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Optional, for future use with ChatGPT models.</p>
          </div>
           <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
               <div>
                <label htmlFor="ebay" className="block text-sm font-medium text-gray-700 dark:text-gray-300">eBay API Key</label>
                <div className="relative mt-1">
                    <input
                      type={visibility.ebay ? 'text' : 'password'}
                      id="ebay"
                      value={keys.ebay}
                      onChange={handleChange}
                      placeholder="Enter your eBay API key"
                      className={`block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${errors.ebay ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    />
                    <button type="button" onClick={() => toggleVisibility('ebay')} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" aria-label={visibility.ebay ? 'Hide key' : 'Show key'}>
                        {visibility.ebay ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                </div>
                 {errors.ebay && <p className="mt-1 text-xs text-red-500">{errors.ebay}</p>}
                 <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Optional, for fetching real-time pricing data.</p>
              </div>
              <div>
                <label htmlFor="x" className="block text-sm font-medium text-gray-700 dark:text-gray-300">X.com (Twitter) API Key</label>
                <div className="relative mt-1">
                    <input
                      type={visibility.x ? 'text' : 'password'}
                      id="x"
                      value={keys.x}
                      onChange={handleChange}
                      placeholder="Enter your X.com API key"
                      className={`block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${errors.x ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    />
                    <button type="button" onClick={() => toggleVisibility('x')} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" aria-label={visibility.x ? 'Hide key' : 'Show key'}>
                        {visibility.x ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                </div>
                 {errors.x && <p className="mt-1 text-xs text-red-500">{errors.x}</p>}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Optional, for posting listings directly to X.com.</p>
              </div>
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
            className="bg-primary hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md transition flex items-center justify-center min-w-[110px]"
            onClick={handleSave}
            disabled={isVerifying}
          >
            {isVerifying ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                </>
            ) : 'Save Keys'}
          </button>
        </div>
      </div>
    </div>
  );
};