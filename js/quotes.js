// ============================================================
// quotes.js — Internet-fetched daily quote per user
// ============================================================
const QUOTE_CACHE_KEY = 'tikitak_daily_quote_cache_v2';
const QUOTE_MAX_LENGTH = 92;
const QUOTE_RETRY_MS = 30 * 60 * 1000;
const QUOTE_FETCH_TIMEOUT = 6000;
let quoteRequest = null;
let quoteAttempt = { key: '', at: 0 };
let translationRequests = {};
let translationAttempts = {};
let quoteEntityDecoder = null;

function getGuestQuoteId() {
  let id = localStorage.getItem('tikitak_guest_quote_id');
  if (!id) {
    id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    localStorage.setItem('tikitak_guest_quote_id', id);
  }
  return id;
}

function getQuoteUserKey() {
  if (typeof currentUser !== 'undefined' && currentUser && currentUser.uid) return currentUser.uid;
  return getGuestQuoteId();
}

function getQuoteDateKey() {
  const now = new Date();
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function decodeHtmlEntities(text) {
  if (!text) return '';
  if (!quoteEntityDecoder) quoteEntityDecoder = document.createElement('textarea');
  quoteEntityDecoder.innerHTML = String(text);
  return quoteEntityDecoder.value;
}

function normalizeQuoteText(text) {
  return decodeHtmlEntities(text).replace(/\s+/g, ' ').trim();
}

function shortenQuoteText(text, maxLen) {
  const clean = normalizeQuoteText(text);
  if (clean.length <= maxLen) return clean;
  const trimmed = clean.slice(0, maxLen - 1);
  const lastSpace = trimmed.lastIndexOf(' ');
  return (lastSpace > 45 ? trimmed.slice(0, lastSpace) : trimmed).trimEnd() + '…';
}

function getQuoteLang() {
  return currentLang === 'uz' || currentLang === 'ru' ? currentLang : 'en';
}

function getRenderedQuoteText(quote) {
  if (!quote) return '';
  const lang = getQuoteLang();
  const translations = quote.translations || {};
  return lang === 'en' ? quote.quote : (translations[lang] || quote.quote);
}

function renderDailyQuote(quote) {
  const textEl = document.getElementById('dailyQuoteText');
  const authorEl = document.getElementById('dailyQuoteAuthor');
  if (!textEl || !authorEl) return;

  if (!quote || !quote.quote || !quote.author) {
    textEl.textContent = t('quoteUnavailable');
    authorEl.textContent = t('quoteSource');
    return;
  }

  textEl.textContent = shortenQuoteText(getRenderedQuoteText(quote), QUOTE_MAX_LENGTH);
  authorEl.textContent = quote.author;
}

function loadCachedQuote() {
  const raw = localStorage.getItem(QUOTE_CACHE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch(e) { return null; }
}

function saveCachedQuote(data) {
  localStorage.setItem(QUOTE_CACHE_KEY, JSON.stringify(data));
}

function updateCachedQuoteTranslation(lang, translatedText) {
  const cache = loadCachedQuote();
  if (!cache || !cache.quote || !translatedText) return null;
  cache.translations = cache.translations || {};
  cache.translations[lang] = normalizeQuoteText(translatedText);
  saveCachedQuote(cache);
  return cache;
}

async function fetchJsonWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), QUOTE_FETCH_TIMEOUT);
  try {
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    if (!res.ok) throw new Error('Quote fetch failed: ' + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchQuotePool(seed) {
  const url = 'https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent('https://zenquotes.io/api/quotes');
  const data = await fetchJsonWithTimeout(url);
  const quotes = Array.isArray(data) ? data : [];
  const usable = quotes
    .filter(q => q && q.q && q.a)
    .map(q => ({ quote: normalizeQuoteText(q.q), author: normalizeQuoteText(q.a) }))
    .filter(q => q.quote.length > 0 && q.author.length > 0);
  if (usable.length) return usable;
  throw new Error('Quote fetch failed');
}

async function fetchQuoteTranslation(text, targetLang) {
  const pair = 'en|' + targetLang;
  const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=' + encodeURIComponent(pair);
  const data = await fetchJsonWithTimeout(url);
  const translated = normalizeQuoteText(data && data.responseData && data.responseData.translatedText);
  if (translated) return translated;
  throw new Error('Translation fetch failed');
}

function pickDailyQuote(quotes, seed) {
  if (!quotes.length) return null;
  const shortQuotes = quotes.filter(q => q.quote.length <= QUOTE_MAX_LENGTH);
  const pool = shortQuotes.length ? shortQuotes : quotes;
  return pool[seed % pool.length];
}

function maybeTranslateCachedQuote(cache) {
  if (!cache || !cache.quote) return;
  const lang = getQuoteLang();
  if (lang === 'en') return;
  cache.translations = cache.translations || {};
  if (cache.translations[lang]) return;

  const requestKey = cache.userKey + '|' + cache.dateKey + '|' + lang;
  if (translationRequests[requestKey]) return;
  if (translationAttempts[requestKey] && Date.now() - translationAttempts[requestKey] < QUOTE_RETRY_MS) return;

  translationAttempts[requestKey] = Date.now();
  translationRequests[requestKey] = (async () => {
    try {
      const translated = await fetchQuoteTranslation(cache.quote, lang);
      const updated = updateCachedQuoteTranslation(lang, translated);
      if (updated) renderDailyQuote(updated);
    } catch(e) {
    } finally {
      delete translationRequests[requestKey];
    }
  })();
}

async function updateDailyQuote() {
  const userKey = getQuoteUserKey();
  const dateKey = getQuoteDateKey();
  const cache = loadCachedQuote();
  const requestKey = userKey + '|' + dateKey;

  if (cache && cache.userKey === userKey && cache.dateKey === dateKey && cache.quote && cache.author) {
    renderDailyQuote(cache);
    maybeTranslateCachedQuote(cache);
    return;
  }

  if (cache && cache.quote && cache.author) renderDailyQuote(cache);
  if (quoteRequest) return quoteRequest;
  if (quoteAttempt.key === requestKey && Date.now() - quoteAttempt.at < QUOTE_RETRY_MS) return;

  const seed = hashString(userKey + '|' + dateKey);
  quoteAttempt = { key: requestKey, at: Date.now() };
  quoteRequest = (async () => {
    try {
      const quotes = await fetchQuotePool(seed);
      const picked = pickDailyQuote(quotes, seed);
      if (!picked) throw new Error('No usable quote');
      const payload = { userKey, dateKey, quote: picked.quote, author: picked.author, translations: {} };
      saveCachedQuote(payload);
      renderDailyQuote(payload);
      maybeTranslateCachedQuote(payload);
    } catch(e) {
      if (cache && cache.quote && cache.author) renderDailyQuote(cache);
      else renderDailyQuote(null);
    } finally {
      quoteRequest = null;
    }
  })();
  return quoteRequest;
}
