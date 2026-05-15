'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, BookOpen, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavStore } from '@/store/nav-store';
import type { Article } from '@/lib/types';

// Static fallback articles
const staticArticles: Article[] = [
  {
    id: '1',
    title: 'Tips Memilih Jasa Cleaning Service yang Tepat',
    slug: 'tips-memilih-jasa-cleaning-service',
    excerpt: 'Memilih jasa cleaning service yang tepat bisa menjadi tantangan. Simak tips berikut agar Anda tidak salah pilih.',
    content: '',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=500&fit=crop',
    category: 'Jasa Kebersihan',
    author: 'Tim Mitra Jasa Pro',
    authorAvatar: '',
    readTime: 5,
    createdAt: '2024-06-15',
    updatedAt: '2024-06-15',
  },
  {
    id: '2',
    title: 'Panduan Lengkap Renovasi Rumah Minimalis',
    slug: 'panduan-renovasi-rumah-minimalis',
    excerpt: 'Ingin renovasi rumah minimalis? Ketahui langkah-langkah penting mulai dari perencanaan hingga pelaksanaan.',
    content: '',
    imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=500&fit=crop',
    category: 'Perbaikan Rumah',
    author: 'Tim Mitra Jasa Pro',
    authorAvatar: '',
    readTime: 7,
    createdAt: '2024-06-10',
    updatedAt: '2024-06-10',
  },
  {
    id: '3',
    title: 'Strategi Digital Marketing untuk UMKM di 2024',
    slug: 'strategi-digital-marketing-umkm-2024',
    excerpt: 'Pelajari strategi digital marketing terbaru yang efektif untuk mengembangkan bisnis UMKM Anda di tahun 2024.',
    content: '',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
    category: 'Digital Marketing',
    author: 'Tim Mitra Jasa Pro',
    authorAvatar: '',
    readTime: 6,
    createdAt: '2024-06-05',
    updatedAt: '2024-06-05',
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function ArticleSection() {
  const { viewArticle } = useNavStore();
  const [articles, setArticles] = useState<Article[]>(staticArticles);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch('/api/articles?limit=6');
        const data = await res.json();
        if (data.success && data.data?.length > 0) {
          setArticles(data.data);
        }
      } catch {
        // Use static articles as fallback
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Featured article (first) + the rest
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <section id="articles" className="py-16 sm:py-20 bg-section-peach">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block rounded-full bg-dodger/10 px-3 py-1 text-xs font-semibold text-dodger-700 mb-2">
              ARTIKEL
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Tips & Inspirasi
            </h2>
            <p className="mt-1 text-muted-foreground text-sm max-w-lg">
              Baca artikel terbaru seputar jasa, tips kebutuhan rumah, dan inspirasi bisnis
            </p>
          </motion.div>
          <button
            onClick={() => useNavStore.getState().navigate('artikel')}
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-dodger hover:text-dodger-700 transition-colors"
          >
            Semua Artikel
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="aspect-[16/10] bg-muted animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-muted rounded animate-pulse w-1/4" />
                <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-full" />
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 rounded-xl border bg-card p-4">
                  <div className="w-28 h-20 bg-muted rounded-lg animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                    <div className="h-4 bg-muted rounded animate-pulse w-full" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Featured Article */}
            {featured && (
              <motion.div variants={itemVariants}>
                <div className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                  <button onClick={() => viewArticle(featured.id)} className="block w-full text-left">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={featured.imageUrl}
                        alt={featured.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <Badge className="absolute left-4 top-4 bg-dodger text-white border-0 text-xs font-medium gap-1">
                        <Tag className="h-3 w-3" />
                        {featured.category}
                      </Badge>
                    </div>
                  </button>
                  <div className="p-5 sm:p-6 space-y-3">
                    <button onClick={() => viewArticle(featured.id)} className="block w-full text-left">
                      <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug line-clamp-2 group-hover:text-dodger-700 transition-colors">
                        {featured.title}
                      </h3>
                    </button>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={featured.authorAvatar} alt={featured.author} />
                          <AvatarFallback className="bg-dodger/10 text-dodger text-[10px] font-semibold">
                            {getInitials(featured.author)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-muted-foreground">{featured.author}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {featured.readTime} mnt
                        </span>
                        <span>{formatDate(featured.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Article List */}
            <div className="space-y-4">
              {rest.map((article) => (
                <motion.div key={article.id} variants={itemVariants}>
                  <button onClick={() => viewArticle(article.id)} className="group block w-full text-left">
                    <div className="flex gap-4 rounded-xl border bg-card p-4 hover:shadow-md hover:border-dodger/20 transition-all duration-200">
                      {/* Thumbnail */}
                      <div className="relative w-24 sm:w-28 h-20 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 mb-1.5 text-dodger-700 border-dodger/20">
                            {article.category}
                          </Badge>
                          <h4 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-dodger-700 transition-colors leading-snug">
                            {article.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1.5">
                          <span>{article.author}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {article.readTime} mnt
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}

              {/* Read More CTA inside the list area */}
              <motion.div variants={itemVariants} className="pt-2">
                <Button
                  variant="outline"
                  className="w-full gap-2 border-dodger/20 text-dodger-700 hover:bg-dodger hover:text-white hover:border-dodger transition-colors"
                  onClick={() => useNavStore.getState().navigate('artikel')}
                >
                  <BookOpen className="h-4 w-4" />
                  Baca Semua Artikel
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Mobile View All Link */}
        {!loading && (
          <div className="mt-6 text-center lg:hidden">
            <Button variant="outline" onClick={() => useNavStore.getState().navigate('artikel')} className="w-full">
              Semua Artikel
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
