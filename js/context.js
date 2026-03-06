// ============================================================
// context.js — Time-based ambient visuals and contextual card
// ============================================================
function getContextPeriod(date) {
  const hour = date.getHours();
  if (hour < 6) return 'night';
  if (hour < 11) return 'morning';
  if (hour < 17) return 'day';
  if (hour < 21) return 'evening';
  return 'night';
}

function getContextIcon(period, weekend) {
  if (weekend) return '✨';
  if (period === 'morning') return '🌅';
  if (period === 'day') return '☀️';
  if (period === 'evening') return '🌇';
  return '🌙';
}

function getContextTextKeys(period, weekend) {
  if (weekend) return { pill: 'ctxWeekend', title: 'ctxWeekendTitle', sub: 'ctxWeekendSub' };
  const cap = period.charAt(0).toUpperCase() + period.slice(1);
  return {
    pill: 'ctx' + cap,
    title: 'ctx' + cap + 'Title',
    sub: 'ctx' + cap + 'Sub'
  };
}

function updateContextScene() {
  const now = new Date();
  const period = getContextPeriod(now);
  const weekend = now.getDay() === 0 || now.getDay() === 6;

  document.body.classList.remove('context-morning', 'context-day', 'context-evening', 'context-night', 'context-weekend');
  document.body.classList.add('context-' + period);
  if (weekend) document.body.classList.add('context-weekend');

  const keys = getContextTextKeys(period, weekend);
  const weatherType = typeof currentWeather === 'string' ? currentWeather : 'clear';
  const isDay = typeof weatherData !== 'undefined' ? weatherData.isDay : period !== 'night';

  const pill = document.getElementById('contextPill');
  const title = document.getElementById('contextTitle');
  const sub = document.getElementById('contextSubtitle');
  const weatherIcon = document.getElementById('contextWeatherIcon');
  const weatherText = document.getElementById('contextWeatherText');

  if (!pill || !title || !sub || !weatherIcon || !weatherText) return;

  pill.textContent = getContextIcon(period, weekend) + ' ' + t(keys.pill);
  title.textContent = t(keys.title);
  sub.textContent = t(keys.sub);

  if (typeof getWeatherIcon === 'function') weatherIcon.textContent = getWeatherIcon(weatherType, isDay);
  if (typeof getWeatherLabelKey === 'function') weatherText.textContent = t(getWeatherLabelKey(weatherType));
}
