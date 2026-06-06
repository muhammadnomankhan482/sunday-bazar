"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, PlusCircle, CheckCircle, Upload } from 'lucide-react';
import { Product, User } from '../types';

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

export default function SellFormModal({ isOpen, onClose, currentUser, onAddProduct }: SellFormModalProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('smartphones');
  const [location, setLocation] = useState(POPULAR_CITIES[0]);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setTitle(''); setPrice(''); setCategory('smartphones');
    setLocation(POPULAR_CITIES[0]); setDescription('');
    setImageFile(null); setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Product title zaroor daalein.'); return; }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError('Sahi price daalein (zero se zyada).'); return;
    }
    if (!description.trim() || description.length < 10) {
      setError('Description kam az kam 10 characters ka hona chahiye.'); return;
    }
    if (!imageFile) {
      setError('Product ki image zaroor upload karein.'); return;
    }

    // multipart/form-data — backend 'image' field expect karta hai
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('price', String(Number(price)));
    formData.append('category', category);
    formData.append('image', imageFile);

    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const token = typeof window !== 'undefined' ? localStorage.getItem('sb_jwt_token') : null;
      const res = await fetch(`${backendUrl}/products`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Product save nahi hua.');
      }

      const saved = await res.json();

      const newAd: Product = {
        id: saved.id ?? saved._id ?? `local-${Date.now()}`,
        title: saved.title,
        description: saved.description,
        price: saved.price,
        category: saved.category || category,
        thumbnail: saved.thumbnail || imagePreview,
        images: saved.images || [saved.thumbnail || imagePreview],
        rating: 5.0,
        isLocal: true,
        location,
        createdAt: 'Just now',
        sellerName: currentUser?.name || 'Anonymous',
        sellerPhone: currentUser?.phone || '+92 300 0000000',
        likesCount: 0,
        ownerId: currentUser?.id,
      };

      onAddProduct(newAd);
      setSubmittedSuccessfully(true);

      setTimeout(() => {
        setSubmittedSuccessfully(false);
        resetForm();
        onClose();
      }, 1800);

    } catch (err: any) {
      setError(err.message || 'Product save nahi hua. Dobara koshish karein.');
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
              <button id="close-sell-form" onClick={onClose}
                className="text-[#ffd615] hover:bg-teal-950 border border-teal-800 hover:border-[#ffd615] p-2.5 rounded-full transition-all cursor-pointer">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 relative overflow-y-auto flex-1">
              <AnimatePresence>
                {submittedSuccessfully && (
                  <motion.div id="sell-success-block"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center p-6 text-center"
                  >
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4 border border-emerald-200 animate-pulse">
                      <CheckCircle size={40} />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-1">Ad Live Ho Gaya!</h4>
                    <p className="text-slate-500 text-sm max-w-xs">Mubarak ho! Aapka product listing ab dikhega.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div id="sell-form-error" className="mb-4 text-xs bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Title */}
                <div>
                  <label htmlFor="sell-title" className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">Ad Title *</label>
                  <input id="sell-title" type="text" required placeholder="e.g. iPhone 13 Pro 256GB Gold"
                    value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all placeholder:text-slate-400" />
                </div>

                {/* Category + Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sell-category" className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">Category *</label>
                    <select id="sell-category" value={category} onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all">
                      {PRESET_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="sell-price" className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">Price (PKR) *</label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-slate-500 font-semibold text-xs">Rs.</div>
                      <input id="sell-price" type="number" required placeholder="120000"
                        value={price} onChange={(e) => setPrice(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all" />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="sell-location" className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">Location *</label>
                  <select id="sell-location" value={location} onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all">
                    {POPULAR_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                    Product Image *
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-lg cursor-pointer transition-all overflow-hidden"
                  >
                    {imagePreview ? (
                      <div className="relative h-40 w-full">
                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs font-bold">Change Image</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 flex flex-col items-center justify-center gap-2 text-slate-400">
                        <Upload size={28} />
                        <p className="text-xs font-semibold">Click to upload image</p>
                        <p className="text-[10px]">JPG, PNG, WEBP — max 5MB</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="sell-description" className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">Description *</label>
                  <textarea id="sell-description" rows={3} required
                    placeholder="Product ki condition, features, warranty wagera batayein..."
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 transition-all placeholder:text-slate-400" />
                </div>

                {/* Seller Preview */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=guest`}
                      alt={currentUser?.name} className="w-8 h-8 rounded-full border border-teal-600 bg-white" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-none">{currentUser?.name}</p>
                      <p className="text-[10px] text-slate-400 leading-none mt-1">Verified Seller</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-teal-900">{currentUser?.phone}</p>
                </div>

                {/* Submit */}
                <button id="submit-sell-ad" type="submit" disabled={loading}
                  className="w-full py-3 bg-teal-800 hover:bg-[#002f34] text-white font-bold rounded-lg text-sm transition-all shadow-md flex justify-center items-center gap-2 cursor-pointer mt-4 disabled:opacity-60">
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><PlusCircle size={18} /> Ad Post Karein</>
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
