'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Testimonial } from '@/lib/types';

// Static fallback testimonials - always available, matches actual service categories
const staticTestimonials: Testimonial[] = [
  {
    id: 's1', name: 'Rina Wulandari', role: 'Ibu Rumah Tangga',
    content: 'Saya pakai jasa cleaning service dari Mitra Jasa Pro, hasilnya luar biasa bersih! Tim datang tepat waktu dan sangat profesional. Pasti pakai lagi!',
    avatar: '', rating: 5, createdAt: '2024-01-15',
  },
  {
    id: 's2', name: 'Hendra Wijaya', role: 'Pemilik UMKM',
    content: 'Website toko online saya dibuat sangat profesional oleh seller di Mitra Jasa Pro. Sekarang omzet naik 3x lipat! Terima kasih Mitra Jasa Pro!',
    avatar: '', rating: 5, createdAt: '2024-02-20',
  },
  {
    id: 's3', name: 'Maya Putri', role: 'Wedding Planner',
    content: 'Saya rutin order jasa dekorasi dan makeup dari Mitra Jasa Pro untuk klien saya. Hasilnya selalu memuaskan dan komunikasinya lancar via WhatsApp.',
    avatar: '', rating: 4, createdAt: '2024-03-10',
  },
  {
    id: 's4', name: 'Dimas Pratama', role: 'Mahasiswa',
    content: 'Bimbingan skripsi di Mitra Jasa Pro benar-benar membantu! Dosen pembimbingnya sabar dan kompeten. Skripsi saya lulus dengan nilai A.',
    avatar: '', rating: 5, createdAt: '2024-04-05',
  },
  {
    id: 's5', name: 'Anisa Fitri', role: 'Pemilik Salon',
    content: 'Jasa servis AC dan perbaikan listrik dari Mitra Jasa Pro sangat responsif. AC salon saya sekarang dingin lagi dan harganya sangat wajar.',
    avatar: '', rating: 5, createdAt: '2024-05-12',
  },
  {
    id: 's6', name: 'Rizki Ramadhan', role: 'Driver Online',
    content: 'Rental mobil dari Mitra Jasa Pro sangat membantu saya memulai bisnis driver. Mobil terawat dan pemiliknya sangat kooperatif!',
    avatar: '', rating: 5, createdAt: '2024-06-18',
  },
  {
    id: 's7', name: 'Lina Kusuma', role: 'Pemilik Kos-kosan',
    content: 'Jasa renovasi kamar mandi dari Mitra Jasa Pro hasilnya sangat rapi dan sesuai budget. Tukangnya juga ramah dan cepat kerjanya.',
    avatar: '', rating: 5, createdAt: '2024-07-22',
  },
  {
    id: 's8', name: 'Fajar Nugroho', role: 'Pengusaha Katering',
    content: 'Saya pakai jasa SEO dan social media marketing dari Mitra Jasa Pro. Sekarang pelanggan baru terus bertambah! Investasi terbaik untuk bisnis saya.',
    avatar: '', rating: 4, createdAt: '2024-08-30',
  },
  {
    id: 's9', name: 'Sri Handayani', role: 'Karyawan Swasta',
    content: 'Pijat dan spa home service dari Mitra Jasa Pro itu nyaman banget. Terapisnya profesional dan produknya premium. Cocok buat melepas lepas setelah kerja.',
    avatar: '', rating: 5, createdAt: '2024-09-14',
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="relative rounded-xl border bg-card p-6 hover:shadow-md transition-shadow h-full flex flex-col">
      <Quote className="absolute top-4 right-4 h-8 w-8 text-dodger/10" />
      <div className="flex items-center gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
        &ldquo;{testimonial.content}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-4 border-t">
        <Avatar className="h-10 w-10">
          {testimonial.avatar && (
            <img src={testimonial.avatar} alt={testimonial.name} className="h-full w-full object-cover" />
          )}
          <AvatarFallback className="bg-dodger/10 text-dodger-700 text-sm font-bold">
            {testimonial.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialSection() {
  const isMobile = useIsMobile();
  // Initialize with static data so testimonials always show immediately
  const [testimonials, setTestimonials] = useState<Testimonial[]>(staticTestimonials);
  const [currentPage, setCurrentPage] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch testimonials from API on mount, replace static if available
  useEffect(() => {
    let cancelled = false;
    async function fetchTestimonials() {
      try {
        const res = await fetch('/api/testimonials');
        const data = await res.json();
        if (!cancelled && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setTestimonials(data.data);
        }
      } catch {
        // API failed - static testimonials already displayed
      }
    }
    fetchTestimonials();
    return () => { cancelled = true; };
  }, []);

  const itemsPerPage = isMobile ? 1 : 3;
  const totalPages = Math.max(1, Math.ceil(testimonials.length / itemsPerPage));

  // Clamp current page when totalPages changes (e.g. on resize)
  const safePage = currentPage >= totalPages ? 0 : currentPage;

  const nextSlide = useCallback(() => {
    setCurrentPage((prev) => {
      const tp = Math.max(1, Math.ceil(testimonials.length / (isMobile ? 1 : 3)));
      return (prev + 1) % tp;
    });
  }, [testimonials.length, isMobile]);

  const prevSlide = useCallback(() => {
    setCurrentPage((prev) => {
      const tp = Math.max(1, Math.ceil(testimonials.length / (isMobile ? 1 : 3)));
      return (prev - 1 + tp) % tp;
    });
  }, [testimonials.length, isMobile]);

  // Auto-scroll
  useEffect(() => {
    if (testimonials.length === 0) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, testimonials.length]);

  const visibleTestimonials = testimonials.slice(
    safePage * itemsPerPage,
    safePage * itemsPerPage + itemsPerPage
  );

  return (
    <section id="testimonials" className="py-16 sm:py-20 bg-section-pearl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block rounded-full bg-dodger/10 px-3 py-1 text-xs font-semibold text-dodger-700 mb-3">
              TESTIMONI
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Apa Kata Mereka?
            </h2>
            <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
              Dengarkan pengalaman pengguna yang sudah menggunakan Mitra Jasa Pro
            </p>
          </motion.div>
        </div>

        {/* Cards - always rendered since we initialize with static data */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={safePage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {visibleTestimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="h-9 w-9 rounded-full"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === safePage
                      ? 'w-6 bg-dodger'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="h-9 w-9 rounded-full"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
