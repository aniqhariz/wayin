'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Place } from '@/types';
import { Accessibility, DoorOpen, Info } from 'lucide-react';
import { INDONESIA_DEFAULT_CENTER, INDONESIA_DEFAULT_ZOOM } from '@/lib/mock-data';

interface WayinMapProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  zoomAction?: number;
  recenterAction?: number;
  flyToCoordinates?: { lng: number; lat: number; ts: number } | null;
}

export function WayinMap({
  places,
  selectedPlace,
  onSelectPlace,
  zoomAction,
  recenterAction,
  flyToCoordinates,
}: WayinMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [hasMapboxError, setHasMapboxError] = useState(!mapboxToken);

  // Fallback interactive state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Handle external zoom controls
  useEffect(() => {
    if (zoomAction === undefined || zoomAction === 0) return;
    if (mapInstanceRef.current) {
      if (zoomAction > 0) mapInstanceRef.current.zoomIn();
      else mapInstanceRef.current.zoomOut();
    } else {
      setZoom((prev) => {
        const next = zoomAction > 0 ? prev + 0.2 : prev - 0.2;
        return Math.min(Math.max(next, 0.6), 2.5);
      });
    }
  }, [zoomAction]);

  // Handle external recenter control
  useEffect(() => {
    if (recenterAction === undefined || recenterAction === 0) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: selectedPlace ? selectedPlace.coordinates : INDONESIA_DEFAULT_CENTER,
        zoom: INDONESIA_DEFAULT_ZOOM,
        essential: true,
      });
    } else {
      setPan({ x: 0, y: 0 });
      setZoom(1);
    }
  }, [recenterAction, selectedPlace]);

  // Fly to a geocoded location from the search autocomplete
  useEffect(() => {
    if (!flyToCoordinates || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo({
      center: [flyToCoordinates.lng, flyToCoordinates.lat],
      zoom: 16,
      essential: true,
    });
  }, [flyToCoordinates]);

  // Keep the latest places/selection/callback in refs so marker rendering does
  // not have to be torn down and rebuilt on every parent render (which made
  // marker clicks land on detached elements and appear unresponsive).
  const placesRef = useRef(places);
  const selectedPlaceRef = useRef(selectedPlace);
  const onSelectPlaceRef = useRef(onSelectPlace);

  placesRef.current = places;
  selectedPlaceRef.current = selectedPlace;
  onSelectPlaceRef.current = onSelectPlace;

  // Render markers with inline styles (not Tailwind class strings — those get purged)
  const renderMapboxMarkers = useCallback(
    (map: any, mapboxgl: any) => {
      const currentPlaces = placesRef.current;
      const currentSelected = selectedPlaceRef.current;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      currentPlaces.forEach((place) => {
        const isSelected = currentSelected?.id === place.id;
        const el = document.createElement('div');
        el.style.cursor = 'pointer';
        el.style.transition = 'transform 0.15s ease';
        el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.12)'; });
        el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; });

        if (isSelected) {
          el.style.cssText = 'position:relative;width:36px;height:36px;';
          const pulse = document.createElement('span');
          pulse.style.cssText = 'position:absolute;top:-2px;left:-2px;width:40px;height:40px;border-radius:50%;background:rgba(59,130,246,0.25);animation:wayin-ping 1.2s cubic-bezier(0,0,0.2,1) infinite;';
          const dot = document.createElement('div');
          dot.style.cssText = 'width:36px;height:36px;border-radius:50%;background:#2563EB;border:3px solid white;box-shadow:0 4px 16px rgba(37,99,235,0.45);display:flex;align-items:center;justify-content:center;position:relative;z-index:1;';
          dot.innerHTML = '<svg width="16" height="16" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-4-7.5"/></svg>';
          el.appendChild(pulse);
          el.appendChild(dot);
        } else {
          el.style.cssText = 'width:28px;height:28px;border-radius:50%;background:#16A34A;border:2.5px solid white;box-shadow:0 2px 8px rgba(22,163,74,0.35);display:flex;align-items:center;justify-content:center;';
          el.innerHTML = '<svg width="13" height="13" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M2 20h20"/><path d="M14 12v.01"/></svg>';
        }

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectPlaceRef.current(place);
          map.flyTo({ center: place.coordinates, zoom: INDONESIA_DEFAULT_ZOOM, essential: true });
        });

        markersRef.current.push(
          new mapboxgl.Marker({ element: el }).setLngLat(place.coordinates).addTo(map)
        );
      });
    },
    []
  );

  // Initialize Mapbox once
  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current) {
      setHasMapboxError(true);
      return;
    }

    let isMounted = true;

    async function initMapbox() {
      try {
        const mapboxglModule = await import('mapbox-gl');
        const mapboxgl = mapboxglModule.default;
        mapboxgl.accessToken = mapboxToken as string;
        if (!mapContainerRef.current || !isMounted) return;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: INDONESIA_DEFAULT_CENTER,
          zoom: INDONESIA_DEFAULT_ZOOM,
          attributionControl: false,
        });

        mapInstanceRef.current = map;
        // Mapbox emits non-fatal 'error' events for individual tile/style
        // requests. Tearing the whole map down for those blanked the live map
        // and replaced it with the SVG fallback, so only bail out on errors
        // that actually break rendering.
        map.on('error', (e: { error?: Error & { status?: number } }) => {
          if (!isMounted) return;
          const err = e?.error;
          const status = err?.status;
          const fatal =
            err?.name === 'MapboxError' && (status === 401 || status === 403) ||
            status === 401 ||
            status === 403 ||
            /access token|unauthorized|forbidden/i.test(err?.message || '');
          if (fatal) setHasMapboxError(true);
          else console.warn('Mapbox non-fatal error:', err?.message || e);
        });
        map.once('load', () => { if (isMounted) renderMapboxMarkers(map, mapboxgl); });
      } catch (err) {
        console.warn('Mapbox init failed, using fallback:', err);
        if (isMounted) setHasMapboxError(true);
      }
    }

    initMapbox();

    return () => {
      isMounted = false;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapboxToken]);

  // Re-render markers when places/selection changes
  useEffect(() => {
    if (mapInstanceRef.current && !hasMapboxError) {
      import('mapbox-gl').then((m) => renderMapboxMarkers(mapInstanceRef.current, m.default));
    }
  }, [places, selectedPlace, hasMapboxError, renderMapboxMarkers]);

  // Fallback drag/wheel handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
  };
  const handleMouseUp = () => { isDraggingRef.current = false; };
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.min(Math.max(e.deltaY < 0 ? prev + 0.1 : prev - 0.1, 0.6), 2.5));
  };

  // Fallback canvas positions for 12 Jakarta places
  const fallbackPositions = [
    { left: '50%', top: '46%' }, { left: '48%', top: '40%' },
    { left: '70%', top: '62%' }, { left: '32%', top: '68%' },
    { left: '58%', top: '72%' }, { left: '60%', top: '30%' },
    { left: '25%', top: '78%' }, { left: '38%', top: '38%' },
    { left: '52%', top: '58%' }, { left: '55%', top: '64%' },
    { left: '36%', top: '56%' }, { left: '28%', top: '64%' },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden select-none bg-[#e8ece9]">
      {/* Ping keyframe for selected marker pulse */}
      <style>{`@keyframes wayin-ping{75%,100%{transform:scale(2);opacity:0;}}`}</style>

      {mapboxToken && !hasMapboxError ? (
        <div ref={mapContainerRef} className="h-full w-full" />
      ) : (
        /* Graceful fallback: interactive SVG canvas */
        <div
          className="relative h-full w-full cursor-grab active:cursor-grabbing overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-1.5 rounded-full bg-white/90 border border-gray-200 px-3 py-1 shadow-sm backdrop-blur-sm text-[11px] font-medium text-gray-600">
            <Info className="h-3.5 w-3.5 text-blue-600" />
            <span>Mode Pratinjau Peta</span>
          </div>

          <div
            className="absolute inset-0 transition-transform duration-75 ease-out origin-center"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
            {/* Jakarta Pusat SVG base map */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
              <rect width="1440" height="900" fill="#EDF1EC" />
              <ellipse cx="720" cy="450" rx="200" ry="160" fill="#DCE7D8" />
              <ellipse cx="280" cy="200" rx="180" ry="120" fill="#DCE7D8" />
              <ellipse cx="1200" cy="680" rx="150" ry="100" fill="#DCE7D8" />
              <ellipse cx="1350" cy="820" rx="220" ry="140" fill="#DBEAFE" />
              <g stroke="#FFFFFF" strokeWidth="28" strokeLinecap="round">
                <line x1="-50" y1="450" x2="1500" y2="450" />
                <line x1="720" y1="-50" x2="720" y2="950" />
                <line x1="-50" y1="600" x2="1500" y2="500" />
                <line x1="200" y1="-50" x2="1100" y2="950" />
                <line x1="1000" y1="-50" x2="900" y2="950" />
              </g>
              <g stroke="#E2E8E0" strokeWidth="1.5" strokeDasharray="6 8">
                <line x1="-50" y1="450" x2="1500" y2="450" />
                <line x1="720" y1="-50" x2="720" y2="950" />
              </g>
              <text x="300" y="443" fill="#9CA3AF" fontSize="11" fontWeight="600" letterSpacing="0.05em">JL. MEDAN MERDEKA</text>
              <text x="730" y="380" fill="#9CA3AF" fontSize="11" fontWeight="600" letterSpacing="0.05em">JL. THAMRIN</text>
              <text x="820" y="600" fill="#9CA3AF" fontSize="11" fontWeight="600" letterSpacing="0.05em">JL. DIPONEGORO</text>
            </svg>

            {/* Fallback markers */}
            <div className="absolute inset-0 pointer-events-none">
              {places.map((place, idx) => {
                const isSelected = selectedPlace?.id === place.id;
                const pos = fallbackPositions[idx % fallbackPositions.length];
                return (
                  <div
                    key={place.id}
                    className="absolute pointer-events-auto cursor-pointer transition-all duration-150 hover:scale-110 active:scale-95"
                    style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)' }}
                    onClick={(e) => { e.stopPropagation(); onSelectPlace(place); }}
                    role="button"
                    aria-label={`Pilih ${place.name}`}
                  >
                    {isSelected ? (
                      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', top: '-4px', left: '-4px', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(59,130,246,0.25)', animation: 'wayin-ping 1.2s cubic-bezier(0,0,0.2,1) infinite' }} />
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563EB', border: '3px solid white', boxShadow: '0 4px 16px rgba(37,99,235,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                          <Accessibility style={{ width: '18px', height: '18px', color: 'white', strokeWidth: 2.4 }} />
                        </div>
                      </div>
                    ) : (
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#16A34A', border: '2.5px solid white', boxShadow: '0 2px 8px rgba(22,163,74,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DoorOpen style={{ width: '13px', height: '13px', color: 'white', strokeWidth: 2.4 }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

