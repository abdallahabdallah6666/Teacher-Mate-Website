import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Users,
  BookOpen,
  FolderArchive,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  PenTool,
  Volume2,
  Play,
  Pause,
  Download,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Layers,
  HardDrive,
  Lock,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  AlertTriangle,
  Award,
  FileText,
  Search,
  ExternalLink,
  Laptop,
  Maximize2,
  X
} from 'lucide-react';
import { Language } from './Navbar';

interface FeatureGridProps {
  lang: Language;
}

interface FeatureFilmCard {
  id: string;
  category: 'ai' | 'classroom' | 'syllabus' | 'library' | 'export' | 'privacy';
  titleEn: string;
  titleAr: string;
  tagEn: string;
  tagAr: string;
  descriptionEn: string;
  descriptionAr: string;
  badgeEn: string;
  badgeAr: string;
  icon: React.ElementType;
  previewType: 'fiche' | 'attendance' | 'seating' | 'excel' | 'syllabus' | 'audio' | 'flashcards' | 'privacy' | 'license' | 'sos';
  highlightsEn: string[];
  highlightsAr: string[];
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<FeatureFilmCard | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 10 Detailed Feature Film Cards (Continuously rolling film)
  const FILM_CARDS: FeatureFilmCard[] = [
    {
      id: 'ai-fiches',
      category: 'ai',
      titleEn: 'AI English Lesson Fiches (45 Min)',
      titleAr: 'مذكرات حصص الإنجليزية بالذكاء الاصطناعي',
      tagEn: 'Google Gemini 3.6 Flash',
      tagAr: 'محرك Gemini 3.6 Flash',
      descriptionEn: 'Generates official Algerian lesson cards with the 4 Ministry stages: Warm-up, Presentation, Practice, and Production, tailored to My Book of English.',
      descriptionAr: 'توليد فوري للمذكرات البيداغوجية لمادة اللغة الإنجليزية بمراحلها الرسمية الأربع (Warm-up, Presentation, Practice, Production) وفق كتاب الوزارة.',
      badgeEn: 'Lesson Planning',
      badgeAr: 'تحضير المذكرات',
      icon: Sparkles,
      previewType: 'fiche',
      highlightsEn: [
        '100% aligned with My Book of English (3AP, 4AP, 5AP)',
        'Structured timing: 5m, 15m, 15m, 10m',
        'Direct export to printable Word & PDF'
      ],
      highlightsAr: [
        'توافق تام مع كتاب My Book of English لـ 3AP و 4AP و 5AP',
        'توزيع زمني مضبوط: 5د، 15د، 15د، 10د',
        'تصدير فوري لملفات Word و PDF قابلة للطباعة'
      ]
    },
    {
      id: 'classroom-attendance',
      category: 'classroom',
      titleEn: 'Daily Roll Call & Absence Register',
      titleAr: 'سجل الغياب ومتابعة حضور الفوج',
      tagEn: 'One-Click Roll Call',
      tagAr: 'مناداة سريعة بنقرة واحدة',
      descriptionEn: 'Record student attendance in seconds. Track present, absent, and late pupils with automatic monthly attendance percentage calculation.',
      descriptionAr: 'تسجيل الحضور والغياب اليومي في ثوانٍ معدودة مع احتساب نسب الحضور الشهرية والفصلية تلقائياً لكل فوج.',
      badgeEn: 'Classroom Control',
      badgeAr: 'إدارة القسم',
      icon: Users,
      previewType: 'attendance',
      highlightsEn: [
        'Multi-class support (e.g. 4AP-1, 4AP-2, 3AP-3)',
        'Color-coded badges: Present, Absent, Late',
        'Automatic calculation of official attendance rates'
      ],
      highlightsAr: [
        'دعم تعدد الأفواج (4AP-1، 4AP-2، 3AP-3)',
        'ترميز لوني واضح: حاضر، غائب، متأخر',
        'احتساب تلقائي لمعدل الحضور الرسمي للقسم'
      ]
    },
    {
      id: 'classroom-seating',
      category: 'classroom',
      titleEn: 'Dual-Desk Classroom Seating Plan',
      titleAr: 'مخطط المقاعد الثنائية بالقسم',
      tagEn: 'Inspection Ready',
      tagAr: 'جاهز لملف التفتيش',
      descriptionEn: 'Interactive seating map arranged for Algerian primary double-desks. Drag or assign pupils, arrange rows, and print your inspection seating layout.',
      descriptionAr: 'مخطط جلوس تفاعلي مصمم وفق الطاولات الثنائية للمدارس الجزائرية، يسهل توزيع التلاميذ وطباعة المخطط لملف التفتيش.',
      badgeEn: 'Seating Layout',
      badgeAr: 'مخطط الجلوس',
      icon: Layers,
      previewType: 'seating',
      highlightsEn: [
        'Double-pupil desk arrangement (Rows 1 to 5)',
        'Front-of-class teacher podium reference',
        'One-click printout for inspection files'
      ],
      highlightsAr: [
        'توزيع الطاولات الثنائية (الصفوف من 1 إلى 5)',
        'تحديد مكان منصة الأستاذ والسبورة بوضوح',
        'طباعة فورية جاهزة لملف التفتيش البيداغوجي'
      ]
    },
    {
      id: 'ministry-excel',
      category: 'export',
      titleEn: 'Ministry Excel Marks Export (.xlsx)',
      titleAr: 'تصدير النقاط لملف الرقمنة الوزاري',
      tagEn: '100% Platform Compatible',
      tagAr: 'متوافق 100% مع منصة الرقمنة',
      descriptionEn: 'Enter marks and continuous assessment once, then export directly to the Ministry’s official spreadsheet format with automatic field translation.',
      descriptionAr: 'رصد نقاط التقويم المستمر والاختبارات وتصديرها مباشرة بتنسيق ملف الإكسل المعتمد لوزارة التربية الوطنية لرفعه فوراً على منصة الرقمنة.',
      badgeEn: 'Marks & Reports',
      badgeAr: 'التقويم والنقاط',
      icon: FileSpreadsheet,
      previewType: 'excel',
      highlightsEn: [
        'Continuous evaluation columns: Oral, Phonics, Test',
        'Automatic average computation & pedagogical remarks',
        'Direct download in official .xlsx format'
      ],
      highlightsAr: [
        'معايير التقويم المستمر: التفاعل الشفهي، الصوتيات، الاختبار',
        'حساب تلقائي للمعدلات وتوليد الملاحظات البيداغوجية',
        'تنزيل مباشر بملف .xlsx جاهز للرفع'
      ]
    },
    {
      id: 'syllabus-tree',
      category: 'syllabus',
      titleEn: 'Syllabus & Lesson Hierarchy (3AP, 4AP, 5AP)',
      titleAr: 'تنظيم المنهاج وتدرج الحصص الرسمي',
      tagEn: 'My Book of English',
      tagAr: 'مطابق للكتب المدرسية',
      descriptionEn: 'Explore the complete Algerian primary English curriculum: Grades, Sequences, and Individual Sessions, with each lesson linked to its audio and cards.',
      descriptionAr: 'هيكلة متكاملة لمنهاج الإنجليزية بالابتدائية الجزائرية: تسلسل المقاطع والحصص وربط كل حصة بمذكرتها الرسمية وتسجيلها الصوتي.',
      badgeEn: 'Curriculum Tree',
      badgeAr: 'شجرة المنهاج',
      icon: BookOpen,
      previewType: 'syllabus',
      highlightsEn: [
        'Structured sequences for 3AP, 4AP & 5AP',
        'Textbook page numbers & competence codes',
        'Instant link to attached audio chants & fiches'
      ],
      highlightsAr: [
        'مقاطع منظمة لسنوات 3AP و 4AP و 5AP',
        'أرقام صفحات الكتاب ورموز الكفاءات الختامية',
        'ربط مباشر بالتسجيلات الصوتية والبطاقات الخاصة بكل حصة'
      ]
    },
    {
      id: 'audio-suite',
      category: 'library',
      titleEn: 'Textbook Audio Listening Player',
      titleAr: 'مشغل التسجيلات الصوتية للكتاب المدرسي',
      tagEn: 'Adjustable 0.8x Speed',
      tagAr: 'تحكم بسرعة الصوت 0.8x',
      descriptionEn: 'High-quality listening tracks, chants, and dialogues from My Book of English. Adjust speech speed to help young learners grasp pronunciation.',
      descriptionAr: 'تسجيلات استماع وأناشيد الكتاب المدرسي بنقاء استوديو عالٍ، مع إمكانية إبطاء سرعة الإلقاء (0.8x) لمساعدة التلاميذ على استيعاب مخارج الحروف.',
      badgeEn: 'Audio Library',
      badgeAr: 'مكتبة الصوتيات',
      icon: Volume2,
      previewType: 'audio',
      highlightsEn: [
        'Official listening dialogues & alphabet chants',
        'Slow playback mode (0.8x) for beginners',
        'Ready for classroom speakers or Data Show'
      ],
      highlightsAr: [
        'أناشيد وحوارات الاستماع الرسمية لجميع الوحدات',
        'وضع الإلقاء البطيء (0.8x) المخصص للمبتدئين',
        'جاهز للبث المباشر عبر مكبرات الصوت أو الداتاشو'
      ]
    },
    {
      id: 'visual-flashcards',
      category: 'library',
      titleEn: '1,000+ Illustrated Vocabulary Flashcards',
      titleAr: 'أكثر من 1000 بطاقة مصورة للطباعة',
      tagEn: 'With Phonetic Guide',
      tagAr: 'بالنسخ الصوتي والترجمة',
      descriptionEn: 'Vibrant flashcards covering family, school, food, jobs, animals, and phonics letters. Print full A4 cards or 4-per-page student handouts.',
      descriptionAr: 'بطاقات ملونة عالية الدقة تشمل جميع مفردات المنهاج (العائلة، المدرسة، المهن، الخضر، الحيوانات) جاهزة للطباعة كبطاقات كبرى أو 4 في صفحة.',
      badgeEn: 'Visual Aids',
      badgeAr: 'الوسائل البصرية',
      icon: FolderArchive,
      previewType: 'flashcards',
      highlightsEn: [
        'Phonetic transcriptions (e.g. /skuːl bæɡ/)',
        'Dual-sided cards (Word + Illustration + Arabic)',
        'Print-ready high-resolution vector assets'
      ],
      highlightsAr: [
        'نسخ صوتي دقيق للنطق مع الترجمة بالعربية',
        'بطاقات مزدوجة (صورة + كلمة + ترجمة)',
        'تصدير عالي الدقة للطباعة أو العرض'
      ]
    },
    {
      id: 'local-privacy',
      category: 'privacy',
      titleEn: '100% Local Data Privacy & Device Security',
      titleAr: 'حفظ محلي آمن 100% لمعطيات القسم',
      tagEn: 'Zero Cloud Pupil Leaks',
      tagAr: 'بيانات التلاميذ لا تغادر حاسوبك',
      descriptionEn: 'Student names, attendance, and marks are stored locally on your PC in an encrypted database. Only anonymized lesson prompts are sent to AI.',
      descriptionAr: 'جميع أسماء التلاميذ وسجلات النقاط والغياب تُحفظ محلياً على قرص حاسوبك فقط ولا تُرفع لأي خوادم خارجية حفاظاً على خصوصية التلاميذ.',
      badgeEn: 'Data Privacy',
      badgeAr: 'الخصوصية المحلية',
      icon: HardDrive,
      previewType: 'privacy',
      highlightsEn: [
        'Local SQLite database on teacher’s computer',
        'Transparent AI boundary (Prompts contain only topics)',
        'Compliant with educational privacy guidelines'
      ],
      highlightsAr: [
        'قاعدة بيانات SQLite محلية مشفرة على حاسوب الأستاذ',
        'حدود آمنة للذكاء الاصطناعي (إرسال موضوع الدرس فقط)',
        'مطابق لمتطلبات حماية خصوصية المعطيات المدرسية'
      ]
    },
    {
      id: 'pc-license',
      category: 'privacy',
      titleEn: 'Verified 1-PC Personal License (365 Days)',
      titleAr: 'ترخيص معتمد لحاسوب شخصي (سنة كاملة)',
      tagEn: 'RSA-2048 Serial Key',
      tagAr: 'مفتاح رقمي مؤمن',
      descriptionEn: 'Straightforward activation key for 1 personal computer. Valid for 365 days from payment with continuous maintenance and free syllabus updates.',
      descriptionAr: 'مفتاح تفعيل تسلسلي لجهاز حاسوب واحد صالح لمدة سنة دراسية كاملة (365 يوماً) مع شمول جميع التحديثات البيداغوجية والتحسينات.',
      badgeEn: 'Personal License',
      badgeAr: 'الترخيص السنوي',
      icon: Lock,
      previewType: 'license',
      highlightsEn: [
        'Dedicated 1-PC verified software activation',
        'Easy device transfer if you change your PC',
        'Instant digital serial delivery via Chargily Pay'
      ],
      highlightsAr: [
        'تفعيل معتمد ومخصص لحاسوب شخصي واحد',
        'إمكانية نقل الرخصة بسهولة عند ترقية الحاسوب',
        'استلام فوري للمفتاح والفاتورة عبر البطاقة الذهبية'
      ]
    },
    {
      id: 'sos-support',
      category: 'privacy',
      titleEn: 'Guided Onboarding & 24h SOS Assistance',
      titleAr: 'مرافقة كاملة وخدمة طوارئ SOS خلال 24 ساعة',
      tagEn: 'Priority Teacher Support',
      tagAr: 'دعم ذو أولوية للأستاذ',
      descriptionEn: 'Step-by-step guidance from day one, tutorial videos, and a dedicated 24-hour emergency SOS channel to assist you before inspections.',
      descriptionAr: 'إرشاد وتدريب تفصيلي منذ أول يوم، شروحات فيديو مدمجة، وقناة طوارئ SOS مخصصة للإجابة على تساؤلاتك قبل زيارات التفتيش.',
      badgeEn: 'Teacher Care',
      badgeAr: 'المرافقة والدعم',
      icon: AlertTriangle,
      previewType: 'sos',
      highlightsEn: [
        'Step-by-step visual onboarding guide',
        'Integrated video walkthroughs for all tools',
        'Priority SOS ticketing resolved in under 24 hours'
      ],
      highlightsAr: [
        'دليل مرئي خطوة بخطوة لبداية استخدام سلسة',
        'شروحات فيديو تفصيلية مدمجة لكل أداة',
        'قناة طوارئ SOS لمعالجة الإشكالات خلال أقل من 24 ساعة'
      ]
    }
  ];

  // All 10 features duplicated for smooth seamless rolling film effect
  const rollingCards = [...FILM_CARDS, ...FILM_CARDS];

  // Manual scroll controls
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 380;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="features" className="py-20 bg-[#F8FAFC] text-slate-900 border-b border-slate-200 relative overflow-hidden">
      
      {/* Subtle Background Radial & Glow (Light Educational Palette matching Hero & Pricing) */}
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-100/50 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 shadow-2xs text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
            <img
              src="/assets/aistudio/1000034518_bfa9ca9b.png"
              alt="Teacher Mate"
              className="w-4 h-4 rounded object-cover"
            />
            <span>{isAr ? 'شريط استعراض مزايا رفيق المعلم' : 'DYNAMIC FILM · TEACHER MATE SUITE'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1E3A8A] leading-tight">
            {isAr
              ? 'كل ما يحتاجه قسمك في شريط تفاعلي متدحرج'
              : 'Everything Your Classroom Needs. Rolling in Motion.'}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {isAr
              ? 'استكشف مزايا Teacher Mate المتدحرجة تلقائياً: تحضير المذكرات بـ Gemini 3.6 Flash، تتبع الحضور والمقاعد، كشوف النقاط المتوافقة مع الرقمنة الوزارية، ومكتبة الصوتيات.'
              : 'Watch Teacher Mate’s features glide across your screen: AI lesson cards with Gemini 3.6 Flash, classroom roll call and seating plans, Ministry-compliant marks export, and audio chants.'}
          </p>

          {/* Discreet Rolling Status Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 pt-1">
            <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse"></span>
            <span>
              {isAr
                ? 'شريط تفاعلي متدحرج · مرر مؤشر الفأرة للتوقف المؤقت أو اضغط على أي بطاقة للمعاينة'
                : 'Continuous Rolling Film · Hover over any card to pause or click to inspect'}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* THE DYNAMIC FILM: CONTINUOUS ROLLING CAROUSEL OF CARDS */}
        {/* ========================================================================= */}
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
          
          {/* Side fading gradient masks (Clean light fade matching page bg) */}
          <div className="absolute top-0 bottom-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#F8FAFC] to-transparent z-20 pointer-events-none"></div>
          <div className="absolute top-0 bottom-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-[#F8FAFC] to-transparent z-20 pointer-events-none"></div>

          {/* Film Track (Animated keyframes rolling from one side to another) */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-none py-4 px-4 sm:px-8 cursor-grab active:cursor-grabbing"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className={`flex items-stretch gap-6 ${isPaused ? '' : 'animate-film'}`}
              style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
            >
              {rollingCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div
                    key={`${card.id}-${idx}`}
                    onClick={() => setSelectedCard(card)}
                    className="w-[340px] sm:w-[380px] shrink-0 bg-white rounded-2xl border border-slate-200/90 hover:border-[#1E3A8A] hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group text-start relative shadow-sm"
                  >
                    {/* Film Frame Header */}
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#0D9488]"></span>
                        <span className="font-bold text-[#1E3A8A]">{isAr ? card.badgeAr : card.badgeEn}</span>
                      </div>
                      <span className="text-[10px] text-[#0D9488] font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {isAr ? card.tagAr : card.tagEn}
                      </span>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5 space-y-4">
                      
                      {/* Card Header & Icon */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E3A8A] shrink-0 group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors shadow-2xs">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-[#1E3A8A] group-hover:text-[#0D9488] transition-colors leading-snug">
                            {isAr ? card.titleAr : card.titleEn}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed font-normal">
                            {isAr ? card.descriptionAr : card.descriptionEn}
                          </p>
                        </div>
                      </div>

                      {/* AUTHENTIC DESKTOP SOFTWARE MINI-PREVIEW (Clean Light Interface) */}
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs font-mono select-none overflow-hidden space-y-2">
                        
                        {/* 1. Fiche Preview */}
                        {card.previewType === 'fiche' && (
                          <div className="space-y-1.5 text-[11px]">
                            <div className="flex justify-between items-center text-[#0D9488] border-b border-slate-200 pb-1 font-bold">
                              <span>PRIMARY ENGLISH · 4AP</span>
                              <span>45 MINS</span>
                            </div>
                            <div className="text-[#1E3A8A] font-sans font-bold">Seq 1: Family & Occupations</div>
                            <div className="space-y-1 text-[10px] text-slate-600 font-sans">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[#0D9488] font-bold">Warm-up (5m):</span>
                                <span className="truncate">Chant & Greetings dialogue</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[#0D9488] font-bold">Presentation (15m):</span>
                                <span className="truncate">"He is a doctor" pattern</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[#0D9488] font-bold">Practice (15m):</span>
                                <span className="truncate">Pair-work drill & textbook p.14</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. Attendance Preview */}
                        {card.previewType === 'attendance' && (
                          <div className="space-y-1.5 text-[11px]">
                            <div className="flex justify-between items-center text-slate-500 border-b border-slate-200 pb-1 font-bold">
                              <span>CLASS: 4AP-G1</span>
                              <span className="text-emerald-700">30/32 PRESENT (94%)</span>
                            </div>
                            <div className="space-y-1 font-sans text-[10px]">
                              <div className="flex justify-between items-center p-1 bg-white rounded border border-slate-100">
                                <span className="text-slate-800 font-medium">Amina Belkacem</span>
                                <span className="text-emerald-700 font-bold">● Present</span>
                              </div>
                              <div className="flex justify-between items-center p-1 bg-white rounded border border-slate-100">
                                <span className="text-slate-800 font-medium">Yacine Mansouri</span>
                                <span className="text-emerald-700 font-bold">● Present</span>
                              </div>
                              <div className="flex justify-between items-center p-1 bg-white rounded border border-slate-100">
                                <span className="text-slate-800 font-medium">Amir Kadri</span>
                                <span className="text-rose-600 font-bold">● Absent</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. Seating Preview */}
                        {card.previewType === 'seating' && (
                          <div className="space-y-1.5 text-[11px]">
                            <div className="text-center p-1 bg-[#1E3A8A] text-white rounded font-sans font-bold text-[10px] shadow-2xs">
                              Teacher’s Podium & Blackboard
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-[10px] font-sans">
                              <div className="p-1 bg-white border border-slate-200 rounded text-center">
                                <span className="text-slate-400 block text-[8px]">Desk 1</span>
                                <span className="text-slate-800 font-semibold truncate block">Amina & Yacine</span>
                              </div>
                              <div className="p-1 bg-white border border-slate-200 rounded text-center">
                                <span className="text-slate-400 block text-[8px]">Desk 2</span>
                                <span className="text-slate-800 font-semibold truncate block">Meriem & Amir</span>
                              </div>
                              <div className="p-1 bg-white border border-slate-200 rounded text-center">
                                <span className="text-slate-400 block text-[8px]">Desk 3</span>
                                <span className="text-slate-800 font-semibold truncate block">Khadidja & Rayan</span>
                              </div>
                              <div className="p-1 bg-white border border-slate-200 rounded text-center">
                                <span className="text-slate-400 block text-[8px]">Desk 4</span>
                                <span className="text-slate-800 font-semibold truncate block">Lina & Zakaria</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. Excel Marks Preview */}
                        {card.previewType === 'excel' && (
                          <div className="space-y-1 text-[10px]">
                            <div className="flex justify-between items-center text-emerald-700 border-b border-slate-200 pb-0.5 font-bold">
                              <span>Relevé_Notes_4AP.xlsx</span>
                              <span>OFFICIAL .XLSX</span>
                            </div>
                            <table className="w-full text-start">
                              <thead className="text-slate-500 text-[9px]">
                                <tr>
                                  <th>Pupil</th>
                                  <th className="text-center">Oral</th>
                                  <th className="text-center">Exam</th>
                                  <th className="text-end text-emerald-700">Avg/10</th>
                                </tr>
                              </thead>
                              <tbody className="text-slate-700">
                                <tr>
                                  <td>Amina B.</td>
                                  <td className="text-center">4.75</td>
                                  <td className="text-center">9.00</td>
                                  <td className="text-end text-emerald-700 font-bold">9.12</td>
                                </tr>
                                <tr>
                                  <td>Yacine M.</td>
                                  <td className="text-center">4.25</td>
                                  <td className="text-center">8.50</td>
                                  <td className="text-end text-emerald-700 font-bold">8.37</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* 5. Syllabus Preview */}
                        {card.previewType === 'syllabus' && (
                          <div className="space-y-1 text-[10px] font-sans">
                            <div className="text-[#1E3A8A] font-bold">4AP · Sequence 1: Occupations</div>
                            <div className="text-slate-600">Textbook Reference: My Book of English (p. 14-17)</div>
                            <div className="flex items-center gap-2 text-slate-500 text-[9px]">
                              <span>● Oral Interaction A1</span>
                              <span>● Phonics /tʃ/ vs /ʃ/</span>
                              <span>● Audio 09</span>
                            </div>
                          </div>
                        )}

                        {/* 6. Audio Preview */}
                        {card.previewType === 'audio' && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] text-amber-700 font-bold">
                              <span>Track 08: Alphabet Song</span>
                              <span>0.8x SPEED</span>
                            </div>
                            <div className="flex items-center gap-1 h-6 px-1 bg-amber-50/80 rounded border border-amber-200/60">
                              {[30, 80, 50, 90, 60, 40, 95, 70, 45, 85, 60, 35].map((h, i) => (
                                <span key={i} className="w-1 bg-amber-500 rounded-full" style={{ height: `${h}%` }}></span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 7. Flashcards Preview */}
                        {card.previewType === 'flashcards' && (
                          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-sans">
                            <div className="p-1 bg-white rounded border border-slate-200 shadow-2xs">
                              <span className="text-base block">🎒</span>
                              <span className="text-slate-900 font-bold block text-[9px]">School Bag</span>
                            </div>
                            <div className="p-1 bg-white rounded border border-slate-200 shadow-2xs">
                              <span className="text-base block">📖</span>
                              <span className="text-slate-900 font-bold block text-[9px]">Book</span>
                            </div>
                            <div className="p-1 bg-white rounded border border-slate-200 shadow-2xs">
                              <span className="text-base block">✏️</span>
                              <span className="text-slate-900 font-bold block text-[9px]">Pencil</span>
                            </div>
                          </div>
                        )}

                        {/* 8. Privacy Preview */}
                        {card.previewType === 'privacy' && (
                          <div className="space-y-1 text-[10px] font-sans">
                            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>100% Encrypted Local SQLite</span>
                            </div>
                            <p className="text-slate-500 text-[9px]">Student names and grades stay strictly on this device.</p>
                          </div>
                        )}

                        {/* 9. License Preview */}
                        {card.previewType === 'license' && (
                          <div className="space-y-1 text-[10px]">
                            <div className="text-[#0D9488] font-bold font-mono">TC-ALG-PRO-8899-X2K1</div>
                            <div className="text-slate-500 text-[9px]">Single-Device RSA-2048 Signed · 365 Days</div>
                          </div>
                        )}

                        {/* 10. SOS Preview */}
                        {card.previewType === 'sos' && (
                          <div className="space-y-1 text-[10px] font-sans">
                            <div className="flex items-center gap-1.5 text-red-600 font-bold">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Priority SOS Ticket &lt; 24h</span>
                            </div>
                            <p className="text-slate-500 text-[9px]">Urgent inspection inquiries handled around the clock.</p>
                          </div>
                        )}

                      </div>

                      {/* Bullet Highlights */}
                      <ul className="space-y-1 text-xs text-slate-600 font-sans">
                        {(isAr ? card.highlightsAr : card.highlightsEn).slice(0, 2).map((item, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-1.5 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488] shrink-0 mt-0.5" />
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>

                    </div>

                    {/* Card Footer Click to Inspect Action */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-[#1E3A8A] transition-colors">
                      <span className="font-semibold flex items-center gap-1">
                        <Maximize2 className="w-3 h-3 text-[#0D9488]" />
                        <span>{isAr ? 'اضغط لتفاصيل الميزة' : 'Click to inspect card'}</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 text-[#0D9488] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* SPOTLIGHT MODAL (When clicking any rolling card) */}
        {selectedCard && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 text-slate-900 shadow-2xl space-y-5 relative my-8 text-start">
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 pr-8 rtl:pr-0 rtl:pl-8">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E3A8A] shadow-xs shrink-0">
                  <selectedCard.icon className="w-6 h-6 text-[#0D9488]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-50 text-[#0D9488] border border-teal-200 font-bold uppercase">
                      {isAr ? selectedCard.tagAr : selectedCard.tagEn}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 font-mono">{isAr ? selectedCard.badgeAr : selectedCard.badgeEn}</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[#1E3A8A] mt-1">
                    {isAr ? selectedCard.titleAr : selectedCard.titleEn}
                  </h3>
                </div>
              </div>

              {/* Modal Body */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isAr ? selectedCard.descriptionAr : selectedCard.descriptionEn}
              </p>

              {/* Detailed Highlights */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider block">
                  {isAr ? 'الفوائد البيداغوجية والتقنية للأستاذ' : 'Core Practical Advantages'}
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {(isAr ? selectedCard.highlightsAr : selectedCard.highlightsEn).map((h, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Modal Footer Close Action */}
              <div className="pt-2">
                <button
                  onClick={() => setSelectedCard(null)}
                  className="w-full py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isAr ? 'إغلاق المعاينة' : 'Close Preview'}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
