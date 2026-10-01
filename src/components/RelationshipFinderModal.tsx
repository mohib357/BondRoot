import React, { useState, useEffect } from 'react';
import { Person } from '../types/person';
import { findRelationship, getFullName } from '../utils/relationship';
import { X, Compass, ArrowRight, Sparkles, ArrowLeftRight, MessageCircle, Clock, UserCheck, ShieldCheck } from 'lucide-react';

interface RelationshipFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  initialPersonA?: Person | null;
  initialPersonB?: Person | null;
  lang?: 'bn' | 'en';
}

export const RelationshipFinderModal: React.FC<RelationshipFinderModalProps> = ({
  isOpen,
  onClose,
  people,
  initialPersonA,
  initialPersonB,
  lang = 'bn',
}) => {
  const [personAId, setPersonAId] = useState<string>('');
  const [personBId, setPersonBId] = useState<string>('');
  const isEnglish = lang === 'en';

  useEffect(() => {
    if (!isOpen) return;
    if (initialPersonA) setPersonAId(initialPersonA.id);
    else if (people.length > 0 && !personAId) setPersonAId(people[0].id);

    if (initialPersonB) setPersonBId(initialPersonB.id);
    else if (people.length > 1 && !personBId) setPersonBId(people[1].id);
  }, [isOpen, initialPersonA, initialPersonB, people]);

  if (!isOpen) return null;

  const result = personAId && personBId ? findRelationship(personAId, personBId, people, isEnglish) : null;
  const personMap = new Map<string, Person>();
  people.forEach((p) => personMap.set(p.id, p));

  const personA = personMap.get(personAId);
  const personB = personMap.get(personBId);

  const [aiExplanation, setAiExplanation] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (!personA || !personB || !result || personAId === personBId) {
      setAiExplanation(null);
      return;
    }

    let active = true;
    setIsAiLoading(true);

    fetch('/api/ai/explain-relationship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personA: { name: personA.firstName, birthDate: personA.birthDate, gender: personA.gender },
        personB: { name: personB.firstName, birthDate: personB.birthDate, gender: personB.gender },
        path: result.path.map((p) => ({ relation: p.relation, relationBangla: p.relationBangla })),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (active && data.success) {
          setAiExplanation(data);
        }
      })
      .catch((err) => {
        console.error('AI explanation error:', err);
      })
      .finally(() => {
        if (active) setIsAiLoading(false);
      });

    return () => {
      active = false;
    };
  }, [personAId, personBId]);

  const handleSwap = () => {
    setPersonAId(personBId);
    setPersonBId(personAId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {isEnglish ? 'Kinship & Social Calling Finder' : 'আত্মীয়তার সম্পর্ক ও সম্বোধন নির্ণয়'}
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  {isEnglish ? 'Smart Kinship' : 'স্মার্ট সামাজিক সম্বোধন'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {isEnglish
                  ? 'Calculates direct social kinship, exact bloodline, and cultural calling terms'
                  : 'বংশলতিকার রক্তসম্পর্ক, সামাজিক পরিচয় এবং বয়সানুযায়ী সম্বোধন রীতি এক নজরে'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Selectors with Swap Button */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {isEnglish ? 'Person A (Origin Perspective)' : '১ম ব্যক্তি (যার দৃষ্টিকোণ থেকে)'}
              </label>
              <select
                value={personAId}
                onChange={(e) => setPersonAId(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {getFullName(p, isEnglish)} {p.birthDate ? `[জন্ম: ${p.birthDate}]` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button in center */}
            <div className="sm:hidden flex justify-center py-1">
              <button
                type="button"
                onClick={handleSwap}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                {isEnglish ? 'Swap Persons' : 'স্থান অদল-বদল'}
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  {isEnglish ? 'Person B (Relative / Target)' : '২য় ব্যক্তি (কাঙ্ক্ষিত আত্মীয়)'}
                </label>
                <button
                  type="button"
                  onClick={handleSwap}
                  title={isEnglish ? 'Swap perspective' : 'দৃষ্টিকোণ অদল-বদল করুন'}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  {isEnglish ? 'Swap' : 'অদল-বদল'}
                </button>
              </div>
              <select
                value={personBId}
                onChange={(e) => setPersonBId(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {getFullName(p, isEnglish)} {p.birthDate ? `[জন্ম: ${p.birthDate}]` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Display */}
          {personAId === personBId ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <p className="text-sm font-semibold text-amber-800">
                {isEnglish
                  ? 'Please select two distinct people to evaluate their kinship bond.'
                  : 'সম্পর্ক নির্ণয়ের জন্য অনুগ্রহ করে দুইজন আলাদা ব্যক্তি নির্বাচন করুন।'}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                {isEnglish ? 'Currently same person is selected on both sides.' : 'বর্তমানে একই ব্যক্তি দুই পাশেই নির্বাচিত রয়েছে।'}
              </p>
            </div>
          ) : !result ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
              <p className="text-sm font-semibold text-slate-700">
                {isEnglish ? 'No Bloodline Connection Found' : 'কোনো প্রত্যক্ষ রক্তসম্পর্ক পাওয়া যায়নি'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {isEnglish
                  ? 'These two individuals are not connected through any documented ancestors or descendants.'
                  : 'এই দুই ব্যক্তির মধ্যে বংশলতিকার কোনো অভিন্ন পূর্বপুরুষ বা সংযোগ রেকর্ড করা নেই।'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* PRIMARY HERO RESULT CARD */}
              <div className="bg-linear-to-br from-emerald-50 via-teal-50/50 to-white border-2 border-emerald-300 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                {/* Decorative background watermark */}
                <div className="absolute -right-6 -bottom-6 text-emerald-100 pointer-events-none opacity-40">
                  <Sparkles className="w-36 h-36" />
                </div>

                {/* Top Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2 relative z-10">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                    <UserCheck className="w-3 h-3" />
                    {isEnglish ? result.socialCategoryEn : result.socialCategoryBn}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    {isEnglish ? result.generationGapTextEn : result.generationGapTextBn}
                  </span>
                  {result.ageComparisonBn && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      {isEnglish ? result.ageComparisonEn : result.ageComparisonBn}
                    </span>
                  )}
                  {isAiLoading && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 rounded-full animate-pulse">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      Gemini AI বিশ্লেষণ চলছে...
                    </span>
                  )}
                </div>

                {/* Main Direct Relationship Label (বড় ও স্পষ্ট প্রধান রেজাল্ট) */}
                <div className="relative z-10 mt-1">
                  <p className="text-xs font-semibold text-slate-500 mb-0.5">
                    {isEnglish
                      ? `${personA?.firstName}'s relation with ${personB?.firstName}:`
                      : `${personA?.firstName}-এর সাপেক্ষে ${personB?.firstName}-এর সামাজিক পরিচয়:`}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight flex items-baseline gap-2">
                    <span>
                      {aiExplanation?.direct_relation || (isEnglish ? result.directLabelEn : result.directLabelBn)}
                    </span>
                  </h2>
                </div>

                {/* AI Explanation 2-line simple summary */}
                {aiExplanation?.explanation && (
                  <div className="relative z-10 mt-2 p-2.5 rounded-lg bg-emerald-100/60 border border-emerald-200 text-xs text-emerald-950 leading-relaxed font-medium">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 mb-0.5">
                      <Sparkles className="w-3 h-3 text-emerald-700" />
                      <span>{isEnglish ? 'Gemini Kinship Explanation:' : 'AI সহজ ব্যাখ্যা:'}</span>
                    </div>
                    {aiExplanation.explanation}
                  </div>
                )}

                {/* Full Bloodline Lineage Detail Subtitle (পূর্ণ বিবরণ) */}
                <div className="relative z-10 mt-2.5 pt-2.5 border-t border-emerald-200/80 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700">
                    <span className="font-bold text-slate-900">
                      {isEnglish ? 'Full Bloodline Detail: ' : 'পূর্ণ রক্তের বিবরণ: '}
                    </span>
                    <span className="bg-emerald-100/70 text-emerald-900 font-semibold px-2 py-0.5 rounded-md border border-emerald-200/60">
                      {isEnglish ? result.lineageDetailEn : result.lineageDetailBn}
                    </span>
                  </div>
                </div>
              </div>

              {/* CALLING TERM & SOCIAL ETIQUETTE BOX (সম্বোধন রীতি) */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                    <MessageCircle className="w-4 h-4 text-amber-700" />
                    <span>{isEnglish ? 'Social Addressing & Calling Etiquette:' : 'সামাজিক সম্বোধন রীতি (কী বলে ডাকবেন):'}</span>
                  </div>
                  {aiExplanation && (
                    <span className="text-[10px] font-semibold bg-amber-200/70 text-amber-900 px-2 py-0.2 rounded-full border border-amber-300">
                      AI Verified
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  {/* Primary calling sentence */}
                  <div className="flex items-start gap-2 bg-white/90 p-2.5 rounded-lg border border-amber-200/70">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      ১
                    </span>
                    <p className="font-semibold text-slate-800 leading-relaxed">
                      {aiExplanation?.calling_term || (isEnglish ? result.callingTermEn : result.callingTermBn)}
                    </p>
                  </div>

                  {/* Reverse calling sentence if available */}
                  {(aiExplanation?.reverse_calling_term || result.reverseCallingTermBn) && (
                    <div className="flex items-start gap-2 bg-white/70 p-2 rounded-lg border border-amber-100">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        ২
                      </span>
                      <p className="text-slate-700 leading-relaxed">
                        <span className="font-semibold text-slate-900">
                          {isEnglish ? 'Reverse Address: ' : 'পাল্টা সম্বোধন: '}
                        </span>
                        {aiExplanation?.reverse_calling_term || result.reverseCallingTermBn}
                      </p>
                    </div>
                  )}

                  {/* Cultural context */}
                  {aiExplanation?.cultural_context && (
                    <p className="text-[11px] text-amber-800 italic pt-1 pl-1">
                      💡 {aiExplanation.cultural_context}
                    </p>
                  )}
                </div>
              </div>

              {/* GRAPH TRAVERSAL PATH (ধাপসমূহ ও অ্যানিমেটেড পালস রেখা) */}
              {result.path.length > 0 && (
                <div className="bg-slate-50/80 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {isEnglish
                          ? `Kinship Graph Traversal (${result.path.length} ${result.path.length === 1 ? 'step' : 'steps'}):`
                          : `রক্তসম্পর্কের বংশলতিকা গ্রাফ ট্রাভার্সাল (${result.path.length}টি ধাপ):`}
                      </span>
                    </p>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                      {personA?.firstName} ➔ {personB?.firstName}
                    </span>
                  </div>

                  {/* SVG Animated Glowing Pulse Beam */}
                  <div className="w-full h-8 px-2 flex items-center">
                    <svg className="w-full h-6 overflow-visible" preserveAspectRatio="none">
                      <line
                        x1="5%"
                        y1="50%"
                        x2="95%"
                        y2="50%"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="pulse-edge"
                      />
                      <circle cx="5%" cy="50%" r="5" fill="#047857" />
                      <circle cx="95%" cy="50%" r="5" fill="#10b981" />
                    </svg>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-bold bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 px-3 py-1.5 rounded-xl text-slate-900 dark:text-white shadow-2xs">
                      {personA?.firstName}
                    </span>

                    {result.path.map((step, idx) => {
                      const targetPerson = personMap.get(step.toId);
                      const relLabel = isEnglish ? step.relation : step.relationBangla;
                      return (
                        <React.Fragment key={idx}>
                          <span className="text-emerald-600 font-bold flex items-center">
                            <ArrowRight className="w-3.5 h-3.5 mx-0.5 text-emerald-500 animate-pulse" />
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                              {relLabel}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 mx-0.5 text-emerald-500 animate-pulse" />
                          </span>
                          <span className={`font-semibold px-3 py-1.5 rounded-xl shadow-2xs ${
                            idx === result.path.length - 1
                              ? 'bg-emerald-600 text-white font-bold border border-emerald-700 shadow-md'
                              : 'bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200'
                          }`}>
                            {targetPerson?.firstName}
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {isEnglish ? 'BondRoot Kinship & Social Protocol v1.0' : 'বন্ডরুট সামাজিক আত্মীয়তা ও সম্বোধন প্রোটোকল'}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition shadow-2xs cursor-pointer"
          >
            {isEnglish ? 'Close' : 'বন্ধ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
