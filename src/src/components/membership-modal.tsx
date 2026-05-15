'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Rocket, Check, X, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface MembershipModalProps {
  open: boolean;
  onClose: () => void;
  currentPlan: string;
  currentCount: number;
  maxPostings: number;
}

const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: 'Gratis',
    priceNum: 0,
    postings: 2,
    icon: Zap,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    iconBg: 'bg-gray-200',
    borderColor: 'border-gray-300',
    description: 'Cocok untuk memulai',
    features: [
      { text: '2 Postingan Jasa', included: true },
      { text: 'Upload Gambar', included: true },
      { text: 'WhatsApp Integration', included: true },
      { text: 'Badge Seller', included: false },
      { text: 'Prioritas Tampil', included: false },
    ],
    popular: false,
  },
  {
    id: 'BASIC',
    name: 'Basic',
    price: 'Rp 49.000',
    priceNum: 49000,
    postings: 5,
    icon: Crown,
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    iconBg: 'bg-amber-100',
    borderColor: 'border-amber-400',
    description: 'Paling populer untuk seller',
    features: [
      { text: '5 Postingan Jasa', included: true },
      { text: 'Upload Gambar', included: true },
      { text: 'WhatsApp Integration', included: true },
      { text: 'Badge Seller Premium', included: true },
      { text: 'Prioritas Tampil', included: false },
    ],
    popular: true,
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 'Rp 99.000',
    priceNum: 99000,
    postings: 10,
    icon: Rocket,
    color: 'bg-purple-50 text-purple-800 border-purple-200',
    iconBg: 'bg-purple-100',
    borderColor: 'border-purple-400',
    description: 'Untuk bisnis profesional',
    features: [
      { text: '10 Postingan Jasa', included: true },
      { text: 'Upload Gambar', included: true },
      { text: 'WhatsApp Integration', included: true },
      { text: 'Badge Seller Premium', included: true },
      { text: 'Prioritas Tampil di Halaman Utama', included: true },
    ],
    popular: false,
  },
];

const WHATSAPP_NUMBER = '6282244629110';

function getWhatsAppUpgradeUrl(plan: typeof PLANS[number]) {
  const message = encodeURIComponent(
    `Halo Admin Mitra Jasa Pro! 👋\n\nSaya ingin upgrade ke paket *${plan.name}*\n- *${plan.postings} Postingan Jasa*\n- Harga: *${plan.price}*\n\nMohon informasi cara pembayaran.\n\nTerima kasih! 🙏`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

export default function MembershipModal({
  open,
  onClose,
  currentPlan,
  currentCount,
  maxPostings,
}: MembershipModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-dodger via-dodger-600 to-dodger-700 text-white px-6 py-6 sm:px-8 sm:py-8 rounded-t-lg">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Crown className="h-6 w-6 text-amber-300" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                  Upgrade Membership
                </DialogTitle>
                <DialogDescription className="text-dodger-100 text-sm mt-0.5">
                  Tingkatkan limit postingan jasa Anda
                </DialogDescription>
              </div>
            </div>
            {currentPlan === 'FREE' && (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3">
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold">{currentCount}</p>
                  <p className="text-[11px] text-dodger-100 uppercase tracking-wider">Sudah Dipakai</p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold">{maxPostings}</p>
                  <p className="text-[11px] text-dodger-100 uppercase tracking-wider">Batas Free</p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="text-center flex-1">
                  <p className="text-2xl font-bold text-red-300">Penuh!</p>
                  <p className="text-[11px] text-dodger-100 uppercase tracking-wider">Status</p>
                </div>
              </div>
            )}
          </DialogHeader>
        </div>

        {/* Plans */}
        <div className="p-4 sm:p-6 sm:pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map((plan, index) => {
              const Icon = plan.icon;
              const isCurrent = plan.id === currentPlan;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`relative rounded-2xl border-2 p-5 sm:p-6 flex flex-col transition-all duration-200 ${
                    plan.popular
                      ? 'border-amber-400 shadow-lg shadow-amber-100/50 ring-2 ring-amber-400/20'
                      : isCurrent
                      ? 'border-dodger/40 shadow-md ring-2 ring-dodger/10'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-amber-500 text-white text-[10px] font-bold px-3 py-0.5 shadow-md">
                        POPULER
                      </Badge>
                    </div>
                  )}

                  {/* Plan Icon & Name */}
                  <div className="text-center mb-4">
                    <div
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${plan.iconBg} mb-3`}
                    >
                      <Icon className="h-7 w-7" style={{ color: plan.id === 'FREE' ? '#374151' : plan.id === 'BASIC' ? '#b45309' : '#7c3aed' }} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-5">
                    <p className="text-3xl font-extrabold text-foreground">{plan.price}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan.postings} postingan jasa
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-200 mb-4" />

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-2.5">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-4 w-4 text-gray-300 shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-xs leading-relaxed ${
                            feature.included ? 'text-foreground' : 'text-muted-foreground line-through'
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {isCurrent ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl font-semibold"
                      disabled
                    >
                      Paket Saat Ini
                    </Button>
                  ) : plan.priceNum === 0 ? (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl font-semibold"
                      disabled
                    >
                      Paket Default
                    </Button>
                  ) : (
                    <a
                      href={getWhatsAppUpgradeUrl(plan)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button
                        className={`w-full rounded-xl font-semibold gap-2 transition-all duration-200 ${
                          plan.popular
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg'
                            : 'bg-dodger hover:bg-dodger-700 text-white shadow-md hover:shadow-lg'
                        }`}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Bayar via WhatsApp
                      </Button>
                    </a>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Info Section */}
          <div className="mt-6 rounded-xl bg-gray-50 border p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dodger/10 shrink-0">
                <MessageCircle className="h-4 w-4 text-dodger" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Cara Pembayaran</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Klik tombol <strong>&quot;Bayar via WhatsApp&quot;</strong> pada paket yang Anda inginkan.
                  Anda akan diarahkan ke WhatsApp Admin Mitra Jasa Pro untuk konfirmasi pembayaran.
                  Setelah pembayaran dikonfirmasi, paket akan langsung aktif.
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              Kembali ke Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
