import React, { useState } from 'react';
import { Person } from '../types/person';
import { SAMPLE_DEMO_PEOPLE } from '../data/initialData';
import { X, Download, Upload, RotateCcw, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  onImportPeople: (people: Person[]) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  people,
  onImportPeople,
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(people, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bondroot-family-tree-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSuccessMsg('Family tree exported successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleImportText = () => {
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('Import data must be a JSON array of Person objects.');
      }
      onImportPeople(parsed);
      setSuccessMsg(`Successfully imported ${parsed.length} people!`);
      setImportJsonText('');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON format.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          throw new Error('Uploaded JSON file must contain an array of Person items.');
        }
        onImportPeople(parsed);
        setSuccessMsg(`Successfully imported ${parsed.length} people from file!`);
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 1500);
      } catch (err: any) {
        setErrorMsg(err.message || 'Error parsing file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSample = () => {
    if (confirm('Reset to the sample family tree? This will overwrite current changes.')) {
      onImportPeople(SAMPLE_DEMO_PEOPLE);
      setSuccessMsg('Reset to sample family tree!');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all people from the tree? You will start completely from blank.')) {
      onImportPeople([]);
      setSuccessMsg('Family tree cleared.');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Family Tree Data Management</h3>
            <p className="text-xs text-slate-500">Backup, transfer, or restore your genealogy records</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-800 px-6 py-2.5 text-xs flex items-center space-x-2 border-b border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-rose-50 text-rose-800 px-6 py-2.5 text-xs flex items-center space-x-2 border-b border-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <div className="p-6 space-y-6 text-xs">
          {/* Export */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center space-x-2 text-sm">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export Family Tree</span>
            </h4>
            <p className="text-slate-500 mb-3">
              Download your complete family records with all {people.length} members and kinship bonds as a portable JSON file.
            </p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Import */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1 flex items-center space-x-2 text-sm">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Import Family Data</span>
            </h4>
            <p className="text-slate-500 mb-3">
              Upload a previously exported JSON backup file or paste raw JSON.
            </p>

            <div className="space-y-3">
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Or paste JSON array of persons here..."
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-800 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {importJsonText && (
                  <button
                    onClick={handleImportText}
                    className="mt-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
                  >
                    Load Pasted JSON
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preset Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={handleResetSample}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restore Sample Tree</span>
            </button>

            <button
              onClick={handleClearAll}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
