import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { idlFactory as backendIdlFactory } from '../../declarations/backend/backend.did.js';
import { _SERVICE as BackendService } from '../../declarations/backend/backend.did';
import { Attraction, Review, PaymentTransaction, UserProfile, SearchFilters } from '../types';

const canisterId = process.env.NODE_ENV === 'development' 
  ? 'ryjl3-tyaaa-aaaaa-aaaba-cai'
  : 'your-backend-canister-id';

class ICPService {
  private backend: BackendService | null = null;
  private agent: HttpAgent | null = null;

  async initialize(authClient?: AuthClient) {
    try {
      const host = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:4943'
        : 'https://icp-api.io';

      if (authClient && await authClient.isAuthenticated()) {
        const identity = authClient.getIdentity();
        this.agent = new HttpAgent({
          host,
          identity,
        });
      } else {
        this.agent = new HttpAgent({ host });
      }

      if (process.env.NODE_ENV === 'development') {
        await this.agent.fetchRootKey();
      }

      this.backend = Actor.createActor(backendIdlFactory, {
        agent: this.agent,
        canisterId,
      });
    } catch (error) {
      console.error('Failed to initialize ICP service:', error);
      throw error;
    }
  }

  async getAttractions(): Promise<Attraction[]> {
    if (!this.backend) throw new Error('Service not initialized');
    return await this.backend.getAttractions();
  }

  async getAttraction(id: number): Promise<Attraction | null> {
    if (!this.backend) throw new Error('Service not initialized');
    const result = await this.backend.getAttraction(id);
    return result.length > 0 ? result[0] : null;
  }

  async searchAttractions(query: string, filters?: SearchFilters): Promise<Attraction[]> {
    if (!this.backend) throw new Error('Service not initialized');
    return await this.backend.searchAttractions(
      query,
      filters?.category || null,
      filters?.language || null
    );
  }

  async getReviews(attractionId: number): Promise<Review[]> {
    if (!this.backend) throw new Error('Service not initialized');
    return await this.backend.getReviews(attractionId);
  }

  async addReview(attractionId: number, rating: number, comment: string, photos: string[]): Promise<number> {
    if (!this.backend) throw new Error('Service not initialized');
    const result = await this.backend.addReview(attractionId, rating, comment, photos);
    
    if ('ok' in result) {
      return result.ok;
    } else {
      throw new Error(result.err);
    }
  }

  async createPayment(attractionId: number, amount: number, currency: string, paymentMethod: string): Promise<PaymentTransaction> {
    if (!this.backend) throw new Error('Service not initialized');
    const result = await this.backend.createPayment(attractionId, amount, currency, paymentMethod);
    
    if ('ok' in result) {
      return result.ok;
    } else {
      throw new Error(result.err);
    }
  }

  async updatePaymentStatus(paymentId: string, status: string): Promise<void> {
    if (!this.backend) throw new Error('Service not initialized');
    const result = await this.backend.updatePaymentStatus(paymentId, status);
    
    if ('err' in result) {
      throw new Error(result.err);
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    if (!this.backend) throw new Error('Service not initialized');
    const result = await this.backend.getUserProfile();
    return result.length > 0 ? result[0] : null;
  }

  async updateUserProfile(username: string, email: string, preferredLanguage: string): Promise<void> {
    if (!this.backend) throw new Error('Service not initialized');
    await this.backend.updateUserProfile(username, email, preferredLanguage);
  }

  // Utility functions for calculating distances
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Add distance to attractions based on user location
  addDistanceToAttractions(attractions: Attraction[], userLocation: { latitude: number; longitude: number }): Attraction[] {
    return attractions.map(attraction => ({
      ...attraction,
      distance: this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        attraction.location.latitude,
        attraction.location.longitude
      )
    }));
  }
}

export const icpService = new ICPService();