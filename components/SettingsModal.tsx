import React, { useState, useEffect } from 'react';
import { ApiKeys } from '../types';
import { verifyApiKey as verifyGeminiApiKey } from '../services/geminiService';
import { verifyApiKey as verifyOpenAiApiKey } from '../services/openaiService';
import { verifyApiKey as verifyEbayApiKey } from '../services/ebayService';
import { verifyApiKey as verifyXApiKey } from '../services/xService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: ApiKeys) => void;
  initialKeys: ApiKeys;
}

// Helper Icon Components
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
const SpinnerIcon: React.FC = () => (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-500">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
);
const ExclamationIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-500">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
);


type VerificationStatus = 'idle' | 'loading' | 'success' | 'error';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialKeys }) => {
  const [keys, setKeys] = useState<ApiKeys>(initialKeys);
  const [visibility, setVisibility] = useState({ gemini: false, openai: false, ebay: false, x: false });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ApiKeys, string>>>({});
  
  const [verificationStatus, setVerificationStatus] = useState<Record<keyof ApiKeys, VerificationStatus>>({
    gemini: 'idle', openai: 'idle', ebay: 'idle', x: 'idle'
  });
  const [verificationMessages, setVerificationMessages] = useState<Record<keyof ApiKeys, string | null>>({
    gemini: null, openai: null, ebay: null, x: null
  });


  useEffect(() => {
    if (isOpen) {
      setKeys(initialKeys);
      setVisibility({ gemini: false, openai: false, ebay: false, x: false });
      setSaveError(null);
      setIsSaving(false);
      setErrors({});
      setVerificationStatus({ gemini: 'idle', openai: 'idle', ebay: 'idle', x: 'idle' });
      setVerificationMessages({ gemini: null, openai: null, ebay: null, x: null });
    }
  }, [initialKeys, isOpen]);

  if (!isOpen) {
    return null;
  }

  const toggleVisibility = (key: keyof typeof visibility) => {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const validateKeyFormat = (keyName: keyof ApiKeys, value: string): string | null => {
      switch (keyName) {
          case 'gemini':
              if (!value.trim()) return 'Gemini API key is required.';
              if (value.length < 35) return 'Invalid format. Gemini keys are typically longer.';
              break;
          case 'openai':
              if (value.trim() && !value.startsWith('sk-')) return 'Invalid format. OpenAI keys must start with "sk-".';
              if (value.trim() && value.length < 40) return 'Invalid format. Key is too short for an OpenAI key.';
              break;
          case 'ebay':
              if (value.trim() && value.length < 20) return 'Invalid format. Key seems too short.';
              break;
          case 'x':
              if (value.trim() && value.length < 25) return 'Invalid format. Key seems too short.';
              break;
      }
      return null;
  };

  const handleVerify = async (keyName: keyof ApiKeys) => {
    const keyToVerify = keys[keyName].trim();
    setSaveError(null); // Clear main save error
    setErrors(prev => ({...prev, [keyName]: undefined})); // Clear format error

    const formatError = validateKeyFormat(keyName, keyToVerify);
    if (formatError) {
        setVerificationStatus(prev => ({ ...prev, [keyName]: 'error' }));
        setVerificationMessages(prev => ({ ...prev, [keyName]: formatError }));
        return;
    }

    setVerificationStatus(prev => ({ ...prev, [keyName]: 'loading' }));
    setVerificationMessages(prev => ({ ...prev, [keyName]: null }));

    let result: { success: boolean, message?: string };
    try {
        switch (keyName) {
            case 'gemini': result = await verifyGeminiApiKey(keyToVerify); break;
            case 'openai': result = await verifyOpenAiApiKey(keyToVerify); break;
            case 'ebay': result = await verifyEbayApiKey(keyToVerify); break;
            case 'x': result = await verifyXApiKey(keyToVerify); break;
            default: result = { success: false, message: 'Verification not implemented.' };
        }

        if (result.success) {
            setVerificationStatus(prev => ({ ...prev, [keyName]: 'success' }));
        } else {
            setVerificationStatus(prev => ({ ...prev, [keyName]: 'error' }));
            setVerificationMessages(prev => ({ ...prev, [keyName]: result.message || 'Verification failed.' }));
        }
    } catch (error) {
        setVerificationStatus(prev => ({ ...prev, [keyName]: 'error' }));
        setVerificationMessages(prev => ({ ...prev, [keyName]: 'An unexpected client-side error occurred.' }));
    }
};

  const handleSave = async () => {
    setSaveError(null);
    const geminiFormatError = validateKeyFormat('gemini', keys.gemini);
    if (geminiFormatError) {
        setErrors({ gemini: geminiFormatError });
        return;
    }

    if (keys.gemini) {
        setIsSaving(true);
        const verificationResult = await verifyGeminiApiKey(keys.gemini);
        setIsSaving(false);

        if (!verificationResult.success) {
            setSaveError(verificationResult.message || "An unknown verification error occurred.");
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
    
    // Clear validation/error states on change
    setVerificationStatus(prev => ({...prev, [keyId]: 'idle'}));
    setVerificationMessages(prev => ({...prev, [keyId]: null}));
    if (errors[keyId]) {
        setErrors(prevErrors => ({ ...prevErrors, [keyId]: undefined }));
    }
     if (keyId === 'gemini') {
        setSaveError(null);
    }
  };

  const renderInput = (keyName: keyof ApiKeys, label: string, isRequired: boolean, helpText: string) => {
      const combinedError = errors[keyName] || verificationMessages[keyName] || (keyName === 'gemini' ? saveError : null);
      return (
          <div>
            <label htmlFor={keyName} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <div className="relative mt-1 flex items-center gap-2">
                <div className="relative flex-grow">
                    <input
                      type={visibility[keyName] ? 'text' : 'password'}
                      id={keyName}
                      value={keys[keyName]}
                      onChange={handleChange}
                      placeholder={`Enter your ${label}`}
                      className={`block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${combinedError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    />
                    <button type="button" onClick={() => toggleVisibility(keyName)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" aria-label={visibility[keyName] ? 'Hide key' : 'Show key'}>
                        {visibility[keyName] ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                </div>
                <button
                    type="button"
                    onClick={() => handleVerify(keyName)}
                    disabled={!keys[keyName] || verificationStatus[keyName] === 'loading'}
                    className="px-3 py-2 text-sm font-semibold rounded-md transition-colors border text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {verificationStatus[keyName] === 'loading' ? <SpinnerIcon /> : 'Verify'}
                </button>
                <div className="w-5 h-5 flex-shrink-0">
                    {verificationStatus[keyName] === 'success' && <CheckIcon />}
                    {verificationStatus[keyName] === 'error' && <ExclamationIcon />}
                </div>
            </div>
            {combinedError && <p className="mt-1 text-xs text-red-500">{combinedError}</p>}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
          </div>
      );
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
           {renderInput('gemini', 'Google Gemini API Key', true, 'Required for all AI listing generation.')}
           {renderInput('openai', 'OpenAI (ChatGPT) API Key', false, 'Optional, for future use with ChatGPT models.')}
           <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
              {renderInput('ebay', 'eBay API Key', false, 'Optional, for fetching real-time pricing data.')}
              {renderInput('x', 'X.com (Twitter) API Key', false, 'Optional, for posting listings directly to X.com.')}
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
            disabled={isSaving}
          >
            {isSaving ? (
                <>
                    <SpinnerIcon />
                    <span className="ml-2">Verifying...</span>
                </>
            ) : 'Save Keys'}
          </button>
        </div>
      </div>
    </div>
  );
};
