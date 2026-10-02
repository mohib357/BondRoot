import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import {
  X,
  Heart,
  Code,
  Mail,
  Send,
  MessageSquare,
  Check,
  Loader2,
  ExternalLink,
  Shield,
  Sparkles,
  GitBranch,
  Database,
  Smartphone,
  Award,
} from 'lucide-react';

interface DeveloperAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'bn' | 'en';
}

export const DeveloperAboutModal: React.FC<DeveloperAboutModalProps> = ({
  isOpen,
  onClose,
  lang = 'bn',
}) => {
  if (!isOpen) return null;
  const isEnglish = lang === 'en';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSending(true);
    try {
      await apiFetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      setSentSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSentSuccess(false), 5000);
    } catch (err) {
      console.error('Failed to send feedback:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header Cover */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 shadow-md">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold">
                {isEnglish ? 'About BondRoot & Developer' : 'অ্যাপ পরিচিতি ও ডেভেলপার বার্তা'}
              </h2>
              <p className="text-xs text-emerald-200 mt-0.5">
                {isEnglish
                  ? 'Mission to preserve ancestral heritage & Bengali kinship bonds'
                  : 'বাঙালি সংস্কৃতি, আত্মপরিচয় ও পারিবারিক রক্তসম্পর্ক সংরক্ষণের অঙ্গীকার'}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 text-xs">
          
          {/* Mission Section */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-5 rounded-2xl space-y-2">
            <h3 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>{isEnglish ? 'The Vision Behind BondRoot' : 'বন্ডরুট (BondRoot)-এর পেছনের গল্প ও উদ্দেশ্য'}</span>
            </h3>
            <p className="text-slate-700 dark:text-zinc-300 leading-relaxed font-normal">
              {isEnglish
                ? 'BondRoot was crafted with a heartfelt purpose: to protect multi-generational family ties, cherish departed ancestors, and resolve intricate kinship relationships with mathematical certainty. In an era of rapid urbanization, BondRoot ensures future generations never forget their true roots.'
                : 'আধুনিক নগরায়ন ও ব্যস্ততার যুগে আমাদের পারিবারিক শিকড় এবং পূর্বপুরুষের স্মৃতি যেন হারিয়ে না যায়—সেই মহৎ উদ্দেশ্যেই বন্ডরুট (BondRoot) নির্মিত। রক্তের সম্পর্কের সূক্ষ্ম হিসাব, নির্ভুল বাংলা সামাজিক সম্বোধন এবং পারিবারিক স্মৃতিবিজড়িত মুহূর্তগুলোকে ডিজিটাল ভল্টে চিরস্থায়ী করে রাখাই এই প্ল্যাটফর্মের মূল লক্ষ্য।'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
              <div className="flex items-center space-x-1.5 bg-white dark:bg-zinc-800 p-2 rounded-xl border border-emerald-100 dark:border-zinc-700">
                <GitBranch className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kinship Graph</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white dark:bg-zinc-800 p-2 rounded-xl border border-emerald-100 dark:border-zinc-700">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>Neon PostgreSQL</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white dark:bg-zinc-800 p-2 rounded-xl border border-emerald-100 dark:border-zinc-700">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Gemini AI Engine</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white dark:bg-zinc-800 p-2 rounded-xl border border-emerald-100 dark:border-zinc-700">
                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                <span>PWA Offline Vault</span>
              </div>
            </div>
          </div>

          {/* Developer Card */}
          <div className="bg-white dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 p-5 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-xs">
            <div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-xl border-4 border-white dark:border-zinc-700"
              style={{boxShadow: '4px 4px 12px rgba(99,102,241,0.4), -2px -2px 8px rgba(255,255,255,0.8)'}}
            >
              MI
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Muhibbul Islam
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                  Lead Architect & Full-Stack Engineer
                </span>
              </div>
              <p className="text-slate-500 dark:text-zinc-400 font-medium">
                Full-Stack Software Engineer • Kinship Graph Systems
              </p>
              <p className="text-[11px] italic text-indigo-700 dark:text-indigo-300 leading-relaxed pt-1 border-l-2 border-indigo-300 pl-2">
                "বন্ডরুট নির্মাণের পেছনে আমার লক্ষ্য — বাঙালি পারিবারিক বন্ধন, ইতিহাস ও ঐতিহ্যকে ডিজিটাল জগতে চিরকালের জন্য সংরক্ষণ করা।"
              </p>

              {/* Circular 3D Neumorphic Social / Contact Button Grid */}
              <div className="pt-3 space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 text-center sm:text-left">
                  {isEnglish ? 'Contact & Social Connect' : 'যোগাযোগ ও সোশ্যাল কানেক্ট'}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 py-2">

                  {/* 1. Direct Message */}
                  <div className="flex flex-col items-center group relative">
                    <button
                      type="button"
                      title={isEnglish ? 'Send Message' : 'সরাসরি বার্তা'}
                      onClick={() => setShowMessageForm(!showMessageForm)}
                      className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer relative"
                      style={{
                        borderRadius: '9999px',
                        boxShadow: '5px 5px 12px rgba(0,0,0,0.15), -4px -4px 10px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.5)'
                      }}
                    >
                      <MessageSquare className="w-5 h-5 text-white stroke-[2.2]" />
                    </button>
                    <span className="text-[10px] font-extrabold text-slate-600 dark:text-zinc-400 mt-1 text-center">
                      {isEnglish ? 'Message' : 'বার্তা'}
                    </span>
                  </div>

                  {/* 2. WhatsApp */}
                  <div className="flex flex-col items-center group relative">
                    <a
                      href="https://wa.me/8801700000000"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="WhatsApp"
                      className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 text-white flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer relative"
                      style={{
                        borderRadius: '9999px',
                        boxShadow: '5px 5px 12px rgba(0,0,0,0.15), -4px -4px 10px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.5)'
                      }}
                    >
                      <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.758.459 3.474 1.33 4.988l-1.413 5.163 5.286-1.385c1.458.796 3.104 1.215 4.782 1.216h.004c5.505 0 9.989-4.478 9.99-9.984 0-2.668-1.038-5.176-2.925-7.062a9.927 9.927 0 0 0-7.064-2.92zm5.82 14.161c-.246.691-1.229 1.263-1.697 1.341-.468.079-1.077.112-1.74-.087-.401-.121-.918-.287-1.583-.574-2.793-1.202-4.617-4.032-4.757-4.218-.14-.187-1.139-1.516-1.139-2.891 0-1.376.721-2.052.978-2.332.257-.281.562-.351.75-.351.187 0 .374.002.538.01.176.008.411-.067.644.492.234.56.795 1.942.865 2.083.07.14.117.304.023.491-.093.187-.14.304-.28.468-.14.164-.295.367-.422.492-.14.14-.286.293-.123.573.164.281.728 1.198 1.564 1.943 1.076.958 1.982 1.255 2.263 1.396.281.14.445.117.608-.07.164-.187.702-.818.89-1.099.187-.281.374-.234.632-.14.257.094 1.637.772 1.918.913.281.14.468.211.538.328.07.117.07.679-.176 1.37z"/>
                      </svg>
                    </a>
                    <span className="text-[10px] font-extrabold text-slate-600 dark:text-zinc-400 mt-1 text-center">
                      WhatsApp
                    </span>
                  </div>

                  {/* 3. Email */}
                  <div className="flex flex-col items-center group relative">
                    <a
                      href="mailto:muhibbul524@gmail.com"
                      title={isEnglish ? 'Email' : 'ইমেইল'}
                      className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 text-white flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer relative"
                      style={{
                        borderRadius: '9999px',
                        boxShadow: '5px 5px 12px rgba(0,0,0,0.15), -4px -4px 10px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.5)'
                      }}
                    >
                      <Mail className="w-5 h-5 text-white stroke-[2.2]" />
                    </a>
                    <span className="text-[10px] font-extrabold text-slate-600 dark:text-zinc-400 mt-1 text-center">
                      {isEnglish ? 'Email' : 'ইমেইল'}
                    </span>
                  </div>

                  {/* 4. Facebook */}
                  <div className="flex flex-col items-center group relative">
                    <a
                      href="https://facebook.com/muhibbul524"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Facebook"
                      className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer relative"
                      style={{
                        borderRadius: '9999px',
                        boxShadow: '5px 5px 12px rgba(0,0,0,0.15), -4px -4px 10px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.5)'
                      }}
                    >
                      <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-4.873-12-10.875-12S2.25 5.446 2.25 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H9.078v-3.47h3.297V9.43c0-3.253 1.934-5.05 4.901-5.05 1.42 0 2.903.254 2.903.254v3.193h-1.637c-1.611 0-2.114.998-2.114 2.023v2.428h3.601l-.575 3.47h-3.026v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <span className="text-[10px] font-extrabold text-slate-600 dark:text-zinc-400 mt-1 text-center">
                      Facebook
                    </span>
                  </div>

                  {/* 5. Instagram */}
                  <div className="flex flex-col items-center group relative">
                    <a
                      href="https://instagram.com/muhibbul524"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Instagram"
                      className="w-12 h-12 sm:w-13 sm:h-13 rounded-full text-white flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer relative"
                      style={{
                        borderRadius: '9999px',
                        background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                        boxShadow: '5px 5px 12px rgba(0,0,0,0.15), -4px -4px 10px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.5)'
                      }}
                    >
                      <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                    <span className="text-[10px] font-extrabold text-slate-600 dark:text-zinc-400 mt-1 text-center">
                      Instagram
                    </span>
                  </div>

                </div>
              </div>

              {/* Inline collapsible quick-message form (UI only, no API call) */}
              {showMessageForm && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 space-y-2 animate-in fade-in duration-150">
                  <textarea
                    rows={3}
                    placeholder="আপনার বার্তা লিখুন..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSentSuccess(true);
                      setMessage('');
                      setShowMessageForm(false);
                      setTimeout(() => setSentSuccess(false), 4000);
                    }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold active:scale-95 transition"
                  >
                    পাঠাও ✉️
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Feedback & Message Contact Form */}
          <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700/80 p-5 rounded-2xl space-y-3">
            <div>
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isEnglish ? 'Send Direct Feedback or Message' : 'ডেভেলপারকে সরাসরি বার্তা বা ফিডব্যাক পাঠান'}</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                অ্যাপ সম্পর্কিত যেকোনো পরামর্শ, আত্মীয়তার কোনো সূক্ষ্ম নিয়ম বা নতুন ফিচারের অনুরোধ থাকলে সরাসরি লিখুন।
              </p>
            </div>

            {sentSuccess && (
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>আপনার বার্তা ও পরামর্শ সফলভাবে পৌঁছেছে! ধন্যবাদ।</span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">আপনার নাম *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. তানভীর আহমেদ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">ইমেইল (ঐচ্ছিক)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tanvir@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">আপনার বার্তা / পরামর্শ *</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="বন্ডরুট অ্যাপ নিয়ে আপনার অনুভূতি বা কোনো নতুন ফিচারের মতামত জানান..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold transition shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>বার্তা পাঠানো হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>বার্তা পাঠান</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 text-[11px] text-slate-400 dark:text-zinc-500 flex items-center justify-between">
          <span>BondRoot Genealogic Architecture • 2026</span>
          <span>Crafted with Pride for Family Heritage</span>
        </div>
      </div>
    </div>
  );
};
