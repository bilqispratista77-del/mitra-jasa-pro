'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  MapPin,
  User,
  CheckCircle,
  Clock,
  Shield,
  ChevronRight,
  Briefcase,
  Tag,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavStore } from '@/store/nav-store';
import { formatPrice, getWhatsAppUrl } from '@/lib/types';
import type { Service } from '@/lib/types';
import ServiceCard from '@/components/service-card';

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

/* ────────────────────────────────────────────────────────────── */
/*  Inner component that fetches for a single serviceId.
    Using `key={serviceId}` on this component causes a full
    remount when the ID changes, so initial states (loading=true)
    are always correct – no synchronous setState in the effect.  */
/* ────────────────────────────────────────────────────────────── */
function ServiceDetailContent({ serviceId }: { serviceId: string }) {
  const goBack = useNavStore((s) => s.goBack);
  const viewService = useNavStore((s) => s.viewService);

  const [service, setService] = useState<Service | null>(null);
  const [relatedServices, setRelatedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch service detail
  useEffect(() => {
    let cancelled = false;

    fetch(`/api/services/${serviceId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        if (!json.success) throw new Error('Not found');
        setService(json.data);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  // Fetch related services once we have the category
  useEffect(() => {
    if (!service?.category?.slug) return;

    let cancelled = false;
    fetch(`/api/services?category=${service.category.slug}&limit=4`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success && Array.isArray(json.data)) {
          setRelatedServices(
            json.data
              .filter((s: Service) => s.id !== serviceId)
              .slice(0, 4)
          );
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [service?.category?.slug, serviceId]);

  // ─── Loading skeleton ───────────────────────────────────────
  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back + breadcrumb */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="aspect-[16/10] w-full rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-36" />
            <div className="rounded-xl border p-4 space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
          {/* Right */}
          <div className="space-y-4">
            <div className="rounded-xl border p-5 space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-12 w-full rounded-full" />
            </div>
            <Skeleton className="rounded-xl border p-5 h-32" />
            <Skeleton className="rounded-xl border p-5 h-28" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Error / 404 ────────────────────────────────────────────
  if (error || !service) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <svg
              className="h-10 w-10 text-red-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Jasa tidak ditemukan
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Maaf, jasa yang Anda cari tidak tersedia atau sudah dihapus.
          </p>
          <Button
            variant="outline"
            className="mt-6 gap-2"
            onClick={goBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </motion.div>
      </div>
    );
  }

  // ─── Derived data ───────────────────────────────────────────
  const waUrl = getWhatsAppUrl(service.whatsapp, service.title);
  const sellerName = service.seller?.name || 'Penjual';
  const categoryName = service.category?.name || '';
  const subCategoryName = service.subCategory?.name || '';
  const rating = service.rating || 0;
  const reviewCount = service.reviewCount || 0;
  const descriptionParagraphs = service.description
    ? service.description.split(/\n\n+/).filter(Boolean)
    : [];

  // Member since from createdAt
  const memberSince = service.createdAt
    ? new Date(service.createdAt).toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      })
    : '-';

  // Full stars + half star check
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* ── Back button ──────────────────────────────────────── */}
      <motion.div
        custom={0}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-dodger"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>
      </motion.div>

      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <motion.nav
        custom={1}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 sm:text-sm"
        aria-label="Breadcrumb"
      >
        <span
          className="hover:text-dodger cursor-pointer transition-colors"
          onClick={goBack}
        >
          Beranda
        </span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span
          className="hover:text-dodger cursor-pointer transition-colors"
          onClick={goBack}
        >
          Jasa
        </span>
        {categoryName && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span
              className="hover:text-dodger cursor-pointer transition-colors"
              onClick={goBack}
            >
              {categoryName}
            </span>
          </>
        )}
        {service.title && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-none text-gray-600 font-medium">
              {service.title}
            </span>
          </>
        )}
      </motion.nav>

      {/* ── Two-column layout ────────────────────────────────── */}
      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* ===== LEFT COLUMN (2/3) ===== */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service image */}
          <motion.div
            custom={2}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gray-100"
          >
            {service.imageUrl ? (
              <img
                src={service.imageUrl}
                alt={service.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-dodger/10 to-dodger/5">
                <svg
                  className="h-16 w-16 text-dodger/30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            )}
            {/* Badges on image */}
            <div className="absolute left-3 top-3 flex items-center gap-1.5">
              <Badge className="bg-dodger text-white border-0 text-[10px] font-semibold shadow-sm px-2 py-0.5">
                {subCategoryName || categoryName}
              </Badge>
              {service.featured && (
                <Badge className="bg-amber-500 text-white border-0 text-[10px] font-semibold shadow-sm gap-0.5 px-2 py-0.5">
                  Top
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            custom={3}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-xl font-bold text-gray-900 leading-snug sm:text-2xl"
          >
            {service.title}
          </motion.h1>

          {/* Category / SubCategory badges */}
          {(categoryName || subCategoryName) && (
            <motion.div
              custom={4}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-2 flex-wrap"
            >
              {categoryName && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-xs font-medium bg-dodger-50 text-dodger-700 border-dodger-200"
                >
                  <Tag className="h-3 w-3" />
                  {categoryName}
                </Badge>
              )}
              {subCategoryName && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-xs font-medium bg-gray-50 text-gray-600 border-gray-200"
                >
                  <Briefcase className="h-3 w-3" />
                  {subCategoryName}
                </Badge>
              )}
            </motion.div>
          )}

          {/* Rating */}
          <motion.div
            custom={5}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-0.5">
              {/* Full stars */}
              {Array.from({ length: fullStars }).map((_, i) => (
                <Star
                  key={`full-${i}`}
                  className="h-4.5 w-4.5 fill-amber-400 text-amber-400"
                />
              ))}
              {/* Half star */}
              {hasHalf && (
                <div className="relative">
                  <Star className="h-4.5 w-4.5 text-gray-200" />
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                  </div>
                </div>
              )}
              {/* Empty stars */}
              {Array.from({ length: emptyStars }).map((_, i) => (
                <Star
                  key={`empty-${i}`}
                  className="h-4.5 w-4.5 text-gray-200"
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-800">
              {rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400">
              ({reviewCount} ulasan)
            </span>
          </motion.div>

          {/* Seller info card */}
          <motion.div
            custom={6}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <Avatar className="h-12 w-12 border-2 border-dodger-100">
              <AvatarFallback className="bg-dodger-50 text-dodger font-bold text-base">
                {sellerName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 truncate">
                  {sellerName}
                </span>
                <span className="inline-flex items-center gap-0.5 shrink-0">
                  <CheckCircle className="h-3.5 w-3.5 text-dodger fill-dodger/10" />
                  <span className="text-[11px] font-semibold text-dodger">
                    Terverifikasi
                  </span>
                </span>
              </div>
              {service.location && (
                <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{service.location}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            custom={7}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="rounded-xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm"
          >
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Deskripsi Layanan
            </h2>
            <Separator className="mb-4" />
            <div className="space-y-3 text-sm leading-relaxed text-gray-600">
              {descriptionParagraphs.length > 0 ? (
                descriptionParagraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))
              ) : (
                <p>{service.description}</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* ===== RIGHT COLUMN (1/3) - Sticky Sidebar ===== */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Price card */}
            <motion.div
              custom={3}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <p className="text-xs text-gray-400 font-medium">Mulai dari</p>
              <p className="mt-1 text-2xl font-bold text-dodger">
                {formatPrice(service.price)}
              </p>

              <Separator className="my-4" />

              {/* WhatsApp CTA */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#20BD5A] hover:shadow-md active:scale-[0.98]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Hubungi via WhatsApp
              </a>
            </motion.div>

            {/* Seller quick info */}
            <motion.div
              custom={4}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-dodger-100">
                  <AvatarFallback className="bg-dodger-50 text-dodger font-bold text-sm">
                    {sellerName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {sellerName}
                  </p>
                  <span className="inline-flex items-center gap-0.5">
                    <CheckCircle className="h-3 w-3 text-dodger fill-dodger/10" />
                    <span className="text-[11px] font-semibold text-dodger">
                      Terverifikasi
                    </span>
                  </span>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span>Anggota sejak {memberSince}</span>
              </div>
            </motion.div>

            {/* Quick info card */}
            <motion.div
              custom={5}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="space-y-3">
                {service.location && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dodger-50">
                      <MapPin className="h-4 w-4 text-dodger" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400">Lokasi</p>
                      <p className="text-sm font-medium text-gray-700">
                        {service.location}
                      </p>
                    </div>
                  </div>
                )}
                {categoryName && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dodger-50">
                      <Tag className="h-4 w-4 text-dodger" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400">Kategori</p>
                      <p className="text-sm font-medium text-gray-700">
                        {categoryName}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dodger-50">
                    <Star className="h-4 w-4 text-dodger fill-dodger/10" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Rating</p>
                    <p className="text-sm font-medium text-gray-700">
                      {rating.toFixed(1)} dari 5 ({reviewCount} ulasan)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dodger-50">
                    <Shield className="h-4 w-4 text-dodger" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Garansi</p>
                    <p className="text-sm font-medium text-gray-700">
                      Pembayaran aman &amp; terjamin
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Related Services ─────────────────────────────────── */}
      {relatedServices.length > 0 && (
        <motion.section
          custom={9}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mt-14"
        >
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
            Jasa Serupa
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Layanan lain yang mungkin cocok untuk Anda
          </p>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedServices.map((rs) => (
              <div
                key={rs.id}
                onClick={() => viewService(rs.id)}
                className="cursor-pointer"
              >
                <ServiceCard service={rs} />
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*  Exported wrapper – reads selectedId from the nav store and   */
/*  re-mounts the inner component via `key` when it changes.     */
/* ────────────────────────────────────────────────────────────── */
export default function ServiceDetail() {
  const selectedId = useNavStore((s) => s.selectedId);

  if (!selectedId) return null;

  return <ServiceDetailContent key={selectedId} serviceId={selectedId} />;
}
