'use client';

import { motion } from 'framer-motion';
import { Wallet, MessageCircle, UserCheck, Star } from 'lucide-react';

const advantages = [
  {
    icon: Wallet,
    title: 'Gratis Daftar',
    description: 'Buat akun dan mulai tawarkan jasa Anda tanpa biaya pendaftaran. Tanpa biaya tersembunyi.',
    color: 'bg-dodger',
    lightColor: 'bg-dodger/10',
    textColor: 'text-dodger',
  },
  {
    icon: MessageCircle,
    title: 'Langsung via WhatsApp',
    description: 'Tidak perlu negosiasi panjang. Hubungi seller langsung melalui WhatsApp dan deal lebih cepat.',
    color: 'bg-dodger-dark',
    lightColor: 'bg-dodger-dark/10',
    textColor: 'text-dodger-dark',
  },
  {
    icon: UserCheck,
    title: 'Seller Terverifikasi',
    description: 'Setiap penyedia jasa telah melalui proses verifikasi untuk memastikan kualitas dan keamanan.',
    color: 'bg-emerald-600',
    lightColor: 'bg-emerald-600/10',
    textColor: 'text-emerald-600',
  },
  {
    icon: Star,
    title: 'Ulasan Transparan',
    description: 'Baca ulasan asli dari pelanggan sebelum memilih. Rating dan review 100% jujur dan terbuka.',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-500/10',
    textColor: 'text-amber-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function WhyChooseUsSection() {
  return (
    <section id="why-choose-us" className="py-16 sm:py-20 bg-section-lavender">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block rounded-full bg-dodger/10 px-3 py-1 text-xs font-semibold text-dodger-700 mb-3">
              KEUNGGULAN
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Kenapa Pilih Mitra Jasa Pro?
            </h2>
            <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
              Platform marketplace jasa yang aman, mudah, dan transparan untuk semua orang
            </p>
          </motion.div>
        </div>

        {/* Advantage Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {advantages.map((adv) => (
            <motion.div key={adv.title} variants={itemVariants}>
              <div className="relative h-full rounded-2xl border bg-white p-6 sm:p-7 hover:shadow-lg transition-all duration-300 group overflow-hidden">
                {/* Decorative circle */}
                <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300" style={{ backgroundColor: 'var(--color-dodger)' }} />

                {/* Icon */}
                <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl ${adv.lightColor} ${adv.textColor} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <adv.icon className="h-7 w-7" />
                </div>

                {/* Content */}
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 group-hover:text-dodger-700 transition-colors">
                  {adv.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {adv.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
