import React, { useState, useEffect } from 'react';
import { X, Download, Laptop, Monitor, ExternalLink, Sparkles } from 'lucide-react';
import { Language } from './Navbar';
import { DownloadSettings } from '../types';

interface DownloadModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onOpenLicense?: () => void;
}

const DEFAULT_LINKS: DownloadSettings = {
  windowsUrl: 'https://github.com/TeacherCompanion/releases/download/v2.4/TeacherCompanion_v2.4_Setup.exe',
  macUrl: 'https://github.com/TeacherCompanion/releases/download/v2.4/TeacherCompanion_v2.4_macOS.dmg',
  version: '2.4.0-DZ',
  releaseDate: '2026-09-01',
  notesAr: 'الإصدار الرسمي المعتمد لأساتذة التعليم الابتدائي الجزائري',
  notesEn: 'Official desktop release for primary English educators'
};

export const DownloadModal: React.FC<DownloadModalProps> = ({
  lang,
  isOpen,
  onClose,
}) => {
  const [downloadSettings, setDownloadSettings] = useState<DownloadSettings>(DEFAULT_LINKS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch('/api/downloads')
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to load links');
        })
        .then(data => {
          if (data && (data.windowsUrl || data.macUrl)) {
            setDownloadSettings(prev => ({ ...prev, ...data }));
          }
        })
        .catch(err => {
          console.warn('Using default download links:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = (platform: 'windows' | 'mac') => {
    const targetUrl = platform === 'windows' ? downloadSettings.windowsUrl : downloadSettings.macUrl;
    if (!targetUrl) return;

    // Open download link in new tab or direct download
    try {
      const link = document.createElement('a');
      link.href = targetUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const filename = platform === 'windows' ? `TeacherCompanion_${downloadSettings.version}_Setup.exe` : `TeacherCompanion_${downloadSettings.version}_macOS.dmg`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 sm:p-8 relative space-y-6 text-slate-800 shadow-2xl animate-fadeIn">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 rtl:right-4 rtl:left-auto p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm mx-auto border border-slate-200 bg-white">
            <img
              src="/assets/aistudio/1000034518_bfa9ca9b.png"
              alt="Teacher Mate"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-[#1E3A8A]">
              {lang === 'ar' ? 'تنزيل برنامج Teacher Mate' : 'Download Teacher Mate'}
            </h3>
            <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#0D9488] border border-teal-200">
              <Sparkles className="w-3 h-3 text-[#0D9488]" />
              <span>Version {downloadSettings.version || '2.4.0'}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            {lang === 'ar'
              ? 'اختر نظام التشغيل لتحميل النسخة المتوافقة مع جهازك'
              : 'Select your operating system to download the desktop installer'}
          </p>
        </div>

        {/* 2 Supported OS Platforms: Windows & Mac OS */}
        <div className="space-y-3.5">
          
          {/* Windows Option */}
          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-teal-300 hover:border-[#0D9488] transition-all shadow-sm flex items-center justify-between gap-4 group">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-teal-500 text-white shadow-sm shadow-teal-500/30">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-[#1E3A8A]">Windows (.exe)</h4>
                  <span className="text-[10px] bg-teal-100 text-[#0D9488] font-bold px-1.5 py-0.2 rounded">Recommended</span>
                </div>
                <p className="text-[11px] text-slate-500">Windows 10 / 11 (64-bit)</p>
              </div>
            </div>
            <button
              onClick={() => handleDownload('windows')}
              disabled={isLoading}
              className="px-4 py-2.5 bg-[#0D9488] hover:bg-teal-700 text-white font-extrabold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تحميل الآن' : 'Download'}</span>
            </button>
          </div>

          {/* Mac OS Option */}
          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 hover:border-[#1E3A8A] transition-all shadow-sm flex items-center justify-between gap-4 group">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-[#1E3A8A] text-white shadow-sm shadow-blue-900/30">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#1E3A8A]">macOS (.dmg)</h4>
                <p className="text-[11px] text-slate-500">Apple Silicon (M1/M2/M3) & Intel</p>
              </div>
            </div>
            <button
              onClick={() => handleDownload('mac')}
              disabled={isLoading}
              className="px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-extrabold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تحميل الآن' : 'Download'}</span>
            </button>
          </div>

        </div>

        {/* Footer info notice */}
        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            {lang === 'ar'
              ? 'برنامج سطح المكتب مخصص لحواسيب الأساتذة ويعمل بدون إنترنت بعد تفعيل الرخصة.'
              : 'Desktop installer for teacher PCs. Operates 100% offline once activated.'}
          </p>
        </div>

      </div>
    </div>
  );
};
