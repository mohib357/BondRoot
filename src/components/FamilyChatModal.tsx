import React, { useState, useEffect, useRef } from 'react';
import { Person } from '../types/person';
import { ChatMessage } from '../types/message';
import { getFullName } from '../utils/relationship';
import { apiFetch } from '../utils/api';
import {
  X,
  Send,
  Loader2,
  CheckCheck,
  Smile,
  Shield,
  MessageSquare,
  UserCheck,
  Sparkles,
  RefreshCw,
  Phone,
  MessageCircle,
} from 'lucide-react';

interface FamilyChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiver: Person;
  currentUser: Person;
  allPeople: Person[];
  onSwitchCurrentUser?: (person: Person) => void;
  lang?: 'bn' | 'en';
}

export const FamilyChatModal: React.FC<FamilyChatModalProps> = ({
  isOpen,
  onClose,
  receiver,
  currentUser,
  allPeople,
  onSwitchCurrentUser,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick greetings in Bengali & English
  const quickReplies = isEnglish
    ? ['Hello! How are you?', 'Happy Birthday! 🎉', 'Are you coming to the family gathering?', 'Love to all ❤️']
    : ['আসসালামু আলাইকুম', 'কেমন আছেন?', 'শুভ জন্মদিন! 🎉', 'পারিবারিক দাওয়াতে আসবেন তো?', 'সবাইকে ভালোবাসা ❤️'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages between currentUser and receiver
  const fetchMessages = async (silent = false) => {
    if (!currentUser || !receiver) return;
    if (!silent) setIsLoading(true);
    try {
      const res = await apiFetch(`/api/messages/${currentUser.id}/${receiver.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }

      // Mark unread messages as read
      await apiFetch('/api/messages/mark-as-read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: currentUser.id,
          sender_id: receiver.id,
        }),
      });
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Initial load and periodic polling
  useEffect(() => {
    if (!isOpen) return;
    fetchMessages(false);

    const interval = setInterval(() => {
      fetchMessages(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, currentUser.id, receiver.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (e?: React.FormEvent, customContent?: string) => {
    if (e) e.preventDefault();
    const contentToSend = customContent !== undefined ? customContent : inputText;
    if (!contentToSend.trim() || isSending) return;

    const messageContent = contentToSend.trim();
    if (!customContent) setInputText('');

    // Optimistic UI update
    const tempId = 'temp_' + Date.now();
    const optimisticMessage: ChatMessage = {
      id: tempId,
      sender_id: currentUser.id,
      receiver_id: receiver.id,
      content: messageContent,
      is_read: false,
      created_at: new Date().toISOString(),
      sender_name: getFullName(currentUser),
      sender_avatar: currentUser.avatarUrl,
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    setIsSending(true);
    try {
      const res = await apiFetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUser.id,
          receiver_id: receiver.id,
          content: messageContent,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? data.message : m))
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col h-[650px] max-h-[92vh]">
        
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 p-4 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Receiver Avatar */}
            {receiver.avatarUrl ? (
              <img
                src={receiver.avatarUrl}
                alt={getFullName(receiver)}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold flex items-center justify-center border-2 border-emerald-300 shadow-md shrink-0 text-sm">
                {receiver.firstName[0]}
                {receiver.lastName[0]}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm sm:text-base truncate">
                  {getFullName(receiver)}
                </h3>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shrink-0">
                  <Shield className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{isEnglish ? 'Family Member' : 'পারিবারিক সদস্য'}</span>
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 truncate">
                {receiver.occupation ? `${receiver.occupation} • ` : ''}
                {isEnglish ? 'BondRoot Direct Channel' : 'বন্ডরুট সরাসরি বার্তা সংযোগ'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={() => fetchMessages(false)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="Refresh messages"
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

        {/* Active Perspective Switcher (Test & Multi-User Switcher) */}
        <div className="bg-emerald-50/70 dark:bg-zinc-800/80 px-4 py-2 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 shrink-0 font-medium">
              {isEnglish ? 'Sender:' : 'প্রেরক:'}
            </span>
            <span className="font-bold text-slate-800 dark:text-zinc-200 truncate">
              {getFullName(currentUser)}
            </span>
          </div>

          {onSwitchCurrentUser && (
            <select
              value={currentUser.id}
              onChange={(e) => {
                const target = allPeople.find((p) => p.id === e.target.value);
                if (target) onSwitchCurrentUser(target);
              }}
              className="text-[11px] font-semibold bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg px-2 py-1 text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {allPeople
                .filter((p) => p.id !== receiver.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    Switch to: {getFullName(p)}
                  </option>
                ))}
            </select>
          )}
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-zinc-950/40">
          {isLoading && messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <p className="text-xs">{isEnglish ? 'Loading messages...' : 'বার্তা লোড হচ্ছে...'}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                {isEnglish ? 'No messages yet' : 'এখনো কোনো কথোপকথন শুরু হয়নি'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                {isEnglish
                  ? `Send the first direct message to ${getFullName(receiver)}!`
                  : `${getFullName(receiver)}-এর সাথে পারিবারিক বার্তা বিনিময় শুরু করুন।`}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end space-x-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMine && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mb-1 overflow-hidden shadow-xs">
                      {receiver.avatarUrl ? (
                        <img src={receiver.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        receiver.firstName[0]
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-xs transition ${
                      isMine
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs'
                        : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700/80 rounded-bl-xs'
                    }`}
                  >
                    <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                    <div
                      className={`flex items-center justify-end space-x-1 mt-1 text-[10px] ${
                        isMine ? 'text-emerald-100/80' : 'text-slate-400 dark:text-zinc-500'
                      }`}
                    >
                      <span>{formatTimestamp(msg.created_at)}</span>
                      {isMine && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800/60 border-t border-slate-200 dark:border-zinc-800 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] text-slate-400 shrink-0 font-semibold pl-1">
            <Sparkles className="w-3 h-3 text-amber-500 inline mr-0.5" />
          </span>
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(undefined, reply)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 hover:border-emerald-400 text-slate-700 dark:text-zinc-200 transition shrink-0 cursor-pointer shadow-2xs"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center space-x-2 shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isEnglish
                ? `Message ${receiver.firstName}...`
                : `${receiver.firstName}-কে বার্তা লিখুন...`
            }
            className="flex-1 text-xs px-4 py-3 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 focus:outline-none transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="w-11 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition shadow-md shadow-emerald-600/20 shrink-0 cursor-pointer"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 ml-0.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
