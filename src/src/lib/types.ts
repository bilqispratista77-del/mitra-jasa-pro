export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  avatar: string;
  role: 'SELLER' | 'ADMIN';
  membershipPlan: 'FREE' | 'BASIC' | 'PRO';
  membershipExpiresAt: string | null;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  _count?: {
    services: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  subCategories?: SubCategory[];
  _count?: {
    services: number;
  };
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  location: string;
  whatsapp: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  subCategoryId?: string | null;
  category?: Category;
  subCategory?: SubCategory;
  sellerId: string;
  seller?: {
    id: string;
    name: string;
    avatar: string;
    whatsapp: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  author: string;
  authorAvatar: string;
  readTime: number;
  createdAt: string;
  updatedAt: string;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getWhatsAppUrl(whatsapp: string, serviceName: string): string {
  const message = encodeURIComponent(`Halo, saya tertarik dengan jasa ${serviceName}`);
  const cleanNumber = whatsapp.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanNumber}?text=${message}`;
}
