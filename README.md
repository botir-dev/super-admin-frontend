# Super Admin Frontend

Restoran boshqaruv tizimi uchun **Super Admin** paneli — Next.js 16 + TypeScript + Tailwind CSS v4.

## Texnologiyalar

- **Next.js 16** — App Router
- **TypeScript** 
- **Tailwind CSS v4**
- **Zustand** — auth state management
- **TanStack Query** — server state & caching
- **Axios** — HTTP client (auto token refresh)
- **React Hot Toast** — notifications
- **Lucide React** — icons

---

## Super Admin imkoniyatlari

### 🏢 Restoranlar (`/restaurants`)
- Barcha restoranlarni ko'rish
- Yangi restoran yaratish (nom, manzil, logo)
- Restoranni tahrirlash
- Restoran faoliyatini aktivlashtirish / o'chirish
- Restoran o'chirish

### 🏪 Filiallar (`/branches`)
- Barcha filiallarni ko'rish (restoran bo'yicha filter)
- Yangi filial yaratish (restoran tanlash, nom, manzil, telefon)
- Filialni tahrirlash
- Filial faoliyatini aktivlashtirish / o'chirish

### 👤 Menejerlar (`/managers`)
- Barcha menejerlarni ko'rish (restoran bo'yicha filter)
- Yangi menejer yaratish (restoran + filial biriktirish, login/parol)
- Menejerni tahrirlash (ismi, telefon, parol)
- Menejer faoliyatini aktivlashtirish / o'chirish
- Menejerni o'chirish

### 📊 Dashboard (`/dashboard`)
- Umumiy statistika: restoranlar, filiallar, menejerlar soni
- Faol/nofaol holatlari
- Oxirgi restoranlar va menejerlar ro'yxati

---

## O'rnatish

```bash
cd super-admin-frontend
npm install

# .env.local fayl yarating
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local

npm run dev
```

Brauzerda: `http://localhost:3001`

---

## Papka tuzilmasi

```
super-admin-frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # / → /dashboard redirect
│   ├── globals.css         # Global styles + CSS variables
│   ├── login/
│   │   └── page.tsx        # Login sahifasi
│   ├── dashboard/
│   │   └── page.tsx        # Dashboard (statistika)
│   ├── restaurants/
│   │   └── page.tsx        # Restoranlar boshqaruvi
│   ├── branches/
│   │   └── page.tsx        # Filiallar boshqaruvi
│   └── managers/
│       └── page.tsx        # Menejerlar boshqaruvi
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          # Nav sidebar
│   │   └── DashboardLayout.tsx  # Protected layout wrapper
│   └── providers/
│       └── QueryProvider.tsx    # TanStack Query provider
├── lib/
│   ├── api.ts              # Axios instance + interceptors
│   └── services.ts         # API service functions
├── store/
│   └── auth.store.ts       # Zustand auth store
├── types/
│   └── index.ts            # TypeScript types
└── middleware.ts            # Route protection
```

---

## API Endpointlar (backend)

```
POST /auth/login
POST /auth/logout
PUT  /auth/change-password

GET  /admin/restaurants
POST /admin/restaurants
PUT  /admin/restaurants/:id
DEL  /admin/restaurants/:id

GET  /admin/branches?restaurant_id=
POST /admin/branches
PUT  /admin/branches/:id

GET  /admin/managers?restaurant_id=
POST /admin/managers
PUT  /admin/managers/:id
DEL  /admin/managers/:id
```
