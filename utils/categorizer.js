// utils/categorizer.js
// Domain → Kategori eşleştirme utility'si

import { CATEGORY_MAP } from './constants.js';

export function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

// URL / başlık anahtar kelimesine göre kategori kuralları
const KEYWORD_RULES = [
  { pattern: /film|movie|video|youtube|netflix|twitch|izle|dizi|anime|sinema/, category: 'media' },
  { pattern: /shop|sepet|store|cart|buy|alışveriş|alisveris|sipariş|siparis/, category: 'shopping' },
  { pattern: /news|haber|gazette|journal|breaking/, category: 'news' },
  { pattern: /github|stackoverflow|gitlab|devdocs|npmjs|developer\./, category: 'development' },
  { pattern: /twitter|instagram|facebook|reddit|tiktok/, category: 'social' },
  { pattern: /gmail|mail\.|outlook|inbox/, category: 'communication' },
  { pattern: /notion|trello|asana|jira|figma/, category: 'productivity' },
  { pattern: /wikipedia|arxiv|scholar\.google|research|paper/, category: 'research' },
];

/**
 * URL, başlık ve domain'e göre kategorize et.
 * Önce URL/başlık keyword analizi, sonra statik CATEGORY_MAP fallback.
 * @param {string} url
 * @param {string} title
 * @param {string} domain
 * @returns {string} kategori adı
 */
export function categorize(url, title, domain) {
  const urlLower = (url || '').toLowerCase();
  const titleLower = (title || '').toLowerCase();

  for (const { pattern, category } of KEYWORD_RULES) {
    if (pattern.test(urlLower) || pattern.test(titleLower)) {
      return category;
    }
  }

  if (CATEGORY_MAP[domain]) return CATEGORY_MAP[domain];

  const parts = (domain || '').split('.');
  if (parts.length > 2) {
    const parent = parts.slice(-2).join('.');
    if (CATEGORY_MAP[parent]) return CATEGORY_MAP[parent];
  }

  return 'other';
}
