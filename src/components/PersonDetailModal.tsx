import React, { useState, useRef } from 'react';
import { Person, MemoryItem } from '../types/person';
import { calculateAge, getFullName } from '../utils/relationship';
import { apiFetch } from '../utils/api';
import {
  X,
  Calendar,
  MapPin,
  Heart,
  GitFork,
  Users,
  Edit2,
  Plus,
  Shield,
  Briefcase,
  GraduationCap,
  BookOpen,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Save,
  PenTool,
  Clock,
  Phone,
  MessageCircle,
  Mail,
  Share2,
  Camera,
  Image as ImageIcon,
  Maximize2,
  Trash2,
  Upload,
  MessageSquare,
} from 'lucide-react';

interface PersonDetailModalProps {
  person: Person | null;
  allPeople: Person[];
  onClose: () => void;
  onSelectPerson: (p: Person) => void;
  onEditPerson: (p: Person) => void;
  onAddRelated: (relative: Person, type: 'parent' | 'child' | 'spouse') => void;
  onSaveBio?: (personId: string, bio: string) => void;
  onUpdatePerson?: (updated: Person) => void;
  onOpenChat?: (person: Person) => void;
  lang?: 'bn' | 'en';
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  person,
  allPeople,
  onClose,
  onSelectPerson,
  onEditPerson,
  onAddRelated,
  onSaveBio,
  onUpdatePerson,
  onOpenChat,
  lang = 'bn',
}) => {
  if (!person) return null;
  const isEnglish = lang === 'en';

  const [activeTab, setActiveTab] = useState<'overview' | 'memories'>('overview');

  const personMap = new Map<string, Person>();
  allPeople.forEach((p) => personMap.set(p.id, p));

  const parents = person.parentIds
    .map((id) => personMap.get(id))
    .filter((p): p is Person => p !== undefined);

  const spouses = person.spouseIds
    .map((id) => personMap.get(id))
    .filter((p): p is Person => p !== undefined);

  const children = person.childrenIds
    .map((id) => personMap.get(id))
    .filter((p): p is Person => p !== undefined);

  const siblings = person.siblingIds
    .map((id) => personMap.get(id))
    .filter((p): p is Person => p !== undefined);

  const isRoot = person.parentIds.length === 0;

  // Inline Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editOccupation, setEditOccupation] = useState(person.occupation || '');
  const [editEducation, setEditEducation] = useState(person.education || '');
  const [editLocation, setEditLocation] = useState(person.currentLocation || person.birthPlace || '');
  const [editBirthDate, setEditBirthDate] = useState(person.birthDate || '');
  const [editDeathDate, setEditDeathDate] = useState(person.deathDate || '');
  const [editIsLiving, setEditIsLiving] = useState(person.isLiving);
  const [editPhone, setEditPhone] = useState(person.phone || '');
  const [editWhatsapp, setEditWhatsapp] = useState(person.whatsapp || '');
  const [editEmail, setEditEmail] = useState(person.email || '');
  const [editFacebook, setEditFacebook] = useState(person.facebook || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(person.avatarUrl || '');
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailsSavedSuccess, setDetailsSavedSuccess] = useState(false);

  // Bio States
  const [manualBio, setManualBio] = useState(person.bio || '');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [savedBioSuccess, setSavedBioSuccess] = useState(false);

  // Memory Vault States
  const [memories, setMemories] = useState<MemoryItem[]>(person.memories || []);
  const [isUploadingMemory, setIsUploadingMemory] = useState(false);
  const [memoryCaption, setMemoryCaption] = useState('');
  const [memoryYear, setMemoryYear] = useState('');
  const [selectedLightboxMemory, setSelectedLightboxMemory] = useState<MemoryItem | null>(null);
  const memoryInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Handle Photo Select for Profile Avatar
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/upload/photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            person_id: person.id,
            base64_image: base64,
            filename: file.name,
            content_type: file.type,
          }),
        });
        const data = await res.json();
        const finalUrl = data.success && data.photo_url ? data.photo_url : base64;
        setEditAvatarUrl(finalUrl);
        const updated: Person = { ...person, avatarUrl: finalUrl };
        if (onUpdatePerson) onUpdatePerson(updated);
      } catch {
        setEditAvatarUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Memory Photo Upload to Neon S3
  const handleMemorySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingMemory(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await apiFetch('/api/upload/memory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              person_id: person.id,
              base64_image: base64,
              caption: memoryCaption.trim(),
              year: memoryYear.trim(),
              filename: file.name,
              content_type: file.type,
            }),
          });
          const data = await res.json();
          const newMemory: MemoryItem = data.success && data.memory ? data.memory : {
            id: `mem_${Date.now()}`,
            url: base64,
            caption: memoryCaption.trim(),
            year: memoryYear.trim(),
            createdAt: new Date().toISOString(),
          };

          const updatedMemories = [newMemory, ...memories];
          setMemories(updatedMemories);
          setMemoryCaption('');
          setMemoryYear('');

          // Update person
          const updatedPerson = { ...person, memories: updatedMemories };
          if (onUpdatePerson) onUpdatePerson(updatedPerson);
        } catch (uploadErr) {
          console.error(uploadErr);
        } finally {
          setIsUploadingMemory(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploadingMemory(false);
    }
  };

  // Handle Save Profile Details
  const handleSaveProfileDetails = async () => {
    setIsSavingDetails(true);
    try {
      const updated: Person = {
        ...person,
        occupation: editOccupation,
        education: editEducation,
        currentLocation: editLocation,
        birthDate: editBirthDate,
        deathDate: !editIsLiving ? editDeathDate : undefined,
        isLiving: editIsLiving,
        phone: editPhone,
        whatsapp: editWhatsapp,
        email: editEmail,
        facebook: editFacebook,
        avatarUrl: editAvatarUrl || person.avatarUrl,
      };

      await apiFetch(`/api/persons/${person.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occupation: editOccupation,
          education: editEducation,
          currentLocation: editLocation,
          birthDate: editBirthDate,
          deathDate: !editIsLiving ? editDeathDate : null,
          isLiving: editIsLiving,
        }),
      });

      if (onUpdatePerson) onUpdatePerson(updated);
      setDetailsSavedSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setDetailsSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingDetails(false);
    }
  };

  // Handle AI Generate Bio
  const handleGenerateBio = async () => {
    setIsGeneratingBio(true);
    setBioError(null);
    try {
      const res = await apiFetch('/api/ai/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person: {
            name_local: person.firstName,
            name_english: person.lastName,
            gender: person.gender,
            birth_date: person.birthDate,
            death_date: person.deathDate,
            is_living: person.isLiving,
            profession: editOccupation || person.occupation,
          },
          parents: parents.map((p) => getFullName(p)),
          siblings: siblings.map((s) => getFullName(s)),
          children: children.map((c) => getFullName(c)),
        }),
      });

      const data = await res.json();
      if (data.success && data.bio) {
        setManualBio(data.bio);
      } else {
        throw new Error(data.error || 'Failed to generate biography');
      }
    } catch (err: any) {
      console.error(err);
      setBioError(err.message || 'জীবনী তৈরি করা সম্ভব হয়নি।');
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleCopyBio = () => {
    if (!manualBio) return;
    navigator.clipboard.writeText(manualBio);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveBioToProfile = async () => {
    if (!person) return;
    setIsSavingBio(true);
    try {
      await fetch(`/api/persons/${person.id}/bio`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: manualBio }),
      });
      person.bio = manualBio;
      if (onSaveBio) onSaveBio(person.id, manualBio);
      if (onUpdatePerson) onUpdatePerson({ ...person, bio: manualBio });

      setSavedBioSuccess(true);
      setTimeout(() => setSavedBioSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingBio(false);
    }
  };

  const cleanWhatsappNumber = (person.whatsapp || person.phone || '').replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Header Hero Banner */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 px-6 pt-6 pb-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start space-x-4">
            {/* Avatar Photo with Change Trigger */}
            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarSelect}
                accept="image/*"
                className="hidden"
              />
              {person.avatarUrl || editAvatarUrl ? (
                <img
                  src={editAvatarUrl || person.avatarUrl}
                  alt={getFullName(person)}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 shadow-xl"
                />
              ) : (
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 shadow-lg border-2 border-white/30 ${
                    person.gender === 'female'
                      ? 'bg-rose-500 text-white'
                      : person.gender === 'male'
                      ? 'bg-blue-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {person.firstName[0]}
                  {person.lastName[0]}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold truncate">{getFullName(person)}</h2>
                {isRoot && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-200 border border-emerald-500/40">
                    <Shield className="w-3 h-3 text-emerald-300" />
                    <span>Root</span>
                  </span>
                )}
              </div>

              {/* Occupation & Education Subtitle */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-emerald-100 mt-1">
                {person.occupation && (
                  <span className="flex items-center space-x-1">
                    <Briefcase className="w-3.5 h-3.5 opacity-80" />
                    <span>{person.occupation}</span>
                  </span>
                )}
                {person.education && (
                  <span className="flex items-center space-x-1">
                    <GraduationCap className="w-3.5 h-3.5 opacity-80" />
                    <span>{person.education}</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-emerald-200 mt-2">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 opacity-80" />
                  <span>{calculateAge(person.birthDate, person.deathDate, person.isLiving)}</span>
                </span>
                {(person.currentLocation || person.birthPlace) && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 opacity-80" />
                    <span>{person.currentLocation || person.birthPlace}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ONE-TAP DIRECT ACTIONS (WhatsApp, Call, SMS, Email, Social, BondRoot Chat) */}
        <div className="bg-slate-100/90 dark:bg-zinc-800/80 px-6 py-2.5 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mr-1">
            {isEnglish ? 'Connect:' : 'যোগাযোগ:'}
          </span>

          {/* Internal BondRoot Direct Message Button */}
          {onOpenChat && (
            <button
              onClick={() => onOpenChat(person)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isEnglish ? 'BondRoot Message' : 'বন্ডরুট বার্তা পাঠান'}</span>
            </button>
          )}

          {/* WhatsApp */}
          {(person.whatsapp || person.phone) && (
            <a
              href={`https://wa.me/${cleanWhatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          )}

          {/* Direct Call */}
          {person.phone && (
            <a
              href={`tel:${person.phone}`}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          )}

          {/* Direct SMS */}
          {person.phone && (
            <a
              href={`sms:${person.phone}`}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>SMS</span>
            </a>
          )}

          {/* Direct Email */}
          {person.email && (
            <a
              href={`mailto:${person.email}`}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </a>
          )}

          {/* Facebook / Social */}
          {person.facebook && (
            <a
              href={person.facebook.startsWith('http') ? person.facebook : `https://${person.facebook}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Facebook</span>
            </a>
          )}
        </div>

        {/* Tab Selection Bar (Overview vs Memories & Gallery) */}
        <div className="bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
              }`}
            >
              {isEnglish ? 'Profile & Roots' : 'প্রোফাইল ও বংশলতিকা'}
            </button>
            <button
              onClick={() => setActiveTab('memories')}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === 'memories'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{isEnglish ? `Media Vault (${memories.length})` : `স্মৃতি গ্যালারি (${memories.length})`}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                isEditingProfile
                  ? 'bg-amber-600 text-white'
                  : 'bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-100'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>
                {isEditingProfile
                  ? (isEnglish ? 'Cancel' : 'বাতিল')
                  : (isEnglish ? 'Edit Details' : 'তথ্য সম্পাদনা')}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* Profile Details Edit Form */}
              {isEditingProfile && (
                <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-700/60 rounded-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                      <PenTool className="w-4 h-4 text-emerald-600" />
                      <span>{isEnglish ? 'Edit Profile & Life Records' : 'ব্যক্তিগত তথ্য ও জীবনবৃত্তান্ত সম্পাদনা'}</span>
                    </h4>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      Neon DB Sync
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Profession */}
                    <div>
                      <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">Profession (পেশা):</label>
                      <input
                        type="text"
                        value={editOccupation}
                        onChange={(e) => setEditOccupation(e.target.value)}
                        placeholder="e.g. সফটওয়্যার ইঞ্জিনিয়ার"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Education */}
                    <div>
                      <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">Education (শিক্ষা):</label>
                      <input
                        type="text"
                        value={editEducation}
                        onChange={(e) => setEditEducation(e.target.value)}
                        placeholder="e.g. বিএসসি, এমএ"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">Current Location (ঠিকানা):</label>
                      <input
                        type="text"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        placeholder="e.g. ঢাকা, বাংলাদেশ"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">Status (অবস্থা):</label>
                      <select
                        value={editIsLiving ? 'living' : 'deceased'}
                        onChange={(e) => setEditIsLiving(e.target.value === 'living')}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="living">Living (জীবিত)</option>
                        <option value="deceased">Deceased (প্রয়াত)</option>
                      </select>
                    </div>

                    {/* Birth Date */}
                    <div>
                      <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">Birth Date / Year:</label>
                      <input
                        type="text"
                        value={editBirthDate}
                        onChange={(e) => setEditBirthDate(e.target.value)}
                        placeholder="YYYY-MM-DD or YYYY"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">WhatsApp Number:</label>
                      <input
                        type="tel"
                        value={editWhatsapp}
                        onChange={(e) => setEditWhatsapp(e.target.value)}
                        placeholder="8801XXXXXXXXX"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">Phone Number:</label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+880 1XXXXXXXXX"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">Email:</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="example@mail.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 text-slate-800 dark:text-zinc-200 rounded-xl font-bold transition"
                    >
                      {isEnglish ? 'Cancel' : 'বাতিল'}
                    </button>
                    <button
                      type="button"
                      disabled={isSavingDetails}
                      onClick={handleSaveProfileDetails}
                      className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                    >
                      {isSavingDetails ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{isEnglish ? 'Saving...' : 'সংরক্ষণ হচ্ছে...'}</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>{isEnglish ? 'Save to Database' : 'ডাটাবেসে সেভ করুন'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {detailsSavedSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{isEnglish ? 'Profile details saved to database successfully!' : 'ব্যক্তিগত তথ্য সফলভাবে ডাটাবেসে সংরক্ষিত হয়েছে!'}</span>
                </div>
              )}

              {/* Family Bio & Memoirs */}
              <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-white dark:from-zinc-800/60 dark:to-zinc-900/60 rounded-2xl border border-amber-200 dark:border-zinc-700 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{isEnglish ? 'Biography & Family Memoirs' : 'পারিবারিক জীবনী ও স্মৃতিকথা'}</span>
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 font-bold">
                          Neon DB
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {isEnglish
                          ? 'Write your own memories or let Gemini AI weave ancestral stories'
                          : 'নিজস্ব স্মৃতিকথা লিখুন অথবা জেমিনাই AI দিয়ে সুন্দর বংশানুক্রমিক গল্প তৈরি করুন'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isGeneratingBio}
                    onClick={handleGenerateBio}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    {isGeneratingBio ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{isEnglish ? 'Generating...' : 'তৈরি হচ্ছে...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isEnglish ? 'Generate AI Bio' : 'AI বায়ো তৈরি'}</span>
                      </>
                    )}
                  </button>
                </div>

                {bioError && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 rounded-xl text-xs">
                    {bioError}
                  </div>
                )}

                <div>
                  <textarea
                    rows={4}
                    value={manualBio}
                    onChange={(e) => setManualBio(e.target.value)}
                    placeholder={isEnglish
                      ? 'Write memories, notable achievements, life journey, or anecdotes about this family member...'
                      : 'এই সদস্যের জীবনের উল্লেখযোগ্য স্মৃতি, কর্মজীবন, অবদান বা স্মরণীয় ঘটনা এখানে লিখুন...'}
                    className="w-full text-xs font-normal leading-relaxed p-3.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleCopyBio}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-slate-100 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-medium transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (isEnglish ? 'Copied!' : 'কপি হয়েছে!') : (isEnglish ? 'Copy' : 'কপি করুন')}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSavingBio}
                    onClick={handleSaveBioToProfile}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition shadow-md shadow-amber-600/20 cursor-pointer"
                  >
                    {savedBioSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>{isEnglish ? 'Saved to Database!' : 'ডাটাবেসে সংরক্ষিত!'}</span>
                      </>
                    ) : isSavingBio ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{isEnglish ? 'Saving...' : 'সংরক্ষণ হচ্ছে...'}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{isEnglish ? 'Save Bio to Database' : 'ডাটাবেসে সেভ করুন'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Direct Family Bonds Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Parents */}
                <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isEnglish ? 'Parents (Roots):' : 'পিতা-মাতা (শিকড়):'} {parents.length}</span>
                  </h4>
                  {parents.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No parents recorded (Founding Root)</p>
                  ) : (
                    <div className="space-y-1.5">
                      {parents.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => onSelectPerson(p)}
                          className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-emerald-400 flex items-center justify-between text-xs transition cursor-pointer"
                        >
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">{getFullName(p)}</span>
                          <span className="text-[11px] text-slate-500 capitalize">{p.gender === 'female' ? 'মা' : 'বাবা'}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Spouses */}
                <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>{isEnglish ? 'Spouse:' : 'জীবনসঙ্গী:'} {spouses.length}</span>
                  </h4>
                  {spouses.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No spouse recorded</p>
                  ) : (
                    <div className="space-y-1.5">
                      {spouses.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => onSelectPerson(s)}
                          className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-rose-400 flex items-center justify-between text-xs transition cursor-pointer"
                        >
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">{getFullName(s)}</span>
                          <span className="text-[11px] text-slate-500 capitalize">
                            {s.gender === 'female' ? 'স্ত্রী' : s.gender === 'male' ? 'স্বামী' : 'জীবনসঙ্গী'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Children */}
                <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                    <GitFork className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isEnglish ? 'Children:' : 'সন্তান-সন্ততি:'} {children.length}</span>
                  </h4>
                  {children.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No children recorded</p>
                  ) : (
                    <div className="space-y-1.5">
                      {children.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => onSelectPerson(c)}
                          className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-blue-400 flex items-center justify-between text-xs transition cursor-pointer"
                        >
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">{getFullName(c)}</span>
                          <span className="text-[11px] text-slate-500 capitalize">
                            {c.gender === 'female' ? 'মেয়ে' : 'ছেলে'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Siblings */}
                <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{isEnglish ? 'Siblings:' : 'ভাই-বোন:'} {siblings.length}</span>
                  </h4>
                  {siblings.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No siblings recorded</p>
                  ) : (
                    <div className="space-y-1.5">
                      {siblings.map((sib) => (
                        <button
                          key={sib.id}
                          onClick={() => onSelectPerson(sib)}
                          className="w-full text-left p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-indigo-400 flex items-center justify-between text-xs transition cursor-pointer"
                        >
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">{getFullName(sib)}</span>
                          <span className="text-[11px] text-slate-500 capitalize">
                            {sib.gender === 'female' ? 'বোন' : 'ভাই'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: MEMORIES & GALLERY (স্মৃতিবিজড়িত পারিবারিক ফটো গ্যালারি) */}
          {activeTab === 'memories' && (
            <div className="space-y-6">
              {/* Upload Memory Box */}
              <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 p-5 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      স্মৃতিবিজড়িত ফটো যুক্ত করুন (Add to Memory Vault)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      এই ব্যক্তির সাথে কাটানো স্মৃতিবিজড়িত পারিবারিক ছবি ও ক্যাপশন Neon S3 Storage-এ সুরক্ষিত রাখুন।
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      ছবির ক্যাপশন / স্মৃতি বিবরণী
                    </label>
                    <input
                      type="text"
                      value={memoryCaption}
                      onChange={(e) => setMemoryCaption(e.target.value)}
                      placeholder="e.g. ১৯৯৫ সালের ঈদের মিলনমেলা..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      সাল বা উপলক্ষ (Year / Occasion)
                    </label>
                    <input
                      type="text"
                      value={memoryYear}
                      onChange={(e) => setMemoryYear(e.target.value)}
                      placeholder="e.g. 1995"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <input
                    type="file"
                    ref={memoryInputRef}
                    onChange={handleMemorySelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingMemory}
                    onClick={() => memoryInputRef.current?.click()}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
                  >
                    {isUploadingMemory ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>ছবি আপলোড হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>ছবি নির্বাচন ও আপলোড</span>
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-slate-400">JPG, PNG, WebP supported</span>
                </div>
              </div>

              {/* Gallery Grid (Mobile: 2 cols, Desktop: 3-4 cols) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3 flex items-center justify-between">
                  <span>স্মৃতি আর্কাইভ ({memories.length})</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Neon S3 Cloud Vault</span>
                </h4>

                {memories.length === 0 ? (
                  <div className="bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 p-8 text-center text-slate-400">
                    <ImageIcon className="w-10 h-10 mx-auto opacity-40 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
                      এখনো কোনো স্মৃতিবিজড়িত ছবি যুক্ত করা হয়নি
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      উপরের ফর্ম থেকে পারিবারিক অ্যালবাম বা স্মরণীয় মুহূর্তের ছবি আপলোড করুন।
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {memories.map((mem) => (
                      <div
                        key={mem.id}
                        onClick={() => setSelectedLightboxMemory(mem)}
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 cursor-pointer shadow-xs hover:shadow-xl transition-all duration-200"
                      >
                        <img
                          src={mem.url}
                          alt={mem.caption || 'Family Memory'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 text-white">
                          <p className="text-xs font-bold truncate">{mem.caption || 'পারিবারিক মুহূর্ত'}</p>
                          {mem.year && <span className="text-[10px] text-amber-300 font-semibold">{mem.year}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX PREVIEW MODAL */}
      {selectedLightboxMemory && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedLightboxMemory(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img
              src={selectedLightboxMemory.url}
              alt={selectedLightboxMemory.caption || 'Memory Preview'}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
            {(selectedLightboxMemory.caption || selectedLightboxMemory.year) && (
              <div className="mt-4 text-center text-white space-y-1">
                <h4 className="text-base font-bold">{selectedLightboxMemory.caption}</h4>
                {selectedLightboxMemory.year && (
                  <span className="px-3 py-1 bg-amber-500/80 rounded-full text-xs font-bold inline-block">
                    {selectedLightboxMemory.year}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
