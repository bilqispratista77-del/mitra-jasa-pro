'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Clock, ArrowRight, BookOpen, Tag,
  ChevronLeft, ChevronRight, Filter, RotateCcw, Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Article } from '@/lib/types';
import { useNavStore } from '@/store/nav-store';

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
  {
    id: '4',
    title: 'Cara Memilih Tukang yang Tepat untuk Renovasi',
    slug: 'cara-memilih-tukang-renovasi',
    excerpt: 'Renovasi rumah butuh tukang yang tepat. Berikut panduan memilih tukang terpercaya untuk proyek Anda.',
    content: '',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=500&fit=crop',
    category: 'Perbaikan Rumah',
    author: 'Tim Mitra Jasa Pro',
    authorAvatar: '',
    readTime: 8,
    createdAt: '2024-05-28',
    updatedAt: '2024-05-28',
  },
  {
    id: '5',
    title: 'Pentingnya Servis AC Rutin di Musim Panas',
    slug: 'pentingnya-servis-ac-rutin',
    excerpt: 'Musim panas membuat AC bekerja lebih keras. Ketahui mengapa servis rutin penting untuk performa dan umur AC Anda.',
    content: '',
    imageUrl: 'https://images.unsplash.com/photo-1631567091046-7dbe4d6b1b47?w=800&h=500&fit=crop',
    category: 'Servis Elektronik',
    author: 'Tim Mitra Jasa Pro',
    authorAvatar: '',
    readTime: 4,
    createdAt: '2024-05-20',
    updatedAt: '2024-05-20',
  },
  {
    id: '6',
    title: 'Tips Memilih Makeup Artist untuk Acara Spesial',
    slug: 'tips-memilih-makeup-artist',
    excerpt: 'Acara spesial butuh penampilan sempurna. Simak tips memilih MUA yang tepat untuk hari penting Anda.',
    content: '',
    imageUrl: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=800&h=500&fit=crop',
    category: 'Kecantikan',
    author: 'Tim Mitra Jasa Pro',
    authorAvatar: '',
    readTime: 5,
    createdAt: '2024-05-15',
    updatedAt: '2024-05-15',
  },
];

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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function ArtikelPage() {
  const { viewArticle } = useNavStore();
  const [articles, setArticles] = useState<Article[]>(staticArticles);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 9;

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch('/api/articles?limit=50');
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

  // Get unique categories from articles
  const categories = ['all', ...Array.from(new Set(articles.map((a) => a.category)))];

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    const matchesSearch = !search ||
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / perPage);
  const paginatedArticles = filteredArticles.slice((page - 1) * perPage, page * perPage);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setPage(1);
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const featured = paginatedArticles[0];
  const rest = paginatedArticles.slice(1);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-dodger/10 px-3 py-1 text-xs font-semibold text-dodger-700 mb-2">
              <BookOpen className="h-3 w-3" />
              ARTIKEL
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Tips & Inspirasi
            </h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Baca artikel terbaru seputar jasa, tips kebutuhan rumah, dan inspirasi bisnis
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari artikel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-white"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-dodger text-white shadow-sm'
                    : 'bg-white text-muted-foreground hover:text-foreground hover:bg-accent border'
                }`}
              >
                {cat === 'all' ? 'Semua' : cat}
              </button>
            ))}
          </div>

          {/* Clear Filters */}
          {(search || selectedCategory !== 'all') && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs shrink-0">
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {(search || selectedCategory !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">{filteredArticles.length} artikel ditemukan</span>
            {search && (
              <Badge variant="secondary" className="gap-1 pr-1">
                &quot;{search}&quot;
                <button onClick={() => setSearch('')} className="ml-1 rounded-full hover:bg-muted p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {selectedCategory}
                <button onClick={() => setSelectedCategory('all')} className="ml-1 rounded-full hover:bg-muted p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-white overflow-hidden">
                <div className="aspect-[16/10] bg-muted animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-muted rounded animate-pulse w-1/4" />
                  <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedArticles.length > 0 ? (
          <>
            {/* Featured + Grid Layout */}
            {page === 1 && !search && selectedCategory === 'all' ? (
              <div>
                {/* Featured Article */}
                {featured && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                  >
                    <div onClick={() => viewArticle(featured.id)} className="group relative rounded-2xl border bg-white overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Image */}
                        <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[360px] overflow-hidden">
                          <img
                            src={featured.imageUrl}
                            alt={featured.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-transparent" />
                          <Badge className="absolute left-4 top-4 bg-dodger text-white border-0 text-xs font-medium gap-1">
                            <Tag className="h-3 w-3" />
                            {featured.category}
                          </Badge>
                        </div>

                        {/* Content */}
                        <div className="p-6 sm:p-8 flex flex-col justify-center">
                          <Badge variant="outline" className="w-fit text-dodger-700 border-dodger/20 text-xs mb-3">
                            Artikel Pilihan
                          </Badge>
                          <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug mb-3 group-hover:text-dodger-700 transition-colors">
                            {featured.title}
                          </h2>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                            {featured.excerpt}
                          </p>
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={featured.authorAvatar} alt={featured.author} />
                                <AvatarFallback className="bg-dodger/10 text-dodger text-xs font-semibold">
                                  {getInitials(featured.author)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-foreground">{featured.author}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(featured.createdAt)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {featured.readTime} mnt baca
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              className="gap-2 border-dodger/20 text-dodger-700 hover:bg-dodger hover:text-white hover:border-dodger transition-colors"
                            >
                              Baca
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Rest of Articles Grid */}
                {rest.length > 0 && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {rest.map((article) => (
                      <ArticleCard key={article.id} article={article} getInitials={getInitials} />
                    ))}
                  </motion.div>
                )}
              </div>
            ) : (
              /* Regular Grid (when filtered or page > 1) */
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {paginatedArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} getInitials={getInitials} />
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      page === i + 1
                        ? 'bg-dodger text-white shadow-sm'
                        : 'text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-dodger/10 mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-dodger/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Artikel Tidak Ditemukan</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
              Tidak ada artikel yang sesuai dengan pencarian Anda. Coba ubah kata kunci atau kategori.
            </p>
            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleCard({ article, getInitials }: { article: Article; getInitials: (name: string) => string }) {
  const { viewArticle } = useNavStore();
  return (
    <motion.div variants={itemVariants}>
      <div onClick={() => viewArticle(article.id)} className="group relative h-full rounded-xl border bg-white overflow-hidden hover:shadow-lg hover:border-dodger/20 transition-all duration-300 cursor-pointer">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Badge className="absolute left-3 top-3 bg-dodger text-white border-0 text-[10px] font-medium gap-1">
            <Tag className="h-2.5 w-2.5" />
            {article.category}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-2 leading-snug group-hover:text-dodger-700 transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={article.authorAvatar} alt={article.author} />
                <AvatarFallback className="bg-dodger/10 text-dodger text-[9px] font-semibold">
                  {getInitials(article.author)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-muted-foreground">{article.author}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {article.readTime} mnt
              </span>
              <span className="hidden sm:inline">{formatDate(article.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
