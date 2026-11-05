import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export interface SmtpConfig {
  service: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

const SETTINGS_FILE = path.join(process.cwd(), 'src/db/smtp-settings.json');

export const DEFAULT_SMTP_CONFIG: SmtpConfig = {
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  user: 'teachermatehelp@gmail.com',
  pass: 'hicl yeie vooq jwxn',
  fromName: 'رفيق المعلم الجزائري - Teacher Mate DZ',
  fromEmail: 'teachermatehelp@gmail.com'
};

export function loadSmtpSettings(): SmtpConfig {
  let config: SmtpConfig = { ...DEFAULT_SMTP_CONFIG };

  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      config = { ...config, ...data };
    } catch (e) {
      console.warn('[SMTP] Could not parse smtp-settings.json:', e);
    }
  }

  // Environment variables take precedence if present
  if (process.env.SMTP_USER) config.user = process.env.SMTP_USER;
  if (process.env.SMTP_PASS) config.pass = process.env.SMTP_PASS;
  if (process.env.GMAIL_USER) config.user = process.env.GMAIL_USER;
  if (process.env.GMAIL_APP_PASS) config.pass = process.env.GMAIL_APP_PASS;
  if (process.env.SMTP_HOST) config.host = process.env.SMTP_HOST;
  if (process.env.SMTP_PORT) config.port = Number(process.env.SMTP_PORT);
  if (process.env.SMTP_FROM_NAME) config.fromName = process.env.SMTP_FROM_NAME;
  if (process.env.SMTP_FROM_EMAIL) config.fromEmail = process.env.SMTP_FROM_EMAIL;

  return config;
}

export function saveSmtpSettings(newSettings: Partial<SmtpConfig>): SmtpConfig {
  const current = loadSmtpSettings();
  const updated: SmtpConfig = {
    ...current,
    ...newSettings,
    port: Number(newSettings.port) || 587,
    secure: Boolean(newSettings.secure)
  };

  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    console.log('[SMTP] Settings updated successfully.');
  } catch (err) {
    console.error('[SMTP] Failed to save settings to disk:', err);
  }

  return updated;
}

export function createSmtpTransporter(config: SmtpConfig) {
  if (config.service === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.user.trim(),
        pass: config.pass.trim().replace(/\s+/g, '') // remove spaces from Gmail app passwords
      }
    });
  }

  return nodemailer.createTransport({
    host: config.host.trim(),
    port: config.port || 587,
    secure: config.secure || config.port === 465,
    auth: {
      user: config.user.trim(),
      pass: config.pass.trim()
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

function escapeHtml(val: string): string {
  return String(val).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c] as string);
}

export interface LicenseEmailParams {
  email: string;
  fullName: string;
  licenseKey: string;
  planName?: string;
  password?: string;
  schoolName?: string;
  wilaya?: string;
  expiresAt?: string;
}

export function buildLicenseEmailContent(params: LicenseEmailParams, fromName: string) {
  const safeName = escapeHtml(params.fullName || 'أستاذنا الفاضل');
  const safeEmail = escapeHtml(params.email);
  const safeKey = escapeHtml(params.licenseKey);
  const safePlan = escapeHtml(params.planName || 'Personal Lifetime License');
  const safeSchool = params.schoolName ? escapeHtml(params.schoolName) : '';
  const safeWilaya = params.wilaya ? escapeHtml(params.wilaya) : '';
  const safePass = params.password ? escapeHtml(params.password) : '';

  const subject = `🎓 مفتاح تفعيل رفيق المعلم الجزائري: ${params.licenseKey}`;

  const text = `مرحباً أستاذ(ة) ${params.fullName}،\n\n` +
    `يسعدنا إعلامك بأنه تم إنشاء حسابك في "رفيق المعلم الجزائري" بنجاح.\n\n` +
    `مفتاح الترخيص الخاص بك (License Key):\n${params.licenseKey}\n\n` +
    `بيانات الحساب:\n` +
    `- البريد الإلكتروني: ${params.email}\n` +
    (params.password ? `- كلمة المرور: ${params.password}\n` : '') +
    `- الخطة: ${params.planName || 'Personal Lifetime License'}\n` +
    (params.schoolName ? `- المؤسسة التعليمية: ${params.schoolName}\n` : '') +
    (params.wilaya ? `- الولاية: ${params.wilaya}\n` : '') +
    `\nطريقة التفعيل السريعة:\n` +
    `1. افتح تطبيق أو موقع "رفيق المعلم الجزائري".\n` +
    `2. انتقل إلى خانة "تفعيل الترخيص" (Activate License).\n` +
    `3. الصق مفتاح الترخيص واضغط على "تحقق وتفعيل".\n\n` +
    `لأي مساعدة تواصل معنا عبر البريد: abdallahbourrich66@gmail.com\n\n` +
    `مع أطيب التحيات البيداغوجية،\nرفيق المعلم الجزائري`;

  const html = `
  <div dir="rtl" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 26px 22px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.3px;">🎓 رفيق المعلم الجزائري (Teacher Mate DZ)</h1>
      <p style="margin: 6px 0 0; font-size: 13px; color: #ccfbf1; font-weight: 500;">مفتاح الرخصة الرسمية وبيانات التفعيل البيداغوجي المباشر</p>
    </div>
    
    <div style="padding: 26px 22px; color: #1e293b; line-height: 1.6;">
      <p style="font-size: 16px; margin-top: 0; color: #0f172a;">
        مرحباً بك أستاذ(ة) <strong>${safeName}</strong>،
      </p>
      <p style="color: #475569; font-size: 13px;">
        يسعدنا إعلامك بأنه تم إنشاء وتفعيل حسابك الرسمي في <strong>رفيق المعلم الجزائري</strong>. إليك مفتاح التفعيل الرسمي الخاص بك:
      </p>
      
      <div style="background: #f0fdfa; border: 2px dashed #0d9488; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
        <div style="font-size: 12px; color: #0f766e; margin-bottom: 8px; font-weight: 800; text-transform: uppercase;">
          مفتاح الترخيص الخاص بك (License Key):
        </div>
        <div style="font-family: monospace; font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #0d9488; direction: ltr; user-select: all; background: #ffffff; padding: 12px 16px; border-radius: 8px; border: 1px solid #99f6e4; display: inline-block;">
          ${safeKey}
        </div>
        <div style="font-size: 12px; color: #64748b; margin-top: 10px;">
          الخطة: <strong>${safePlan}</strong> ${params.expiresAt ? `(الصلاحية حتى: ${escapeHtml(params.expiresAt)})` : ''}
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 13px; color: #334155;">
        <div style="margin-bottom: 6px;"><strong>البريد الإلكتروني المعتمد:</strong> <span style="direction: ltr; display: inline-block; font-weight: 700; color: #0f172a;">${safeEmail}</span></div>
        ${safePass ? `<div style="margin-bottom: 6px;"><strong>كلمة المرور المؤقتة:</strong> <code style="background:#e2e8f0;padding:2px 8px;border-radius:4px;font-family:monospace;font-size:13px;color:#0f172a;font-weight:700;">${safePass}</code></div>` : ''}
        ${safeSchool ? `<div style="margin-bottom: 6px;"><strong>المؤسسة التربوية:</strong> <span>${safeSchool}</span></div>` : ''}
        ${safeWilaya ? `<div><strong>الولاية:</strong> <span>${safeWilaya}</span></div>` : ''}
      </div>

      <div style="background: #ecfdf5; border-right: 4px solid #0d9488; padding: 14px 18px; border-radius: 6px; margin-bottom: 22px;">
        <h4 style="margin: 0 0 6px; color: #0f766e; font-size: 13px; font-weight: 800;">طريقة التفعيل السريعة (في 3 خطوات):</h4>
        <ol style="margin: 0; padding-right: 20px; font-size: 12px; color: #115e59; line-height: 1.7;">
          <li>افتح تطبيق أو موقع <strong>رفيق المعلم الجزائري</strong>.</li>
          <li>انتقل إلى قسم <strong>تفعيل الترخيص (Activate License)</strong>.</li>
          <li>الصق مفتاح الترخيص الخاص بك واضغط على <strong>تحقق وتفعيل</strong> لبدء استخدام كافة المذكرات والمساعد البيداغوجي فوراً.</li>
        </ol>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 22px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
        لأي مساعدة بيداغوجية أو استفسار، يسعدنا تواصلك معنا مباشرة عبر: <br/>
        <a href="mailto:abdallahbourrich66@gmail.com" style="color: #0d9488; font-weight: 700; text-decoration: none;">abdallahbourrich66@gmail.com</a>
      </p>
      <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">
        مع خالص التحيات البيداغوجية،<br/>
        <strong>${escapeHtml(fromName)}</strong>
      </p>
    </div>
    
    <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
      © ${new Date().getFullYear()} Teacher Mate DZ. جميع الحقوق محفوظة.
    </div>
  </div>`;

  return { subject, text, html };
}

export async function sendLicenseEmailViaNodemailer(params: LicenseEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  notConfigured?: boolean;
  emailText: string;
  emailHtml: string;
  recipient: string;
}> {
  const config = loadSmtpSettings();
  const { subject, text, html } = buildLicenseEmailContent(params, config.fromName);

  if (!config.pass || !config.pass.trim()) {
    console.warn(`[SMTP] SMTP Password is not yet set. Email to ${params.email} cannot be sent automatically. Manual copy prepared.`);
    return {
      success: false,
      notConfigured: true,
      error: 'لم يتم حفظ كلمة مرور بريد الإرسال (Gmail App Password) في إعدادات SMTP بعد. تم تجهيز نص الرسالة للنسخ اليدوي.',
      emailText: text,
      emailHtml: html,
      recipient: params.email
    };
  }

  try {
    const transporter = createSmtpTransporter(config);
    const fromAddress = `"${config.fromName}" <${config.fromEmail || config.user}>`;

    console.log(`[SMTP] Sending license email directly to ${params.email} from ${fromAddress}...`);
    const info = await transporter.sendMail({
      from: fromAddress,
      to: params.email,
      replyTo: config.fromEmail || config.user,
      subject,
      text,
      html
    });

    console.log(`[SMTP] Email successfully delivered to ${params.email}! Message ID: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
      emailText: text,
      emailHtml: html,
      recipient: params.email
    };
  } catch (err: any) {
    console.error(`[SMTP] Delivery error to ${params.email}:`, err?.message || err);
    return {
      success: false,
      error: err?.message || 'SMTP delivery failed',
      emailText: text,
      emailHtml: html,
      recipient: params.email
    };
  }
}

export async function sendResetCodeEmailViaNodemailer(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  const config = loadSmtpSettings();
  const subject = `رمز إعادة تعيين كلمة المرور - رفيق المعلم الجزائري`;
  const text = `مرحباً أستاذنا الفاضل،\n\nرمز إعادة تعيين كلمة المرور الخاص بك هو: ${code}\n\nيرجى استخدامه في التطبيق لإكمال عملية تغيير كلمة المرور.`;
  const html = `
    <div dir="rtl" style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <h2>إعادة تعيين كلمة المرور</h2>
      <p>مرحباً أستاذنا الفاضل،</p>
      <p>رمز إعادة تعيين كلمة المرور الخاص بك هو:</p>
      <div style="font-size: 24px; font-weight: bold; color: #0d9488; text-align: center; padding: 15px; border: 2px dashed #0d9488; margin: 20px 0;">
        ${code}
      </div>
      <p>يرجى استخدامه في التطبيق لإكمال عملية تغيير كلمة المرور.</p>
    </div>
  `;

  if (!config.pass || !config.pass.trim()) {
    return { success: false, error: 'SMTP not configured' };
  }

  try {
    const transporter = createSmtpTransporter(config);
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail || config.user}>`,
      to: email,
      subject,
      text,
      html
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function sendInquiryReplyEmailViaNodemailer(params: {
  userEmail: string;
  userName: string;
  subject: string;
  originalMessage: string;
  adminReply: string;
  isSOS?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const config = loadSmtpSettings();
  const subject = `${params.isSOS ? '🚨 [رد عاجل SOS] ' : 'رد الدعم الفني: '}${params.subject} - رفيق المعلم الجزائري`;
  const text = `مرحباً الأستاذ(ة) ${params.userName || ''}،\n\nنحيطكم علماً بأنه قد تم الرد على استفساركم: "${params.subject}"\n\nرد الإدارة الفنية:\n${params.adminReply}\n\nرسالتكم الأصلية:\n${params.originalMessage}\n\nيمكنكم أيضاً متابعة استفساراتكم عبر بوابة الموقع في قسم الاستفسارات.\n\nمع أطيب التحيات،\nفريق الدعم الفني - رفيق المعلم الجزائري`;

  const html = `
    <div dir="rtl" style="font-family: Arial, Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #1e293b;">
      <div style="text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #0d9488; margin: 0 0 6px 0; font-size: 22px;">رفيق المعلم الجزائري</h2>
        <span style="display: inline-block; background: #f0fdf4; color: #0d9488; font-weight: bold; font-size: 12px; padding: 3px 10px; border-radius: 6px; border: 1px solid #ccfbf1;">
          إشعار بالرد على الاستفسار ${params.isSOS ? '• بلاغ طوارئ SOS' : ''}
        </span>
      </div>

      <p style="font-size: 15px; margin: 0 0 16px 0;">
        تحية طيبة الأستاذ(ة) <strong>${params.userName || 'الفاضل(ة)'}</strong>،
      </p>

      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
        تمت معالجة استفساركم بخصوص: <strong style="color: #0f172a;">${params.subject}</strong>
      </p>

      <div style="background: #f0fdf4; border-right: 4px solid #0d9488; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <div style="font-weight: bold; color: #0d9488; font-size: 14px; margin-bottom: 8px;">
          رد المشرف الفني (Admin Technical Response):
        </div>
        <div style="font-size: 14px; line-height: 1.8; color: #0f172a; white-space: pre-wrap;">${params.adminReply}</div>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; margin: 20px 0;">
        <div style="font-weight: bold; color: #64748b; font-size: 12px; margin-bottom: 6px;">
          نص استفساركم الأصلي:
        </div>
        <div style="font-size: 13px; color: #475569; line-height: 1.6; white-space: pre-wrap;">${params.originalMessage}</div>
      </div>

      <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 20px 0 0 0;">
        تم تسجيل هذا الرد أيضاً في حسابكم على الموقع في تبويب <strong>"الاستفسارات والدعم الفني"</strong> للرجوع إليه في أي وقت.
      </p>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
        فريق رفيق المعلم الجزائري • رفيقك الرقمي للنجاح
      </div>
    </div>
  `;

  if (!config.pass || !config.pass.trim()) {
    console.warn('[SMTP] No password configured, skipping direct SMTP delivery');
    return { success: false, error: 'SMTP password not configured' };
  }

  try {
    const transporter = createSmtpTransporter(config);
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail || config.user}>`,
      to: params.userEmail,
      subject,
      text,
      html
    });
    console.log(`[SMTP] Successfully emailed inquiry reply to ${params.userEmail}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[SMTP] Error sending inquiry reply to ${params.userEmail}:`, err?.message || err);
    return { success: false, error: err?.message || 'SMTP delivery failed' };
  }
}

export const ADMIN_NOTIFICATION_RECIPIENT = 'abdallahbourrich66@gmail.com';

export interface AdminNotificationParams {
  eventType: 'account_created' | 'successful_payment' | 'admin_user_added';
  fullName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  wilaya?: string;
  schoolName?: string;
  primaryGrade?: string;
  licenseKey?: string;
  licensePlan?: string;
  amountPaidDZD?: number;
  paidVia?: string;
  promoCode?: string;
  discountPercent?: number;
  orderId?: string;
  invoiceNumber?: string;
  timestamp?: string;
}

export async function sendAdminNotificationEmailViaNodemailer(
  params: AdminNotificationParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = loadSmtpSettings();
  const targetEmail = ADMIN_NOTIFICATION_RECIPIENT;

  const now = new Date();
  const dzTimeStr = now.toLocaleString('ar-DZ', {
    timeZone: 'Africa/Algiers',
    dateStyle: 'full',
    timeStyle: 'medium'
  });
  const isoTimeStr = params.timestamp || now.toISOString();

  const isPayment = params.eventType === 'successful_payment';
  const eventTitle = isPayment 
    ? '💰 دفع جديد ناجح وتفعيل رخصة'
    : (params.eventType === 'admin_user_added' ? '👤 إضافة مستخدم ورخصة بواسطة الإدارة' : '👤 إنشاء حساب أستاذ جديد');

  const subject = isPayment
    ? `💰 [دفعة ناجحة] تم سداد ${params.amountPaidDZD || 3000} دج - الأستاذ(ة): ${params.fullName}`
    : `👤 [حساب جديد] تسجيل أستاذ: ${params.fullName} (${params.email})`;

  const safeName = escapeHtml(params.fullName || 'أستاذ');
  const safeEmail = escapeHtml(params.email);
  const safePass = params.password ? escapeHtml(params.password) : 'تم تعيينها من قبل المستخدم أثناء التسجيل';
  const safePhone = params.phoneNumber ? escapeHtml(params.phoneNumber) : 'غير مدخل';
  const safeWilaya = params.wilaya ? escapeHtml(params.wilaya) : '16 - الجزائر';
  const safeSchool = params.schoolName ? escapeHtml(params.schoolName) : 'مدرسة ابتدائية';
  const safeGrade = params.primaryGrade ? escapeHtml(params.primaryGrade) : '4AP';
  const safeKey = params.licenseKey ? escapeHtml(params.licenseKey) : 'قيد الإنشاء أو المتابعة';
  const safePlan = escapeHtml(params.licensePlan || 'Personal Yearly License');
  const safePaidVia = escapeHtml(params.paidVia || (isPayment ? 'Chargily Pay v2 (Edahabia/CIB)' : 'حساب تجريبي مجاني'));
  const safeAmount = params.amountPaidDZD !== undefined ? `${params.amountPaidDZD.toLocaleString()} دج (DZD)` : (isPayment ? '3,000 دج (DZD)' : '0 دج (حساب مسجل)');
  const safePromo = params.promoCode ? `${escapeHtml(params.promoCode)}${params.discountPercent ? ` (خصم ${params.discountPercent}%)` : ''}` : 'بدون كود تخفيض';
  const safeInvoice = escapeHtml(params.invoiceNumber || params.orderId || `INV-${Date.now()}`);

  const text = `إشعار إداري فوري - رفيق المعلم الجزائري\n` +
    `==========================================\n` +
    `الحدث: ${eventTitle}\n` +
    `الوقت والتاريخ: ${dzTimeStr} (${isoTimeStr})\n\n` +
    `بيانات الأستاذ وبيانات الدخول (Submitted Credentials):\n` +
    `- الاسم الكامل: ${params.fullName}\n` +
    `- البريد الإلكتروني: ${params.email}\n` +
    `- كلمة المرور المدخلة: ${params.password || '(كلمة مرور سرية خاصة بالمستخدم)'}\n` +
    `- رقم الهاتف: ${params.phoneNumber || 'غير مدخل'}\n` +
    `- الولاية: ${params.wilaya || 'غير محددة'}\n` +
    `- المؤسسة التربوية: ${params.schoolName || 'غير محددة'}\n` +
    `- المستوى التدريسي: ${params.primaryGrade || '4AP'}\n\n` +
    `تفاصيل الدفع والمالية:\n` +
    `- المبلغ المدفوع: ${safeAmount}\n` +
    `- طريقة الدفع: ${safePaidVia}\n` +
    `- كود التخفيض: ${safePromo}\n` +
    `- رقم الطلب / الفاتورة: ${safeInvoice}\n\n` +
    `تفاصيل الترخيص والمفتاح:\n` +
    `- مفتاح الترخيص: ${params.licenseKey || 'لا يوجد'}\n` +
    `- نوع الخطة: ${safePlan}\n` +
    `- حالة الإشعار: تم إرسال مفتاح الترخيص إلى بريد العميل (${params.email}) بنجاح.\n\n` +
    `---\n` +
    `مرسل تلقائياً إلى: ${targetEmail}\n` +
    `نظام رفيق المعلم الجزائري الإداري`;

  const html = `
    <div dir="rtl" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Tahoma, Arial, sans-serif; max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
      
      <!-- Top Alert Header -->
      <div style="background: linear-gradient(135deg, ${isPayment ? '#059669 0%, #047857 100%' : '#0284c7 0%, #0369a1 100%'}); padding: 24px 20px; text-align: center; color: #ffffff;">
        <span style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px;">
          إشعار الإدارة المركزية • ADMIN REAL-TIME ALERT
        </span>
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
          ${eventTitle}
        </h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #f0fdf4; opacity: 0.95;">
          ${dzTimeStr}
        </p>
      </div>

      <div style="padding: 24px 22px; color: #1e293b; line-height: 1.6;">
        
        <p style="font-size: 15px; margin-top: 0; color: #0f172a;">
          مرحباً <strong>عبد الله</strong>،<br/>
          نحيطك علماً بأنه قد تم تسجيل عملية جديدة على منصة <strong>رفيق المعلم الجزائري</strong>. إليك كافة التفاصيل والبيانات المدخلة:
        </p>

        <!-- Financial Summary Banner (if payment) -->
        <div style="background: ${isPayment ? '#ecfdf5' : '#f0f9ff'}; border: 2px solid ${isPayment ? '#10b981' : '#38bdf8'}; border-radius: 10px; padding: 16px; margin: 20px 0; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 12px; color: ${isPayment ? '#047857' : '#0369a1'}; font-weight: bold; text-transform: uppercase;">
              ${isPayment ? 'المبلغ المستلم والمؤكد' : 'حالة الحساب والمبلغ'}
            </div>
            <div style="font-size: 24px; font-weight: 800; color: ${isPayment ? '#065f46' : '#0c4a6e'}; margin-top: 4px;">
              ${safeAmount}
            </div>
          </div>
          <div style="text-align: left; font-size: 12px; color: #64748b;">
            <div><strong>وسيلة الدفع:</strong> ${safePaidVia}</div>
            <div><strong>الوقت:</strong> <span style="direction: ltr; display: inline-block;">${now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Africa/Algiers' })}</span></div>
          </div>
        </div>

        <!-- License Key Highlight Box -->
        ${params.licenseKey ? `
        <div style="background: #f8fafc; border: 2px dashed #0d9488; border-radius: 10px; padding: 18px; text-align: center; margin: 20px 0;">
          <div style="font-size: 12px; color: #0f766e; font-weight: 800; margin-bottom: 6px;">
            مفتاح الترخيص المُصدر (Generated License Key):
          </div>
          <div style="font-family: monospace; font-size: 22px; font-weight: 800; color: #0d9488; direction: ltr; background: #ffffff; padding: 10px 16px; border-radius: 8px; border: 1px solid #99f6e4; display: inline-block; user-select: all;">
            ${safeKey}
          </div>
          <div style="font-size: 12px; color: #64748b; margin-top: 8px;">
            الخطة: <strong>${safePlan}</strong> • تم إرسال المفتاح لبريد العميل تلقائياً
          </div>
        </div>
        ` : ''}

        <!-- Credentials & User Information Table -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 22px;">
          <div style="background: #f1f5f9; padding: 10px 16px; font-size: 13px; font-weight: 800; color: #334155; border-bottom: 1px solid #e2e8f0;">
            📋 بيانات الأستاذ وبيانات الدخول المُدخلة (Customer Credentials):
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 16px; width: 35%; color: #64748b; font-weight: 600;">الاسم الكامل:</td>
                <td style="padding: 10px 16px; color: #0f172a; font-weight: 700;">${safeName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;">
                <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">البريد الإلكتروني:</td>
                <td style="padding: 10px 16px; color: #0f172a; font-weight: 700; direction: ltr; text-align: right;">
                  <a href="mailto:${safeEmail}" style="color: #0284c7; text-decoration: none;">${safeEmail}</a>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">كلمة المرور المدخلة:</td>
                <td style="padding: 10px 16px; color: #b91c1c; font-weight: 800;">
                  <code style="background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 13px;">${safePass}</code>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;">
                <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">رقم الهاتف:</td>
                <td style="padding: 10px 16px; color: #0f172a; direction: ltr; text-align: right;">${safePhone}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">الولاية:</td>
                <td style="padding: 10px 16px; color: #0f172a;">${safeWilaya}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;">
                <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">المؤسسة التعليمية:</td>
                <td style="padding: 10px 16px; color: #0f172a;">${safeSchool}</td>
              </tr>
              <tr>
                <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">المستوى التدريسي:</td>
                <td style="padding: 10px 16px; color: #0f172a; font-weight: bold;">${safeGrade}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Transaction & Invoice Details Table -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 20px;">
          <div style="background: #f1f5f9; padding: 10px 16px; font-size: 13px; font-weight: 800; color: #334155; border-bottom: 1px solid #e2e8f0;">
            🧾 تفاصيل المعاملة المالية والتوثيق (Transaction Metadata):
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 16px; width: 35%; color: #64748b; font-weight: 600;">كود الخصم (Promo Code):</td>
                <td style="padding: 10px 16px; color: #0f172a; font-weight: 700;">${safePromo}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;">
                <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">رقم الفاتورة / المرجع:</td>
                <td style="padding: 10px 16px; color: #0f172a; font-family: monospace;">${safeInvoice}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">التوقيت الدقيق (ISO):</td>
                <td style="padding: 10px 16px; color: #0f172a; font-family: monospace; font-size: 12px; direction: ltr; text-align: right;">${isoTimeStr}</td>
              </tr>
              <tr style="background: #fafafa;">
                <td style="padding: 10px 16px; color: #64748b; font-weight: 600;">إشعار العميل:</td>
                <td style="padding: 10px 16px; color: #059669; font-weight: 700;">
                  ✅ تم إرسال مفتاح الترخيص إلى بريد الأستاذ (${safeEmail})
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; font-size: 12px; color: #475569; text-align: center;">
          هذا إشعار إداري داخلي تم إنشاؤه وإرساله فورياً إلى بريدك الشخصي: <strong>${targetEmail}</strong> فور اكتمال الإجراء.
        </div>

      </div>

      <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
        رفيق المعلم الجزائري (Teacher Mate DZ) • لوحة الإدارة والتحكم
      </div>
    </div>
  `;

  if (!config.pass || !config.pass.trim()) {
    console.warn(`[SMTP Admin Notification] No password configured, skipping admin notification to ${targetEmail}`);
    return { success: false, error: 'SMTP password not configured' };
  }

  try {
    const transporter = createSmtpTransporter(config);
    const fromAddress = `"${config.fromName}" <${config.fromEmail || config.user}>`;

    console.log(`[SMTP Admin Notification] Sending alert to ${targetEmail} for event "${params.eventType}" (${params.email})...`);
    const info = await transporter.sendMail({
      from: fromAddress,
      to: targetEmail,
      subject,
      text,
      html
    });

    console.log(`[SMTP Admin Notification] Alert successfully delivered to ${targetEmail}! Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[SMTP Admin Notification] Failed to deliver alert to ${targetEmail}:`, err?.message || err);
    return { success: false, error: err?.message || 'SMTP delivery failed' };
  }
}


