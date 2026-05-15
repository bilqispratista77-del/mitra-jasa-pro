'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  order: number;
}

const fallbackSponsors = [
  { id: '1', name: 'Tokopedia', logoUrl: '', order: 0 },
  { id: '2', name: 'Bukalapak', logoUrl: '', order: 1 },
  { id: '3', name: 'Shopee', logoUrl: '', order: 2 },
  { id: '4', name: 'Gojek', logoUrl: '', order: 3 },
  { id: '5', name: 'Grab', logoUrl: '', order: 4 },
  { id: '6', name: 'Traveloka', logoUrl: '', order: 5 },
  { id: '7', name: 'Dana', logoUrl: '', order: 6 },
  { id: '8', name: 'OVO', logoUrl: '', order: 7 },
];

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  const [imgError, setImgError] = useState(false);

  if (!sponsor.logoUrl || imgError) {
    return (
      <span
        className="text-base sm:text-lg font-bold tracking-tight text-gray-400 transition-colors duration-300 group-hover:text-gray-800"
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        {sponsor.name}
      </span>
    );
  }

  return (
    <img
      src={sponsor.logoUrl}
      alt={sponsor.name}
      className="object-contain max-h-10 max-w-full"
      loading="lazy"
      onError={() => setImgError(true)}
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
          // Only use DB sponsors that have valid logo URLs
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
    <section className="py-12 sm:py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Mitra Kami
          </h2>
        </motion.div>

        {/* Logos Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 sm:gap-8 items-center"
        >
          {sponsors.map((sponsor, index) => (
            <motion.div
              key={sponsor.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className="group flex items-center justify-center"
            >
              <div className="flex h-20 w-full items-center justify-center rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-5 transition-all duration-300 hover:border-gray-200 hover:bg-white hover:shadow-md grayscale opacity-60 hover:grayscale-0 hover:opacity-100">
                <SponsorLogo sponsor={sponsor} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
