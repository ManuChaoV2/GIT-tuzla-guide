export interface Location {
  latitude: number;
  longitude: number;
}

export interface Attraction {
  id: number;
  name: string;
  description: string;
  location: Location;
  category: string;
  imageUrl: string;
  audioUrl: string;
  rating: number;
  price: number;
  languages: string[];
  tags: string[];
  createdAt: bigint;
  updatedAt: bigint;
  distance?: number;
}

export interface Review {
  id: number;
  attractionId: number;
  userId: string;
  rating: number;
  comment: string;
  photos: string[];
  createdAt: bigint;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  preferredLanguage: string;
  visitedAttractions: number[];
  favoriteAttractions: number[];
  totalSpent: number;
  createdAt: bigint;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  attractionId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  qrCodeData: string;
  createdAt: bigint;
}

export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface AudioGuide {
  id: number;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  language: string;
  attractionId: number;
}

export type Category = 'all' | 'museum' | 'restaurant' | 'natural' | 'historical' | 'shopping';

export type Language = 'en' | 'bs' | 'de' | 'hr' | 'sr';

export interface SearchFilters {
  category?: Category;
  language?: Language;
  maxPrice?: number;
  minRating?: number;
  tags?: string[];
}

export interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface CryptoPaymentOption {
  id: string;
  name: string;
  symbol: string;
  network: string;
  enabled: boolean;
  qrCode?: string;
}