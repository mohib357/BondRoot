import React, { useState, useEffect } from 'react';
import { Person, ViewMode } from './types/person';
import { INITIAL_PEOPLE } from './data/initialData';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { TreeView } from './components/TreeView';
import { PersonList } from './components/PersonList';
import { BondMatrix } from './components/BondMatrix';
import { PersonDetailModal } from './components/PersonDetailModal';
import { PersonFormModal } from './components/PersonFormModal';
import { RelationshipFinderModal } from './components/RelationshipFinderModal';
import { ExportImportModal } from './components/ExportImportModal';
import { SmartAIAddModal } from './components/SmartAIAddModal';
import { LineageInsightsModal } from './components/LineageInsightsModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Minimap } from './components/Minimap';
import { FamilyMilestonesModal } from './components/FamilyMilestonesModal';
import { PosterExportModal } from './components/PosterExportModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SideNavDrawer } from './components/SideNavDrawer';
import { DeveloperAboutModal } from './components/DeveloperAboutModal';
import { FamilyChatModal } from './components/FamilyChatModal';
import { NotificationPanel } from './components/NotificationPanel';
import { NotificationItem } from './types/message';
import { getFullName } from './utils/relationship';
import { EmptyFamilyWelcome } from './components/EmptyFamilyWelcome';
import { AuthModal } from './components/AuthModal';
import { SuperAdminDashboardModal } from './components/SuperAdminDashboardModal';
import { UserProfileModal } from './components/UserProfileModal';
import { LandingPage } from './components/LandingPage';
import { SplashScreen } from './components/SplashScreen';
import { User } from './types/auth';
import { apiFetch } from './utils/api';
import { Sparkles, ArrowRight, Wand2, Lightbulb, Calendar, Printer, MessageSquare, Bell, Check, X } from 'lucide-react';

const STORAGE_KEY = 'bondroot_family_data_v2';

export const App: React.FC = () => {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const isEnglish = lang === 'en';

  // Dark Mode Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('bondroot_theme');
      if (saved) return saved === 'dark';
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bondroot_theme', isDarkMode ? 'dark' : 'light');
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error(e);
    }
  }, [isDarkMode]);

  const [people, setPeople] = useState<Person[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved BondRoot data:', e);
    }
    return INITIAL_PEOPLE;
  });

  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [presetRelation, setPresetRelation] = useState<{
    relative: Person;
    relationType: 'parent' | 'child' | 'spouse';
  } | null>(null);

  const [isRelFinderOpen, setIsRelFinderOpen] = useState(false);
  const [relFinderPersonA, setRelFinderPersonA] = useState<Person | null>(null);
  const [relFinderPersonB, setRelFinderPersonB] = useState<Person | null>(null);

  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isSmartAIAddOpen, setIsSmartAIAddOpen] = useState(false);
  const [isLineageInsightsOpen, setIsLineageInsightsOpen] = useState(false);
  const [isPosterExportOpen, setIsPosterExportOpen] = useState(false);
  const [isMilestonesOpen, setIsMilestonesOpen] = useState(false);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [isDeveloperAboutOpen, setIsDeveloperAboutOpen] = useState(false);
  const [isSuperAdminOpen, setIsSuperAdminOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);

  // User Authentication & Session State
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('bondroot_auth_token');
    } catch {
      return null;
    }
  });

  const [authUser, setAuthUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('bondroot_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGuestDemoMode, setIsGuestDemoMode] = useState(false);

  // Splash Screen States
  const [showSplash, setShowSplash] = useState(true);
  const [isSplashExiting, setIsSplashExiting] = useState(false);

  // Animated Splash Screen Exit Timer & Data Preload (4.2s total duration)
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setIsSplashExiting(true);
    }, 4200);

    return () => clearTimeout(splashTimer);
  }, []);

  // Session validation on mount
  useEffect(() => {
    if (authToken) {
      apiFetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.user) {
            setAuthUser(data.user);
            try {
              localStorage.setItem('bondroot_auth_user', JSON.stringify(data.user));
            } catch {}
          } else {
            setAuthToken(null);
            setAuthUser(null);
            try {
              localStorage.removeItem('bondroot_auth_token');
              localStorage.removeItem('bondroot_auth_user');
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, [authToken]);

  const handleAuthSuccess = (user: User, token: string) => {
    setAuthUser(user);
    setAuthToken(token);
    try {
      localStorage.setItem('bondroot_auth_token', token);
      localStorage.setItem('bondroot_auth_user', JSON.stringify(user));
    } catch {}
    setIsAuthModalOpen(false);

    // Sync user tree
    fetch('/api/persons', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          if (data.data.length === 0) {
            setPeople([]);
          } else {
            const mapped: Person[] = data.data.map((p: any) => ({
              id: p.person_id,
              firstName: p.name_local,
              lastName: p.name_english || '',
              gender: p.gender === 'female' ? 'female' : 'male',
              birthDate: p.date_of_birth || undefined,
              deathDate: p.date_of_death || undefined,
              isLiving: p.is_living,
              occupation: p.profession || undefined,
              bio: p.bio || undefined,
              avatarUrl: p.profile_photo_url || undefined,
              parentIds: [p.father_id, p.mother_id].filter(Boolean),
              spouseIds: [],
              childrenIds: [],
              siblingIds: [],
              tags: [],
            }));
            setPeople(mapped);
          }
        }
      })
      .catch(() => {});
  };

  const handleUpdateUser = (updatedUser: User, newToken?: string) => {
    setAuthUser(updatedUser);
    try {
      localStorage.setItem('bondroot_auth_user', JSON.stringify(updatedUser));
      if (newToken) {
        setAuthToken(newToken);
        localStorage.setItem('bondroot_auth_token', newToken);
      }
    } catch {}
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('bondroot_auth_token');
      localStorage.removeItem('bondroot_auth_user');
    } catch {}
    setAuthUser(null);
    setAuthToken(null);
    setIsGuestDemoMode(false);
    setIsAuthModalOpen(false);
  };

  // Internal Messaging & Notifications State
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('bondroot_current_user_id');
      if (saved) return saved;
    } catch {}
    return 'P100005';
  });

  const currentUser = people.find((p) => p.id === currentUserId) || people[0];
  const [activeChatPartner, setActiveChatPartner] = useState<Person | null>(null);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
  const [incomingToast, setIncomingToast] = useState<{ senderName: string; content: string; sender: Person } | null>(null);
  const prevUnreadCountRef = React.useRef<number>(0);

  // Handle switch active user persona
  const handleSwitchCurrentUser = (user: Person) => {
    setCurrentUserId(user.id);
    try {
      localStorage.setItem('bondroot_current_user_id', user.id);
    } catch {}
  };

  // Poll notifications from Neon PostgreSQL
  const pollNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/notifications/${currentUser.id}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        const newCount = data.unread_count || 0;
        
        // When new message arrives
        if (newCount > prevUnreadCountRef.current && data.notifications?.length > 0) {
          const latest = data.notifications[0];
          const sender = people.find((p) => p.id === latest.sender_id);
          const senderName = sender ? getFullName(sender) : latest.sender_name || 'পরিবারের সদস্য';

          setIncomingToast({
            senderName,
            content: latest.content,
            sender: sender || {
              id: latest.sender_id,
              firstName: senderName,
              lastName: '',
              gender: 'male',
              isLiving: true,
              parentIds: [],
              spouseIds: [],
              childrenIds: [],
              siblingIds: []
            }
          });

          // Web Push Notification if browser permission granted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`BondRoot: ${senderName}`, {
                body: latest.content,
                icon: '/icon-192.png'
              });
            } catch {}
          }
        }

        prevUnreadCountRef.current = newCount;
        setUnreadNotificationCount(newCount);
      }
    } catch {
      // offline silent fallback
    }
  };

  useEffect(() => {
    pollNotifications();
    const interval = setInterval(pollNotifications, 4000);
    return () => clearInterval(interval);
  }, [currentUser?.id, people]);

  // Request browser notification permission once
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      const handler = () => {
        Notification.requestPermission();
        window.removeEventListener('click', handler);
      };
      window.addEventListener('click', handler, { once: true });
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
    } catch (e) {
      console.error('Failed to save BondRoot data:', e);
    }
  }, [people]);

  // Initial database sync with Neon PostgreSQL
  useEffect(() => {
    fetch('/api/persons')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          if (data.data.length === 0) {
            setPeople([]);
            try {
              localStorage.removeItem(STORAGE_KEY);
            } catch {}
          } else {
            const mapped: Person[] = data.data.map((p: any) => ({
              id: p.person_id,
              firstName: p.name_local,
              lastName: p.name_english || '',
              gender: p.gender === 'female' ? 'female' : 'male',
              birthDate: p.date_of_birth || undefined,
              deathDate: p.date_of_death || undefined,
              isLiving: p.is_living,
              occupation: p.profession || undefined,
              bio: p.bio || undefined,
              avatarUrl: p.profile_photo_url || undefined,
              parentIds: [p.father_id, p.mother_id].filter(Boolean),
              spouseIds: [],
              childrenIds: [],
              siblingIds: [],
              tags: [],
            }));
            setPeople(mapped);
          }
        }
      })
      .catch((err) => console.log('DB init sync:', err));
  }, []);

  // Keep selectedPerson updated if people state updates
  useEffect(() => {
    if (selectedPerson) {
      const current = people.find((p) => p.id === selectedPerson.id);
      if (current) setSelectedPerson(current);
    }
  }, [people, selectedPerson]);

  const handleSmartAISuccess = (inserted: any[]) => {
    fetch('/api/persons')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: Person[] = data.data.map((p: any) => ({
            id: p.person_id,
            firstName: p.name_local,
            lastName: p.name_english || '',
            gender: p.gender === 'female' ? 'female' : 'male',
            birthDate: p.date_of_birth || undefined,
            deathDate: p.date_of_death || undefined,
            isLiving: p.is_living,
            occupation: p.profession || undefined,
            avatarUrl: p.profile_photo_url || undefined,
            parentIds: [p.father_id, p.mother_id].filter(Boolean),
            spouseIds: [],
            childrenIds: [],
            siblingIds: [],
            tags: [],
          }));

          mapped.forEach((p) => {
            p.parentIds.forEach((pId) => {
              const par = mapped.find((m) => m.id === pId);
              if (par && !par.childrenIds.includes(p.id)) par.childrenIds.push(p.id);
            });
          });
          mapped.forEach((p) => {
            mapped.forEach((other) => {
              if (p.id !== other.id && p.parentIds.some((pid) => other.parentIds.includes(pid))) {
                if (!p.siblingIds.includes(other.id)) p.siblingIds.push(other.id);
              }
            });
          });

          setPeople(mapped);
        }
      })
      .catch((err) => console.error('Failed to reload persons:', err));
  };

  const handleAddRelated = (relative: Person, relationType: 'parent' | 'child' | 'spouse') => {
    setEditingPerson(null);
    setPresetRelation({ relative, relationType });
    setIsFormOpen(true);
  };

  const handleSavePerson = (personData: Partial<Person>) => {
    const isNew = !editingPerson;
    const personId = isNew ? `P${100000 + people.length}` : editingPerson.id;

    const basePerson: Person = {
      id: personId,
      firstName: personData.firstName || 'New',
      lastName: personData.lastName || 'Person',
      maidenName: personData.maidenName,
      gender: personData.gender || 'male',
      birthDate: personData.birthDate,
      birthPlace: personData.birthPlace,
      isLiving: personData.isLiving ?? true,
      deathDate: personData.deathDate,
      deathPlace: personData.deathPlace,
      occupation: personData.occupation,
      bio: personData.bio,
      avatarUrl: personData.avatarUrl,
      tags: personData.tags || [],
      parentIds: personData.parentIds || [],
      spouseIds: personData.spouseIds || [],
      childrenIds: personData.childrenIds || [],
      siblingIds: personData.siblingIds || [],
    };

    if (isNew && presetRelation) {
      const { relative, relationType } = presetRelation;
      if (relationType === 'parent') {
        basePerson.childrenIds.push(relative.id);
      } else if (relationType === 'child') {
        basePerson.parentIds.push(relative.id);
      } else if (relationType === 'spouse') {
        basePerson.spouseIds.push(relative.id);
      }
    }

    if (isNew) {
      setPeople((prev) => syncBonds([...prev, basePerson], basePerson));
    } else {
      const updatedList = people.map((p) => (p.id === personId ? { ...p, ...basePerson } : p));
      setPeople(syncBonds(updatedList, basePerson));
    }

    setEditingPerson(null);
    setPresetRelation(null);
  };

  const deletePerson = (personId: string) => {
    setPeople((prev) => {
      return prev
        .filter((p) => p.id !== personId)
        .map((p) => ({
          ...p,
          parentIds: p.parentIds.filter((id) => id !== personId),
          spouseIds: p.spouseIds.filter((id) => id !== personId),
          childrenIds: p.childrenIds.filter((id) => id !== personId),
          siblingIds: p.siblingIds.filter((id) => id !== personId),
        }));
    });
    if (selectedPerson?.id === personId) {
      setSelectedPerson(null);
    }
  };

  const syncBonds = (peopleList: Person[], subject: Person): Person[] => {
    const subjectId = subject.id;

    return peopleList.map((p) => {
      if (p.id === subjectId) return subject;

      let newParentIds = [...p.parentIds];
      let newSpouseIds = [...p.spouseIds];
      let newChildrenIds = [...p.childrenIds];
      let newSiblingIds = [...p.siblingIds];

      if (subject.parentIds.includes(p.id)) {
        if (!newChildrenIds.includes(subjectId)) newChildrenIds.push(subjectId);
      } else {
        newChildrenIds = newChildrenIds.filter((id) => id !== subjectId);
      }

      if (subject.childrenIds.includes(p.id)) {
        if (!newParentIds.includes(subjectId)) newParentIds.push(subjectId);
      } else {
        newParentIds = newParentIds.filter((id) => id !== subjectId);
      }

      if (subject.spouseIds.includes(p.id)) {
        if (!newSpouseIds.includes(subjectId)) newSpouseIds.push(subjectId);
      } else {
        newSpouseIds = newSpouseIds.filter((id) => id !== subjectId);
      }

      const hasCommonParent = subject.parentIds.some((pId) => p.parentIds.includes(pId));
      if (hasCommonParent && p.id !== subjectId) {
        if (!newSiblingIds.includes(subjectId)) newSiblingIds.push(subjectId);
      }

      return {
        ...p,
        parentIds: newParentIds,
        spouseIds: newSpouseIds,
        childrenIds: newChildrenIds,
        siblingIds: newSiblingIds,
      };
    });
  };

  const handleEditPerson = (person: Person) => {
    setPresetRelation(null);
    setEditingPerson(person);
    setIsFormOpen(true);
  };

  const handleOpenRelFinderWithPair = (personA?: Person | null, personB?: Person | null) => {
    setRelFinderPersonA(personA || null);
    setRelFinderPersonB(personB || null);
    setIsRelFinderOpen(true);
  };

  const handleRunPromptTestCase = () => {
    const muhib = people.find((p) => p.id === 'P100005');
    const kamal = people.find((p) => p.id === 'P100006');
    handleOpenRelFinderWithPair(muhib, kamal);
  };

  // If user is not authenticated and has not entered guest demo mode, show the Landing Showcase Page
  if (!authUser && !isGuestDemoMode) {
    return (
      <>
        {/* Full-screen Animated Splash Screen */}
        {showSplash && (
          <SplashScreen
            isExiting={isSplashExiting}
            onFinished={() => setShowSplash(false)}
            lang={lang}
          />
        )}

        <LandingPage
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onExploreDemo={() => setIsGuestDemoMode(true)}
          onOpenDeveloperAbout={() => setIsDeveloperAboutOpen(true)}
          lang={lang}
          onToggleLang={() => setLang((l) => (l === 'bn' ? 'en' : 'bn'))}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        />

        {/* Auth Modal overlay when "Sign In / Sign Up" is clicked on Landing Page */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onSuccess={handleAuthSuccess}
          lang={lang}
        />

        {/* Developer About Modal */}
        <DeveloperAboutModal
          isOpen={isDeveloperAboutOpen}
          onClose={() => setIsDeveloperAboutOpen(false)}
          lang={lang}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden flex flex-col bg-slate-100/70 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-sans relative pb-16 md:pb-0 transition-colors">
      {/* Full-screen Animated Splash Screen */}
      {showSplash && (
        <SplashScreen
          isExiting={isSplashExiting}
          onFinished={() => setShowSplash(false)}
          lang={lang}
        />
      )}
      {/* Root Silhouette Watermark */}
      <div
        className="root-watermark bg-contain bg-no-repeat bg-right-bottom hidden sm:block pointer-events-none"
        style={{ backgroundImage: 'url(/icon.svg)' }}
      />

      {/* Header Navigation */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddPerson={() => {
          setEditingPerson(null);
          setPresetRelation(null);
          setIsFormOpen(true);
        }}
        onOpenRelFinder={() => handleOpenRelFinderWithPair()}
        onOpenDataTools={() => setIsExportImportOpen(true)}
        onOpenSmartAIAdd={() => setIsSmartAIAddOpen(true)}
        onOpenLineageInsights={() => setIsLineageInsightsOpen(true)}
        onOpenPosterExport={() => setIsPosterExportOpen(true)}
        onOpenMilestones={() => setIsMilestonesOpen(true)}
        onOpenSideDrawer={() => setIsSideDrawerOpen(true)}
        onOpenNotifications={() => setIsNotificationPanelOpen(true)}
        onOpenSuperAdmin={() => setIsSuperAdminOpen(true)}
        onOpenUserProfile={() => setIsUserProfileOpen(true)}
        authUser={authUser}
        unreadNotificationCount={unreadNotificationCount}
        peopleCount={people.length}
        lang={lang}
        onToggleLang={() => setLang((l) => (l === 'bn' ? 'en' : 'bn'))}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {/* Master Test Case & AI Tools Prominent Banner (Visible when members exist) */}
      {people.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50 px-4 py-3 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 rounded-xl bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                  {isEnglish ? 'Prompt Master Test Case & Gemini AI Hub' : '★ মাস্টার টেস্ট কেস ও জেমিনাই AI হাব'}
                </span>
                <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                  {isEnglish
                    ? 'Muhib (1998) ↔ Kamal Hossain (2002) = Paternal Cousin / Second Cousin (Son of grandfather\'s brother\'s son) | Calling: Younger Brother'
                    : 'মুহিব (১৯৯৮) ↔ কামাল হোসেন (২০০২) = চাচাতো ভাই (Second Cousin) [দাদার ভাইয়ের ছেলের ছেলে] | সম্বোধন: স্নেহের ছোট ভাই'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsSmartAIAddOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-purple-900 dark:text-purple-200 bg-purple-100 dark:bg-purple-950/60 hover:bg-purple-200 dark:hover:bg-purple-900 border border-purple-300 dark:border-purple-800 rounded-xl shadow-2xs transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300" />
                <span>{isEnglish ? 'Smart AI Add' : 'স্মার্ট AI এন্ট্রি'}</span>
              </button>
              <button
                onClick={() => setIsLineageInsightsOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-teal-900 dark:text-teal-200 bg-teal-100 dark:bg-teal-950/60 hover:bg-teal-200 dark:hover:bg-teal-900 border border-teal-300 dark:border-teal-800 rounded-xl shadow-2xs transition cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300" />
                <span>{isEnglish ? 'AI Insights' : 'AI অন্তর্দৃষ্টি'}</span>
              </button>
              <button
                onClick={() => setIsMilestonesOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-800 rounded-xl shadow-2xs transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300" />
                <span>{isEnglish ? 'Milestones' : 'স্মরণিকা'}</span>
              </button>
              <button
                onClick={() => setIsPosterExportOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 rounded-xl shadow-2xs transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-300" />
                <span>{isEnglish ? 'Poster' : 'পোস্টার'}</span>
              </button>
              <button
                onClick={handleRunPromptTestCase}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs transition cursor-pointer"
              >
                <span>{isEnglish ? 'Test Kinship Path' : 'টেস্ট সম্পর্ক নির্ণয়'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats and Search bar (Visible when members exist) */}
      {people.length > 0 && (
        <StatsBar
          people={people}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col overflow-x-hidden">
        {people.length === 0 ? (
          <EmptyFamilyWelcome
            onAddFirstMember={() => {
              setEditingPerson(null);
              setPresetRelation(null);
              setIsFormOpen(true);
            }}
            onOpenSmartAIAdd={() => setIsSmartAIAddOpen(true)}
            onLoadSampleData={(sample) => setPeople(sample)}
            lang={lang}
          />
        ) : (
          <>
            {viewMode === 'tree' && (
              <>
                <TreeView
                  people={people}
                  onSelectPerson={setSelectedPerson}
                  onAddRelated={handleAddRelated}
                  lang={lang}
                />
                {/* Minimap for Large Desktop Screens */}
                <Minimap
                  people={people}
                  selectedPersonId={selectedPerson?.id}
                  onSelectPerson={setSelectedPerson}
                  lang={lang}
                />
              </>
            )}

            {viewMode === 'directory' && (
              <PersonList
                people={people}
                searchQuery={searchQuery}
                onSelectPerson={setSelectedPerson}
                onEditPerson={handleEditPerson}
                onDeletePerson={deletePerson}
                lang={lang}
              />
            )}

            {viewMode === 'bonds' && (
              <BondMatrix
                people={people}
                onSelectPerson={setSelectedPerson}
                onOpenRelFinder={handleOpenRelFinderWithPair}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 py-6 text-xs text-slate-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700 dark:text-zinc-200">BondRoot</span>
            <span>—</span>
            <span>
              {isEnglish
                ? 'Multi-Generational Kinship Graph & Lineage Engine (Android & Web PWA)'
                : 'বহু-প্রজন্মীয় পারিবারিক আত্মীয়তার গ্রাফ ও বংশলতিকা ইঞ্জিন (PWA)'}
            </span>
          </div>
          <div>
            <span>Language: </span>
            <button
              onClick={() => setLang('bn')}
              className={`font-semibold hover:underline ${lang === 'bn' ? 'text-emerald-700 dark:text-emerald-400 underline' : 'text-slate-500'}`}
            >
              বাংলা
            </button>
            <span className="mx-1.5">|</span>
            <button
              onClick={() => setLang('en')}
              className={`font-semibold hover:underline ${lang === 'en' ? 'text-emerald-700 dark:text-emerald-400 underline' : 'text-slate-500'}`}
            >
              English
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Fixed Navigation Bar (< 768px) */}
      <MobileBottomNav
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenRelFinder={() => handleOpenRelFinderWithPair()}
        onOpenSmartAIAdd={() => setIsSmartAIAddOpen(true)}
        onOpenMilestones={() => setIsMilestonesOpen(true)}
        onOpenNotifications={() => setIsNotificationPanelOpen(true)}
        unreadNotificationCount={unreadNotificationCount}
        onAddPerson={() => {
          setEditingPerson(null);
          setPresetRelation(null);
          setIsFormOpen(true);
        }}
        lang={lang}
      />

      {/* Non-intrusive Offline Connectivity Indicator */}
      <OfflineIndicator lang={lang} />

      {/* Modals */}
      {selectedPerson && (
        <PersonDetailModal
          person={selectedPerson}
          allPeople={people}
          onClose={() => setSelectedPerson(null)}
          onEditPerson={handleEditPerson}
          onSelectPerson={setSelectedPerson}
          onAddRelated={handleAddRelated}
          onOpenChat={(p) => setActiveChatPartner(p)}
          onSaveBio={(personId, newBio) => {
            setPeople((prev) =>
              prev.map((p) => (p.id === personId ? { ...p, bio: newBio } : p))
            );
          }}
          onUpdatePerson={(updated) => {
            setPeople((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
            setSelectedPerson(updated);
          }}
          lang={lang}
        />
      )}

      {isFormOpen && (
        <PersonFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingPerson(null);
            setPresetRelation(null);
          }}
          onSave={handleSavePerson}
          editingPerson={editingPerson}
          presetRelation={presetRelation}
          allPeople={people}
        />
      )}

      {isRelFinderOpen && (
        <RelationshipFinderModal
          isOpen={isRelFinderOpen}
          onClose={() => setIsRelFinderOpen(false)}
          people={people}
          initialPersonA={relFinderPersonA}
          initialPersonB={relFinderPersonB}
          lang={lang}
        />
      )}

      {isExportImportOpen && (
        <ExportImportModal
          isOpen={isExportImportOpen}
          onClose={() => setIsExportImportOpen(false)}
          people={people}
          onImportPeople={(imported: Person[]) => setPeople(imported)}
        />
      )}

      {isSmartAIAddOpen && (
        <SmartAIAddModal
          isOpen={isSmartAIAddOpen}
          onClose={() => setIsSmartAIAddOpen(false)}
          existingPeople={people}
          onSuccess={handleSmartAISuccess}
          lang={lang}
        />
      )}

      {isLineageInsightsOpen && (
        <LineageInsightsModal
          isOpen={isLineageInsightsOpen}
          onClose={() => setIsLineageInsightsOpen(false)}
          people={people}
          lang={lang}
        />
      )}

      {isPosterExportOpen && (
        <PosterExportModal
          isOpen={isPosterExportOpen}
          onClose={() => setIsPosterExportOpen(false)}
          people={people}
          treeElementId="bondroot-tree-canvas"
          lang={lang}
        />
      )}

      {isMilestonesOpen && (
        <FamilyMilestonesModal
          isOpen={isMilestonesOpen}
          onClose={() => setIsMilestonesOpen(false)}
          people={people}
          onSelectPerson={setSelectedPerson}
          lang={lang}
        />
      )}

      {/* Responsive Slide-out Navigation Drawer */}
      <SideNavDrawer
        isOpen={isSideDrawerOpen}
        onClose={() => setIsSideDrawerOpen(false)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenDataTools={() => setIsExportImportOpen(true)}
        onOpenRelFinder={() => handleOpenRelFinderWithPair()}
        onOpenSmartAIAdd={() => setIsSmartAIAddOpen(true)}
        onOpenMilestones={() => setIsMilestonesOpen(true)}
        onOpenPosterExport={() => setIsPosterExportOpen(true)}
        onOpenDeveloperAbout={() => setIsDeveloperAboutOpen(true)}
        onOpenSuperAdmin={() => setIsSuperAdminOpen(true)}
        onOpenUserProfile={() => setIsUserProfileOpen(true)}
        onLogout={handleLogout}
        authUser={authUser}
        peopleCount={people.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        lang={lang}
        onToggleLang={() => setLang((l) => (l === 'bn' ? 'en' : 'bn'))}
      />

      {/* User Authentication Gate Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onSuccess={handleAuthSuccess}
        lang={lang}
      />

      {/* User Profile & Kinship Hub Modal */}
      {authUser && isUserProfileOpen && (
        <UserProfileModal
          isOpen={isUserProfileOpen}
          onClose={() => setIsUserProfileOpen(false)}
          currentUser={authUser}
          token={authToken}
          allPeople={people}
          onUpdateUser={handleUpdateUser}
          onSelectPerson={setSelectedPerson}
          onOpenChatWithPerson={(p) => setActiveChatPartner(p)}
          lang={lang}
        />
      )}

      {/* Developer Super Admin Dashboard Panel */}
      {authUser?.role === 'super_admin' && isSuperAdminOpen && (
        <SuperAdminDashboardModal
          isOpen={isSuperAdminOpen}
          onClose={() => setIsSuperAdminOpen(false)}
          token={authToken}
          currentUser={authUser}
          onRefreshGlobalData={() => {
            fetch('/api/persons', {
              headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
            })
              .then((r) => r.json())
              .then((d) => {
                if (d.success && Array.isArray(d.data)) {
                  setPeople([]);
                }
              });
          }}
          lang={lang}
        />
      )}

      {/* Developer & Mission About Modal */}
      {isDeveloperAboutOpen && (
        <DeveloperAboutModal
          isOpen={isDeveloperAboutOpen}
          onClose={() => setIsDeveloperAboutOpen(false)}
          lang={lang}
        />
      )}

      {/* Real-time Notification Center Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        notifications={notifications}
        unreadCount={unreadNotificationCount}
        allPeople={people}
        onOpenChatWithPerson={(target) => {
          setActiveChatPartner(target);
          setIsNotificationPanelOpen(false);
        }}
        onMarkAllAsRead={async () => {
          if (currentUser && notifications.length > 0) {
            await fetch('/api/messages/mark-as-read', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message_ids: notifications.map((n) => n.id),
              }),
            });
            pollNotifications();
          }
        }}
        lang={lang}
      />

      {/* Internal Family Chat Modal */}
      {activeChatPartner && currentUser && (
        <FamilyChatModal
          isOpen={Boolean(activeChatPartner)}
          onClose={() => {
            setActiveChatPartner(null);
            pollNotifications();
          }}
          receiver={activeChatPartner}
          currentUser={currentUser}
          allPeople={people}
          onSwitchCurrentUser={handleSwitchCurrentUser}
          lang={lang}
        />
      )}

      {/* In-App Toast Notification Alert */}
      {incomingToast && (
        <div
          onClick={() => {
            setActiveChatPartner(incomingToast.sender);
            setIncomingToast(null);
          }}
          className="fixed top-20 right-4 z-50 max-w-sm w-[90vw] sm:w-80 bg-white dark:bg-zinc-900 border-2 border-emerald-500 rounded-3xl shadow-2xl p-3.5 flex items-start space-x-3 cursor-pointer animate-in slide-in-from-top-4 duration-200"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                {incomingToast.senderName}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                {isEnglish ? 'New Message' : 'নতুন বার্তা'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-300 truncate mt-0.5">
              {incomingToast.content}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIncomingToast(null);
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
