'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck, Users, CheckCircle, XCircle, Search, Loader2,
  AlertCircle, X, Eye, Trash2, Phone, MessageCircle,
  Calendar, MapPin, Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AdminUser } from './types';
import { AdminStatCard, fadeInUp, getInitials } from './helpers';

export default function MembersTab() {
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
        // Only show USER role members
        setUsers(data.data.filter((u: AdminUser) => u.role === 'USER'));
      } else {
        setError(data.error || 'Gagal memuat data member');
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
        alert(data.error || 'Gagal menghapus member');
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
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const totalMembers = users.length;
  const activeMembers = users.filter((u) => u.active).length;
  const verifiedMembers = users.filter((u) => u.verified).length;
  const inactiveMembers = users.filter((u) => !u.active).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <AdminStatCard icon={Users} label="Total Member" value={totalMembers} color="bg-dodger" delay={0} />
          <AdminStatCard icon={CheckCircle} label="Member Aktif" value={activeMembers} color="bg-green-500" delay={0.05} />
          <AdminStatCard icon={UserCheck} label="Terverifikasi" value={verifiedMembers} color="bg-amber-500" delay={0.1} />
          <AdminStatCard icon={XCircle} label="Nonaktif" value={inactiveMembers} color="bg-rose-500" delay={0.15} />
        </div>
      )}

      {/* Search + Refresh */}
      <div className="flex items-center gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, email, atau no. HP..."
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
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Membership</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Verified</th>
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
                              <AvatarFallback className="text-xs bg-green-100 text-green-700">
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
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={user.active}
                              disabled={togglingId === user.id}
                              onCheckedChange={() => handleToggleActive(user)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={user.verified}
                              disabled={togglingId === user.id}
                              onCheckedChange={() => handleToggleVerified(user)}
                            />
                          </div>
                        </td>
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
                {search ? 'Tidak ada member yang cocok dengan pencarian' : 'Belum ada member yang terdaftar'}
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
                        <AvatarFallback className="text-xs bg-green-100 text-green-700">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700">
                      Member
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Crown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
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
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-[11px] text-muted-foreground whitespace-nowrap">Status</Label>
                      <Switch
                        checked={user.active}
                        disabled={togglingId === user.id}
                        onCheckedChange={() => handleToggleActive(user)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-[11px] text-muted-foreground whitespace-nowrap">Verified</Label>
                      <Switch
                        checked={user.verified}
                        disabled={togglingId === user.id}
                        onCheckedChange={() => handleToggleVerified(user)}
                      />
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
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredUsers.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                {search ? 'Tidak ada member yang cocok dengan pencarian' : 'Belum ada member yang terdaftar'}
              </div>
            )}
          </div>
        </>
      )}

      {/* Member Detail Dialog */}
      <Dialog open={!!detailUser} onOpenChange={(v) => !v && setDetailUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Member</DialogTitle>
            <DialogDescription>Informasi lengkap member</DialogDescription>
          </DialogHeader>
          {detailUser && (
            <div className="space-y-4 pt-2">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  {detailUser.avatar ? (
                    <img src={detailUser.avatar} alt={detailUser.name} className="h-full w-full object-cover" />
                  ) : null}
                  <AvatarFallback className="text-lg bg-green-100 text-green-700">
                    {getInitials(detailUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{detailUser.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{detailUser.email}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Member</Badge>
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
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Alamat</p>
                  <p className="font-medium text-foreground">{detailUser.address || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Membership</p>
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
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => { setDetailUser(null); setDeletingUser(detailUser); }}
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingUser} onOpenChange={(v) => !v && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus member &ldquo;{deletingUser?.name}&rdquo;? Tindakan ini tidak dapat dibatalkan.
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
