'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Plus, Pencil, Trash2, AlertCircle, X, Loader2, Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { AdminSponsor } from './types';
import { fadeInUp } from './helpers';

export default function SponsorsTab() {
  const [sponsors, setSponsors] = useState<AdminSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<AdminSponsor | null>(null);
  const [deletingSponsor, setDeletingSponsor] = useState<AdminSponsor | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    logoUrl: '',
    order: '0',
    active: true,
  });
  const [formError, setFormError] = useState('');

  const fetchSponsors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/sponsors');
      const data = await res.json();
      if (data.success) {
        setSponsors(data.data);
      } else {
        setError(data.error || 'Gagal memuat sponsor');
      }
    } catch {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSponsors(); }, [fetchSponsors]);

  const openCreateDialog = () => {
    setEditingSponsor(null);
    setForm({ name: '', logoUrl: '', order: '0', active: true });
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
        setForm((f) => ({ ...f, logoUrl: data.data.imageUrl }));
      } else {
        setFormError(data.error || 'Gagal mengunggah gambar');
      }
    } catch {
      setFormError('Terjadi kesalahan saat mengunggah gambar');
    } finally {
      setUploading(false);
    }
  };

  const openEditDialog = (sponsor: AdminSponsor) => {
    setEditingSponsor(sponsor);
    setForm({
      name: sponsor.name,
      logoUrl: sponsor.logoUrl,
      order: String(sponsor.order),
      active: sponsor.active,
    });
    setFormError('');
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!form.name) {
      setFormError('Nama sponsor wajib diisi');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const isEdit = !!editingSponsor;
      const url = isEdit ? `/api/admin/sponsors/${editingSponsor.id}` : '/api/admin/sponsors';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          logoUrl: form.logoUrl,
          order: parseInt(form.order) || 0,
          active: form.active,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowDialog(false);
        fetchSponsors();
      } else {
        setFormError(data.error || 'Gagal menyimpan sponsor');
      }
    } catch {
      setFormError('Terjadi kesalahan koneksi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSponsor) return;
    try {
      const res = await fetch(`/api/admin/sponsors/${deletingSponsor.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSponsors((prev) => prev.filter((s) => s.id !== deletingSponsor.id));
      } else {
        alert(data.error || 'Gagal menghapus sponsor');
      }
    } catch {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setDeletingSponsor(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{sponsors.length} sponsor terdaftar</p>
        <Button className="gap-2" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Tambah Sponsor
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {sponsors.map((sponsor, index) => (
                <motion.div
                  key={sponsor.id}
                  {...fadeInUp}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Logo */}
                  <div className="relative aspect-[4/3] bg-muted/30 p-4 flex items-center justify-center">
                    {sponsor.logoUrl ? (
                      <img
                        src={sponsor.logoUrl}
                        alt={sponsor.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : null}
                    <Award className="h-10 w-10 text-muted-foreground/30 absolute" />
                    {!sponsor.active && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Badge variant="secondary" className="text-xs">Nonaktif</Badge>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-foreground text-sm truncate">{sponsor.name}</h3>
                      <span className="text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                        #{sponsor.order}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs gap-1"
                        onClick={() => openEditDialog(sponsor)}
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive hover:text-white"
                        onClick={() => setDeletingSponsor(sponsor)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {sponsors.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Belum ada sponsor. Klik tombol &ldquo;Tambah Sponsor&rdquo; untuk menambahkan.
            </div>
          )}
        </>
      )}

      {/* Create/Edit Sponsor Dialog */}
      <Dialog open={showDialog} onOpenChange={(v) => !v && setShowDialog(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSponsor ? 'Edit Sponsor' : 'Tambah Sponsor Baru'}</DialogTitle>
            <DialogDescription>
              {editingSponsor ? 'Ubah informasi sponsor' : 'Isi data sponsor yang ingin ditambahkan'}
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
              <Label htmlFor="sp-name">Nama Sponsor *</Label>
              <Input
                id="sp-name"
                placeholder="Nama sponsor"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <p className="text-[11px] text-muted-foreground">Format: JPG, PNG, GIF, WebP, SVG. Maksimal 2 MB.</p>
              {form.logoUrl ? (
                <div className="relative group rounded-xl overflow-hidden border bg-muted">
                  <div className="aspect-[4/3] flex items-center justify-center p-4">
                    <img
                      src={form.logoUrl}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = 'none';
                        const parent = el.parentElement!;
                        if (!parent.querySelector('.img-fallback-text')) {
                          const span = document.createElement('span');
                          span.className = 'img-fallback-text text-sm text-muted-foreground';
                          span.textContent = 'Logo tidak dapat dimuat. Coba upload ulang.';
                          parent.appendChild(span);
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, logoUrl: '' }))}
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
                        <p className="text-sm font-medium text-foreground">Klik untuk upload logo</p>
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

            <div className="space-y-2">
              <Label htmlFor="sp-order">Urutan</Label>
              <Input
                id="sp-order"
                type="number"
                min="0"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sp-active">Aktif</Label>
              <Switch
                id="sp-active"
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
                {editingSponsor ? 'Simpan Perubahan' : 'Tambah Sponsor'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Sponsor Dialog */}
      <AlertDialog open={!!deletingSponsor} onOpenChange={(v) => !v && setDeletingSponsor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Sponsor?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus sponsor &ldquo;{deletingSponsor?.name}&rdquo;? Tindakan ini tidak dapat dibatalkan.
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
