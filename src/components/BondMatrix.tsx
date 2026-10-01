import React, { useState } from 'react';
import { Person } from '../types/person';
import { getFullName } from '../utils/relationship';
import { Heart, GitFork, Users, Network, ArrowRight } from 'lucide-react';

interface BondMatrixProps {
  people: Person[];
  onSelectPerson: (person: Person) => void;
  onOpenRelFinder: (personA?: Person, personB?: Person) => void;
}

export const BondMatrix: React.FC<BondMatrixProps> = ({
  people,
  onSelectPerson,
  onOpenRelFinder,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'spouses' | 'parents' | 'siblings'>('all');

  const personMap = new Map<string, Person>();
  people.forEach((p) => personMap.set(p.id, p));

  // Extract all distinct bonds
  interface BondPair {
    id: string;
    personA: Person;
    personB: Person;
    type: 'spouse' | 'parent-child' | 'sibling';
    label: string;
  }

  const bonds: BondPair[] = [];
  const recorded = new Set<string>();

  people.forEach((p) => {
    // Spouses
    p.spouseIds.forEach((sid) => {
      const spouse = personMap.get(sid);
      if (!spouse) return;
      const key = [p.id, sid].sort().join('-');
      if (!recorded.has(key)) {
        recorded.add(key);
        bonds.push({
          id: key,
          personA: p,
          personB: spouse,
          type: 'spouse',
          label: 'Spouses / Partners',
        });
      }
    });

    // Parent -> Child
    p.childrenIds.forEach((cid) => {
      const child = personMap.get(cid);
      if (!child) return;
      const key = `${p.id}->${cid}`;
      if (!recorded.has(key)) {
        recorded.add(key);
        bonds.push({
          id: key,
          personA: p,
          personB: child,
          type: 'parent-child',
          label: 'Parent → Child (Lineage)',
        });
      }
    });

    // Siblings
    p.siblingIds.forEach((sibId) => {
      const sibling = personMap.get(sibId);
      if (!sibling) return;
      const key = [p.id, sibId].sort().join('-sib-');
      if (!recorded.has(key)) {
        recorded.add(key);
        bonds.push({
          id: key,
          personA: p,
          personB: sibling,
          type: 'sibling',
          label: 'Siblings',
        });
      }
    });
  });

  const filteredBonds = bonds.filter((b) => {
    if (filterType === 'spouses') return b.type === 'spouse';
    if (filterType === 'parents') return b.type === 'parent-child';
    if (filterType === 'siblings') return b.type === 'sibling';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Network className="w-5 h-5 text-emerald-600" />
            <span>Kinship Bond Connections ({bonds.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every direct biological and spousal relationship bond recorded across BondRoot.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              filterType === 'all'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Bonds ({bonds.length})
          </button>
          <button
            onClick={() => setFilterType('parents')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              filterType === 'parents'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Roots / Lineage
          </button>
          <button
            onClick={() => setFilterType('spouses')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              filterType === 'spouses'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Spouses
          </button>
          <button
            onClick={() => setFilterType('siblings')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              filterType === 'siblings'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Siblings
          </button>
        </div>
      </div>

      {/* Bond Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredBonds.map((bond) => (
          <div
            key={bond.id}
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[11px] mb-3">
              <span
                className={`font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  bond.type === 'spouse'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : bond.type === 'parent-child'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {bond.label}
              </span>

              <button
                onClick={() => onOpenRelFinder(bond.personA, bond.personB)}
                className="text-emerald-700 hover:text-emerald-800 hover:underline font-medium text-[11px]"
              >
                Trace Path
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 my-2">
              {/* Person A */}
              <div
                onClick={() => onSelectPerson(bond.personA)}
                className="flex-1 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
              >
                <div className="font-semibold text-xs text-slate-900 truncate">
                  {getFullName(bond.personA)}
                </div>
                <div className="text-[10px] text-slate-500">
                  {bond.personA.occupation || 'Member'}
                </div>
              </div>

              {/* Icon */}
              <div className="shrink-0 p-1.5 bg-slate-100 rounded-full text-slate-500">
                {bond.type === 'spouse' ? (
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                ) : bond.type === 'parent-child' ? (
                  <ArrowRight className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Users className="w-4 h-4 text-blue-500" />
                )}
              </div>

              {/* Person B */}
              <div
                onClick={() => onSelectPerson(bond.personB)}
                className="flex-1 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-right"
              >
                <div className="font-semibold text-xs text-slate-900 truncate">
                  {getFullName(bond.personB)}
                </div>
                <div className="text-[10px] text-slate-500">
                  {bond.personB.occupation || 'Member'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
