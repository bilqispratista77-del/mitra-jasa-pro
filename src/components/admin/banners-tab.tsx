'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon, Plus, Pencil, Trash2, AlertCircle, X,
  Loader2, Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
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
import type { AdminBanner } from './types';
import { fadeInUp } from './helpers';

export default function BannersTab() {
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<AdminBanner | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    ctaText: '',
    ctaLink: '',
    imageUrl: '',
    order: '0',
    active: true,
  });
  const [formError, setFormError] = useState('');

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/banners');
      const data = await res.json();
      if (data.success) {
        setBanners(data.data);
      } else {
        setError(data.error || 'Gagal memuat banner');
      }
    } catch {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const openCreateDialog = () => {
    setEditingBanner(null);
    setForm({
      title: '', subtitle: '', description: '', ctaText: '',
      ctaLink: '', imageUrl: '', order: '0', active: true,
    });
    setFormError('');
    setUploading(false);
    setShowDialog(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setFormError('Tipe file tidak didukung. Gunakan JPG, PNG, GIF, WebP, atau SVG.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFormError('Ukuran file terlalu besar. Maksimal 2 MB.');
      return;
    }
    setUploading(true);
    setFormError('');
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
      } else {
        setFormError(data.error || 'Gagal mengunggah gambar');
      }
    } catch {
      setFormError('Terjadi kesalahan saat mengunggah gambar');
    } finally {
      setUploading(false);
    }
  };

  const openEditDialog = (banner: AdminBanner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description,
      ctaText: banner.ctaText,
      ctaLink: banner.ctaLink,
      imageUrl: banner.imageUrl,
      order: String(banner.order),
      active: banner.active,
    });
    setFormError('');
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!form.title) {
      setFormError('Judul banner wajib diisi');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const isEdit = !!editingBanner;
      const url = isEdit ? `/api/admin/banners/${editingBanner.id}` : '/api/admin/banners';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          subtitle: form.subtitle,
          description: form.description,
          ctaText: form.ctaText,
          ctaLink: form.ctaLink,
          imageUrl: form.imageUrl,
          order: parseInt(form.order) || 0,
          active: form.active,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowDialog(false);
        fetchBanners();
      } else {
        setFormError(data.error || 'Gagal menyimpan banner');
      }
    } catch {
      setFormError('Terjadi kesalahan koneksi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBanner) return;
    try {
      const res = await fetch(`/api/admin/banners/${deletingBanner.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) => prev.filter((b) => b.id !== deletingBanner.id));
      } else {
        alert(data.error || 'Gagal menghapus banner');
      }
    } catch {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setDeletingBanner(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{banners.length} banner terdaftar</p>
        <Button className="gap-2" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Tambah Banner
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <AnimatePresence>
              {banners.map((banner, index) => (
                <motion.div
                  key={banner.id}
                  {...fadeInUp}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="relative md:w-72 shrink-0 aspect-[16/9] md:aspect-auto bg-muted">
                      {banner.imageUrl ? (
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        <span className="text-[10px] text-muted-foreground bg-background/80 backdrop-blur rounded px-1.5 py-0.5">
                          #{banner.order}
                        </span>
                        {banner.active ? (
                          <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">Aktif</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">Nonaktif</Badge>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 md:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground mb-1">{banner.title}</h3>
                          {banner.subtitle && (
                            <p className="text-sm text-muted-foreground mb-1">{banner.subtitle}</p>
                          )}
                          {banner.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{banner.description}</p>
                          )}
                          {banner.ctaText && (
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <span className="font-medium text-dodger">{banner.ctaText}</span>
                                {banner.ctaLink && `→ ${banner.ctaLink}`}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1"
                            onClick={() => openEditDialog(banner)}
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive hover:text-white"
                            onClick={() => setDeletingBanner(banner)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {banners.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Belum ada banner. Klik tombol &ldquo;Tambah Banner&rdquo; untuk menambahkan.
            </div>
          )}
        </>
      )}

      {/* Create/Edit Banner Dialog */}
      <Dialog open={showDialog} onOpenChange={(v) => !v && setShowDialog(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Edit Banner' : 'Tambah Banner Baru'}</DialogTitle>
            <DialogDescription>
              {editingBanner ? 'Ubah informasi banner' : 'Isi data banner slider yang ingin ditampilkan'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {formError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="bn-title">Judul *</Label>
              <Input
                id="bn-title"
                placeholder="Judul banner"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="bn-subtitle">Subtitle</Label>
                <Input
                  id="bn-subtitle"
                  placeholder="Subtitle banner"
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bn-order">Urutan</Label>
                <Input
                  id="bn-order"
                  type="number"
                  min="0"
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bn-desc">Deskripsi</Label>
              <Textarea
                id="bn-desc"
                placeholder="Deskripsi banner..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="bn-cta">Teks Tombol CTA</Label>
                <Input
                  id="bn-cta"
                  placeholder="cth: Lihat Jasa"
                  value={form.ctaText}
                  onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bn-link">Link CTA</Label>
                <Input
                  id="bn-link"
                  placeholder="cth: /jasa"
                  value={form.ctaLink}
                  onChange={(e) => setForm((f) => ({ ...f, ctaLink: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gambar</Label>
              <p className="text-[11px] text-muted-foreground">Format: JPG, PNG, GIF, WebP, SVG. Maksimal 2 MB.</p>
              {form.imageUrl ? (
                <div className="relative group rounded-xl overflow-hidden border bg-muted">
                  <div className="aspect-[16/9]">
                    <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
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
                  }`
                  }>
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
                        <p className="text-sm font-medium text-foreground">Klik untuk upload gambar</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">atau drag & drop file di sini</p>
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

            <div className="flex items-center justify-between">
              <Label htmlFor="bn-active">Aktif</Label>
              <Switch
                id="bn-active"
                checked={form.active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowDialog(false)} disabled={saving}>
                Batal
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingBanner ? 'Simpan Perubahan' : 'Tambah Banner'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Banner Dialog */}
      <AlertDialog open={!!deletingBanner} onOpenChange={(v) => !v && setDeletingBanner(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Banner?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus banner &ldquo;{deletingBanner?.title}&rdquo;? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
