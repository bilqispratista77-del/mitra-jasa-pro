'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, FileText, Award, Image as ImageIcon, Plus,
  Pencil, Trash2, Search, Loader2, AlertCircle, CheckCircle,
  XCircle, UserCircle, Briefcase, Clock, Calendar, X,
  Eye, EyeOff, ToggleLeft, ToggleRight, Home, Upload, Crown,
  Phone, MessageCircle, TrendingUp, MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useAuthStore } from '@/store/auth-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavStore } from '@/store/nav-store';

// ---- Types ----
interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  avatar: string;
  role: string;
  active: boolean;
  verified: boolean;
  membershipPlan: string;
  membershipExpiresAt: string | null;
  createdAt: string;
  serviceCount: number;
}

interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  author: string;
  authorAvatar: string;
  readTime: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminSponsor {
  id: string;
  name: string;
  logoUrl: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminBanner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminService {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  location: string;
  whatsapp: string;
  approved: boolean;
  featured: boolean;
  rating: number;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

// ---- Helper: slug generator ----
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ---- Helper: get initials ----
function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

// ---- Fade In Up animation ----
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// ---- Stat Card ----
function AdminStatCard({ icon: Icon, label, value, color, delay }: {
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
      className="rounded-xl border bg-card p-4 sm:p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xl sm:text-2xl font-bold text-foreground truncate">{value}</p>
          <p className="text-[11px] sm:text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ==== SELLERS TAB ====
function SellersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.status === 401 || res.status === 403) {
        setError('Sesi admin telah berakhir. Silakan logout dan login kembali sebagai admin.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.error || 'Gagal memuat data pengguna');
      }
    } catch {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleActive = async (user: AdminUser) => {
    setTogglingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, active: data.data.active } : u))
        );
      }
    } catch { /* ignore */ }
    setTogglingId(null);
  };

  const handleToggleVerified = async (user: AdminUser) => {
    setTogglingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !user.verified }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, verified: data.data.verified } : u))
        );
      }
    } catch { /* ignore */ }
    setTogglingId(null);
  };

  const handleMembershipChange = async (userId: string, newPlan: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipPlan: newPlan }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, membershipPlan: data.data.membershipPlan, membershipExpiresAt: data.data.membershipExpiresAt } : u))
        );
      }
    } catch { /* ignore */ }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      } else {
        alert(data.error || 'Gagal menghapus pengguna');
      }
    } catch {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setDeletingUser(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const totalSellers = users.filter((u) => u.role === 'SELLER').length;
  const activeSellers = users.filter((u) => u.role === 'SELLER' && u.active).length;
  const verifiedSellers = users.filter((u) => u.role === 'SELLER' && u.verified).length;
  const inactiveSellers = users.filter((u) => u.role === 'SELLER' && !u.active).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <AdminStatCard icon={Users} label="Total Seller" value={totalSellers} color="bg-dodger" delay={0} />
          <AdminStatCard icon={CheckCircle} label="Seller Aktif" value={activeSellers} color="bg-green-500" delay={0.05} />
          <AdminStatCard icon={Award} label="Terverifikasi" value={verifiedSellers} color="bg-amber-500" delay={0.1} />
          <AdminStatCard icon={XCircle} label="Nonaktif" value={inactiveSellers} color="bg-rose-500" delay={0.15} />
        </div>
      )}

      {/* Search + Refresh */}
      <div className="flex items-center gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau email..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={fetchUsers} disabled={loading}>
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
            <Skeleton key={i} className="h-16 rounded-lg" />
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
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nama</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Kontak</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">Alamat</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Membership</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Verified</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Jasa</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Terdaftar</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <AnimatePresence>
                    {filteredUsers.map((user) => (
                      <motion.tr
                        key={user.id}
                        {...fadeInUp}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                              ) : null}
                              <AvatarFallback className="text-xs bg-dodger/10 text-dodger">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="space-y-0.5 text-xs text-muted-foreground">
                            {user.phone ? <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{user.phone}</p> : null}
                            {user.whatsapp ? <p className="flex items-center gap-1"><MessageCircle className="h-3 w-3 text-green-600" />{user.whatsapp}</p> : null}
                            {!user.phone && !user.whatsapp && <p className="text-muted-foreground/50">-</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[200px]">{user.address || '-'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {user.role === 'ADMIN' ? (
                            <Badge className="text-xs bg-gray-100 text-gray-700">ADMIN</Badge>
                          ) : (
                            <div className="space-y-1">
                              <Select
                                value={user.membershipPlan || 'FREE'}
                                onValueChange={(v) => handleMembershipChange(user.id, v)}
                              >
                                <SelectTrigger className="w-[110px] h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="FREE">
                                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gray-400" /> FREE</span>
                                  </SelectItem>
                                  <SelectItem value="BASIC">
                                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> BASIC</span>
                                  </SelectItem>
                                  <SelectItem value="PRO">
                                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-500" /> PRO</span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {user.membershipExpiresAt && (
                                <p className="text-[10px] text-muted-foreground">
                                  s/d {new Date(user.membershipExpiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={user.active}
                              disabled={togglingId === user.id || user.role === 'ADMIN'}
                              onCheckedChange={() => handleToggleActive(user)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={user.verified}
                              disabled={togglingId === user.id || user.role === 'ADMIN'}
                              onCheckedChange={() => handleToggleVerified(user)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{user.serviceCount}</td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => setDetailUser(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive h-8 w-8 p-0"
                              disabled={user.role === 'ADMIN'}
                              onClick={() => setDeletingUser(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">
                Tidak ada pengguna ditemukan
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            <AnimatePresence>
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  {...fadeInUp}
                  className="rounded-xl border bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                        ) : null}
                        <AvatarFallback className="text-xs bg-dodger/10 text-dodger">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="text-[10px]">
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {user.role === 'ADMIN' ? (
                      <Badge className="text-[10px] bg-gray-100 text-gray-700">ADMIN</Badge>
                    ) : (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Select
                          value={user.membershipPlan || 'FREE'}
                          onValueChange={(v) => handleMembershipChange(user.id, v)}
                        >
                          <SelectTrigger className="w-[100px] h-7 text-[11px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FREE">
                              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-gray-400" /> FREE</span>
                            </SelectItem>
                            <SelectItem value="BASIC">
                              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> BASIC</span>
                            </SelectItem>
                            <SelectItem value="PRO">
                              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-500" /> PRO</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {user.membershipExpiresAt && (
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            s/d {new Date(user.membershipExpiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-[11px] text-muted-foreground whitespace-nowrap">Status</Label>
                      <Switch
                        checked={user.active}
                        disabled={togglingId === user.id || user.role === 'ADMIN'}
                        onCheckedChange={() => handleToggleActive(user)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-[11px] text-muted-foreground whitespace-nowrap">Verified</Label>
                      <Switch
                        checked={user.verified}
                        disabled={togglingId === user.id || user.role === 'ADMIN'}
                        onCheckedChange={() => handleToggleVerified(user)}
                      />
                    </div>
                    <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      <span>{user.serviceCount} jasa</span>
                    </div>
                  </div>
                  {/* Contact & Date Info */}
                  <div className="space-y-1.5 text-[11px] text-muted-foreground">
                    <div className="grid grid-cols-2 gap-2">
                      {user.phone && (
                        <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{user.phone}</div>
                      )}
                      {user.whatsapp && (
                        <div className="flex items-center gap-1"><MessageCircle className="h-3 w-3 text-green-600" />{user.whatsapp}</div>
                      )}
                      <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    {user.address && (
                      <div className="flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" />{user.address}</div>
                    )}
                  </div>
                  {user.role !== 'ADMIN' && (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => setDetailUser(user)}
                      >
                        <Eye className="h-3 w-3" />
                        Detail
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive h-7 text-xs gap-1"
                        onClick={() => setDeletingUser(user)}
                      >
                        <Trash2 className="h-3 w-3" />
                        Hapus
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredUsers.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Tidak ada pengguna ditemukan
              </div>
            )}
          </div>
        </>
      )}

      {/* Seller Detail Dialog */}
      <Dialog open={!!detailUser} onOpenChange={(v) => !v && setDetailUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Seller</DialogTitle>
            <DialogDescription>Informasi lengkap pengguna</DialogDescription>
          </DialogHeader>
          {detailUser && (
            <div className="space-y-4 pt-2">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  {detailUser.avatar ? (
                    <img src={detailUser.avatar} alt={detailUser.name} className="h-full w-full object-cover" />
                  ) : null}
                  <AvatarFallback className="text-lg bg-dodger/10 text-dodger">
                    {getInitials(detailUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{detailUser.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{detailUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={detailUser.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
                      {detailUser.role}
                    </Badge>
                    <Badge className={`text-xs ${detailUser.membershipPlan === 'FREE' ? 'bg-gray-100 text-gray-700' : detailUser.membershipPlan === 'BASIC' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>
                      {detailUser.membershipPlan}
                    </Badge>
                    <Badge className={`text-xs ${detailUser.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {detailUser.active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                    <Badge className={`text-xs ${detailUser.verified ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {detailUser.verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">No. HP</p>
                  <p className="font-medium text-foreground">{detailUser.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">WhatsApp</p>
                  <p className="font-medium text-foreground">{detailUser.whatsapp || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Alamat</p>
                  <p className="font-medium text-foreground">{detailUser.address || '-'}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">{detailUser.membershipPlan || 'FREE'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Berlaku Hingga</p>
                  <p className="font-medium text-foreground">
                    {detailUser.membershipExpiresAt
                      ? new Date(detailUser.membershipExpiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Total Jasa</p>
                  <p className="font-medium text-foreground">{detailUser.serviceCount} postingan</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Terdaftar</p>
                  <p className="font-medium text-foreground">
                    {new Date(detailUser.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setDetailUser(null)}>
                  Tutup
                </Button>
                {detailUser.role !== 'ADMIN' && (
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => { setDetailUser(null); setDeletingUser(detailUser); }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Hapus
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingUser} onOpenChange={(v) => !v && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengguna &ldquo;{deletingUser?.name}&rdquo;? Semua jasa miliknya juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
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

// ==== SERVICES TAB ====
function ServicesTab() {
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

// ==== ARTICLES TAB ====
function ArticlesTab() {
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

// ==== SPONSORS TAB ====
function SponsorsTab() {
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

// ==== BANNERS TAB ====
function BannersTab() {
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

// ==== MAIN ADMIN PANEL ====
export default function AdminPanel() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { navigate } = useNavStore();

  // Access denied state
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-dodger" />
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-6 mx-auto">
            <Shield className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Akses Ditolak</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Halaman ini hanya dapat diakses oleh administrator. Jika Anda merasa ini adalah kesalahan, silakan hubungi admin.
          </p>
          <Button onClick={() => navigate('beranda')} className="gap-2">
            <Home className="h-4 w-4" />
            Ke Beranda
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Admin Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-dodger text-white"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-white/10 border border-white/20">
                <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Panel Admin</h1>
                <p className="text-dodger-100 text-sm">
                  Selamat datang, <span className="font-medium text-white">{user.name}</span>
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => navigate('beranda')}
            >
              <Home className="h-4 w-4" />
              Ke Beranda
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
      >
        <Tabs defaultValue="sellers" className="w-full">
          <TabsList className="w-full sm:w-auto overflow-x-auto flex">
            <TabsTrigger value="sellers" className="gap-1.5 data-[state=active]:bg-dodger data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Seller</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-1.5 data-[state=active]:bg-dodger data-[state=active]:text-white">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Jasa</span>
              <span className="sm:hidden">Jasa</span>
            </TabsTrigger>
            <TabsTrigger value="articles" className="gap-1.5 data-[state=active]:bg-dodger data-[state=active]:text-white">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Artikel</span>
            </TabsTrigger>
            <TabsTrigger value="sponsors" className="gap-1.5 data-[state=active]:bg-dodger data-[state=active]:text-white">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Sponsor</span>
            </TabsTrigger>
            <TabsTrigger value="banners" className="gap-1.5 data-[state=active]:bg-dodger data-[state=active]:text-white">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Banner</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sellers" className="mt-6">
            <SellersTab />
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <ServicesTab />
          </TabsContent>

          <TabsContent value="articles" className="mt-6">
            <ArticlesTab />
          </TabsContent>

          <TabsContent value="sponsors" className="mt-6">
            <SponsorsTab />
          </TabsContent>

          <TabsContent value="banners" className="mt-6">
            <BannersTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
