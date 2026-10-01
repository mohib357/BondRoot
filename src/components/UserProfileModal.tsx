import React, { useState, useEffect } from 'react';
import { User } from '../types/auth';
import { Person } from '../types/person';
import { getFullName, findRelationship } from '../utils/relationship';
import { apiFetch } from '../utils/api';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  AtSign,
  CheckCircle2,
  XCircle,
  Loader2,
  Camera,
  Heart,
  Users,
  MessageSquare,
  Shield,
  Sparkles,
  Save,
  Crown,
  ChevronRight,
  GitFork,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  token: string | null;
  allPeople: Person[];
  onUpdateUser: (updatedUser: User, token?: string) => void;
  onSelectPerson?: (person: Person) => void;
  onOpenChatWithPerson?: (person: Person) => void;
  lang?: 'bn' | 'en';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  token,
  allPeople,
  onUpdateUser,
  onSelectPerson,
  onOpenChatWithPerson,
  lang = 'bn',
}) => {
  if (!isOpen) return null;
  const isEnglish = lang === 'en';

  const [activeTab, setActiveTab] = useState<'profile' | 'kinship'>('profile');

  // Form Fields
  const [fullName, setFullName] = useState(currentUser.full_name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone_number || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || '');

  // Username Real-time Validation State
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    available?: boolean;
    msg?: string;
  } | null>(null);

  // Saving State
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Debounced Username Check Effect
  useEffect(() => {
    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUser || cleanUser === (currentUser.username || '').toLowerCase()) {
      setUsernameStatus(null);
      setIsCheckingUsername(false);
      return;
    }

    if (cleanUser.length < 3) {
      setUsernameStatus({
        available: false,
        msg: isEnglish ? 'Username must be at least 3 characters.' : 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।',
      });
      return;
    }

    setIsCheckingUsername(true);
    const timer = setTimeout(() => {
      apiFetch(`/api/auth/check-username?username=${cleanUser}&current_user_id=${currentUser.id}`)
        .then((r) => r.json())
        .then((data) => {
          setIsCheckingUsername(false);
          if (data.available) {
            setUsernameStatus({
              available: true,
              msg: isEnglish ? '@' + cleanUser + ' is available!' : '@' + cleanUser + ' ইউজারনেমটি ফাঁকা রয়েছে!',
            });
          } else {
            setUsernameStatus({
              available: false,
              msg: data.error || (isEnglish ? 'Username already taken.' : 'এই ইউজারনেমটি ইতোমধ্যে অন্য কেউ নিয়েছেন।'),
            });
          }
        })
        .catch(() => {
          setIsCheckingUsername(false);
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [username, currentUser.id, currentUser.username, isEnglish]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg(isEnglish ? 'Name and Email are required.' : 'নাম ও ইমেইল আবশ্যক।');
      return;
    }

    if (usernameStatus && usernameStatus.available === false) {
      setErrorMsg(usernameStatus.msg || 'সঠিক ইউনিক ইউজারনেম দিন।');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await apiFetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone_number: phone.trim() || null,
          email: email.trim().toLowerCase(),
          username: username.trim().toLowerCase() || null,
          avatar_url: avatarUrl || null,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onUpdateUser(data.user, data.token);
        setSuccessMsg(isEnglish ? 'Profile updated successfully!' : 'প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!');
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(data.error || 'প্রোফাইল আপডেট করা যায়নি।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'নেটওয়ার্ক সমস্যা।');
    } finally {
      setIsSaving(false);
    }
  };

  // Find linked person node in tree for current user
  const linkedPerson = allPeople.find(
    (p) =>
      p.email?.toLowerCase() === currentUser.email.toLowerCase() ||
      (currentUser.phone_number && p.phone === currentUser.phone_number) ||
      getFullName(p).toLowerCase().includes(currentUser.full_name.toLowerCase())
  ) || allPeople[0];

  // Calculate relatives connected to user
  const relativesList = linkedPerson
    ? allPeople
        .filter((p) => p.id !== linkedPerson.id)
        .map((p) => {
          const pathResult = findRelationship(linkedPerson.id, p.id, allPeople, isEnglish);
          return {
            person: p,
            relationTitle: pathResult
              ? (isEnglish ? pathResult.directLabelEn : pathResult.directLabelBn)
              : (isEnglish ? 'Family Member' : 'পরিবারের সদস্য'),
            callingTerm: pathResult
              ? (isEnglish ? pathResult.callingTermEn : pathResult.callingTermBn)
              : '',
            pathLength: pathResult ? pathResult.path.length : 999,
          };
        })
        .sort((a, b) => a.pathLength - b.pathLength)
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200/80 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] neu-inset">

        {/* Soft Neumorphism Header */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-md">
              <UserIcon className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>{isEnglish ? 'My Profile & Kinship Hub' : 'আমার অ্যাকাউন্ট ও আত্মীয়তার হাব'}</span>
                {currentUser.role === 'super_admin' && (
                  <span title="Super Admin">
                    <Crown className="w-4 h-4 text-amber-300 shrink-0" />
                  </span>
                )}
              </h2>
              <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
                {currentUser.full_name} • {currentUser.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Soft Neumorphic Tabs */}
        <div className="flex border-b border-slate-200 dark:border-zinc-800 bg-slate-100/80 dark:bg-zinc-900/80 p-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-2xl transition cursor-pointer flex items-center justify-center space-x-2 neu-button ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-zinc-700'
                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>{isEnglish ? 'My Profile' : 'আমার প্রোফাইল'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kinship')}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-2xl transition cursor-pointer flex items-center justify-center space-x-2 neu-button ${
              activeTab === 'kinship'
                ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-zinc-700'
                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isEnglish ? 'My Kinship List' : 'আমার আত্মীয়দের তালিকা'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">

          {activeTab === 'profile' ? (
            /* TAB 1: EDIT PROFILE FORM */
            <form onSubmit={handleSaveProfile} className="space-y-4">

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 flex items-center space-x-2 text-rose-700 dark:text-rose-300 text-xs">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Avatar Center Circle */}
              <div className="flex flex-col items-center justify-center space-y-2 pb-2">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-700 via-teal-600 to-emerald-500 text-white font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-800">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-3xl" />
                    ) : (
                      fullName[0] || 'U'
                    )}
                  </div>
                </div>
              </div>

              {/* Full Name Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  {isEnglish ? 'Full Name' : 'পূর্ণ নাম'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-xs text-slate-900 dark:text-white transition outline-hidden neu-inset"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    {isEnglish ? 'Email Address' : 'ইমেইল ঠিকানা'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-xs text-slate-900 dark:text-white transition outline-hidden neu-inset"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    {isEnglish ? 'Phone Number' : 'মোবাইল নম্বর'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+88017..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-xs text-slate-900 dark:text-white transition outline-hidden neu-inset"
                    />
                  </div>
                </div>
              </div>

              {/* Unique Handle (@username) with Real-Time Validation */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {isEnglish ? 'Unique Handle (@username)' : 'ইউনিক হ্যান্ডেল (@ইউজারনেম)'}
                  </label>
                  {isCheckingUsername && (
                    <span className="text-[11px] text-amber-600 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>{isEnglish ? 'Checking...' : 'যাচাই হচ্ছে...'}</span>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <AtSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. muhib_01"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-xs text-slate-900 dark:text-white transition outline-hidden neu-inset"
                  />

                  {usernameStatus && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {usernameStatus.available ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  )}
                </div>

                {usernameStatus && (
                  <p
                    className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
                      usernameStatus.available ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    <span>{usernameStatus.msg}</span>
                  </p>
                )}
              </div>

              {/* Submit Save Button */}
              <button
                type="submit"
                disabled={isSaving || (usernameStatus ? !usernameStatus.available : false)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/20 active:scale-98 cursor-pointer disabled:opacity-50 neu-button"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isEnglish ? 'Save Profile Changes' : 'প্রোফাইল পরিবর্তন সংরক্ষণ করুন'}</span>
                  </>
                )}
              </button>

            </form>
          ) : (
            /* TAB 2: MY KINSHIP LIST */
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 flex items-center space-x-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  {isEnglish
                    ? `Connected to ${relativesList.length} relatives in your lineage tree.`
                    : `বংশলতিকায় আপনার সাথে যুক্ত ${relativesList.length} জন আত্মীের তালিকা:`}
                </span>
              </div>

              {relativesList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  {isEnglish ? 'No connected relatives found in tree.' : 'বংশলতিকায় কোনো আত্মীয় পাওয়া যায়নি।'}
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {relativesList.map(({ person, relationTitle, callingTerm }) => (
                    <div
                      key={person.id}
                      className="p-3 rounded-2xl bg-white dark:bg-zinc-800/90 border border-slate-200/80 dark:border-zinc-700 flex items-center justify-between hover:border-emerald-400 transition shadow-2xs neu-button"
                    >
                      <div
                        onClick={() => {
                          if (onSelectPerson) onSelectPerson(person);
                          onClose();
                        }}
                        className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                      >
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                            person.gender === 'female'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {person.firstName[0]}
                          {person.lastName[0]}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {getFullName(person)}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
                              {relationTitle}
                            </span>
                          </div>
                          {callingTerm && (
                            <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                              {callingTerm}
                            </p>
                          )}
                        </div>
                      </div>

                      {onOpenChatWithPerson && (
                        <button
                          onClick={() => {
                            onOpenChatWithPerson(person);
                            onClose();
                          }}
                          title="Chat with relative"
                          className="p-2 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-700 rounded-xl transition cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
