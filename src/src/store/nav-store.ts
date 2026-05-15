'use client';

import { create } from 'zustand';

export type PageName = 'beranda' | 'jasa' | 'artikel' | 'service-detail' | 'article-detail' | 'dashboard' | 'admin' | 'terms' | 'privacy';

export interface NavState {
  currentPage: PageName;
  selectedId: string | null;
  searchParams: {
    search?: string;
    location?: string;
    category?: string;
    subCategory?: string;
  };
  selectedLegalPage: 'terms' | 'privacy' | null;
  navigate: (page: PageName, params?: NavState['searchParams']) => void;
  viewService: (serviceId: string) => void;
  viewArticle: (articleId: string) => void;
  goBack: () => void;
  previousPage: PageName;
}

export const useNavStore = create<NavState>((set, get) => ({
  currentPage: 'beranda',
  previousPage: 'beranda',
  selectedId: null,
  selectedLegalPage: null,
  searchParams: {},
  navigate: (page, params) => {
    const current = get().currentPage;
    set({
      previousPage: current,
      currentPage: page,
      selectedId: null,
      selectedLegalPage: (page === 'terms' || page === 'privacy') ? page : null,
      searchParams: params || (page === 'jasa' ? {} : {}),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  viewService: (serviceId) => {
    const current = get().currentPage;
    set({
      previousPage: current,
      currentPage: 'service-detail',
      selectedId: serviceId,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  viewArticle: (articleId) => {
    const current = get().currentPage;
    set({
      previousPage: current,
      currentPage: 'article-detail',
      selectedId: articleId,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  goBack: () => {
    const { previousPage } = get();
    set({
      currentPage: previousPage || 'beranda',
      selectedId: null,
      previousPage: 'beranda',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
}));
