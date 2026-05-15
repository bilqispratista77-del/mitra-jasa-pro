'use client';

import Link from 'next/link';
import { Mail, Phone, Instagram, Facebook, Youtube } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useNavStore } from '@/store/nav-store';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { navigate } = useNavStore();

  return (
    <footer className="bg-dodger-900 text-dodger-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <button
              onClick={() => navigate('beranda')}
              className="flex items-center gap-2.5"
            >
              <img
                src="/logo-mjp.png"
                alt="Mitra Jasa Pro"
                className="h-9 w-9 rounded-lg object-cover"
              />
              <span className="text-2xl font-bold text-white">Mitra Jasa Pro</span>
            </button>
            <p className="text-sm text-dodger-200 leading-relaxed">
              Marketplace jasa terpercaya di Indonesia. Temukan dan tawarkan jasa terbaik dengan
              koneksi langsung via WhatsApp.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-dodger-800 text-dodger-200 transition-colors hover:bg-dodger hover:text-white"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-dodger-800 text-dodger-200 transition-colors hover:bg-dodger hover:text-white"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.2V12a4.83 4.83 0 01-3.77-1.54V6.69h3.77z"/></svg>
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-dodger-800 text-dodger-200 transition-colors hover:bg-dodger hover:text-white"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-dodger-800 text-dodger-200 transition-colors hover:bg-dodger hover:text-white"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Tautan Cepat
            </h3>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => navigate('beranda')}
                  className="text-sm text-dodger-200 hover:text-white transition-colors"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('jasa')}
                  className="text-sm text-dodger-200 hover:text-white transition-colors"
                >
                  Cari Jasa
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('artikel')}
                  className="text-sm text-dodger-200 hover:text-white transition-colors"
                >
                  Artikel
                </button>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-dodger-200 hover:text-white transition-colors"
                >
                  Daftar Seller
                </Link>
              </li>
              <li>
                <button
                  onClick={() => navigate('beranda')}
                  className="text-sm text-dodger-200 hover:text-white transition-colors"
                >
                  Cara Kerja
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('beranda')}
                  className="text-sm text-dodger-200 hover:text-white transition-colors"
                >
                  Testimoni
                </button>
              </li>
            </ul>
          </div>

          {/* Kategori */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Kategori
            </h3>
            <ul className="space-y-2.5">
              {[
                'Jasa Kebersihan',
                'Servis Elektronik & Kendaraan',
                'Perbaikan Rumah & Renovasi',
                'Pendidikan',
                'Transportasi',
                'Event & Hiburan',
                'Kecantikan & Kesehatan',
                'Digital Marketing',
              ].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => navigate('jasa')}
                    className="text-sm text-dodger-200 hover:text-white transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Hubungi Kami
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 text-dodger shrink-0" />
                <a
                  href="mailto:admin@mitrajasapro.com"
                  className="text-sm text-dodger-200 hover:text-white transition-colors"
                >
                  admin@mitrajasapro.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 text-dodger shrink-0" />
                <a
                  href="https://wa.me/6282244629110"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-dodger-200 hover:text-white transition-colors"
                >
                  +62 822-4462-9110
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-dodger-800" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-dodger-300">
            &copy; {currentYear} Mitra Jasa Pro. Semua hak dilindungi.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('terms')}
              className="text-xs text-dodger-300 hover:text-white transition-colors"
            >
              Syarat &amp; Ketentuan
            </button>
            <button
              onClick={() => navigate('privacy')}
              className="text-xs text-dodger-300 hover:text-white transition-colors"
            >
              Kebijakan Privasi
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
