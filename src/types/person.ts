export type Gender = 'male' | 'female' | 'other' | 'unspecified';

export interface MemoryItem {
  id: string;
  url: string;
  caption?: string;
  year?: string;
  createdAt?: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  maidenName?: string;
  gender: Gender;
  birthDate?: string;
  birthPlace?: string;
  isLiving: boolean;
  deathDate?: string;
  deathPlace?: string;
  occupation?: string;
  education?: string;
  currentLocation?: string;
  bio?: string;
  avatarUrl?: string;
  notes?: string;
  tags?: string[];
  
  // Social & Direct Connectivity
  phone?: string;
  whatsapp?: string;
  email?: string;
  facebook?: string;
  instagram?: string;

  // Family Memory Vault
  memories?: MemoryItem[];

  // Direct bonds
  parentIds: string[];
  spouseIds: string[];
  childrenIds: string[];
  siblingIds: string[];
}

export type ViewMode = 'tree' | 'directory' | 'bonds';
