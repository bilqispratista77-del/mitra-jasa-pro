'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Star, Eye, TrendingUp, Plus, Pencil, Trash2,
  User, Mail, Phone, MessageCircle, Calendar, CheckCircle,
  XCircle, AlertCircle, Loader2, ChevronRight, ArrowLeft,
  ImageOff, Package, Upload, X, Crown, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/auth-store';
import { useNavStore } from '@/store/nav-store';
import { useAuthModal } from '@/components/auth-modal';
import MembershipModal from '@/components/membership-modal';
import DocumentUploadSection from '@/components/document-upload-section';
import { formatPrice } from '@/lib/types';

// ---- Types ----
interface SellerStats {
  totalServices: number;
  activeServices: number;
  featuredServices: number;
  averageRating: number;
  totalReviews: number;
}

interface SellerService {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  location: string;
  whatsapp: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  approved: boolean;
  createdAt: string;
  categoryId: string;
  subCategoryId: string | null;
  category: { id: string; name: string; slug: string };
  subCategory: { id: string; name: string; slug: string } | null;
}

interface SellerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  avatar: string;
  role: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// ---- Stat Card ----
function StatCard({ icon: Icon, label, value, color, delay }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ---- Service Form Dialog ----
function ServiceFormDialog({
  open,
  onClose,
  categories,
  editingService,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  editingService: SellerService | null;
  onSaved: () => void;
}) {
  const isEdit = !!editingService;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    imageUrl: '',
    location: '',
    whatsapp: '',
    categoryId: '',
    subCategoryId: '',
  });

  useEffect(() => {
    if (open) {
      if (editingService) {
        setForm({
          title: editingService.title,
          description: editingService.description,
          price: String(editingService.price),
          imageUrl: editingService.imageUrl,
          location: editingService.location,
          whatsapp: editingService.whatsapp,
          categoryId: editingService.categoryId,
          subCategoryId: editingService.subCategoryId || '',
        });
        setImagePreview(editingService.imageUrl || null);
        // Load sub-categories for this category
        loadSubCategories(editingService.categoryId);
      } else {
        setForm({
          title: '', description: '', price: '', imageUrl: '',
          location: '', whatsapp: '', categoryId: '', subCategoryId: '',
        });
        setImagePreview(null);
        setSubCategories([]);
      }
      setError('');
      setLoading(false);
      setUploading(false);
    }
  }, [open, editingService]);

  const loadSubCategories = useCallback(async (catId: string) => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        const cat = data.data.find((c: { id: string; subCategories?: Category[] }) => c.id === catId);
        setSubCategories(cat?.subCategories || []);
      }
    } catch { /* ignore */ }
  }, []);

  const handleCategoryChange = async (catId: string) => {
    setForm((f) => ({ ...f, categoryId: catId, subCategoryId: '' }));
    await loadSubCategories(catId);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipe file tidak didukung. Gunakan JPG, PNG, GIF, WebP, atau SVG.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran file terlalu besar. Maksimal 2 MB.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setForm((f) => ({ ...f, imageUrl: data.data.imageUrl }));
        setImagePreview(data.data.imageUrl);
      } else {
        setError(data.error || 'Gagal mengunggah gambar');
      }
    } catch {
      setError('Terjadi kesalahan saat mengunggah gambar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setForm((f) => ({ ...f, imageUrl: '' }));
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.price || !form.categoryId) {
      setError('Judul, deskripsi, harga, dan kategori wajib diisi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const body = {
        ...form,
        price: parseFloat(form.price),
        subCategoryId: form.subCategoryId || null,
      };
      const url = isEdit ? `/api/services/${editingService.id}` : '/api/services';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        onSaved();
        onClose();
      } else {
        setError(data.error || 'Gagal menyimpan jasa');
      }
    } catch {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Jasa' : 'Tambah Jasa Baru'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Ubah informasi jasa Anda' : 'Isi data jasa yang ingin Anda tawarkan'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="svc-title">Judul Jasa *</Label>
            <Input id="svc-title" placeholder="cth: Servis AC Profesional" value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="svc-desc">Deskripsi *</Label>
            <Textarea id="svc-desc" placeholder="Jelaskan detail jasa Anda..." rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="svc-price">Harga (Rp) *</Label>
              <Input id="svc-price" type="number" placeholder="150000" value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-location">Lokasi</Label>
              <Input id="svc-location" placeholder="Jakarta" value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gambar Jasa</Label>
            <p className="text-[11px] text-muted-foreground">Format: JPG, PNG, GIF, WebP, SVG. Maksimal 1 MB.</p>

            {imagePreview ? (
              <div className="relative group rounded-xl overflow-hidden border bg-muted">
                <div className="aspect-[16/9]">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors ${
                  uploading
                    ? 'border-dodger/30 bg-dodger/5 pointer-events-none'
                    : 'border-muted-foreground/25 hover:border-dodger/50 hover:bg-dodger/5'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-8 w-8 text-dodger animate-spin" />
                    <p className="text-sm text-dodger font-medium">Mengunggah...</p>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dodger/10">
                      <Upload className="h-6 w-6 text-dodger" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        Klik untuk upload gambar
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        atau drag & drop file di sini
                      </p>
                    </div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="svc-whatsapp">No. WhatsApp</Label>
            <Input id="svc-whatsapp" placeholder="628123456789" value={form.whatsapp}
              onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label>Kategori *</Label>
            <Select value={form.categoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {subCategories.length > 0 && (
            <div className="space-y-2">
              <Label>Sub Kategori</Label>
              <Select value={form.subCategoryId} onValueChange={(v) => setForm((f) => ({ ...f, subCategoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Pilih sub kategori" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {subCategories.map((sc) => (
                    <SelectItem key={sc.id} value={sc.id}>{sc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isEdit ? 'Simpan Perubahan' : 'Tambah Jasa'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---- Profile Dialog ----
function ProfileDialog({
  open,
  onClose,
  seller,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  seller: SellerInfo | null;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (open && seller) {
      setForm({
        name: seller.name,
        phone: seller.phone,
        whatsapp: seller.whatsapp,
        currentPassword: '', newPassword: '', confirmPassword: '',
      });
      setAvatarPreview(seller.avatar || null);
      setError('');
      setSuccess('');
      setLoading(false);
      setUploading(false);
    }
  }, [open, seller]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipe file tidak didukung. Gunakan JPG, PNG, GIF, WebP, atau SVG.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran file terlalu besar. Maksimal 2 MB.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setAvatarPreview(data.data.imageUrl);
      } else {
        setError(data.error || 'Gagal mengunggah avatar');
      }
    } catch {
      setError('Terjadi kesalahan saat mengunggah avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
  };

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Nama wajib diisi');
      return;
    }
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('Password baru dan konfirmasi tidak cocok');
      return;
    }
    if (form.newPassword && !form.currentPassword) {
      setError('Masukkan password lama untuk mengubah password');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const body: Record<string, string> = { name: form.name, phone: form.phone, whatsapp: form.whatsapp };
      if (avatarPreview !== undefined) {
        body.avatar = avatarPreview || '';
      }
      if (form.newPassword) {
        body.currentPassword = form.currentPassword;
        body.newPassword = form.newPassword;
      }
      const res = await fetch('/api/seller/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        // Update auth store
        useAuthStore.getState().setUser(data.data as any);
        setSuccess('Profil berhasil diperbarui!');
        onSaved();
        setTimeout(() => onClose(), 1200);
      } else {
        setError(data.error || 'Gagal memperbarui profil');
      }
    } catch {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profil</DialogTitle>
          <DialogDescription>Perbarui informasi profil dan password Anda</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 shrink-0" />{success}
            </div>
          )}

          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <Avatar className="h-20 w-20 border-2 border-dashed border-muted-foreground/25">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : null}
                <AvatarFallback className="bg-dodger/10 text-dodger text-xl font-bold">
                  {getInitials(seller?.name || 'U')}
                </AvatarFallback>
              </Avatar>
              <label
                className={`absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${uploading ? 'pointer-events-none opacity-50' : ''}`}
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Upload className="h-5 w-5 text-white" />
                )}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-3 w-3" />
                Ubah Foto
              </Button>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={handleRemoveAvatar}
                >
                  Hapus
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">Format: JPG, PNG, GIF, WebP, SVG. Maks 1 MB.</p>
          </div>

          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="prof-name">Nama Lengkap</Label>
            <Input id="prof-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prof-email">Email</Label>
            <Input id="prof-email" value={seller?.email || ''} disabled className="bg-muted" />
            <p className="text-[11px] text-muted-foreground">Email tidak dapat diubah</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="prof-phone">No. HP</Label>
              <Input id="prof-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prof-wa">WhatsApp</Label>
              <Input id="prof-wa" value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} />
            </div>
          </div>
          <Separator />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ubah Password</p>
          <div className="space-y-2">
            <Label htmlFor="prof-oldpw">Password Lama</Label>
            <Input id="prof-oldpw" type="password" placeholder="••••••" value={form.currentPassword}
              onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="prof-newpw">Password Baru</Label>
              <Input id="prof-newpw" type="password" placeholder="••••••" value={form.newPassword}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prof-cfpw">Konfirmasi</Label>
              <Input id="prof-cfpw" type="password" placeholder="••••••" value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>Batal</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Simpan Profil
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---- Main Dashboard ----
export default function SellerDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { navigate } = useNavStore();
  const { openLogin } = useAuthModal();

  const [stats, setStats] = useState<SellerStats | null>(null);
  const [services, setServices] = useState<SellerService[]>([]);
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialogs
  const [showAddService, setShowAddService] = useState(false);
  const [editingService, setEditingService] = useState<SellerService | null>(null);
  const [deletingService, setDeletingService] = useState<SellerService | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showMembership, setShowMembership] = useState(false);

  // Membership check
  const PLAN_LIMITS: Record<string, number> = { FREE: 2, BASIC: 5, PRO: 10 };

  const getMembershipInfo = useCallback(() => {
    const plan = user?.membershipPlan || 'FREE';
    const max = PLAN_LIMITS[plan] || 2;
    const current = stats?.totalServices || 0;
    return { plan, max, current, remaining: Math.max(0, max - current) };
  }, [user?.membershipPlan, stats?.totalServices]);

  const handleAddService = useCallback(() => {
    const { current, max } = getMembershipInfo();
    if (current >= max) {
      setShowMembership(true);
    } else {
      setShowAddService(true);
    }
  }, [getMembershipInfo]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, catRes] = await Promise.all([
        fetch('/api/seller/dashboard'),
        fetch('/api/categories'),
      ]);
      const dashData = await dashRes.json();
      const catData = await catRes.json();

      if (dashData.success) {
        setStats(dashData.data.stats);
        setServices(dashData.data.services);
        setSeller(dashData.data.seller);
      } else {
        if (dashRes.status === 401) {
          setError('Silakan login terlebih dahulu');
        } else {
          setError(dashData.error || 'Gagal memuat dashboard');
        }
      }
      if (catData.success) {
        setCategories(catData.data.map((c: { id: string; name: string; slug: string }) => ({
          id: c.id, name: c.name, slug: c.slug,
        })));
      }
    } catch {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
    }
  }, [isAuthenticated, fetchDashboard]);

  const handleDeleteService = async () => {
    if (!deletingService) return;
    try {
      const res = await fetch(`/api/services/${deletingService.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setServices((prev) => prev.filter((s) => s.id !== deletingService.id));
        setStats((prev) => prev ? { ...prev, totalServices: prev.totalServices - 1 } : prev);
      } else {
        alert(data.error || 'Gagal menghapus jasa');
      }
    } catch {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setDeletingService(null);
    }
  };

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  // ---- Not authenticated ----
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-dodger" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-dodger/10 mb-6">
          <User className="h-10 w-10 text-dodger" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Login Diperlukan</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Anda harus login sebagai seller untuk mengakses dashboard. Silakan masuk atau daftar terlebih dahulu.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={openLogin}>Masuk</Button>
          <Button onClick={() => { navigate('beranda'); }}>Ke Beranda</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Dashboard Header */}
      <div className="bg-dodger text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-white/30">
                {seller?.avatar && (
                  <img src={seller.avatar} alt={seller.name} className="h-full w-full object-cover" />
                )}
                <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Dashboard Seller</h1>
                <p className="text-dodger-100 text-sm">
                  Selamat datang, <span className="font-medium text-white">{user.name}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="secondary" size="sm" className="gap-2 flex-1 sm:flex-none" onClick={() => setShowProfile(true)}>
                <Pencil className="h-4 w-4" />
                Edit Profil
              </Button>
              <Button size="sm" className="gap-2 flex-1 sm:flex-none bg-white text-dodger hover:bg-dodger-50" onClick={handleAddService}>
                <Plus className="h-4 w-4" />
                Tambah Jasa
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && !loading && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-xl border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-11 w-11 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-7 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                <StatCard icon={Package} label="Total Jasa" value={stats.totalServices} color="bg-dodger" delay={0} />
                <StatCard icon={CheckCircle} label="Jasa Aktif" value={stats.activeServices} color="bg-green-500" delay={0.05} />
                <StatCard icon={TrendingUp} label="Jasa Unggulan" value={stats.featuredServices} color="bg-amber-500" delay={0.1} />
                <StatCard icon={Star} label="Rating Rata-rata" value={stats.averageRating} color="bg-purple-500" delay={0.15} />
                <StatCard icon={MessageCircle} label="Total Review" value={stats.totalReviews} color="bg-rose-500" delay={0.2} />
              </div>
            )}

            {/* Membership Status Card */}
            {(() => {
              const { plan, max, current, remaining } = getMembershipInfo();
              const planLabels: Record<string, string> = { FREE: 'Free', BASIC: 'Basic', PRO: 'Pro' };
              const planColors: Record<string, string> = {
                FREE: 'bg-gray-100 text-gray-700 border-gray-200',
                BASIC: 'bg-amber-50 text-amber-700 border-amber-200',
                PRO: 'bg-purple-50 text-purple-700 border-purple-200',
              };
              const isFull = current >= max;
              const percentage = Math.min(100, (current / max) * 100);

              return (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className={`mb-8 rounded-xl border-2 p-4 sm:p-5 ${planColors[plan]} ${isFull ? 'ring-2 ring-red-300' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${
                        plan === 'FREE' ? 'bg-gray-200' : plan === 'BASIC' ? 'bg-amber-100' : 'bg-purple-100'
                      }`}>
                        {plan === 'FREE' ? (
                          <Shield className="h-5 w-5 text-gray-600" />
                        ) : (
                          <Crown className="h-5 w-5" style={{ color: plan === 'BASIC' ? '#b45309' : '#7c3aed' }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold">
                            Paket {planLabels[plan]}
                          </h3>
                          {plan !== 'FREE' && user?.membershipExpiresAt && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {new Date(user.membershipExpiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </Badge>
                          )}
                        </div>
                        {/* Progress bar */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full bg-black/10 overflow-hidden max-w-[200px]">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isFull ? 'bg-red-500' : percentage >= 75 ? 'bg-amber-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium whitespace-nowrap">
                            {current}/{max} postingan
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto">
                      {isFull ? (
                        <Button
                          size="sm"
                          className="w-full sm:w-auto gap-2 bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => setShowMembership(true)}
                        >
                          <Crown className="h-4 w-4" />
                          Upgrade Sekarang
                        </Button>
                      ) : plan === 'FREE' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto gap-2 border-current/20 hover:bg-current/5"
                          onClick={() => setShowMembership(true)}
                        >
                          <Crown className="h-4 w-4" />
                          Upgrade Paket
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full sm:w-auto gap-2 border-current/20 hover:bg-current/5"
                          onClick={() => setShowMembership(true)}
                        >
                          <Crown className="h-4 w-4" />
                          Upgrade Lagi
                        </Button>
                      )}
                    </div>
                  </div>

                  {isFull && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-100/60 px-3 py-2">
                      <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                      <p className="text-xs text-red-700 font-medium">
                        Batas postingan paket {planLabels[plan]} sudah tercapai. Upgrade untuk menambah lebih banyak jasa.
                      </p>
                    </div>
                  )}
                  {!isFull && remaining <= 1 && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-100/60 px-3 py-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <p className="text-xs text-amber-700 font-medium">
                        Sisa {remaining} postingan lagi. Pertimbangkan upgrade paket untuk menambah lebih banyak jasa.
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })()}

            {/* Document Verification Section */}
            <DocumentUploadSection />

            {/* My Services Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Jasa Saya</h2>
                <Button size="sm" variant="outline" className="gap-2 border-dodger/20 text-dodger-700 hover:bg-dodger hover:text-white hover:border-dodger" onClick={handleAddService}>
                  <Plus className="h-4 w-4" />
                  Tambah
                </Button>
              </div>

              {services.length === 0 ? (
                <div className="rounded-xl border bg-card border-dashed p-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dodger/10 mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-dodger" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Belum Ada Jasa</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                    Mulai tawarkan jasa Anda dan dapatkan klien pertama. Klik tombol di bawah untuk menambahkan jasa baru.
                  </p>
                  <Button className="gap-2" onClick={handleAddService}>
                    <Plus className="h-4 w-4" />
                    Tambah Jasa Pertama
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {services.map((service, index) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* Image */}
                        <div className="relative aspect-[16/9] bg-muted">
                          {service.imageUrl ? (
                            <img
                              src={service.imageUrl}
                              alt={service.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ImageOff className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                          )}
                          {/* Status badges */}
                          <div className="absolute top-2 left-2 flex gap-1.5">
                            {service.approved ? (
                              <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">
                                <CheckCircle className="h-3 w-3 mr-0.5" />Aktif
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                                <XCircle className="h-3 w-3 mr-0.5" />Pending
                              </Badge>
                            )}
                            {service.featured && (
                              <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5">
                                <Star className="h-3 w-3 mr-0.5 fill-white" />Unggulan
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-foreground text-sm line-clamp-1">{service.title}</h3>
                            <p className="text-sm font-bold text-dodger whitespace-nowrap">{formatPrice(service.price)}</p>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {service.rating} ({service.reviewCount})
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {service.category.name}
                            </span>
                          </div>

                          {service.location && (
                            <p className="text-xs text-muted-foreground mb-3">{service.location}</p>
                          )}

                          <Separator className="my-3" />

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs gap-1.5"
                              onClick={() => setEditingService(service)}
                            >
                              <Pencil className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1.5 text-destructive hover:bg-destructive hover:text-white"
                              onClick={() => setDeletingService(service)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1.5 text-dodger-700 border-dodger/20 hover:bg-dodger hover:text-white hover:border-dodger"
                              onClick={() => useNavStore.getState().viewService(service.id)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Profile Info Card */}
            {seller && (
              <div className="rounded-xl border bg-card p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Informasi Profil</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dodger/10 shrink-0">
                      <User className="h-4 w-4 text-dodger" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Nama</p>
                      <p className="text-sm font-medium text-foreground">{seller.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dodger/10 shrink-0">
                      <Mail className="h-4 w-4 text-dodger" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium text-foreground truncate">{seller.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dodger/10 shrink-0">
                      <Phone className="h-4 w-4 text-dodger" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Telepon</p>
                      <p className="text-sm font-medium text-foreground">{seller.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-dodger/10 shrink-0">
                      <Calendar className="h-4 w-4 text-dodger" />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Bergabung</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(seller.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <ServiceFormDialog
        open={showAddService || !!editingService}
        onClose={() => { setShowAddService(false); setEditingService(null); }}
        categories={categories}
        editingService={editingService}
        onSaved={fetchDashboard}
      />

      <ProfileDialog
        open={showProfile}
        onClose={() => setShowProfile(false)}
        seller={seller}
        onSaved={fetchDashboard}
      />

      <AlertDialog open={!!deletingService} onOpenChange={(v) => !v && setDeletingService(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jasa?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jasa &ldquo;{deletingService?.title}&rdquo;? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Membership Modal */}
      <MembershipModal
        open={showMembership}
        onClose={() => setShowMembership(false)}
        currentPlan={user?.membershipPlan || 'FREE'}
        currentCount={stats?.totalServices || 0}
        maxPostings={PLAN_LIMITS[user?.membershipPlan || 'FREE'] || 2}
      />
    </div>
  );
}
