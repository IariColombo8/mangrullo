import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wifi, Users, Eye, ChevronLeft, ChevronRight, MessageCircle, Check, Snowflake, Droplets, Tv, UtensilsCrossed, Coffee, CookingPot, Bed } from 'lucide-react';


// ============================================
// 3. IMAGE GALLERY - components/home/CabinImageGallery.tsx
// ============================================

export const CabinImageGallery = ({ cabin }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!Array.isArray(cabin.images) || cabin.images.length === 0) {
    return null;
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? cabin.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === cabin.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="mb-6">
      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
        <div className="relative w-full" style={{ paddingBottom: '75%' }}>
          <img
            src={cabin.images[currentImageIndex]}
            alt={`${cabinUtils.getCabinName(cabin)} - Imagen ${currentImageIndex + 1}`}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
        
        {cabin.images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {cabin.images.length}
            </div>
          </>
        )}
      </div>

      {cabin.images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {cabin.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentImageIndex
                  ? 'border-emerald-600 ring-2 ring-emerald-200'
                  : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-emerald-400'
              }`}
            >
              <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};





