import React, { useState, useEffect } from 'react';
import { Person } from '../types/person';
import { apiFetch } from '../utils/api';
import { X, Sparkles, TrendingUp, Users, GitFork, Award, RefreshCw, Loader2, BookOpen } from 'lucide-react';

interface LineageInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  lang?: 'bn' | 'en';
}

export const LineageInsightsModal: React.FC<LineageInsightsModalProps> = ({
  isOpen,
  onClose,
  people,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);

    const personMap = new Map<string, Person>();
    people.forEach((p) => personMap.set(p.id, p));

    const membersPayload = people.map((p) => ({
      name: `${p.firstName} ${p.lastName}`,
      gender: p.gender,
      birthDate: p.birthDate,
      parents: p.parentIds.map((id) => personMap.get(id)?.firstName || id),
      children: p.childrenIds.map((id) => personMap.get(id)?.firstName || id),
    }));

    try {
      const response = await apiFetch('/api/ai/lineage-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: membersPayload }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate lineage insights');
      }

      setInsights(data);
    } catch (err: any) {
      console.error('Error fetching lineage insights:', err);
      setError(err.message || 'বংশানুক্রমিক অন্তর্দৃষ্টি লোড করা যায়নি।');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !insights && !isLoading) {
      fetchInsights();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {isEnglish ? 'Lineage Insights Dashboard' : 'বংশানুক্রমিক অন্তর্দৃষ্টি ও পরিসংখ্যান'}
                <span className="text-[10px] font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                  Gemini Lineage AI
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {isEnglish
                  ? 'Deep AI statistical analysis of family branches, naming patterns, and heritage'
                  : 'পুরো বংশলতিকার শাখা-প্রশাখা, নামের মিল এবং ঐতিহাসিক মাইলফলক বিশ্লেষণ'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchInsights}
              disabled={isLoading}
              title={isEnglish ? 'Re-analyze' : 'পুনরায় বিশ্লেষণ করুন'}
              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {isLoading && !insights ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-700">
                {isEnglish
                  ? 'Gemini is analyzing the ancestral tree nodes & generational patterns...'
                  : 'জেমিনাই এআই পুরো বংশলতিকার প্রজন্ম ও রক্তের ধারা বিশ্লেষণ করছে...'}
              </p>
              <p className="text-xs text-slate-400">অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              <p className="font-bold mb-1">সমস্যা হয়েছে:</p>
              <p>{error}</p>
              <button
                onClick={fetchInsights}
                className="mt-3 px-3 py-1.5 bg-rose-600 text-white rounded-md font-semibold"
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          ) : insights ? (
            <div className="space-y-4">
              {/* Top Stats 3 Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-4 rounded-xl shadow-2xs">
                  <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold mb-1">
                    <span>{isEnglish ? 'Generations' : 'মোট প্রজন্ম'}</span>
                    <GitFork className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-950">
                    {insights.total_generations} {isEnglish ? 'Tiers' : 'টি ধাপ'}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1">
                    {isEnglish ? 'Active ancestral span' : 'মূল শিকড় থেকে তরুণ প্রজন্ম'}
                  </div>
                </div>

                <div className="bg-linear-to-br from-purple-50 to-indigo-50 border border-purple-200 p-4 rounded-xl shadow-2xs sm:col-span-2">
                  <div className="flex items-center justify-between text-purple-800 text-xs font-semibold mb-1">
                    <span>{isEnglish ? 'Dominant Family Branch' : 'বৃহত্তম পারিবারিক শাখা'}</span>
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-base font-bold text-purple-950 truncate">
                    {insights.largest_branch}
                  </div>
                  <div className="text-[11px] text-purple-700 mt-1">
                    {isEnglish ? 'Highest documented direct lineage descendants' : 'বংশলতিকায় সর্বাধিক সদস্য সম্বলিত শাখা'}
                  </div>
                </div>
              </div>

              {/* Common Naming Patterns / Trends */}
              {insights.name_trends && insights.name_trends.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
                    <TrendingUp className="w-4 h-4 text-amber-700" />
                    <span>{isEnglish ? 'Name Trends & Patterns:' : 'নামের মিল ও বংশানুক্রমিক ধারা (Name Trends):'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {insights.name_trends.map((trend: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-white border border-amber-300 text-amber-900 font-semibold px-2.5 py-1 rounded-lg text-xs shadow-2xs"
                      >
                        {trend}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Milestones */}
              {insights.key_milestones && insights.key_milestones.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>{isEnglish ? 'Key Family Milestones:' : 'বংশলতিকার উল্লেখযোগ্য মাইলফলকসমূহ:'}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {insights.key_milestones.map((m: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed font-medium">{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Narrative Summary */}
              {insights.narrative_summary && (
                <div className="bg-linear-to-r from-teal-50/70 to-emerald-50/70 border border-teal-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900 uppercase tracking-wider mb-1.5">
                    <BookOpen className="w-4 h-4 text-teal-700" />
                    <span>{isEnglish ? 'AI Lineage Narrative Story:' : 'পারিবারিক ঐতিহ্যের সারসংক্ষেপ:'}</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                    {insights.narrative_summary}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {isEnglish ? 'BondRoot Heritage Intelligence' : 'বন্ডরুট হেরিটেজ ইন্টেলিজেন্স'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition shadow-2xs"
          >
            {isEnglish ? 'Close' : 'বন্ধ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
