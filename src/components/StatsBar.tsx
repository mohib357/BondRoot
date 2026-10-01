import React from 'react';
import { Person } from '../types/person';
import { Search, Trees, Heart, ShieldCheck, Sparkles } from 'lucide-react';

interface StatsBarProps {
  people: Person[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  people,
  searchQuery,
  onSearchChange,
}) => {
  const rootAncestors = people.filter((p) => p.parentIds.length === 0);
  const livingCount = people.filter((p) => p.isLiving).length;
  
  // Calculate total bonds (parents + spouses + children + siblings, divided by 2 to prevent double-counting)
  const totalBondConnections = Math.round(
    people.reduce(
      (sum, p) =>
        sum +
        p.parentIds.length +
        p.spouseIds.length +
        p.childrenIds.length +
        p.siblingIds.length,
      0
    ) / 2
  );

  return (
    <div className="bg-emerald-900 text-emerald-50 py-4 px-4 sm:px-6 lg:px-8 border-b border-emerald-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Quick Stats Cards */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center space-x-2 bg-emerald-800/80 px-3 py-1.5 rounded-lg border border-emerald-700/50">
            <Trees className="w-4 h-4 text-emerald-300" />
            <span>
              <strong className="text-white font-semibold">{people.length}</strong> People
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-800/80 px-3 py-1.5 rounded-lg border border-emerald-700/50">
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span>
              <strong className="text-white font-semibold">{rootAncestors.length}</strong> Roots
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-800/80 px-3 py-1.5 rounded-lg border border-emerald-700/50">
            <Heart className="w-4 h-4 text-rose-300" />
            <span>
              <strong className="text-white font-semibold">{totalBondConnections}</strong> Bonds
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 text-emerald-300 text-xs bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>BondRoot 1.0 • Hello World</span>
          </div>
        </div>

        {/* Right: Search Box */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search family by name, tag, place..."
            className="w-full bg-emerald-950/80 border border-emerald-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-white placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-emerald-300 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
