import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Phone, User as UserIcon, LogIn, Sparkles } from 'lucide-react';
import { User } from '../types';
import { auth, isFirebaseConfigured, saveUserProfileToFirestore } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  message?: string; // Optional context message (e.g., "Pehle login karo...")
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess, message }: AuthModalProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fill in demo values to make testing swift and frictionless for the user
  const handleLoadDemo = () => {
    setEmail('demo@olx.com');
    setPassword('password');
    setName('Muhammad Noman');
    setPhone('+92 300 1234567');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in email and password fields.');
      return;
    }

    if (!isLoginView && (!name || !phone)) {
      setError('Please fill in your name and phone number to sign up.');
      return;
    }

    setLoading(true);

    const tryAuth = async () => {
      try {
        if (isLoginView) {
          // Firebase Sign In
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const fbUser = userCredential.user;
          const loggedUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || email.split('@')[0],
            email: email,
            avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
            phone: '+92 300 1234567',
            isLoggedIn: true,
            createdAt: new Date().toLocaleDateString(),
          };
          // Persist user profile to Firestore
          await saveUserProfileToFirestore({
            id: loggedUser.id,
            name: loggedUser.name,
            email: loggedUser.email,
            avatar: loggedUser.avatar,
            phone: loggedUser.phone,
            createdAt: loggedUser.createdAt,
          });
          onLoginSuccess(loggedUser);
          onClose();
        } else {
          // Firebase Sign Up
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const fbUser = userCredential.user;
          await updateProfile(fbUser, {
            displayName: name,
            photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`
          });
          const loggedUser: User = {
            id: fbUser.uid,
            name: name,
            email: email,
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
            phone: phone || '+92 300 1234567',
            isLoggedIn: true,
            createdAt: new Date().toLocaleDateString(),
          };
          // Persist user profile to Firestore
          await saveUserProfileToFirestore({
            id: loggedUser.id,
            name: loggedUser.name,
            email: loggedUser.email,
            avatar: loggedUser.avatar,
            phone: loggedUser.phone,
            createdAt: loggedUser.createdAt,
          });
          onLoginSuccess(loggedUser);
          onClose();
        }
        // Reset form states
        setEmail('');
        setPassword('');
        setName('');
        setPhone('');
      } catch (err: any) {
        console.warn("Firebase Authentication error (will fallback to simulated auth if unconfigured):", err);
        
        // Handle unconfigured key and invalid api credentials seamlessly
        if (!isFirebaseConfigured() || 
            err.message?.includes('API key') || 
            err.code?.includes('invalid-api-key') || 
            err.message?.includes('auth/invalid-api-key')) {
          
          setTimeout(() => {
            const loggedUser: User = {
              id: 'local_' + Math.random().toString(36).substr(2, 9),
              name: isLoginView ? (email === 'demo@olx.com' ? 'Muhammad Noman' : email.split('@')[0]) : name,
              email: email,
              avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
              phone: isLoginView ? (email === 'demo@olx.com' ? '+92 300 1234567' : '+92 345 9876543') : phone,
              isLoggedIn: true,
              createdAt: new Date().toLocaleDateString(),
            };
            onLoginSuccess(loggedUser);
            onClose();
            setEmail('');
            setPassword('');
            setName('');
            setPhone('');
          }, 600);
        } else {
          // Real error representation (e.g. wrong password, email already in use)
          if (err.code === 'auth/email-already-in-use') {
            setError('This email address is already in use by another account.');
          } else if (err.code === 'auth/weak-password') {
            setError('The password must be at least 6 characters long.');
          } else if (err.code === 'auth/invalid-email') {
            setError('Please enter a valid email address.');
          } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(err.message || 'Authentication error occurred.');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    tryAuth();
  };

  const handleGoogleSignIn = () => {
    setError('');
    setLoading(true);

    const tryGoogleAuth = async () => {
      try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const fbUser = userCredential.user;
        
        const loggedUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
          email: fbUser.email || '',
          avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fbUser.email || 'google')}`,
          phone: fbUser.phoneNumber || '+92 300 1234567',
          isLoggedIn: true,
          createdAt: new Date().toLocaleDateString(),
        };

        // Persist user profile to Firestore
        await saveUserProfileToFirestore({
          id: loggedUser.id,
          name: loggedUser.name,
          email: loggedUser.email,
          avatar: loggedUser.avatar,
          phone: loggedUser.phone,
          createdAt: loggedUser.createdAt,
        });

        onLoginSuccess(loggedUser);
        onClose();
      } catch (err: any) {
        console.warn("Google Authentication error (falling back to simulated logic if unconfigured):", err);

        // Fallback or handle cancelled popup/disabled environment
        if (!isFirebaseConfigured() || 
            err.message?.includes('API key') || 
            err.code?.includes('invalid-api-key') || 
            err.message?.includes('auth/invalid-api-key') ||
            err.code === 'auth/operation-not-supported-in-this-environment') {
          
          setTimeout(() => {
            const loggedUser: User = {
              id: 'local_google_' + Math.random().toString(36).substr(2, 9),
              name: 'Muhammad Noman (Google Direct)',
              email: email || 'noman.google@scrapped.bazar',
              avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=NomanGoogle',
              phone: '+92 301 9876543',
              isLoggedIn: true,
              createdAt: new Date().toLocaleDateString(),
            };
            onLoginSuccess(loggedUser);
            onClose();
          }, 600);
        } else if (err.code === 'auth/popup-closed-by-user') {
          setError('Google sign-in popup was closed before completing. Please try again.');
        } else {
          setError(err.message || 'Google Auth error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    tryGoogleAuth();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          {/* Modal Card */}
          <motion.div
            id="auth-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
          >
            {/* Header / Brand strip */}
            <div className="bg-gradient-to-r from-teal-950 to-[#002f34] p-6 text-white text-center relative">
              <button
                id="close-auth-modal"
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
              
              <div className="flex justify-center items-center gap-2 mb-2">
                {/* Visual custom polished logo */}
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-teal-950 text-xl tracking-tighter">
                  olx
                </div>
                <span className="font-semibold text-lg tracking-wide uppercase">Bazaar</span>
              </div>
              <p className="text-teal-200 text-xs font-medium tracking-wide">Your Trusted Buying & Selling Partner</p>
            </div>

            {/* Core Form Area */}
            <div className="p-6 sm:p-8">
              {message && (
                <div id="auth-warning-banner" className="mb-5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex gap-2.5 items-start">
                  <div className="bg-amber-100 p-1 rounded font-bold text-amber-700 mt-0.5">💡</div>
                  <div>{message}</div>
                </div>
              )}

              <h2 id="auth-modal-title" className="text-xl font-bold text-slate-800 mb-1">
                {isLoginView ? 'Welcome Back' : 'Create New Account'}
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                {isLoginView ? 'Enter your details to log in to post ads and contact sellers' : 'Register to easily post ads, save favorites, and chat.'}
              </p>

              {error && (
                <div id="auth-error-block" className="mb-4 text-xs bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLoginView && (
                  <>
                    {/* Name input (Only for Signup) */}
                    <div>
                      <label htmlFor="auth-name" className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 text-slate-400" size={16} />
                        <input
                          id="auth-name"
                          type="text"
                          placeholder="Mohammad Noman"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {/* Phone input (Only for Signup) */}
                    <div>
                      <label htmlFor="auth-phone" className="block text-xs font-medium text-slate-700 mb-1">Mobile Number</label>
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
                  </>
                )}

                {/* Email input */}
                <div>
                  <label htmlFor="auth-email" className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      id="auth-email"
                      type="email"
                      placeholder="demo@olx.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div>
                  <label htmlFor="auth-password" className="block text-xs font-medium text-slate-700 mb-1">Password</label>
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

                {/* Submit button */}
                <button
                  id="submit-auth-form"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-teal-800 hover:bg-[#002f34] text-white font-medium rounded-lg text-sm transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 flex justify-center items-center gap-2 cursor-pointer"
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

                {/* Google Auth Divider */}
                <div className="relative my-4 text-center">
                  <hr className="border-slate-100" />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-white text-slate-400 text-[10px] tracking-wider uppercase font-medium">Or continue with</span>
                </div>

                {/* Google Sign In/Up Button */}
                <button
                  id="google-auth-btn"
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs border border-slate-200 transition-all shadow-xs flex justify-center items-center gap-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-100"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isLoginView ? 'Sign in with Google' : 'Sign up with Google'}</span>
                </button>
              </form>

              {/* Demo Helper Button */}
              <div className="relative my-6 text-center">
                <hr className="border-slate-100" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-white text-slate-400 text-[10px] tracking-wider uppercase font-medium">Or Quick Demo</span>
              </div>

              <button
                id="load-demo-credentials"
                type="button"
                onClick={handleLoadDemo}
                className="w-full py-2 bg-gradient-to-r from-amber-50 to-amber-100/50 hover:from-amber-100 hover:to-amber-100 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={13} className="text-amber-600" />
                Auto-fill Demo Credentials
              </button>

              {/* View Switch Link */}
              <p className="mt-6 text-center text-xs text-slate-500">
                {isLoginView ? "Don't have an account?" : "Already possess an account?"}{' '}
                <button
                  id="toggle-auth-view"
                  type="button"
                  onClick={() => {
                    setIsLoginView(!isLoginView);
                    setError('');
                  }}
                  className="text-teal-700 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  {isLoginView ? 'Register/Sign Up Here' : 'Log In Here'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
