import React, { useState } from 'react';
import { toPng, toSvg } from 'html-to-image';
import { Person } from '../types/person';
import { X, Download, Image, FileText, Check, Loader2, Sparkles, Printer } from 'lucide-react';
import { toBanglaNumber } from '../utils/relationship';

interface PosterExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  treeElementId: string;
  lang?: 'bn' | 'en';
}

export const PosterExportModal: React.FC<PosterExportModalProps> = ({
  isOpen,
  onClose,
  people,
  treeElementId,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [posterTitle, setPosterTitle] = useState('আমাদের পারিবারিক বংশলতিকা');

  if (!isOpen) return null;

  const handleExportPNG = async () => {
    const node = document.getElementById(treeElementId);
    if (!node) {
      alert(isEnglish ? 'Canvas tree element not found' : 'ক্যানভাস এলিমেন্ট পাওয়া যায়নি');
      return;
    }

    setIsExporting(true);
    try {
      // Calculate full scrollable bounding dimensions to avoid any text clipping
      const scrollW = Math.max(node.scrollWidth, node.clientWidth, 1100);
      const scrollH = Math.max(node.scrollHeight, node.clientHeight, 700);

      const dataUrl = await toPng(node, {
        quality: 1,
        pixelRatio: 2, // Ultra high-resolution
        backgroundColor: '#f8fafc',
        width: scrollW,
        height: scrollH,
        style: {
          overflow: 'visible',
          width: `${scrollW}px`,
          height: `${scrollH}px`,
          maxWidth: 'none',
          maxHeight: 'none',
          transform: 'none',
          margin: '0',
        },
        filter: (childNode) => {
          // Exclude any controls or floating buttons if present
          if ((childNode as HTMLElement)?.dataset?.noExport) return false;
          return true;
        },
      });

      const link = document.createElement('a');
      link.download = `BondRoot-${posterTitle.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export poster PNG:', err);
      alert(isEnglish ? 'Could not generate poster image' : 'পোস্টার ইমেজ তৈরি করতে ব্যর্থ হয়েছে');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSVG = async () => {
    const node = document.getElementById(treeElementId);
    if (!node) return;

    setIsExporting(true);
    try {
      const scrollW = Math.max(node.scrollWidth, node.clientWidth, 1100);
      const scrollH = Math.max(node.scrollHeight, node.clientHeight, 700);

      const dataUrl = await toSvg(node, {
        width: scrollW,
        height: scrollH,
        style: {
          overflow: 'visible',
          width: `${scrollW}px`,
          height: `${scrollH}px`,
          maxWidth: 'none',
          maxHeight: 'none',
          transform: 'none',
        },
      });
      const link = document.createElement('a');
      link.download = `BondRoot-${posterTitle.replace(/\s+/g, '_')}-Vector.svg`;
      link.href = dataUrl;
      link.click();

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export vector SVG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isEnglish ? 'High-Res Poster & Vector Export' : 'হাই-রেজোলিউশন পোস্টার ও ভেক্টর এক্সপোর্ট'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {isEnglish
                  ? 'Export print-ready family tree posters (2x Resolution PNG, Vector SVG, or Print)'
                  : 'প্রিন্ট ও বাঁধাই উপযোগী আল্ট্রা-ক্লিয়ার পোস্টার ইমেজ ও ভেক্টর এক্সপোর্ট'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              {isEnglish ? 'Poster Banner Title' : 'পোস্টার ব্যানারের শিরোনাম:'}
            </label>
            <input
              type="text"
              value={posterTitle}
              onChange={(e) => setPosterTitle(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="p-4 bg-linear-to-br from-emerald-50/70 to-teal-50/70 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1">
              <span>{isEnglish ? 'Family Statistics Included' : 'সংযুক্ত পারিবারিক পরিসংখ্যান:'}</span>
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xs text-emerald-800/90 dark:text-emerald-400/90">
              মোট সদস্য: {toBanglaNumber(people.length)} জন • প্রজন্মের স্তরসমূহ • পূর্বপুরুষদের শিকড় ও সংযোগ
            </p>
          </div>

          {/* Export Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="p-4 rounded-xl border-2 border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-left transition flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                  PNG
                </span>
                <Download className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition transform" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {isEnglish ? 'Ultra-HD Poster (PNG)' : 'আল্ট্রা-এইচডি পোস্টার (PNG)'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  {isEnglish ? '2X Ultra-Resolution for Photo Paper' : 'ফটোপেপারে প্রিন্ট করার মতো ঝকঝকে ইমেজ'}
                </p>
              </div>
            </button>

            <button
              onClick={handleExportSVG}
              disabled={isExporting}
              className="p-4 rounded-xl border-2 border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-left transition flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                  SVG
                </span>
                <Download className="w-4 h-4 text-teal-600 group-hover:scale-110 transition transform" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {isEnglish ? 'Scalable Vector (SVG)' : 'ভেক্টর গ্রাফিক্স (SVG)'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  {isEnglish ? 'Infinite zoom, crisp lines' : 'যেকোনো বড় বিলবোর্ড বা ফ্রেমিংয়ের জন্য উপযুক্ত'}
                </p>
              </div>
            </button>
          </div>

          {/* Quick Print Action */}
          <div className="pt-2">
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-200 transition"
            >
              <Printer className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
              <span>{isEnglish ? 'Direct Print (Ctrl + P / Cmd + P)' : 'সরাসরি প্রিন্ট বা PDF হিসেবে সেভ করুন'}</span>
            </button>
          </div>

          {exportSuccess && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{isEnglish ? 'Export completed successfully!' : 'পোস্টার সফলভাবে ডাউনলোড হয়েছে!'}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-zinc-950/60 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg hover:bg-slate-100 transition shadow-2xs"
          >
            {isEnglish ? 'Close' : 'বন্ধ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
