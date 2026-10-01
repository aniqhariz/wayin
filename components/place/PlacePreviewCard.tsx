'use client';

import React from 'react';
import {
  CheckCircle2,
  X,
  ArrowRight,
  Accessibility,
  ArrowUpDown,
  Bath,
  Car,
  DoorOpen,
  Armchair,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Place, AccessPointType } from '@/types';

interface PlacePreviewCardProps {
  place: Place;
  onClose?: () => void;
  onViewDetails?: (placeId: string) => void;
}

const FEATURE_CONFIG: Record<
  AccessPointType,
  { label: string; icon: React.ElementType }
> = {
  ramp: { label: 'Ramp', icon: Accessibility },
  elevator: { label: 'Elevator', icon: ArrowUpDown },
  accessible_toilet: { label: 'Accessible Toilet', icon: Bath },
  accessible_parking: { label: 'Parking', icon: Car },
  accessible_entrance: { label: 'Step-free Entrance', icon: DoorOpen },
  priority_seating: { label: 'Priority Seating', icon: Armchair },
};

export function PlacePreviewCard({
  place,
  onClose,
  onViewDetails,
}: PlacePreviewCardProps) {
  const verifiedCount = place.accessPoints.filter(
    (ap) => ap.verification === 'verified'
  ).length;

  return (
    <div className="w-full max-w-sm sm:max-w-md rounded-2xl border border-gray-100 bg-white/98 p-4 sm:p-5 shadow-2xl backdrop-blur-md transition-all duration-200">
      {/* Header: Status Badge & Close button */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 stroke-[2.5]" />
            Accessible
          </span>
          <span className="text-[11px] font-medium text-gray-500">
            {place.recommendedAccessPoint
              ? place.recommendedAccessPoint.name
              : 'Verified access'}
          </span>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close place preview"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Place Title */}
      <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
        {place.name}
      </h3>

      {/* Category & Address */}
      <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
        <span>{place.category}</span>
        <span className="text-gray-300">•</span>
        <span className="truncate">{place.address}</span>
      </div>

      {/* Amenity chips */}
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {place.primaryFeatures.map((feat) => {
          const config = FEATURE_CONFIG[feat];
          if (!config) return null;
          const Icon = config.icon;
          return (
            <span
              key={feat}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200/90 bg-gray-50/70 px-2.5 py-1 text-xs font-medium text-gray-700"
            >
              <Icon className="h-3.5 w-3.5 text-gray-600 stroke-[2.2]" />
              {config.label}
            </span>
          );
        })}
      </div>

      {/* Divider */}
      <div className="my-3.5 h-px w-full bg-gray-100" />

      {/* Footer Info & View Details Button */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-gray-900">
            {place.accessPoints.length} Access Point{place.accessPoints.length !== 1 ? 's' : ''}
          </p>
          <p className="text-[11px] text-gray-400 font-medium">
            Updated {place.updatedAt}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onViewDetails?.(place.id)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <span>View Details</span>
          <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}

