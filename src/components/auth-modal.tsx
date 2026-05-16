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
import { Loader2, Mail, Lock, Eye, EyeOff, User, Phone, MessageCircle, CheckCircle2, MapPin, Briefcase, Users, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Inline Zustand store for auth modal state
// ---------------------------------------------------------------------------

interface AuthModalState {
  isOpen: boolean;
  mode: 'login' | 'register-select' | 'register-member' | 'register-seller' | 'register-success';
  registerData: { name: string; phone: string; role: string } | null;
  openLogin: () => void;
  openRegisterSelect: () => void;
  openRegisterMember: () => void;
  openRegisterSeller: () => void;
  close: () => void;
  showRegisterSuccess: (name: string, phone: string, role: string) => void;
}

const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  mode: 'login',
  registerData: null,
  openLogin: () => set({ isOpen: true, mode: 'login', registerData: null }),
  openRegisterSelect: () => set({ isOpen: true, mode: 'register-select', registerData: null }),
  openRegisterMember: () => set({ isOpen: true, mode: 'register-member', registerData: null }),
  openRegisterSeller: () => set({ isOpen: true, mode: 'register-seller', registerData: null }),
  close: () => set({ isOpen: false, registerData: null }),
  showRegisterSuccess: (name, phone, role) => set({ mode: 'register-success', registerData: { name, phone, role } }),
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
    try {
      const result = await login(email.trim(), password);
      setIsLoading(false);

      if (result.success) {
        await checkAuth();
        close();
        toast.success(`Selamat datang kembali!`);
      } else {
        setFormError(result.error || 'Login gagal');
      }
    } catch (err) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan koneksi';
      setFormError(msg);
      toast.error(msg);
    }
  };

  return (
    <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
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

      <Button
        type="submit"
        disabled={isLoading}
        className="h-11 w-full rounded-lg bg-dodger hover:bg-dodger-dark text-white font-semibold transition-colors"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? 'Memproses...' : 'Masuk'}
      </Button>

      {formError && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t" />
        <span className="mx-4 text-xs text-muted-foreground">atau</span>
        <div className="flex-1 border-t" />
      </div>

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
// Register Type Selection Screen
// ---------------------------------------------------------------------------

function RegisterSelectScreen({
  onSwitchToLogin,
}: {
  onSwitchToLogin: () => void;
}) {
  const { openRegisterMember, openRegisterSeller } = useAuthModalStore();

  return (
    <div className="space-y-5 py-2">
      <p className="text-sm text-muted-foreground text-center leading-relaxed">
        Pilih peran Anda untuk memulai
      </p>

      {/* Cards Grid – side-by-side on wider modals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* ── Member Card ── */}
        <button
          type="button"
          onClick={openRegisterMember}
          className="relative w-full overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-5 text-left transition-all duration-300 group hover:shadow-[0_8px_30px_-6px_rgba(16,185,129,0.25)] hover:border-emerald-300/80 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50"
        >
          {/* Decorative watermark icon */}
          <Users className="pointer-events-none absolute -right-3 -bottom-3 h-28 w-28 text-emerald-200/40 transition-transform duration-500 group-hover:scale-110 group-hover:text-emerald-300/50" aria-hidden="true" />

          <div className="relative z-10 flex flex-col gap-3">
            {/* Icon + Title row */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 shadow-sm ring-1 ring-emerald-200/50 transition-all duration-300 group-hover:bg-emerald-200 group-hover:shadow-md">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-[15px] leading-tight">Member</h3>
                <p className="text-[11px] text-emerald-600 font-medium">Pencari Jasa</p>
              </div>
              <ArrowRight className="h-4 w-4 text-emerald-400 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
            </div>

            {/* Description */}
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Temukan dan hubungi penyedia jasa profesional yang tepat untuk kebutuhan Anda.
            </p>

            {/* Polished pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['Gratis', 'Cari Jasa', 'Hubungi via WA'].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 text-emerald-700 ring-1 ring-emerald-200/50 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                >
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </button>

        {/* ── Seller Card ── */}
        <button
          type="button"
          onClick={openRegisterSeller}
          className="relative w-full overflow-hidden rounded-2xl border border-dodger/20 bg-gradient-to-br from-dodger/[0.06] via-white to-dodger/[0.03] p-5 text-left transition-all duration-300 group hover:shadow-[0_8px_30px_-6px_rgba(56,126,224,0.25)] hover:border-dodger/40 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dodger/40"
        >
          {/* Decorative watermark icon */}
          <Briefcase className="pointer-events-none absolute -right-3 -bottom-3 h-28 w-28 text-dodger/[0.08] transition-transform duration-500 group-hover:scale-110 group-hover:text-dodger/[0.14]" aria-hidden="true" />

          <div className="relative z-10 flex flex-col gap-3">
            {/* Icon + Title row */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dodger/10 shadow-sm ring-1 ring-dodger/10 transition-all duration-300 group-hover:bg-dodger/20 group-hover:shadow-md">
                <Briefcase className="h-5 w-5 text-dodger" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-[15px] leading-tight">Seller</h3>
                <p className="text-[11px] text-dodger font-medium">Penyedia Jasa</p>
              </div>
              <ArrowRight className="h-4 w-4 text-dodger opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
            </div>

            {/* Description */}
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Pasang jasa Anda dan temukan klien baru. Cocok untuk freelancer & profesional.
            </p>

            {/* Polished pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['Pasang Jasa', 'Dashboard', 'Keanggotaan'].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded-full bg-dodger/[0.08] text-dodger ring-1 ring-dodger/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                >
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </button>
      </div>

      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t" />
        <span className="mx-4 text-xs text-muted-foreground">atau</span>
        <div className="flex-1 border-t" />
      </div>

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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Member Registration Form
// ---------------------------------------------------------------------------

function RegisterMemberForm({
  onSwitchToLogin,
}: {
  onSwitchToLogin: () => void;
}) {
  const { register, checkAuth } = useAuthStore();
  const { close, showRegisterSuccess } = useAuthModalStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
    try {
      const result = await register({
        email: email.trim(),
        password,
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: phone.trim(),
        role: 'USER',
      });
      if (result.success) {
        await checkAuth();
        showRegisterSuccess(name.trim(), phone.trim(), 'USER');
      } else {
        setFormError(result.error || 'Registrasi gagal');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan koneksi';
      setFormError(msg);
    }
    setIsLoading(false);
  };

  return (
    <form id="reg-member-form" onSubmit={handleSubmit} className="space-y-4">
      {/* Nama Lengkap */}
      <FormField
        id="reg-member-name"
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
        id="reg-member-email"
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
        id="reg-member-phone"
        label="No. HP / WhatsApp"
        type="tel"
        placeholder="08xxxxxxxxxx"
        icon={Phone}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={fieldErrors.phone}
        autoComplete="tel"
      />

      {/* Password */}
      <FormField
        id="reg-member-password"
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
        id="reg-member-confirm"
        label="Konfirmasi Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Ulangi password"
        icon={Lock}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
      />

      <Button
        type="submit"
        disabled={isLoading}
        className="h-11 w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? 'Memproses...' : 'Daftar sebagai Member'}
      </Button>

      {formError && (
        <p className="text-center text-sm text-destructive">{formError}</p>
      )}

      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t" />
        <span className="mx-4 text-xs text-muted-foreground">atau</span>
        <div className="flex-1 border-t" />
      </div>

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
// Seller Registration Form
// ---------------------------------------------------------------------------

function RegisterSellerForm({
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
  const [subdistrict, setSubdistrict] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
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
    try {
      const result = await register({
        email: email.trim(),
        password,
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: phone.trim(),
        address: address.trim(),
        subdistrict: subdistrict.trim(),
        district: district.trim(),
        province: province.trim(),
        role: 'SELLER',
      });
      if (result.success) {
        await checkAuth();
        showRegisterSuccess(name.trim(), phone.trim(), 'SELLER');
      } else {
        setFormError(result.error || 'Registrasi gagal');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan koneksi';
      setFormError(msg);
    }
    setIsLoading(false);
  };

  return (
    <form id="reg-seller-form" onSubmit={handleSubmit} className="space-y-4">
      {/* Nama Lengkap */}
      <FormField
        id="reg-seller-name"
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
        id="reg-seller-email"
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
        id="reg-seller-phone"
        label="No. HP / WhatsApp"
        type="tel"
        placeholder="08xxxxxxxxxx"
        icon={Phone}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={fieldErrors.phone}
        autoComplete="tel"
      />

      {/* Alamat Lengkap */}
      <FormField
        id="reg-seller-address"
        label="Alamat Lengkap"
        type="text"
        placeholder="Nama jalan, RT/RW, kelurahan"
        icon={MapPin}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        error={fieldErrors.address}
        autoComplete="street-address"
      />

      {/* Kecamatan & Kabupaten - 2 kolom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          id="reg-seller-subdistrict"
          label="Kecamatan"
          type="text"
          placeholder="Kecamatan"
          icon={MapPin}
          value={subdistrict}
          onChange={(e) => setSubdistrict(e.target.value)}
          error={fieldErrors.subdistrict}
        />
        <FormField
          id="reg-seller-district"
          label="Kabupaten / Kota"
          type="text"
          placeholder="Kabupaten / Kota"
          icon={MapPin}
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          error={fieldErrors.district}
        />
      </div>

      {/* Provinsi */}
      <FormField
        id="reg-seller-province"
        label="Provinsi"
        type="text"
        placeholder="Provinsi"
        icon={MapPin}
        value={province}
        onChange={(e) => setProvince(e.target.value)}
        error={fieldErrors.province}
      />

      {/* Password */}
      <FormField
        id="reg-seller-password"
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
        id="reg-seller-confirm"
        label="Konfirmasi Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Ulangi password"
        icon={Lock}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
      />

      <Button
        type="submit"
        disabled={isLoading}
        className="h-11 w-full rounded-lg bg-dodger hover:bg-dodger-dark text-white font-semibold transition-colors"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? 'Memproses...' : 'Daftar sebagai Seller'}
      </Button>

      {formError && (
        <p className="text-center text-sm text-destructive">{formError}</p>
      )}

      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t" />
        <span className="mx-4 text-xs text-muted-foreground">atau</span>
        <div className="flex-1 border-t" />
      </div>

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
// Registration Success Screen
// ---------------------------------------------------------------------------

function RegisterSuccessScreen() {
  const { close, registerData } = useAuthModalStore();
  const { navigate: navNavigate } = useNavStore();

  if (!registerData) return null;

  const isSeller = registerData.role === 'SELLER';

  const ADMIN_WA_NUMBER = '6282244629110';
  const waMessage = isSeller
    ? encodeURIComponent(
        `Halo Admin, saya baru saja mendaftar sebagai seller di Mitra Jasa Pro.\n\nNama: ${registerData.name}\nWhatsApp: ${registerData.phone}\n\nMohon untuk diverifikasi dan diaktifkan akun saya. Terima kasih!`
      )
    : '';
  const waLink = `https://wa.me/${ADMIN_WA_NUMBER}?text=${waMessage}`;

  const handleGoToDashboard = () => {
    close();
    navNavigate('dashboard');
  };

  return (
    <div className="space-y-5 py-2">
      {/* Success Icon */}
      <div className="flex flex-col items-center text-center">
        <div className={`flex h-16 w-16 items-center justify-center rounded-full mb-4 ${isSeller ? 'bg-dodger/10' : 'bg-emerald-100'}`}>
          <CheckCircle2 className={`h-9 w-9 ${isSeller ? 'text-dodger' : 'text-emerald-600'}`} />
        </div>
        <h3 className="text-lg font-bold text-foreground">Pendaftaran Berhasil!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Akun {isSeller ? 'seller' : 'member'} <span className="font-semibold text-foreground">{registerData.name}</span> telah berhasil dibuat.
        </p>
      </div>

      {/* WA Confirmation Card (Seller only) */}
      {isSeller && (
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
      )}

      {/* Actions */}
      <div className="space-y-3">
        {isSeller && (
          <Button
            className="w-full h-11 rounded-lg bg-dodger hover:bg-dodger-dark text-white font-semibold transition-colors gap-2"
            onClick={handleGoToDashboard}
          >
            Buka Dashboard Seller
          </Button>
        )}
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
  const { isOpen, mode, close, openLogin, openRegisterSelect } = useAuthModalStore();

  const handleOpenChange = (open: boolean) => {
    if (!open) close();
  };

  const isRegisterSuccess = mode === 'register-success';

  const getTitle = () => {
    switch (mode) {
      case 'register-select': return 'Daftar Akun Baru';
      case 'register-member': return 'Daftar Member';
      case 'register-seller': return 'Daftar Seller';
      default: return 'Mitra Jasa Pro';
    }
  };

  const getDesc = () => {
    switch (mode) {
      case 'register-success': return 'Pendaftaran berhasil';
      case 'register-select': return 'Pilih jenis akun';
      case 'register-member': return 'Buat akun member untuk mencari jasa';
      case 'register-seller': return 'Buat akun seller untuk menawarkan jasa';
      default: return 'Masuk ke akun Anda';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-6 gap-0 overflow-y-auto max-h-[90vh]" onPointerDownOutside={(e) => e.preventDefault()}>
        {/* Header */}
        <DialogHeader className="space-y-1 text-center pb-4">
          <DialogTitle className="text-2xl font-bold gradient-text">
            {isRegisterSuccess ? 'Mitra Jasa Pro' : getTitle()}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {getDesc()}
          </DialogDescription>
        </DialogHeader>

        {/* Form body */}
        {isRegisterSuccess ? (
          <RegisterSuccessScreen />
        ) : mode === 'login' ? (
          <LoginForm onSwitchToRegister={openRegisterSelect} />
        ) : mode === 'register-select' ? (
          <RegisterSelectScreen onSwitchToLogin={openLogin} />
        ) : mode === 'register-member' ? (
          <RegisterMemberForm onSwitchToLogin={openLogin} />
        ) : (
          <RegisterSellerForm onSwitchToLogin={openLogin} />
        )}
      </DialogContent>
    </Dialog>
  );
}
