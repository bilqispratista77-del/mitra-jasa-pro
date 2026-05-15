'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, MapPin, Star, MessageCircle,
  ChevronDown, Grid3X3, List, ChevronLeft, ChevronRight, TrendingUp,
  Filter, ArrowUpDown, RotateCcw, Briefcase, User, CheckCircle, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ServiceCard from '@/components/service-card';
import type { Service, Category } from '@/lib/types';
import { formatPrice, getWhatsAppUrl } from '@/lib/types';
import { useNavStore } from '@/store/nav-store';
import { useAuthStore } from '@/store/auth-store';
import { useAuthModal } from '@/components/auth-modal';

const sortOptions = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'rating', label: 'Rating Tertinggi' },
  { value: 'price_low', label: 'Harga Terendah' },
  { value: 'price_high', label: 'Harga Tertinggi' },
];

export default function JasaPage() {
  const { searchParams } = useNavStore();
  const { isAuthenticated, user } = useAuthStore();
  const { openRegisterMember } = useAuthModal();
  const isMember = isAuthenticated && user?.role === 'USER';
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams?.search || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.category || '');
  const [selectedSubCategory, setSelectedSubCategory] = useState(searchParams?.subCategory || '');
  const [location, setLocation] = useState(searchParams?.location || '');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.data || []);
        }
      } catch {
        // Silent fail
      }
    }
    fetchCategories();
  }, []);

  // Fetch services
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedSubCategory) params.set('subCategory', selectedSubCategory);
      if (location) params.set('location', location);
      if (sort) params.set('sort', sort);
      params.set('page', String(page));
      params.set('limit', '12');

      const res = await fetch(`/api/services?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setServices(data.data?.services || []);
        setTotalPages(data.data?.pagination?.totalPages || 1);
        setTotal(data.data?.pagination?.total || 0);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedSubCategory, location, sort, page]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, selectedSubCategory, location, sort]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setLocation('');
    setSort('newest');
    setPage(1);
  };

  const hasActiveFilters = search || selectedCategory || selectedSubCategory || location || sort !== 'newest';

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const selectedCategoryData = categories.find((c) => c.slug === selectedCategory);
  const subCategories = selectedCategoryData?.subCategories || [];

  const FilterContent = () => (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Cari Jasa</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nama jasa, deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Lokasi</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kota, daerah..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-9 h-10"
          />
          {location && (
            <button onClick={() => setLocation('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Kategori</label>
        <Select value={selectedCategory} onValueChange={(val) => {
          setSelectedCategory(val === 'all' ? '' : val);
          setSelectedSubCategory('');
        }}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name} ({cat.serviceCount || cat._count?.services || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sub Category */}
      {subCategories.length > 0 && (
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Sub Kategori</label>
          <Select value={selectedSubCategory} onValueChange={(val) => setSelectedSubCategory(val === 'all' ? '' : val)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Semua Sub Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Sub Kategori</SelectItem>
              {subCategories.map((sub) => (
                <SelectItem key={sub.id} value={sub.slug}>
                  {sub.name} ({sub.serviceCount || sub._count?.services || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Sort */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Urutkan</label>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset Filter
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-dodger/10 px-3 py-1 text-xs font-semibold text-dodger-700 mb-2">
              <Briefcase className="h-3 w-3" />
              SEMUA JASA
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Temukan Jasa Terbaik
            </h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Jelajahi ribuan jasa profesional dari seller terpercaya di seluruh Indonesia
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Bar: Search + Filter Toggle + View Mode */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          {/* Search Bar (Mobile visible, Desktop also) */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari jasa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-white"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort (Desktop) */}
            <div className="hidden sm:block">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-10 w-44 bg-white">
                  <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Button (Mobile Sheet) */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="sm:hidden gap-2 bg-white">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                  {hasActiveFilters && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-dodger text-white text-[10px] font-bold">
                      !
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filter Jasa</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* View Mode */}
            <div className="hidden sm:flex items-center border rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center h-10 w-10 transition-colors ${viewMode === 'grid' ? 'bg-dodger text-white' : 'text-muted-foreground hover:bg-accent'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center h-10 w-10 transition-colors ${viewMode === 'list' ? 'bg-dodger text-white' : 'text-muted-foreground hover:bg-accent'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden sm:block w-64 shrink-0">
            <div className="sticky top-20 bg-white rounded-xl border p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4 text-dodger" />
                  Filter
                </h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-dodger hover:text-dodger-700 font-medium">
                    Reset
                  </button>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Active Filters Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-muted-foreground">{total} jasa ditemukan</span>
                {search && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    &quot;{search}&quot;
                    <button onClick={() => setSearch('')} className="ml-1 rounded-full hover:bg-muted p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategory && selectedCategoryData && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    {selectedCategoryData.name}
                    <button onClick={() => { setSelectedCategory(''); setSelectedSubCategory(''); }} className="ml-1 rounded-full hover:bg-muted p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedSubCategory && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    {subCategories.find(s => s.slug === selectedSubCategory)?.name || selectedSubCategory}
                    <button onClick={() => setSelectedSubCategory('')} className="ml-1 rounded-full hover:bg-muted p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {location && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    <MapPin className="h-3 w-3" />
                    {location}
                    <button onClick={() => setLocation('')} className="ml-1 rounded-full hover:bg-muted p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border bg-white overflow-hidden">
                    <div className={`${viewMode === 'grid' ? 'aspect-[16/10]' : 'h-40'} bg-muted animate-pulse`} />
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-muted rounded animate-pulse w-full" />
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : services.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${search}-${selectedCategory}-${selectedSubCategory}-${location}-${sort}-${page}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}
                  >
                    {services.map((service, index) => {
                      const waUrl = getWhatsAppUrl(service.whatsapp, service.title);
                      const sellerName = service.seller?.name || 'Penjual';
                      const sellerAvatar = service.seller?.avatar || '';
                      const categoryName = service.category?.name || '';
                      const subCategoryName = service.subCategory?.name || '';
                      const rating = service.rating || 0;
                      const reviewCount = service.reviewCount || 0;

                      if (viewMode === 'list') {
                        return (
                          <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <div className="group flex gap-4 rounded-xl border border-gray-100 bg-white p-4 hover:shadow-lg transition-all duration-300">
                              {/* Image */}
                              <div className="relative w-32 sm:w-44 h-28 sm:h-32 rounded-lg overflow-hidden shrink-0">
                                {service.imageUrl ? (
                                  <img
                                    src={service.imageUrl}
                                    alt={service.title}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-dodger/10 to-dodger/5">
                                    <MessageCircle className="h-8 w-8 text-dodger/30" />
                                  </div>
                                )}
                                {service.featured && (
                                  <Badge className="absolute left-2 top-2 bg-amber-500 text-white border-0 text-[10px] font-medium gap-0.5 px-1.5 py-0.5">
                                    <TrendingUp className="h-2.5 w-2.5" />
                                    Top
                                  </Badge>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <Badge className="bg-dodger/10 text-dodger border-0 text-[10px] font-medium px-1.5 py-0">
                                      {subCategoryName || categoryName}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                      <span className="text-xs font-semibold">{rating.toFixed(1)}</span>
                                      <span className="text-[11px] text-gray-400">({reviewCount})</span>
                                    </div>
                                  </div>
                                  <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 group-hover:text-dodger-700 transition-colors">
                                    {service.title}
                                  </h3>

                                  {/* Seller + Verified */}
                                  <div className="flex items-center gap-1.5 mt-1.5">
                                    <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                    <span className="text-xs text-gray-500 truncate">{sellerName}</span>
                                    <span className="inline-flex items-center gap-0.5 shrink-0">
                                      <CheckCircle className="h-3 w-3 text-dodger fill-dodger/10" />
                                      <span className="text-[10px] font-medium text-dodger">Terverifikasi</span>
                                    </span>
                                    {service.location && (
                                      <>
                                        <span className="text-gray-300">·</span>
                                        <span className="text-xs text-gray-500 flex items-center gap-0.5">
                                          <MapPin className="h-3 w-3" />
                                          {service.location}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                  <div>
                                    <span className="text-[11px] text-gray-400">Mulai dari </span>
                                    <span className="text-sm font-bold text-dodger">{formatPrice(service.price)}</span>
                                  </div>
                                  {isMember ? (
                                    <a
                                      href={waUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#20BD5A] hover:shadow-md active:scale-[0.98]"
                                    >
                                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                      </svg>
                                      Order via WhatsApp
                                    </a>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openRegisterMember();
                                      }}
                                      className="flex items-center justify-center gap-1.5 rounded-full bg-gray-400 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-gray-500 hover:shadow-md active:scale-[0.98]"
                                    >
                                      <Lock className="h-3.5 w-3.5" />
                                      Daftar untuk Order
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      }

                      // Grid View
                      return (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <ServiceCard service={service} />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          page === i + 1
                            ? 'bg-dodger text-white shadow-sm'
                            : 'text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dodger/10 mx-auto mb-4">
                  <Search className="h-8 w-8 text-dodger/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Jasa Tidak Ditemukan</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                  Tidak ada jasa yang sesuai dengan filter Anda. Coba ubah kata kunci atau filter pencarian.
                </p>
                <Button variant="outline" onClick={clearFilters} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset Filter
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

