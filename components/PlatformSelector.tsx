
import React from 'react';
import { Platform, PlatformInfo } from '../types';
import { PLATFORMS } from '../constants';

interface PlatformSelectorProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatform,
  onPlatformChange,
}) => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
        1. Choose a Platform
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PLATFORMS.map((platform: PlatformInfo) => (
          <button
            key={platform.id}
            onClick={() => onPlatformChange(platform.id)}
            className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all duration-200 ${
              selectedPlatform === platform.id
                ? 'border-primary dark:border-secondary bg-blue-50 dark:bg-blue-900/50'
                : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-secondary'
            }`}
          >
            <span className={`mb-2 ${selectedPlatform === platform.id ? 'text-primary dark:text-secondary' : 'text-gray-600 dark:text-gray-300'}`}>
                {platform.icon}
            </span>
            <span className={`text-sm font-medium text-center ${selectedPlatform === platform.id ? 'text-primary dark:text-secondary' : 'text-gray-600 dark:text-gray-300'}`}>
              {platform.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
