import React from 'react';
import { Person } from '../types/person';
import { Compass, Maximize2, RotateCcw } from 'lucide-react';

interface MinimapProps {
  people: Person[];
  selectedPersonId?: string | null;
  onSelectPerson: (p: Person) => void;
  onResetView?: () => void;
  lang?: 'bn' | 'en';
}

export const Minimap: React.FC<MinimapProps> = ({
  people,
  selectedPersonId,
  onSelectPerson,
  onResetView,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';

  // Group by generation tiers using parents
  const personMap = new Map<string, Person>();
  people.forEach((p) => personMap.set(p.id, p));

  const rootAncestors = people.filter((p) => p.parentIds.length === 0);

  return (
    <div className="hidden xl:block fixed bottom-6 right-6 z-30 w-56 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-white/40 dark:border-zinc-700/50 shadow-2xl p-3 animate-in fade-in zoom-in-95">
      <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-zinc-700/70 pb-2 mb-2">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
          <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{isEnglish ? 'Canvas Navigator' : 'ক্যানভাস মিনিম্যাপ'}</span>
        </div>
        {onResetView && (
          <button
            onClick={onResetView}
            title={isEnglish ? 'Reset View' : 'ভিউ রিসেট'}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Mini Node Graph */}
      <div className="h-32 bg-slate-50/70 dark:bg-zinc-950/50 rounded-xl p-2 relative overflow-hidden flex flex-col justify-between border border-slate-200/50 dark:border-zinc-800/80">
        {/* Tier indicators */}
        <div className="flex justify-center space-x-2">
          {rootAncestors.map((root) => (
            <button
              key={root.id}
              onClick={() => onSelectPerson(root)}
              title={`${root.firstName} (Root)`}
              className={`w-3.5 h-3.5 rounded-full transition transform hover:scale-125 ${
                selectedPersonId === root.id
                  ? 'bg-amber-500 ring-2 ring-amber-300'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            />
          ))}
        </div>

        {/* Mid Generation descendants */}
        <div className="flex justify-center flex-wrap gap-1.5 my-auto">
          {people
            .filter((p) => p.parentIds.length > 0 && p.childrenIds.length > 0)
            .map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectPerson(p)}
                title={`${p.firstName}`}
                className={`w-2.5 h-2.5 rounded-full transition transform hover:scale-150 ${
                  selectedPersonId === p.id
                    ? 'bg-amber-500 ring-2 ring-amber-300'
                    : p.gender === 'female'
                    ? 'bg-rose-500'
                    : 'bg-blue-500'
                }`}
              />
            ))}
        </div>

        {/* Youngest Leaf Generation */}
        <div className="flex justify-center flex-wrap gap-1.5">
          {people
            .filter((p) => p.childrenIds.length === 0)
            .map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectPerson(p)}
                title={`${p.firstName}`}
                className={`w-2 h-2 rounded-full transition transform hover:scale-150 ${
                  selectedPersonId === p.id
                    ? 'bg-amber-500 ring-2 ring-amber-300'
                    : p.gender === 'female'
                    ? 'bg-rose-400'
                    : 'bg-teal-500'
                }`}
              />
            ))}
        </div>

        {/* Viewport overlay watermark */}
        <div className="absolute inset-0 pointer-events-none border border-emerald-500/20 rounded-xl bg-emerald-500/5" />
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {rootAncestors.length} {isEnglish ? 'Roots' : 'শিকড়'}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          {people.length} {isEnglish ? 'Nodes' : 'সদস্য'}
        </span>
      </div>
    </div>
  );
};
