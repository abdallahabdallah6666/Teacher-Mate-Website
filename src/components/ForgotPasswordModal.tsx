import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Language } from './Navbar';
import { UserProfile } from '../types';

interface ForgotPasswordModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  lang,
  isOpen,
  onClose,
  onLoginSuccess,
  initialEmail = '',
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'verify' | 'password'>('email');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (lang === 'ar' ? 'فشل إرسال الرمز' : 'Failed to send code'));
      setStep('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code })
      });
      if (!res.ok) throw new Error(lang === 'ar' ? 'رمز غير صحيح' : 'Invalid code');
      setStep('password');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError(lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (lang === 'ar' ? 'خطأ في تحديث كلمة المرور' : 'Failed to reset password'));
      
      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#1E3A8A]">
            {lang === 'ar' ? 'استعادة كلمة المرور' : 'Forgot Password'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg text-center">{error}</div>}

        {step === 'email' && (
          <div className="space-y-4">
            <input type="email" placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email'} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded-lg" />
            <button onClick={handleSendCode} disabled={loading} className="w-full bg-[#1E3A8A] text-white py-2 rounded-lg">{loading ? '...' : (lang === 'ar' ? 'إرسال الرمز' : 'Send Code')}</button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <input type="text" placeholder={lang === 'ar' ? 'الرمز (6 أرقام)' : 'Code (6 digits)'} value={code} onChange={(e) => setCode(e.target.value)} className="w-full border p-2 rounded-lg" />
            <button onClick={handleVerifyCode} disabled={loading} className="w-full bg-[#1E3A8A] text-white py-2 rounded-lg">{loading ? '...' : (lang === 'ar' ? 'تحقق' : 'Verify')}</button>
          </div>
        )}

        {step === 'password' && (
          <div className="space-y-4">
            <input type="password" placeholder={lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border p-2 rounded-lg" />
            <input type="password" placeholder={lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border p-2 rounded-lg" />
            <button onClick={handleResetPassword} disabled={loading} className="w-full bg-[#1E3A8A] text-white py-2 rounded-lg">{loading ? '...' : (lang === 'ar' ? 'تحديث وتسجيل الدخول' : 'Update & Login')}</button>
          </div>
        )}
      </div>
    </div>
  );
};
