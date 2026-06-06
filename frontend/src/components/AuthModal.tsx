"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Phone, User as UserIcon, LogIn, Upload } from 'lucide-react';
import { User } from '../types';
import { loginUser, saveToken } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  message?: string;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess, message }: AuthModalProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setEmail(''); setPassword(''); setName(''); setPhone('');
    setImageFile(null); setImagePreview(''); setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) { setError('Email aur password zaroor bharo.'); return; }
    if (!isLoginView && !name) { setError('Naam zaroor bharo.'); return; }
    if (!isLoginView && !imageFile) { setError('Profile image zaroor upload karein.'); return; }

    setLoading(true);

    try {
      if (isLoginView) {
        // ── LOGIN ──────────────────────────────────────────────
        const res = await loginUser({ email, password });
        const token = res.token;
        if (!token) throw new Error('Server ne token nahi bheja.');
        saveToken(token);

        const userData = res.user || res;
        const loggedUser: User = {
          id: String(userData.id || email),
          name: userData.name || email.split('@')[0],
          email: userData.email || email,
          avatar: (userData as any).avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
          phone: userData.phone || '+92 300 0000000',
          isLoggedIn: true,
          createdAt: new Date().toLocaleDateString(),
        };

        localStorage.setItem('sb_current_user', JSON.stringify(loggedUser));
        onLoginSuccess(loggedUser);
        onClose();
        resetForm();

      } else {
        // ── REGISTER — multipart/form-data ──────────────────────
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        if (phone) formData.append('phone', phone);
        formData.append('image', imageFile!);

        const regRes = await fetch(`${backendUrl}/register`, {
          method: 'POST',
          body: formData,
        });

        if (!regRes.ok) {
          const errData = await regRes.json().catch(() => ({}));
          throw new Error(errData.message || 'Registration failed.');
        }

        // Auto login after register
        const loginRes = await loginUser({ email, password });
        if (!loginRes.token) throw new Error('Login ke baad token nahi mila.');
        saveToken(loginRes.token);

        const userData = loginRes.user || loginRes;
        const loggedUser: User = {
          id: String(userData.id || email),
          name: name,
          email: email,
          avatar: (userData as any).avatar || imagePreview,
          phone: phone || '+92 300 0000000',
          isLoggedIn: true,
          createdAt: new Date().toLocaleDateString(),
        };

        localStorage.setItem('sb_current_user', JSON.stringify(loggedUser));
        onLoginSuccess(loggedUser);
        onClose();
        resetForm();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Kuch masla hua. Dobara koshish karo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <motion.div
            id="auth-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 my-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-950 to-[#002f34] p-6 text-white text-center relative">
              <button id="close-auth-modal" onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer">
                <X size={18} />
              </button>
              <div className="flex justify-center items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-teal-950 text-xl tracking-tighter">SB</div>
                <span className="font-semibold text-lg tracking-wide uppercase">Sunday Bazar</span>
              </div>
              <p className="text-teal-200 text-xs font-medium tracking-wide">Apna Trusted Buying & Selling Portal</p>
            </div>

            {/* Form */}
            <div className="p-6 sm:p-8">
              {message && (
                <div id="auth-warning-banner" className="mb-5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex gap-2.5 items-start">
                  <div className="bg-amber-100 p-1 rounded font-bold text-amber-700 mt-0.5">💡</div>
                  <div>{message}</div>
                </div>
              )}

              <h2 id="auth-modal-title" className="text-xl font-bold text-slate-800 mb-1">
                {isLoginView ? 'Wapas Aaiye!' : 'Naya Account Banayein'}
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                {isLoginView ? 'Login karein aur ads post karein' : 'Register karein — bilkul free'}
              </p>

              {error && (
                <div id="auth-error-block" className="mb-4 text-xs bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Signup only fields */}
                {!isLoginView && (
                  <>
                    {/* Name */}
                    <div>
                      <label htmlFor="auth-name" className="block text-xs font-medium text-slate-700 mb-1">Poora Naam</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 text-slate-400" size={16} />
                        <input id="auth-name" type="text" placeholder="Muhammad Noman" value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all" />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="auth-phone" className="block text-xs font-medium text-slate-700 mb-1">Mobile Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 text-slate-400" size={16} />
                        <input id="auth-phone" type="tel" placeholder="+92 300 1234567" value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all" />
                      </div>
                    </div>

                    {/* Profile Image Upload */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Profile Image *</label>
                      <div onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-lg cursor-pointer transition-all overflow-hidden">
                        {imagePreview ? (
                          <div className="relative h-28 w-full flex items-center justify-center bg-slate-50">
                            <img src={imagePreview} alt="preview" className="h-full object-contain" />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <p className="text-white text-xs font-bold">Change</p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-24 flex flex-col items-center justify-center gap-1.5 text-slate-400">
                            <Upload size={22} />
                            <p className="text-xs font-semibold">Click to upload profile photo</p>
                            <p className="text-[10px]">JPG, PNG — max 5MB</p>
                          </div>
                        )}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </div>
                  </>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="auth-email" className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input id="auth-email" type="email" placeholder="demo@sunday.com" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="auth-password" className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input id="auth-password" type="password" placeholder="••••••••" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all" />
                  </div>
                </div>

                {/* Submit */}
                <button id="submit-auth-form" type="submit" disabled={loading}
                  className="w-full py-2.5 bg-teal-800 hover:bg-[#002f34] text-white font-medium rounded-lg text-sm transition-all shadow-md flex justify-center items-center gap-2 cursor-pointer disabled:opacity-60">
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><LogIn size={16} />{isLoginView ? 'Log In' : 'Sign Up'}</>
                  )}
                </button>
              </form>

              {/* Toggle */}
              <p className="mt-6 text-center text-xs text-slate-500">
                {isLoginView ? 'Account nahi hai?' : 'Pehle se account hai?'}{' '}
                <button id="toggle-auth-view" type="button"
                  onClick={() => { setIsLoginView(!isLoginView); setError(''); }}
                  className="text-teal-700 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer">
                  {isLoginView ? 'Register karein' : 'Login karein'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
