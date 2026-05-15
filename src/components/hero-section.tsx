'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Users, Star, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavStore } from '@/store/nav-store';

const stats = [
  { icon: Briefcase, value: '1000+', label: 'Jasa' },
  { icon: Users, value: '500+', label: 'Seller' },
  { icon: MapPin, value: '50+', label: 'Kota' },
  { icon: Star, value: '4.8', label: 'Rating' },
];

const subCategories = [
  // Jasa Kebersihan
  { name: 'ART Harian', category: 'jasa-kebersihan' },
  { name: 'Cleaning Service', category: 'jasa-kebersihan' },
  { name: 'General Cleaning', category: 'jasa-kebersihan' },
  { name: 'Cleaning Kantor / Ruko', category: 'jasa-kebersihan' },
  { name: 'Cleaning Kos / Apartemen', category: 'jasa-kebersihan' },
  { name: 'Cuci Sofa', category: 'jasa-kebersihan' },
  { name: 'Cuci Kasur', category: 'jasa-kebersihan' },
  { name: 'Cuci Karpet', category: 'jasa-kebersihan' },
  { name: 'Cuci Gorden', category: 'jasa-kebersihan' },
  { name: 'Laundry', category: 'jasa-kebersihan' },
  { name: 'Sedot WC', category: 'jasa-kebersihan' },
  // Servis Elektronik & Kendaraan
  { name: 'Servis AC', category: 'servis-elektronik-kendaraan' },
  { name: 'Servis Kulkas', category: 'servis-elektronik-kendaraan' },
  { name: 'Servis Mesin Cuci', category: 'servis-elektronik-kendaraan' },
  { name: 'Servis Dispenser', category: 'servis-elektronik-kendaraan' },
  { name: 'Servis TV LED/LCD', category: 'servis-elektronik-kendaraan' },
  { name: 'Servis Speaker/Audio', category: 'servis-elektronik-kendaraan' },
  { name: 'Servis Handphone', category: 'servis-elektronik-kendaraan' },
  { name: 'Servis Laptop', category: 'servis-elektronik-kendaraan' },
  { name: 'Servis Komputer', category: 'servis-elektronik-kendaraan' },
  { name: 'Servis Kompor', category: 'servis-elektronik-kendaraan' },
  { name: 'Bengkel Mobil', category: 'servis-elektronik-kendaraan' },
  { name: 'Bengkel Motor', category: 'servis-elektronik-kendaraan' },
  // Perbaikan Rumah & Renovasi
  { name: 'Tukang Listrik', category: 'perbaikan-rumah-renovasi' },
  { name: 'Tukang Ledeng / Pipa', category: 'perbaikan-rumah-renovasi' },
  { name: 'Perbaikan Atap Bocor', category: 'perbaikan-rumah-renovasi' },
  { name: 'Perbaikan Pintu & Jendela', category: 'perbaikan-rumah-renovasi' },
  { name: 'Renovasi Rumah', category: 'perbaikan-rumah-renovasi' },
  { name: 'Renovasi Taman', category: 'perbaikan-rumah-renovasi' },
  { name: 'Renovasi Kamar Mandi', category: 'perbaikan-rumah-renovasi' },
  { name: 'Pemasangan Plafon', category: 'perbaikan-rumah-renovasi' },
  { name: 'Pengecatan Rumah', category: 'perbaikan-rumah-renovasi' },
  { name: 'Pemasangan Pagar / Kanopi', category: 'perbaikan-rumah-renovasi' },
  // Pendidikan
  { name: 'Les SD', category: 'pendidikan' },
  { name: 'Les SMP', category: 'pendidikan' },
  { name: 'Les SMA', category: 'pendidikan' },
  { name: 'Kursus Bahasa', category: 'pendidikan' },
  { name: 'Kursus Komputer', category: 'pendidikan' },
  { name: 'Kursus Desain Grafis', category: 'pendidikan' },
  { name: 'Bimbingan Skripsi', category: 'pendidikan' },
  { name: 'Bimbingan Masuk PTN/Kedinasan', category: 'pendidikan' },
  // Transportasi
  { name: 'Kurir', category: 'transportasi' },
  { name: 'Ojek Online', category: 'transportasi' },
  { name: 'Rental Mobil', category: 'transportasi' },
  { name: 'Rental Motor', category: 'transportasi' },
  { name: 'Driver Harian', category: 'transportasi' },
  { name: 'Driver Luar Kota', category: 'transportasi' },
  { name: 'Servis Kendaraan', category: 'transportasi' },
  { name: 'Cuci Mobil / Motor', category: 'transportasi' },
  { name: 'Derek Kendaraan', category: 'transportasi' },
  // Event & Hiburan
  { name: 'Wedding Organizer', category: 'event-hiburan' },
  { name: 'Event Organizer', category: 'event-hiburan' },
  { name: 'Birthday Organizer', category: 'event-hiburan' },
  { name: 'Fotografer', category: 'event-hiburan' },
  { name: 'Videografer', category: 'event-hiburan' },
  { name: 'Drone Shooting', category: 'event-hiburan' },
  { name: 'MC / Host', category: 'event-hiburan' },
  { name: 'Band / Musik', category: 'event-hiburan' },
  { name: 'Badut', category: 'event-hiburan' },
  { name: 'Dekorasi', category: 'event-hiburan' },
  { name: 'Sewa Sound System', category: 'event-hiburan' },
  { name: 'Sewa Tenda & Kursi', category: 'event-hiburan' },
  { name: 'Outbound', category: 'event-hiburan' },
  // Kecantikan & Kesehatan
  { name: 'Makeup Artist (MUA)', category: 'kecantikan-kesehatan' },
  { name: 'Hair Styling', category: 'kecantikan-kesehatan' },
  { name: 'Nail Art', category: 'kecantikan-kesehatan' },
  { name: 'Facial', category: 'kecantikan-kesehatan' },
  { name: 'Spa', category: 'kecantikan-kesehatan' },
  { name: 'Pijat / Massage', category: 'kecantikan-kesehatan' },
  { name: 'Personal Trainer', category: 'kecantikan-kesehatan' },
  { name: 'Yoga Instructor', category: 'kecantikan-kesehatan' },
  { name: 'Terapis Kesehatan', category: 'kecantikan-kesehatan' },
  // Digital Marketing
  { name: 'Pembuatan Web', category: 'digital-marketing' },
  { name: 'SEO', category: 'digital-marketing' },
  { name: 'Social Media Marketing', category: 'digital-marketing' },
  { name: 'Periklanan Digital', category: 'digital-marketing' },
  { name: 'Content Marketing', category: 'digital-marketing' },
];

const popularCities = [
  'Jakarta',
  'Bandung',
  'Surabaya',
  'Yogyakarta',
  'Semarang',
  'Medan',
  'Makassar',
  'Bali',
  'Malang',
  'Solo',
  'Bekasi',
  'Tangerang',
  'Depok',
  'Bogor',
  'Palembang',
  'Balikpapan',
  'Manado',
  'Padang',
  'Pekanbaru',
  'Pontianak',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Filtered suggestions
  const filteredSubCategories = searchQuery.trim()
    ? subCategories.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : subCategories.slice(0, 8);

  const filteredCities = locationQuery.trim()
    ? popularCities.filter((c) =>
        c.toLowerCase().includes(locationQuery.toLowerCase())
      ).slice(0, 6)
    : popularCities.slice(0, 6);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowSearchSuggestions(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(e.target as Node) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(e.target as Node)
      ) {
        setShowLocationSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params: { search?: string; location?: string } = {};
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (locationQuery.trim()) params.location = locationQuery.trim();
    useNavStore.getState().navigate('jasa', params);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const selectSearchSuggestion = (name: string) => {
    setSearchQuery(name);
    setShowSearchSuggestions(false);
    searchInputRef.current?.focus();
  };

  const selectLocationSuggestion = (city: string) => {
    setLocationQuery(city);
    setShowLocationSuggestions(false);
    locationInputRef.current?.focus();
  };

  return (
    <section id="beranda" className="hero-gradient relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 text-center lg:text-left"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 rounded-full bg-dodger/10 px-4 py-1.5 text-sm font-medium text-dodger-700 border border-dodger/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dodger opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-dodger"></span>
                </span>
                Marketplace Jasa #1 di Indonesia
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]"
            >
              Temukan Jasa{' '}
              <span className="gradient-text">Terbaik</span>{' '}
              untuk Kebutuhanmu
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Marketplace jasa profesional dengan koneksi langsung via WhatsApp.
              Temukan ribuan jasa berkualitas dari seller terpercaya di seluruh Indonesia.
            </motion.p>

            {/* Search Bar */}
            <motion.div variants={itemVariants} className="max-w-xl mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0 p-1.5 bg-white rounded-2xl shadow-lg shadow-black/[0.06] border border-dodger-100/80">
                {/* Search Jasa Input */}
                <div className="relative flex-1 sm:min-w-0">
                  <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-l-xl sm:rounded-r-none bg-dodger-50/50">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-dodger shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Cari jasa... (desain logo, web, dll)"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchSuggestions(true);
                      }}
                      onFocus={() => setShowSearchSuggestions(true)}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 outline-none"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          searchInputRef.current?.focus();
                        }}
                        className="shrink-0 p-0.5 rounded-full hover:bg-muted transition-colors"
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>

                  {/* Search Suggestions Dropdown */}
                  {showSearchSuggestions && filteredSubCategories.length > 0 && (
                    <div
                      ref={searchDropdownRef}
                      className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-xl shadow-xl shadow-black/10 border border-dodger-100/80 overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-dodger-50">
                        <p className="text-xs font-semibold text-dodger-700 flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3" />
                          {searchQuery.trim() ? 'Hasil Pencarian' : 'Jasa Populer'}
                        </p>
                      </div>
                      <div className="max-h-64 overflow-y-auto py-1 custom-scrollbar">
                        {filteredSubCategories.map((item) => (
                          <button
                            key={item.name}
                            onClick={() => selectSearchSuggestion(item.name)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-dodger-50 transition-colors group"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dodger/10 text-dodger group-hover:bg-dodger group-hover:text-white transition-colors">
                              <Search className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate group-hover:text-dodger-700">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground capitalize">
                                {item.category.replace(/-/g, ' ')}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                      {searchQuery.trim() && (
                        <div className="border-t border-dodger-50">
                          <button
                            onClick={() => {
                              setShowSearchSuggestions(false);
                              handleSearch();
                            }}
                            className="w-full px-3 py-2.5 text-sm font-medium text-dodger hover:bg-dodger-50 transition-colors text-center"
                          >
                            Cari &quot;{searchQuery}&quot; di semua jasa
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Location Input */}
                <div className="relative sm:w-44 lg:w-48 shrink-0">
                  <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-none bg-dodger-50/50 border-t sm:border-t-0 sm:border-l border-dodger-100/60">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-dodger-dark shrink-0" />
                    <input
                      ref={locationInputRef}
                      type="text"
                      placeholder="Lokasi..."
                      value={locationQuery}
                      onChange={(e) => {
                        setLocationQuery(e.target.value);
                        setShowLocationSuggestions(true);
                      }}
                      onFocus={() => setShowLocationSuggestions(true)}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 outline-none"
                    />
                    {locationQuery && (
                      <button
                        onClick={() => {
                          setLocationQuery('');
                          locationInputRef.current?.focus();
                        }}
                        className="shrink-0 p-0.5 rounded-full hover:bg-muted transition-colors"
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>

                  {/* Location Suggestions Dropdown */}
                  {showLocationSuggestions && filteredCities.length > 0 && (
                    <div
                      ref={locationDropdownRef}
                      className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-xl shadow-xl shadow-black/10 border border-dodger-100/80 overflow-hidden"
                    >
                      <div className="px-3 py-2 border-b border-dodger-50">
                        <p className="text-xs font-semibold text-dodger-700 flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" />
                          {locationQuery.trim() ? 'Kota Ditemukan' : 'Kota Populer'}
                        </p>
                      </div>
                      <div className="max-h-52 overflow-y-auto py-1 custom-scrollbar">
                        {filteredCities.map((city) => (
                          <button
                            key={city}
                            onClick={() => selectLocationSuggestion(city)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-dodger-50 transition-colors group"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-dodger/10 text-dodger group-hover:bg-dodger group-hover:text-white transition-colors">
                              <MapPin className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-sm font-medium text-foreground group-hover:text-dodger-700">
                              {city}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <Button
                  onClick={handleSearch}
                  className="shrink-0 h-auto sm:h-auto rounded-xl sm:rounded-l-none sm:rounded-r-xl px-6 sm:px-5 py-2.5 sm:py-2.5 bg-dodger hover:bg-dodger-dark text-white font-semibold gap-2 shadow-md shadow-dodger/20 transition-all"
                  size="lg"
                >
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sm:sr-only">Cari Jasa</span>
                </Button>
              </div>

              {/* Quick Tags */}
              <div className="flex flex-wrap items-center gap-2 mt-3 justify-center lg:justify-start">
                <span className="text-xs text-muted-foreground">Populer:</span>
                {['Cleaning Service', 'Servis AC', 'Tukang Listrik', 'Les Privat', 'Makeup Artist', 'Pembuatan Web'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      setShowSearchSuggestions(true);
                    }}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/80 text-muted-foreground hover:bg-dodger hover:text-white border border-dodger-100/60 hover:border-dodger transition-all duration-200 font-medium"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Decorative Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-md aspect-square">
              {/* Background decorative circles */}
              <div className="absolute inset-0 rounded-full bg-dodger/5 animate-pulse" />
              <div className="absolute inset-8 rounded-full bg-dodger/10" />
              <div className="absolute inset-16 rounded-full bg-dodger/15" />

              {/* Central element */}
              <div className="absolute inset-20 rounded-3xl bg-gradient-to-br from-dodger to-dodger-dark flex items-center justify-center shadow-2xl">
                <div className="text-center text-white space-y-3 p-6">
                  <Briefcase className="h-16 w-16 mx-auto opacity-90" />
                  <p className="text-xl font-bold">Mitra Jasa Pro</p>
                  <p className="text-sm opacity-80">Connect & Deal via WhatsApp</p>
                </div>
              </div>

              {/* Floating cards */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-2 right-8 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2 border"
              >
                <div className="h-8 w-8 rounded-full bg-dodger/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-dodger" />
                </div>
                <div>
                  <p className="text-xs font-semibold">500+ Seller</p>
                  <p className="text-[10px] text-muted-foreground">Aktif & Terverifikasi</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [8, -8, 8] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-2 left-4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2 border"
              >
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold">4.8 Rating</p>
                  <p className="text-[10px] text-muted-foreground">Dari 1000+ review</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/2 -left-6 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2 border"
              >
                <div className="h-8 w-8 rounded-full bg-dodger/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-dodger" />
                </div>
                <div>
                  <p className="text-xs font-semibold">50+ Kota</p>
                  <p className="text-[10px] text-muted-foreground">Jangkauan nasional</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="border-t border-dodger-100 bg-white/60 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-dodger/10 shrink-0">
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-dodger" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
