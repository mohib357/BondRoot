import React from 'react';
import {
  X,
  GitFork,
  Compass,
  MessageSquare,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Network,
  Users,
  Calendar,
} from 'lucide-react';

export type FeatureSpotlightKey = 'tree' | 'kinship' | 'vault' | 'privacy' | null;

interface FeatureSpotlightModalProps {
  featureKey: FeatureSpotlightKey;
  onClose: () => void;
  onOpenAuth: () => void;
  lang?: 'bn' | 'en';
}

export const FeatureSpotlightModal: React.FC<FeatureSpotlightModalProps> = ({
  featureKey,
  onClose,
  onOpenAuth,
  lang = 'bn',
}) => {
  if (!featureKey) return null;
  const isEnglish = lang === 'en';

  const featureDetails = {
    tree: {
      icon: GitFork,
      color: 'emerald',
      titleBn: '🌳 ভিজ্যুয়াল বংশলতিকা (Interactive Family Tree)',
      titleEn: '🌳 Interactive Family Tree',
      subtitleBn: 'বহু-প্রজন্মের ইন্টারেক্টিভ ট্রি, রুট অ্যানসেস্টর ফিল্টারিং এবং স্পষ্ট সম্পর্কচিত্র।',
      subtitleEn: 'Multi-generational tree with root isolation, zoom/pan controls, and branch navigation.',
      highlightsBn: [
        'প্রজন্ম অনুযায়ী রঙ-সংকেত ও জুম-প্যান নেভিগেশন',
        'মূল পূর্বপুরুষ (Root Ancestor) ফিল্টারিং',
        'যেকোনো শাখা বা কান্ডের আলাদা ভিউ',
        'দ্বিপাক্ষিক পিতামাতা, সন্তান ও ভাইবোন সংযোগ'
      ],
      highlightsEn: [
        'Color-coded generational cards with zoom & pan',
        'Root ancestor branch filtering',
        'Sub-branch & isolated family view',
        'Automatic reciprocal relation connections'
      ]
    },
    kinship: {
      icon: Compass,
      color: 'purple',
      titleBn: '🧬 স্মার্ট সম্পর্ক নির্ণয় (Kinship Graph Engine)',
      titleEn: '🧬 Smart Relationship Finder',
      subtitleBn: 'যেকোনো দুই সদস্যের রক্তের বা বৈবাহিক সম্পর্কের যোগসূত্র এবং সামনাসামনি ডাকার সঠিক সম্বোধন।',
      subtitleEn: 'Instant graph traversal calculating exact blood paths and direct Bengali respectful calling terms.',
      highlightsBn: [
        'দুই সদস্য নির্বাচন করলেই স্বয়ংক্রিয় সম্পর্ক বের হওয়া',
        'ধাপে ধাপে বংশলতিকার সংযোগ পথ (Traversal Path) প্রদর্শন',
        'সামনাসামনি ডাকার সঠিক ও মিষ্টি বাংলা সম্বোধন (যেমন: চাচাতো ভাই, ভাগ্নে)',
        'রক্তের দূরবর্তী সম্পর্কও নির্ভুল হিসাব'
      ],
      highlightsEn: [
        'Instant graph traversal between any two family members',
        'Step-by-step lineage path traversal breakdown',
        'Direct respectful calling terms (e.g., Younger Brother, Cousin)',
        'Distant bloodline connection calculator'
      ]
    },
    vault: {
      icon: MessageSquare,
      color: 'teal',
      titleBn: '🔐 পারিবারিক মেমোরি ভল্ট (Family Vault & Chat)',
      titleEn: '🔐 Family Memory Vault & Chat',
      subtitleBn: 'পরিবারের গোপনীয় বার্তা, স্মরণীয় ঘটনা এবং জীবনবৃত্তান্ত নিরাপদে সংরক্ষণ।',
      subtitleEn: 'Private member-to-member messaging, event milestones, and photo gallery storage.',
      highlightsBn: [
        'পরিবারের সদস্যদের মধ্যে এন্ড-টু-এন্ড সিকিউর মেসেজিং',
        'পুরোনো ও নতুন স্মরণীয় ছবির ফটো ভল্ট',
        'পারিবারিক জন্ম, বিয়ে ও বিশেষ বার্ষিকী স্মরণিকা',
        'স্বয়ংক্রিয় রিয়েল-টাইম মেসেজ নোটিফিকেশন'
      ],
      highlightsEn: [
        'Secure member-to-member private messaging',
        'Photo gallery vault for lifetime memories',
        'Birthdays, marriages & milestone calendar',
        'Real-time push notifications for new messages'
      ]
    },
    privacy: {
      icon: Shield,
      color: 'amber',
      titleBn: '🛡️ সম্পূর্ণ প্রাইভেসি ফার্স্ট (Privacy First Protection)',
      titleEn: '🛡️ Privacy First Protection',
      subtitleBn: 'আপনার পারিবারিক তথ্যের সম্পূর্ণ নিয়ন্ত্রণ এবং আজীবন সুরক্ষার নিশ্চয়তা।',
      subtitleEn: 'Complete control over individual profile visibility and lifetime lineage security.',
      highlightsBn: [
        'আপনার অনুমতি ছাড়া কোনো তথ্য প্রকাশ করা হয় না',
        'এনক্রিপ্টেড ক্লাউড ব্যাকআপ ও ডাটা সুরক্ষা',
        'ব্যক্তিনির্দিষ্ট প্রোফাইল হাইড ও প্রাইভেসি কন্ট্রোল',
        'অ্যাকাউন্ট ও সম্পূর্ণ ডাটা ডাউনলোডের ক্ষমতা'
      ],
      highlightsEn: [
        'No data sharing without explicit user consent',
        'Encrypted serverless cloud storage backup',
        'Individual profile visibility & privacy options',
        'Complete data export & account control'
      ]
    }
  };

  const active = featureDetails[featureKey];
  const IconComp = active.icon;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-100 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200/80 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] neu-panel"
      >

        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-md">
              <IconComp className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">
                {isEnglish ? active.titleEn : active.titleBn}
              </h3>
              <span className="text-[11px] font-semibold text-emerald-200/90 block mt-0.5">
                BondRoot Platform Feature Spotlight
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700 dark:text-zinc-300">

          <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-zinc-200">
            {isEnglish ? active.subtitleEn : active.subtitleBn}
          </p>

          {/* Highlights Checklist */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 neu-inset">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{isEnglish ? 'Feature Capabilities:' : 'সুবিধাসমূহ:'}</span>
            </h4>
            {(isEnglish ? active.highlightsEn : active.highlightsBn).map((h, i) => (
              <div key={i} className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-semibold text-slate-700 dark:text-zinc-300">{h}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom CTA Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/60 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-300 transition cursor-pointer neu-button"
          >
            {isEnglish ? 'Close' : 'বন্ধ করুন'}
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer neu-button"
          >
            <span>{isEnglish ? 'Try It Now — Free' : 'এখনই ব্যবহার করে দেখুন'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
