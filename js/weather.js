// ============================================================
// weather.js — Live weather fetch and background rendering
// ============================================================
let currentWeather = 'clear';

async function fetchWeather() {
  try {
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.3&longitude=69.28&current_weather=true');
    const d = await r.json();
    const code = d.current_weather.weathercode;
    if ([61,63,65,66,67,80,81,82,95,96,99].includes(code)) currentWeather = 'rain';
    else if ([71,73,75,77,85,86].includes(code)) currentWeather = 'snow';
    else if ([45,48,1,2,3].includes(code)) currentWeather = 'cloudy';
    else currentWeather = 'clear';
    renderWeather();
  } catch(e) { currentWeather = 'clear'; renderWeather(); }
}

function renderWeather() {
  const bg = document.getElementById('weatherBg');
  const el = document.getElementById('weatherElements');
  bg.className = currentWeather; el.innerHTML = '';
  stopRainAudio();

  if (currentWeather === 'rain') {
    for (let i = 0; i < 80; i++) {
      const drop = document.createElement('div'); drop.className = 'raindrop';
      drop.style.left = Math.random() * 100 + '%';
      drop.style.height = (15 + Math.random() * 25) + 'px';
      drop.style.animationDuration = (0.4 + Math.random() * 0.6) + 's';
      drop.style.animationDelay = Math.random() * 2 + 's';
      drop.style.opacity = 0.3 + Math.random() * 0.5;
      el.appendChild(drop);
    }
    startRainAudio();
  } else if (currentWeather === 'snow') {
    for (let i = 0; i < 50; i++) {
      const flake = document.createElement('div'); flake.className = 'snowflake';
      flake.style.left = Math.random() * 100 + '%';
      const size = 3 + Math.random() * 6;
      flake.style.width = size + 'px'; flake.style.height = size + 'px';
      flake.style.animationDuration = (4 + Math.random() * 6) + 's';
      flake.style.animationDelay = Math.random() * 5 + 's';
      flake.style.opacity = 0.3 + Math.random() * 0.6;
      el.appendChild(flake);
    }
  } else if (currentWeather === 'cloudy') {
    for (let i = 0; i < 6; i++) {
      const cloud = document.createElement('div'); cloud.className = 'cloud';
      const w = 200 + Math.random() * 300, h = 80 + Math.random() * 60;
      cloud.style.width = w + 'px'; cloud.style.height = h + 'px';
      cloud.style.top = (5 + Math.random() * 40) + '%';
      cloud.style.animationDuration = (30 + Math.random() * 40) + 's';
      cloud.style.animationDelay = (-Math.random() * 40) + 's';
      el.appendChild(cloud);
    }
  } else {
    const sun = document.createElement('div'); sun.className = 'sun';
    for (let i = 0; i < 8; i++) {
      const ray = document.createElement('div'); ray.className = 'sun-ray';
      ray.style.transform = `rotate(${i * 45}deg)`;
      ray.style.animationDelay = (-i * 2.5) + 's';
      sun.appendChild(ray);
    }
    el.appendChild(sun);
  }
}
