'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MessageCircle, Paintbrush, Code, ArrowRight, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavStore } from '@/store/nav-store';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  order: number;
}

const defaultBanners: Banner[] = [
  {
    id: 'default-1',
    title: 'Desain Grafis',
    subtitle: 'Promo Spesial',
    description: 'Dapatkan jasa desain logo, poster, dan branding mulai dari Rp150.000. Buat brand Anda tampil profesional!',
    ctaText: 'Cari Desainer',
    ctaLink: 'category=desain-grafis',
    imageUrl: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800&h=500&fit=crop',
    order: 0,
  },
  {
    id: 'default-2',
    title: 'Website & Aplikasi',
    subtitle: 'Diskon 20%',
    description: 'Jasa pembuatan website, toko online, dan aplikasi mobile oleh developer berpengalaman. Terima jadi!',
    ctaText: 'Lihat Jasa Web',
    ctaLink: 'category=pengembangan-web',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
    order: 1,
  },
  {
    id: 'default-3',
    title: 'Langsung Deal via WhatsApp',
    subtitle: 'Mudah & Cepat',
    description: 'Tidak perlu registrasi panjang. Cari jasa → Klik WhatsApp → Langsung deal dengan seller. Simpel!',
    ctaText: 'Mulai Cari Jasa',
    ctaLink: '',
    imageUrl: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&h=500&fit=crop',
    order: 2,
  },
];

const gradientOptions = [
  'from-dodger-700 via-dodger to-blue-400',
  'from-dodger-800 via-dodger-600 to-dodger-500',
  'from-dodger-dark via-dodger-700 to-dodger-800',
  'from-violet-700 via-purple-500 to-fuchsia-400',
  'from-emerald-700 via-teal-500 to-cyan-400',
  'from-orange-700 via-amber-500 to-yellow-400',
];

const badgeIcons: Record<number, React.ReactNode> = {
  0: <Paintbrush className="h-8 w-8" />,
  1: <Code className="h-8 w-8" />,
  2: <MessageCircle className="h-8 w-8" />,
};

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>(defaultBanners);
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchBanners() {
      try {
        const res = await fetch('/api/banners');
        const data = await res.json();
        if (!cancelled && data.success && data.data?.length > 0) {
          setBanners(data.data);
        }
      } catch {
        // Use default banners
      }
    }
    fetchBanners();
    return () => { cancelled = true; };
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  // Autoplay
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  // Pause on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  if (banners.length === 0) return null;

  const banner = banners[current];
  const gradient = gradientOptions[current % gradientOptions.length];
  const badgeIcon = Object.values(badgeIcons)[current % Object.values(badgeIcons).length] || <Paintbrush className="h-8 w-8" />;

  const handleCtaClick = () => {
    if (!banner.ctaLink) {
      useNavStore.getState().navigate('jasa');
      return;
    }
    if (banner.ctaLink.startsWith('category=')) {
      const catMatch = banner.ctaLink.match(/category=(.*)/);
      useNavStore.getState().navigate('jasa', {
        category: catMatch ? catMatch[1] : undefined,
      });
    } else {
      useNavStore.getState().navigate('jasa');
    }
  };

  return (
    <section
      className="py-8 sm:py-10 bg-white"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl shadow-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className={`relative bg-gradient-to-r ${gradient} min-h-[220px] sm:min-h-[280px] lg:min-h-[320px]`}
            >
              <div className="absolute inset-0 overflow-hidden">
                {banner.imageUrl ? (
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="h-full w-full object-cover opacity-20 mix-blend-overlay"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageOff className="h-16 w-16 text-white/10" />
                  </div>
                )}
                {/* Decorative shapes */}
                <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/5" />
                <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/5" />
                <div className="absolute top-1/2 right-1/4 h-40 w-40 rounded-full bg-white/[0.03]" />
              </div>

              <div className="relative flex items-center min-h-[220px] sm:min-h-[280px] lg:min-h-[320px] px-6 sm:px-10 lg:px-14">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 w-full">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="shrink-0 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm border border-white/10"
                  >
                    {badgeIcon}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {banner.subtitle && (
                        <motion.span
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white border border-white/10"
                        >
                          {banner.subtitle}
                        </motion.span>
                      )}
                    </div>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                      {banner.title}
                    </h3>
                    {banner.description && (
                      <p className="text-white/80 text-sm sm:text-base max-w-lg leading-relaxed line-clamp-2">
                        {banner.description}
                      </p>
                    )}
                    {banner.ctaText && (
                      <div className="pt-1 sm:pt-2">
                        <Button
                          size="lg"
                          className="bg-white text-dodger-700 hover:bg-white/90 font-semibold gap-2 shadow-lg shadow-black/10 rounded-xl h-10 sm:h-11 px-5 sm:px-6 text-sm"
                          onClick={handleCtaClick}
                        >
                          {banner.ctaText}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prev}
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all border border-white/10"
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all border border-white/10"
            aria-label="Slide berikutnya"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {banners.map((_, index) => (
              <button
                key={banner.id + '-' + index}
                onClick={() => goTo(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === current
                    ? 'w-8 h-2.5 bg-white'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <motion.div
              key={current}
              initial={{ width: '0%' }}
              animate={{ width: isAutoPlaying ? '100%' : '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="h-full bg-white/50"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
