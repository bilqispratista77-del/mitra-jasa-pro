'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, CheckCircle, TrendingUp, XCircle, Search, Loader2,
  AlertCircle, X, Trash2, Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
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
import type { AdminService } from './types';
import { AdminStatCard, fadeInUp, getInitials } from './helpers';

export default function ServicesTab() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingService, setDeletingService] = useState<AdminService | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/services', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.status === 401 || res.status === 403) {
        setError('Sesi admin telah berakhir.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setServices(data.data);
      } else {
        setError(data.error || 'Gagal memuat data jasa');
      }
    } catch {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleToggleApproved = async (service: AdminService) => {
    setTogglingId(service.id);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: service.id, approved: !service.approved }),
      });
      const data = await res.json();
      if (data.success) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, approved: data.data.approved } : s))
        );
      }
    } catch { /* ignore */ }
    setTogglingId(null);
  };

  const handleToggleFeatured = async (service: AdminService) => {
    setTogglingId(service.id);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: service.id, featured: !service.featured }),
      });
      const data = await res.json();
      if (data.success) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, featured: data.data.featured } : s))
        );
      }
    } catch { /* ignore */ }
    setTogglingId(null);
  };

  const handleDelete = async () => {
    if (!deletingService) return;
    try {
      const res = await fetch(`/api/admin/services?serviceId=${deletingService.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setServices((prev) => prev.filter((s) => s.id !== deletingService.id));
      } else {
        alert(data.error || 'Gagal menghapus jasa');
      }
    } catch {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setDeletingService(null);
    }
  };

  const filteredServices = services.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.seller?.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalServices = services.length;
  const approvedServices = services.filter((s) => s.approved).length;
  const featuredServices = services.filter((s) => s.featured).length;
  const pendingServices = services.filter((s) => !s.approved).length;

  const formatCurrency = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <AdminStatCard icon={Briefcase} label="Total Jasa" value={totalServices} color="bg-dodger" delay={0} />
          <AdminStatCard icon={CheckCircle} label="Disetujui" value={approvedServices} color="bg-green-500" delay={0.05} />
          <AdminStatCard icon={TrendingUp} label="Unggulan" value={featuredServices} color="bg-amber-500" delay={0.1} />
          <AdminStatCard icon={XCircle} label="Menunggu" value={pendingServices} color="bg-rose-500" delay={0.15} />
        </div>
      )}

      {/* Search + Refresh */}
      <div className="flex items-center gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari jasa atau nama seller..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={fetchServices} disabled={loading}>
          <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
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
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Jasa</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Seller</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Harga</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Kategori</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Unggulan</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Disetujui</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Rating</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Tanggal</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <AnimatePresence>
                    {filteredServices.map((service) => (
                      <motion.tr
                        key={service.id}
                        {...fadeInUp}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                              {service.imageUrl ? (
                                <img src={service.imageUrl} alt={service.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex items-center justify-center h-full"><ImageIcon className="h-4 w-4 text-muted-foreground/40" /></div>
                              )}
                            </div>
                            <span className="font-medium text-foreground line-clamp-1 max-w-[200px]">{service.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              {service.seller?.avatar ? (
                                <img src={service.seller.avatar} alt={service.seller.name} className="h-full w-full object-cover" />
                              ) : null}
                              <AvatarFallback className="text-[9px] bg-dodger/10 text-dodger">
                                {getInitials(service.seller?.name || '?')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{service.seller?.name || '-'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(service.price)}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {service.category ? (
                            <Badge variant="outline" className="text-xs">{service.category.name}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={service.featured}
                              disabled={togglingId === service.id}
                              onCheckedChange={() => handleToggleFeatured(service)}
                              className="data-[state=checked]:bg-amber-500"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={service.approved}
                              disabled={togglingId === service.id}
                              onCheckedChange={() => handleToggleApproved(service)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-amber-500">★</span>
                            <span className="text-xs font-medium">{service.rating?.toFixed(1) || '0.0'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell text-xs text-muted-foreground">
                          {formatDate(service.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive h-8 w-8 p-0"
                            onClick={() => setDeletingService(service)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {filteredServices.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">
                Tidak ada jasa ditemukan
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            <AnimatePresence>
              {filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  {...fadeInUp}
                  className="rounded-xl border bg-card p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt={service.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full"><ImageIcon className="h-5 w-5 text-muted-foreground/40" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm line-clamp-1">{service.title}</p>
                      <p className="text-xs text-muted-foreground">{service.seller?.name || '-'}</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{formatCurrency(service.price)}</p>
                    </div>
                    {service.featured && (
                      <Badge className="bg-amber-500 text-white text-[10px] border-0 shrink-0">
                        <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                        Unggulan
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-[11px] text-muted-foreground whitespace-nowrap">Unggulan</Label>
                        <Switch
                          checked={service.featured}
                          disabled={togglingId === service.id}
                          onCheckedChange={() => handleToggleFeatured(service)}
                          className="data-[state=checked]:bg-amber-500"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-[11px] text-muted-foreground whitespace-nowrap">Setujui</Label>
                        <Switch
                          checked={service.approved}
                          disabled={togglingId === service.id}
                          onCheckedChange={() => handleToggleApproved(service)}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive h-7 w-7 p-0"
                      onClick={() => setDeletingService(service)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredServices.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Tidak ada jasa ditemukan
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Dialog */}
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
