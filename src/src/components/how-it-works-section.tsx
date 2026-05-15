'use client';

import { motion } from 'framer-motion';
import { Search, UserCheck, MessageCircle, Star, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Cari Jasa',
    description: 'Temukan jasa yang sesuai dengan kebutuhanmu dari ribuan pilihan tersedia',
    color: 'bg-dodger',
  },
  {
    number: '02',
    icon: UserCheck,
    title: 'Pilih Penyedia Jasa',
    description: 'Bandingkan rating, ulasan, dan harga untuk memilih penyedia jasa terbaik',
    color: 'bg-dodger-dark',
  },
  {
    number: '03',
    icon: MessageCircle,
    title: 'Order via WhatsApp',
    description: 'Hubungi seller langsung via WhatsApp, sepakati detail dan deal dengan mudah',
    color: 'bg-emerald-600',
  },
  {
    number: '04',
    icon: Star,
    title: 'Beri Ulasan',
    description: 'Bagikan pengalamanmu dan bantu pengguna lain menemukan jasa terbaik',
    color: 'bg-dodger-700',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-section-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block rounded-full bg-dodger/10 px-3 py-1 text-xs font-semibold text-dodger-700 mb-3">
              CARA KERJA
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Mudah & Cepat dalam 4 Langkah
            </h2>
            <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
              Dari pencarian hingga ulasan, semua proses mudah dan transparan
            </p>
          </motion.div>
        </div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative"
        >
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-16 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-dodger/30 via-dodger/50 to-dodger/30" />

          {steps.map((step, index) => (
            <motion.div key={step.number} variants={itemVariants} className="relative">
              <div className="flex flex-col items-center text-center">
                {/* Step Number Circle */}
                <div className="relative z-10 mb-6">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} text-white shadow-lg`}
                  >
                    <step.icon className="h-7 w-7" />
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-dodger shadow border border-dodger/20">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {step.description}
                </p>

                {/* Arrow between steps (Desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-16 z-20">
                    <ArrowRight className="h-6 w-6 text-dodger/40" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
