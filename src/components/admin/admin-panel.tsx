'use client';

import { motion } from 'framer-motion';
import {
  Shield, Users, FileText, Award, Image as ImageIcon,
  Home, Briefcase, Loader2, UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/auth-store';
import { useNavStore } from '@/store/nav-store';
import SellersTab from './sellers-tab';
import MembersTab from './members-tab';
import ServicesTab from './services-tab';
import ArticlesTab from './articles-tab';
import SponsorsTab from './sponsors-tab';
import BannersTab from './banners-tab';

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
            <TabsTrigger value="members" className="gap-1.5 data-[state=active]:bg-dodger data-[state=active]:text-white">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Member</span>
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

          <TabsContent value="members" className="mt-6">
            <MembersTab />
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
