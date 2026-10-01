import React, { useState } from 'react';
import { Person, Gender } from '../types/person';
import { calculateAge, getFullName } from '../utils/relationship';
import {
  User,
  Calendar,
  MapPin,
  Heart,
  Shield,
  Edit2,
  Trash2,
  Eye,
  Columns,
  LayoutGrid,
  BookOpen,
  Briefcase,
  GitFork,
} from 'lucide-react';

interface PersonListProps {
  people: Person[];
  searchQuery: string;
  onSelectPerson: (person: Person) => void;
  onEditPerson: (person: Person) => void;
  onDeletePerson: (id: string) => void;
  lang?: 'bn' | 'en';
}

export const PersonList: React.FC<PersonListProps> = ({
  people,
  searchQuery,
  onSelectPerson,
  onEditPerson,
  onDeletePerson,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';
  const [genderFilter, setGenderFilter] = useState<'all' | Gender>('all');
  const [livingFilter, setLivingFilter] = useState<'all' | 'living' | 'deceased'>('all');
  const [rootsOnly, setRootsOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'name' | 'birth' | 'bonds'>('name');
  const [isSplitView, setIsSplitView] = useState<boolean>(false);
  const [activePersonId, setActivePersonId] = useState<string | null>(people[0]?.id || null);

  // Filter people
  const filtered = people.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = `${p.firstName} ${p.lastName} ${p.maidenName || ''}`.toLowerCase().includes(q);
      const matchBio = p.bio?.toLowerCase().includes(q);
      const matchPlace = (p.birthPlace || '').toLowerCase().includes(q);
      const matchOccupation = (p.occupation || '').toLowerCase().includes(q);
      const matchTag = p.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchBio && !matchPlace && !matchOccupation && !matchTag) {
        return false;
      }
    }

    if (genderFilter !== 'all' && p.gender !== genderFilter) return false;
    if (livingFilter === 'living' && !p.isLiving) return false;
    if (livingFilter === 'deceased' && p.isLiving) return false;
    if (rootsOnly && p.parentIds.length > 0) return false;

    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') {
      return a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName);
    }
    if (sortBy === 'birth') {
      const yearA = parseInt(a.birthDate?.substring(0, 4) || '9999', 10);
      const yearB = parseInt(b.birthDate?.substring(0, 4) || '9999', 10);
      return yearA - yearB;
    }
    if (sortBy === 'bonds') {
      const bondsA = a.parentIds.length + a.spouseIds.length + a.childrenIds.length + a.siblingIds.length;
      const bondsB = b.parentIds.length + b.spouseIds.length + b.childrenIds.length + b.siblingIds.length;
      return bondsB - bondsA;
    }
    return 0;
  });

  const activePerson = people.find((p) => p.id === activePersonId) || sorted[0] || null;

  return (
    <div className="space-y-4 pb-12">
      {/* Filter and View Layout Bar */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Gender Filter */}
          <div className="flex items-center space-x-1">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">
              {isEnglish ? 'Gender:' : 'লিঙ্গ:'}
            </span>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-zinc-200 focus:outline-none"
            >
              <option value="all">{isEnglish ? 'All' : 'সকল'}</option>
              <option value="male">{isEnglish ? 'Male' : 'পুরুষ'}</option>
              <option value="female">{isEnglish ? 'Female' : 'মহিলা'}</option>
            </select>
          </div>

          {/* Living Filter */}
          <div className="flex items-center space-x-1 ml-1">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">
              {isEnglish ? 'Status:' : 'অবস্থা:'}
            </span>
            <select
              value={livingFilter}
              onChange={(e) => setLivingFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-zinc-200 focus:outline-none"
            >
              <option value="all">{isEnglish ? 'All' : 'সকল'}</option>
              <option value="living">{isEnglish ? 'Living' : 'জীবিত'}</option>
              <option value="deceased">{isEnglish ? 'Deceased' : 'প্রয়াত'}</option>
            </select>
          </div>

          {/* Roots Only Toggle */}
          <label className="flex items-center space-x-1.5 ml-2 cursor-pointer text-slate-700 dark:text-zinc-300 font-medium">
            <input
              type="checkbox"
              checked={rootsOnly}
              onChange={(e) => setRootsOnly(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>{isEnglish ? 'Ancestors Only' : 'শুধু মূল পূর্বপুরুষ'}</span>
          </label>
        </div>

        {/* Sort & Split View Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 dark:text-zinc-400 font-medium">
            {isEnglish ? 'Sort:' : 'ক্রমানুসার:'}
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-zinc-200 focus:outline-none"
          >
            <option value="name">{isEnglish ? 'Name (A-Z)' : 'নাম (বর্ণানুক্রমে)'}</option>
            <option value="birth">{isEnglish ? 'Birth Year' : 'জন্মসাল'}</option>
            <option value="bonds">{isEnglish ? 'Most Connected' : 'সর্বাধিক রক্তসম্পর্ক'}</option>
          </select>

          {/* Split-view button for tablet & desktop */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-slate-200 dark:border-zinc-700">
            <button
              onClick={() => setIsSplitView(false)}
              className={`p-1.5 rounded-md transition ${!isSplitView ? 'bg-white dark:bg-zinc-700 text-emerald-600 shadow-2xs' : 'text-slate-500'}`}
              title={isEnglish ? 'Grid Layout' : 'গ্রিড ভিউ'}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsSplitView(true)}
              className={`p-1.5 rounded-md transition ${isSplitView ? 'bg-white dark:bg-zinc-700 text-emerald-600 shadow-2xs' : 'text-slate-500'}`}
              title={isEnglish ? 'Split Layout (Tablet & Desktop)' : 'স্প্লিট ভিউ (দ্বি-কলাম)'}
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Directory Display */}
      {sorted.length === 0 ? (
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-zinc-800 p-12 text-center text-slate-500">
          <User className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-700 mb-2" />
          <p className="text-base font-semibold text-slate-700 dark:text-zinc-300">
            {isEnglish ? 'No matching people found' : 'কোনো সদস্য পাওয়া যায়নি'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {isEnglish ? 'Try adjusting your filters or search terms.' : 'অনুগ্রহ করে সার্চ বা ফিল্টারের ধরন পরিবর্তন করুন।'}
          </p>
        </div>
      ) : isSplitView ? (
        /* Split-View Layout (Tablet & Foldable 768px - 1024px+) */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Left Column: Filterable List */}
          <div className="md:col-span-5 space-y-2 max-h-[72vh] overflow-y-auto pr-1">
            {sorted.map((person) => {
              const isSelected = activePerson?.id === person.id;
              return (
                <div
                  key={person.id}
                  onClick={() => setActivePersonId(person.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 shadow-xs'
                      : 'bg-white/70 dark:bg-zinc-900/70 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        person.gender === 'female'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {person.firstName[0]}
                      {person.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {getFullName(person)}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                        {person.occupation || (person.isLiving ? 'জীবিত' : 'প্রয়াত')}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {calculateAge(person.birthDate, person.deathDate, person.isLiving)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Active Profile Card */}
          <div className="md:col-span-7">
            {activePerson && (
              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-md space-y-5 animate-in fade-in duration-150">
                <div className="flex items-start justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
                  <div className="flex items-center space-x-3.5">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${
                        activePerson.gender === 'female'
                          ? 'bg-rose-500 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {activePerson.firstName[0]}
                      {activePerson.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {getFullName(activePerson)}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{activePerson.occupation || 'পারিবারিক সদস্য'}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectPerson(activePerson)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isEnglish ? 'Full View' : 'পূর্ণাঙ্গ প্রোফাইল'}</span>
                  </button>
                </div>

                {/* Biography Snippet */}
                {activePerson.bio && (
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{isEnglish ? 'Biography & Stories:' : 'পারিবারিক জীবনী ও রেকর্ড:'}</span>
                    </h5>
                    <p className="text-xs text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-zinc-700/60 leading-relaxed">
                      {activePerson.bio}
                    </p>
                  </div>
                )}

                {/* Bonds Summary */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200/60 dark:border-zinc-700/50">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      {isEnglish ? 'Parents:' : 'পিতা-মাতা:'}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      {activePerson.parentIds.length === 0 ? 'মূল পূর্বপুরুষ (Root)' : `${activePerson.parentIds.length} জন`}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200/60 dark:border-zinc-700/50">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      {isEnglish ? 'Children:' : 'সন্তান-সন্ততি:'}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      {activePerson.childrenIds.length} জন
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Standard Responsive Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((person) => {
            const isRoot = person.parentIds.length === 0;
            const bondTotal =
              person.parentIds.length +
              person.spouseIds.length +
              person.childrenIds.length +
              person.siblingIds.length;

            return (
              <div
                key={person.id}
                className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-zinc-800 hover:border-emerald-400 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 border-2 ${
                          person.gender === 'female'
                            ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}
                      >
                        {person.firstName[0]}
                        {person.lastName[0]}
                      </div>
                      <div>
                        <h3
                          onClick={() => onSelectPerson(person)}
                          className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition cursor-pointer"
                        >
                          {getFullName(person)}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">{person.occupation || 'পারিবারিক সদস্য'}</p>
                      </div>
                    </div>

                    {isRoot && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                        <Shield className="w-3 h-3 text-emerald-600" />
                        <span>Root</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{calculateAge(person.birthDate, person.deathDate, person.isLiving)}</span>
                    </div>
                    {person.birthPlace && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{person.birthPlace}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-2.5 bg-slate-50/80 dark:bg-zinc-950/60 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                    {bondTotal} টি রক্তের সংযোগ
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEditPerson(person)}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-white dark:hover:bg-zinc-800 rounded-md transition"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePerson(person.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white dark:hover:bg-zinc-800 rounded-md transition"
                      title="Delete Person"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectPerson(person)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-2xs transition"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{isEnglish ? 'View' : 'দেখুন'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
