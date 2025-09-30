
import React from 'react';
import { Platform, PlatformInfo } from './types';

export const PLATFORMS: PlatformInfo[] = [
  {
    id: Platform.Ebay,
    name: 'eBay',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.2 15.15c-.6.35-1.3.55-2.05.55-1.55 0-2.8-1.25-2.8-2.8s1.25-2.8 2.8-2.8c.75 0 1.45.25 2.05.55l.85-1.5c-.8-.5-1.75-.8-2.75-.8-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5c1.05 0 2-.35 2.75-.85l-.85-1.55zm4.8-1.55c.3.55.45 1.15.45 1.8 0 1.95-1.55 3.5-3.5 3.5s-3.5-1.55-3.5-3.5c0-.65.2-1.25.45-1.8H12l-1.1 2h2.2l-1.1 2 2.3-4H15.6zm2.4-5.6H9.4l1.1-2h6.6l-1.1 2z" />
      </svg>
    ),
  },
  {
    id: Platform.Facebook,
    name: 'Facebook Marketplace',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.14 10.24h-1.6v6.2h-3.03v-6.2H8.87V8.47h1.64V7.1c0-1.25.62-2.23 2.23-2.23h1.86v1.77h-1.1c-.48 0-.58.23-.58.57v1.26h1.7l-.23 1.77z" />
      </svg>
    ),
  },
  {
    id: Platform.Craigslist,
    name: 'Craigslist',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2.83-6.41l1.41 1.41L12 13.41l1.41 1.41 1.41-1.41L13.41 12l1.41-1.41-1.41-1.41L12 10.59l-1.41-1.41-1.41 1.41L10.59 12l-1.41 1.41z" />
      </svg>
    ),
  },
  {
    id: Platform.X,
    name: 'X.com (Twitter)',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];
