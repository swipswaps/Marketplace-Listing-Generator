import React from 'react';

export enum Platform {
  Ebay = 'Ebay',
  Facebook = 'Facebook',
  Craigslist = 'Craigslist',
  X = 'X',
}

export interface PlatformInfo {
  id: Platform;
  name: string;
  icon: JSX.Element;
}

export interface GeneratedListing {
  itemName: string;
  suggestedPrice: string;
  listing: {
    title: string;
    description: string;
    tags?: string[];
  };
}

export interface ImageFile {
  base64: string;
  mimeType: string;
  name: string;
}

export interface HistoryItem {
  id: number;
  platform: Platform;
  input: {
    text: string;
    image: ImageFile | null;
  };
  listingData: GeneratedListing;
  timestamp: string;
}