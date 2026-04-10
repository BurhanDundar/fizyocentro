# Fizyocentro - Randevu Yönetim Sistemi

Modern, production-ready bir fizyoterapi kliniği randevu yönetim web uygulaması.

## 🎯 Özellikler

### Kimlik Doğrulama & Yetkilendirme
- Firebase Authentication ile email/password girişi
- Rol tabanlı erişim kontrolü (Admin / Employee)
- Güvenli oturum yönetimi

### Randevu Yönetimi
- FullCalendar ile modern takvim arayüzü
- Haftalık ve günlük görünümler
- Sürükle-bırak destekli randevu oluşturma
- Randevu düzenleme ve silme
- Real-time güncellemeler (Firestore listeners)

### Rol Bazlı Yetkiler
- **Admin:**
  - Tüm çalışanların randevularını görüntüleme
  - Herhangi bir çalışan için randevu oluşturma/düzenleme
  - Çalışan bazlı filtreleme

- **Employee:**
  - Sadece kendi randevularını görüntüleme
  - Kendi randevularını oluşturma/düzenleme

## 🛠 Teknoloji Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** ShadCN UI
- **Backend:** Firebase (Authentication + Firestore)
- **Calendar:** FullCalendar
- **Validation:** Zod
- **Date Handling:** date-fns

## 📁 Proje Yapısı

```
fizyocentro/
├── app/
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # Home page (redirects based on auth)
│   ├── login/
│   │   └── page.tsx        # Login page
│   └── dashboard/
│       └── page.tsx        # Main dashboard with calendar
├── components/
│   ├── ui/                 # ShadCN UI components
│   ├── appointment/
│   │   └── AppointmentModal.tsx  # Appointment create/edit modal
│   └── calendar/
│       ├── Calendar.tsx    # FullCalendar wrapper component
│       └── calendar-styles.css   # Calendar custom styles
├── lib/
│   ├── firebase/
│   │   └── config.ts       # Firebase initialization
│   └── validations/
│       └── appointment.ts  # Zod validation schemas
├── services/
│   ├── user.service.ts     # User CRUD operations
│   ├── appointment.service.ts  # Appointment CRUD operations
│   └── admin.service.ts    # Admin-specific operations
├── hooks/
│   └── useAuth.tsx         # Authentication context and hook
├── types/
│   └── index.ts            # TypeScript type definitions
├── firestore.rules         # Firestore security rules
└── .env.local.example      # Environment variables template
```

## 🚀 Kurulum

### 1. Depoyu Klonlayın

```bash
git clone <repository-url>
cd fizyocentro
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Firebase Projesini Oluşturun

1. [Firebase Console](https://console.firebase.google.com/) üzerinden yeni bir proje oluşturun
2. **Authentication** bölümünden Email/Password provider'ı aktif edin
3. **Firestore Database** oluşturun (test modunda başlatın)

### 4. Firebase Yapılandırması

1. Firebase Console'dan proje ayarlarına gidin
2. "Your apps" bölümünden web app oluşturun
3. Firebase SDK configuration bilgilerini kopyalayın
4. `.env.local.example` dosyasını `.env.local` olarak kopyalayın:

```bash
cp .env.local.example .env.local
```

5. `.env.local` dosyasını Firebase bilgilerinizle doldurun:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Firestore Security Rules'u Yükleyin

1. Firebase Console'da Firestore > Rules sekmesine gidin
2. `firestore.rules` dosyasının içeriğini kopyalayıp yapıştırın
3. "Publish" butonuna tıklayın

### 6. İlk Kullanıcıları Oluşturun

Firebase Console > Authentication > Users sekmesinden manuel olarak kullanıcı ekleyin:

**Admin Kullanıcı Oluşturma:**
1. Authentication'dan email/password ile kullanıcı oluşturun
2. Kullanıcının UID'sini kopyalayın
3. Firestore > `users` collection'ına gidin
4. Yeni document oluşturun (Document ID = UID):

```json
{
  "name": "Admin User",
  "email": "admin@fizyocentro.com",
  "role": "admin"
}
```

**Employee Kullanıcı Oluşturma:**
Aynı adımları takip edin, `role` alanını `"employee"` yapın.

### 7. Uygulamayı Başlatın

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📊 Firestore Veri Modeli

### Users Collection

```typescript
{
  id: string;           // Firebase Auth UID
  name: string;         // Kullanıcı adı
  email: string;        // Email adresi
  role: "admin" | "employee";  // Kullanıcı rolü
}
```

### Appointments Collection

```typescript
{
  id: string;           // Auto-generated
  userId: string;       // User document reference
  patientName: string;  // Hasta adı
  description: string;  // Randevu açıklaması
  startTime: Timestamp; // Başlangıç zamanı
  endTime: Timestamp;   // Bitiş zamanı
  createdAt: Timestamp; // Oluşturulma zamanı
}
```

## 🔒 Güvenlik

### Firestore Security Rules

Uygulama, güçlü Firestore security rules ile korunmaktadır:

- **Users Collection:**
  - Kullanıcılar sadece kendi bilgilerini okuyabilir
  - Sadece admin'ler kullanıcı oluşturabilir/güncelleyebilir
  - Kimse kullanıcı silemez

- **Appointments Collection:**
  - Admin'ler tüm randevuları görebilir ve yönetebilir
  - Employee'ler sadece kendi randevularını görebilir ve yönetebilir
  - Tüm validasyonlar backend'de yapılır

### Veri Validasyonu

- Client-side: Zod validation
- Server-side: Firestore rules validation
- Input sanitization
- Type safety with TypeScript

## 🎨 UI/UX Özellikleri

- Modern ve temiz arayüz
- Responsive design (mobil uyumlu)
- Loading states
- Error handling
- Modal-based forms
- Real-time updates
- Color-coded appointments per employee

## 📝 Kullanım

### Randevu Oluşturma

1. Dashboard'da takvimde boş bir zaman dilimine tıklayın
2. Açılan modal'da hasta bilgilerini girin
3. "Oluştur" butonuna tıklayın

### Randevu Düzenleme

1. Mevcut bir randevuye tıklayın
2. Bilgileri güncelleyin
3. "Güncelle" butonuna tıklayın

### Randevu Silme

1. Randevuya tıklayın
2. Modal'da "Sil" butonuna tıklayın
3. Onaylayın

### Admin Özellikleri

- Üst menüden çalışan seçerek o çalışanın randevularını görüntüleyin
- "Tüm Çalışanlar" seçeneği ile tüm randevuları görün
- Herhangi bir çalışan için randevu oluşturun

## 🧪 Geliştirme

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Build

```bash
npm run build
```

## 🚀 Deployment

### Vercel (Önerilen)

1. Projeyi GitHub'a push edin
2. [Vercel](https://vercel.com) hesabınızla bağlanın
3. Projeyi import edin
4. Environment variables'ları ekleyin
5. Deploy edin

### Diğer Platformlar

Next.js uygulamaları çoğu modern hosting platformunda çalışır:
- Netlify
- Railway
- AWS Amplify
- Google Cloud Run

## 📚 Ek Kaynaklar

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [FullCalendar Documentation](https://fullcalendar.io/docs)
- [ShadCN UI Documentation](https://ui.shadcn.com)

## 🐛 Sorun Giderme

### Firebase Connection Errors

- `.env.local` dosyasının doğru yapılandırıldığından emin olun
- Firebase Console'da proje ayarlarını kontrol edin
- Development server'ı yeniden başlatın

### Authentication Issues

- Firebase Console'da Email/Password provider'ın aktif olduğundan emin olun
- Kullanıcının Firestore'da karşılık gelen `users` document'ine sahip olduğunu kontrol edin

### Calendar Not Showing

- Browser console'u hataları kontrol edin
- FullCalendar CSS'inin import edildiğinden emin olun
- Firestore'da appointment'ların doğru formatta olduğunu kontrol edin

## 📄 Lisans

MIT License

## 👥 Katkıda Bulunma

Pull request'ler kabul edilir. Büyük değişiklikler için önce bir issue açarak neyi değiştirmek istediğinizi tartışın.

---

**Fizyocentro** - Modern Fizyoterapi Kliniği Yönetim Sistemi
