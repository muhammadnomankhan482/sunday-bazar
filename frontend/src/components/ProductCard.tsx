import React from 'react';
import { Heart, MapPin, Calendar, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: React.Key | string | number;
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onClick: () => void;
}

export default function ProductCard({ product, isFavorite, onToggleFavorite, onClick }: ProductCardProps) {
  const formatPrice = (p: number) => {
    return p.toLocaleString();
  };

  // OLX card attributes
  const location = product.location || 'Karachi, PK';
  const postDate = product.createdAt || '3 days ago';
  const isLocal = !!product.isLocal;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer flex flex-col overflow-hidden relative group/card p-3 space-y-2.5"
    >
      {/* Thumbnail block with tags */}
      <div className="h-44 w-full bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center p-2 relative">
        <img
          src={product.thumbnail}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain group-hover/card:scale-105 transition-transform duration-300"
        />

        {/* Local user listings accent */}
        {isLocal && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-teal-950 text-[9px] font-extrabold rounded-md shadow-xs flex items-center gap-1">
            <Sparkles size={10} /> My Ad
          </span>
        )}

        {/* Favorite heart icon */}
        <button
          id={`fav-btn-${product.id}`}
          onClick={onToggleFavorite}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-md text-rose-500 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
        >
          <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content description */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Price */}
          <div className="flex justify-between items-center mb-1">
            <span className="text-base font-black text-[#002f34] font-mono leading-none">
              Rs. {formatPrice(product.price)}
            </span>
          </div>

          {/* Title - Truncated on 2 lines */}
          <h4 className="text-slate-800 text-xs sm:text-sm font-semibold line-clamp-2 leading-snug min-h-[40px] group-hover/card:text-teal-700 transition-colors">
            {product.title}
          </h4>
        </div>

        {/* Footer info: Location & Timing */}
        <div className="border-t border-slate-100 pt-2 mt-2 text-[10px] text-slate-400 flex justify-between items-center">
          <div className="flex items-center gap-0.5 max-w-[65%]">
            <MapPin size={11} className="text-teal-700 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <span className="shrink-0">{postDate}</span>
        </div>
      </div>
    </div>
  );
}
