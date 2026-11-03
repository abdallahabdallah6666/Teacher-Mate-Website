import React, { useState, useEffect } from 'react';
import { X, Download, Laptop, Monitor, ExternalLink } from 'lucide-react';
import { Language } from './Navbar';
import { AppDownloadSettings } from '../types';

interface DownloadModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onOpenLicense?: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  lang,
  isOpen,
  onClose,
}) => {
  const [downloadSettings, setDownloadSettings] = useState<AppDownloadSettings>({
    windowsDownloadUrl: '',
    macDownloadUrl: '',
    appVersion: 'v2.4.0-DZ'
  });
  const [loadingSettings, setLoadingSettings] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingSettings(true);
      fetch('/api/app-settings')
        .then(res => res.json())
        .then(data => {
          if (data) {
            setDownloadSettings({
              windowsDownloadUrl: data.windowsDownloadUrl || '',
              macDownloadUrl: data.macDownloadUrl || '',
              appVersion: data.appVersion || 'v2.4.0-DZ'
            });
          }
        })
        .catch(err => console.warn('Could not load download links:', err))
        .finally(() => setLoadingSettings(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartFallbackDownload = (filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([
      `Teacher Mate ${downloadSettings.appVersion || 'v2.4'} Algeria Desktop Software Installer\nVersion: 2.4.0-DZ\nTarget Platform: ${filename}\nStatus: Ready for installation\n\nThank you for choosing Teacher Mate for Algerian Primary Educators!`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleWindowsClick = () => {
    const customUrl = downloadSettings.windowsDownloadUrl?.trim();
    if (customUrl) {
      // Direct user to the link configured by admin in Admin Dashboard
      const link = document.createElement("a");
      link.href = customUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback local package if no custom link is set yet
      handleStartFallbackDownload('TeacherMate_v2.4_Setup.exe');
    }
  };

  const handleMacClick = () => {
    const customUrl = downloadSettings.macDownloadUrl?.trim();
    if (customUrl) {
      const link = document.createElement("a");
      link.href = customUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      handleStartFallbackDownload('TeacherMate_v2.4_macOS.dmg');
    }
  };

  const hasCustomWindowsLink = Boolean(downloadSettings.windowsDownloadUrl?.trim());

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 sm:p-8 relative space-y-6 text-slate-800 shadow-xl animate-fadeIn">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 rtl:right-4 rtl:left-auto p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
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
          <h3 className="text-2xl font-extrabold text-[#1E3A8A]">
            {lang === 'ar' ? 'تنزيل برنامج Teacher Mate' : 'Download Teacher Mate'}
          </h3>
          <p className="text-xs text-slate-500">
            {lang === 'ar' ? 'اختر نظام التشغيل الخاص بحاسوبك للبدء في التثبيت' : 'Choose your operating system to start installation'}
          </p>
        </div>

        {/* 2 Supported Download Packages: Windows & Mac OS (Linux removed) */}
        <div className="space-y-3">
          
          {/* Windows Option (Primary) */}
          <div className="p-4 bg-[#F8FAFC] rounded-xl border-2 border-teal-500/40 flex items-center justify-between gap-4 hover:border-[#0D9488] transition-all shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 text-[#0D9488] border border-teal-200 shadow-2xs">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-[#1E3A8A]">Windows (.exe)</h4>
                  <span className="px-2 py-0.5 bg-teal-50 text-[#0D9488] border border-teal-200 rounded text-[10px] font-bold">
                    {lang === 'ar' ? 'الإصدار الموصى به' : 'Recommended'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Windows 10 / 11 · 64-bit · {downloadSettings.appVersion || 'v2.4.0'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleWindowsClick}
              className="px-5 py-2.5 bg-[#0D9488] hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              title={hasCustomWindowsLink ? (lang === 'ar' ? 'التحميل من الرابط المعتمد' : 'Download from configured link') : (lang === 'ar' ? 'تحميل مباشر' : 'Download directly')}
            >
              {hasCustomWindowsLink ? (
                <ExternalLink className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{lang === 'ar' ? 'تحميل للويندوز' : 'Download for Windows'}</span>
            </button>
          </div>

          {/* Mac OS Option */}
          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-slate-200 flex items-center justify-between gap-4 hover:border-[#1E3A8A] transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[#1E3A8A]">Mac OS (.dmg)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Apple Silicon (M1/M2/M3/M4) & Intel</p>
              </div>
            </div>
            <button
              onClick={handleMacClick}
              className="px-4 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تحميل للماك' : 'Download for Mac'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
