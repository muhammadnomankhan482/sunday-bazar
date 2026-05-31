"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Phone, User as UserIcon, LogIn, Sparkles } from 'lucide-react';
import { User } from '../types';
import { loginUser, registerUser, saveToken } from '../lib/api';

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setError('');
  };

  const handleLoadDemo = () => {
    setEmail('demo@sunday.com');
    setPassword('password123');
    setName('Muhammad Noman');
    setPhone('+92 300 1234567');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email aur password zaroor bharo.');
      return;
    }
    if (!isLoginView && !name) {
      setError('Signup ke liye naam bhi zaroor hai.');
      return;
    }

    setLoading(true);

    try {
      if (isLoginView) {
        // ── LOGIN ──────────────────────────────────────────────
        const res = await loginUser({ email, password });

        // Token save karo
        const token = res.token;
        if (!token) throw new Error('Server ne token nahi bheja.');
        saveToken(token);

        // User object banao — backend jo bhi return kare
        const userData = res.user || res;
        const loggedUser: User = {
          id: String(userData.id || userData.email || email),
          name: (userData as any).username || userData.name || email.split('@')[0],
          email: userData.email || email,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
          phone: userData.phone || '+92 300 0000000',
          isLoggedIn: true,
          createdAt: new Date().toLocaleDateString(),
        };

        // localStorage mein save karo
        localStorage.setItem('sb_current_user', JSON.stringify(loggedUser));
        onLoginSuccess(loggedUser);
        onClose();
        resetForm();

      } else {
        // ── REGISTER ───────────────────────────────────────────
        const res = await registerUser({ username: name, email, password, phone });

        // Kuch backends register ke baad seedha token dete hain
        if (res.token) {
          saveToken(res.token);
        }

        // Register ke baad auto-login
        const loginRes = await loginUser({ email, password });
        if (!loginRes.token) throw new Error('Login ke baad token nahi mila.');
        saveToken(loginRes.token);

        const userData = loginRes.user || loginRes;
        const loggedUser: User = {
          id: String(userData.id || email),
          name: name,
          email: email,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
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
      // Axios error response
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Kuch masla hua. Dobara koshish karo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="auth-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <motion.div
            id="auth-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
          >
            {/* Header Strip */}
            <div className="bg-gradient-to-r from-teal-950 to-[#002f34] p-6 text-white text-center relative">
              <button
                id="close-auth-modal"
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="flex justify-center items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-teal-950 text-xl tracking-tighter">
                  SB
                </div>
                <span className="font-semibold text-lg tracking-wide uppercase">Sunday Bazar</span>
              </div>
              <p className="text-teal-200 text-xs font-medium tracking-wide">
                Apna Trusted Buying & Selling Portal
              </p>
            </div>

            {/* Form Area */}
            <div className="p-6 sm:p-8">
              {message && (
                <div
                  id="auth-warning-banner"
                  className="mb-5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex gap-2.5 items-start"
                >
                  <div className="bg-amber-100 p-1 rounded font-bold text-amber-700 mt-0.5">💡</div>
                  <div>{message}</div>
                </div>
              )}

              <h2 id="auth-modal-title" className="text-xl font-bold text-slate-800 mb-1">
                {isLoginView ? 'Wapas Aaiye!' : 'Naya Account Banayein'}
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                {isLoginView
                  ? 'Login karein aur ads post karein, sellers se baat karein'
                  : 'Register karein — bilkul free, koi jhanjhat nahi'}
              </p>

              {error && (
                <div
                  id="auth-error-block"
                  className="mb-4 text-xs bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name — only signup */}
                {!isLoginView && (
                  <div>
                    <label htmlFor="auth-name" className="block text-xs font-medium text-slate-700 mb-1">
                      Poora Naam
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 text-slate-400" size={16} />
                      <input
                        id="auth-name"
                        type="text"
                        placeholder="Muhammad Noman"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Phone — only signup */}
                {!isLoginView && (
                  <div>
                    <label htmlFor="auth-phone" className="block text-xs font-medium text-slate-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-slate-400" size={16} />
                      <input
                        id="auth-phone"
                        type="tel"
                        placeholder="+92 300 1234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="auth-email" className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      id="auth-email"
                      type="email"
                      placeholder="demo@sunday.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="auth-password" className="block text-xs font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      id="auth-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  id="submit-auth-form"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-teal-800 hover:bg-[#002f34] text-white font-medium rounded-lg text-sm transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn size={16} />
                      {isLoginView ? 'Log In' : 'Sign Up'}
                    </>
                  )}
                </button>
              </form>

              {/* Demo Helper */}
              <div className="relative my-6 text-center">
                <hr className="border-slate-100" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-white text-slate-400 text-[10px] tracking-wider uppercase font-medium">
                  Quick Demo
                </span>
              </div>

              <button
                id="load-demo-credentials"
                type="button"
                onClick={handleLoadDemo}
                className="w-full py-2 bg-gradient-to-r from-amber-50 to-amber-100/50 hover:from-amber-100 hover:to-amber-100 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={13} className="text-amber-600" />
                Demo Credentials Auto-fill
              </button>

              {/* Toggle Login/Register */}
              <p className="mt-6 text-center text-xs text-slate-500">
                {isLoginView ? 'Account nahi hai?' : 'Pehle se account hai?'}{' '}
                <button
                  id="toggle-auth-view"
                  type="button"
                  onClick={() => {
                    setIsLoginView(!isLoginView);
                    setError('');
                  }}
                  className="text-teal-700 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
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
