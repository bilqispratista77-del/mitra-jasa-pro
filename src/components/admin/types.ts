export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  avatar: string;
  role: string;
  active: boolean;
  verified: boolean;
  membershipPlan: string;
  membershipExpiresAt: string | null;
  createdAt: string;
  serviceCount: number;
}

export interface AdminArticle {
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

export interface AdminSponsor {
  id: string;
  name: string;
  logoUrl: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBanner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminService {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  location: string;
  whatsapp: string;
  approved: boolean;
  featured: boolean;
  rating: number;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}
