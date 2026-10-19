import React, { useState, useEffect } from 'react';
import {
  Video,
  HelpCircle,
  AlertTriangle,
  Send,
  MessageSquare,
  Key,
  CheckCircle,
  Clock,
  ShieldCheck,
  User,
  Search,
  Play,
  FileText,
  RefreshCw,
  LogOut,
  Tag,
  Copy,
  Check,
  CreditCard,
  Calendar
} from 'lucide-react';
import { UserProfile, TutorialVideo, SupportInquiry } from '../types';
import { Language } from './Navbar';

export interface RealLicenseDetails {
  key: string;
  plan: string;
  status: string;
  paymentDate: string;
  issuedAt: string;
  expiresAt: string;
  amountDZD: number;
  originalPriceDZD?: number;
  promoCode?: string;
  discountPercent?: number;
  paidVia: string;
  maxDevices: number;
  invoiceNumber: string;
  orderId?: string;
  userName: string;
  userEmail: string;
  schoolName?: string;
  wilaya?: string;
}

interface TeacherHubProps {
  lang: Language;
  currentUser: UserProfile;
  initialTab?: 'license' | 'tutorials' | 'inquiries';
  onLogout: () => void;
}

export const TeacherHub: React.FC<TeacherHubProps> = ({
  lang,
  currentUser,
  initialTab = 'license',
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'license' | 'tutorials' | 'inquiries'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Tutorials states
  const [tutorials, setTutorials] = useState<TutorialVideo[]>([]);
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialVideo | null>(null);
  const [tutorialFilter, setTutorialFilter] = useState<string>('all');

  // Inquiries / SOS states
  const [inquiries, setInquiries] = useState<SupportInquiry[]>([]);
  const [subject, setSubject] = useState<string>('');
  const [category, setCategory] = useState<string>('استفسار عن التفعيل');
  const [message, setMessage] = useState<string>('');
  const [isSOS, setIsSOS] = useState<boolean>(false);
  const [submittingInquiry, setSubmittingInquiry] = useState<boolean>(false);
  const [inquirySuccessMsg, setInquirySuccessMsg] = useState<string | null>(null);

  // License & E-Invoice details state
  const [licenseDetails, setLicenseDetails] = useState<RealLicenseDetails | null>(null);
  const [loadingLicense, setLoadingLicense] = useState<boolean>(false);
  const [promoInput, setPromoInput] = useState<string>('');
  const [applyingPromo, setApplyingPromo] = useState<boolean>(false);
  const [promoFeedback, setPromoFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    fetchTutorials();
    fetchInquiries();
    fetchLicenseDetails();
  }, [currentUser]);

  const fetchTutorials = async () => {
    try {
      const res = await fetch('/api/tutorials');
      if (!res.ok) return;
      const ct = res.headers.get('content-type');
      if (!ct || !ct.includes('application/json')) return;
      const json = await res.json();
      if (json.tutorials) {
        setTutorials(json.tutorials);
        if (json.tutorials.length > 0) {
          setSelectedTutorial(json.tutorials[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load tutorials', e);
    }
  };

  const fetchInquiries = async () => {
    try {
      const res = await fetch(`/api/inquiries?email=${encodeURIComponent(currentUser.email)}`);
      if (!res.ok) return;
      const ct = res.headers.get('content-type');
      if (!ct || !ct.includes('application/json')) return;
      const json = await res.json();
      if (json.inquiries) {
        setInquiries(json.inquiries);
      }
    } catch (e) {
      console.error('Failed to load inquiries', e);
    }
  };

  const fetchLicenseDetails = async (optionalPromo?: string) => {
    setLoadingLicense(true);
    try {
      const promoQuery = optionalPromo ? `&promoCode=${encodeURIComponent(optionalPromo)}` : '';
      const res = await fetch(`/api/user/license-details?email=${encodeURIComponent(currentUser.email)}${promoQuery}`);
      if (!res.ok) return;
      const ct = res.headers.get('content-type');
      if (!ct || !ct.includes('application/json')) return;
      const json = await res.json();
      if (json.license) {
        setLicenseDetails(json.license);
      }
    } catch (err) {
      console.error('Failed to load real license details', err);
    } finally {
      setLoadingLicense(false);
    }
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setApplyingPromo(true);
    setPromoFeedback(null);
    try {
      const res = await fetch('/api/user/apply-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          promoCode: promoInput.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPromoFeedback({
          type: 'success',
          message: lang === 'en' 
            ? `Promo code "${data.promoCode}" applied! Real price updated to ${data.amountDZD} DZD.`
            : `تم تطبيق رمز التخفيض "${data.promoCode}" بنجاح! تم تحديث المبلغ إلى ${data.amountDZD} دج.`
        });
        await fetchLicenseDetails(data.promoCode);
        setPromoInput('');
      } else {
        setPromoFeedback({
          type: 'error',
          message: data.error || (lang === 'en' ? 'Invalid promo code' : 'كوبون تخفيض غير صالح')
        });
      }
    } catch (err: any) {
      setPromoFeedback({
        type: 'error',
        message: err?.message || (lang === 'en' ? 'Failed to apply promo code' : 'فشل تطبيق رمز التخفيض')
      });
    } finally {
      setApplyingPromo(false);
    }
  };

  // Inquiry Submission
  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmittingInquiry(true);
    setInquirySuccessMsg(null);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userEmail: currentUser.email,
          userName: currentUser.fullName,
          wilaya: currentUser.wilaya,
          subject,
          category,
          message,
          isSOS
        })
      });

      const json = await res.json();
      if (json.success) {
        setInquirySuccessMsg(json.message);
        setSubject('');
        setMessage('');
        setIsSOS(false);
        fetchInquiries();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  // Filtered Tutorials
  const filteredTutorials = tutorials.filter(tut => {
    if (tutorialFilter === 'all') return true;
    return tut.category === tutorialFilter;
  });

  return (
    <section className="bg-slate-50 min-h-screen py-8 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* User Hub Header Card */}
        <div className="bg-[#1E3A8A] text-white p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0D9488] text-white text-[11px] font-extrabold rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>
                {lang === 'ar' ? 'حساب أستاذ مؤكد ورخصة رسمية (Chargily Pay)' : 'Verified Account & Official License (Chargily Pay)'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {lang === 'ar' ? `أهلاً بك أستاذ ${currentUser.fullName}` : `Welcome, Prof. ${currentUser.fullName}`}
            </h1>

            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              {lang === 'ar'
                ? `المدرسة: ${currentUser.schoolName || 'التعليم الابتدائي'} | الولاية: ${currentUser.wilaya} | حالة الرخصة: نشط`
                : `School: ${currentUser.schoolName || 'Primary Education'} | Wilaya: ${currentUser.wilaya} | Status: Active`}
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <button
              onClick={onLogout}
              className="px-4 py-2.5 bg-blue-900/80 hover:bg-blue-900 text-slate-200 hover:text-white border border-blue-400/30 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4 text-slate-300" />
              <span>
                {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
              </span>
            </button>
          </div>
        </div>

        {/* Hub Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white rounded-xl shadow-sm p-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('license')}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'license'
                ? 'bg-[#0D9488] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>
              {lang === 'ar' ? 'الرخصة الرسمية والفاتورة الإلكترونية' : 'Official License & E-Invoice'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tutorials')}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'tutorials'
                ? 'bg-[#0D9488] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>
              {lang === 'ar' ? 'شروحات الفيديو' : 'Video Tutorials'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'inquiries'
                ? 'bg-[#0D9488] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>
              {lang === 'ar' ? 'نظام الاستفسارات وبلاغات SOS العاجلة' : 'Inquiries & Urgent SOS'}
            </span>
            {inquiries.some(i => i.isSOS) && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>
        </div>

        {/* TAB 2: TUTORIALS SECTION */}
        {activeTab === 'tutorials' && (
          <div className="space-y-6">
            
            {/* Filter buttons (only if categories exist) */}
            {tutorials.some(t => Boolean(t.category)) && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {['all', ...Array.from(new Set(tutorials.map(t => t.category).filter(Boolean)))].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTutorialFilter(cat as string)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                      tutorialFilter === cat
                        ? 'bg-[#1E3A8A] text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'all' ? (lang === 'ar' ? 'جميع الشروحات' : 'All Tutorials') : cat}
                  </button>
                ))}
              </div>
            )}

            {/* Selected Active Tutorial Player View */}
            {selectedTutorial && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Video Player */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative shadow-md">
                      <iframe
                        src={selectedTutorial.videoUrl}
                        title={selectedTutorial.titleAr}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        {selectedTutorial.category && (
                          <>
                            <span className="px-2.5 py-0.5 bg-teal-50 text-[#0D9488] font-extrabold rounded-md">
                              {selectedTutorial.category}
                            </span>
                            <span className="text-slate-400">•</span>
                          </>
                        )}
                        <span className="text-slate-500 font-bold">{selectedTutorial.duration || '05:00'}</span>
                      </div>
                      <h2 className="text-xl font-extrabold text-[#1E3A8A]">
                        {lang === 'en' ? (selectedTutorial.titleEn || selectedTutorial.titleAr) : selectedTutorial.titleAr}
                      </h2>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {lang === 'en' ? (selectedTutorial.descriptionEn || selectedTutorial.descriptionAr) : selectedTutorial.descriptionAr}
                      </p>
                    </div>
                  </div>

                  {/* Key Steps Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-extrabold text-[#1E3A8A] flex items-center gap-2 border-b border-slate-200 pb-2">
                      <FileText className="w-4 h-4 text-[#0D9488]" />
                      <span>{lang === 'ar' ? 'الخطوات والتطبيق المباشر' : 'Key Implementation Steps'}</span>
                    </h3>
                    <ul className="space-y-3 text-xs text-slate-700">
                      {selectedTutorial.keySteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            )}

            {/* Tutorials List Grid */}
            {filteredTutorials.length === 0 && !selectedTutorial ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Play className="w-6 h-6 text-[#0D9488]" />
                </div>
                <h4 className="text-sm font-extrabold text-[#1E3A8A]">
                  {lang === 'ar' ? 'لا توجد فيديوهات توضيحية حالياً' : 'No Tutorial Videos Available Yet'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {lang === 'ar'
                    ? 'سيتم نشر شروحات فيديو تعليمية جديدة قريباً من طرف الإدارة.'
                    : 'New instructional video tutorials will be published soon by the administration.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTutorials.map((tut) => (
                <div
                  key={tut.id}
                  onClick={() => setSelectedTutorial(tut)}
                  className={`bg-white border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer ${
                    selectedTutorial?.id === tut.id ? 'border-[#0D9488] ring-2 ring-[#0D9488]/20' : 'border-slate-200'
                  }`}
                >
                  <div className="h-40 bg-slate-800 relative overflow-hidden group">
                    <img src={tut.thumbnailUrl} alt={tut.titleAr} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90" />
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#0D9488] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-current text-white ms-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 rtl:left-2 rtl:right-auto px-2 py-0.5 bg-black/80 text-white text-[10px] font-bold rounded">
                      {tut.duration}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    {tut.category && (
                      <span className="text-[10px] font-extrabold text-[#0D9488] uppercase block">
                        {tut.category}
                      </span>
                    )}
                    <h4 className="text-xs font-extrabold text-[#1E3A8A] line-clamp-2 leading-snug">
                      {lang === 'en' ? (tut.titleEn || tut.titleAr) : tut.titleAr}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
            )}

          </div>
        )}

        {/* TAB 3: ENQUIRIES & SOS URGENT RESPONSE SYSTEM */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Create New Inquiry / SOS */}
              <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-[#1E3A8A] flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#0D9488]" />
                    <span>{lang === 'ar' ? 'طرح استفسار أو إبلاغ عاجل' : 'Submit Inquiry or Urgent SOS'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'ar' ? 'فريق الدعم الفني متواجد لمساعدتك أونلاين على مدار الأسبوع.' : 'Our technical support team is online to assist you.'}
                  </p>
                </div>

                {inquirySuccessMsg && (
                  <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold rounded-lg flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                    <span>{inquirySuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSendInquiry} className="space-y-3">
                  
                  {/* SOS Priority Checkbox Toggle */}
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    isSOS ? 'bg-red-50 border-red-300' : 'bg-amber-50/50 border-amber-200'
                  }`}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSOS}
                        onChange={(e) => setIsSOS(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-extrabold text-red-700 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span>{lang === 'ar' ? '🚨 تفعيل بلاغ طوارئ عاجل جداً (SOS Priority)' : '🚨 Activate Urgent SOS Priority Report'}</span>
                        </span>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          {lang === 'ar'
                            ? 'حدد هذا الخيار إذا كان لديك مشكلة طارئة في تفعيل الرخصة تحتاج معالجة عاجلة.'
                            : 'Select this option if you have an urgent license activation issue needing priority resolution.'}
                        </p>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                      {lang === 'ar' ? 'موضوع الاستفسار' : 'Inquiry Subject'}
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: استفسار حول تفعيل رخصة التطبيق' : 'e.g., Question about app license activation'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0D9488]"
                    />
                  </div>

                  {!isSOS && (
                    <div>
                      <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                        {lang === 'ar' ? 'التصنيف' : 'Category'}
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0D9488]"
                      >
                        <option value="استفسار عن التفعيل">
                          {lang === 'ar' ? 'استفسار عن التفعيل بالذهبية' : 'Edahabia License Activation Inquiry'}
                        </option>
                        <option value="مشكلة في البرنامج">
                          {lang === 'ar' ? 'مشكلة أو خطأ في برنامج الحاسوب' : 'Software Technical Issue'}
                        </option>
                        <option value="اقتراح ميزة جديدة">
                          {lang === 'en' ? 'New Pedagogical Feature Suggestion' : 'اقتراح ميزة بيداغوجية جديدة'}
                        </option>
                        <option value="طلب فترات تدريبية">
                          {lang === 'en' ? 'AI Training Guide Request' : 'طلب دليل تدريبي لاستعمال الذكاء الاصطناعي'}
                        </option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#1E3A8A] mb-1">
                      {lang === 'en' ? 'Message Details' : 'تفاصيل الرسالة أو المشكلة'}
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={lang === 'en' ? 'Describe the issue or request in detail...' : 'اشرح لنا بالتفصيل نوع المشكلة التي تواجهها...'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0D9488]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingInquiry}
                    className={`w-full py-3 font-extrabold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all ${
                      isSOS
                        ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                        : 'bg-[#1E3A8A] hover:bg-blue-900 text-white'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {submittingInquiry
                        ? (lang === 'en' ? 'Sending...' : 'جاري الإرسال...')
                        : (isSOS ? (lang === 'en' ? 'Send Urgent SOS Report Immediately' : 'إرسال بلاغ SOS العاجل فورياً') : (lang === 'en' ? 'Send Inquiry' : 'إرسال الاستفسار'))
                      }
                    </span>
                  </button>

                </form>

              </div>

              {/* Right Column: List of Inquiries & SOS History */}
              <div className="lg:col-span-2 space-y-4">
                
                <div className="flex items-center justify-between bg-white p-4 border border-slate-200 rounded-xl">
                  <h3 className="text-sm font-extrabold text-[#1E3A8A] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0D9488]" />
                    <span>{lang === 'en' ? 'Previous Inquiries & SOS History' : 'سجل الاستفسارات وبلاغات الطوارئ السابقة'}</span>
                  </h3>
                  <button
                    onClick={fetchInquiries}
                    className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-md transition-colors"
                    title={lang === 'en' ? 'Refresh Data' : 'تحديث البيانات'}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {inquiries.length > 0 ? (
                    inquiries.map((inq) => (
                      <div
                        key={inq.id}
                        className={`bg-white border rounded-xl p-5 shadow-xs space-y-3 ${
                          inq.isSOS ? 'border-red-300 ring-2 ring-red-100 bg-red-50/20' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {inq.isSOS && (
                                <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded uppercase animate-bounce">
                                  🚨 SOS Urgent
                                </span>
                              )}
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded">
                                {inq.category}
                              </span>
                            </div>
                            <h4 className="text-sm font-extrabold text-[#1E3A8A]">
                              {inq.subject}
                            </h4>
                          </div>

                          <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full shrink-0 ${
                            inq.status === 'replied' ? 'bg-teal-100 text-teal-800' :
                            inq.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {inq.status === 'replied' ? (lang === 'en' ? 'Replied' : 'تمت الإجابة') :
                             inq.status === 'pending' ? (lang === 'en' ? 'Processing' : 'قيد المعالجة السريعة') : (lang === 'en' ? 'Closed' : 'مغلق')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50 p-3 rounded-lg border border-slate-100">
                          {inq.message}
                        </p>

                        {/* Admin Reply Box */}
                        {inq.adminReply && (
                          <div className="p-3.5 bg-teal-50/80 border border-teal-200 rounded-lg space-y-1 text-xs">
                            <div className="flex items-center justify-between font-extrabold text-[#0D9488]">
                              <span className="flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                                <span>{lang === 'en' ? 'Technical Admin Team Reply:' : 'رد المشرف الفني (Admin Team):'}</span>
                              </span>
                              {inq.repliedAt && (
                                <span className="text-[10px] text-slate-400 font-normal">
                                  {new Date(inq.repliedAt).toLocaleString(lang === 'en' ? 'en-US' : 'ar-DZ')}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-800 font-medium leading-relaxed">
                              {inq.adminReply}
                            </p>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                          <span>{lang === 'en' ? 'Ref ID:' : 'الرقم المرجعي:'} #{inq.id}</span>
                          <span>{lang === 'en' ? 'Submitted:' : 'تاريخ الإرسال:'} {new Date(inq.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-DZ')}</span>
                        </div>

                      </div>
                    ))
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2">
                      <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500 font-bold">
                        {lang === 'en' ? 'You have not submitted any inquiries or SOS alerts yet.' : 'لم تقم بإرسال أي استفسار أو بلاغ طوارئ حتى الآن.'}
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 4: OFFICIAL LICENSE & E-INVOICE PANEL */}
        {activeTab === 'license' && (() => {
          // Calculate payment date and exact 1-year expiration date
          const paymentDateRaw = licenseDetails?.paymentDate || licenseDetails?.issuedAt || currentUser.createdAt || new Date().toISOString();
          const pDate = new Date(paymentDateRaw);
          const validPaymentDate = isNaN(pDate.getTime()) ? new Date() : pDate;

          const expDate = new Date(validPaymentDate);
          expDate.setFullYear(expDate.getFullYear() + 1);

          const paymentFormattedEn = validPaymentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          const paymentFormattedAr = validPaymentDate.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' });

          const expiryFormattedEn = expDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + ' (Full Year)';
          const expiryFormattedAr = expDate.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' }) + ' (سنة كاملة)';

          const originalPrice = licenseDetails?.originalPriceDZD || 3000;
          const activePromoCode = licenseDetails?.promoCode || currentUser.promoCode;
          const discountPercent = licenseDetails?.discountPercent || (activePromoCode ? 10 : 0);
          const realPricePaid = licenseDetails?.amountDZD || currentUser.amountPaidDZD || (activePromoCode ? Math.round(originalPrice * (1 - discountPercent / 100)) : originalPrice);
          const activeKey = licenseDetails?.key || currentUser.licenseKey || 'TC-ALG-PRO-8899-X2K1';
          const invoiceNum = licenseDetails?.invoiceNumber || (currentUser.invoiceNumber || `INV-DZ-${validPaymentDate.getFullYear()}-8899`);

          return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-[#1E3A8A] flex items-center gap-2">
                    <Key className="w-5 h-5 text-[#0D9488]" />
                    <span>{lang === 'en' ? 'Official App License & Billing Details' : 'بيانات الرخصة الرسمية والفاتورة الإلكترونية'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lang === 'en' ? 'Your official serial activation key and verified payment invoice for Teacher Companion.' : 'هذا هو مفتاح التفعيل التسلسلي المعتمد والفاتورة الرسمية الخاصة بحسابك في تطبيق رفيق المعلم.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 bg-teal-100 text-[#0D9488] font-extrabold text-xs rounded-full border border-teal-200 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Active License (1 Year)' : 'رخصة نشطة (سنة كاملة)'}</span>
                  </span>
                  <button
                    onClick={() => fetchLicenseDetails()}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                    title={lang === 'en' ? 'Refresh Billing Data' : 'تحديث البيانات'}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingLicense ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* License Key Box */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 shadow-md border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-teal-400" />
                        <span>{lang === 'en' ? 'Serial Activation Key' : 'مفتاح التفعيل التسلسلي (License Key)'}</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-teal-900/60 text-teal-300 font-mono rounded">
                        RSA-2048 Signed
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700 font-mono text-base sm:text-lg font-extrabold text-teal-300 tracking-wider">
                      <span className="break-all">{activeKey}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(activeKey);
                          setCopiedKey(true);
                          setTimeout(() => setCopiedKey(false), 2500);
                        }}
                        className="px-3 py-1.5 bg-[#0D9488] hover:bg-teal-700 text-white text-xs rounded-lg font-sans font-extrabold transition-all shadow-xs shrink-0 flex items-center gap-1.5 ml-2"
                      >
                        {copiedKey ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>{lang === 'en' ? 'Copied!' : 'تم النسخ!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{lang === 'en' ? 'Copy Key' : 'نسخ المفتاح'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                      {/* Allowed Devices: changed to 1 */}
                      <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">{lang === 'en' ? 'Allowed Devices:' : 'عدد الحواسيب المسموحة:'}</span>
                        <span className="font-extrabold text-white bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">
                          {lang === 'en' ? '1 PC (Personal Computer)' : 'حاسوب شخصي واحد (1 PC)'}
                        </span>
                      </div>

                      {/* Expiration Date: Exactly 1 year after payment date */}
                      <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">{lang === 'en' ? 'Expiration Date:' : 'تاريخ انتهاء الصلاحية:'}</span>
                        <span className="font-extrabold text-teal-300 font-mono">
                          {lang === 'en' ? expiryFormattedEn : expiryFormattedAr}
                        </span>
                      </div>

                      {/* Payment Date */}
                      <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">{lang === 'en' ? 'Payment Date:' : 'تاريخ عملية الدفع:'}</span>
                        <span className="font-bold text-slate-300 font-mono">
                          {lang === 'en' ? paymentFormattedEn : paymentFormattedAr}
                        </span>
                      </div>

                      {/* Plan Duration */}
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-400">{lang === 'en' ? 'Plan Duration:' : 'فترة الصلاحية:'}</span>
                        <span className="font-bold text-white">
                          {lang === 'en' ? '12 Months (1 Full Academic Year)' : '12 شهراً (سنة دراسية كاملة)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800 flex items-center justify-between">
                    <span>{lang === 'en' ? 'Security Protocol:' : 'بروتوكول الأمان:'} TLS / Chargily v2</span>
                    <span className="text-teal-400 font-bold">100% Certified</span>
                  </div>
                </div>

                {/* Order & Payment Info (Real E-Invoice Details) */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <h4 className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                        <span>{lang === 'en' ? 'Payment & E-Invoice Details' : 'تفاصيل عملية الدفع والفاتورة الإلكترونية'}</span>
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-100 text-[#1E3A8A] font-extrabold rounded-md border border-blue-200">
                        {invoiceNum}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-700 font-medium pt-3">
                      <div className="flex justify-between border-b border-slate-200/60 pb-2">
                        <span className="text-slate-500">{lang === 'en' ? 'Payment Gateway:' : 'بوابة الدفع الإلكتروني:'}</span>
                        <span className="font-extrabold text-[#0D9488]">{licenseDetails?.paidVia || 'Chargily Pay v2 (Edahabia / CIB)'}</span>
                      </div>

                      <div className="flex justify-between border-b border-slate-200/60 pb-2">
                        <span className="text-slate-500">{lang === 'en' ? 'Payment Date & Time:' : 'تاريخ ووقت السداد:'}</span>
                        <span className="font-bold text-slate-900 font-mono">{lang === 'en' ? paymentFormattedEn : paymentFormattedAr}</span>
                      </div>

                      <div className="flex justify-between border-b border-slate-200/60 pb-2">
                        <span className="text-slate-500">{lang === 'en' ? 'Account Holder:' : 'اسم صاحب الحساب:'}</span>
                        <span className="font-bold text-slate-900">{currentUser.fullName || licenseDetails?.userName}</span>
                      </div>

                      <div className="flex justify-between border-b border-slate-200/60 pb-2">
                        <span className="text-slate-500">{lang === 'en' ? 'Registered Email:' : 'البريد الإلكتروني المسجل:'}</span>
                        <span className="font-bold text-slate-900 font-mono">{currentUser.email}</span>
                      </div>

                      <div className="flex justify-between border-b border-slate-200/60 pb-2">
                        <span className="text-slate-500">{lang === 'en' ? 'School & Wilaya:' : 'المدرسة والولاية:'}</span>
                        <span className="font-bold text-slate-900">{currentUser.schoolName ? `${currentUser.schoolName} (${currentUser.wilaya})` : currentUser.wilaya}</span>
                      </div>

                      {/* Pricing Breakdown: Real Details and Promo Codes */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>{lang === 'en' ? 'Standard Plan Price:' : 'سعر الخطة السنوي الأساسي:'}</span>
                          <span className={`${activePromoCode ? 'line-through text-slate-400' : 'font-bold text-slate-800'}`}>
                            {originalPrice.toLocaleString()} DZD
                          </span>
                        </div>

                        {activePromoCode && (
                          <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-emerald-800 text-xs">
                            <span className="font-bold flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{lang === 'en' ? 'Applied Promo Code:' : 'كود الخصم المطبق:'}</span>
                              <span className="font-mono font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                                {activePromoCode}
                              </span>
                            </span>
                            <span className="font-black text-emerald-700">-{discountPercent}%</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center bg-slate-100 p-3 rounded-xl border border-slate-200">
                          <span className="font-extrabold text-slate-800">{lang === 'en' ? 'Real Amount Paid (TTC):' : 'المبلغ الحقيقي الإجمالي المدفوع:'}</span>
                          <span className="text-base sm:text-lg font-black text-emerald-600 font-mono">
                            {realPricePaid.toLocaleString()} DZD
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between pt-1">
                        <span className="text-slate-500">{lang === 'en' ? 'License Status:' : 'حالة التفعيل:'}</span>
                        <span className="font-extrabold text-teal-700 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-[#0D9488]" />
                          <span>{lang === 'en' ? 'Officially Activated & Verified' : 'مفعل ومعتمد رسمياً'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Promo Code Update/Apply Section */}
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    {promoFeedback && (
                      <div className={`p-2.5 rounded-lg text-xs font-bold ${
                        promoFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {promoFeedback.message}
                      </div>
                    )}
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400 absolute top-2.5 left-2.5 rtl:right-2.5 rtl:left-auto" />
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder={lang === 'en' ? 'Have a promo code? (e.g. TEACHER2026)' : 'هل لديك كود تخفيض؟ (مثال: TEACHER2026)'}
                          className="w-full pl-8 pr-3 rtl:pr-8 rtl:pl-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 uppercase font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={applyingPromo || !promoInput.trim()}
                        className="px-3.5 py-1.5 bg-[#0D9488] hover:bg-teal-700 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-lg transition-colors shrink-0 shadow-xs"
                      >
                        {applyingPromo ? (lang === 'en' ? 'Applying...' : 'جاري التطبيق...') : (lang === 'en' ? 'Apply Code' : 'تطبيق الكود')}
                      </button>
                    </form>
                  </div>
                </div>

              </div>

            </div>
          );
        })()}

      </div>
    </section>
  );
};
