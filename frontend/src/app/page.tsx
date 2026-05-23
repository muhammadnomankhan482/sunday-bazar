"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, HelpCircle, HeartOff, RefreshCw, Layers, SlidersHorizontal, ArrowUpRight, Search, Landmark } from 'lucide-react';
import { Product, User } from '../types';
import Header from '../components/Header';
import SidebarFilters from '../components/SidebarFilters';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import AuthModal from '../components/AuthModal';
import SellWarnPopup from '../components/SellWarnPopup';
import SellFormModal from '../components/SellFormModal';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

const RANDOM_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Peshawar', 'Multan', 'Gujranwala', 'Quetta', 'Sialkot',
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune'
];

const RANDOM_TIMES = [
  'Today', 'Yesterday', '2 hours ago', '5 hours ago', '2 days ago', '4 days ago', '1 week ago', 'Just now'
];

export default function Home() {
  // Store States
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Auth State — always start null (SSR safe), load from localStorage after mount
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [clientReady, setClientReady] = useState(false);

  // Filters & Filter-bar State
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');

  // Favorites state — always start empty (SSR safe), load from localStorage after mount
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Modals Visibility
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authContextMessage, setAuthContextMessage] = useState('');
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellWarnOpen, setSellWarnOpen] = useState(false);
  const [activeDetailProduct, setActiveDetailProduct] = useState<Product | null>(null);

  // Load initial products from DummyJSON
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://dummyjson.com/products?limit=100');
      if (!response.ok) {
        throw new Error('Failed to retrieve product data.');
      }
      const data = await response.json();
      
      // Normalize products & shift price values to emulate regional PKR prices
      const normalized: Product[] = data.products.map((item: any) => {
        // Map beauty to skincare for simplicity matching our category filters
        let categoryMapped = item.category;
        if (categoryMapped === 'beauty') {
          categoryMapped = 'skincare';
        }

        return {
          ...item,
          category: categoryMapped,
          // Convert dollar to Pakistani Rupee-like amounts for high-realism (e.g. $10 becomes Rs. 2,500)
          price: Math.round(item.price * 250), 
          isLocal: false,
          location: RANDOM_CITIES[Math.floor(Math.random() * RANDOM_CITIES.length)],
          createdAt: RANDOM_TIMES[Math.floor(Math.random() * RANDOM_TIMES.length)],
          sellerName: item.brand || 'OLX Premium Seller',
          sellerPhone: `+92 3${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
          likesCount: Math.floor(Math.random() * 30),
        };
      });

      // Filter to keep categories that the UI bar displays or fallback
      setProducts(normalized);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Load localStorage data only on client after mount (prevents hydration mismatch)
  useEffect(() => {
    try {
      const cachedUser = localStorage.getItem('olx_session_user');
      if (cachedUser) setCurrentUser(JSON.parse(cachedUser));
    } catch { /* ignore */ }

    try {
      const cachedFavs = localStorage.getItem('olx_saved_favorites_list');
      if (cachedFavs) setFavorites(JSON.parse(cachedFavs));
    } catch { /* ignore */ }

    setClientReady(true);
  }, []);

  // Save favorites to storage when update (only after client is ready)
  useEffect(() => {
    if (!clientReady) return;
    localStorage.setItem('olx_saved_favorites_list', JSON.stringify(favorites));
  }, [favorites, clientReady]);

  // Auth Operations
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((fbUser) => {
      if (fbUser) {
        const loggedUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          email: fbUser.email || '',
          avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fbUser.email || '')}`,
          phone: '+92 300 1234567',
          isLoggedIn: true,
          createdAt: new Date().toLocaleDateString(),
        };
        setCurrentUser((prev) => {
          // Avoid re-render if same user is already set
          if (prev?.id === loggedUser.id) return prev;
          if (typeof window !== 'undefined') {
            localStorage.setItem('olx_session_user', JSON.stringify(loggedUser));
          }
          return loggedUser;
        });
      } else {
        setCurrentUser((prev) => {
          // Keep local/demo user from cache
          if (prev?.id?.startsWith('local_')) return prev;
          if (typeof window !== 'undefined') {
            localStorage.removeItem('olx_session_user');
          }
          return null;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('olx_session_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase Auth signOut failed:", e);
    }
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('olx_session_user');
    }
  };

  // Sell Button Interactive Logic
  const handleSellButtonClick = () => {
    if (!currentUser) {
      // Trigger user popup dialog
      setAuthContextMessage('To post your product listing, please sign in to your account first.');
      setSellWarnOpen(true);
    } else {
      // Open sell form modal
      setSellModalOpen(true);
    }
  };

  const handleWarnProceedToLogin = () => {
    setSellWarnOpen(false);
    setAuthModalOpen(true);
  };

  // Add custom products created by user in UI
  const handleAddNewAd = (newAd: Product) => {
    setProducts((prev) => [newAd, ...prev]);
  };

  // Turn Favorite toggle
  const handleToggleFavorite = (prodId: string | number) => {
    const stringId = prodId.toString();
    setFavorites((prev) => {
      if (prev.includes(stringId)) {
        return prev.filter((id) => id !== stringId);
      } else {
        return [...prev, stringId];
      }
    });
  };

  // Reset helper
  const handleResetAllFilters = () => {
    setActiveCategory('all');
    setSearchText('');
    setSelectedCity('All Cities');
    setShowOnlyFavorites(false);
  };

  // Filtering Logic
  const filteredProducts = products.filter((p) => {
    // 1. Show only favorites if toggled
    if (showOnlyFavorites) {
      if (!favorites.includes(p.id.toString())) {
        return false;
      }
    }

    // 2. Category Check
    if (activeCategory !== 'all') {
      if (p.category !== activeCategory) {
        return false;
      }
    }

    // 3. City location Check
    if (selectedCity !== 'All Cities') {
      if (p.location !== selectedCity) {
        return false;
      }
    }

    // 4. Search Text Match check
    if (searchText.trim() !== '') {
      const query = searchText.toLowerCase();
      const titleMatch = p.title.toLowerCase().includes(query);
      const descMatch = p.description.toLowerCase().includes(query);
      const catMatch = p.category.toLowerCase().includes(query);
      const brandMatch = p.brand ? p.brand.toLowerCase().includes(query) : false;

      if (!titleMatch && !descMatch && !catMatch && !brandMatch) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="bg-[#f2f4f6] min-h-screen text-slate-800 font-sans flex flex-col justify-between">
      <div>
        {/* Navigation Header */}
        <Header
          currentUser={currentUser}
          onLaunchAuth={() => {
            setAuthContextMessage('');
            setAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          onLaunchSell={handleSellButtonClick}
          searchText={searchText}
          onSearchChange={setSearchText}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          favoritesCount={favorites.length}
          onToggleShowFavorites={() => setShowOnlyFavorites(!showOnlyFavorites)}
          showOnlyFavorites={showOnlyFavorites}
          onResetAllFilters={handleResetAllFilters}
        />

        {/* Main Feed Content wrapper */}
        <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
            <div>
              <h2 id="recommendations-block" className="text-xl sm:text-2xl font-black text-[#002f34] flex items-center gap-2">
                {showOnlyFavorites ? (
                  <>❤️ Saved Favorite Listings</>
                ) : activeCategory !== 'all' ? (
                  <span className="capitalize">{activeCategory} Recommendations</span>
                ) : (
                  <>Fresh recommendations</>
                )}
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm">
                {filteredProducts.length} items found matching current filters
              </p>
            </div>

            {/* Clear filters trigger if active */}
            {(activeCategory !== 'all' || searchText !== '' || selectedCity !== 'All Cities' || showOnlyFavorites) && (
              <button
                id="reset-filters-pill"
                onClick={handleResetAllFilters}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-xs text-[#002f34] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} /> Clear Filters & View All
              </button>
            )}
          </div>

          {/* Grid Layout: Sidebar Filters Left, Products Right */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left Hand: Sticky advanced Filter panel */}
            <aside className="w-full lg:w-72 shrink-0 order-1 lg:order-1 lg:sticky lg:top-24">
              <SidebarFilters
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                selectedCity={selectedCity}
                onSelectCity={setSelectedCity}
                onResetAllFilters={handleResetAllFilters}
                totalProductsCount={products.length}
                filteredCount={filteredProducts.length}
              />
            </aside>

            {/* Right Hand: Products list & loader */}
            <div className="flex-1 w-full order-2 lg:order-2">
              {/* Loading States */}
              {loading ? (
                <div id="loading-spinner-block" className="py-20 flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 border-4 border-teal-850 border-t-yellow-400 rounded-full animate-spin" />
                  <p className="text-slate-500 text-xs sm:text-sm font-semibold font-mono animate-pulse">
                    Fetching dummyjson database catalog...
                  </p>
                </div>
              ) : error ? (
                <div id="error-alert-feed" className="py-12 text-center bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-800 max-w-md mx-auto space-y-3">
                  <p className="font-bold text-sm">Failed to fetch SUNDAY BAZAR portal ads.</p>
                  <p className="text-xs text-rose-600">{error}</p>
                  <button
                    id="retry-fetch-btn"
                    onClick={fetchProducts}
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-rose-700 transition"
                  >
                    Try Reconnecting
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                /* Empty matching layout */
                <div id="empty-results-fallback" className="py-16 text-center max-w-sm mx-auto space-y-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-4xl">
                    🔎
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-800">No Listings Match Filters</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      We couldn't locate anything in {selectedCity} under search keywords. Try shifting category or clearing text search.
                    </p>
                  </div>
                  <button
                    id="fallback-clear-btn"
                    onClick={handleResetAllFilters}
                    className="px-4 py-2 bg-[#002f34] hover:bg-teal-950 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                  >
                    Show All Recommendations
                  </button>
                </div>
              ) : (
                /* Grid container - optimized side-by-side spacing */
                <div id="product-grid" className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFavorite={favorites.includes(product.id.toString())}
                      onToggleFavorite={(e) => {
                        e.stopPropagation(); // Avoid opening the detail page
                        handleToggleFavorite(product.id);
                      }}
                      onClick={() => setActiveDetailProduct(product)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Footer Branding layout */}
      <footer className="bg-[#002f34] text-white pt-10 pb-6 border-t border-slate-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-teal-100 pb-8">
          <div>
            <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-2">Popular Categories</h5>
            <ul className="space-y-1.5 font-medium">
              <li><button onClick={() => setActiveCategory('smartphones')} className="hover:underline text-left">Mobile Phones</button></li>
              <li><button onClick={() => setActiveCategory('laptops')} className="hover:underline text-left">Computers & Laptops</button></li>
              <li><button onClick={() => setActiveCategory('furniture')} className="hover:underline text-left">Furniture & Sofa</button></li>
              <li><button onClick={() => setActiveCategory('groceries')} className="hover:underline text-left">Groceries</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-2">Trending Searches</h5>
            <ul className="space-y-1.5 font-medium">
              <li><button onClick={() => setSearchText('iPhone')} className="hover:underline text-left">iPhone Pro Max</button></li>
              <li><button onClick={() => setSearchText('laptop')} className="hover:underline text-left">HP laptops</button></li>
              <li><button onClick={() => setSearchText('Sofa')} className="hover:underline text-left">Living Room sofas</button></li>
              <li><button onClick={() => setSearchText('cream')} className="hover:underline text-left font-mono">Beauty Face Creams</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-2">About Us</h5>
            <p className="leading-relaxed font-normal">
              SUNDAY BAZAR is the premier, instant classifieds portal inspired by local South Asian buying bargaining. Fast, secure and free from third party backends.
            </p>
          </div>
          <div className="flex flex-col justify-start">
            <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-2">Account Portal</h5>
            {currentUser ? (
              <div className="space-y-2">
                <p>Welcome, <span className="font-bold text-yellow-400">{currentUser.name}</span></p>
                <button
                  id="foot-logout"
                  onClick={handleLogout}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-stone-50 text-[10px] font-bold cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                id="foot-login"
                onClick={() => setAuthModalOpen(true)}
                className="px-3.5 py-2 w-max bg-yellow-400 text-teal-950 rounded-lg text-xs font-extrabold hover:bg-yellow-500 leading-none cursor-pointer"
              >
                Log In Now
              </button>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 border-t border-teal-900 pt-5 flex flex-col sm:flex-row justify-between items-center text-[10px] text-teal-200">
          <p>© 2026 SUNDAY BAZAR. Powered by DummyJSON API.</p>
          <p className="mt-2 sm:mt-0">Designed elegantly in Next.js framework page view.</p>
        </div>
      </footer>

      {/* Popups & Modals Rendering */}

      {/* Warn Popup for Guest Sell attempts */}
      <SellWarnPopup
        isOpen={sellWarnOpen}
        onClose={() => setSellWarnOpen(false)}
        onProceedToLogin={handleWarnProceedToLogin}
      />

      {/* Auth Log In / Registration modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        message={authContextMessage}
      />

      {/* Sell Ad Product Form modal */}
      <SellFormModal
        isOpen={sellModalOpen}
        onClose={() => setSellModalOpen(false)}
        currentUser={currentUser}
        onAddProduct={handleAddNewAd}
      />

      {/* Product Detail Card modal popup */}
      <ProductDetailModal
        product={activeDetailProduct}
        isOpen={activeDetailProduct !== null}
        onClose={() => setActiveDetailProduct(null)}
        isFavorite={activeDetailProduct ? favorites.includes(activeDetailProduct.id.toString()) : false}
        onToggleFavorite={() => {
          if (activeDetailProduct) {
            handleToggleFavorite(activeDetailProduct.id);
          }
        }}
        currentUser={currentUser}
        onTriggerLoginRequired={() => {
          setActiveDetailProduct(null);
          setAuthContextMessage('To bargain or chat with this seller directly, please log in first.');
          setSellWarnOpen(true);
        }}
      />
    </div>
  );
}
