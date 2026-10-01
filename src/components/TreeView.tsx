import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Person } from '../types/person';
import { calculateAge, getFullName } from '../utils/relationship';
import {
  Heart,
  User,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  Focus,
  Calendar,
  Shield,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';

interface TreeViewProps {
  people: Person[];
  onSelectPerson: (person: Person) => void;
  onAddRelated: (relative: Person, relationType: 'parent' | 'child' | 'spouse') => void;
  lang?: 'bn' | 'en';
}

interface TreeNodeCardProps {
  person: Person;
  personMap: Map<string, Person>;
  isRoot: boolean;
  isEnglish: boolean;
  onSelectPerson: (p: Person) => void;
  onAddRelated: (relative: Person, relationType: 'parent' | 'child' | 'spouse') => void;
  onFocusBranch: (pId: string) => void;
}

// Memoized Individual Person Node Card for High-FPS Zoom & Drag
const TreeNodeCard = React.memo<TreeNodeCardProps>(({
  person,
  personMap,
  isRoot,
  isEnglish,
  onSelectPerson,
  onAddRelated,
  onFocusBranch,
}) => {
  const spouseObjects = useMemo(() => {
    return person.spouseIds
      .map((sid) => personMap.get(sid))
      .filter((s): s is Person => s !== undefined);
  }, [person.spouseIds, personMap]);

  return (
    <div className="flex items-stretch bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md rounded-2xl border border-white/60 dark:border-zinc-700/50 hover:border-emerald-500/80 dark:hover:border-emerald-500 shadow-md hover:shadow-xl transition-all duration-150 group overflow-hidden max-w-xs w-72 gpu-accelerated">
      {/* Person Card Body */}
      <div
        onClick={() => onSelectPerson(person)}
        className="p-4 cursor-pointer flex-1 flex flex-col justify-between select-none"
      >
        <div className="flex items-start space-x-3">
          {/* Duo-Tone Avatar */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border-2 shadow-xs ${
              person.gender === 'female'
                ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700'
                : person.gender === 'male'
                ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700'
                : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
            }`}
          >
            {person.firstName[0]}
            {person.lastName[0]}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                {getFullName(person)}
              </h4>
              {isRoot && (
                <span title="Root Ancestor">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
              {person.occupation || (person.isLiving ? (isEnglish ? 'Living' : 'জীবিত') : (isEnglish ? 'Deceased' : 'প্রয়াত'))}
            </p>

            <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-slate-400 dark:text-zinc-500">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{calculateAge(person.birthDate, person.deathDate, person.isLiving)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Root / Bond Badges */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-zinc-400 font-medium">
            {isRoot ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                {isEnglish ? 'Root Ancestor' : 'মূল পূর্বপুরুষ'}
              </span>
            ) : (
              `${person.childrenIds.length} ${isEnglish ? 'children' : 'সন্তান'}`
            )}
          </span>

          {spouseObjects.length > 0 && (
            <span className="flex items-center space-x-1 text-rose-600 dark:text-rose-400">
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
              <span className="text-[10px] font-semibold truncate max-w-[80px]">
                {spouseObjects[0].firstName}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Quick Action Side Strip */}
      <div className="bg-slate-50/80 dark:bg-zinc-950/60 border-l border-slate-200/80 dark:border-zinc-800 flex flex-col justify-around px-1 text-slate-400 dark:text-zinc-500">
        <button
          title="Add Child"
          onClick={(e) => {
            e.stopPropagation();
            onAddRelated(person, 'child');
          }}
          className="p-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          title="Add Spouse"
          onClick={(e) => {
            e.stopPropagation();
            onAddRelated(person, 'spouse');
          }}
          className="p-1.5 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition"
        >
          <Heart className="w-3.5 h-3.5" />
        </button>
        <button
          title="Focus Branch"
          onClick={(e) => {
            e.stopPropagation();
            onFocusBranch(person.id);
          }}
          className="p-1.5 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition"
        >
          <Focus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
});

TreeNodeCard.displayName = 'TreeNodeCard';

export const TreeView: React.FC<TreeViewProps> = ({
  people,
  onSelectPerson,
  onAddRelated,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';
  const [zoomLevel, setZoomLevel] = useState(1);
  const [focusedRootId, setFocusedRootId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, select, a, [data-no-drag]')) return;
    if (!canvasRef.current) return;
    isDraggingRef.current = true;
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: canvasRef.current.scrollLeft,
      scrollTop: canvasRef.current.scrollTop,
    };
    try {
      canvasRef.current.setPointerCapture(e.pointerId);
    } catch {}
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !canvasRef.current) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    canvasRef.current.scrollLeft = startPosRef.current.scrollLeft - dx;
    canvasRef.current.scrollTop = startPosRef.current.scrollTop - dy;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      if (canvasRef.current && canvasRef.current.hasPointerCapture(e.pointerId)) {
        canvasRef.current.releasePointerCapture(e.pointerId);
      }
    } catch {}
  }, []);

  // Map of people for fast lookup
  const personMap = useMemo(() => {
    const map = new Map<string, Person>();
    people.forEach((p) => map.set(p.id, p));
    return map;
  }, [people]);

  const roots = useMemo(() => {
    return people.filter((p) => p.parentIds.length === 0);
  }, [people]);

  const generations = useMemo(() => {
    const genMap = new Map<string, number>();

    roots.forEach((r) => genMap.set(r.id, 1));

    let changed = true;
    let iteration = 0;
    while (changed && iteration < 15) {
      changed = false;
      iteration++;

      for (const p of people) {
        if (p.parentIds.length > 0) {
          const parentGens = p.parentIds
            .map((pid) => genMap.get(pid))
            .filter((g): g is number => g !== undefined);

          if (parentGens.length > 0) {
            const calculatedGen = Math.max(...parentGens) + 1;
            if (genMap.get(p.id) !== calculatedGen) {
              genMap.set(p.id, calculatedGen);
              changed = true;
            }
          }
        }

        if (genMap.has(p.id)) {
          const currentGen = genMap.get(p.id)!;
          for (const sId of p.spouseIds) {
            if (!genMap.has(sId) || genMap.get(sId)! < currentGen) {
              genMap.set(sId, currentGen);
              changed = true;
            }
          }
        }
      }
    }

    people.forEach((p) => {
      if (!genMap.has(p.id)) {
        genMap.set(p.id, 1);
      }
    });

    const grouped: { [gen: number]: Person[] } = {};
    people.forEach((p) => {
      if (focusedRootId) {
        const isDescendantOrSpouse = checkIfRelatedToRoot(p.id, focusedRootId, personMap);
        if (!isDescendantOrSpouse) return;
      }

      const g = genMap.get(p.id) || 1;
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(p);
    });

    return grouped;
  }, [people, roots, focusedRootId, personMap]);

  const genKeys = useMemo(() => {
    return Object.keys(generations)
      .map(Number)
      .sort((a, b) => a - b);
  }, [generations]);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.log(err));
      setIsFullscreen(false);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col bg-slate-100/60 dark:bg-zinc-950/70 border border-slate-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[640px]'
      }`}
    >
      {/* Tree Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 z-20">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            {isEnglish ? 'Lineage Branch:' : 'শাখা নির্বাচন:'}
          </span>
          <select
            value={focusedRootId || 'all'}
            onChange={(e) => setFocusedRootId(e.target.value === 'all' ? null : e.target.value)}
            className="text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-1.5 font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">{isEnglish ? 'Full Family Tree (All Branches)' : 'সম্পূর্ণ বংশলতিকা (সকল শাখা)'}</option>
            {roots.map((r) => (
              <option key={r.id} value={r.id}>
                {isEnglish ? `Branch: ${getFullName(r)}` : `শাখা: ${getFullName(r)}`}
              </option>
            ))}
          </select>

          {focusedRootId && (
            <button
              onClick={() => setFocusedRootId(null)}
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
            >
              {isEnglish ? 'Reset' : 'রিসেট'}
            </button>
          )}
        </div>

        {/* Zoom & Fullscreen Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-100/90 dark:bg-zinc-800/90 rounded-xl p-1 border border-slate-200 dark:border-zinc-700">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
              className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-slate-600 dark:text-zinc-300 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono w-10 text-center text-slate-700 dark:text-zinc-300 font-semibold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
              className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-slate-600 dark:text-zinc-300 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-slate-600 dark:text-zinc-300 transition"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 transition shadow-xs"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Interactive Canvas */}
      <div
        id="bondroot-tree-canvas"
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={() => setZoomLevel(1)}
        style={{
          touchAction: 'pan-x pan-y',
          overscrollBehavior: 'contain',
        }}
        className="flex-1 overflow-auto p-6 sm:p-12 flex justify-center bg-grid-pattern relative select-none touch-pan-x touch-pan-y cursor-grab active:cursor-grabbing gpu-accelerated"
      >
        {people.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <User className="w-12 h-12 text-slate-300 dark:text-zinc-700 mb-3" />
            <p className="text-base font-semibold text-slate-700 dark:text-zinc-300">
              {isEnglish ? 'No people in the tree yet' : 'বংশলতিকায় কোনো সদস্য নেই'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isEnglish
                ? 'Add your first ancestor to begin growing your family roots.'
                : 'নতুন সদস্য যুক্ত করে আপনার বংশলতিকার সূচনা করুন।'}
            </p>
          </div>
        ) : (
          <div
            className="transition-transform duration-150 origin-top flex flex-col items-center space-y-12 pb-16 gpu-accelerated"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {genKeys.map((genNum, idx) => (
              <div key={genNum} className="flex flex-col items-center w-full">
                {/* Generational Header Pill */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-px w-12 bg-slate-300 dark:bg-zinc-700" />
                  <span className="px-4 py-1.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-emerald-900 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-300/80 dark:border-emerald-700/60 shadow-sm uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {genNum === 1
                        ? (isEnglish ? 'Root Generation (Ancestors)' : '১ম প্রজন্ম: মূল পূর্বপুরুষ (Roots)')
                        : genNum === 2
                        ? (isEnglish ? '2nd Generation (Parents & Kin)' : '২য় প্রজন্ম: পিতামাতা ও আত্মীয়')
                        : genNum === 3
                        ? (isEnglish ? '3rd Generation' : '৩য় প্রজন্ম: সন্তান ও ভাইবোন')
                        : `${genNum}তম প্রজন্ম`}
                    </span>
                  </span>
                  <div className="h-px w-12 bg-slate-300 dark:bg-zinc-700" />
                </div>

                {/* Nodes in this Generation */}
                <div className="flex flex-wrap justify-center gap-6 max-w-6xl">
                  {generations[genNum].map((person) => (
                    <TreeNodeCard
                      key={person.id}
                      person={person}
                      personMap={personMap}
                      isRoot={person.parentIds.length === 0}
                      isEnglish={isEnglish}
                      onSelectPerson={onSelectPerson}
                      onAddRelated={onAddRelated}
                      onFocusBranch={setFocusedRootId}
                    />
                  ))}
                </div>

                {/* Connector line between generations */}
                {idx < genKeys.length - 1 && (
                  <div className="w-0.5 h-8 bg-gradient-to-b from-slate-300 via-emerald-400 to-emerald-600 my-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function checkIfRelatedToRoot(
  targetId: string,
  rootId: string,
  personMap: Map<string, Person>
): boolean {
  if (targetId === rootId) return true;

  const target = personMap.get(targetId);
  if (!target) return false;

  if (target.spouseIds.includes(rootId)) return true;

  const visited = new Set<string>();
  const stack = [...target.parentIds];

  while (stack.length > 0) {
    const currId = stack.pop()!;
    if (currId === rootId) return true;
    if (!visited.has(currId)) {
      visited.add(currId);
      const curr = personMap.get(currId);
      if (curr) {
        stack.push(...curr.parentIds);
        if (curr.spouseIds.includes(rootId)) return true;
      }
    }
  }

  return false;
}
