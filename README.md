# ZAMAN — Pomodoro Vaqt Boshqaruv Tizimi

> *Vaqtni boshqar · Diqqatni saqlang · Maqsadga yeting*

---

## Loyiha haqida

**ZAMAN** — oddiy Pomodoro ilovalardan tubdan farq qiladigan, zamonaviy vaqt boshqaruv tizimi. Bitta HTML fayldan iborat bo'lib, hech qanday o'rnatish talab qilmaydi. Firebase orqali Google autentifikatsiyasi va bulut sinxronizatsiyasi qo'llab-quvvatlanadi.

---

## Xususiyatlar

### ⏱ Taymer
- Ishlash, qisqa dam va uzun dam rejimlari
- Saytdan chiqib ketilganda ham vaqt to'g'ri hisoblanadi (timestamp asosida)
- Fon rejimida (`visibilitychange`) aniq ishlaydi
- Screen Wake Lock — ekran o'chib ketmaydi

### 🔊 Ovoz tizimi
Web Audio API orqali qurilgan, hech qanday tashqi fayl yuklamaydi:
- 🔔 Qo'ng'iroq
- 📟 Digital
- 🌿 Tabiat (qush saslari)
- ✨ Chime
- 🥁 Gong

### 🔐 Autentifikatsiya
- Foydalanuvchi **3 ta bepul pomodoro** ishlatgandan keyin Google login so'raladi
- Firebase Authentication orqali Google Sign-In
- Login qilmasdan ham cheklangan rejimda ishlatish mumkin

### ☁️ Bulut sinxronizatsiyasi
- Statistika, vazifalar va sozlamalar Firestore'da saqlanadi
- Barcha qurilmalarda avtomatik sinxronizatsiya
- Mahalliy va bulut ma'lumotlari birlashtirilib saqlanadi

### 📋 Vazifalar ro'yxati
- Vazifa qo'shish va o'chirish
- Faol vazifani belgilash
- Har bir vazifaga sarflangan pomodorolar soni ko'rsatiladi

### 📊 Statistika
- Bugungi, haftalik pomodorolar soni
- Jami diqqat soatlari
- Streak (ketma-ket faol kunlar)
- So'nggi 28 kunlik kalendar

### 🎯 Diqqat rejimi
- To'liq ekran taymer
- Barcha chalg'ituvchi elementlar yashiriladi

### ⌨️ Klaviatura yorliqlari

| Tugma | Amal |
|-------|------|
| `Space` | Boshlash / To'xtatish |
| `R` | Qayta boshlash |
| `F` | Diqqat rejimi |
| `1` | Ishlash rejimi |
| `2` | Qisqa dam |
| `3` | Uzun dam |
| `Esc` | Diqqat rejimidan chiqish |

---

## Ishga tushirish

### Talablar
- Zamonaviy brauzer (Chrome, Firefox, Edge, Safari)
- Internet ulanishi (Firebase uchun)
- Firebase loyihasi (autentifikatsiya uchun)

### Sozlash

**1. Firebase loyihasini yarating**

[console.firebase.google.com](https://console.firebase.google.com) saytiga kiring va yangi loyiha yarating.

**2. Google autentifikatsiyasini yoqing**

```
Authentication → Sign-in method → Google → Enable
```

**3. Firestore bazasini yarating**

```
Firestore Database → Create database → Start in test mode
```

**4. Ruxsat etilgan domenlarni qo'shing**

```
Authentication → Settings → Authorized domains → Add domain
```

**5. Firebase config ni yangilang**

`pomodoro.html` faylida quyidagi qatorlarni o'z loyiha ma'lumotlaringiz bilan almashtiring:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**6. Faylni brauzerda oching**

```bash
# Oddiy usul — faylni to'g'ridan-to'g'ri oching
open pomodoro.html

# Yoki lokal server orqali
python3 -m http.server 8080
# Keyin: http://localhost:8080/pomodoro.html
```

---

## Loyiha tuzilmasi

```
zaman-pomodoro/
└── pomodoro.html      # Barcha kod — HTML, CSS, JS bitta faylda
└── README.md          # Ushbu hujjat
```

Loyiha ataylab bitta faylda saqlangan — tarqatish, ulashish va ishlatish oson bo'lishi uchun.

---

## Ma'lumotlar saqlash

### Mahalliy saqlash (localStorage)
Login qilinmagan holda barcha ma'lumotlar brauzerning `localStorage` da saqlanadi:

| Kalit | Tavsif |
|-------|--------|
| `zaman_state` | Taymer holati, sozlamalar |
| `zaman_analytics` | Kun bo'yicha pomodoro statistikasi |
| `zaman_todos` | Vazifalar ro'yxati |
| `zaman_guest_pomos` | Mehmon foydalanuvchi pomodoro soni |

### Bulut saqlash (Firestore)
Login qilingandan keyin `users/{uid}` hujjatida saqlanadi:

```json
{
  "analytics": { "2026-02-23": 5, "2026-02-22": 3 },
  "todos": [...],
  "settings": { "work": 25, "short": 5, "long": 15 },
  "updatedAt": 1234567890,
  "displayName": "Foydalanuvchi ismi",
  "email": "email@example.com"
}
```

---

## Firestore xavfsizlik qoidalari

Ishlab chiqarishga chiqarishdan oldin quyidagi xavfsizlik qoidalarini Firestore'ga qo'shing:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Texnologiyalar

| Texnologiya | Maqsad |
|-------------|--------|
| HTML5 / CSS3 / JavaScript | Asosiy frontend |
| Web Audio API | Ovoz sintezi |
| Web Storage API | Mahalliy saqlash |
| Screen Wake Lock API | Ekranni uyg'oq ushlab turish |
| Firebase Authentication | Google login |
| Cloud Firestore | Bulut ma'lumotlar bazasi |
| Google Fonts (Bebas Neue, Space Mono) | Tipografiya |

---

## Litsenziya

MIT License — erkin foydalaning, o'zgartiring va tarqating.

---

*ZAMAN — vaqtingizni qadrlab yashang.*
