import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types/auth';
import { apiFetch } from '../utils/api';
import {
  Crown,
  Shield,
  Users,
  Database,
  MessageSquare,
  Activity,
  RefreshCw,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Server,
  UserCheck,
} from 'lucide-react';

interface SuperAdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  currentUser: User;
  onRefreshGlobalData?: () => void;
  lang?: 'bn' | 'en';
}

export const SuperAdminDashboardModal: React.FC<SuperAdminDashboardModalProps> = ({
  isOpen,
  onClose,
  token,
  currentUser,
  onRefreshGlobalData,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const fetchAdminData = async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [usersRes, statsRes] = await Promise.all([
        apiFetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiFetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const usersData = await usersRes.json();
      const statsData = await statsRes.json();

      if (usersData.success) {
        setUsers(usersData.users || []);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch {
      setErrorMsg('Failed to load super admin data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!token) return;
    try {
      const res = await apiFetch('/api/admin/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId, new_role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Role updated to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  // Handle Emergency Data Reset
  const handleEmergencyReset = async () => {
    if (
      !confirm(
        '⚠️ DANGER: Are you sure you want to reset ALL family trees and chat messages in the database? This action cannot be undone!'
      )
    ) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await apiFetch('/api/admin/reset-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess('All tree data has been completely reset.');
        fetchAdminData();
        if (onRefreshGlobalData) onRefreshGlobalData();
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-70 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-amber-300/40 dark:border-amber-600/30 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 p-5 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-amber-200">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  {isEnglish ? 'Developer Super Admin Panel' : 'ডেভেলপার সুপার অ্যাডমিন কন্ট্রোল প্যানেল'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-amber-200">
                {isEnglish
                  ? `Logged in as ${currentUser.full_name} (${currentUser.email})`
                  : `অ্যাডমিন: ${currentUser.full_name} (${currentUser.email})`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={fetchAdminData}
              disabled={isLoading}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action / Error Banners */}
        {actionSuccess && (
          <div className="bg-emerald-500 text-white px-6 py-2 text-xs font-bold flex items-center space-x-2 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-rose-500 text-white px-6 py-2 text-xs font-bold flex items-center space-x-2 shrink-0">
            <AlertTriangle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* KPI Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-zinc-800/80 border border-amber-200 dark:border-amber-900/50 shadow-2xs">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 mb-1">
                <span className="text-[11px] font-bold">{isEnglish ? 'Users' : 'রেজিস্টার্ড ইউজার'}</span>
                <Users className="w-4 h-4 opacity-70" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {stats ? stats.total_users : '...'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-zinc-800/80 border border-emerald-200 dark:border-emerald-900/50 shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 mb-1">
                <span className="text-[11px] font-bold">{isEnglish ? 'Family Members' : 'বংশলতিকা সদস্য'}</span>
                <Database className="w-4 h-4 opacity-70" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {stats ? stats.total_persons : '...'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-zinc-800/80 border border-blue-200 dark:border-blue-900/50 shadow-2xs">
              <div className="flex items-center justify-between text-blue-800 dark:text-blue-300 mb-1">
                <span className="text-[11px] font-bold">{isEnglish ? 'Messages' : 'মোট চ্যাট বার্তা'}</span>
                <MessageSquare className="w-4 h-4 opacity-70" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {stats ? stats.total_messages : '...'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-zinc-800/80 border border-purple-200 dark:border-purple-900/50 shadow-2xs">
              <div className="flex items-center justify-between text-purple-800 dark:text-purple-300 mb-1">
                <span className="text-[11px] font-bold">{isEnglish ? 'Database Engine' : 'ডাটাবেস'}</span>
                <Server className="w-4 h-4 opacity-70" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-1 truncate">
                Neon PostgreSQL
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">● Connected Active</span>
            </div>
          </div>

          {/* Registered Users List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-zinc-200 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-amber-600" />
                <span>{isEnglish ? 'Registered User Accounts' : 'নিবন্ধিত ব্যবহারকারীদের তালিকা'}</span>
              </h4>
              <span className="text-xs text-slate-500">{users.length} total users</span>
            </div>

            <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 font-bold border-b border-slate-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Email & Phone</th>
                      <th className="p-3">Family Count</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition">
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {u.full_name[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-zinc-100">{u.full_name}</p>
                              <span className="text-[10px] text-slate-400 font-mono">{u.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="text-slate-800 dark:text-zinc-200">{u.email}</p>
                          <p className="text-[11px] text-slate-400">{u.phone_number || '—'}</p>
                        </td>
                        <td className="p-3 font-semibold text-slate-700 dark:text-zinc-300">
                          {u.family_count || 0} members
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'super_admin'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300'
                                : u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}
                          >
                            {u.role === 'super_admin' && <Crown className="w-2.5 h-2.5 mr-1 text-amber-600" />}
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.email !== 'muhibbul524@gmail.com' ? (
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                              className="text-xs bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg px-2 py-1 text-slate-700 dark:text-zinc-300 focus:outline-hidden"
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          ) : (
                            <span className="text-[10px] text-amber-600 font-bold">Root Master</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Emergency Database Management */}
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-rose-900 dark:text-rose-200 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{isEnglish ? 'Emergency Database Reset' : 'জরুরি ডাটাবেস রিসেট কন্ট্রোল'}</span>
                </h4>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                  {isEnglish
                    ? 'Truncates all persons and messages for testing or complete database wipeout.'
                    : 'প্রয়োজনে সমস্ত ফ্যামিলি ট্রি ও বার্তা সম্পূর্ণ মুছে ফেলার একক ক্ষমতা।'}
                </p>
              </div>

              <button
                onClick={handleEmergencyReset}
                disabled={isResetting}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isEnglish ? 'Emergency Reset' : 'ডাটাবেস রিসেট করুন'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
