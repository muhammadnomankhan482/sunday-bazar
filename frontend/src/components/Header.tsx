import React, { useState } from 'react';
import { Search, MapPin, ChevronDown, User as UserIcon, LogOut, Heart, Plus, ShoppingBag } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onLaunchAuth: () => void;
  onLogout: () => void;
  onLaunchSell: () => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  favoritesCount: number;
  onToggleShowFavorites: () => void;
  showOnlyFavorites: boolean;
  onResetAllFilters: () => void;
}

// Popular locations for OLX search
const CITIES = [
  'All Cities', 'Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Peshawar', 'Multan', 'Gujranwala', 'Quetta', 'Sialkot',
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune'
];

export default function Header({
  currentUser,
  onLaunchAuth,
  onLogout,
  onLaunchSell,
  searchText,
  onSearchChange,
  selectedCity,
  onCityChange,
  favoritesCount,
  onToggleShowFavorites,
  showOnlyFavorites,
  onResetAllFilters,
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#f7f9fa] border-b border-slate-200">
      {/* Top Banner Accent */}
      <div className="bg-gradient-to-r from-teal-800 via-[#002f34] to-yellow-500 h-1.5 w-full" />

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col md:flex-row items-center gap-3.5 sm:gap-4_">
        
        {/* Row 1: Logo & Actions (Mobile adaptation) */}
        <div className="w-full md:w-auto flex items-center justify-between gap-4">
          {/* Logo Brand with custom SUNDAY BAZAR style letters */}
          <button
            id="brand-logo"
            onClick={onResetAllFilters}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            {/* Minimalist modern Sunday Bazar design */}
            <div className="flex gap-1 items-center">
              <span className="w-8 h-8 rounded-lg bg-[#002f34] text-[#ffd615] font-black text-sm flex items-center justify-center tracking-tight shadow-md select-none">
                S
              </span>
              <span className="w-8 h-8 rounded-lg bg-[#ffd615] text-[#002f34] font-black text-sm flex items-center justify-center tracking-tight shadow-md select-none">
                B
              </span>
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-base font-black text-[#002f34] uppercase tracking-wide leading-none select-none">SUNDAY BAZAR</span>
              <span className="text-[9px] text-teal-850 font-extrabold select-none tracking-wider">PAKISTAN'S OWN PORTAL</span>
            </div>
          </button>

          {/* User profile option + Sell for screen space safety on mobile */}
          <div className="flex items-center gap-2.5 md:hidden">
            {/* Show Favorites */}
            <button
              id="mobile-favs"
              onClick={onToggleShowFavorites}
              className={`p-2 rounded-full relative transition-colors ${
                showOnlyFavorites ? 'text-rose-600 bg-rose-50' : 'text-slate-500 hover:text-rose-500 hover:bg-slate-100'
              }`}
            >
              <Heart size={20} fill={showOnlyFavorites ? "currentColor" : "none"} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Auth Indicator (Mobile) */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="mobile-user-avatar"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-8 h-8 rounded-full overflow-hidden border border-teal-600 flex items-center justify-center bg-white cursor-pointer"
                >
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-50">
                    <div className="px-4 py-2 text-xs border-b border-slate-100">
                      <p className="font-bold text-[#002f34] truncate">{currentUser.name}</p>
                      <p className="text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      id="mobile-logout-btn"
                      onClick={() => {
                        onLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut size={13} /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="mobile-login"
                onClick={onLaunchAuth}
                className="text-[#002f34] font-bold text-xs hover:underline cursor-pointer"
              >
                Login
              </button>
            )}

            {/* Mobile Sell Button */}
            <button
              id="mobile-sell"
              onClick={onLaunchSell}
              className="px-2.5 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-teal-950 text-xs font-extrabold rounded-lg tracking-wider flex items-center gap-0.5 shadow-sm active:scale-95 transition-transform"
            >
              <Plus size={14} /> SELL
            </button>
          </div>
        </div>

        {/* Row 2: Search layout (Full width content) */}
        <div id="navigation-inputs" className="w-full flex-1 flex flex-col sm:flex-row gap-2.5 items-stretch">
          
          {/* Location selector dropdown input */}
          <div className="w-full sm:w-1/4 relative">
            <div className="absolute left-3 top-3.5 text-teal-800 flex items-center pointer-events-none">
              <MapPin size={16} />
            </div>
            <button
              id="city-selector-trigger"
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="w-full shadow-xs bg-white border-2 border-[#002f34] rounded-lg py-2.5 pl-9 pr-8 text-left text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none flex items-center justify-between cursor-pointer"
            >
              <span className="truncate">{selectedCity}</span>
              <ChevronDown size={14} className="text-[#002f34]" />
            </button>

            {cityDropdownOpen && (
              <>
                {/* Overlay layer */}
                <div className="fixed inset-0 z-40" onClick={() => setCityDropdownOpen(false)} />
                <div className="absolute left-0 mt-1.5 w-full bg-white border border-slate-200 rounded-lg shadow-2xl overflow-y-auto max-h-60 z-50">
                  {CITIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        onCityChange(c);
                        setCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm transition-colors cursor-pointer ${
                        selectedCity === c ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Main search input bar */}
          <div id="search-input-container" className="flex-1 relative">
            <input
              id="query-product-search"
              type="text"
              placeholder="Find Cars, Mobile Phones, Laptops and more..."
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full py-2.5 pl-4 pr-12 bg-white border-2 border-[#002f34] rounded-lg text-slate-800 font-semibold text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 shadow-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // Standard submit behavior helper
                }
              }}
            />
            <div className="absolute right-0.5 top-0.5 bottom-0.5 bg-[#002f34] text-white rounded-r-md px-3 sm:px-4.5 flex items-center justify-center cursor-pointer hover:bg-teal-950 transition-colors">
              <Search size={18} className="text-white bg-transparent" />
            </div>
          </div>
        </div>

        {/* Row 3: Desktop only Actions */}
        <div id="desktop-actions" className="hidden md:flex items-center gap-5">
          {/* Desktop Favorites */}
          <button
            id="desktop-fav-toggle"
            onClick={onToggleShowFavorites}
            className={`flex items-center gap-1.5 p-2 rounded-lg transition-all ${
              showOnlyFavorites
                ? 'bg-rose-50 text-rose-600 font-bold'
                : 'text-slate-600 hover:text-rose-500 hover:bg-slate-100 font-semibold'
            }`}
          >
            <div className="relative">
              <Heart size={18} fill={showOnlyFavorites ? "currentColor" : "none"} />
              {favoritesCount > 0 && (
                <span className="absolute -top-2.5 -right-2 bg-rose-600 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {favoritesCount}
                </span>
              )}
            </div>
            <span className="text-xs">My Favorites</span>
          </button>

          {/* Desktop Auth */}
          {currentUser ? (
            <div className="relative">
              <button
                id="desktop-user-trigger"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-slate-700 font-semibold hover:text-[#002f34] cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-teal-700 bg-white">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs max-w-[124px] truncate">{currentUser.name}</span>
                <ChevronDown size={14} className="text-slate-500" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2.5 w-52 bg-white border border-slate-100 rounded-xl shadow-2xl py-1 z-50">
                    <div className="px-4 py-3 text-xs border-b border-slate-100 bg-slate-50/50">
                      <p className="font-extrabold text-[#002f34] truncate">{currentUser.name}</p>
                      <p className="text-slate-400 truncate mt-0.5">{currentUser.email}</p>
                      <p className="text-[10px] text-teal-700 font-bold mt-1 uppercase tracking-wide">✓ verified seller</p>
                    </div>
                    <button
                      id="desktop-logout-btn"
                      onClick={() => {
                        onLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} /> Close Session (Log Out)
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              id="desktop-login-button"
              onClick={onLaunchAuth}
              className="text-[#002f34] font-bold text-sm tracking-wide hover:underline cursor-pointer flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-lg"
            >
              <UserIcon size={14} /> Log In / Sign Up
            </button>
          )}

          {/* Sell button: Iconic OLX design */}
          <button
            id="desktop-sell-button"
            onClick={onLaunchSell}
            className="group relative px-6 py-2 rounded-full font-black text-sm text-teal-950 uppercase tracking-widest cursor-pointer shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all outline-none bg-white border-4 border-transparent flex items-center gap-1"
            style={{
              clipPath: 'padding-box',
              borderImage: 'linear-gradient(to right, #23e5db, #3a77ff, #ffd615) 1',
            }}
          >
            {/* Custom stylized bordered Sell design */}
            <span className="absolute inset-0 rounded-full border-4 border-teal-400 group-hover:border-yellow-400 transition-colors -m-1" />
            <span className="relative z-10 flex items-center gap-1 font-extrabold text-[#002f34]">
              <Plus size={16} strokeWidth={3} className="text-teal-700 transition-transform group-hover:rotate-90 duration-300" />
              Sell
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
