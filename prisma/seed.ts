import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to create slug
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function main() {
  // Clean existing data
  await prisma.article.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.service.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create admin
  const admin = await prisma.user.create({
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
    prisma.user.create({
      data: {
        email: 'budi@email.com',
        password: await hash('seller123', 10),
        name: 'Budi Santoso',
        phone: '628111222333',
        whatsapp: '628111222333',
        role: 'SELLER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=budi',
      },
    }),
    prisma.user.create({
      data: {
        email: 'siti@email.com',
        password: await hash('seller123', 10),
        name: 'Siti Rahayu',
        phone: '628222333444',
        whatsapp: '628222333444',
        role: 'SELLER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=siti',
      },
    }),
    prisma.user.create({
      data: {
        email: 'ahmad@email.com',
        password: await hash('seller123', 10),
        name: 'Ahmad Fauzi',
        phone: '628333444555',
        whatsapp: '628333444555',
        role: 'SELLER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmad',
      },
    }),
    prisma.user.create({
      data: {
        email: 'dewi@email.com',
        password: await hash('seller123', 10),
        name: 'Dewi Lestari',
        phone: '628444555666',
        whatsapp: '628444555666',
        role: 'SELLER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dewi',
      },
    }),
    prisma.user.create({
      data: {
        email: 'raka@email.com',
        password: await hash('seller123', 10),
        name: 'Raka Pratama',
        phone: '628555666777',
        whatsapp: '628555666777',
        role: 'SELLER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=raka',
      },
    }),
  ]);

  // Define categories with sub-categories
  const categoryData = [
    {
      name: 'Jasa Kebersihan',
      slug: 'jasa-kebersihan',
      icon: 'sparkles',
      subCategories: [
        'ART Harian',
        'Cleaning Service',
        'General Cleaning',
        'Cleaning Kantor / Ruko',
        'Cleaning Kos / Apartemen',
        'Cuci Sofa',
        'Cuci Kasur',
        'Cuci Karpet',
        'Cuci Gorden',
        'Laundry',
        'Sedot WC',
      ],
    },
    {
      name: 'Servis Elektronik & Kendaraan',
      slug: 'servis-elektronik-kendaraan',
      icon: 'wrench',
      subCategories: [
        'Servis AC',
        'Servis Kulkas',
        'Servis Mesin Cuci',
        'Servis Dispenser',
        'Servis TV LED/LCD',
        'Servis Speaker/Audio',
        'Servis Handphone',
        'Servis Laptop',
        'Servis Komputer',
        'Servis Kompor',
        'Bengkel Mobil',
        'Bengkel Motor',
      ],
    },
    {
      name: 'Perbaikan Rumah & Renovasi',
      slug: 'perbaikan-rumah-renovasi',
      icon: 'hammer',
      subCategories: [
        'Tukang Listrik',
        'Tukang Ledeng / Pipa',
        'Perbaikan Atap Bocor',
        'Perbaikan Pintu & Jendela',
        'Renovasi Rumah',
        'Renovasi Taman',
        'Renovasi Kamar Mandi',
        'Pemasangan Plafon',
        'Pengecatan Rumah',
        'Pemasangan Pagar / Kanopi',
      ],
    },
    {
      name: 'Pendidikan',
      slug: 'pendidikan',
      icon: 'graduation',
      subCategories: [
        'Les SD',
        'Les SMP',
        'Les SMA',
        'Kursus Bahasa',
        'Kursus Komputer',
        'Kursus Desain Grafis',
        'Bimbingan Skripsi',
        'Bimbingan Masuk PTN/Kedinasan',
      ],
    },
    {
      name: 'Transportasi',
      slug: 'transportasi',
      icon: 'car',
      subCategories: [
        'Kurir',
        'Ojek Online',
        'Rental Mobil',
        'Rental Motor',
        'Driver Harian',
        'Driver Luar Kota',
        'Servis Kendaraan',
        'Cuci Mobil / Motor',
        'Derek Kendaraan',
      ],
    },
    {
      name: 'Event & Hiburan',
      slug: 'event-hiburan',
      icon: 'party',
      subCategories: [
        'Wedding Organizer',
        'Event Organizer',
        'Birthday Organizer',
        'Fotografer',
        'Videografer',
        'Drone Shooting',
        'MC / Host',
        'Band / Musik',
        'Badut',
        'Dekorasi',
        'Sewa Sound System',
        'Sewa Tenda & Kursi',
        'Outbound',
      ],
    },
    {
      name: 'Kecantikan & Kesehatan',
      slug: 'kecantikan-kesehatan',
      icon: 'heart',
      subCategories: [
        'Makeup Artist (MUA)',
        'Hair Styling',
        'Nail Art',
        'Facial',
        'Spa',
        'Pijat / Massage',
        'Personal Trainer',
        'Yoga Instructor',
        'Terapis Kesehatan',
      ],
    },
    {
      name: 'Digital Marketing',
      slug: 'digital-marketing',
      icon: 'megaphone',
      subCategories: [
        'Pembuatan Web',
        'SEO',
        'Social Media Marketing',
        'Periklanan Digital',
        'Content Marketing',
      ],
    },
  ];

  // Create categories with sub-categories
  const categoriesWithSubs: { category: Awaited<ReturnType<typeof prisma.category.create>>; subCategories: Awaited<ReturnType<typeof prisma.subCategory.create>>[] }[] = [];

  for (const catData of categoryData) {
    const category = await prisma.category.create({
      data: {
        name: catData.name,
        slug: catData.slug,
        icon: catData.icon,
      },
    });

    const subCats: Awaited<ReturnType<typeof prisma.subCategory.create>>[] = [];
    for (const subName of catData.subCategories) {
      const sub = await prisma.subCategory.create({
        data: {
          name: subName,
          slug: slugify(subName),
          categoryId: category.id,
        },
      });
      subCats.push(sub);
    }

    categoriesWithSubs.push({ category, subCategories: subCats });
  }

  // Create services based on new categories
  const serviceData = [
    // Jasa Kebersihan (cat index 0)
    { title: 'ART Harian Profesional', description: 'Asisten rumah tangga harian berpengalaman untuk membantu pekerjaan rumah seperti memasak, membersihkan, dan mencuci. Terpercaya dan jujur.', price: 150000, imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop', location: 'Jakarta', whatsapp: '628111222333', rating: 4.8, reviewCount: 95, featured: true, categoryId: categoriesWithSubs[0].category.id, subCategoryId: categoriesWithSubs[0].subCategories[0].id, sellerId: sellers[0].id },
    { title: 'Cleaning Service Kantor', description: 'Layanan cleaning service profesional untuk kantor dan ruko. Tim terlatih dengan peralatan lengkap dan hasil bersih maksimal.', price: 250000, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop', location: 'Bandung', whatsapp: '628111222333', rating: 4.7, reviewCount: 67, featured: false, categoryId: categoriesWithSubs[0].category.id, subCategoryId: categoriesWithSubs[0].subCategories[3].id, sellerId: sellers[0].id },
    { title: 'General Cleaning Rumah', description: 'Jasa bersih-bersih rumah menyeluruh dari lantai hingga plafon. Cocok untuk rumah yang sudah lama tidak dibersihkan atau setelah renovasi.', price: 350000, imageUrl: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&h=400&fit=crop', location: 'Surabaya', whatsapp: '628222333444', rating: 4.9, reviewCount: 112, featured: true, categoryId: categoriesWithSubs[0].category.id, subCategoryId: categoriesWithSubs[0].subCategories[2].id, sellerId: sellers[1].id },
    { title: 'Cuci Sofa & Kasur', description: 'Jasa cuci sofa dan kasur dengan mesin vacuum extractor profesional. Menghilangkan noda, debu, dan bakteri. Hasil bersih dan harum.', price: 200000, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop', location: 'Yogyakarta', whatsapp: '628444555666', rating: 4.6, reviewCount: 54, featured: false, categoryId: categoriesWithSubs[0].category.id, subCategoryId: categoriesWithSubs[0].subCategories[5].id, sellerId: sellers[3].id },
    { title: 'Cuci Karpet & Gorden', description: 'Layanan cuci karpet dan gorden dengan teknologi steam cleaning. Kain tetap awet dan warna tidak pudar.', price: 180000, imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop', location: 'Jakarta', whatsapp: '628555666777', rating: 4.5, reviewCount: 38, featured: false, categoryId: categoriesWithSubs[0].category.id, subCategoryId: categoriesWithSubs[0].subCategories[7].id, sellerId: sellers[4].id },
    { title: 'Sedot WC & Saluran Tersumbat', description: 'Jasa sedot WC dan mengatasi saluran air tersumbat dengan peralatan modern. Respon cepat 24 jam untuk area Jabodetabek.', price: 300000, imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=400&fit=crop', location: 'Bekasi', whatsapp: '628333444555', rating: 4.4, reviewCount: 29, featured: false, categoryId: categoriesWithSubs[0].category.id, subCategoryId: categoriesWithSubs[0].subCategories[10].id, sellerId: sellers[2].id },

    // Servis Elektronik & Kendaraan (cat index 1)
    { title: 'Servis AC Rumah & Kantor', description: 'Teknisi AC profesional untuk servis, cuci, dan pasang AC semua merk. Garansi kerja dan harga transparan.', price: 150000, imageUrl: 'https://images.unsplash.com/photo-1631567091046-7dbe4d6b1b47?w=600&h=400&fit=crop', location: 'Jakarta', whatsapp: '628333444555', rating: 4.8, reviewCount: 143, featured: true, categoryId: categoriesWithSubs[1].category.id, subCategoryId: categoriesWithSubs[1].subCategories[0].id, sellerId: sellers[2].id },
    { title: 'Servis Kulkas Semua Merk', description: 'Perbaikan kulkas yang tidak dingin, bocor, bising, dan masalah lainnya. Teknisi berpengalaman 10+ tahun.', price: 200000, imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&h=400&fit=crop', location: 'Bandung', whatsapp: '628333444555', rating: 4.7, reviewCount: 78, featured: false, categoryId: categoriesWithSubs[1].category.id, subCategoryId: categoriesWithSubs[1].subCategories[1].id, sellerId: sellers[2].id },
    { title: 'Servis Laptop & Komputer', description: 'Perbaikan laptop dan komputer: install ulang, ganti LCD, upgrade RAM/SSD, virus removal. Home service tersedia.', price: 150000, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop', location: 'Surabaya', whatsapp: '628555666777', rating: 4.9, reviewCount: 201, featured: true, categoryId: categoriesWithSubs[1].category.id, subCategoryId: categoriesWithSubs[1].subCategories[7].id, sellerId: sellers[4].id },
    { title: 'Servis Handphone & TV LED', description: 'Jasa servis handphone dan TV LED/LCD. Ganti LCD baterai, konektor cas, software. Bisa pickup-delivery.', price: 100000, imageUrl: 'https://images.unsplash.com/photo-1621330396173-e41b1cafd17f?w=600&h=400&fit=crop', location: 'Semarang', whatsapp: '628444555666', rating: 4.6, reviewCount: 65, featured: false, categoryId: categoriesWithSubs[1].category.id, subCategoryId: categoriesWithSubs[1].subCategories[6].id, sellerId: sellers[3].id },
    { title: 'Bengkel Mobil Terpercaya', description: 'Bengkel mobil lengkap: servis rutin, tune-up, ganti oli, perbaikan mesin dan AC mobil. Harga bersaing.', price: 300000, imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop', location: 'Jakarta', whatsapp: '628111222333', rating: 4.7, reviewCount: 89, featured: true, categoryId: categoriesWithSubs[1].category.id, subCategoryId: categoriesWithSubs[1].subCategories[10].id, sellerId: sellers[0].id },
    { title: 'Bengkel Motor Profesional', description: 'Servis motor semua merk: Honda, Yamaha, Suzuki, Kawasaki. Spesialis injeksi dan mesin racing.', price: 100000, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop', location: 'Yogyakarta', whatsapp: '628222333444', rating: 4.5, reviewCount: 56, featured: false, categoryId: categoriesWithSubs[1].category.id, subCategoryId: categoriesWithSubs[1].subCategories[11].id, sellerId: sellers[1].id },

    // Perbaikan Rumah & Renovasi (cat index 2)
    { title: 'Tukang Listrik Berlisensi', description: 'Jasa perbaikan dan pemasangan instalasi listrik rumah & kantor. Teknisi berlisensi dan berpengalaman. Garansi pekerjaan.', price: 200000, imageUrl: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop', location: 'Jakarta', whatsapp: '628111222333', rating: 4.9, reviewCount: 132, featured: true, categoryId: categoriesWithSubs[2].category.id, subCategoryId: categoriesWithSubs[2].subCategories[0].id, sellerId: sellers[0].id },
    { title: 'Tukang Ledeng & Pipa Air', description: 'Perbaikan pipa bocor, mampat, dan pemasangan instalasi air bersih & air limbah. Respon cepat dan harga terjangkau.', price: 175000, imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop', location: 'Bandung', whatsapp: '628222333444', rating: 4.7, reviewCount: 87, featured: false, categoryId: categoriesWithSubs[2].category.id, subCategoryId: categoriesWithSubs[2].subCategories[1].id, sellerId: sellers[1].id },
    { title: 'Perbaikan Atap Bocor', description: 'Jasa perbaikan atap bocor, genteng rusak, dan talang air. Menggunakan material berkualitas dan garansi tdk bocor.', price: 350000, imageUrl: 'https://images.unsplash.com/photo-1632759145351-1d5921e7d8e2?w=600&h=400&fit=crop', location: 'Surabaya', whatsapp: '628333444555', rating: 4.6, reviewCount: 44, featured: false, categoryId: categoriesWithSubs[2].category.id, subCategoryId: categoriesWithSubs[2].subCategories[2].id, sellerId: sellers[2].id },
    { title: 'Renovasi Rumah & Kamar Mandi', description: 'Jasa renovasi rumah dan kamar mandi dari perencanaan hingga selesai. Desain modern dengan material berkualitas.', price: 5000000, imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop', location: 'Jakarta', whatsapp: '628555666777', rating: 4.8, reviewCount: 63, featured: true, categoryId: categoriesWithSubs[2].category.id, subCategoryId: categoriesWithSubs[2].subCategories[4].id, sellerId: sellers[4].id },
    { title: 'Pengecatan Rumah Profesional', description: 'Jasa cat ulang rumah interior dan eksterior. Pengerjaan rapi dengan cat berkualitas. Warna sesuai keinginan Anda.', price: 400000, imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop', location: 'Yogyakarta', whatsapp: '628444555666', rating: 4.5, reviewCount: 51, featured: false, categoryId: categoriesWithSubs[2].category.id, subCategoryId: categoriesWithSubs[2].subCategories[8].id, sellerId: sellers[3].id },
    { title: 'Pemasangan Pagar & Kanopi', description: 'Jasa pembuatan dan pemasangan pagar besi, kanopi, dan carport. Desain minimalis dan klasik. Tahan lama.', price: 1500000, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop', location: 'Semarang', whatsapp: '628111222333', rating: 4.7, reviewCount: 34, featured: false, categoryId: categoriesWithSubs[2].category.id, subCategoryId: categoriesWithSubs[2].subCategories[9].id, sellerId: sellers[0].id },

    // Pendidikan (cat index 3)
    { title: 'Les Privat SD-SMP Semua Mata Pelajaran', description: 'Bimbingan belajar privat untuk siswa SD dan SMP. Guru berpengalaman dan sabar. Bisa online atau tatap muka.', price: 100000, imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop', location: 'Jakarta', whatsapp: '628222333444', rating: 4.8, reviewCount: 156, featured: true, categoryId: categoriesWithSubs[3].category.id, subCategoryId: categoriesWithSubs[3].subCategories[0].id, sellerId: sellers[1].id },
    { title: 'Les Privat SMA & UTBK', description: 'Bimbingan intensif untuk siswa SMA dan persiapan UTBK. Fokus pada soal-soal ujian dan strategi menjawab.', price: 150000, imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop', location: 'Bandung', whatsapp: '628444555666', rating: 4.9, reviewCount: 98, featured: true, categoryId: categoriesWithSubs[3].category.id, subCategoryId: categoriesWithSubs[3].subCategories[2].id, sellerId: sellers[3].id },
    { title: 'Kursus Bahasa Inggris & Jepang', description: 'Kursus bahasa Inggris dan Jepang untuk semua level. Native speaker available. Speaking, writing, dan grammar.', price: 200000, imageUrl: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?w=600&h=400&fit=crop', location: 'Surabaya', whatsapp: '628555666777', rating: 4.7, reviewCount: 72, featured: false, categoryId: categoriesWithSubs[3].category.id, subCategoryId: categoriesWithSubs[3].subCategories[3].id, sellerId: sellers[4].id },
    { title: 'Bimbingan Skripsi & Tesis', description: 'Konsultasi dan bimbingan skripsi S1 dan tesis S2. Dosen pembimbing berpengalaman. Bantu dari proposal hingga sidang.', price: 500000, imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop', location: 'Yogyakarta', whatsapp: '628333444555', rating: 4.6, reviewCount: 45, featured: false, categoryId: categoriesWithSubs[3].category.id, subCategoryId: categoriesWithSubs[3].subCategories[6].id, sellerId: sellers[2].id },
    { title: 'Bimbingan Masuk PTN/Kedinasan', description: 'Program intensif persiapan masuk PTN dan kedinasan. Try out rutin, materi deep, dan strategi sukses SNBP/SNBT.', price: 750000, imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop', location: 'Jakarta', whatsapp: '628111222333', rating: 4.8, reviewCount: 113, featured: true, categoryId: categoriesWithSubs[3].category.id, subCategoryId: categoriesWithSubs[3].subCategories[7].id, sellerId: sellers[0].id },

    // Transportasi (cat index 4)
    { title: 'Jasa Kurir & Pengiriman', description: 'Jasa kurir untuk pengiriman dokumen, paket, dan barang same day. Area Jabodetabek. Aman dan tepat waktu.', price: 50000, imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&h=400&fit=crop', location: 'Jakarta', whatsapp: '628111222333', rating: 4.6, reviewCount: 78, featured: false, categoryId: categoriesWithSubs[4].category.id, subCategoryId: categoriesWithSubs[4].subCategories[0].id, sellerId: sellers[0].id },
    { title: 'Rental Mobil & Driver Harian', description: 'Sewa mobil dengan atau tanpa driver. Armada terawat, driver profesional. Untuk keperluan bisnis atau wisata.', price: 450000, imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop', location: 'Bali', whatsapp: '628222333444', rating: 4.8, reviewCount: 89, featured: true, categoryId: categoriesWithSubs[4].category.id, subCategoryId: categoriesWithSubs[4].subCategories[2].id, sellerId: sellers[1].id },
    { title: 'Driver Luar Kota Profesional', description: 'Jasa driver untuk perjalanan luar kota. Berpengalaman rute Jawa & Bali. Aman, nyaman, dan tepat waktu.', price: 600000, imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop', location: 'Surabaya', whatsapp: '628333444555', rating: 4.7, reviewCount: 42, featured: false, categoryId: categoriesWithSubs[4].category.id, subCategoryId: categoriesWithSubs[4].subCategories[5].id, sellerId: sellers[2].id },
    { title: 'Cuci Mobil & Motor Door-to-Door', description: 'Jasa cuci mobil dan motor panggilan ke rumah. Hasil bersih mengkilap dengan produk premium. Hemat waktu Anda.', price: 50000, imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&h=400&fit=crop', location: 'Jakarta', whatsapp: '628555666777', rating: 4.5, reviewCount: 67, featured: false, categoryId: categoriesWithSubs[4].category.id, subCategoryId: categoriesWithSubs[4].subCategories[7].id, sellerId: sellers[4].id },

    // Event & Hiburan (cat index 5)
    { title: 'Wedding Organizer Profesional', description: 'Jasa WO pernikahan lengkap dari perencanaan hingga pelaksanaan. Dekorasi, katering, dokumentasi all-in-one.', price: 15000000, imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop', location: 'Jakarta', whatsapp: '628444555666', rating: 4.9, reviewCount: 167, featured: true, categoryId: categoriesWithSubs[5].category.id, subCategoryId: categoriesWithSubs[5].subCategories[0].id, sellerId: sellers[3].id },
    { title: 'Fotografer & Videografer Event', description: 'Jasa foto dan video profesional untuk pernikahan, seminar, birthday, dan acara perusahaan. Hasil sinematik.', price: 2000000, imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=400&fit=crop', location: 'Bandung', whatsapp: '628111222333', rating: 4.8, reviewCount: 94, featured: true, categoryId: categoriesWithSubs[5].category.id, subCategoryId: categoriesWithSubs[5].subCategories[3].id, sellerId: sellers[0].id },
    { title: 'MC & Band Musik Acara', description: 'Jasa MC profesional dan band musis live untuk berbagai acara. Repertoar lengkap dari pop, jazz, hingga dangdut.', price: 1500000, imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop', location: 'Surabaya', whatsapp: '628222333444', rating: 4.7, reviewCount: 56, featured: false, categoryId: categoriesWithSubs[5].category.id, subCategoryId: categoriesWithSubs[5].subCategories[6].id, sellerId: sellers[1].id },
    { title: 'Sewa Sound System & Tenda', description: 'Rental sound system, tenda, dan kursi untuk berbagai acara outdoor/indoor. Paket lengkap dengan teknisi.', price: 2500000, imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop', location: 'Yogyakarta', whatsapp: '628555666777', rating: 4.6, reviewCount: 38, featured: false, categoryId: categoriesWithSubs[5].category.id, subCategoryId: categoriesWithSubs[5].subCategories[10].id, sellerId: sellers[4].id },
    { title: 'Birthday Organizer & Dekorasi', description: 'Jasa organizer pesta ulang tahun anak dan dewasa. Termasuk dekorasi balon, badut, dan katering. Moment tak terlupakan!', price: 3000000, imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop', location: 'Jakarta', whatsapp: '628444555666', rating: 4.8, reviewCount: 73, featured: false, categoryId: categoriesWithSubs[5].category.id, subCategoryId: categoriesWithSubs[5].subCategories[2].id, sellerId: sellers[3].id },
    { title: 'Outbound & Team Building', description: 'Jasa outbound dan team building untuk perusahaan dan komunitas. Fasilitator berpengalaman, lokasi menarik.', price: 5000000, imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop', location: 'Bogor', whatsapp: '628333444555', rating: 4.7, reviewCount: 28, featured: false, categoryId: categoriesWithSubs[5].category.id, subCategoryId: categoriesWithSubs[5].subCategories[12].id, sellerId: sellers[2].id },

    // Kecantikan & Kesehatan (cat index 6)
    { title: 'Makeup Artist (MUA) Profesional', description: 'Jasa makeup profesional untuk wedding, wisuda, pesta, dan photoshoot. Hasil flawless dan tahan lama.', price: 500000, imageUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop', location: 'Jakarta', whatsapp: '628222333444', rating: 4.9, reviewCount: 187, featured: true, categoryId: categoriesWithSubs[6].category.id, subCategoryId: categoriesWithSubs[6].subCategories[0].id, sellerId: sellers[1].id },
    { title: 'Pijat & Massage Terapeutik', description: 'Jasa pijat dan massage profesional untuk menghilangkan pegal dan stres. Terapis berlisensi. Home service tersedia.', price: 200000, imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop', location: 'Bandung', whatsapp: '628444555666', rating: 4.7, reviewCount: 95, featured: true, categoryId: categoriesWithSubs[6].category.id, subCategoryId: categoriesWithSubs[6].subCategories[5].id, sellerId: sellers[3].id },
    { title: 'Personal Trainer & Yoga', description: 'Latihan privat dengan personal trainer dan yoga instructor bersertifikat. Program custom sesuai tujuan fitness Anda.', price: 250000, imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop', location: 'Surabaya', whatsapp: '628555666777', rating: 4.8, reviewCount: 62, featured: false, categoryId: categoriesWithSubs[6].category.id, subCategoryId: categoriesWithSubs[6].subCategories[6].id, sellerId: sellers[4].id },
    { title: 'Spa & Facial Home Service', description: 'Jasa spa dan facial panggilan ke rumah. Perawatan kulit wajah dan tubuh dengan produk premium. Relaksasi maksimal.', price: 300000, imageUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&h=400&fit=crop', location: 'Jakarta', whatsapp: '628333444555', rating: 4.6, reviewCount: 48, featured: false, categoryId: categoriesWithSubs[6].category.id, subCategoryId: categoriesWithSubs[6].subCategories[3].id, sellerId: sellers[2].id },
    { title: 'Hair Styling & Nail Art', description: 'Jasa styling rambut dan nail art untuk berbagai acara. Kreatif dan mengikuti tren terkini. Bisa home service.', price: 150000, imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&h=400&fit=crop', location: 'Yogyakarta', whatsapp: '628111222333', rating: 4.5, reviewCount: 73, featured: false, categoryId: categoriesWithSubs[6].category.id, subCategoryId: categoriesWithSubs[6].subCategories[1].id, sellerId: sellers[0].id },

    // Digital Marketing (cat index 7)
    { title: 'Pembuatan Website Profesional', description: 'Jasa pembuatan website company profile, toko online, dan landing page. Responsif, cepat, dan SEO-friendly.', price: 2500000, imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop', location: 'Jakarta', whatsapp: '628333444555', rating: 4.9, reviewCount: 112, featured: true, categoryId: categoriesWithSubs[7].category.id, subCategoryId: categoriesWithSubs[7].subCategories[0].id, sellerId: sellers[2].id },
    { title: 'SEO Optimization Website', description: 'Jasa optimasi SEO on-page dan off-page untuk meningkatkan ranking website di Google. Laporan analisis berkala.', price: 1000000, imageUrl: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=600&h=400&fit=crop', location: 'Bandung', whatsapp: '628555666777', rating: 4.7, reviewCount: 65, featured: false, categoryId: categoriesWithSubs[7].category.id, subCategoryId: categoriesWithSubs[7].subCategories[1].id, sellerId: sellers[4].id },
    { title: 'Social Media Marketing', description: 'Pengelolaan akun media sosial: content planning, desain konten, scheduling, dan analytics reporting. Tingkatkan engagement!', price: 1500000, imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop', location: 'Surabaya', whatsapp: '628222333444', rating: 4.8, reviewCount: 89, featured: true, categoryId: categoriesWithSubs[7].category.id, subCategoryId: categoriesWithSubs[7].subCategories[2].id, sellerId: sellers[1].id },
    { title: 'Periklanan Digital (Google & Meta Ads)', description: 'Pengelolaan iklan Google Ads dan Meta Ads yang efektif. Optimasi ROI dengan targeting tepat dan analisis mendalam.', price: 2000000, imageUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=600&h=400&fit=crop', location: 'Jakarta', whatsapp: '628111222333', rating: 4.6, reviewCount: 38, featured: false, categoryId: categoriesWithSubs[7].category.id, subCategoryId: categoriesWithSubs[7].subCategories[3].id, sellerId: sellers[0].id },
    { title: 'Content Marketing & Copywriting', description: 'Pembuatan konten artikel SEO, copywriting, dan strategi content marketing untuk meningkatkan brand awareness.', price: 750000, imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop', location: 'Yogyakarta', whatsapp: '628444555666', rating: 4.5, reviewCount: 55, featured: false, categoryId: categoriesWithSubs[7].category.id, subCategoryId: categoriesWithSubs[7].subCategories[4].id, sellerId: sellers[3].id },
  ];

  for (const data of serviceData) {
    await prisma.service.create({ data });
  }

  // Create testimonials
  const testimonials = [
    { name: 'Rina Wulandari', role: 'Ibu Rumah Tangga', content: 'Saya pakai jasa cleaning service dari Mitra Jasa Pro, hasilnya luar biasa bersih! Tim datang tepat waktu dan sangat profesional. Pasti pakai lagi!', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rina', rating: 5 },
    { name: 'Hendra Wijaya', role: 'Pemilik UMKM', content: 'Website toko online saya dibuat sangat profesional oleh seller di Mitra Jasa Pro. Sekarang omzet naik 3x lipat! Terima kasih Mitra Jasa Pro!', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hendra', rating: 5 },
    { name: 'Maya Putri', role: 'Wedding Planner', content: 'Saya rutin order jasa dekorasi dan makeup dari Mitra Jasa Pro untuk klien saya. Hasilnya selalu memuaskan dan komunikasinya lancar via WhatsApp.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maya', rating: 4 },
    { name: 'Dimas Pratama', role: 'Mahasiswa', content: 'Bimbingan skripsi di Mitra Jasa Pro benar-benar membantu! Dosen pembimbingnya sabar dan kompeten. Skripsi saya lulus dengan nilai A.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dimas', rating: 5 },
    { name: 'Anisa Fitri', role: 'Pemilik Salon', content: 'Jasa AC dan perbaikan listrik dari Mitra Jasa Pro sangat responsif. AC salon saya sekarang dingin lagi dan harganya sangat wajar.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anisa', rating: 5 },
    { name: 'Rizki Ramadhan', role: 'Driver Online', content: 'Rental mobil dari Mitra Jasa Pro sangat membantu saya memulai bisnis driver. Mobil terawat dan pemiliknya sangat kooperatif!', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rizki', rating: 5 },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  // Create articles
  const articleData = [
    {
      title: 'Tips Memilih Jasa Cleaning Service yang Tepat untuk Rumah',
      slug: 'tips-memilih-jasa-cleaning-service',
      excerpt: 'Memilih jasa cleaning service yang tepat bisa menjadi tantangan. Simak tips berikut agar Anda tidak salah pilih dan mendapatkan hasil maksimal.',
      content: 'Memilih jasa cleaning service yang tepat bisa menjadi tantangan tersendiri. Ada beberapa hal yang perlu diperhatikan seperti reputasi perusahaan, pengalaman tim, peralatan yang digunakan, dan harga yang ditawarkan. Pastikan juga untuk meminta referensi dan melihat review dari pelanggan sebelumnya.',
      imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=500&fit=crop',
      category: 'Jasa Kebersihan',
      author: 'Tim Mitra Jasa Pro',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mitrajasapro',
      readTime: 5,
    },
    {
      title: 'Panduan Lengkap Renovasi Rumah Minimalis dengan Budget Terbatas',
      slug: 'panduan-renovasi-rumah-minimalis',
      excerpt: 'Ingin renovasi rumah minimalis? Ketahui langkah-langkah penting mulai dari perencanaan budget hingga memilih kontraktor yang tepat.',
      content: 'Renovasi rumah minimalis tidak harus mahal. Dengan perencanaan yang matang dan pemilihan material yang tepat, Anda bisa mendapatkan hasil yang memuaskan tanpa menguras kantong. Mulailah dengan menentukan prioritas renovasi, membuat anggaran detail, dan konsultasi dengan tukang profesional.',
      imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=500&fit=crop',
      category: 'Perbaikan Rumah',
      author: 'Tim Mitra Jasa Pro',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mitrajasapro',
      readTime: 7,
    },
    {
      title: 'Strategi Digital Marketing Efektif untuk UMKM di Tahun 2024',
      slug: 'strategi-digital-marketing-umkm-2024',
      excerpt: 'Pelajari strategi digital marketing terbaru yang efektif untuk mengembangkan bisnis UMKM Anda di era digital.',
      content: 'Di era digital, UMKM perlu memanfaatkan strategi digital marketing yang tepat untuk menjangkau lebih banyak pelanggan. Beberapa strategi yang terbukti efektif antara lain: optimasi SEO website, pemanfaatan media sosial, content marketing, dan periklanan digital yang terarah.',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
      category: 'Digital Marketing',
      author: 'Tim Mitra Jasa Pro',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mitrajasapro',
      readTime: 6,
    },
    {
      title: 'Cara Merawat AC agar Tetap Dingin dan Hemat Listrik',
      slug: 'cara-merawat-ac-dingin-hemat-listrik',
      excerpt: 'AC yang tidak dirawat bisa boros listrik dan kurang dingin. Simak cara merawat AC yang benar agar awet dan efisien.',
      content: 'Perawatan AC yang rutin sangat penting untuk menjaga performa dan efisiensi energi. Beberapa tips sederhana yang bisa dilakukan: bersihkan filter secara berkala, pastikan unit outdoor tidak tertutup, dan jadwalkan servis rutin setiap 3-6 bulan sekali.',
      imageUrl: 'https://images.unsplash.com/photo-1631567091046-7dbe4d6b1b47?w=800&h=500&fit=crop',
      category: 'Servis Elektronik',
      author: 'Tim Mitra Jasa Pro',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mitrajasapro',
      readTime: 4,
    },
    {
      title: 'Persiapan Pernikahan: Checklist Lengkap dari WO Profesional',
      slug: 'persiapan-pernikahan-checklist-wo',
      excerpt: 'Bingung mempersiapkan pernikahan? Simak checklist lengkap dari wedding organizer profesional agar hari H berjalan lancar.',
      content: 'Mempersiapkan pernikahan membutuhkan perencanaan yang matang. Mulai dari menentukan tanggal dan venue, memilih vendor katering, dekorasi, dokumentasi, hingga koordinasi di hari H. Dengan bantuan WO profesional, proses ini bisa lebih mudah dan terorganisir.',
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=500&fit=crop',
      category: 'Event & Hiburan',
      author: 'Tim Mitra Jasa Pro',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mitrajasapro',
      readTime: 8,
    },
    {
      title: 'Manfaat Les Privat untuk Perkembangan Akademik Anak',
      slug: 'manfaat-les-privat-perkembangan-anak',
      excerpt: 'Les privat bukan sekadar bimbingan belajar. Ketahui bagaimana les privat bisa meningkatkan perkembangan akademik dan kepercayaan diri anak.',
      content: 'Les privat memberikan perhatian individual yang tidak bisa didapatkan di kelas besar. Guru privat bisa menyesuaikan metode pengajaran dengan gaya belajar anak, fokus pada kelemahan yang perlu diperbaiki, dan membangun kepercayaan diri anak dalam belajar.',
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop',
      category: 'Pendidikan',
      author: 'Tim Mitra Jasa Pro',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mitrajasapro',
      readTime: 5,
    },
  ];

  for (const article of articleData) {
    await prisma.article.create({ data: article });
  }

  console.log('✅ Seed completed successfully!');
  console.log(`Created: ${sellers.length} sellers, ${categoryData.length} categories, ${categoryData.reduce((sum, c) => sum + c.subCategories.length, 0)} sub-categories, ${serviceData.length} services, ${testimonials.length} testimonials, ${articleData.length} articles`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
