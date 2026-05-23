import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, LogIn, X } from 'lucide-react';

interface SellWarnPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToLogin: () => void;
}

export default function SellWarnPopup({ isOpen, onClose, onProceedToLogin }: SellWarnPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div id="sell-warn-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            id="sell-warn-card"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
          >
            {/* Warning Top Strip (Yellow alert theme) */}
            <div className="bg-amber-500 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="animate-bounce" size={20} />
                <span className="font-bold tracking-wide">Login Required!</span>
              </div>
              <button
                id="close-sell-warn-x"
                onClick={onClose}
                className="text-white hover:bg-black/10 p-1 rounded-full transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 text-center bg-white rounded-b-2xl">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
                <span className="text-3xl">🔑</span>
              </div>
              
              <h3 id="sell-warn-heading" className="text-lg font-bold text-slate-800 mb-2">Authentication Required</h3>
              
              <p id="sell-warn-desc" className="text-slate-600 text-sm leading-relaxed mb-6">
                To create a product listing or access seller details, please <span className="font-semibold text-slate-800">sign in to your verified account</span>. It takes less than 10 seconds!
              </p>

              <div className="flex flex-col gap-2">
                <button
                  id="sell-warn-login-btn"
                  onClick={onProceedToLogin}
                  className="w-full py-2.5 bg-[#002f34] hover:bg-[#002f34]/90 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-all duration-200 shadow-sm active:scale-98 flex justify-center items-center gap-2 cursor-pointer"
                >
                  <LogIn size={15} />
                  Log In or Sign Up Now
                </button>
                <button
                  id="sell-warn-cancel-btn"
                  onClick={onClose}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
