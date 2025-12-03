import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, MapPin, Star, Filter, Volume2, X, Menu, DollarSign } from 'lucide-react';
import { InteractiveMap } from '../components/InteractiveMap';
import { PaymentModal } from '../components/PaymentModal';
import { Attraction, GPSPosition, MapViewport, SearchFilters, Category } from '../types';
import { icpService } from '../services/icpService';
import { useGPS } from '../hooks/useGPS';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_VIEWPORT: MapViewport = {
  latitude: 44.5387,
  longitude: 18.6766,
  zoom: 13,
};

export const HomePage: React.FC = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [filteredAttractions, setFilteredAttractions] = useState<Attraction[]>([]);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<MapViewport>(DEFAULT_VIEWPORT);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { position: userPosition, loading: gpsLoading, error: gpsError } = useGPS();
  const { isAuthenticated } = useAuth();

  // Initialize ICP service
  useEffect(() => {
    const initializeService = async () => {
      try {
        await icpService.initialize();
        loadAttractions();
      } catch (err) {
        console.error('Failed to initialize:', err);
        setError('Failed to connect to the blockchain');
        setLoading(false);
      }
    };

    initializeService();
  }, []);

  // Load attractions
  const loadAttractions = async () => {
    try {
      setLoading(true);
      const data = await icpService.getAttractions();
      setAttractions(data);
      setFilteredAttractions(data);
    } catch (err) {
      console.error('Failed to load attractions:', err);
      setError('Failed to load attractions');
    } finally {
      setLoading(false);
    }
  };

  // Update attractions with distance when user position changes
  useEffect(() => {
    if (userPosition && attractions.length > 0) {
      const attractionsWithDistance = icpService.addDistanceToAttractions(
        attractions,
        userPosition
      );
      setAttractions(attractionsWithDistance);
    }
  }, [userPosition, attractions.length]);

  // Search and filter attractions
  useEffect(() => {
    let filtered = attractions;

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(attraction => 
        attraction.name.toLowerCase().includes(query) ||
        attraction.description.toLowerCase().includes(query) ||
        attraction.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(attraction => 
        attraction.category === filters.category
      );
    }

    // Language filter
    if (filters.language) {
      filtered = filtered.filter(attraction => 
        attraction.languages.includes(filters.language!)
      );
    }

    // Price filter
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(attraction => 
        attraction.price <= filters.maxPrice!
      );
    }

    // Rating filter
    if (filters.minRating !== undefined) {
      filtered = filtered.filter(attraction => 
        attraction.rating >= filters.minRating!
      );
    }

    setFilteredAttractions(filtered);
  }, [searchQuery, filters, attractions]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredAttractions(attractions);
      return;
    }

    try {
      setLoading(true);
      const results = await icpService.searchAttractions(searchQuery, filters);
      setFilteredAttractions(results);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (attraction: Attraction) => {
    setSelectedAttraction(attraction);
    setShowPayment(true);
  };

  const categories: { value: Category; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: '🏛️' },
    { value: 'museum', label: 'Museums', icon: '🎨' },
    { value: 'restaurant', label: 'Restaurants', icon: '🍽️' },
    { value: 'natural', label: 'Nature', icon: '🌿' },
    { value: 'historical', label: 'Historical', icon: '🏰' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'bs', label: 'Bosnian' },
    { value: 'de', label: 'German' },
    { value: 'hr', label: 'Croatian' },
    { value: 'sr', label: 'Serbian' },
  ];

  const renderSidebar = () => (
    <div className={`bg-white shadow-lg transition-all duration-300 ${
      sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
    }`}>
      <div className="p-6 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tuzla Guide</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search attractions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
            >
              Search
            </button>
          </div>
        </div>

        {/* Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors mb-4"
        >
          <Filter size={16} />
          <span>Filters</span>
        </button>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            {/* Categories */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category || 'all'}
                onChange={(e) => setFilters({ ...filters, category: e.target.value as Category })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Languages */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={filters.language || ''}
                onChange={(e) => setFilters({ ...filters, language: e.target.value || undefined })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Languages</option>
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price: ${filters.maxPrice ? (filters.maxPrice / 100).toFixed(2) : 'Any'}
              </label>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={filters.maxPrice || 5000}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  maxPrice: parseInt(e.target.value) === 5000 ? undefined : parseInt(e.target.value) 
                })}
                className="w-full"
              />
            </div>

            {/* Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Rating: {filters.minRating || 'Any'}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minRating || 5}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  minRating: parseFloat(e.target.value) === 5 ? undefined : parseFloat(e.target.value) 
                })}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
            <p className="text-gray-600">Loading...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Attractions List */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredAttractions.map(attraction => (
              <div
                key={attraction.id}
                className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedAttraction?.id === attraction.id ? 'border-blue-500 shadow-md' : 'border-gray-200'
                }`}
                onClick={() => setSelectedAttraction(attraction)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 flex-1">{attraction.name}</h3>
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span>{attraction.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {attraction.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-gray-600">
                      {attraction.distance ? `${attraction.distance.toFixed(1)} km` : 'Distance unknown'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {attraction.price === 0 ? 'Free' : `$${(attraction.price / 100).toFixed(2)}`}
                    </span>
                    {attraction.price > 0 && isAuthenticated && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePayment(attraction);
                        }}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                      >
                        Pay
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Volume2 size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {attraction.languages.length} languages
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    {attraction.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredAttractions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No attractions found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      {renderSidebar()}

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Toggle sidebar button for desktop */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:block absolute top-4 left-4 z-10 bg-white p-2 rounded-lg shadow-md hover:bg-gray-50"
        >
          <Menu size={20} />
        </button>

        {/* Map */}
        <InteractiveMap
          attractions={filteredAttractions}
          userPosition={userPosition}
          selectedAttraction={selectedAttraction}
          onAttractionSelect={setSelectedAttraction}
          onViewportChange={setViewport}
          viewport={viewport}
          showUserLocation={true}
          interactive={true}
        />

        {/* GPS Status */}
        {gpsLoading && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin h-4 w-4 border-b-2 border-blue-500 rounded-full" />
              Getting location...
            </div>
          </div>
        )}

        {gpsError && (
          <div className="absolute top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <MapPin size={16} />
              {gpsError}
            </div>
          </div>
        )}

        {userPosition && (
          <div className="absolute top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <MapPin size={16} />
              Location: {userPosition.latitude.toFixed(4)}, {userPosition.longitude.toFixed(4)}
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        attraction={selectedAttraction}
      />
    </div>
  );
};