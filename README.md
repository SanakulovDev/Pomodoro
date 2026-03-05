# TIKITAK — Pomodoro Timer

> _Focus your time · Stay productive · Achieve your goals_

---

## About

**TIKITAK** is a modern, minimalist Pomodoro timer built as a single HTML file — no installation needed. Features live weather backgrounds, Ramadan prayer time tracking, Firebase cloud sync, and full mobile support.

---

## Features

### ⏱ Timer

- Work, short break, and long break modes
- **Click the clock** to start/stop — no buttons needed
- Accurate time tracking even when switching tabs (`targetEndTime` approach)
- Screen Wake Lock — screen stays on during timer
- Audio alert when timer completes (Web Audio API)

### 🌦 Live Weather Background

- Real-time weather data from [Open-Meteo API](https://open-meteo.com) (no API key)
- Animated backgrounds: ☀️ sun rays, 🌧 rain drops, ❄️ snowflakes, ☁️ clouds
- Subtle rain ambient audio via Web Audio API
- Auto-refreshes every 30 minutes

### 🌙 Ramadan Timer

- Suhoor & Iftar times for Tashkent (2026 timetable)
- Live countdown to next prayer time
- Shows current Ramadan day number
- Auto-hides outside Ramadan dates

### 🌍 Localization

- 3 languages: **English** (default), **Русский**, **O'zbekcha**
- Language toggle in header (EN → RU → UZ)
- Preference saved to localStorage

### � Authentication

- Google Sign-In via Firebase Authentication
- 3 free Pomodoros before login prompt
- Skip option for limited guest mode

### ☁️ Cloud Sync

- Analytics and settings synced to Firestore
- Auto-sync every 2 minutes when logged in
- Local & cloud data merged (max of each day)

### 📱 Mobile & Fullscreen

- Fully responsive — adapts to any screen size
- Landscape mode with compact layout
- Fullscreen API support (⛶ button)
- Screen Wake Lock keeps display on

### ⌨️ Keyboard Shortcuts

| Key     | Action        |
| ------- | ------------- |
| `Space` | Start / Pause |
| `R`     | Reset timer   |
| `F`     | Fullscreen    |
| `1`     | Work mode     |
| `2`     | Short break   |
| `3`     | Long break    |

---

## Getting Started

### Requirements

- Modern browser (Chrome, Firefox, Edge, Safari)
- Internet connection (for Firebase & weather)

### Setup

**1. Clone and open**

```bash
open index.html
# or use a local server:
python3 -m http.server 8080
```

**2. (Optional) Configure Firebase**

To enable cloud sync, update the Firebase config in `index.html`:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

Firebase setup:

1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Google Sign-In: `Authentication → Sign-in method → Google`
3. Create Firestore: `Firestore Database → Create database → Test mode`
4. Add authorized domains: `Authentication → Settings → Authorized domains`

---

## Project Structure

```
tikitak/
├── index.html    # Single file — HTML, CSS, JS all-in-one
└── README.md     # This document
```

Single-file architecture — easy to deploy, share, and host anywhere.

---

## Data Storage

### Local (localStorage)

| Key                 | Description            |
| ------------------- | ---------------------- |
| `zaman_state`       | Timer state & settings |
| `zaman_analytics`   | Daily pomodoro counts  |
| `zaman_guest_pomos` | Guest session counter  |
| `tikitak_lang`      | Language preference    |
| `zaman_theme`       | Dark/light theme       |

### Cloud (Firestore `users/{uid}`)

```json
{
  "analytics": { "2026-03-05": 5 },
  "settings": { "work": 25, "short": 5, "long": 15 },
  "updatedAt": 1234567890
}
```

---

## Firestore Security Rules

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

## Tech Stack

| Technology                            | Purpose            |
| ------------------------------------- | ------------------ |
| HTML5 / CSS3 / JavaScript             | Frontend           |
| Web Audio API                         | Sound synthesis    |
| Open-Meteo API                        | Weather data       |
| Screen Wake Lock API                  | Keep screen on     |
| Fullscreen API                        | Mobile fullscreen  |
| Firebase Auth + Firestore             | Login & cloud sync |
| Google Fonts (Bebas Neue, Space Mono) | Typography         |

---

## License

MIT License — free to use, modify, and distribute.

---

_TIKITAK — make every second count._
