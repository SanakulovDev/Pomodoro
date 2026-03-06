// ============================================================
// i18n.js — Localization (translations, t(), applyLang, toggleLang)
// ============================================================
const I18N = {
  en: {
    authSub: 'Pomodoro Timer',
    authDesc: 'Sign in with Google is <strong>free</strong>.<br>Your data is <strong>synced across all devices</strong>.',
    googleLogin: 'Sign in with Google',
    authSkip: 'Skip for now',
    ramadan: 'RAMADAN',
    suhoor: 'Suhoor', iftar: 'Iftar',
    work: 'WORK', shortBreak: 'BREAK', longBreak: 'LONG BREAK',
    workTime: 'WORK TIME', shortTime: 'SHORT BREAK', longTime: 'LONG BREAK',
    clickStart: '▶ Click to start',
    clickPause: '⏸ Click to pause',
    clickResume: '▶ Click to resume',
    logout: '⏻ Log out',
    untilIftar: 'UNTIL IFTAR', untilSuhoor: 'UNTIL SUHOOR',
    ramadanEnd: 'RAMADAN ENDED',
    dayLabel: 'DAY',
    pomoDone: '🎉 Pomodoro complete!',
    breakDone: '⚡ Break is over!',
    limitedMode: '⚠️ Limited mode',
    loggedOut: '👋 Logged out',
    cloudLoaded: '☁️ Data loaded',
    signingIn: 'Signing in...',
    signIn: 'Sign In',
    weatherNow: 'CURRENT WEATHER',
    weatherClear: 'Clear sky',
    weatherCloudy: 'Cloudy',
    weatherRain: 'Rain',
    weatherSnow: 'Snow',
    weatherFog: 'Fog',
    weatherStorm: 'Thunderstorm',
    weatherLocation: 'Tashkent',
  },
  uz: {
    authSub: 'Pomodoro taymer',
    authDesc: 'Google bilan kirish <strong>bepul</strong>.<br>Ma\'lumotlaringiz <strong>barcha qurilmalarda saqlanadi</strong>.',
    googleLogin: 'Google bilan kirish',
    authSkip: 'Hozircha o\'tkazib yuborish',
    ramadan: 'RAMAZON',
    suhoor: 'Saharlik', iftar: 'Iftorlik',
    work: 'ISHLASH', shortBreak: 'DAM', longBreak: 'UZUN DAM',
    workTime: 'ISHLASH VAQTI', shortTime: 'QISQA DAM', longTime: 'UZUN DAM',
    clickStart: '▶ Boshlash uchun bosing',
    clickPause: '⏸ To\'xtatish uchun bosing',
    clickResume: '▶ Davom ettirish uchun bosing',
    logout: '⏻ Chiqish',
    untilIftar: 'IFTORGA QOLDI', untilSuhoor: 'SAHARGA QOLDI',
    ramadanEnd: 'RAMAZON TUGADI',
    dayLabel: '-KUN',
    pomoDone: '🎉 Pomodoro tugadi!',
    breakDone: '⚡ Dam olish tugadi!',
    limitedMode: '⚠️ Cheklangan rejim',
    loggedOut: '👋 Chiqildi',
    cloudLoaded: '☁️ Ma\'lumotlar yuklandi',
    signingIn: 'Kirish...',
    signIn: 'Kirish',
    weatherNow: 'HOZIRGI OB-HAVO',
    weatherClear: 'Ochiq osmon',
    weatherCloudy: 'Bulutli',
    weatherRain: 'Yomg\'ir',
    weatherSnow: 'Qor',
    weatherFog: 'Tuman',
    weatherStorm: 'Momaqaldiroq',
    weatherLocation: 'Toshkent',
  },
  ru: {
    authSub: 'Помодоро таймер',
    authDesc: 'Вход через Google — <strong>бесплатно</strong>.<br>Ваши данные <strong>синхронизируются на всех устройствах</strong>.',
    googleLogin: 'Войти через Google',
    authSkip: 'Пропустить',
    ramadan: 'РАМАДАН',
    suhoor: 'Сухур', iftar: 'Ифтар',
    work: 'РАБОТА', shortBreak: 'ПЕРЕРЫВ', longBreak: 'ДЛИН. ПЕРЕРЫВ',
    workTime: 'ВРЕМЯ РАБОТЫ', shortTime: 'ПЕРЕРЫВ', longTime: 'ДЛИННЫЙ ПЕРЕРЫВ',
    clickStart: '▶ Нажмите чтобы начать',
    clickPause: '⏸ Нажмите чтобы остановить',
    clickResume: '▶ Нажмите чтобы продолжить',
    logout: '⏻ Выйти',
    untilIftar: 'ДО ИФТАРА', untilSuhoor: 'ДО СУХУРА',
    ramadanEnd: 'РАМАДАН ЗАВЕРШЁН',
    dayLabel: 'ДЕНЬ',
    pomoDone: '🎉 Помодоро завершён!',
    breakDone: '⚡ Перерыв окончен!',
    limitedMode: '⚠️ Ограниченный режим',
    loggedOut: '👋 Вы вышли',
    cloudLoaded: '☁️ Данные загружены',
    signingIn: 'Вход...',
    signIn: 'Войти',
    weatherNow: 'ПОГОДА СЕЙЧАС',
    weatherClear: 'Ясно',
    weatherCloudy: 'Облачно',
    weatherRain: 'Дождь',
    weatherSnow: 'Снег',
    weatherFog: 'Туман',
    weatherStorm: 'Гроза',
    weatherLocation: 'Ташкент',
  }
};

let currentLang = localStorage.getItem('tikitak_lang') || 'en';

function t(key) { return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key; }

function applyLang() {
  document.documentElement.lang = currentLang;
  document.getElementById('langBtn').textContent = currentLang.toUpperCase();
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  if (typeof state !== 'undefined') {
    const labels = { work: t('workTime'), short: t('shortTime'), long: t('longTime') };
    document.getElementById('modeLabel').textContent = labels[state.mode];
  }
  if (typeof updateWeatherBadge === 'function') updateWeatherBadge();
}

function toggleLang() {
  const langs = ['en', 'ru', 'uz'];
  currentLang = langs[(langs.indexOf(currentLang) + 1) % langs.length];
  localStorage.setItem('tikitak_lang', currentLang);
  applyLang();
  if (typeof updateRamadan === 'function') updateRamadan();
}
