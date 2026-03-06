// ============================================================
// weather.js — Live weather fetch and background rendering
// ============================================================
let currentWeather = 'clear';
let weatherData = { temperature: null, isDay: true };
let _userInteracted = false;

function getWeatherType(code) {
  if ([95, 96, 99].includes(code)) return 'storm';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([45, 48].includes(code)) return 'fog';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
  if ([1, 2, 3].includes(code)) return 'cloudy';
  return 'clear';
}

function getWeatherLabelKey(type) {
  const labels = {
    clear: 'weatherClear',
    cloudy: 'weatherCloudy',
    rain: 'weatherRain',
    snow: 'weatherSnow',
    fog: 'weatherFog',
    storm: 'weatherStorm'
  };
  return labels[type] || 'weatherClear';
}

function getWeatherIcon(type, isDay) {
  if (type === 'storm') return '⛈️';
  if (type === 'rain') return '🌧️';
  if (type === 'snow') return '❄️';
  if (type === 'fog') return '🌫️';
  if (type === 'cloudy') return isDay ? '☁️' : '☁️';
  return isDay ? '☀️' : '🌙';
}

// Browsers block AudioContext until user gesture — unlock on first interaction
function _unlockAudio() {
  if (_userInteracted) return;
  _userInteracted = true;
  // Resume suspended AudioContext if exists
  if (typeof audioCtx !== 'undefined' && audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  // Start rain audio now if it's currently raining but audio wasn't started
  if ((currentWeather === 'rain' || currentWeather === 'storm') && !rainAudioNodes) {
    startRainAudio();
  }
}
['click', 'touchstart', 'keydown'].forEach(ev =>
  document.addEventListener(ev, _unlockAudio, { once: false, passive: true })
);

async function fetchWeather() {
  try {
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.3&longitude=69.28&current_weather=true');
    const d = await r.json();
    const cw = d.current_weather || {};
    const code = cw.weathercode;
    weatherData.temperature = typeof cw.temperature === 'number' ? Math.round(cw.temperature) : null;
    weatherData.isDay = cw.is_day !== 0;
    currentWeather = getWeatherType(code);
    renderWeather();
  } catch(e) { currentWeather = 'clear'; renderWeather(); }
}

function updateWeatherBadge() {
  const panel = document.getElementById('weatherPanel');
  if (!panel) return;
  panel.className = `weather-panel ${currentWeather} ${weatherData.isDay ? 'day' : 'night'}`;
  document.getElementById('weatherKicker').textContent = t('weatherNow');
  document.getElementById('weatherIcon').textContent = getWeatherIcon(currentWeather, weatherData.isDay);
  document.getElementById('weatherLabel').textContent = t(getWeatherLabelKey(currentWeather));
  document.getElementById('weatherTemp').textContent = weatherData.temperature == null ? '--°' : weatherData.temperature + '°C';
  document.getElementById('weatherLocation').textContent = t('weatherLocation');
}

function renderWeather() {
  const bg = document.getElementById('weatherBg');
  const el = document.getElementById('weatherElements');
  bg.className = `${currentWeather} ${weatherData.isDay ? 'day' : 'night'}`; el.innerHTML = '';
  stopRainAudio();

  if (currentWeather === 'storm') {
    for (let i = 0; i < 5; i++) {
      const cloud = document.createElement('div'); cloud.className = 'cloud storm-cloud';
      const w = 220 + Math.random() * 280, h = 90 + Math.random() * 70;
      cloud.style.width = w + 'px'; cloud.style.height = h + 'px';
      cloud.style.top = (4 + Math.random() * 28) + '%';
      cloud.style.animationDuration = (18 + Math.random() * 16) + 's';
      cloud.style.animationDelay = (-Math.random() * 25) + 's';
      el.appendChild(cloud);
    }
    for (let i = 0; i < 65; i++) {
      const drop = document.createElement('div'); drop.className = 'raindrop storm-drop';
      drop.style.left = Math.random() * 100 + '%';
      drop.style.height = (14 + Math.random() * 20) + 'px';
      drop.style.animationDuration = (0.45 + Math.random() * 0.45) + 's';
      drop.style.animationDelay = Math.random() * 2 + 's';
      drop.style.opacity = 0.25 + Math.random() * 0.45;
      el.appendChild(drop);
    }
    for (let i = 0; i < 3; i++) {
      const flash = document.createElement('div'); flash.className = 'lightning-flash';
      flash.style.animationDelay = (-Math.random() * 7) + 's';
      flash.style.animationDuration = (5 + Math.random() * 2) + 's';
      el.appendChild(flash);
    }
    const mist = document.createElement('div'); mist.className = 'rain-mist';
    el.appendChild(mist);
    if (_userInteracted) startRainAudio();
  } else if (currentWeather === 'rain') {
    for (let i = 0; i < 4; i++) {
      const cloud = document.createElement('div'); cloud.className = 'cloud rain-cloud';
      const w = 240 + Math.random() * 240, h = 90 + Math.random() * 50;
      cloud.style.width = w + 'px'; cloud.style.height = h + 'px';
      cloud.style.top = (2 + Math.random() * 12) + '%';
      cloud.style.animationDuration = (24 + Math.random() * 18) + 's';
      cloud.style.animationDelay = (-Math.random() * 24) + 's';
      el.appendChild(cloud);
    }
    for (let i = 0; i < 80; i++) {
      const drop = document.createElement('div'); drop.className = 'raindrop';
      drop.style.left = Math.random() * 100 + '%';
      drop.style.height = (15 + Math.random() * 25) + 'px';
      drop.style.animationDuration = (0.4 + Math.random() * 0.6) + 's';
      drop.style.animationDelay = Math.random() * 2 + 's';
      drop.style.opacity = 0.3 + Math.random() * 0.5;
      el.appendChild(drop);
    }
    const mist = document.createElement('div'); mist.className = 'rain-mist';
    el.appendChild(mist);
    // Only start audio after user interaction (browser autoplay policy)
    if (_userInteracted) startRainAudio();
  } else if (currentWeather === 'snow') {
    const drift = document.createElement('div'); drift.className = 'snow-drift';
    el.appendChild(drift);
    for (let i = 0; i < 70; i++) {
      const flake = document.createElement('div'); flake.className = 'snowflake';
      flake.style.left = Math.random() * 100 + '%';
      const size = 3 + Math.random() * 6;
      flake.style.width = size + 'px'; flake.style.height = size + 'px';
      flake.style.animationDuration = (4 + Math.random() * 6) + 's';
      flake.style.animationDelay = Math.random() * 5 + 's';
      flake.style.opacity = 0.3 + Math.random() * 0.6;
      el.appendChild(flake);
    }
  } else if (currentWeather === 'fog') {
    for (let i = 0; i < 5; i++) {
      const band = document.createElement('div'); band.className = 'fog-band';
      band.style.top = (14 + i * 13) + '%';
      band.style.animationDuration = (18 + Math.random() * 18) + 's';
      band.style.animationDelay = (-Math.random() * 10) + 's';
      band.style.opacity = 0.12 + Math.random() * 0.12;
      el.appendChild(band);
    }
  } else if (currentWeather === 'cloudy') {
    if (weatherData.isDay) {
      const haze = document.createElement('div'); haze.className = 'cloud-haze';
      el.appendChild(haze);
    }
    for (let i = 0; i < 8; i++) {
      const cloud = document.createElement('div'); cloud.className = 'cloud' + (i < 3 ? ' near' : '');
      const w = 200 + Math.random() * 300, h = 80 + Math.random() * 60;
      cloud.style.width = w + 'px'; cloud.style.height = h + 'px';
      cloud.style.top = (5 + Math.random() * 40) + '%';
      cloud.style.animationDuration = (30 + Math.random() * 40) + 's';
      cloud.style.animationDelay = (-Math.random() * 40) + 's';
      el.appendChild(cloud);
    }
  } else {
    const glow = document.createElement('div'); glow.className = 'sky-glow';
    el.appendChild(glow);
    if (weatherData.isDay) {
      const sun = document.createElement('div'); sun.className = 'sun';
      for (let i = 0; i < 8; i++) {
        const ray = document.createElement('div'); ray.className = 'sun-ray';
        ray.style.transform = `rotate(${i * 45}deg)`;
        ray.style.animationDelay = (-i * 2.5) + 's';
        sun.appendChild(ray);
      }
      el.appendChild(sun);
    } else {
      const moon = document.createElement('div'); moon.className = 'moon';
      el.appendChild(moon);
      for (let i = 0; i < 26; i++) {
        const star = document.createElement('div'); star.className = 'star';
        star.style.left = (6 + Math.random() * 82) + '%';
        star.style.top = (6 + Math.random() * 52) + '%';
        star.style.animationDelay = (-Math.random() * 4) + 's';
        star.style.animationDuration = (2.8 + Math.random() * 3.2) + 's';
        el.appendChild(star);
      }
    }
  }
  updateWeatherBadge();
}
