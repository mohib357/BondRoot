import React from 'react';
import {
  X,
  Shield,
  FileText,
  HelpCircle,
  Lock,
  CheckCircle2,
  Database,
  Smartphone,
  Mail,
  Heart,
  Network,
} from 'lucide-react';

export type PublicModalType = 'privacy' | 'terms' | 'help' | null;

interface PublicLegalModalProps {
  type: PublicModalType;
  onClose: () => void;
  lang?: 'bn' | 'en';
}

export const PublicLegalModal: React.FC<PublicLegalModalProps> = ({
  type,
  onClose,
  lang = 'bn',
}) => {
  if (!type) return null;
  const isEnglish = lang === 'en';

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200/80 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh] neu-panel">

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-xs">
              {type === 'privacy' && <Shield className="w-5 h-5" />}
              {type === 'terms' && <FileText className="w-5 h-5" />}
              {type === 'help' && <HelpCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                {type === 'privacy' && (isEnglish ? 'Privacy Policy & Data Security' : 'গোপনীয়তা ও ডাটা সুরক্ষা নীতি')}
                {type === 'terms' && (isEnglish ? 'Terms of Service' : 'ব্যবহারের শর্তাবলী (Terms of Service)')}
                {type === 'help' && (isEnglish ? 'Help & Support Center' : 'সাহায্য ও সাপোর্ট সেন্টার')}
              </h3>
              <p className="text-[11px] text-emerald-200/90 font-medium">
                BondRoot Genealogy Platform • Public Access
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-700 dark:text-zinc-300 space-y-4 leading-relaxed">

          {type === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 space-y-1.5 neu-inset">
                <h4 className="font-extrabold text-xs flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>{isEnglish ? '100% Family Data Privacy Guarantee' : 'আপনার পারিবারিক ডাটা শতভাগ গোপন ও নিরাপদ'}</span>
                </h4>
                <p className="text-[11px] opacity-90">
                  {isEnglish
                    ? 'BondRoot ensures your lineage data and photographs are strictly protected and never shared with third parties.'
                    : 'BondRoot আপনার পারিবারিক তথ্য, রক্তের সম্পর্ক ও স্মৃতির ছবিকে সম্পূর্ণ গোপন রাখে। আপনার সম্মতি ছাড়া এই তথ্য কোনো তৃতীয় পক্ষের কাছে প্রকাশ করা হয় না।'}
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">১. তথ্য সংগ্রহ ও ব্যবহার (Data Collection):</h5>
                <p>
                  আমরা শুধুমাত্র আপনার বংশলতিকা গঠন, সম্পর্ক নির্ণয় এবং নোটিফিকেশন পাঠানোর উদ্দেশ্যে নাম, জন্ম তারিখ, ছবি এবং যোগাযোগের তথ্য গ্রহণ করি।
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">২. সার্ভারলেস এনক্রিপ্টেড ক্লাউড সেফটি:</h5>
                <p>
                  আপনার তথ্য ক্লাউড সার্ভারলেস Neon PostgreSQL ডাটাবেজে অত্যন্ত সুরক্ষিতভাবে সংরক্ষিত থাকে।
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">৩. আপনার নিয়ন্ত্রণাধিকার (Your Control):</h5>
                <p>
                  যেকোনো সময় আপনি আপনার নিজস্ব তথ্য সম্পাদনা, প্রোফাইল ছবি পরিবর্তন অথবা অ্যাকাউন্ট মুছে ফেলার অনুরোধ পাঠাতে পারবেন।
                </p>
              </div>
            </div>
          )}

          {type === 'terms' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 text-teal-900 dark:text-teal-200 space-y-1.5 neu-inset">
                <h4 className="font-extrabold text-xs flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>{isEnglish ? 'Terms of Use & Community Guidelines' : 'ব্যবহারের মৌলিক নিয়মাবলী'}</span>
                </h4>
                <p className="text-[11px] opacity-90">
                  {isEnglish
                    ? 'By using BondRoot, you agree to respect family heritage and maintain authentic lineage information.'
                    : 'BondRoot ব্যবহার করার মাধ্যমে আপনি সঠিক পারিবারিক তথ্য প্রদান এবং পারিবারিক সৌহার্দ্য বজায় রাখার সম্মতি প্রদান করছেন।'}
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">১. সঠিক তথ্য প্রদান (Authentic Lineage):</h5>
                <p>
                  বংশলতিকার পবিত্রতা রক্ষায় নির্ভুল রক্তের সম্পর্ক ও সঠিক পরিচয় যোগ করার অনুরোধ করা হচ্ছে।
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">২. ডেমো মোড নীতি (Demo Sandbox Policy):</h5>
                <p>
                  লগইন ছাড়া ডেমো মোডে যুক্ত করা তথ্য কেবল আপনার সাময়িক ব্রাউজার মেমোরিতে থাকবে, এটি স্থায়ী সার্ভারে সেভ হবে না।
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">৩. কনটেন্ট মালিকানা:</h5>
                <p>
                  আপনার আপলোড করা সকল ফ্যামিলি ছবি ও জীবনবৃত্তান্তের সম্পূর্ণ স্বত্ব আপনার নিজের।
                </p>
              </div>
            </div>
          )}

          {type === 'help' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 space-y-1.5 neu-inset">
                <h4 className="font-extrabold text-xs flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>{isEnglish ? 'How Can We Help You?' : 'সাহায্য ও কুইক গাইড'}</span>
                </h4>
                <p className="text-[11px] opacity-90">
                  {isEnglish
                    ? 'Find quick answers on creating family trees and connecting relatives.'
                    : 'পারিবারিক ট্রি তৈরি, আত্মীয় যোগ এবং জেমিনাই AI ফিচার ব্যবহারের কুইক গাইড।'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs mb-1">
                    ❓ কীভাবে নতুন সদস্য যোগ করবেন?
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                    ট্রি ভিউ থেকে যে সদস্যের সন্তান, পিতামাতা বা জীবনসঙ্গী যোগ করতে চান—তার কার্ডে '➕' বাটনে চাপ দিয়ে সহজেই যুক্ত করতে পারেন।
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs mb-1">
                    ❓ কীভাবে দুই সদস্যের সম্পর্ক বের করবেন?
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                    'সম্পর্ক অনুসন্ধান' বাটন চাপুন এবং যেকোনো দুই সদস্য নির্বাচন করুন। অ্যালগরিদম তাদের সম্পর্কের পথ এবং বাংলা সম্বোধন বের করে দেবে।
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ডেভেলপার সাপোর্ট ইমেইল:</span>
                  </h5>
                  <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                    muhibbul524@gmail.com
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60 text-center shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-zinc-700 transition cursor-pointer neu-button"
          >
            {isEnglish ? 'Close' : 'বন্ধ করুন'}
          </button>
        </div>

      </div>
    </div>
  );
};
