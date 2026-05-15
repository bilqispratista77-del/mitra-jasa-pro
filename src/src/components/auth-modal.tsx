'use client';

import { useState } from 'react';
import { create } from 'zustand';
import { useAuthStore } from '@/store/auth-store';
import { useNavStore } from '@/store/nav-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Lock, Eye, EyeOff, User, Phone, MessageCircle, CheckCircle2, MapPin } from 'lucide-react';

// ---------------------------------------------------------------------------
// Inline Zustand store for auth modal state
// ---------------------------------------------------------------------------

interface AuthModalState {
  isOpen: boolean;
  mode: 'login' | 'register' | 'register-success';
  registerData: { name: string; phone: string } | null;
  openLogin: () => void;
  openRegister: () => void;
  close: () => void;
  showRegisterSuccess: (name: string, phone: string) => void;
}

const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  mode: 'login',
  registerData: null,
  openLogin: () => set({ isOpen: true, mode: 'login', registerData: null }),
  openRegister: () => set({ isOpen: true, mode: 'register', registerData: null }),
  close: () => set({ isOpen: false, registerData: null }),
  showRegisterSuccess: (name, phone) => set({ mode: 'register-success', registerData: { name, phone } }),
}));

export function useAuthModal() {
  return useAuthModalStore();
}

// ---------------------------------------------------------------------------
// Reusable form-field helper with icon prefix
// ---------------------------------------------------------------------------

function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  icon: Icon,
  value,
  onChange,
  error,
  endAdornment,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  endAdornment?: React.ReactNode;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          className={`h-11 rounded-lg pl-10 pr-10 ${
            endAdornment ? '' : 'pr-3'
          } ${error ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30' : ''}`}
        />
        {endAdornment && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            {endAdornment}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Login Form
// ---------------------------------------------------------------------------

function LoginForm({
  onSwitchToRegister,
}: {
  onSwitchToRegister: () => void;
}) {
  const { login, checkAuth } = useAuthStore();
  const { close } = useAuthModalStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = 'Email wajib diisi';
    if (!password) errors.password = 'Password wajib diisi';
    else if (password.length < 6) errors.password = 'Password minimal 6 karakter';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      // Refresh auth state from server cookie
      await checkAuth();
      close();
    } else {
      setFormError(result.error || 'Login gagal');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <FormField
        id="login-email"
        label="Email"
        type="email"
        placeholder="nama@email.com"
        icon={Mail}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        autoComplete="email"
      />

      {/* Password */}
      <FormField
        id="login-password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Masukkan password"
        icon={Lock}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        endAdornment={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        autoComplete="current-password"
      />

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="h-11 w-full rounded-lg bg-dodger hover:bg-dodger-dark text-white font-semibold transition-colors"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        Masuk
      </Button>

      {/* Error */}
      {formError && (
        <p className="text-center text-sm text-destructive">{formError}</p>
      )}

      {/* Divider */}
      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t" />
        <span className="mx-4 text-xs text-muted-foreground">atau</span>
        <div className="flex-1 border-t" />
      </div>

      {/* Switch to register */}
      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold text-dodger hover:text-dodger-dark transition-colors"
        >
          Daftar Sekarang
        </button>
      </p>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Register Form
// ---------------------------------------------------------------------------

function RegisterForm({
  onSwitchToLogin,
}: {
  onSwitchToLogin: () => void;
}) {
  const { register, checkAuth } = useAuthStore();
  const { close, showRegisterSuccess } = useAuthModalStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Nama lengkap wajib diisi';
    if (!email.trim()) errors.email = 'Email wajib diisi';
    if (!phone.trim()) errors.phone = 'No. HP / WhatsApp wajib diisi';
    if (!password) errors.password = 'Password wajib diisi';
    else if (password.length < 6) errors.password = 'Password minimal 6 karakter';
    if (!confirmPassword) errors.confirmPassword = 'Konfirmasi password wajib diisi';
    else if (password !== confirmPassword) errors.confirmPassword = 'Password tidak cocok';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setIsLoading(true);
    const result = await register({
      email: email.trim(),
      password,
      name: name.trim(),
      phone: phone.trim(),
      whatsapp: phone.trim(),
      address: address.trim(),
    });
    setIsLoading(false);

    if (result.success) {
      // Refresh auth state from server cookie
      await checkAuth();
      // Show success screen with WA confirmation button
      showRegisterSuccess(name.trim(), phone.trim());
    } else {
      setFormError(result.error || 'Registrasi gagal');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nama Lengkap */}
      <FormField
        id="register-name"
        label="Nama Lengkap"
        type="text"
        placeholder="Masukkan nama lengkap"
        icon={User}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={fieldErrors.name}
        autoComplete="name"
      />

      {/* Email */}
      <FormField
        id="register-email"
        label="Email"
        type="email"
        placeholder="nama@email.com"
        icon={Mail}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        autoComplete="email"
      />

      {/* No. HP / WhatsApp */}
      <FormField
        id="register-phone"
        label="No. HP / WhatsApp"
        type="tel"
        placeholder="08xxxxxxxxxx"
        icon={Phone}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={fieldErrors.phone}
        autoComplete="tel"
      />

      {/* Alamat */}
      <FormField
        id="register-address"
        label="Alamat"
        type="text"
        placeholder="Kota / Kabupaten, Provinsi"
        icon={MapPin}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        error={fieldErrors.address}
        autoComplete="street-address"
      />

      {/* Password */}
      <FormField
        id="register-password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Minimal 6 karakter"
        icon={Lock}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        endAdornment={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        autoComplete="new-password"
      />

      {/* Konfirmasi Password */}
      <FormField
        id="register-confirm-password"
        label="Konfirmasi Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Ulangi password"
        icon={Lock}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
      />

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="h-11 w-full rounded-lg bg-dodger hover:bg-dodger-dark text-white font-semibold transition-colors"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        Daftar Sekarang
      </Button>

      {/* Error */}
      {formError && (
        <p className="text-center text-sm text-destructive">{formError}</p>
      )}

      {/* Divider */}
      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t" />
        <span className="mx-4 text-xs text-muted-foreground">atau</span>
        <div className="flex-1 border-t" />
      </div>

      {/* Switch to login */}
      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-dodger hover:text-dodger-dark transition-colors"
        >
          Masuk
        </button>
      </p>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Registration Success Screen with WA Confirmation
// ---------------------------------------------------------------------------

function RegisterSuccessScreen() {
  const { close, registerData } = useAuthModalStore();
  const { navigate } = useNavStore();

  if (!registerData) return null;

  const ADMIN_WA_NUMBER = '6282244629110';
  const waMessage = encodeURIComponent(
    `Halo Admin, saya baru saja mendaftar sebagai seller di Mitra Jasa Pro.\n\nNama: ${registerData.name}\nWhatsApp: ${registerData.phone}\n\nMohon untuk diverifikasi dan diaktifkan akun saya. Terima kasih!`
  );
  const waLink = `https://wa.me/${ADMIN_WA_NUMBER}?text=${waMessage}`;

  const handleGoToDashboard = () => {
    close();
    navigate('dashboard');
  };

  return (
    <div className="space-y-5 py-2">
      {/* Success Icon */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Pendaftaran Berhasil!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Akun seller <span className="font-semibold text-foreground">{registerData.name}</span> telah berhasil dibuat.
        </p>
      </div>

      {/* Info Card */}
      <div className="rounded-xl border border-dodger/20 bg-dodger/5 p-4 space-y-3">
        <div className="flex items-start gap-2">
          <MessageCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div className="text-sm text-foreground">
            <p className="font-semibold">Konfirmasi ke Admin via WhatsApp</p>
            <p className="text-muted-foreground mt-1">
              Silakan konfirmasi pendaftaran Anda kepada admin melalui WhatsApp agar akun dapat segera diverifikasi dan diaktifkan.
            </p>
          </div>
        </div>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Konfirmasi via WhatsApp
        </a>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          className="w-full h-11 rounded-lg bg-dodger hover:bg-dodger-dark text-white font-semibold transition-colors gap-2"
          onClick={handleGoToDashboard}
        >
          Buka Dashboard Seller
        </Button>
        <Button
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={close}
        >
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AuthModal – the main exported component
// ---------------------------------------------------------------------------

export default function AuthModal() {
  const { isOpen, mode, close, openLogin, openRegister } = useAuthModalStore();

  const handleOpenChange = (open: boolean) => {
    if (!open) close();
  };

  const isRegisterSuccess = mode === 'register-success';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-6 gap-0 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <DialogHeader className="space-y-1 text-center pb-4">
          <DialogTitle className="text-2xl font-bold gradient-text">
            Mitra Jasa Pro
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isRegisterSuccess
              ? 'Pendaftaran berhasil'
              : mode === 'login'
              ? 'Masuk ke akun Anda'
              : 'Buat akun baru'}
          </DialogDescription>
        </DialogHeader>

        {/* Form body */}
        {isRegisterSuccess ? (
          <RegisterSuccessScreen />
        ) : mode === 'login' ? (
          <LoginForm onSwitchToRegister={openRegister} />
        ) : (
          <RegisterForm onSwitchToLogin={openLogin} />
        )}
      </DialogContent>
    </Dialog>
  );
}
