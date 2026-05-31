"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, MapPin, PlusCircle, CheckCircle } from 'lucide-react';
import { Product, User } from '../types';
import { createProduct } from '../lib/api';

interface SellFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAddProduct: (product: Product) => void;
}

const POPULAR_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Peshawar',
  'Multan', 'Gujranwala', 'Quetta', 'Sialkot',
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune',
];

const PRESET_CATEGORIES = [
  { slug: 'smartphones', name: 'Smartphones' },
  { slug: 'laptops', name: 'Laptops' },
  { slug: 'furniture', name: 'Furniture' },
  { slug: 'groceries', name: 'Groceries' },
  { slug: 'skincare', name: 'Skincare' },
  { slug: 'fragrances', name: 'Fragrances' },
  { slug: 'home-decoration', name: 'Home Decoration' },
  { slug: 'mens-shirts', name: 'Mens Wear' },
  { slug: 'sports-accessories', name: 'Sports' },
];

const CATEGORY_IMAGES: Record<string, string> = {
  smartphones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop',
  laptops: 'https://images.unsplash.com/photo-1496181130204-755241524eab?q=80&w=600&auto=format&fit=crop',
  furniture: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop',
  groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
};

export default function SellFormModal({ isOpen, onClose, currentUser, onAddProduct }: SellFormModalProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('smartphones');
  const [location, setLocation] = useState(POPULAR_CITIES[0]);
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Product title zaroor daalein.'); return; }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError('Sahi price daalein (zero se zyada).');
      return;
    }
    if (!description.trim() || description.length < 10) {
      setError('Description kam az kam 10 characters ka hona chahiye.');
      return;
    }

    const finalImage =
      imageUrl.trim() ||
      CATEGORY_IMAGES[category] ||
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600&auto=format&fit=crop';

    const payload = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      brand: brand.trim() || 'Generic',
      thumbnail: finalImage,
      images: [finalImage],
      rating: 5.0,
      isLocal: true,
      location,
      sellerName: currentUser?.name || 'Anonymous',
      sellerPhone: currentUser?.phone || '+92 300 0000000',
      likesCount: 0,
      ownerId: currentUser?.id || 'anonymous',
    };

    setLoading(true);
    try {
      // Backend pe POST /products (JWT token api.ts interceptor se auto-attach hoga)
      const saved = await createProduct(payload);

      // Backend se aaya product UI mein add karo
      const newAd: Product = {
        id: saved.id || saved._id || `local-${Date.now()}`,
        title: saved.title,
        description: saved.description,
        price: saved.price,
        category: saved.category || category,
        brand: saved.brand || brand || 'Generic',
        thumbnail: saved.thumbnail || finalImage,
        images: saved.images || [finalImage],
        rating: saved.rating || 5.0,
        isLocal: true,
        location: saved.location || location,
        createdAt: 'Just now',
        sellerName: saved.sellerName || currentUser?.name || 'Anonymous',
        sellerPhone: saved.sellerPhone || currentUser?.phone || '+92 300 0000000',
        likesCount: 0,
        ownerId: currentUser?.id,
      };

      onAddProduct(newAd);
      setSubmittedSuccessfully(true);

      setTimeout(() => {
        setSubmittedSuccessfully(false);
        setTitle(''); setPrice(''); setCategory('smartphones');
        setLocation(POPULAR_CITIES[0]); setDescription('');
        setBrand(''); setImageUrl('');
        onClose();
      }, 1800);

    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Product save nahi hua. Dobara koshish karein.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="sell-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
        >
          <motion.div
            id="sell-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] md:max-h-[85vh] my-auto"
          >
            {/* Header */}
            <div className="bg-[#002f34] text-white p-5 flex justify-between items-center shrink-0 border-b border-white/[0.08]">
              <div>
                <h3 id="sell-form-title" className="text-lg font-bold">Apna Product Bechein</h3>
                <p className="text-teal-200 text-xs">Hazaron buyers tak pahunchein</p>
              </div>
              <button
                id="close-sell-form"
                onClick={onClose}
                className="text-[#ffd615] hover:bg-teal-950 border border-teal-800 hover:border-[#ffd615] p-2.5 rounded-full transition-all cursor-pointer"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 relative overflow-y-auto flex-1">
              <AnimatePresence>
                {submittedSuccessfully && (
                  <motion.div
                    id="sell-success-block"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center p-6 text-center"
                  >
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4 border border-emerald-200 animate-pulse">
                      <CheckCircle size={40} />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-1">Ad Live Ho Gaya!</h4>
                    <p className="text-slate-500 text-sm max-w-xs">
                      Mubarak ho! Aapka product listing ab recommendations mein nazar aa raha hai.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div
                  id="sell-form-error"
                  className="mb-4 text-xs bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="sell-title" className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                    Ad Title *
                  </label>
                  <input
                    id="sell-title"
                    type="text"
                    required
                    placeholder="e.g. iPhone 13 Pro 256GB Gold"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Category + Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sell-category" className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                      Category *
                    </label>
                    <select
                      id="sell-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all"
                    >
                      {PRESET_CATEGORIES.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="sell-price" className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                      Price (PKR) *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-slate-500 font-semibold text-xs">Rs.</div>
                      <input
                        id="sell-price"
                        type="number"
                        required
                        placeholder="120000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Brand + Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sell-brand" className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                      Brand
                    </label>
                    <input
                      id="sell-brand"
                      type="text"
                      placeholder="Apple, Samsung, Dell..."
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="sell-location" className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                      Location *
                    </label>
                    <select
                      id="sell-location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all"
                    >
                      {POPULAR_CITIES.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label htmlFor="sell-image-url" className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                    Image URL (Optional)
                  </label>
                  <div className="relative">
                    <Camera className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      id="sell-image-url"
                      type="url"
                      placeholder="https://example.com/item.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="sell-description" className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                    Description (Min 10 chars) *
                  </label>
                  <textarea
                    id="sell-description"
                    rows={3}
                    required
                    placeholder="Product ki condition, features, warranty, koi kharabi wagera batayein..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Seller Preview */}
                <div
                  id="seller-details-banner"
                  className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        currentUser?.avatar ||
                        `https://api.dicebear.com/7.x/adventurer/svg?seed=guest`
                      }
                      alt={currentUser?.name}
                      className="w-8 h-8 rounded-full border border-teal-600 bg-white"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-none">{currentUser?.name}</p>
                      <p className="text-[10px] text-slate-400 leading-none mt-1">Verified Seller</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-medium">Contact</p>
                    <p className="text-xs font-bold text-teal-900">{currentUser?.phone}</p>
                  </div>
                </div>

                {/* Submit */}
                <button
                  id="submit-sell-ad"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-teal-800 hover:bg-[#002f34] text-white font-bold rounded-lg text-sm transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 flex justify-center items-center gap-2 cursor-pointer mt-4 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <PlusCircle size={18} />
                      Ad Post Karein
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
