import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Map, { 
  Marker, 
  Popup, 
  NavigationControl, 
  FullscreenControl, 
  ScaleControl,
  GeolocateControl
} from 'react-map-gl';
import { MapPin, Navigation, Volume2, Star, DollarSign, Globe } from 'lucide-react';
import { Attraction, GPSPosition, MapViewport } from '../types';
import { useAudio } from '../hooks/useAudio';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGVmYXVsdC11c2VyIiwiYSI6ImNsczR5aXBxZzA0Z3cya3FqZ3JqZzZ4Z2gifQ.1234567890abcdef';

interface InteractiveMapProps {
  attractions: Attraction[];
  userPosition: GPSPosition | null;
  selectedAttraction: Attraction | null;
  onAttractionSelect: (attraction: Attraction | null) => void;
  onViewportChange: (viewport: MapViewport) => void;
  viewport: MapViewport;
  showUserLocation?: boolean;
  interactive?: boolean;
}

interface MarkerData {
  attraction: Attraction;
  isSelected: boolean;
  isNearby: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  attractions,
  userPosition,
  selectedAttraction,
  onAttractionSelect,
  onViewportChange,
  viewport,
  showUserLocation = true,
  interactive = true,
}) => {
  const [hoveredAttraction, setHoveredAttraction] = useState<Attraction | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [audioGuidePlaying, setAudioGuidePlaying] = useState<number | null>(null);
  
  const audio = useAudio();

  const markers = useMemo<MarkerData[]>(() => {
    return attractions.map(attraction => ({
      attraction,
      isSelected: selectedAttraction?.id === attraction.id,
      isNearby: userPosition ? 
        (attraction.distance || 0) < 1.0 : // Within 1km
        false,
    }));
  }, [attractions, selectedAttraction, userPosition]);

  const handleMarkerClick = useCallback((attraction: Attraction) => {
    onAttractionSelect(attraction);
    setShowPopup(true);
  }, [onAttractionSelect]);

  const handleMapClick = useCallback((event: any) => {
    if (event.originalEvent.target.closest('.map-marker')) return;
    onAttractionSelect(null);
    setShowPopup(false);
  }, [onAttractionSelect]);

  const toggleAudioGuide = useCallback((attraction: Attraction) => {
    if (audioGuidePlaying === attraction.id) {
      audio.stop();
      setAudioGuidePlaying(null);
    } else {
      audio.load(attraction.audioUrl);
      audio.play();
      setAudioGuidePlaying(attraction.id);
    }
  }, [audio, audioGuidePlaying]);

  const getMarkerColor = (marker: MarkerData): string => {
    if (marker.isSelected) return '#0ea5e9'; // Primary blue
    if (marker.isNearby) return '#22c55e'; // Green for nearby
    return '#f59e0b'; // Yellow for others
  };

  const renderMarker = (marker: MarkerData) => {
    const { attraction, isSelected, isNearby } = marker;
    const color = getMarkerColor(marker);
    
    return (
      <Marker
        key={attraction.id}
        longitude={attraction.location.longitude}
        latitude={attraction.location.latitude}
        anchor="bottom"
        onClick={() => handleMarkerClick(attraction)}
        onMouseEnter={() => setHoveredAttraction(attraction)}
        onMouseLeave={() => setHoveredAttraction(null)}
      >
        <div 
          className={`map-marker cursor-pointer transition-all duration-200 ${isSelected ? 'scale-125' : 'hover:scale-110'}`}
          style={{ transformOrigin: 'bottom center' }}
        >
          <div 
            className="relative w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
            style={{ backgroundColor: color }}
          >
            <MapPin size={16} />
            
            {/* Pulse animation for nearby attractions */}
            {isNearby && !isSelected && (
              <div 
                className="absolute inset-0 rounded-full animate-ping"
                style={{ backgroundColor: color, opacity: 0.3 }}
              />
            )}
            
            {/* Selection ring */}
            {isSelected && (
              <div 
                className="absolute inset-0 rounded-full border-4 animate-pulse"
                style={{ borderColor: color }}
              />
            )}
          </div>
          
          {/* Category indicator */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-2 py-1 text-xs font-medium shadow-md whitespace-nowrap">
            {attraction.category}
          </div>
        </div>
      </Marker>
    );
  };

  const renderPopup = () => {
    if (!showPopup || !selectedAttraction) return null;

    return (
      <Popup
        longitude={selectedAttraction.location.longitude}
        latitude={selectedAttraction.location.latitude}
        anchor="top"
        closeButton={true}
        closeOnClick={false}
        onClose={() => {
          setShowPopup(false);
          onAttractionSelect(null);
        }}
        className="!max-w-sm"
      >
        <div className="bg-white rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                {selectedAttraction.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-current" />
                  <span>{selectedAttraction.rating.toFixed(1)}</span>
                </div>
                {selectedAttraction.distance && (
                  <div className="flex items-center gap-1">
                    <Navigation size={14} />
                    <span>{selectedAttraction.distance.toFixed(1)} km</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Audio guide button */}
            <button
              onClick={() => toggleAudioGuide(selectedAttraction)}
              className={`p-2 rounded-full transition-colors ${
                audioGuidePlaying === selectedAttraction.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title="Toggle audio guide"
            >
              <Volume2 size={16} />
            </button>
          </div>

          <p className="text-sm text-gray-700 mb-3 line-clamp-3">
            {selectedAttraction.description}
          </p>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign size={14} className="text-green-600" />
              <span className="font-semibold">
                {selectedAttraction.price === 0 ? 'Free' : `$${(selectedAttraction.price / 100).toFixed(2)}`}
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Globe size={14} />
              <span>{selectedAttraction.languages.length} languages</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => toggleAudioGuide(selectedAttraction)}
              className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              {audioGuidePlaying === selectedAttraction.id ? 'Stop Guide' : 'Start Audio Guide'}
            </button>
          </div>
        </div>
      </Popup>
    );
  };

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      <Map
        {...viewport}
        onMove={(evt) => onViewportChange(evt.viewState)}
        onClick={handleMapClick}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        interactive={interactive}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Controls */}
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <ScaleControl position="bottom-left" />
        
        {showUserLocation && (
          <GeolocateControl 
            position="top-right" 
            trackUserLocation={true}
            showUserHeading={true}
          />
        )}

        {/* User location marker */}
        {userPosition && (
          <Marker
            longitude={userPosition.longitude}
            latitude={userPosition.latitude}
            anchor="center"
          >
            <div className="relative">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
              <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-30" />
            </div>
          </Marker>
        )}

        {/* Attraction markers */}
        {markers.map(renderMarker)}

        {/* Popup */}
        {renderPopup()}
      </Map>

      {/* Loading state */}
      {!viewport && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 text-sm">
        <h4 className="font-semibold mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Attraction</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Nearby (1km)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
            <span>Your location</span>
          </div>
        </div>
      </div>
    </div>
  );
};