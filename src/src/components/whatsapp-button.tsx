'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWhatsAppUrl } from '@/lib/types';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps {
  whatsapp: string;
  serviceName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const sizeMap = {
  sm: 'h-8 text-xs px-3',
  md: 'h-9 text-sm px-4',
  lg: 'h-11 text-base px-6',
};

export default function WhatsAppButton({
  whatsapp,
  serviceName,
  className,
  size = 'md',
  fullWidth = false,
}: WhatsAppButtonProps) {
  const waUrl = getWhatsAppUrl(whatsapp, serviceName);

  return (
    <Button
      asChild
      className={cn(
        'bg-dodger hover:bg-dodger-600 text-white font-semibold shadow-md transition-all',
        'hover:wa-pulse',
        sizeMap[size],
        fullWidth && 'w-full',
        className
      )}
    >
      <a href={waUrl} target="_blank" rel="noopener noreferrer">
        <MessageCircle className={cn(size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
        Hubungi via WhatsApp
      </a>
    </Button>
  );
}
