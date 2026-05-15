# Deploy Mitra Jasa Pro ke Vercel

## Langkah 1: Buat Database (Neon - GRATIS)
1. Buka https://neon.tech → Sign Up (GitHub)
2. Create Project → Region: **Singapore**
3. **Salin Connection String** (format: postgresql://user:pass@host/db?sslmode=require)

## Langkah 2: Upload ke GitHub
1. Buka GitHub → **New repository** → nama: `mitra-jasa-pro`
2. Extract ZIP ini, drag & drop **semua file/folder** ke GitHub
3. Struktur harus: src/, prisma/, public/, package.json, vercel.json, dll
4. Klik **Commit changes**

## Langkah 3: Deploy ke Vercel
1. Buka https://vercel.com → Sign Up (GitHub)
2. **Add New → Project** → Import `mitra-jasa-pro`
3. Tambahkan **Environment Variables**:
   - `DATABASE_URL` = *(paste dari Neon)*
   - `SESSION_SECRET` = `mitra-jasa-pro-secret-key-2024`
   - `BLOB_READ_WRITE_TOKEN` = *(isi nanti dari Settings → Blob)*
4. Klik **Deploy**

## Langkah 4: Seed Database
```
npm install -g vercel
git clone https://github.com/USERNAME/mitra-jasa-pro.git
cd mitra-jasa-pro && npm install
vercel login && vercel env pull .env.local
npx tsx prisma/seed.ts
```

## Langkah 5: Aktifkan Upload Gambar
1. Vercel Dashboard → Settings → Blob → Aktifkan
2. Copy token → paste ke Environment Variables `BLOB_READ_WRITE_TOKEN`
3. Redeploy

## Login Admin
- Email: `admin@mitrajasapro.com`
- Password: `admin123`
- **Ganti password setelah login pertama!**
