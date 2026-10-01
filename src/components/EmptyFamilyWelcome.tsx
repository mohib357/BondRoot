import React from 'react';
import {
  UserPlus,
  Sparkles,
  Network,
  Users,
  Compass,
  MessageSquare,
  Shield,
  ArrowRight,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { SAMPLE_DEMO_PEOPLE } from '../data/initialData';
import { Person } from '../types/person';

interface EmptyFamilyWelcomeProps {
  onAddFirstMember: () => void;
  onOpenSmartAIAdd: () => void;
  onLoadSampleData: (sample: Person[]) => void;
  lang?: 'bn' | 'en';
}

export const EmptyFamilyWelcome: React.FC<EmptyFamilyWelcomeProps> = ({
  onAddFirstMember,
  onOpenSmartAIAdd,
  onLoadSampleData,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12 animate-in fade-in zoom-in-95 duration-200">
      <div className="max-w-3xl w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-3xl shadow-2xl border border-emerald-100 dark:border-zinc-800 p-6 sm:p-10 text-center relative overflow-hidden">
        
        {/* Background Subtle Gradient Spheres */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-xl shadow-emerald-600/25 mb-6 ring-4 ring-emerald-50 dark:ring-zinc-800">
          <Network className="w-10 h-10 stroke-[2.2]" />
        </div>

        {/* Welcome Heading */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800 mb-4">
          <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{isEnglish ? 'Fresh & Clean Database' : 'সম্পূর্ণ ফ্রেশ ও নিরাপদ বংশলতিকা'}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          {isEnglish ? 'Welcome to BondRoot!' : 'স্বাগতম! আপনার পারিবারিক যাত্রা শুরু করুন'}
        </h2>
        
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-zinc-300 max-w-xl mx-auto leading-relaxed">
          {isEnglish
            ? 'Preserve your ancestral roots, build interactive multi-generational family trees, and stay connected with loved ones in real time.'
            : 'পারিবারিক শিকড় সংরক্ষণ করুন, বহু-প্রজন্মের ইন্টারঅ্যাক্টিভ বংশলতিকা সাজান এবং সদস্যদের সাথে সহজে যোগাযোগ রাখুন।'}
        </p>

        {/* Step Guide Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 text-left">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-zinc-800/60 border border-emerald-100 dark:border-zinc-700/60 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-3">
              ১
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-zinc-100 mb-1">
              {isEnglish ? '1. Add First Member' : '১. প্রথম সদস্য যোগ'}
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-normal">
              {isEnglish
                ? 'Add yourself or your root ancestor with real details and photo.'
                : 'নিজেকে অথবা পরিবারের আদি পূর্বপুরুষকে মূল ভিত্তি হিসেবে যোগ করুন।'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-zinc-800/60 border border-teal-100 dark:border-zinc-700/60 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-black text-xs flex items-center justify-center mb-3">
              ২
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-zinc-100 mb-1">
              {isEnglish ? '2. Connect Relations' : '২. শাখা বিস্তার'}
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-normal">
              {isEnglish
                ? 'Connect parents, children, and spouses with single-tap linking.'
                : 'পিতা-মাতা, সন্তান ও জীবনসঙ্গী যুক্ত করে সম্পূর্ণ পরিবার সাজান।'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-zinc-800/60 border border-purple-100 dark:border-zinc-700/60 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center mb-3">
              ৩
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-zinc-100 mb-1">
              {isEnglish ? '3. Kinship & Chat' : '৩. আত্মীয়তা ও বার্তা'}
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-normal">
              {isEnglish
                ? 'Discover Bengali kinship titles, Gemini AI bios, and real-time chat.'
                : 'বাংলা আত্মীয়তার সম্বোধন, এআই অন্তর্দৃষ্টি ও সরাসরি চ্যাট উপভোগ করুন।'}
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onAddFirstMember}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 active:scale-98 transition cursor-pointer"
          >
            <UserPlus className="w-5 h-5" />
            <span>{isEnglish ? 'Add First Member / Self' : 'প্রথম সদস্য যোগ করুন (শুরু করুন)'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onOpenSmartAIAdd}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800 font-bold text-sm transition cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{isEnglish ? 'Natural Language AI Add' : 'স্মার্ট AI মেম্বার এন্ট্রি'}</span>
          </button>
        </div>

        {/* Optional Demo Template Loader */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-center">
          <button
            onClick={() => onLoadSampleData(SAMPLE_DEMO_PEOPLE)}
            className="text-xs text-slate-500 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition cursor-pointer inline-flex items-center space-x-1"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 opacity-70" />
            <span>{isEnglish ? 'Or load sample demo family tree for exploration' : 'অথবা ডেমো নমুনা পরিবার লোড করে দেখতে পারেন'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
