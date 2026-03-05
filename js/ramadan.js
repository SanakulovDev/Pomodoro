// ============================================================
// ramadan.js — Ramadan 2026 timetable and countdown
// ============================================================
const RAMADAN_2026 = [
  {d:'2026-02-18',s:'05:57',i:'18:04'},{d:'2026-02-19',s:'05:56',i:'18:05'},
  {d:'2026-02-20',s:'05:54',i:'18:06'},{d:'2026-02-21',s:'05:53',i:'18:07'},
  {d:'2026-02-22',s:'05:52',i:'18:08'},{d:'2026-02-23',s:'05:50',i:'18:09'},
  {d:'2026-02-24',s:'05:49',i:'18:10'},{d:'2026-02-25',s:'05:47',i:'18:11'},
  {d:'2026-02-26',s:'05:46',i:'18:12'},{d:'2026-02-27',s:'05:44',i:'18:13'},
  {d:'2026-02-28',s:'05:43',i:'18:14'},{d:'2026-03-01',s:'05:41',i:'18:16'},
  {d:'2026-03-02',s:'05:40',i:'18:17'},{d:'2026-03-03',s:'05:38',i:'18:18'},
  {d:'2026-03-04',s:'05:36',i:'18:20'},{d:'2026-03-05',s:'05:34',i:'18:22'},
  {d:'2026-03-06',s:'05:33',i:'18:23'},{d:'2026-03-07',s:'05:31',i:'18:24'},
  {d:'2026-03-08',s:'05:29',i:'18:25'},{d:'2026-03-09',s:'05:28',i:'18:26'},
  {d:'2026-03-10',s:'05:26',i:'18:27'},{d:'2026-03-11',s:'05:24',i:'18:28'},
  {d:'2026-03-12',s:'05:23',i:'18:30'},{d:'2026-03-13',s:'05:21',i:'18:31'},
  {d:'2026-03-14',s:'05:19',i:'18:32'},{d:'2026-03-15',s:'05:17',i:'18:33'},
  {d:'2026-03-16',s:'05:15',i:'18:34'},{d:'2026-03-17',s:'05:13',i:'18:35'},
  {d:'2026-03-18',s:'05:11',i:'18:37'}
];

function updateRamadan() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const entry = RAMADAN_2026.find(r => r.d === today);
  const card = document.getElementById('ramadanCard');

  if (!entry) { card.classList.remove('visible'); return; }
  card.classList.add('visible');

  const dayNum = RAMADAN_2026.indexOf(entry) + 1;
  document.getElementById('ramadanDay').textContent = currentLang === 'uz' ? dayNum + t('dayLabel') : t('dayLabel') + ' ' + dayNum;
  document.getElementById('saharTime').textContent = entry.s;
  document.getElementById('iftorTime').textContent = entry.i;

  const [sh, sm] = entry.s.split(':').map(Number);
  const [ih, im] = entry.i.split(':').map(Number);
  const saharDate = new Date(now); saharDate.setHours(sh, sm, 0, 0);
  const iftorDate = new Date(now); iftorDate.setHours(ih, im, 0, 0);

  let label, diff;
  if (now < saharDate) { label = t('untilSuhoor'); diff = saharDate - now; }
  else if (now < iftorDate) { label = t('untilIftar'); diff = iftorDate - now; }
  else {
    const nextIdx = RAMADAN_2026.indexOf(entry) + 1;
    if (nextIdx < RAMADAN_2026.length) {
      const next = RAMADAN_2026[nextIdx];
      const [nh, nm] = next.s.split(':').map(Number);
      const nextSahar = new Date(now); nextSahar.setDate(nextSahar.getDate() + 1); nextSahar.setHours(nh, nm, 0, 0);
      label = t('untilSuhoor'); diff = nextSahar - now;
    } else { label = t('ramadanEnd'); diff = 0; }
  }

  document.getElementById('countdownLabel').textContent = label;
  if (diff > 0) {
    const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
    document.getElementById('countdownTime').textContent =
      String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  } else { document.getElementById('countdownTime').textContent = '--:--:--'; }
}
