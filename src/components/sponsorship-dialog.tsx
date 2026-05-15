'use client';

import { useState, create } from 'zustand';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, MessageCircle, X, Sparkles } from 'lucide-react';

// ---------------------------------------------------------------------------
// Inline Zustand store
// ---------------------------------------------------------------------------

interface SponsorshipState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const useSponsorshipStore = create<SponsorshipState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export function useSponsorshipDialog() {
  return useSponsorshipStore();
}

export { useSponsorshipStore };

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const benefits = [
  'Logo usaha ditampilkan di halaman beranda website.',
  'Dibuatkan materi promosi profesional untuk kebutuhan branding usaha Anda.',
  'Materi promo ditayangkan pada banner slider website agar lebih mudah dilihat pengunjung.',
  'Jasa atau usaha Anda ditampilkan di halaman beranda website.',
  'Dibuatkan artikel promosi sesuai bidang jasa Anda untuk meningkatkan branding dan optimasi pencarian di Google.',
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SponsorshipDialog() {
  const { isOpen, close } = useSponsorshipStore();

  const waNumber = '6282244629110';
  const waMessage = encodeURIComponent(
    'Halo Admin Mitra Jasa Pro, saya tertarik dengan program sponsorship. Bisa tolong info lebih lanjut?'
  );
  const waUrl = `https://wa.me/${waNumber}?text=${waMessage}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-dodger via-dodger-600 to-dodger-700 px-6 pt-6 pb-8">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />

          <div className="relative z-10">
            <DialogHeader className="text-left space-y-0">
              <DialogTitle className="sr-only">Sponsorship</DialogTitle>
              <DialogDescription className="sr-only">Program sponsorship Mitra Jasa Pro</DialogDescription>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                </div>
                <Badge className="bg-amber-400 text-amber-900 border-0 text-[10px] font-bold tracking-wide">
                  SPONSORSHIP
                </Badge>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                Kesempatan Menjadi Sponsorship Bersama Mitra Jasa Pro
              </h2>
            </DialogHeader>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Intro */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            Mari bergabung menjadi bagian dari sponsor resmi Mitra Jasa Pro dan tingkatkan eksposur bisnis Anda kepada lebih banyak pelanggan potensial.
          </p>

          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Keuntungan yang akan didapatkan:
            </h3>
            <ul className="space-y-2.5">
              {benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 ring-1 ring-emerald-200/60">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  </span>
                  <span className="leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Closing CTA */}
          <p className="text-sm font-medium text-foreground leading-relaxed">
            Bangun kepercayaan pelanggan dan perluas jangkauan bisnis Anda bersama Mitra Jasa Pro.
          </p>

          {/* WA Button */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#20BD5A] hover:shadow-lg active:scale-[0.98]"
          >
            <MessageCircle className="h-5 w-5" />
            Hubungi via WhatsApp
          </a>

          {/* Close text */}
          <button
            onClick={close}
            className="flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
          >
            <X className="h-3 w-3" />
            Tutup
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
