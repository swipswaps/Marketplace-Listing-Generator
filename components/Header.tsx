
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4">
      <div className="container mx-auto flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8 mr-3 text-primary"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 00-1.622 3.385m-5.043-.025a15.998 15.998 0 01-3.388 1.621m7.521-3.385a15.998 15.998 0 00-3.388-1.624m-1.623 3.385a15.998 15.998 0 01-1.622 3.385m3.388-1.624a15.998 15.998 0 013.388 1.621"
          />
        </svg>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          AI Marketplace Listing Generator
        </h1>
      </div>
    </header>
  );
};
