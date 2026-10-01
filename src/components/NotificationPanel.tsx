import React from 'react';
import { NotificationItem } from '../types/message';
import { Person } from '../types/person';
import { getFullName } from '../utils/relationship';
import {
  Bell,
  X,
  MessageSquare,
  CheckCheck,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  allPeople: Person[];
  onOpenChatWithPerson: (person: Person) => void;
  onMarkAllAsRead?: () => void;
  lang?: 'bn' | 'en';
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  allPeople,
  onOpenChatWithPerson,
  onMarkAllAsRead,
  lang = 'bn',
}) => {
  if (!isOpen) return null;
  const isEnglish = lang === 'en';

  const personMap = new Map<string, Person>();
  allPeople.forEach((p) => personMap.set(p.id, p));

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-2xs"
        onClick={onClose}
      />

      {/* Notification Popover Drawer */}
      <div className="fixed top-16 right-4 sm:right-6 z-50 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-150 flex flex-col max-h-[500px]">
        
        {/* Panel Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">
                {isEnglish ? 'Family Notifications' : 'পারিবারিক বার্তা ও নোটিফিকেশন'}
              </h3>
              <p className="text-[10px] text-emerald-200">
                {unreadCount > 0
                  ? (isEnglish ? `${unreadCount} unread messages` : `${unreadCount}টি অপঠিত বার্তা`)
                  : (isEnglish ? 'All messages read' : 'সব বার্তা পঠিত')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {unreadCount > 0 && onMarkAllAsRead && (
              <button
                onClick={onMarkAllAsRead}
                className="p-1.5 text-xs text-emerald-200 hover:text-white rounded-lg transition"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 text-xs">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mx-auto">
                <Bell className="w-5 h-5 opacity-50" />
              </div>
              <p className="font-bold text-slate-600 dark:text-zinc-300">
                {isEnglish ? 'No new notifications' : 'কোনো নতুন নোটিফিকেশন নেই'}
              </p>
              <p className="text-[11px]">
                {isEnglish
                  ? 'New family messages will appear right here.'
                  : 'পরিবারের সদস্যরা বার্তা পাঠালে এখানে দেখতে পাবেন।'}
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const sender = personMap.get(notif.sender_id);
              const senderName = sender ? getFullName(sender) : notif.sender_name || 'পরিবারের সদস্য';

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (sender) onOpenChatWithPerson(sender);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-start space-x-3 group ${
                    !notif.is_read
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100/70'
                      : 'bg-white dark:bg-zinc-800/40 border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {/* Sender Avatar */}
                  <div className="relative shrink-0 mt-0.5">
                    {sender?.avatarUrl || notif.sender_avatar ? (
                      <img
                        src={sender?.avatarUrl || notif.sender_avatar}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-emerald-300 shadow-2xs"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center shadow-2xs text-xs">
                        {sender ? sender.firstName[0] : 'B'}
                      </div>
                    )}
                    {!notif.is_read && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white dark:border-zinc-900 rounded-full animate-pulse" />
                    )}
                  </div>

                  {/* Content Preview */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-extrabold text-slate-900 dark:text-zinc-100 truncate">
                        {senderName}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 shrink-0 ml-1 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatTime(notif.created_at)}</span>
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-zinc-300 text-[11px] line-clamp-2 leading-relaxed">
                      {notif.content}
                    </p>

                    <div className="flex items-center space-x-1 mt-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      <MessageSquare className="w-3 h-3" />
                      <span>{isEnglish ? 'Open Conversation' : 'চ্যাট খুলুন'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
