import React, { useState } from 'react';
import { Person } from '../types/person';
import { X, Calendar, Cake, Heart, Award, Sparkles, Filter, Clock } from 'lucide-react';
import { toBanglaNumber } from '../utils/relationship';

interface FamilyMilestonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  onSelectPerson: (p: Person) => void;
  lang?: 'bn' | 'en';
}

interface MilestoneEvent {
  person: Person;
  type: 'birthday' | 'death_anniversary' | 'marriage';
  title: string;
  year?: number;
  dateStr: string;
  monthDay: string; // MM-DD for sorting
  relativeNote: string;
}

export const FamilyMilestonesModal: React.FC<FamilyMilestonesModalProps> = ({
  isOpen,
  onClose,
  people,
  onSelectPerson,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';
  const [filterType, setFilterType] = useState<'all' | 'birthday' | 'death_anniversary'>('all');

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();

  // Extract all calendar events from people
  const events: MilestoneEvent[] = [];

  people.forEach((p) => {
    // 1. Birthday
    if (p.birthDate) {
      const year = parseInt(p.birthDate.substring(0, 4), 10);
      const parts = p.birthDate.split('-');
      const monthDay = parts.length >= 3 ? `${parts[1]}-${parts[2]}` : (parts.length === 2 ? `${parts[1]}-01` : '01-01');
      
      const ageThisYear = !isNaN(year) ? currentYear - year : 0;
      events.push({
        person: p,
        type: 'birthday',
        title: isEnglish ? `${p.firstName}'s Birthday` : `${p.firstName}-এর শুভ জন্মদিন`,
        year,
        dateStr: p.birthDate,
        monthDay,
        relativeNote: isEnglish
          ? (p.isLiving ? `Turns ${ageThisYear} this year (Born ${year})` : `Born in ${year}`)
          : (p.isLiving ? `এ বছর ${toBanglaNumber(ageThisYear)} তম বছর (জন্ম: ${toBanglaNumber(year)})` : `জন্মসাল: ${toBanglaNumber(year)}`),
      });
    }

    // 2. Remembrance / Death Anniversary
    if (!p.isLiving && p.deathDate) {
      const year = parseInt(p.deathDate.substring(0, 4), 10);
      const parts = p.deathDate.split('-');
      const monthDay = parts.length >= 3 ? `${parts[1]}-${parts[2]}` : '01-01';
      const passedYears = !isNaN(year) ? currentYear - year : 0;

      events.push({
        person: p,
        type: 'death_anniversary',
        title: isEnglish ? `${p.firstName}'s Remembrance Day` : `${p.firstName}-এর প্রয়াণ স্মরণবার্ষিকী`,
        year,
        dateStr: p.deathDate,
        monthDay,
        relativeNote: isEnglish
          ? `${passedYears} years of remembrance (Passed ${year})`
          : `প্রয়াণের ${toBanglaNumber(passedYears)} বছর (স্মরণীয় ${toBanglaNumber(year)})`,
      });
    }
  });

  // Sort events chronologically by monthDay
  events.sort((a, b) => a.monthDay.localeCompare(b.monthDay));

  const filteredEvents = events.filter((ev) => {
    if (filterType === 'all') return true;
    return ev.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isEnglish ? 'Family Milestones & Anniversaries' : 'পারিবারিক স্মরণিকা ও দিবসসমূহ'}</span>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold border border-amber-300 dark:border-amber-800">
                  {events.length} Events
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {isEnglish
                  ? 'Upcoming birthdays, remembrance days, and key family dates'
                  : 'বংশানুক্রমিক জন্মদিন ও প্রয়াণ স্মরণবার্ষিকীর ক্রমানুসারে সাজানো ক্যালেন্ডার'}
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

        {/* Filter Bar */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition font-medium ${
                filterType === 'all'
                  ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
              }`}
            >
              {isEnglish ? 'All Events' : 'সবগুলো'}
            </button>
            <button
              onClick={() => setFilterType('birthday')}
              className={`px-3 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
                filterType === 'birthday'
                  ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
              }`}
            >
              <Cake className="w-3 h-3" />
              <span>{isEnglish ? 'Birthdays' : 'জন্মদিন'}</span>
            </button>
            <button
              onClick={() => setFilterType('death_anniversary')}
              className={`px-3 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
                filterType === 'death_anniversary'
                  ? 'bg-slate-700 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{isEnglish ? 'Remembrance' : 'প্রয়াণ দিবস'}</span>
            </button>
          </div>
          <span className="text-[11px] text-slate-400">
            {filteredEvents.length} {isEnglish ? 'records' : 'টি রেকর্ড'}
          </span>
        </div>

        {/* Timeline Events List */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-3">
          {filteredEvents.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400 italic">
              {isEnglish ? 'No milestones recorded yet' : 'কোনো বিশেষ তারিখ পাওয়া যায়নি'}
            </p>
          ) : (
            filteredEvents.map((ev, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectPerson(ev.person);
                  onClose();
                }}
                className="group flex items-start space-x-3.5 p-3 rounded-xl bg-slate-50/70 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/60 transition cursor-pointer shadow-2xs hover:shadow-md"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs ${
                    ev.type === 'birthday'
                      ? 'bg-gradient-to-tr from-rose-500 to-pink-500'
                      : 'bg-gradient-to-tr from-slate-600 to-zinc-700'
                  }`}
                >
                  {ev.type === 'birthday' ? <Cake className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition truncate">
                      {ev.title}
                    </h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300">
                      {ev.dateStr}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                    {ev.relativeNote}
                  </p>
                </div>
              </div>
            ))
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
