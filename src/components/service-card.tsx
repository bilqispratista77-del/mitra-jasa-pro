'use client';

import { Star, MapPin, TrendingUp, User, CheckCircle, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavStore } from '@/store/nav-store';
import { useAuthStore } from '@/store/auth-store';
import { useAuthModal } from '@/components/auth-modal';
import type { Service } from '@/lib/types';
import { formatPrice, getWhatsAppUrl } from '@/lib/types';

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const { viewService } = useNavStore();
  const { isAuthenticated, user } = useAuthStore();
  const { openRegisterMember } = useAuthModal();
  const isMember = isAuthenticated && user?.role === 'USER';
  const waUrl = getWhatsAppUrl(service.whatsapp, service.title);
  const sellerName = service.seller?.name || 'Penjual';
  const categoryName = service.category?.name || '';
  const subCategoryName = service.subCategory?.name || '';
  const rating = service.rating || 0;
  const reviewCount = service.reviewCount || 0;

  return (
    <div onClick={() => viewService(service.id)} className="group relative h-full rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer">
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-dodger/10 to-dodger/5">
            <svg className="h-10 w-10 text-dodger/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        {/* Badges on image */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <Badge className="bg-dodger text-white border-0 text-[10px] font-semibold shadow-sm px-2 py-0.5">
            {subCategoryName || categoryName}
          </Badge>
          {service.featured && (
            <Badge className="bg-amber-500 text-white border-0 text-[10px] font-semibold shadow-sm gap-0.5 px-2 py-0.5">
              <TrendingUp className="h-2.5 w-2.5" />
              Top
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        {/* Title */}
        <h3 className="text-sm sm:text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-dodger-700 transition-colors">
          {service.title}
        </h3>

        {/* Seller + Verified */}
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <span className="text-xs text-gray-500 truncate">{sellerName}</span>
          <span className="inline-flex items-center gap-0.5 shrink-0">
            <CheckCircle className="h-3 w-3 text-dodger fill-dodger/10" />
            <span className="text-[10px] font-medium text-dodger">Terverifikasi</span>
          </span>
        </div>

        {/* Rating & Location */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
            <span className="text-[11px] text-gray-400">({reviewCount})</span>
          </div>
          {service.location && (
            <div className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">{service.location}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="pt-1">
          <span className="text-[11px] text-gray-400">Mulai dari </span>
          <span className="text-sm font-bold text-dodger">{formatPrice(service.price)}</span>
        </div>

        {/* WhatsApp Button */}
        {isMember ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#20BD5A] hover:shadow-md active:scale-[0.98]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Order via WhatsApp
          </a>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openRegisterMember();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-400 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-500 hover:shadow-md active:scale-[0.98]"
          >
            <Lock className="h-4 w-4" />
            Daftar untuk Order
          </button>
        )}
      </div>
    </div>
  );
}
