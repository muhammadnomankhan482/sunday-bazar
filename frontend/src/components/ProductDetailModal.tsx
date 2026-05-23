import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, MapPin, Calendar, Phone, ShieldCheck, HeartOff, Send, MessageCircle } from 'lucide-react';
import { Product, User } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  currentUser: User | null;
  onTriggerLoginRequired: () => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  currentUser,
  onTriggerLoginRequired,
}: ProductDetailModalProps) {
  const [numRevealed, setNumRevealed] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLogs, setChatLogs] = useState<Array<{ sender: 'user' | 'seller'; text: string; time: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);

  if (!product) return null;

  // Seller details (either custom or default mock)
  const sellerName = product.sellerName || product.brand || 'OLX Verified Seller';
  const sellerPhone = product.sellerPhone || '+92 345 9876543';
  const location = product.location || 'Karachi, Pakistan';
  const postDate = product.createdAt || 'Registered 3 days ago';

  const formatPrice = (p: number) => {
    return p.toLocaleString();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    if (!currentUser) {
      onTriggerLoginRequired();
      return;
    }

    const newMessage = {
      sender: 'user' as const,
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatLogs((prev) => [...prev, newMessage]);
    setChatMessage('');
    setIsTyping(true);

    // Bot replies with standard premium OLX marketplace negotiation in English
    setTimeout(() => {
      const sellerReplies = [
        "Thanks for your interest! What is your best offer for this item?",
        "My lowest price is Rs. " + Math.round(product.price * 0.95).toLocaleString() + " final. Let me know if that works.",
        "Yes, it is currently available. When would you like to inspect it?",
        "The item is in pristine condition and comes with the original box and documentation.",
        "The condition is 10/10 with absolutely no scratches. You won't find a better deal!",
        "I can do Rs. " + Math.round(product.price * 0.92).toLocaleString() + " if you can pick it up today. Deal?"
      ];
      const randomReply = sellerReplies[Math.floor(Math.random() * sellerReplies.length)];

      setChatLogs((prev) => [
        ...prev,
        {
          sender: 'seller' as const,
          text: randomReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="product-modal-overlay" className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          {/* Modal Container */}
          <motion.div
            id="product-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#f2f4f6] w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-slate-200 grid grid-cols-1 lg:grid-cols-12 max-h-[90vh]"
          >
            {/* Left Content Column (Hero, Details) - 7 cols */}
            <div id="product-detail-left-col" className="col-span-1 lg:col-span-7 flex flex-col overflow-y-auto p-4 md:p-6 space-y-4 max-h-[90vh]">
              {/* Back Button (Handy for mobile) */}
              <button
                id="back-to-feed-btn"
                onClick={onClose}
                className="self-start px-3 py-1.5 bg-white hover:bg-slate-100 text-[#002f34] border border-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <X size={14} /> Close & Back
              </button>

              {/* Main Image Banner Card */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden relative group">
                <div className="h-[250px] sm:h-[350px] w-full bg-slate-100 flex items-center justify-center p-4">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Favorite badge */}
                <button
                  id="modal-toggle-fav"
                  onClick={onToggleFavorite}
                  className="absolute top-4 right-4 bg-white hover:bg-rose-50 p-2.5 rounded-full shadow-md text-rose-500 transition-transform cursor-pointer"
                >
                  <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Title & Pricing Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h1 className="text-2xl font-bold text-[#002f34]">{product.title}</h1>
                  <span className="text-2xl font-black text-[#002f34] shrink-0 font-mono">
                    Rs. {formatPrice(product.price)}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-teal-700" />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-teal-700" />
                    <span>{postDate}</span>
                  </div>
                  {product.brand && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded uppercase tracking-wider text-[10px]">
                      {product.brand}
                    </span>
                  )}
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h4 className="font-bold text-slate-800 text-sm mb-3 uppercase tracking-wider font-mono">Detailed Description</h4>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>

                {/* Additional Attributes Grid */}
                <div className="grid grid-cols-2 gap-3 mt-6 border-t border-slate-100 pt-4 text-xs">
                  <div>
                    <span className="text-slate-400">Category:</span>
                    <p className="font-semibold text-slate-700 capitalize">{product.category}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Rating:</span>
                    <p className="font-semibold text-slate-700">★ {product.rating || '4.5'} / 5.0</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Warranty:</span>
                    <p className="font-semibold text-slate-700">{product.warrantyInformation || 'No warranty details'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Shipping:</span>
                    <p className="font-semibold text-slate-700">{product.shippingInformation || 'Self pickup or courier delivery'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Seller Column (Contacts, Interactive Negotiator) - 5 cols */}
            <div id="product-detail-right-col" className="col-span-1 lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col p-4 md:p-6 justify-between max-h-[90vh]">
              {/* Top Seller Card Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Seller Profile</span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    <ShieldCheck size={14} /> Checked Ad
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3.5 items-center">
                  <div className="w-12 h-12 rounded-full border border-teal-600 bg-teal-50 flex items-center justify-center font-bold text-[#002f34] overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(sellerName)}`}
                      alt={sellerName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-extrabold text-[#002f34] text-base leading-tight">{sellerName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Member since May 2024</p>
                  </div>
                </div>

                {/* Call Seller Reveal Button */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone size={16} className="text-teal-700" />
                      <span className="text-xs font-semibold">Contact Seller</span>
                    </div>
                    {numRevealed && (
                      <span className="text-emerald-600 font-bold text-xs tracking-wider animate-pulse uppercase">Active Now</span>
                    )}
                  </div>

                  {numRevealed ? (
                    <div className="text-center bg-teal-50/50 border border-teal-100 py-3 rounded-lg">
                      <a
                        id="call-seller-href"
                        href={`tel:${sellerPhone}`}
                        className="text-lg font-black text-[#002f34] hover:underline"
                      >
                        {sellerPhone}
                      </a>
                      <p className="text-[10px] text-teal-700 mt-1">Click above to call directly or WhatsApp</p>
                    </div>
                  ) : (
                    <button
                      id="reveal-seller-phone"
                      onClick={() => setNumRevealed(true)}
                      className="w-full py-2.5 bg-[#002f34] hover:bg-teal-950 text-white font-bold rounded-xl text-xs sm:text-sm tracking-wide transition-all shadow-md cursor-pointer flex justify-center items-center gap-2"
                    >
                      Show Phone Number
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive Bargaining Chat Logs */}
              <div className="flex flex-col flex-1 min-h-[180px] sm:min-h-[250px] border border-slate-100 rounded-2xl p-3 bg-slate-50 mt-4 overflow-hidden justify-between">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2 bg-slate-50 md:sticky md:top-0 z-10 shrink-0">
                  <MessageCircle size={15} className="text-teal-700" />
                  <span className="text-xs font-bold text-slate-700">Bargaining Hub (Direct Chat)</span>
                </div>

                {/* Log messages scrollbox */}
                <div className="flex-1 overflow-y-auto space-y-2 p-1 text-xs">
                  {chatLogs.length === 0 ? (
                    <div id="no-chat-history" className="h-full flex flex-col items-center justify-center p-3 text-center text-slate-400 space-y-1.5">
                      <span className="text-2xl">💬</span>
                      <p className="font-semibold text-[11px]">Bargain with {sellerName}!</p>
                      <p className="text-[10px] max-w-[200px]">Send a message below to start negotiating final price.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {chatLogs.map((log, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col ${log.sender === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl px-2.5 py-1.5 shadow-xs ${
                              log.sender === 'user'
                                ? 'bg-[#002f34] text-white rounded-tr-none'
                                : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                            }`}
                          >
                            <p>{log.text}</p>
                          </div>
                          <span className="text-[9px] text-slate-400 mt-0.5 px-0.5">{log.time}</span>
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1 py-0.5 italic">
                          <span className="flex gap-0.5">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                          </span>
                          <span>{sellerName} is typing...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Form sending block */}
                <form onSubmit={handleSendMessage} className="mt-2 shrink-0">
                  <div className="flex gap-1">
                    <input
                      id="chat-input-text"
                      type="text"
                      placeholder={currentUser ? "Type your offer (e.g., 'Is the price negotiable?')" : "Please log in to bargain"}
                      disabled={false} // Allow typing so they trigger login warn gracefully or write
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-200 bg-white text-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-teal-700 outline-none"
                    />
                    <button
                      id="send-chat-btn"
                      type="submit"
                      disabled={!chatMessage.trim()}
                      className="p-1.5 bg-teal-800 hover:bg-[#002f34] disabled:bg-slate-300 text-white rounded-xl transition-colors cursor-pointer"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
