'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Trash2, Search, Loader2, AlertCircle, X,
  UserCircle, Clock, Calendar, Image as ImageIcon, Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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
import type { AdminArticle } from './types';
import { fadeInUp, generateSlug } from './helpers';

export default function ArticlesTab() {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [deletingArticle, setDeletingArticle] = useState<AdminArticle | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: '',
    author: '',
    authorAvatar: '',
    imageUrl: '',
    excerpt: '',
    content: '',
    readTime: '5',
  });
  const [formError, setFormError] = useState('');

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/articles?limit=100');
      const data = await res.json();
      if (data.success) {
        setArticles(data.data);
      } else {
        setError(data.error || 'Gagal memuat artikel');
      }
    } catch {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const openCreateDialog = () => {
    setForm({
      title: '', slug: '', category: '', author: '', authorAvatar: '',
      imageUrl: '', excerpt: '', content: '', readTime: '5',
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

  const handleTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: generateSlug(title) }));
  };

  const handleSubmitArticle = async () => {
    if (!form.title || !form.slug || !form.content) {
      setFormError('Judul, slug, dan konten wajib diisi');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          readTime: parseInt(form.readTime) || 5,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowDialog(false);
        fetchArticles();
      } else {
        setFormError(data.error || 'Gagal menyimpan artikel');
      }
    } catch {
      setFormError('Terjadi kesalahan koneksi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingArticle) return;
    try {
      const res = await fetch(`/api/admin/articles/${deletingArticle.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setArticles((prev) => prev.filter((a) => a.id !== deletingArticle.id));
      } else {
        alert(data.error || 'Gagal menghapus artikel');
      }
    } catch {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setDeletingArticle(null);
    }
  };

  const filteredArticles = articles.filter(
    (a) => a.title.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari artikel..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button className="gap-2 shrink-0" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Tambah Artikel
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  {...fadeInUp}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/9] bg-muted">
                    {article.imageUrl ? (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                    {article.category && (
                      <Badge className="absolute top-2 left-2 bg-dodger text-white text-[10px] px-2 py-0.5">
                        {article.category}
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-2">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <UserCircle className="h-3 w-3" />
                        {article.author || 'Anonim'}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.readTime} mnt
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(article.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                        onClick={() => setDeletingArticle(article)}
                      >
                        <Trash2 className="h-3 w-3" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredArticles.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Tidak ada artikel ditemukan
            </div>
          )}
        </>
      )}

      {/* Create Article Dialog */}
      <Dialog open={showDialog} onOpenChange={(v) => !v && setShowDialog(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Artikel Baru</DialogTitle>
            <DialogDescription>Isi data artikel yang ingin dipublikasikan</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {formError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="art-title">Judul *</Label>
              <Input
                id="art-title"
                placeholder="Judul artikel"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="art-slug">Slug *</Label>
              <Input
                id="art-slug"
                placeholder="slug-artikel"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="art-cat">Kategori</Label>
                <Input
                  id="art-cat"
                  placeholder="cth: Tips & Trik"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="art-readtime">Waktu Baca (mnt)</Label>
                <Input
                  id="art-readtime"
                  type="number"
                  min="1"
                  value={form.readTime}
                  onChange={(e) => setForm((f) => ({ ...f, readTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="art-author">Penulis</Label>
                <Input
                  id="art-author"
                  placeholder="Nama penulis"
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="art-avatar">URL Avatar Penulis</Label>
                <Input
                  id="art-avatar"
                  placeholder="https://..."
                  value={form.authorAvatar}
                  onChange={(e) => setForm((f) => ({ ...f, authorAvatar: e.target.value }))}
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

            <div className="space-y-2">
              <Label htmlFor="art-excerpt">Ringkasan</Label>
              <Textarea
                id="art-excerpt"
                placeholder="Ringkasan singkat artikel..."
                rows={3}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="art-content">Konten *</Label>
              <Textarea
                id="art-content"
                placeholder="Tulis konten artikel di sini..."
                rows={8}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowDialog(false)} disabled={saving}>
                Batal
              </Button>
              <Button className="flex-1" onClick={handleSubmitArticle} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Publikasikan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Article Dialog */}
      <AlertDialog open={!!deletingArticle} onOpenChange={(v) => !v && setDeletingArticle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Artikel?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus artikel &ldquo;{deletingArticle?.title}&rdquo;? Tindakan ini tidak dapat dibatalkan.
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
