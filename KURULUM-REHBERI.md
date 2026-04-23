# Fonova — Kurulum ve Geçiş Rehberi

Bu doküman, projeye eklenen PostgreSQL migrasyonu, modüler servis mimarisi, KYC akışı, siber güvenlik katmanları ve SEO optimizasyonunu devreye almak için yapmanız gereken adımları sırasıyla anlatır.

---

## Ön Koşullar

- **Node.js** v18+ kurulu olmalı
- **Docker Desktop** kurulu ve çalışır durumda olmalı (PostgreSQL container için)
- **Git** ile proje klonlanmış olmalı

---

## Adım 1 — Environment Değişkenlerini Ayarla

Proje kökündeki `.env` dosyasını `.env.example`'dan oluşturun:

```bash
cp .env.example .env
```

`.env` dosyasının içeriği şu şekilde olmalı:

```env
DATABASE_URL="postgresql://fonova:fonova@localhost:5432/fonova?schema=public"
ENCRYPTION_KEY="buraya-64-karakter-hex-key-yazın"
NEXT_PUBLIC_SITE_URL="https://fonova.co"
```

### Encryption Key Üretmek

Terminal'de şu komutu çalıştırarak güvenli bir key üretin:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Çıkan 64 karakterlik hex string'i `.env` dosyasındaki `ENCRYPTION_KEY` değerine yapıştırın.

> **Not:** Bu key mali verilerin AES-256-GCM ile şifrelenmesinde kullanılır. Kaybetmeyin, yoksa şifreli veriler okunamaz hale gelir.

---

## Adım 2 — PostgreSQL Veritabanını Başlat

Docker ile PostgreSQL container'ını ayağa kaldırın:

```bash
docker compose up -d postgres
```

Çalıştığını doğrulayın:

```bash
docker compose ps
```

`fonova-postgres` container'ının `running` durumda olduğunu görmelisiniz.

> Container bilgileri: kullanıcı `fonova`, şifre `fonova`, veritabanı `fonova`, port **`5433`** (host) → `5432` (container).
>
> **Not:** Port `5433` kullanılıyor çünkü makinede yerel PostgreSQL `5432`'yi kapatabiliyor. Eğer sizde yerel PG yoksa `docker-compose.yml`'de portu `5432:5432` yapabilirsiniz.

---

## Adım 3 — Prisma Client Oluştur ve Migration Çalıştır

Sırasıyla:

```bash
# 1. Prisma client'ı yeniden oluştur (yeni modeller için)
npx prisma generate

# 2. Migration oluştur ve uygula
npx prisma migrate dev --name init
```

Bu komut:
- PostgreSQL'de tüm tabloları oluşturur (eski SQLite tabloları + yeni `SupportProject`, `VolunteerContribution`)
- `prisma/migrations/` klasörüne migration dosyası yazar

---

## Adım 4 — Seed Verilerini Yükle

```bash
npx prisma db seed
```

Bu komut demo verilerini yükler:
- Yatırımcı, kurucu, admin kullanıcıları
- 3 kampanya (2 canlı, 1 incelemede)
- 1 yatırım taahhüdü
- **3 destek projesi** (yeni — artık veritabanında)
- Compliance kontrolleri ve admin review

---

## Adım 5 — Bağımlılıkları Kur ve Çalıştır

```bash
# Bağımlılıklar zaten kuruluysa bu adımı atlayabilirsiniz
npm install

# Dev server'ı başlat
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

---

## Adım 6 — Her Şeyin Çalıştığını Doğrula

### Kontrol Listesi

| Ne | Nasıl | Beklenen |
|---|---|---|
| **Ana sayfa** | `http://localhost:3000` | Kampanya ve destek kartları görünür |
| **Kampanya SEO** | `http://localhost:3000/campaigns/nuvia-robotics-tohum-turu` | Sayfa kaynağında `og:title`, `og:image`, JSON-LD script tag'i var |
| **Sitemap** | `http://localhost:3000/sitemap.xml` | Tüm kampanya URL'leri listelenir |
| **Robots** | `http://localhost:3000/robots.txt` | `/api/` ve `/admin/` disallow edilmiş |
| **Security headers** | Tarayıcı DevTools → Network → herhangi bir istek → Response Headers | `Strict-Transport-Security`, `X-Frame-Options`, `Content-Security-Policy` var |
| **Rate limiting** | Aynı API'ye 60+ istek at | 429 status döner |
| **KYC paneli** | Kampanya sayfasında (eğer yatırımcı KYC PENDING ise) | KYC doğrulama formu görünür |
| **Donations API** | `GET http://localhost:3000/api/donations` | Destek projeleri JSON döner |
| **Testler** | `npm test` | Mevcut testler geçer |

---

## Yeni Dosya/Klasör Haritası

```
Eklenen / Değiştirilen dosyalar:

├── docker-compose.yml                          # YENİ — PostgreSQL container
├── .env.example                                # GÜNCELLENDİ — PG + encryption + site URL
├── vercel.json                                 # GÜNCELLENDİ — SQLite referansı kaldırıldı
├── package.json                                # GÜNCELLENDİ — db:up, db:reset scriptleri
├── next.config.mjs                             # GÜNCELLENDİ — SQLite tracing kaldırıldı
│
├── prisma/
│   ├── schema.prisma                           # GÜNCELLENDİ — PostgreSQL + yeni modeller
│   └── seed.ts                                 # GÜNCELLENDİ — SupportProject seed eklendi
│
├── src/
│   ├── middleware.ts                            # YENİ — Security headers + global rate limit
│   │
│   ├── app/
│   │   ├── layout.tsx                          # GÜNCELLENDİ — SEO metadata genişletildi
│   │   ├── sitemap.ts                          # YENİ — Dinamik sitemap
│   │   ├── robots.ts                           # YENİ — robots.txt kuralları
│   │   ├── campaigns/[slug]/page.tsx           # GÜNCELLENDİ — generateMetadata + JSON-LD + KYC
│   │   └── api/
│   │       ├── donations/route.ts              # YENİ — Destek projesi API
│   │       ├── kyc/verify/route.ts             # YENİ — KYC doğrulama API
│   │       ├── investments/route.ts            # GÜNCELLENDİ — rate limiting eklendi
│   │       └── investments/[id]/cancel/route.ts # GÜNCELLENDİ — rate limiting eklendi
│   │
│   ├── components/
│   │   └── KycVerificationPanel.tsx            # YENİ — KYC doğrulama UI bileşeni
│   │
│   └── lib/
│       ├── db.ts                               # GÜNCELLENDİ — SQLite workaround kaldırıldı
│       ├── adapters/
│       │   ├── types.ts                        # GÜNCELLENDİ — KycAdapter genişletildi
│       │   └── mock.ts                         # GÜNCELLENDİ — TC doğrulama simülasyonu
│       ├── services/
│       │   ├── types.ts                        # YENİ — Ortak ServiceResult<T>
│       │   ├── donations.ts                    # YENİ — Destek/bağış servisi
│       │   ├── kyc.ts                          # YENİ — KYC doğrulama servisi
│       │   └── investments.ts                  # GÜNCELLENDİ — ortak tip importu
│       └── security/
│           ├── rate-limiter.ts                 # YENİ — Namespace bazlı rate limiter
│           ├── csrf.ts                         # YENİ — CSRF token yardımcısı
│           └── encryption.ts                   # YENİ — AES-256-GCM şifreleme
```

---

## Vercel ile PostgreSQL Sunucusu Kurma (Adım Adım)

### 1. Vercel Projesini Oluştur

1. [vercel.com/dashboard](https://vercel.com/dashboard) adresine gidin
2. **"Add New → Project"** tıklayın
3. GitHub reponuzu seçin (`startup-hub`)
4. Framework olarak **Next.js** otomatik algılanacak
5. Henüz **Deploy** butonuna basmayın — önce veritabanını kurun

### 2. Vercel Postgres Veritabanı Oluştur

1. Vercel Dashboard'da projenizin sayfasına gidin
2. Üst menüden **"Storage"** sekmesine tıklayın
3. **"Create Database"** → **"Postgres"** seçin (Powered by Neon)
4. Veritabanına bir isim verin: `fonova-db`
5. Region olarak **Frankfurt (fra1)** seçin (Türkiye'ye en yakın)
6. **"Create"** tıklayın

> **Ücretsiz tier:** Vercel Postgres (Neon) Hobby planında 0.5 GB depolama ve 100 saat/ay compute ücretsizdir.

### 3. Environment Variable'ları Bağla

Vercel Postgres oluşturulduğunda otomatik olarak şu environment variable'lar projenize eklenir:

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`

**Prisma için `DATABASE_URL`'i ayarlayın:**

1. Proje sayfasında **"Settings" → "Environment Variables"** gidin
2. Aşağıdaki değişkenleri **ekleyin veya güncelleyin:**

| Değişken | Değer |
|---|---|
| `DATABASE_URL` | `POSTGRES_PRISMA_URL` değerini kopyalayıp yapıştırın (pooling destekli URL) |
| `ENCRYPTION_KEY` | Lokalde ürettiğiniz 64 karakter hex key |
| `NEXT_PUBLIC_SITE_URL` | `https://your-vercel-domain.vercel.app` (veya custom domain) |

> **Önemli:** `POSTGRES_PRISMA_URL` değerini birebir kopyalayın. Bu URL connection pooling içerir ve Prisma ile uyumludur. Genellikle şuna benzer:
> ```
> postgresql://user:pass@ep-xxx.fra1.neon.tech/fonova-db?sslmode=require&pgbouncer=true
> ```

### 4. Prisma Schema'yı Production'a Uyumlu Hale Getir

Vercel Postgres connection pooling (PgBouncer) kullandığı için, `schema.prisma`'da `directUrl` eklemek önerilir. İsteğe bağlı — şimdilik pooled URL ile çalışır:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")  // opsiyonel — migration için
}
```

> Bu değişikliği yaparsanız Vercel'de `POSTGRES_URL_NON_POOLING` değişkeninin de tanımlı olduğundan emin olun.

### 5. Veritabanı Tablolarını Production'da Oluştur

Vercel'de migration çalıştırmak için **lokal terminalinizden** production veritabanına bağlanabilirsiniz:

```bash
# Vercel env değişkenlerini lokale çek
npx vercel env pull .env.local

# Production DB'ye migration uygula
npx prisma migrate deploy

# Seed verisini yükle (opsiyonel — demo veri istiyorsanız)
npx dotenv -e .env.local -- npx prisma db seed
```

> **Alternatif:** Eğer `npx dotenv` yoksa, `.env.local`'deki `DATABASE_URL` değerini `.env`'e kopyalayıp komutları doğrudan çalıştırabilirsiniz. İşlem bittikten sonra `.env`'i eski haline getirin.

### 6. Deploy Et

```bash
# Vercel CLI ile deploy
npx vercel --prod

# veya GitHub push ile otomatik deploy
git add .
git commit -m "feat: postgresql + security + seo + kyc"
git push origin main
```

### 7. Deploy Sonrası Kontrol

| Kontrol | URL |
|---|---|
| Ana sayfa | `https://your-domain.vercel.app` |
| Sitemap | `https://your-domain.vercel.app/sitemap.xml` |
| Robots | `https://your-domain.vercel.app/robots.txt` |
| Kampanya SEO | `https://your-domain.vercel.app/campaigns/nuvia-robotics-tohum-turu` — sayfa kaynağında og:title var mı? |
| Security Headers | DevTools → Network → Response Headers → CSP, HSTS var mı? |
| API | `https://your-domain.vercel.app/api/donations` — JSON döner mü? |

### Alternatif: Supabase veya Neon Doğrudan

Vercel Postgres yerine doğrudan **Supabase** veya **Neon** kullanmak isterseniz:

1. [supabase.com](https://supabase.com) veya [neon.tech](https://neon.tech) üzerinden ücretsiz proje oluşturun
2. Connection string'i alın (PostgreSQL URL)
3. Vercel'de `DATABASE_URL` olarak bu URL'yi ayarlayın
4. Geri kalan adımlar aynı

---

## Hızlı Komut Referansı

```bash
# PostgreSQL başlat
npm run db:up

# Migration oluştur
npx prisma migrate dev --name aciklama

# Seed yükle
npm run prisma:seed

# Veritabanını sıfırla (tüm veriyi siler + seed)
npm run db:reset

# Dev server
npm run dev

# Testleri çalıştır
npm test
```
