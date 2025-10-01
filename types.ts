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
  // Fix: Use React.ReactElement instead of JSX.Element to resolve namespace issue.
  icon: React.ReactElement;
}

export interface PriceAnalysis {
  range: string;
  analysis: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface GeneratedListing {
  itemName: string;
  suggestedPrice: PriceAnalysis;
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

// This interface now uses a generic for suggestedPrice to handle legacy string-based prices from localStorage
export interface HistoryListing extends Omit<GeneratedListing, 'suggestedPrice'> {
    suggestedPrice: PriceAnalysis | string;
}

export interface HistoryItem {
  id: number;
  platform: Platform;
  input: {
    text: string;
    image: ImageFile | null;
  };
  listingData: HistoryListing;
  timestamp: string;
}


export interface ApiKeys {
  ebay: string;
  x: string;
  gemini: string;
  openai: string;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
}
