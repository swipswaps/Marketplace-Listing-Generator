import React, { useState, useCallback } from 'react';
import { ImageFile } from '../types';

interface InputAreaProps {
  text: string;
  onTextChange: (text: string) => void;
  image: ImageFile | null;
  onImageChange: (image: ImageFile | null) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const MAX_TEXT_LENGTH = 1500;

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove data:mime/type;base64, prefix
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const InputArea: React.FC<InputAreaProps> = ({
  text,
  onTextChange,
  image,
  onImageChange,
  onGenerate,
  isLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const base64 = await fileToBase64(file);
        onImageChange({ base64, mimeType: file.type, name: file.name });
      } else {
        alert("Please upload a valid image file.");
      }
    }
  }, [onImageChange]);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };
  
  const isTextTooLong = text.length > MAX_TEXT_LENGTH;
  const canGenerate = (text.trim().length > 0 || image) && !isLoading && !isTextTooLong;

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          2. Provide Product Details
        </h2>
        
        <div 
            className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-blue-50 dark:bg-blue-900/50' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
        >
            <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files)} />
            {image ? (
                <div className="flex flex-col items-center">
                    <img src={`data:${image.mimeType};base64,${image.base64}`} alt="preview" className="max-h-32 rounded-lg mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">{image.name}</p>
                    <button onClick={(e) => { e.stopPropagation(); onImageChange(null); }} className="mt-2 text-xs text-red-500 hover:text-red-700">Remove</button>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-300">Drag & drop an image here, or click to upload</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
                </div>
            )}
        </div>
        
        <div className="relative my-4 flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400 dark:text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        
        <div>
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Describe your item... (e.g., condition, brand, model)"
            rows={4}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent dark:bg-gray-700 dark:text-gray-200 transition-colors ${
              isTextTooLong
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-primary dark:focus:ring-secondary'
            }`}
            aria-describedby="text-feedback"
            aria-invalid={isTextTooLong}
          />
          <div id="text-feedback" className="flex justify-between items-center mt-1 text-xs">
            {isTextTooLong ? (
              <p className="text-red-500 font-medium">Description is too long.</p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Provide specific details for the best results.</p>
            )}
            <span className={isTextTooLong ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400'}>
              {text.length}/{MAX_TEXT_LENGTH}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        className="w-full flex items-center justify-center p-4 bg-primary text-white font-bold rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : '3. Generate Listing'}
      </button>
    </div>
  );
};