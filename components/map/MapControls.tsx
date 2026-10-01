'use client';

import React from 'react';
import { Plus, Minus, Locate } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onRecenter,
}: MapControlsProps) {
  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* Zoom In & Out block */}
      <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-md">
        <button
          type="button"
          onClick={onZoomIn}
          aria-label="Zoom in"
          className="flex h-9 w-9 items-center justify-center text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 border-b border-gray-100 active:bg-gray-200"
          title="Zoom in"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          aria-label="Zoom out"
          className="flex h-9 w-9 items-center justify-center text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
          title="Zoom out"
        >
          <Minus className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Recenter button */}
      <button
        type="button"
        onClick={onRecenter}
        aria-label="Recenter map"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200/90 bg-white text-blue-600 shadow-md transition-all hover:bg-blue-50 hover:text-blue-700 active:scale-95"
        title="Recenter map to default view"
      >
        <Locate className="h-4 w-4 stroke-[2.2]" />
      </button>
    </div>
  );
}

