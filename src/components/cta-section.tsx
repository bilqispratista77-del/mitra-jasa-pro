'use client';

import { motion } from 'framer-motion';
import { Search, Mail, CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavStore } from '@/store/nav-store';
import { useAuthModal } from '@/components/auth-modal';

export default function CTASection() {
  const { navigate } = useNavStore();
  const { openRegisterSeller } = useAuthModal();

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      {/* Green Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dodger via-dodger-dark to-dodger-700" />

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/[0.03]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white mb-6 backdrop-blur-sm border border-white/10">
            <Zap className="h-4 w-4 text-yellow-300" />
            Mulai Sekarang, Gratis!
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-2 leading-tight">
            Sekarang Giliran Anda,
          </h2>

          {/* Subheadline */}
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white/90 mb-4">
            Jasa apa yang Anda butuhkan?
          </p>

          {/* Body Text */}
          <p className="text-base sm:text-lg text-white/80 mb-8 leading-relaxed">
            Temukan ribuan penyedia jasa profesional terverifikasi di kota Anda. Mudah, cepat, dan terpercaya.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Button
              size="lg"
              onClick={() => navigate('jasa')}
              className="w-full sm:w-auto bg-white text-dodger-700 hover:bg-white/90 font-semibold shadow-lg text-base px-8 h-12 rounded-xl"
            >
              <Search className="h-5 w-5 mr-2" />
              Cari Jasa Sekarang
            </Button>
            <Button
              size="lg"
              onClick={openRegisterSeller}
              className="w-full sm:w-auto bg-white/15 border border-white/40 text-white hover:bg-white/25 font-semibold text-base px-8 h-12 rounded-xl backdrop-blur-sm"
            >
              <Mail className="h-5 w-5 mr-2" />
              Daftar sebagai Seller
            </Button>
          </div>

          {/* Trust Items */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/80">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-white/70" />
              <span>Gratis daftar</span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-white/70" />
              <span>Seller terverifikasi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-white/70" />
              <span>Order via WhatsApp</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
