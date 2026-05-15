'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wrench,
  Hammer,
  GraduationCap,
  Car,
  PartyPopper,
  Heart,
  Megaphone,
  Briefcase,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import { useNavStore } from '@/store/nav-store';
import type { Category, SubCategory } from '@/lib/types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  wrench: Wrench,
  hammer: Hammer,
  graduation: GraduationCap,
  car: Car,
  party: PartyPopper,
  heart: Heart,
  megaphone: Megaphone,
  paintbrush: Sparkles,
  code: Briefcase,
  pen: Briefcase,
  video: Briefcase,
  music: Briefcase,
  camera: Briefcase,
  globe: Briefcase,
  default: Briefcase,
};

function getCategoryIcon(iconName: string) {
  const normalizedKey = iconName?.toLowerCase().replace(/[-_\s]/g, '') || '';
  for (const [key, Icon] of Object.entries(iconMap)) {
    if (normalizedKey.includes(key) || key.includes(normalizedKey)) {
      return Icon;
    }
  }
  return iconMap.default;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CategorySection() {
  const [categories, setCategories] = useState<(Category & { serviceCount?: number; subCategories?: (SubCategory & { serviceCount?: number })[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.data || []);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <section id="categories" className="py-16 sm:py-20 bg-section-mint">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block rounded-full bg-dodger/10 px-3 py-1 text-xs font-semibold text-dodger-700 mb-3">
              KATEGORI
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Kategori Jasa Populer
            </h2>
            <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
              Temukan jasa sesuai kebutuhanmu dari berbagai kategori yang tersedia
            </p>
          </motion.div>
        </div>

        {/* Category Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.icon);
              const serviceCount = category.serviceCount || category._count?.services || 0;
              const subCats = category.subCategories || [];
              const isExpanded = expandedCategory === category.id;

              return (
                <motion.div key={category.id} variants={itemVariants}>
                  <div
                    className={`category-card-hover group rounded-xl border bg-card transition-colors overflow-hidden ${
                      isExpanded
                        ? 'border-dodger/30 bg-dodger-50/30'
                        : 'hover:border-dodger/30 hover:bg-dodger-50/50'
                    }`}
                  >
                    {/* Category Header - Clickable */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dodger/10 text-dodger transition-colors group-hover:bg-dodger group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground group-hover:text-dodger-700 truncate">
                          {category.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {serviceCount} jasa · {subCats.length} sub
                        </p>
                      </div>
                      <div className={`shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>

                    {/* Sub-categories */}
                    <AnimatePresence>
                      {isExpanded && subCats.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-3 space-y-0.5">
                            <div className="border-t border-dodger/10 pt-2 mb-2" />
                            {subCats.map((sub) => (
                              <Link
                                key={sub.id}
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  useNavStore.getState().navigate('jasa', {
                                    category: category.slug,
                                    subCategory: sub.slug,
                                  });
                                }}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-dodger-700 hover:bg-dodger/5 transition-colors group/sub"
                              >
                                <ChevronRight className="h-3 w-3 shrink-0 text-dodger/40 group-hover/sub:text-dodger" />
                                <span className="truncate">{sub.name}</span>
                                {sub.serviceCount !== undefined && (
                                  <span className="ml-auto text-[11px] text-muted-foreground/60 shrink-0">
                                    {sub.serviceCount}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* View All Link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => useNavStore.getState().navigate('jasa')}
            className="inline-flex items-center gap-2 text-sm font-medium text-dodger hover:text-dodger-700 transition-colors"
          >
            Lihat Semua Kategori
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
