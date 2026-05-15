'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthModal } from '@/components/auth-modal';
import Navbar from '@/components/navbar';
import HeroSection from '@/components/hero-section';
import BannerSlider from '@/components/banner-slider';
import CategorySection from '@/components/category-section';
import HowItWorksSection from '@/components/how-it-works-section';
import WhyChooseUsSection from '@/components/why-choose-us-section';
import TestimonialSection from '@/components/testimonial-section';
import ArticleSection from '@/components/article-section';
import CTASection from '@/components/cta-section';
import SponsorSection from '@/components/sponsor-section';
import Footer from '@/components/footer';
import JasaPage from '@/components/jasa-page';
import ArtikelPage from '@/components/artikel-page';
import ServiceDetail from '@/components/service-detail';
import ArticleDetail from '@/components/article-detail';
import LegalPage from '@/components/legal-page';
import SellerDashboard from '@/components/seller-dashboard';
import AdminPanel from '@/components/admin-panel';
import AuthModal from '@/components/auth-modal';
import ServiceCard from '@/components/service-card';
import { useNavStore } from '@/store/nav-store';
import type { Service } from '@/lib/types';

function PopularServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <ServiceCard service={service} />
    </motion.div>
  );
}

function BerandaPage() {
  const { navigate } = useNavStore();
  const { openRegister } = useAuthModal();
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopularServices() {
      try {
        // Fetch featured services first, then top-rated to fill remaining slots
        const [featuredRes, ratedRes] = await Promise.all([
          fetch('/api/services?featured=true&limit=4'),
          fetch('/api/services?sort=rating&limit=4'),
        ]);

        const [featuredData, ratedData] = await Promise.all([
          featuredRes.json(),
          ratedRes.json(),
        ]);

        const featured: Service[] = featuredData.success ? (featuredData.data?.services || []) : [];
        const rated: Service[] = ratedData.success ? (ratedData.data?.services || []) : [];

        // Combine: featured first, then fill remaining with top-rated (avoid duplicates)
        const featuredIds = new Set(featured.map((s) => s.id));
        const fillers = rated.filter((s) => !featuredIds.has(s.id));
        const combined = [...featured, ...fillers].slice(0, 4);

        setPopularServices(combined);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchPopularServices();
  }, []);

  return (
    <>
      <HeroSection />
      <SponsorSection />
      <BannerSlider />
      <CategorySection />

      {/* Jasa Populer Section */}
      <section id="popular-services" className="py-16 sm:py-20 bg-section-ice">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-8 sm:mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 mb-2">
                <Star className="h-3 w-3" />
                UNGGULAN & POPULER
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Jasa Pilihan
              </h2>
              <p className="mt-1 text-muted-foreground text-sm">
                Jasa unggulan dan rating tertinggi dari seller terpercaya
              </p>
            </motion.div>
            <button
              onClick={() => navigate('jasa')}
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-dodger hover:text-dodger-700 transition-colors"
            >
              Lihat Semua
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Service Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border bg-white overflow-hidden">
                  <div className={`${i === 0 ? 'aspect-[16/10]' : 'aspect-[16/9]'} bg-muted animate-pulse`} />
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-muted rounded animate-pulse w-full" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : popularServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {popularServices.map((service, index) => (
                <PopularServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                Belum ada jasa yang tersedia saat ini.
              </p>
              <Button onClick={openRegister}>Jadi Seller Pertama</Button>
            </div>
          )}

          {/* Mobile View All Link */}
          <div className="mt-6 text-center sm:hidden">
            <Button
              variant="outline"
              onClick={() => navigate('jasa')}
              className="w-full gap-2 border-dodger/20 text-dodger-700 hover:bg-dodger hover:text-white hover:border-dodger transition-colors"
            >
              Lihat Semua Jasa
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <HowItWorksSection />
      <WhyChooseUsSection />
      <TestimonialSection />
      <ArticleSection />
      <CTASection />
    </>
  );
}

export default function Home() {
  const { currentPage, selectedId } = useNavStore();

  // Dashboard has its own full layout (no normal navbar/footer)
  if (currentPage === 'dashboard') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <SellerDashboard />
        </main>
        <AuthModal />
      </div>
    );
  }

  // Admin panel has its own full layout (no footer)
  if (currentPage === 'admin') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <AdminPanel />
        </main>
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {currentPage === 'beranda' && <BerandaPage />}
        {currentPage === 'jasa' && <JasaPage />}
        {currentPage === 'artikel' && <ArtikelPage />}
        {currentPage === 'service-detail' && <ServiceDetail />}
        {currentPage === 'article-detail' && selectedId && <ArticleDetail articleId={selectedId} />}
        {currentPage === 'terms' && <LegalPage type="terms" />}
        {currentPage === 'privacy' && <LegalPage type="privacy" />}
      </main>

      <Footer />
      <AuthModal />
    </div>
  );
}
