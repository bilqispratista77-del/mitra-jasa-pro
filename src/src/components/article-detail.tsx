'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, Calendar, Tag, Share2, BookOpen,
  ChevronRight, User, Facebook, Twitter, MessageCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useNavStore } from '@/store/nav-store';
import type { Article } from '@/lib/types';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function renderContent(content: string) {
  if (!content) return null;

  const blocks = content.split('\n\n');

  return blocks.map((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Check if it's a heading (starts with #)
    if (trimmed.startsWith('# ')) {
      return (
        <h2
          key={index}
          className="text-xl font-bold text-foreground mb-3"
        >
          {trimmed.replace(/^#\s*/, '')}
        </h2>
      );
    }

    // Check if all lines are list items (start with -)
    const lines = trimmed.split('\n');
    const allListItems = lines.every((line) => line.trim().startsWith('-'));

    if (allListItems) {
      return (
        <ul key={index} className="list-disc list-inside mb-4 space-y-1">
          {lines.map((line, i) => (
            <li
              key={i}
              className="text-base sm:text-lg text-foreground/80 leading-relaxed"
            >
              {line.trim().replace(/^-\s*/, '')}
            </li>
          ))}
        </ul>
      );
    }

    // Regular paragraph
    return (
      <p
        key={index}
        className="text-base sm:text-lg text-foreground/80 leading-relaxed mb-4"
      >
        {trimmed}
      </p>
    );
  });
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
          {/* Back button skeleton */}
          <div className="h-4 w-36 bg-muted rounded animate-pulse mb-6" />
          {/* Category badge skeleton */}
          <div className="h-6 w-28 bg-muted rounded-full animate-pulse mb-4" />
          {/* Title skeleton */}
          <div className="space-y-3 mb-6">
            <div className="h-8 bg-muted rounded animate-pulse w-full" />
            <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
          </div>
          {/* Author meta skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-40 bg-muted rounded animate-pulse" />
              <div className="h-3 w-52 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Cover image skeleton */}
        <div className="aspect-[16/10] sm:aspect-[16/8] bg-muted rounded-xl animate-pulse mb-8" />
        {/* Content skeleton */}
        <div className="max-w-3xl mx-auto space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-muted rounded animate-pulse"
              style={{ width: `${85 + Math.random() * 15}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NotFoundState() {
  const goBack = useNavStore((s) => s.goBack);

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md mx-auto px-4"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-dodger/10 mx-auto mb-6">
          <BookOpen className="h-10 w-10 text-dodger/50" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Artikel Tidak Ditemukan
        </h2>
        <p className="text-muted-foreground mb-6">
          Maaf, artikel yang Anda cari tidak tersedia atau telah dihapus.
        </p>
        <Button
          variant="outline"
          onClick={goBack}
          className="gap-2 border-dodger/20 text-dodger-700 hover:bg-dodger hover:text-white hover:border-dodger transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Artikel
        </Button>
      </motion.div>
    </div>
  );
}

interface ArticleDetailProps {
  articleId: string;
}

export default function ArticleDetail({ articleId }: ArticleDetailProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const goBack = useNavStore((s) => s.goBack);
  const viewArticle = useNavStore((s) => s.viewArticle);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch('/api/articles?limit=50');
        const data = await res.json();

        if (data.success && data.data?.length > 0) {
          const articles: Article[] = data.data;
          setAllArticles(articles);
          const found = articles.find((a: Article) => a.id === articleId);
          if (found) {
            setArticle(found);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [articleId]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (notFound || !article) {
    return <NotFoundState />;
  }

  // Related articles: same category, excluding current article, max 3
  const relatedArticles = allArticles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  // Share URLs
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(article.title);
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const whatsappUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Section - White background */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Back Button */}
            <motion.div variants={staggerItem}>
              <button
                onClick={goBack}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-dodger-700 hover:text-dodger transition-colors mb-6 group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                Kembali ke Artikel
              </button>
            </motion.div>

            {/* Category Badge */}
            <motion.div variants={staggerItem}>
              <Badge className="bg-dodger text-white border-0 text-xs font-medium gap-1 mb-4">
                <Tag className="h-3 w-3" />
                {article.category}
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.div variants={staggerItem}>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-snug max-w-3xl mb-6">
                {article.title}
              </h1>
            </motion.div>

            {/* Author & Meta Row */}
            <motion.div
              variants={staggerItem}
              className="flex flex-wrap items-center gap-4"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-dodger/10 text-dodger text-xs font-semibold">
                    {getInitials(article.author)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">
                      {article.author}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(article.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {article.readTime} mnt baca
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Content Area - Subtle gray background */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Cover Image */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative rounded-xl overflow-hidden aspect-[16/10] sm:aspect-[16/8]">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="h-full w-full object-cover"
            />
            {/* Gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        </motion.div>

        <Separator className="mb-8" />

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          {renderContent(article.content)}
        </motion.div>

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-3xl mx-auto mt-10"
        >
          <Separator className="mb-6" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Share2 className="h-4 w-4 text-muted-foreground" />
              Bagikan artikel ini:
            </div>
            <div className="flex items-center gap-2">
              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-90 transition-opacity"
                aria-label="Bagikan ke Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              {/* Twitter / X */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-white hover:opacity-90 transition-opacity"
                aria-label="Bagikan ke Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white hover:opacity-90 transition-opacity"
                aria-label="Bagikan ke WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12"
          >
            <Separator className="mb-8" />
            <div className="mb-6">
              <h3 className="text-xl font-bold text-foreground">
                Artikel Terkait
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Baca juga artikel lainnya dalam kategori {article.category}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedArticles.map((related) => (
                <motion.div
                  key={related.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={() => viewArticle(related.id)}
                    className="group text-left w-full"
                  >
                    <div className="rounded-xl border bg-white overflow-hidden hover:shadow-lg hover:border-dodger/20 transition-all duration-300">
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={related.imageUrl}
                          alt={related.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      {/* Content */}
                      <div className="p-4">
                        <h4 className="text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-dodger-700 transition-colors">
                          {related.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{related.readTime} mnt baca</span>
                          <span className="flex items-center gap-0.5">
                            <Calendar className="h-3 w-3 ml-2" />
                            {formatDate(related.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-3 text-xs font-medium text-dodger-700 group-hover:text-dodger transition-colors">
                          Baca selengkapnya
                          <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom spacer */}
        <div className="h-12" />
      </div>
    </div>
  );
}
