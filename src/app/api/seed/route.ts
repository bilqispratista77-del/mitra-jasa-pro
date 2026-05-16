import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

// GET /api/seed - Seed the database with initial data
export async function GET() {
  try {
    // Check if data already exists
    const existingCategories = await db.category.count();
    if (existingCategories > 0) {
      return NextResponse.json({
        success: true,
        message: 'Database sudah memiliki data. Skip seeding.',
        data: { categories: existingCategories }
      });
    }

    // Create admin
    await db.user.create({
      data: {
        email: 'admin@mitrajasapro.com',
        password: await hash('admin123', 10),
        name: 'Admin Mitra Jasa Pro',
        phone: '6281234567890',
        whatsapp: '6281234567890',
        role: 'ADMIN',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      },
    });

    // Create sellers
    const sellers = await Promise.all([
      db.user.create({ data: { email: 'budi@email.com', password: await hash('seller123', 10), name: 'Budi Santoso', phone: '628111222333', whatsapp: '628111222333', role: 'SELLER', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=budi' } }),
      db.user.create({ data: { email: 'siti@email.com', password: await hash('seller123', 10), name: 'Siti Rahayu', phone: '628222333444', whatsapp: '628222333444', role: 'SELLER', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=siti' } }),
      db.user.create({ data: { email: 'ahmad@email.com', password: await hash('seller123', 10), name: 'Ahmad Fauzi', phone: '628333444555', whatsapp: '628333444555', role: 'SELLER', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmad' } }),
      db.user.create({ data: { email: 'dewi@email.com', password: await hash('seller123', 10), name: 'Dewi Lestari', phone: '628444555666', whatsapp: '628444555666', role: 'SELLER', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dewi' } }),
      db.user.create({ data: { email: 'raka@email.com', password: await hash('seller123', 10), name: 'Raka Pratama', phone: '628555666777', whatsapp: '628555666777', role: 'SELLER', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=raka' } }),
    ]);

    // Categories
    const categoryData = [
      { name: 'Jasa Kebersihan', slug: 'jasa-kebersihan', icon: 'sparkles', subs: ['ART Harian','Cleaning Service','General Cleaning','Cleaning Kantor / Ruko','Cleaning Kos / Apartemen','Cuci Sofa','Cuci Kasur','Cuci Karpet','Cuci Gorden','Laundry','Sedot WC'] },
      { name: 'Servis Elektronik & Kendaraan', slug: 'servis-elektronik-kendaraan', icon: 'wrench', subs: ['Servis AC','Servis Kulkas','Servis Mesin Cuci','Servis Dispenser','Servis TV LED/LCD','Servis Speaker/Audio','Servis Handphone','Servis Laptop','Servis Komputer','Servis Kompor','Bengkel Mobil','Bengkel Motor'] },
      { name: 'Perbaikan Rumah & Renovasi', slug: 'perbaikan-rumah-renovasi', icon: 'hammer', subs: ['Tukang Listrik','Tukang Ledeng / Pipa','Perbaikan Atap Bocor','Perbaikan Pintu & Jendela','Renovasi Rumah','Renovasi Taman','Renovasi Kamar Mandi','Pemasangan Plafon','Pengecatan Rumah','Pemasangan Pagar / Kanopi'] },
      { name: 'Pendidikan', slug: 'pendidikan', icon: 'graduation', subs: ['Les SD','Les SMP','Les SMA','Kursus Bahasa','Kursus Komputer','Kursus Desain Grafis','Bimbingan Skripsi','Bimbingan Masuk PTN/Kedinasan'] },
      { name: 'Transportasi', slug: 'transportasi', icon: 'car', subs: ['Kurir','Ojek Online','Rental Mobil','Rental Motor','Driver Harian','Driver Luar Kota','Servis Kendaraan','Cuci Mobil / Motor','Derek Kendaraan'] },
      { name: 'Event & Hiburan', slug: 'event-hiburan', icon: 'party', subs: ['Wedding Organizer','Event Organizer','Birthday Organizer','Fotografer','Videografer','Drone Shooting','MC / Host','Band / Musik','Badut','Dekorasi','Sewa Sound System','Sewa Tenda & Kursi','Outbound'] },
      { name: 'Kecantikan & Kesehatan', slug: 'kecantikan-kesehatan', icon: 'heart', subs: ['Makeup Artist (MUA)','Hair Styling','Nail Art','Facial','Spa','Pijat / Massage','Personal Trainer','Yoga Instructor','Terapis Kesehatan'] },
      { name: 'Digital Marketing', slug: 'digital-marketing', icon: 'megaphone', subs: ['Pembuatan Web','SEO','Social Media Marketing','Periklanan Digital','Content Marketing'] },
    ];

    const cats: { id: string; subs: { id: string }[] }[] = [];
    for (const cat of categoryData) {
      const created = await db.category.create({ data: { name: cat.name, slug: cat.slug, icon: cat.icon } });
      const subList = [];
      for (const subName of cat.subs) {
        const sub = await db.subCategory.create({ data: { name: subName, slug: slugify(subName), categoryId: created.id } });
        subList.push({ id: sub.id });
      }
      cats.push({ id: created.id, subs: subList });
    }

    // Services
    const services = [
      { t:'ART Harian Profesional', d:'Asisten rumah tangga harian berpengalaman untuk membantu pekerjaan rumah seperti memasak, membersihkan, dan mencuci.', p:150000, img:'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop', loc:'Jakarta', wa:'628111222333', r:4.8, rc:95, f:true, ci:0, si:0, sel:0 },
      { t:'Cleaning Service Kantor', d:'Layanan cleaning service profesional untuk kantor dan ruko. Tim terlatih dengan peralatan lengkap.', p:250000, img:'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop', loc:'Bandung', wa:'628111222333', r:4.7, rc:67, f:false, ci:0, si:3, sel:0 },
      { t:'General Cleaning Rumah', d:'Jasa bersih-bersih rumah menyeluruh dari lantai hingga plafon. Cocok untuk rumah yang sudah lama tidak dibersihkan.', p:350000, img:'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&h=400&fit=crop', loc:'Surabaya', wa:'628222333444', r:4.9, rc:112, f:true, ci:0, si:2, sel:1 },
      { t:'Cuci Sofa & Kasur', d:'Jasa cuci sofa dan kasur dengan mesin vacuum extractor profesional. Menghilangkan noda, debu, dan bakteri.', p:200000, img:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop', loc:'Yogyakarta', wa:'628444555666', r:4.6, rc:54, f:false, ci:0, si:5, sel:3 },
      { t:'Sedot WC & Saluran Tersumbat', d:'Jasa sedot WC dan mengatasi saluran air tersumbat dengan peralatan modern. Respon cepat 24 jam.', p:300000, img:'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=400&fit=crop', loc:'Bekasi', wa:'628333444555', r:4.4, rc:29, f:false, ci:0, si:10, sel:2 },
      { t:'Servis AC Rumah & Kantor', d:'Teknisi AC profesional untuk servis, cuci, dan pasang AC semua merk. Garansi kerja dan harga transparan.', p:150000, img:'https://images.unsplash.com/photo-1631567091046-7dbe4d6b1b47?w=600&h=400&fit=crop', loc:'Jakarta', wa:'628333444555', r:4.8, rc:143, f:true, ci:1, si:0, sel:2 },
      { t:'Servis Laptop & Komputer', d:'Perbaikan laptop dan komputer: install ulang, ganti LCD, upgrade RAM/SSD, virus removal.', p:150000, img:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop', loc:'Surabaya', wa:'628555666777', r:4.9, rc:201, f:true, ci:1, si:7, sel:4 },
      { t:'Bengkel Mobil Terpercaya', d:'Bengkel mobil lengkap: servis rutin, tune-up, ganti oli, perbaikan mesin dan AC mobil.', p:300000, img:'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop', loc:'Jakarta', wa:'628111222333', r:4.7, rc:89, f:true, ci:1, si:10, sel:0 },
      { t:'Tukang Listrik Berlisensi', d:'Jasa perbaikan dan pemasangan instalasi listrik rumah & kantor. Teknisi berlisensi dan berpengalaman.', p:200000, img:'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop', loc:'Jakarta', wa:'628111222333', r:4.9, rc:132, f:true, ci:2, si:0, sel:0 },
      { t:'Renovasi Rumah & Kamar Mandi', d:'Jasa renovasi rumah dan kamar mandi dari perencanaan hingga selesai. Desain modern.', p:5000000, img:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop', loc:'Jakarta', wa:'628555666777', r:4.8, rc:63, f:true, ci:2, si:4, sel:4 },
      { t:'Pengecatan Rumah Profesional', d:'Jasa cat ulang rumah interior dan eksterior. Pengerjaan rapi dengan cat berkualitas.', p:400000, img:'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop', loc:'Yogyakarta', wa:'628444555666', r:4.5, rc:51, f:false, ci:2, si:8, sel:3 },
      { t:'Les Privat SD-SMP Semua Mata Pelajaran', d:'Bimbingan belajar privat untuk siswa SD dan SMP. Guru berpengalaman dan sabar.', p:100000, img:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop', loc:'Jakarta', wa:'628222333444', r:4.8, rc:156, f:true, ci:3, si:0, sel:1 },
      { t:'Les Privat SMA & UTBK', d:'Bimbingan intensif untuk siswa SMA dan persiapan UTBK. Fokus pada soal-soal ujian.', p:150000, img:'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop', loc:'Bandung', wa:'628444555666', r:4.9, rc:98, f:true, ci:3, si:2, sel:3 },
      { t:'Bimbingan Masuk PTN/Kedinasan', d:'Program intensif persiapan masuk PTN dan kedinasan. Try out rutin dan strategi sukses.', p:750000, img:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop', loc:'Jakarta', wa:'628111222333', r:4.8, rc:113, f:true, ci:3, si:7, sel:0 },
      { t:'Rental Mobil & Driver Harian', d:'Sewa mobil dengan atau tanpa driver. Armada terawat, driver profesional.', p:450000, img:'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop', loc:'Bali', wa:'628222333444', r:4.8, rc:89, f:true, ci:4, si:2, sel:1 },
      { t:'Cuci Mobil & Motor Door-to-Door', d:'Jasa cuci mobil dan motor panggilan ke rumah. Hasil bersih mengkilap dengan produk premium.', p:50000, img:'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&h=400&fit=crop', loc:'Jakarta', wa:'628555666777', r:4.5, rc:67, f:false, ci:4, si:7, sel:4 },
      { t:'Wedding Organizer Profesional', d:'Jasa WO pernikahan lengkap dari perencanaan hingga pelaksanaan. Dekorasi, katering, dokumentasi all-in-one.', p:15000000, img:'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop', loc:'Jakarta', wa:'628444555666', r:4.9, rc:167, f:true, ci:5, si:0, sel:3 },
      { t:'Fotografer & Videografer Event', d:'Jasa foto dan video profesional untuk pernikahan, seminar, birthday, dan acara perusahaan.', p:2000000, img:'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=400&fit=crop', loc:'Bandung', wa:'628111222333', r:4.8, rc:94, f:true, ci:5, si:3, sel:0 },
      { t:'Birthday Organizer & Dekorasi', d:'Jasa organizer pesta ulang tahun anak dan dewasa. Termasuk dekorasi balon, badut, dan katering.', p:3000000, img:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop', loc:'Jakarta', wa:'628444555666', r:4.8, rc:73, f:false, ci:5, si:2, sel:3 },
      { t:'Makeup Artist (MUA) Profesional', d:'Jasa makeup profesional untuk wedding, wisuda, pesta, dan photoshoot. Hasil flawless.', p:500000, img:'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop', loc:'Jakarta', wa:'628222333444', r:4.9, rc:187, f:true, ci:6, si:0, sel:1 },
      { t:'Pijat & Massage Terapeutik', d:'Jasa pijat dan massage profesional untuk menghilangkan pegal dan stres. Home service tersedia.', p:200000, img:'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop', loc:'Bandung', wa:'628444555666', r:4.7, rc:95, f:true, ci:6, si:5, sel:3 },
      { t:'Personal Trainer & Yoga', d:'Latihan privat dengan personal trainer dan yoga instructor bersertifikat.', p:250000, img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop', loc:'Surabaya', wa:'628555666777', r:4.8, rc:62, f:false, ci:6, si:6, sel:4 },
      { t:'Pembuatan Website Profesional', d:'Jasa pembuatan website company profile, toko online, dan landing page. Responsif dan SEO-friendly.', p:2500000, img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop', loc:'Jakarta', wa:'628333444555', r:4.9, rc:112, f:true, ci:7, si:0, sel:2 },
      { t:'Social Media Marketing', d:'Pengelolaan akun media sosial: content planning, desain konten, scheduling, dan analytics.', p:1500000, img:'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop', loc:'Surabaya', wa:'628222333444', r:4.8, rc:89, f:true, ci:7, si:2, sel:1 },
    ];

    for (const s of services) {
      await db.service.create({
        data: {
          title: s.t, description: s.d, price: s.p, imageUrl: s.img,
          location: s.loc, whatsapp: s.wa, rating: s.r, reviewCount: s.rc, featured: s.f,
          categoryId: cats[s.ci].id, subCategoryId: cats[s.ci].subs[s.si]?.id, sellerId: sellers[s.sel].id,
        }
      });
    }

    // Testimonials
    const testimonials = [
      { name:'Rina Wulandari', role:'Ibu Rumah Tangga', content:'Saya pakai jasa cleaning service dari Mitra Jasa Pro, hasilnya luar biasa bersih! Pasti pakai lagi!', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=rina', rating:5 },
      { name:'Hendra Wijaya', role:'Pemilik UMKM', content:'Website toko online saya dibuat sangat profesional. Omzet naik 3x lipat!', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=hendra', rating:5 },
      { name:'Maya Putri', role:'Wedding Planner', content:'Rutin order jasa dekorasi dan makeup dari Mitra Jasa Pro. Hasilnya selalu memuaskan!', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=maya', rating:4 },
      { name:'Dimas Pratama', role:'Mahasiswa', content:'Jasa kebersihan rumah dari Mitra Jasa Pro sangat membantu. Harga terjangkau dan hasilnya memuaskan!', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=dimas', rating:5 },
      { name:'Anisa Fitri', role:'Pemilik Salon', content:'Jasa AC dan perbaikan listrik sangat responsif. Harganya sangat wajar!', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=anisa', rating:5 },
      { name:'Rizki Ramadhan', role:'Pengusaha', content:'Servis laptop dari Mitra Jasa Pro cepat dan profesional. Laptop saya kembali normal!', avatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=rizki', rating:5 },
    ];
    for (const t of testimonials) await db.testimonial.create({ data: t });

    // Articles
    const articles = [
      { title:'Tips Memilih Jasa Cleaning Service yang Tepat', slug:'tips-memilih-jasa-cleaning-service', excerpt:'Memilih jasa cleaning service yang tepat bisa menjadi tantangan. Simak tips berikut.', content:'Memilih jasa cleaning service yang tepat bisa menjadi tantangan. Pastikan untuk meminta referensi dan melihat review dari pelanggan sebelumnya.', imageUrl:'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=500&fit=crop', category:'Jasa Kebersihan', author:'Tim Mitra Jasa Pro', authorAvatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=mitrajasapro', readTime:5 },
      { title:'Panduan Lengkap Renovasi Rumah Minimalis', slug:'panduan-renovasi-rumah-minimalis', excerpt:'Ingin renovasi rumah minimalis? Ketahui langkah-langkah pentingnya.', content:'Renovasi rumah minimalis tidak harus mahal. Mulailah dengan menentukan prioritas renovasi dan membuat anggaran detail.', imageUrl:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=500&fit=crop', category:'Perbaikan Rumah', author:'Tim Mitra Jasa Pro', authorAvatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=mitrajasapro', readTime:7 },
      { title:'Strategi Digital Marketing untuk UMKM', slug:'strategi-digital-marketing-umkm', excerpt:'Pelajari strategi digital marketing terbaru untuk mengembangkan bisnis UMKM.', content:'Beberapa strategi yang terbukti efektif: optimasi SEO, media sosial, content marketing, dan periklanan digital.', imageUrl:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop', category:'Digital Marketing', author:'Tim Mitra Jasa Pro', authorAvatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=mitrajasapro', readTime:6 },
      { title:'Cara Merawat AC agar Hemat Listrik', slug:'cara-merawat-ac-hemat-listrik', excerpt:'AC yang tidak dirawat bisa boros listrik. Simak cara merawat AC yang benar.', content:'Perawatan AC yang rutin penting untuk menjaga performa. Bersihkan filter secara berkala dan jadwalkan servis rutin.', imageUrl:'https://images.unsplash.com/photo-1631567091046-7dbe4d6b1b47?w=800&h=500&fit=crop', category:'Servis Elektronik', author:'Tim Mitra Jasa Pro', authorAvatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=mitrajasapro', readTime:4 },
      { title:'Persiapan Pernikahan: Checklist Lengkap', slug:'persiapan-pernikahan-checklist-wo', excerpt:'Bingung mempersiapkan pernikahan? Simak checklist lengkap dari WO profesional.', content:'Mempersiapkan pernikahan membutuhkan perencanaan matang. Mulai dari tanggal, venue, vendor, hingga koordinasi hari H.', imageUrl:'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=500&fit=crop', category:'Event & Hiburan', author:'Tim Mitra Jasa Pro', authorAvatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=mitrajasapro', readTime:8 },
      { title:'Manfaat Les Privat untuk Anak', slug:'manfaat-les-privat-perkembangan-anak', excerpt:'Les privat bisa meningkatkan perkembangan akademik dan kepercayaan diri anak.', content:'Les privat memberikan perhatian individual. Guru bisa menyesuaikan metode dengan gaya belajar anak.', imageUrl:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop', category:'Pendidikan', author:'Tim Mitra Jasa Pro', authorAvatar:'https://api.dicebear.com/7.x/avataaars/svg?seed=mitrajasapro', readTime:5 },
    ];
    for (const a of articles) await db.article.create({ data: a });

    return NextResponse.json({
      success: true,
      message: 'Seed berhasil! Database sudah diisi data awal.',
      data: {
        sellers: sellers.length,
        categories: cats.length,
        services: services.length,
        testimonials: testimonials.length,
        articles: articles.length,
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({
      success: false,
      message: 'Seed gagal',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
