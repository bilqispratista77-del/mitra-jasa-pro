'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileText, Scale, Eye, Lock, MessageCircle, Mail, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavStore } from '@/store/nav-store';

interface LegalPageProps {
  type: 'terms' | 'privacy';
}

function SectionTitle({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <motion.h3
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-center gap-2.5 text-lg font-bold text-foreground mt-8 mb-3 first:mt-0"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dodger/10">
        <Icon className="h-4 w-4 text-dodger" />
      </div>
      {children}
    </motion.h3>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="text-sm text-muted-foreground leading-relaxed mb-3"
    >
      {children}
    </motion.p>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="text-sm text-muted-foreground leading-relaxed ml-5 list-disc mb-1.5"
    >
      {children}
    </motion.li>
  );
}

function LastUpdated() {
  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return (
    <p className="text-xs text-muted-foreground/60 mb-6">
      Terakhir diperbarui: {today}
    </p>
  );
}

/* ========== SYARAT & KETENTUAN ========== */
function TermsContent() {
  return (
    <>
      <LastUpdated />

      <SectionTitle icon={FileText}>1. Ketentuan Umum</SectionTitle>
      <Paragraph>
        Dengan mengakses dan menggunakan platform Mitra Jasa Pro, Anda menyetujui dan terikat oleh
        Syarat &amp; Ketentuan ini. Platform ini dikelola oleh PT Mitra Jasa Profesional Indonesia
        dan beroperasi sesuai hukum yang berlaku di Republik Indonesia.
      </Paragraph>
      <ListItem>
        Platform Mitra Jasa Pro adalah marketplace digital yang menghubungkan pencari jasa (pengguna)
        dengan penyedia jasa (seller).
      </ListItem>
      <ListItem>
        Pengguna wajib berusia minimal 17 tahun atau memiliki persetujuan dari wali/orang tua.
      </ListItem>
      <ListItem>
        Pengguna bertanggung jawab penuh atas keakuratan informasi yang diberikan saat mendaftar.
      </ListItem>
      <ListItem>
        Mitra Jasa Pro berhak mengubah Syarat &amp; Ketentuan ini sewaktu-waktu tanpa pemberitahuan
        terlebih dahulu.
      </ListItem>

      <SectionTitle icon={Shield}>2. Pendaftaran &amp; Akun</SectionTitle>
      <Paragraph>
        Setiap pengguna yang ingin mendaftar sebagai seller wajib melengkapi data profil dengan
        benar dan dapat dipertanggungjawabkan.
      </Paragraph>
      <ListItem>
        Pendaftaran dilakukan melalui formulir pendaftaran di platform dan dikonfirmasi melalui
        WhatsApp oleh tim admin.
      </ListItem>
      <ListItem>
        Seller wajib menggunakan data diri asli (nama, email, nomor telepon) yang valid.
      </ListItem>
      <ListItem>
        Satu orang hanya diperbolehkan memiliki satu akun seller aktif.
      </ListItem>
      <ListItem>
        Akun yang tidak aktif selama 6 bulan berturut-turut dapat dinonaktifkan oleh sistem.
      </ListItem>
      <ListItem>
        Pengguna wajib menjaga kerahasiaan akun dan bertanggung jawab atas segala aktivitas yang
        terjadi pada akunnya.
      </ListItem>

      <SectionTitle icon={MessageCircle}>3. Layanan &amp; Transaksi</SectionTitle>
      <Paragraph>
        Seluruh komunikasi dan transaksi antara pengguna dan seller dilakukan secara langsung
        melalui WhatsApp, bukan melalui platform Mitra Jasa Pro.
      </Paragraph>
      <ListItem>
        Mitra Jasa Pro berfungsi sebagai sarana informasi dan penghubung antara pencari jasa dan
        penyedia jasa.
      </ListItem>
      <ListItem>
        Harga, durasi pengerjaan, dan ketentuan transaksi sepenuhnya disepakati antara pengguna
        dan seller.
      </ListItem>
      <ListItem>
        Mitra Jasa Pro tidak bertanggung jawab atas kerugian yang timbul dari transaksi antara
        pengguna dan seller.
      </ListItem>
      <ListItem>
        Pengguna disarankan untuk melakukan verifikasi dan riset mandiri terhadap seller sebelum
        melakukan transaksi.
      </ListItem>

      <SectionTitle icon={Scale}>4. Konten &amp; Postingan Jasa</SectionTitle>
      <Paragraph>
        Seller bertanggung jawab atas seluruh konten yang diposting di platform, termasuk gambar,
        deskripsi, dan informasi harga.
      </Paragraph>
      <ListItem>
        Konten yang diposting harus sesuai dengan jasa yang ditawarkan dan tidak menyesatkan.
      </ListItem>
      <ListItem>
        Dilarang memposting konten yang melanggar hukum, mengandung SARA, pornografi, atau konten
        tidak pantas lainnya.
      </ListItem>
      <ListItem>
        Dilarang menggunakan gambar yang memiliki hak cipta tanpa izin dari pemiliknya.
      </ListItem>
      <ListItem>
        Admin berhak menolak atau menghapus postingan yang melanggar ketentuan tanpa pemberitahuan
        terlebih dahulu.
      </ListItem>

      <SectionTitle icon={AlertTriangle}>5. Sanksi &amp; Pelanggaran</SectionTitle>
      <Paragraph>
        Pelanggaran terhadap Syarat &amp; Ketentuan ini dapat mengakibatkan sanksi berupa
        peringatan, penangguhan, atau penghapusan akun secara permanen.
      </Paragraph>
      <ListItem>
        Peringatan diberikan untuk pelanggaran ringan, seperti informasi profil yang tidak lengkap.
      </ListItem>
      <ListItem>
        Penangguhan akun diberlakukan untuk pelanggaran berat atau berulang, berlaku selama 30 hari.
      </ListItem>
      <ListItem>
        Penghapusan akun permanen dilakukan untuk pelanggaran yang sangat serius, seperti penipuan,
        konten ilegal, atau tindakan yang merugikan pengguna lain.
      </ListItem>
      <ListItem>
        Keputusan admin bersifat final dan tidak dapat diganggu gugat.
      </ListItem>

      <SectionTitle icon={Mail}>6. Membership &amp; Langganan</SectionTitle>
      <Paragraph>
        Mitra Jasa Pro menyediakan beberapa paket membership untuk seller dengan benefit yang
        berbeda-beda.
      </Paragraph>
      <ListItem>
        <strong>FREE</strong>: Maksimal 2 postingan jasa, fitur dasar.
      </ListItem>
      <ListItem>
        <strong>BASIC</strong>: Maksimal 5 postingan jasa, berlaku 1 tahun, Rp49.000/tahun.
      </ListItem>
      <ListItem>
        <strong>PRO</strong>: Maksimal 10 postingan jasa, fitur unggulan, berlaku 1 tahun,
        Rp99.000/tahun.
      </ListItem>
      <ListItem>
        Membership yang telah dibeli tidak dapat dikembalikan (non-refundable).
      </ListItem>
      <ListItem>
        Biaya membership dapat berubah sewaktu-waktu dengan pemberitahuan terlebih dahulu.
      </ListItem>

      <SectionTitle icon={Scale}>7. Pembatasan Tanggung Jawab</SectionTitle>
      <Paragraph>
        Mitra Jasa Pro berupaya menjaga kualitas dan keamanan platform, namun tidak menjamin
        kepuasan dari setiap transaksi.
      </Paragraph>
      <ListItem>
        Platform tidak bertanggung jawab atas kualitas jasa, ketepatan waktu, atau hasil kerja
        seller.
      </ListItem>
      <ListItem>
        Platform tidak bertanggung jawab atas kerugian finansial yang timbul dari transaksi antara
        pengguna dan seller.
      </ListItem>
      <ListItem>
        Platform tidak menjamin ketersediaan layanan 100% setiap saat (dapat terjadi maintenance
        atau gangguan teknis).
      </ListItem>

      <SectionTitle icon={Mail}>8. Hubungi Kami</SectionTitle>
      <Paragraph>
        Jika Anda memiliki pertanyaan terkait Syarat &amp; Ketentuan ini, silakan hubungi kami
        melalui:
      </Paragraph>
      <ListItem>
        Email: <strong>admin@mitrajasapro.com</strong>
      </ListItem>
      <ListItem>
        WhatsApp: <strong>+62 822-4462-9110</strong>
      </ListItem>
    </>
  );
}

/* ========== KEBIJAKAN PRIVASI ========== */
function PrivacyContent() {
  return (
    <>
      <LastUpdated />

      <SectionTitle icon={Lock}>1. Pendahuluan</SectionTitle>
      <Paragraph>
        Mitra Jasa Pro berkomitmen untuk melindungi privasi dan data pribadi pengguna. Kebijakan
        Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan
        melindungi informasi Anda saat menggunakan platform kami.
      </Paragraph>
      <Paragraph>
        Dengan menggunakan platform Mitra Jasa Pro, Anda menyetujui praktik pengumpulan dan
        penggunaan data sesuai dengan Kebijakan Privasi ini, sebagaimana diatur dalam Undang-Undang
        No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP).
      </Paragraph>

      <SectionTitle icon={Eye}>2. Data yang Dikumpulkan</SectionTitle>
      <Paragraph>Kami mengumpulkan beberapa jenis informasi dari pengguna:</Paragraph>
      <ListItem>
        <strong>Data Identitas</strong>: Nama lengkap, alamat email, nomor telepon, dan foto profil.
      </ListItem>
      <ListItem>
        <strong>Data Akun</strong>: Informasi login, role pengguna (buyer/seller/admin), status
        keanggotaan, dan riwayat aktivitas akun.
      </ListItem>
      <ListItem>
        <strong>Data Transaksi</strong>: Riwayat postingan jasa, informasi kategori dan harga yang
        ditampilkan di platform.
      </ListItem>
      <ListItem>
        <strong>Data Teknis</strong>: Alamat IP, jenis browser, perangkat yang digunakan, dan data
        cookies untuk keperluan analitik.
      </ListItem>
      <ListItem>
        <strong>Data Komunikasi</strong>: Pesan atau feedback yang dikirimkan kepada tim kami
        melalui formulir kontak atau WhatsApp.
      </ListItem>

      <SectionTitle icon={Shield}>3. Penggunaan Data</SectionTitle>
      <Paragraph>Data pribadi yang dikumpulkan digunakan untuk:</Paragraph>
      <ListItem>
        Menyediakan, mengoperasikan, dan memelihara layanan platform.
      </ListItem>
      <ListItem>
        Memproses pendaftaran akun dan verifikasi identitas seller.
      </ListItem>
      <ListItem>
        Menampilkan dan mengelola postingan jasa di marketplace.
      </ListItem>
      <ListItem>
        Mengirimkan pemberitahuan terkait akun, membership, atau pembaruan platform.
      </ListItem>
      <ListItem>
        Meningkatkan kualitas layanan dan pengalaman pengguna melalui analitik.
      </ListItem>
      <ListItem>
        Mencegah penipuan, penyalahgunaan, dan aktivitas yang melanggar hukum.
      </ListItem>
      <ListItem>
        Memenuhi kewajiban hukum dan peraturan yang berlaku di Indonesia.
      </ListItem>

      <SectionTitle icon={Lock}>4. Penyimpanan &amp; Keamanan Data</SectionTitle>
      <Paragraph>
        Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi data pribadi
        pengguna.
      </Paragraph>
      <ListItem>
        Data disimpan dalam server yang aman dengan enkripsi dan proteksi akses.
      </ListItem>
      <ListItem>
        Akses terhadap data pribadi pengguna dibatasi hanya untuk tim yang berwenang.
      </ListItem>
      <ListItem>
        Data akun yang telah dinonaktifkan akan disimpan selama 90 hari sebelum dihapus permanen.
      </ListItem>
      <ListItem>
        Kami tidak menyimpan data kartu kredit atau informasi pembayaran — seluruh transaksi
        dilakukan langsung antara pengguna dan seller melalui WhatsApp.
      </ListItem>

      <SectionTitle icon={MessageCircle}>5. Berbagi Data dengan Pihak Ketiga</SectionTitle>
      <Paragraph>
        Mitra Jasa Pro tidak menjual, menyewakan, atau membagikan data pribadi pengguna kepada
        pihak ketiga untuk tujuan komersial.
      </Paragraph>
      <ListItem>
        Data dapat dibagikan kepada penegak hukum jika diwajibkan oleh peraturan yang berlaku.
      </ListItem>
      <ListItem>
        Nomor WhatsApp seller yang ditampilkan di platform hanya ditujukan untuk keperluan
        komunikasi bisnis antara seller dan calon pembeli.
      </ListItem>
      <ListItem>
        Kami dapat menggunakan layanan analitik pihak ketiga (seperti Google Analytics) dengan
        data yang telah dianonimkan.
      </ListItem>

      <SectionTitle icon={Eye}>6. Hak Pengguna atas Data Pribadi</SectionTitle>
      <Paragraph>
        Sesuai dengan UU PDP, pengguna memiliki hak-hak berikut terkait data pribadinya:
      </Paragraph>
      <ListItem>
        <strong>Hak Akses</strong>: Meminta salinan data pribadi yang kami simpan tentang Anda.
      </ListItem>
      <ListItem>
        <strong>Hak Perbaikan</strong>: Meminta perbaikan data pribadi yang tidak akurat atau
        tidak lengkap.
      </ListItem>
      <ListItem>
        <strong>Hak Penghapusan</strong>: Meminta penghapusan data pribadi Anda dari sistem kami
        (dengan pengecualian data yang wajib disimpan oleh hukum).
      </ListItem>
      <ListItem>
        <strong>Hak Pembatasan</strong>: Meminta pembatasan pengolahan data pribadi Anda.
      </ListItem>
      <ListItem>
        <strong>Hak Portabilitas</strong>: Meminta transfer data pribadi Anda ke pihak lain dalam
        format yang dapat dibaca mesin.
      </ListItem>

      <SectionTitle icon={Scale}>7. Cookies</SectionTitle>
      <Paragraph>
        Platform kami menggunakan cookies untuk menyimpan informasi sesi login dan meningkatkan
        pengalaman pengguna.
      </Paragraph>
      <ListItem>
        <strong>Session Cookie</strong>: Digunakan untuk mengautentikasi sesi login pengguna.
        Cookie ini dihapus saat pengguna logout atau sesi berakhir.
      </ListItem>
      <ListItem>
        <strong>Analytics Cookie</strong>: Digunakan untuk memahami bagaimana pengguna berinteraksi
        dengan platform.
      </ListItem>
      <ListItem>
        Pengguna dapat mengatur preferensi cookies melalui pengaturan browser.
      </ListItem>

      <SectionTitle icon={AlertTriangle}>8. Perubahan Kebijakan</SectionTitle>
      <Paragraph>
        Kami berhak mengubah Kebijakan Privasi ini sewaktu-waktu. Perubahan signifikan akan
        diberitahukan melalui platform atau email. Pengguna disarankan untuk meninjau kebijakan
        ini secara berkala.
      </Paragraph>

      <SectionTitle icon={Mail}>9. Hubungi Kami</SectionTitle>
      <Paragraph>
        Untuk pertanyaan, permintaan terkait data pribadi, atau pengaduan privasi, silakan hubungi
        kami:
      </Paragraph>
      <ListItem>
        Email: <strong>admin@mitrajasapro.com</strong>
      </ListItem>
      <ListItem>
        WhatsApp: <strong>+62 822-4462-9110</strong>
      </ListItem>
      <ListItem>
        Permintaan terkait data pribadi akan diproses dalam waktu maksimal 14 hari kerja.
      </ListItem>
    </>
  );
}

/* ========== LEGAL PAGE COMPONENT ========== */
export default function LegalPage({ type }: LegalPageProps) {
  const { goBack } = useNavStore();
  const isTerms = type === 'terms';

  return (
    <section className="py-10 sm:py-16 bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground mb-6"
            onClick={goBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-dodger/10">
              {isTerms ? (
                <Scale className="h-6 w-6 text-dodger" />
              ) : (
                <Lock className="h-6 w-6 text-dodger" />
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {isTerms ? 'Syarat & Ketentuan' : 'Kebijakan Privasi'}
              </h1>
              <p className="text-sm text-muted-foreground">Mitra Jasa Pro</p>
            </div>
          </div>
          <Separator />
        </motion.div>

        {/* Content */}
        <div className="prose-custom">
          {isTerms ? <TermsContent /> : <PrivacyContent />}
        </div>

        {/* Bottom CTA */}
        <Separator className="mt-10 mb-6" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Pertanyaan atau butuh klarifikasi? Hubungi kami langsung.
          </p>
          <Button
            variant="outline"
            className="gap-2 border-dodger/20 text-dodger hover:bg-dodger hover:text-white hover:border-dodger"
            asChild
          >
            <a href="https://wa.me/6282244629110" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              Chat via WhatsApp
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
