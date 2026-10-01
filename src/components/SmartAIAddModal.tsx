import React, { useState } from 'react';
import { Person } from '../types/person';
import { apiFetch } from '../utils/api';
import { X, Sparkles, Mic, MicOff, Send, CheckCircle2, UserPlus, Users, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface SmartAIAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPeople: Person[];
  onSuccess: (newPersons: any[]) => void;
  lang?: 'bn' | 'en';
}

export const SmartAIAddModal: React.FC<SmartAIAddModalProps> = ({
  isOpen,
  onClose,
  existingPeople,
  onSuccess,
  lang = 'bn',
}) => {
  const isEnglish = lang === 'en';
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [parsedResult, setParsedResult] = useState<any | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Voice recognition setup
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isEnglish ? 'Speech recognition is not supported in this browser.' : 'আপনার ব্রাউজারে স্পিচ রিকগনিশন সাপোর্ট করে না। অনুগ্রহ করে টাইপ করুন।');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = isEnglish ? 'en-US' : 'bn-BD';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSampleClick = (sample: string) => {
    setInputText(sample);
    setParsedResult(null);
    setErrorMessage(null);
  };

  const handleParse = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setParsedResult(null);

    try {
      const response = await apiFetch('/api/ai/parse-natural-family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          existingPeople: existingPeople.map((p) => ({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            gender: p.gender,
          })),
          commit_to_db: false,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse natural family input');
      }

      setParsedResult(data);
    } catch (err: any) {
      console.error('Error parsing family input:', err);
      setErrorMessage(err.message || 'AI পার্সিং সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!inputText.trim()) return;
    setIsCommitting(true);
    setErrorMessage(null);

    try {
      const response = await apiFetch('/api/ai/parse-natural-family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          existingPeople: existingPeople.map((p) => ({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            gender: p.gender,
          })),
          commit_to_db: true,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to commit parsed family members');
      }

      onSuccess(data.inserted_persons || []);
      onClose();
    } catch (err: any) {
      console.error('Error committing family:', err);
      setErrorMessage(err.message || 'ডাটাবেজে যুক্ত করতে সমস্যা হয়েছে।');
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 via-indigo-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {isEnglish ? 'Smart AI Member Entry' : 'স্মার্ট এআই মেম্বার এন্ট্রি'}
                <span className="text-[10px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
                  Gemini 3.8
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {isEnglish
                  ? 'Speak or write in natural language to add family members & bloodlines automatically'
                  : 'সাধারণ বাংলায় লিখুন বা বলুন — AI স্বয়ংক্রিয়ভাবে সদস্য ও রক্তের সম্পর্ক তৈরি করবে'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Quick Samples */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              {isEnglish ? 'Quick Sample Prompts:' : 'সহজ নমুনায় ক্লিক করে পরীক্ষা করুন:'}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSampleClick('আমার নাম রহিম, আমার বাবার নাম করিম, আর আমার এক ছেলে আছে নাম রাফি')}
                className="text-xs bg-slate-100 hover:bg-purple-50 hover:text-purple-800 border border-slate-200 hover:border-purple-300 px-3 py-1.5 rounded-lg transition cursor-pointer text-slate-700"
              >
                "আমার নাম রহিম, আমার বাবার নাম করিম, আর আমার এক ছেলে আছে নাম রাফি"
              </button>
              <button
                type="button"
                onClick={() => handleSampleClick('মুহিবের এক চাচাতো ভাই আছে নাম সোহেল রানা, পেশা শিক্ষক, জন্ম ২০০১')}
                className="text-xs bg-slate-100 hover:bg-purple-50 hover:text-purple-800 border border-slate-200 hover:border-purple-300 px-3 py-1.5 rounded-lg transition cursor-pointer text-slate-700"
              >
                "মুহিবের এক চাচাতো ভাই আছে নাম সোহেল রানা, পেশা শিক্ষক..."
              </button>
            </div>
          </div>

          {/* Input Box with Voice & Send */}
          <div className="relative">
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isEnglish
                  ? 'e.g. "My name is Rahim, my father is Karim, and I have a son named Rafi..."'
                  : 'যেমন: "আমার নাম রহিম, আমার বাবার নাম করিম, আর আমার এক ছেলে আছে নাম রাফি..."'
              }
              className="w-full text-sm border border-slate-300 rounded-xl p-3.5 pr-24 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-inner bg-slate-50/50"
            />

            {/* Action buttons inside text area */}
            <div className="absolute right-3 bottom-3 flex items-center space-x-1.5">
              <button
                type="button"
                onClick={toggleListening}
                title={isListening ? 'Stop listening' : 'Speak via microphone'}
                className={`p-2 rounded-lg border transition ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-white text-slate-600 hover:text-purple-700 hover:bg-purple-50 border-slate-200'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="button"
                disabled={isLoading || !inputText.trim()}
                onClick={handleParse}
                className="inline-flex items-center space-x-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{isEnglish ? 'Analyze' : 'বিশ্লেষণ'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parsed Result Preview */}
          {parsedResult && (
            <div className="space-y-4 bg-linear-to-br from-purple-50/60 via-indigo-50/40 to-white p-4 rounded-xl border border-purple-200 shadow-2xs">
              {/* Summary message */}
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {isEnglish ? 'AI Parsing Summary' : 'AI শনাক্তকরণ সারাংশ:'}
                  </h4>
                  <p className="text-xs text-slate-700 mt-0.5 font-medium leading-relaxed">
                    {parsedResult.summary}
                  </p>
                </div>
              </div>

              {/* Parsed New Persons */}
              {parsedResult.new_persons && parsedResult.new_persons.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>
                      {isEnglish
                        ? `Detected New Members (${parsedResult.new_persons.length}):`
                        : `সনাক্তকৃত নতুন সদস্যবৃন্দ (${parsedResult.new_persons.length} জন):`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {parsedResult.new_persons.map((np: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-lg border border-purple-200/80 shadow-2xs text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900">{np.name_local}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              np.gender === 'female'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {np.gender === 'female' ? 'মহিলা' : 'পুরুষ'}
                          </span>
                        </div>
                        {np.name_english && (
                          <div className="text-[11px] text-slate-500">{np.name_english}</div>
                        )}
                        {np.profession && (
                          <div className="text-[11px] text-slate-600 mt-1">পেশা: {np.profession}</div>
                        )}
                        {np.birth_year && (
                          <div className="text-[11px] text-slate-600">জন্ম: {np.birth_year}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Parsed Relationships / Connections */}
              {parsedResult.connections && parsedResult.connections.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {isEnglish ? 'Identified Family Connections:' : 'রক্তের সংযোগসমূহ:'}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {parsedResult.connections.map((conn: any, idx: number) => {
                      const fromPerson = parsedResult.new_persons?.find((p: any) => p.temp_id === conn.from_id);
                      const toPerson = parsedResult.new_persons?.find((p: any) => p.temp_id === conn.to_id);
                      const fromName = fromPerson ? fromPerson.name_local : conn.from_id;
                      const toName = toPerson ? toPerson.name_local : conn.to_id;

                      return (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md text-[11px]"
                        >
                          <span className="font-semibold text-slate-800">{fromName}</span>
                          <ArrowRight className="w-3 h-3 text-purple-500" />
                          <span className="bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                            {conn.relation_type === 'father'
                              ? 'পিতা'
                              : conn.relation_type === 'mother'
                              ? 'মাতা'
                              : conn.relation_type === 'child'
                              ? 'সন্তান'
                              : conn.relation_type === 'spouse'
                              ? 'স্ত্রী/স্বামী'
                              : conn.relation_type}
                          </span>
                          <ArrowRight className="w-3 h-3 text-purple-500" />
                          <span className="font-semibold text-slate-800">{toName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Confirm & Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={isCommitting}
                  onClick={handleCommit}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
                >
                  {isCommitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>
                        {isEnglish ? 'Confirm & Add to Tree' : 'নিশ্চিত করুন ও বংশলতিকায় যুক্ত করুন'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {isEnglish
              ? 'Powered by Gemini AI Semantic Entity Extraction'
              : 'জেমিনাই এআই সিম্যান্টিক এন্টিটি এক্সট্র্যাকশন প্রযুক্তি'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition shadow-2xs"
          >
            {isEnglish ? 'Close' : 'বন্ধ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
