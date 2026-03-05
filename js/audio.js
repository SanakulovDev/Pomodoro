// ============================================================
// audio.js — Sound effects (alert chimes, rain audio)
// ============================================================
let audioCtx = null;
let rainAudioNodes = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, dur, type = 'sine', gain = 0.5, delay = 0) {
  try {
    const ctx = getAudioCtx(), o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination); o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    g.gain.setValueAtTime(0, ctx.currentTime + delay);
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + delay + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
    o.start(ctx.currentTime + delay); o.stop(ctx.currentTime + delay + dur);
  } catch(e) {}
}

function playAlertSound() {
  playTone(880, 2, 'sine', 0.6);
  playTone(1046, 1.8, 'sine', 0.5, 0.15);
  playTone(1318, 2, 'sine', 0.5, 0.3);
  playTone(1568, 2.5, 'sine', 0.4, 0.5);
  playTone(880, 2, 'sine', 0.3, 0.8);
  setTimeout(() => {
    playTone(880, 2, 'sine', 0.5);
    playTone(1318, 2, 'sine', 0.4, 0.2);
    playTone(1568, 2, 'sine', 0.4, 0.4);
  }, 1500);
}

function startRainAudio() {
  try {
    const ctx = getAudioCtx();
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1);
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer; whiteNoise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 400;
    const gain = ctx.createGain(); gain.gain.value = 0.04;
    whiteNoise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    whiteNoise.start();
    rainAudioNodes = { source: whiteNoise, gain, filter };
  } catch(e) {}
}

function stopRainAudio() {
  if (rainAudioNodes) { try { rainAudioNodes.source.stop(); } catch(e) {} rainAudioNodes = null; }
}
