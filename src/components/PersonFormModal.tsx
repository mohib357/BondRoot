import React, { useState, useEffect, useRef } from 'react';
import { Person, Gender } from '../types/person';
import { getFullName } from '../utils/relationship';
import {
  X,
  Check,
  Upload,
  Camera,
  Trash2,
  Phone,
  MessageCircle,
  Mail,
  GraduationCap,
  MapPin,
  Loader2,
} from 'lucide-react';

interface PersonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (personData: Partial<Person>) => void;
  editingPerson?: Person | null;
  allPeople: Person[];
  presetRelation?: {
    relative: Person;
    relationType: 'parent' | 'child' | 'spouse';
  } | null;
}

export const PersonFormModal: React.FC<PersonFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPerson,
  allPeople,
  presetRelation,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [maidenName, setMaidenName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [isLiving, setIsLiving] = useState(true);
  const [deathDate, setDeathDate] = useState('');
  const [deathPlace, setDeathPlace] = useState('');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [bio, setBio] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Avatar Photo Upload State
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Social & Contact
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');

  // Relationships
  const [parentIds, setParentIds] = useState<string[]>([]);
  const [spouseIds, setSpouseIds] = useState<string[]>([]);
  const [childrenIds, setChildrenIds] = useState<string[]>([]);
  const [siblingIds, setSiblingIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    if (editingPerson) {
      setFirstName(editingPerson.firstName);
      setLastName(editingPerson.lastName);
      setMaidenName(editingPerson.maidenName || '');
      setGender(editingPerson.gender);
      setBirthDate(editingPerson.birthDate || '');
      setBirthPlace(editingPerson.birthPlace || '');
      setIsLiving(editingPerson.isLiving);
      setDeathDate(editingPerson.deathDate || '');
      setDeathPlace(editingPerson.deathPlace || '');
      setOccupation(editingPerson.occupation || '');
      setEducation(editingPerson.education || '');
      setCurrentLocation(editingPerson.currentLocation || '');
      setBio(editingPerson.bio || '');
      setTagsInput(editingPerson.tags ? editingPerson.tags.join(', ') : '');
      setAvatarUrl(editingPerson.avatarUrl || '');
      setPhone(editingPerson.phone || '');
      setWhatsapp(editingPerson.whatsapp || '');
      setEmail(editingPerson.email || '');
      setFacebook(editingPerson.facebook || '');
      setInstagram(editingPerson.instagram || '');
      setParentIds(editingPerson.parentIds || []);
      setSpouseIds(editingPerson.spouseIds || []);
      setChildrenIds(editingPerson.childrenIds || []);
      setSiblingIds(editingPerson.siblingIds || []);
    } else {
      // New person defaults
      setFirstName('');
      setLastName(presetRelation ? presetRelation.relative.lastName : '');
      setMaidenName('');
      setGender('male');
      setBirthDate('');
      setBirthPlace('');
      setIsLiving(true);
      setDeathDate('');
      setDeathPlace('');
      setOccupation('');
      setEducation('');
      setCurrentLocation('');
      setBio('');
      setTagsInput('');
      setAvatarUrl('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setFacebook('');
      setInstagram('');

      if (presetRelation) {
        if (presetRelation.relationType === 'child') {
          setParentIds([presetRelation.relative.id]);
          setSpouseIds([]);
          setChildrenIds([]);
          setSiblingIds([]);
        } else if (presetRelation.relationType === 'parent') {
          setParentIds([]);
          setSpouseIds([]);
          setChildrenIds([presetRelation.relative.id]);
          setSiblingIds([]);
        } else if (presetRelation.relationType === 'spouse') {
          setParentIds([]);
          setSpouseIds([presetRelation.relative.id]);
          setChildrenIds([]);
          setSiblingIds([]);
        }
      } else {
        setParentIds([]);
        setSpouseIds([]);
        setChildrenIds([]);
        setSiblingIds([]);
      }
    }
  }, [isOpen, editingPerson, presetRelation]);

  if (!isOpen) return null;

  // Handle Photo File Select & Upload to Neon S3
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch('/api/upload/photo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              person_id: editingPerson?.id || 'temp',
              base64_image: base64,
              filename: file.name,
              content_type: file.type,
            }),
          });
          const data = await res.json();
          if (data.success && data.photo_url) {
            setAvatarUrl(data.photo_url);
          } else {
            setAvatarUrl(base64); // Fallback to base64
          }
        } catch {
          setAvatarUrl(base64);
        } finally {
          setIsUploadingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      maidenName: maidenName.trim() || undefined,
      gender,
      birthDate: birthDate.trim() || undefined,
      birthPlace: birthPlace.trim() || undefined,
      isLiving,
      deathDate: !isLiving && deathDate.trim() ? deathDate.trim() : undefined,
      deathPlace: !isLiving && deathPlace.trim() ? deathPlace.trim() : undefined,
      occupation: occupation.trim() || undefined,
      education: education.trim() || undefined,
      currentLocation: currentLocation.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      phone: phone.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
      email: email.trim() || undefined,
      facebook: facebook.trim() || undefined,
      instagram: instagram.trim() || undefined,
      bio: bio.trim() || undefined,
      tags,
      parentIds,
      spouseIds,
      childrenIds,
      siblingIds,
    });
    onClose();
  };

  const candidatePeople = allPeople.filter((p) => !editingPerson || p.id !== editingPerson.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/60">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {editingPerson
                ? `Edit Profile: ${editingPerson.firstName} ${editingPerson.lastName}`
                : presetRelation
                ? `Add ${presetRelation.relationType === 'parent' ? 'Parent' : presetRelation.relationType === 'child' ? 'Child' : 'Spouse'} for ${presetRelation.relative.firstName}`
                : 'নতুন সদস্য যোগ করুন (Add Family Member)'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              ব্যক্তিগত তথ্য, ছবি, যোগাযোগ ও রক্তের সম্পর্ক নির্ধারণ করুন।
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* 1. Profile Picture Upload & Preview */}
          <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 flex items-center space-x-4">
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile Preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-zinc-800 flex items-center justify-center border-2 border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-600">
                  <Camera className="w-6 h-6 opacity-70" />
                </div>
              )}
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-white">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <span className="font-bold text-slate-800 dark:text-zinc-200 block mb-1">
                প্রোফাইল ছবি (Profile Photo)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-2">
                Neon S3 Storage-এ সরাসরি আপলোড ও সিকিউর সংরক্ষণ হবে।
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 text-slate-700 dark:text-zinc-200 rounded-xl font-bold transition shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{avatarUrl ? 'ছবি পরিবর্তন করুন' : 'ছবি আপলোড করুন'}</span>
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Basic Names */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">First Name (নাম) *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. আবরার"
                className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl p-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Last Name (বংশ/পদবি) *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. চৌধুরী"
                className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl p-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Maiden Name (বিবাহপূর্ব নাম)</label>
              <input
                type="text"
                value={maidenName}
                onChange={(e) => setMaidenName(e.target.value)}
                placeholder="Optional"
                className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl p-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Gender & Living Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Gender (লিঙ্গ)</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl p-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="male">Male (পুরুষ)</option>
                <option value="female">Female (মহিলা)</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Status (অবস্থা)</label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={isLiving}
                    onChange={() => setIsLiving(true)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-slate-700 dark:text-zinc-300 font-medium">Living (জীবিত)</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    checked={!isLiving}
                    onChange={() => setIsLiving(false)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-slate-700 dark:text-zinc-300 font-medium">Deceased (প্রয়াত)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Dates & Places */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Birth Date / Year</label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="YYYY-MM-DD or YYYY"
                className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl p-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Birth Place (জন্মস্থান)</label>
              <input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="e.g. ঢাকা, বাংলাদেশ"
                className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl p-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {!isLiving && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-2xl border border-slate-200 dark:border-zinc-700">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Death Date / Year</label>
                <input
                  type="text"
                  value={deathDate}
                  onChange={(e) => setDeathDate(e.target.value)}
                  placeholder="YYYY-MM-DD or YYYY"
                  className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl p-2 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Death Place</label>
                <input
                  type="text"
                  value={deathPlace}
                  onChange={(e) => setDeathPlace(e.target.value)}
                  placeholder="e.g. ঢাকা"
                  className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl p-2 text-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Profession, Education & Current Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Occupation (পেশা)</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. চিকিৎসক, ইঞ্জিনিয়ার"
                className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl p-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Education (শিক্ষা)</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. বিএসসি, এমএ"
                className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl p-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Current Location (বর্তমান ঠিকানা)</label>
              <input
                type="text"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                placeholder="e.g. ধানমন্ডি, ঢাকা"
                className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl p-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Social & Contact Information */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
            <span className="font-bold text-emerald-900 dark:text-emerald-300 block">
              সোশ্যাল কানেক্টিভিটি ও যোগাযোগ (Instant Connect)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1XXXXXXXXX"
                  className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl p-2 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Number</span>
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="8801XXXXXXXXX (with country code)"
                  className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl p-2 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-rose-500" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl p-2 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Facebook Profile / Instagram
                </label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/username or @instagram"
                  className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl p-2 text-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Direct Relationships */}
          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white">Direct Lineage & Bonds (রক্তের সম্পর্ক)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Parents */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Parents (Roots / পিতা-মাতা)
                </label>
                <select
                  multiple
                  size={3}
                  value={parentIds}
                  onChange={(e) =>
                    setParentIds(Array.from(e.target.selectedOptions, (opt) => opt.value))
                  }
                  className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl p-2 focus:outline-none text-slate-700 dark:text-zinc-200"
                >
                  {candidatePeople.map((p) => (
                    <option key={p.id} value={p.id}>
                      {getFullName(p)}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400">Ctrl/Cmd+click to select multiple</span>
              </div>

              {/* Spouses */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Spouse / Partner (জীবনসঙ্গী)
                </label>
                <select
                  multiple
                  size={3}
                  value={spouseIds}
                  onChange={(e) =>
                    setSpouseIds(Array.from(e.target.selectedOptions, (opt) => opt.value))
                  }
                  className="w-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl p-2 focus:outline-none text-slate-700 dark:text-zinc-200"
                >
                  {candidatePeople.map((p) => (
                    <option key={p.id} value={p.id}>
                      {getFullName(p)}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400">Ctrl/Cmd+click to select multiple</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-zinc-300 hover:text-slate-800 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 rounded-xl font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingPerson ? 'Save Changes' : 'Create Person'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
