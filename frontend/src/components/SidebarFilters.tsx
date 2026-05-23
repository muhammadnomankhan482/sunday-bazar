import React from 'react';
import { Smartphone, Laptop, Sofa, Sparkles, ShoppingCart, Flame, Shirt, MapPin, RefreshCw, Filter } from 'lucide-react';

interface SidebarFiltersProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onResetAllFilters: () => void;
  totalProductsCount: number;
  filteredCount: number;
}

const CATEGORIES = [
  { slug: 'all', name: 'All Categories', icon: Flame, color: 'text-amber-500' },
  { slug: 'smartphones', name: 'Mobile Phones', icon: Smartphone, color: 'text-blue-500' },
  { slug: 'laptops', name: 'Computers & Laptops', icon: Laptop, color: 'text-indigo-500' },
  { slug: 'furniture', name: 'Furniture & Sofa', icon: Sofa, color: 'text-emerald-500' },
  { slug: 'skincare', name: 'Skincare', icon: Sparkles, color: 'text-pink-500' },
  { slug: 'groceries', name: 'Groceries', icon: ShoppingCart, color: 'text-amber-600' },
  { slug: 'mens-shirts', name: 'Fashion & Wear', icon: Shirt, color: 'text-teal-500' },
];

const QUICK_CITIES = ['All Cities', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar'];

export default function SidebarFilters({
  activeCategory,
  onSelectCategory,
  selectedCity,
  onSelectCity,
  onResetAllFilters,
  totalProductsCount,
  filteredCount,
}: SidebarFiltersProps) {
  const isAnyFilterActive =
    activeCategory !== 'all' || selectedCity !== 'All Cities';

  return (
    <div id="sidebar-filters-panel" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-[#002f34]" />
          <h3 className="text-sm font-extrabold text-[#002f34] tracking-wide uppercase font-mono">
            Filter Results
          </h3>
        </div>
        {isAnyFilterActive && (
          <button
            id="sidebar-clear-btn"
            onClick={onResetAllFilters}
            className="text-[10px] text-teal-800 hover:text-red-600 font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw size={10} /> Clear All
          </button>
        )}
      </div>

      {/* Category Filters Block */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
          Product Categories
        </h4>
        <div className="flex flex-col gap-1.5" id="sidebar-category-list">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = cat.slug === activeCategory;

            return (
              <button
                key={cat.slug}
                id={`sidebar-cat-btn-${cat.slug}`}
                onClick={() => onSelectCategory(cat.slug)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#002f34] text-white shadow-sm ring-1 ring-[#002f34]'
                    : 'text-slate-700 bg-slate-50/50 hover:bg-[#002f34]/5 border border-transparent hover:border-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} className={isActive ? 'text-[#ffd615]' : cat.color} />
                  <span>{cat.name}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffd615]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location (City) Filter Block */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
          Quick Locations
        </h4>
        <div className="flex flex-wrap lg:flex-col gap-1.5" id="sidebar-city-list">
          {QUICK_CITIES.map((city) => {
            const isCitySelected = selectedCity === city;

            return (
              <button
                key={city}
                id={`sidebar-city-btn-${city}`}
                onClick={() => onSelectCity(city)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                  isCitySelected
                    ? 'bg-teal-50 border-teal-800 text-teal-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <MapPin size={13} className={isCitySelected ? 'text-teal-800' : 'text-slate-400'} />
                <span>{city}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Metrics Badge */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
        <p className="text-[10px] text-slate-400 font-medium">Viewing Matches</p>
        <p className="text-base font-black text-[#002f34] mt-0.5">
          {filteredCount} <span className="text-xs text-slate-500 font-normal">out of {totalProductsCount} ads</span>
        </p>
      </div>
    </div>
  );
}
