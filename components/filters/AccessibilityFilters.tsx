'use client';

import React from 'react';
import {
  SlidersHorizontal,
  Accessibility,
  ArrowUpDown,
  Bath,
  Car,
  DoorOpen,
  Armchair,
} from 'lucide-react';
import { FilterType } from '@/types';

interface AccessibilityFiltersProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

interface FilterOption {
  id: FilterType;
  label: string;
  icon: React.ElementType;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All', icon: SlidersHorizontal },
  { id: 'ramp', label: 'Ramp', icon: Accessibility },
  { id: 'elevator', label: 'Elevator', icon: ArrowUpDown },
  { id: 'accessible_toilet', label: 'Accessible Toilet', icon: Bath },
  { id: 'accessible_parking', label: 'Parking', icon: Car },
  { id: 'accessible_entrance', label: 'Entrance', icon: DoorOpen },
  { id: 'priority_seating', label: 'Priority Seating', icon: Armchair },
];

export function AccessibilityFilters({
  selectedFilter,
  onFilterChange,
}: AccessibilityFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
      {FILTER_OPTIONS.map((filter) => {
        const Icon = filter.icon;
        const isActive = selectedFilter === filter.id;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center gap-1.5 shrink-0 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-150 select-none ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30'
                : 'bg-white text-gray-700 border border-gray-200/90 shadow-xs hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 active:scale-[0.98]'
            }`}
          >
            <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
            <span>{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
}

