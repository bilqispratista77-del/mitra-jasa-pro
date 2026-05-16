'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Handshake, ShieldCheck, Award, Zap } from 'lucide-react';

interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  order: number;
}

// Static fallback - trusted features instead of "Coming Soon" placeholders
const fallbackSponsors = [
  { id: '1', name: 'Verified Sellers', logoUrl: '', order: 0 },
  { id: '2', name: 'Secure Payments', logoUrl: '', order: 1 },
  { id: '3', name: '24/7 Support', logoUrl: '', order: 2 },
  { id: '4', name: 'Quality Guaranteed', logoUrl: '', order: 3 },
];

const featureIcons = [ShieldCheck, Award, Zap, Handshake];

function SponsorLogo({ sponsor, index }: { sponsor: Sponsor; index: number }) {
  const Icon = featureIcons[index % featureIcons.length];

  if (!sponsor.logoUrl) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <Icon className="h-6 w-6 text-dodger/60" />
        <span className="text-xs sm:text-sm font-bold tracking-tight text-foreground/80 transition-colors duration-300 group-hover:text-dodger-700">
          {sponsor.name}
        </span>
      </div>
    );
  }

  return (
    <img
      src={sponsor.logoUrl}
      alt={sponsor.name}
      className="object-contain max-h-8 max-w-full"
      loading="lazy"
    />
  );
}

export default function SponsorSection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>(fallbackSponsors);

  useEffect(() => {
    let cancelled = false;
    async function fetchSponsors() {
      try {
        const res = await fetch('/api/sponsors');
        const data = await res.json();
        if (!cancelled && data.success && data.data?.length > 0) {
          const validSponsors = data.data.filter((s: Sponsor) => s.logoUrl && s.logoUrl.trim() !== '');
          if (validSponsors.length > 0) {
            setSponsors(validSponsors);
          }
        }
      } catch {
        // Use fallback sponsors
      }
    }
    fetchSponsors();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="py-14 sm:py-20 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-dodger/[0.03] to-transparent rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-amber-200/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-dodger/5 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          {/* Decorative badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-dodger/10 to-amber-100 px-5 py-2 mb-4 border border-dodger/10">
            <Handshake className="h-4 w-4 text-dodger" />
            <span className="text-xs font-semibold text-dodger-700 uppercase tracking-widest">Trusted Partners</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            Dipercaya oleh <span className="text-transparent bg-clip-text bg-gradient-to-r from-dodger to-dodger-600">Mitra Terbaik</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            Bekerja sama dengan berbagai mitra untuk memberikan layanan terbaik bagi Anda
          </p>
        </motion.div>

        {/* Logos Grid with premium frame */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-center max-w-2xl mx-auto"
        >
          {sponsors.map((sponsor, index) => (
            <motion.div
              key={sponsor.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className="group"
            >
              <div className="relative flex h-[88px] sm:h-[96px] items-center justify-center rounded-2xl bg-gradient-to-br from-white via-white to-gray-50/80 p-4 transition-all duration-500 hover:shadow-xl hover:shadow-dodger/5 hover:-translate-y-1 border border-gray-100">
                {/* Gradient border glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-dodger/20 via-amber-200/20 to-dodger/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />
                {/* Top shine line */}
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-dodger/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                {/* Content */}
                <SponsorLogo sponsor={sponsor} index={index} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
