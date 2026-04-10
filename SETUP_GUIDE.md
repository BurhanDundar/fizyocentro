# Fizyocentro - Detaylı Kurulum Rehberi

Bu rehber, Fizyocentro uygulamasını sıfırdan kurmak için adım adım talimatlar içerir.

## 📋 Ön Gereksinimler

- Node.js 18.x veya üzeri
- npm veya yarn package manager
- Google/Firebase hesabı
- Modern bir web tarayıcısı (Chrome, Firefox, Safari, Edge)

## 🔥 Firebase Kurulumu (Detaylı)

### Adım 1: Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. "Add project" (Proje Ekle) butonuna tıklayın
3. Proje adını girin (örn: "fizyocentro")
4. Google Analytics'i aktif edebilirsiniz (isteğe bağlı)
5. "Create project" butonuna tıklayın
6. Proje oluşturulmasını bekleyin (1-2 dakika sürebilir)

### Adım 2: Web App Ekleme

1. Firebase Console'da projenize gidin
2. Sol menüden "Project Overview" yanındaki ayar simgesine tıklayın
3. "Project settings" seçeneğini seçin
4. "General" sekmesinde, aşağı kaydırarak "Your apps" bölümünü bulun
5. Web ikonu (</>) butonuna tıklayın
6. App nickname girin (örn: "Fizyocentro Web")
7. "Firebase Hosting" seçeneğini işaretlemeyebilirsiniz (isteğe bağlı)
8. "Register app" butonuna tıklayın
9. Firebase SDK configuration bilgilerini kopyalayın (sayfada kalın, sonra kullanacağız)

### Adım 3: Authentication Kurulumu

1. Firebase Console'da sol menüden "Authentication" seçin
2. "Get started" butonuna tıklayın
3. "Sign-in method" sekmesine gidin
4. "Email/Password" provider'ı bulun ve tıklayın
5. İlk toggle'ı (Email/Password) aktif edin
6. "Save" butonuna tıklayın

### Adım 4: Firestore Database Kurulumu

1. Sol menüden "Firestore Database" seçin
2. "Create database" butonuna tıklayın
3. **Test mode** seçin (güvenlik kurallarını sonra ekleyeceğiz)
4. Location seçin (Avrupa için: eur3 (europe-west))
5. "Enable" butonuna tıklayın
6. Database oluşturulmasını bekleyin

### Adım 5: Firestore Security Rules Yükleme

1. Firestore Database sayfasında "Rules" sekmesine gidin
2. Varsayılan kuralları silin
3. Proje klasöründeki `firestore.rules` dosyasının içeriğini kopyalayın
4. Firebase Console'daki metin alanına yapıştırın
5. "Publish" butonuna tıklayın

## 💻 Proje Kurulumu

### Adım 1: Projeyi İndirin

```bash
git clone <repository-url>
cd fizyocentro
```

### Adım 2: Bağımlılıkları Yükleyin

```bash
npm install
```

Kurulum 2-3 dakika sürebilir.

### Adım 3: Environment Variables Ayarlama

1. `.env.local.example` dosyasını kopyalayın:

```bash
cp .env.local.example .env.local
```

2. `.env.local` dosyasını bir metin editörüyle açın

3. Firebase SDK configuration bilgilerinizi yapıştırın:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx
```

4. Dosyayı kaydedin

## 👥 Kullanıcı Oluşturma

### Admin Kullanıcı Oluşturma

1. Firebase Console > Authentication > Users sekmesine gidin
2. "Add user" butonuna tıklayın
3. Email ve şifre girin (örn: admin@fizyocentro.com / Admin123!)
4. "Add user" butonuna tıklayın
5. Oluşturulan kullanıcının **User UID**'sini kopyalayın (uzun bir string)

6. Firestore Database'e gidin
7. "Start collection" butonuna tıklayın
8. Collection ID olarak `users` yazın ve "Next" butonuna tıklayın
9. **Document ID** alanına kopyaladığınız User UID'yi yapıştırın
10. Şu fieldları ekleyin:

| Field | Type | Value |
|-------|------|-------|
| name | string | Admin User |
| email | string | admin@fizyocentro.com |
| role | string | admin |

11. "Save" butonuna tıklayın

### Employee Kullanıcı Oluşturma (İsteğe Bağlı)

Aynı adımları tekrarlayın, sadece `role` fieldını `employee` olarak ayarlayın.

Örnek employee:
- Email: ahmet@fizyocentro.com
- Name: Ahmet Yılmaz
- Role: employee

## 🚀 Uygulamayı Çalıştırma

### Development Server

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

### İlk Giriş

1. Otomatik olarak login sayfasına yönlendirileceksiniz
2. Oluşturduğunuz admin kullanıcı bilgileriyle giriş yapın
3. Dashboard'a yönlendirileceksiniz

## 🧪 Test Senaryoları

### Admin Kullanıcı Testi

1. Admin hesabıyla giriş yapın
2. Dashboard'da "Tüm Çalışanlar" dropdown'ını görmelisiniz
3. Takvimde boş bir zaman dilimine tıklayın
4. Randevu formu açılmalı
5. Hasta adı, açıklama ve zaman bilgilerini doldurun
6. "Oluştur" butonuna tıklayın
7. Randevu takvimde görünmeli
8. Randevuya tıklayarak düzenleme/silme yapın

### Employee Kullanıcı Testi

1. Employee hesabıyla giriş yapın
2. Sadece kendi randevularınızı görebilmelisiniz
3. Yeni randevu oluşturma adımlarını test edin
4. Randevu düzenleme ve silme işlemlerini test edin

### Real-time Update Testi

1. İki farklı tarayıcıda (veya incognito modda) uygulamayı açın
2. Birinde admin, diğerinde employee ile giriş yapın
3. Bir tarayıcıda randevu oluşturun
4. Diğer tarayıcıda randevunun otomatik olarak görünmesini bekleyin

## 🔧 Yaygın Sorunlar ve Çözümleri

### Hata: "Firebase configuration is missing"

**Çözüm:** `.env.local` dosyasının doğru oluşturulduğundan ve değerlerin kopyalandığından emin olun. Development server'ı yeniden başlatın.

### Hata: "Permission denied" (Firestore)

**Çözüm:**
1. Firestore Security Rules'un doğru yüklendiğinden emin olun
2. Kullanıcının Firestore'da karşılık gelen `users` document'i olmalı
3. Document ID'nin Authentication UID'siyle eşleştiğinden emin olun

### Hata: "User not found" veya "Invalid credentials"

**Çözüm:**
1. Firebase Console > Authentication'da kullanıcının mevcut olduğunu kontrol edin
2. Şifrenin doğru girildiğinden emin olun
3. Email/Password provider'ın aktif olduğunu kontrol edin

### Calendar görünmüyor

**Çözüm:**
1. Browser console'u açın (F12) ve hataları kontrol edin
2. `npm install` komutunu tekrar çalıştırın
3. `.next` klasörünü silin ve `npm run dev` komutunu tekrar çalıştırın

```bash
rm -rf .next
npm run dev
```

### Randevular gerçek zamanlı güncellenmiyor

**Çözüm:**
1. Firestore Rules'un doğru yüklendiğinden emin olun
2. Browser console'da Firestore bağlantı hatalarını kontrol edin
3. İnternet bağlantınızı kontrol edin

## 📊 Veri Yapısı Örnekleri

### Örnek User Document

```json
{
  "id": "abc123xyz",
  "name": "Mehmet Demir",
  "email": "mehmet@fizyocentro.com",
  "role": "employee"
}
```

### Örnek Appointment Document

```json
{
  "id": "appointment123",
  "userId": "abc123xyz",
  "patientName": "Ayşe Yılmaz",
  "description": "Bel fıtığı tedavisi, 3. seans",
  "startTime": "2024-01-15T10:00:00",
  "endTime": "2024-01-15T11:00:00",
  "createdAt": "2024-01-10T14:30:00"
}
```

## 🚀 Production Deployment

### Vercel'e Deploy

1. GitHub'da bir repository oluşturun
2. Projeyi push edin:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

3. [Vercel](https://vercel.com) hesabınıza giriş yapın
4. "Import Project" seçeneğini seçin
5. GitHub repository'nizi seçin
6. Environment Variables kısmına `.env.local` değerlerini ekleyin
7. "Deploy" butonuna tıklayın

### Environment Variables (Production)

Production'da şu environment variables'ları eklemeniz gerekir:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 🔒 Güvenlik Önerileri

1. **.env.local dosyasını asla Git'e commit etmeyin**
2. Production'da güçlü şifreler kullanın
3. Firestore Security Rules'u düzenli olarak gözden geçirin
4. Firebase Console'da Activity Log'ları kontrol edin
5. Admin sayısını minimum tutun
6. Düzenli yedeklemeler alın

## 📝 Sonraki Adımlar

Temel kurulum tamamlandıktan sonra:

1. Tüm çalışanlar için hesap oluşturun
2. Test randevuları oluşturup sistemi test edin
3. Gerçek hasta bilgileriyle kullanmaya başlayın
4. Yedekleme stratejisi belirleyin
5. Kullanıcı eğitimi verin

## 🆘 Destek

Sorun yaşarsanız:

1. README.md dosyasındaki "Sorun Giderme" bölümüne bakın
2. Browser console'da hata mesajlarını kontrol edin
3. Firebase Console'da logları inceleyin
4. GitHub issues'da sorun bildirin

---

**Başarılar! 🎉**
