'use client';

import React, { useState, useMemo, useEffect } from 'react';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header/Header';
import { AccessibilityFilters } from '@/components/filters/AccessibilityFilters';
import { WayinMap } from '@/components/map/WayinMap';
import { PlacePreviewCard } from '@/components/place/PlacePreviewCard';
import { MapControls } from '@/components/map/MapControls';
import { MapLegend } from '@/components/map/MapLegend';
import { fetchPlaces } from '@/lib/supabase';
import { supabase, fetchPlaces } from '@/lib/supabase';
import { MOCK_PLACES } from '@/lib/mock-data';
import { FilterType, Place } from '@/types';
import { Info, MapPin } from 'lucide-react';

export default function ExplorePage() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>(MOCK_PLACES);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(
    null // Set once places load, to match the Figma initial state
  );
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isCardVisible, setIsCardVisible] = useState(true);

  // Load places from Supabase; fetchPlaces() already falls back to the
  // fictional mock dataset on error, empty tables, or a stale seed.
  // Map action triggers
  const [zoomAction, setZoomAction] = useState<number>(0);
  const [recenterAction, setRecenterAction] = useState<number>(0);
  const [flyToCoordinates, setFlyToCoordinates] = useState<{ lng: number; lat: number; ts: number } | null>(null);

  const loadPlaces = useCallback(async () => {
    try {
      const data = await fetchPlaces();
      const nextPlaces = data.length > 0 ? data : MOCK_PLACES;
      setPlaces(nextPlaces);
      setSelectedPlaceId((currentId) => {
        if (currentId && nextPlaces.some((p) => p.id === currentId)) {
          return currentId;
        }
        return nextPlaces[0]?.id ?? null;
      });
    } catch {
      setPlaces(MOCK_PLACES);
      setSelectedPlaceId(MOCK_PLACES[0]?.id ?? null);
    } finally {
      setIsLoadingPlaces(false);
    }
  }, []);

  // Initial load + Supabase Realtime subscription
  useEffect(() => {
    let isMounted = true;
    async function loadPlaces() {
      try {
        const data = await fetchPlaces();
        if (!isMounted) return;
        const nextPlaces = data.length > 0 ? data : MOCK_PLACES;
        setPlaces(nextPlaces);
        setSelectedPlaceId(nextPlaces[0]?.id ?? null);
      } catch {
        if (!isMounted) return;
        setPlaces(MOCK_PLACES);
        setSelectedPlaceId(MOCK_PLACES[0]?.id ?? null);
      } finally {
        if (isMounted) setIsLoadingPlaces(false);
      }
    }
    loadPlaces();

    // Listen to live database changes from Supabase (INSERT, UPDATE, DELETE)
    const channel = supabase
      .channel('wayin-realtime-places')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'places' },
        () => {
          loadPlaces();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'access_points' },
        () => {
          loadPlaces();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);
  }, [loadPlaces]);

  // Map action triggers
  const [zoomAction, setZoomAction] = useState<number>(0);
  const [recenterAction, setRecenterAction] = useState<number>(0);
  const handleGeocodedPlace = (name: string, coordinates: [number, number], _address: string) => {
    setSearchQuery(name);
    setFlyToCoordinates({ lng: coordinates[0], lat: coordinates[1], ts: Date.now() });
  };

  // Filter places based on search and accessibility feature
  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        selectedFilter === 'all' ||
        place.primaryFeatures.includes(selectedFilter) ||
        place.accessPoints.some((ap) => ap.type === selectedFilter);

      return matchesSearch && matchesFilter;
    });
  }, [places, searchQuery, selectedFilter]);

  const selectedPlace = useMemo(() => {
    if (!selectedPlaceId) return null;
    return places.find((p) => p.id === selectedPlaceId) || null;
  }, [places, selectedPlaceId]);

  // Hide the preview card when the selected place is filtered out of the results
  const isSelectedPlaceVisible = useMemo(() => {
    if (!selectedPlace) return false;
    return filteredPlaces.some((p) => p.id === selectedPlace.id);
  }, [filteredPlaces, selectedPlace]);

  const handleSelectPlace = (place: Place) => {
    setSelectedPlaceId(place.id);
    setIsCardVisible(true);
  };

  const handleZoomIn = () => {
    setZoomAction((prev) => (prev > 0 ? prev + 1 : 1));
  };

  const handleZoomOut = () => {
    setZoomAction((prev) => (prev < 0 ? prev - 1 : -1));
  };

  const handleRecenter = () => {
    setRecenterAction((prev) => prev + 1);
  };

  const handleViewDetails = (placeId: string) => {
    router.push(`/place/${placeId}`);
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50 text-gray-900 font-sans antialiased">
      {/* Top Header Navigation */}
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      {/* Top Header Navigation with Autocomplete */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectGeocodedPlace={handleGeocodedPlace}
      />

      {/* Main Map Viewport */}
      <main className="relative flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden">
        {/* Full-screen Mapbox / Interactive Canvas */}
        <WayinMap
          places={filteredPlaces}
          selectedPlace={selectedPlace}
          onSelectPlace={handleSelectPlace}
          zoomAction={zoomAction}
          recenterAction={recenterAction}
          flyToCoordinates={flyToCoordinates}
        />

        {/* Floating Accessibility Filter Bar */}
        <div className="absolute top-4 left-4 sm:left-6 z-20 max-w-[calc(100vw-6.5rem)] sm:max-w-2xl">
          <AccessibilityFilters
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />
        </div>

        {/* Floating Map Controls (Zoom in/out, Recenter) */}
        <div className="absolute top-4 right-4 sm:right-6 z-20">
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRecenter={handleRecenter}
          />
        </div>

        {/* Floating Map Legend (Bottom Right) */}
        <div className="absolute bottom-6 right-6 z-20 hidden md:flex">
          <MapLegend />
        </div>

        {/* Loading Places Badge */}
        {isLoadingPlaces && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md text-xs sm:text-sm font-medium text-gray-700">
            <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
            <span>Loading places&hellip;</span>
            <span>Memuat tempat&hellip;</span>
          </div>
        )}

        {/* No Results Floating Badge */}
        {!isLoadingPlaces && filteredPlaces.length === 0 && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md text-xs sm:text-sm font-medium text-gray-700">
            <Info className="h-4 w-4 text-blue-600 shrink-0" />
            <span>
              No places found matching &ldquo;{searchQuery}&rdquo;. Try another
              search or filter.
              Tidak ada tempat yang cocok dengan &ldquo;{searchQuery}&rdquo;.
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="ml-2 font-bold text-blue-600 hover:text-blue-800 underline"
            >
              Reset
            </button>
          </div>
        )}

        {/* Floating Place Preview Card (Bottom Left on Desktop, Sheet on Mobile) */}
        {isCardVisible && isSelectedPlaceVisible && selectedPlace && (
          <div className="absolute bottom-0 left-0 right-0 sm:bottom-6 sm:left-6 sm:right-auto z-20 p-3 sm:p-0">
            <PlacePreviewCard
              place={selectedPlace}
              onClose={() => setIsCardVisible(false)}
              onViewDetails={handleViewDetails}
            />
          </div>
        )}

        {/* Re-open Card Pill if Dismissed */}
        {!isCardVisible && isSelectedPlaceVisible && selectedPlace && (
          <button
            type="button"
            onClick={() => setIsCardVisible(true)}
            className="absolute bottom-6 left-6 z-20 flex items-center gap-2 rounded-full border border-gray-200 bg-white/95 px-4 py-2 text-xs sm:text-sm font-bold text-gray-800 shadow-xl backdrop-blur-md hover:bg-gray-50 active:scale-98 transition-all"
          >
            <MapPin className="h-4 w-4 text-blue-600" />
            <span>Show {selectedPlace.name}</span>
            <span>Tampilkan {selectedPlace.name}</span>
          </button>
        )}
      </main>
    </div>
  );
}
}