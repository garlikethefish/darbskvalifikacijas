import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import axios from 'axios';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


// Serve statiskos failus profila atteliem
app.use('/assets/user_pfp', express.static(path.join(__dirname, 'src/assets/user_pfp')));
app.use('/assets/quiz_images', express.static(path.join(__dirname, 'src/assets/quiz_images')));
app.use('/assets/badges', express.static(path.join(__dirname, 'src/assets/badges')));

// Serve statiskos failus noklusejuma profila ikonam
app.use('/assets/default_pfp_icons', express.static(path.join(__dirname, 'src/assets/default_pfp_icons')));

// Serve statiskos failus avatara dalam
app.use('/assets/profile_parts', express.static(path.join(__dirname, 'src/assets/profile_parts')));

// ...esošais kods...

// Konfigure multer viktorinu attelu augšupieladem
const quizImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'src/assets/quiz_images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'quiz-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadQuizImage = multer({
  storage: quizImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

// Konfigure multer žetonu attelu augšupieladem
const badgeImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'src/assets/badges');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'badge-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadBadgeImage = multer({
  storage: badgeImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    if (allowedTypes.test(file.mimetype) && allowedTypes.test(path.extname(file.originalname).toLowerCase())) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

// Konfigure multer profila attelu augšupieladem
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'src/assets/user_pfp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'user-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

const db = mysql.createConnection(dbConfig);

const DEFAULT_COSMETIC_UNLOCKS = [
  {
    effectKey: 'rainbow_cursor',
    name: 'Rainbow Cursor',
    description: 'A colorful cursor trail with shifting tones.',
    type: 'cursor_trail',
    rarity: 'epic',
    milestoneType: 'quiz_completions',
    milestoneValue: 5
  },
  {
    effectKey: 'fluid_cursor',
    name: 'Fluid Cursor',
    description: 'A liquid style cursor trail.',
    type: 'cursor_trail',
    rarity: 'epic',
    milestoneType: 'review_count',
    milestoneValue: 10
  },
  {
    effectKey: 'smooth_wavy',
    name: 'Wavy Background',
    description: 'Smooth waves move across the profile background.',
    type: 'background_effect',
    rarity: 'rare',
    milestoneType: 'quiz_completions',
    milestoneValue: 3
  },
  {
    effectKey: 'flowing_ribbons',
    name: 'Flowing Ribbons',
    description: 'Layered ribbons move through the profile background.',
    type: 'background_effect',
    rarity: 'epic',
    milestoneType: 'follower_count',
    milestoneValue: 5
  }
];

// TMDB pamata konfiguracija
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_KEY = process.env.VITE_TMDB_API_KEY;

function resolveTmdbLanguage(raw) {
  const value = String(raw || '').toLowerCase();
  if (value.startsWith('lv')) return 'lv-LV';
  return 'en-US';
}

function resolveAppLanguage(raw) {
  const value = String(raw || '').toLowerCase();
  return value.startsWith('lv') ? 'lv' : 'en';
}

function hasMeaningfulText(value) {
  if (typeof value !== 'string') return false;
  const text = value.trim();
  if (!text) return false;
  if (/^[.\u2026\-\s]+$/.test(text)) return false;
  return true;
}

function normalizeOverview(value) {
  return hasMeaningfulText(value) ? value.trim() : '';
}

function shouldAutoTranslateForLatvian(primaryValue, fallbackValue) {
  const primary = typeof primaryValue === 'string' ? primaryValue.trim() : '';
  const fallback = typeof fallbackValue === 'string' ? fallbackValue.trim() : '';

  if (!hasMeaningfulText(primary) && hasMeaningfulText(fallback)) return true;
  if (hasMeaningfulText(primary) && hasMeaningfulText(fallback) && primary === fallback) return true;
  return false;
}

function cleanQuoteText(rawText) {
  let text = String(rawText || '');
  text = text.replace(/\[.*?\]/g, '');
  const colonIndex = text.indexOf(':');
  if (colonIndex !== -1) {
    text = text.substring(colonIndex + 1).trim();
  }
  return text.trim();
}

function detectReviewLanguage(...parts) {
  const text = parts
    .filter((value) => typeof value === 'string')
    .join(' ')
    .trim()
    .toLowerCase();

  if (!text) return 'unknown';

  const latvianChars = (text.match(/[āčēģīķļņšūž]/g) || []).length;
  const englishWords = (text.match(/\b(the|and|this|that|with|for|was|were|have|has|episode|show|great|good|bad|really|very|not|but)\b/g) || []).length;
  const latvianWords = (text.match(/\b(šis|bija|ļoti|labs|slikts|epizode|seriāls|šovs|man|tev|viņš|viņa|nav|bet|un|par|ar|kā)\b/g) || []).length;

  if (latvianChars > 0 || latvianWords > englishWords + 1) {
    return 'lv';
  }

  if (englishWords > latvianWords) {
    return 'en';
  }

  return 'unknown';
}

async function translateTextToLatvian(text) {
  return translateTextWithMyMemory(text, 'en', 'lv');
}

async function translateTextToEnglish(text) {
  return translateTextWithMyMemory(text, 'lv', 'en');
}

async function translateTextWithMyMemory(text, sourceLanguage, targetLanguage) {
  if (!hasMeaningfulText(text)) return text;

  // Dažiem publiskiem tulkošanas galapunktiem ir vaicājuma garuma ierobežojumi (≈500 rakstzīmes).
  // Saīsina garas ievades līdz šim izmēram un pievieno daudzpunkti, lai nepārsniegtu ierobežojumus
  // un lai tulkotā teksta vietā netiktu atgriezta kļūdas virkne.
  const MAX_Q_LEN = 500;
  const sourceText = String(text || '').trim();
  const requestText = sourceText.length > MAX_Q_LEN ? sourceText.slice(0, MAX_Q_LEN - 3) + '...' : sourceText;

  const cacheKey = `${sourceLanguage}|${targetLanguage}|${requestText}`;
  if (!global.__machineTranslationCache) {
    global.__machineTranslationCache = new Map();
  }
  if (global.__machineTranslationCache.has(cacheKey)) {
    return global.__machineTranslationCache.get(cacheKey);
  }

  try {
    const response = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: requestText,
        langpair: `${sourceLanguage}|${targetLanguage}`
      }
    });
    const translated = response.data?.responseData?.translatedText;
    const normalized = hasMeaningfulText(translated) ? translated.trim() : '';
    if (normalized && normalized !== sourceText) {
      global.__machineTranslationCache.set(cacheKey, normalized);
      return normalized;
    }
  } catch {}

  try {
    const fallbackResponse = await axios.get('https://translate.googleapis.com/translate_a/single', {
      params: {
        client: 'gtx',
        sl: sourceLanguage,
        tl: targetLanguage,
        dt: 't',
        q: requestText
      }
    });

    const chunks = Array.isArray(fallbackResponse.data?.[0]) ? fallbackResponse.data[0] : [];
    const translated = chunks
      .map((part) => (Array.isArray(part) ? String(part[0] || '') : ''))
      .join('')
      .trim();

    const result = hasMeaningfulText(translated) && translated !== sourceText ? translated : sourceText;
    global.__machineTranslationCache.set(cacheKey, result);
    return result;
  } catch {
    global.__machineTranslationCache.set(cacheKey, sourceText);
    return sourceText;
  }
}

function canAutoTranslateField(field) {
  if (typeof field !== 'string') return false;
  return !['name', 'title', 'original_name', 'original_title'].includes(field);
}

function normalizeTitleForCompare(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function resolveLatvianTitleWithFallback(primaryTitle, englishTitle) {
  const primary = hasMeaningfulText(primaryTitle) ? String(primaryTitle).trim() : '';
  const english = hasMeaningfulText(englishTitle) ? String(englishTitle).trim() : '';

  const shouldTranslateTitle = shouldAutoTranslateForLatvian(primary, english);

  if (primary && !shouldTranslateTitle) {
    return {
      title: primary,
      englishTitle: english || primary,
      machineTranslatedTitle: false
    };
  }

  if (!english) {
    return {
      title: '',
      englishTitle: '',
      machineTranslatedTitle: false
    };
  }

  const translated = await translateTextToLatvian(english);
  if (!hasMeaningfulText(translated)) {
    return {
      title: primary || english,
      englishTitle: english,
      machineTranslatedTitle: false
    };
  }

  const translatedTitle = translated.trim();
  if (normalizeTitleForCompare(translatedTitle) === normalizeTitleForCompare(english)) {
    return {
      title: primary || english,
      englishTitle: english,
      machineTranslatedTitle: false
    };
  }

  return {
    title: translatedTitle,
    englishTitle: english,
    machineTranslatedTitle: true
  };
}

async function tmdbGet(path, params = {}, language = 'en-US') {
  return axios.get(`${TMDB_BASE}${path}`, {
    params: {
      api_key: TMDB_KEY,
      language,
      ...params
    }
  });
}

async function tmdbGetWithFallback(path, params = {}, language = 'en-US', fields = ['name', 'overview']) {
  const primary = await tmdbGet(path, params, language);
  if (!language.startsWith('lv')) return primary;

  const primaryData = primary.data || {};
  const needsFallback = fields.some((field) => !hasMeaningfulText(primaryData[field]));
  if (!needsFallback) return primary;

  const fallback = await tmdbGet(path, params, 'en-US');
  const fallbackData = fallback.data || {};
  const merged = { ...fallbackData, ...primaryData };
  for (const field of (fields || [])) {
    const primaryValue = primaryData[field];
    const fallbackValue = fallbackData[field];

    let resolvedValue = hasMeaningfulText(primaryValue)
      ? primaryValue
      : (hasMeaningfulText(fallbackValue) ? fallbackValue : '');

    if (canAutoTranslateField(field) && shouldAutoTranslateForLatvian(primaryValue, fallbackValue) && hasMeaningfulText(fallbackValue)) {
      resolvedValue = await translateTextToLatvian(fallbackValue);
    }

    merged[field] = hasMeaningfulText(resolvedValue) ? resolvedValue : '';
  }

  return { ...primary, data: merged };
}

function getConnection() {
  return mysql.createConnection(dbConfig);
}

function getSeedSqlFromEnv() {
  if (process.env.DB_SEED_SQL_BASE64) {
    return Buffer.from(process.env.DB_SEED_SQL_BASE64, 'base64').toString('utf8');
  }

  if (process.env.DB_SEED_SQL_PATH) {
    const seedPath = path.isAbsolute(process.env.DB_SEED_SQL_PATH)
      ? process.env.DB_SEED_SQL_PATH
      : path.join(__dirname, process.env.DB_SEED_SQL_PATH);
    return fs.readFileSync(seedPath, 'utf8');
  }

  return process.env.DB_SEED_SQL || '';
}

function prepareSeedSql(sql) {
  return sql
    .replace(/^\s*CREATE DATABASE\b[^;]*;\s*/gim, '')
    .replace(/^\s*USE\s+`?[\w-]+`?\s*;\s*/gim, '');
}

async function maybeSeedDatabaseFromEnv() {
  if (process.env.RUN_DB_SEED !== 'true') return;

  const rawSql = getSeedSqlFromEnv();
  if (!rawSql.trim()) {
    console.warn('RUN_DB_SEED is true, but no seed SQL was provided');
    return;
  }

  const [[userCount]] = await db.promise().query('SELECT COUNT(*) AS count FROM users');
  if (userCount.count > 0 && process.env.DB_SEED_FORCE !== 'true') {
    console.log('database seed skipped because users already exist');
    return;
  }

  const seedConnection = mysql.createConnection({
    ...dbConfig,
    multipleStatements: true
  });

  try {
    await seedConnection.promise().query(prepareSeedSql(rawSql));
    console.log('database seed import completed');
  } finally {
    seedConnection.end();
  }
}
const cachedGenresByLang = {};
const genreCacheTimeByLang = {};
const GENRE_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

// Statiskas rezerves tulkošanas biežākajiem TMDB TV žanriem latviešu valodā.
// Tas nodrošina paredzamas lokalizētas etiķetes, nepaļaujoties uz trešās puses tulkošanu īsiem žanru nosaukumiem.
const STATIC_GENRE_TRANSLATIONS_LV = {
  'Action & Adventure': 'Darbība un piedzīvojumi',
  'Animation': 'Animācija',
  'Comedy': 'Komedija',
  'Crime': 'Noziegums',
  'Documentary': 'Dokumentālais',
  'Drama': 'Drāma',
  'Family': 'Ģimenes',
  'Kids': 'Bērniem',
  'Mystery': 'Mistērija',
  'News': 'Ziņas',
  'Reality': 'Realitāte',
  'Sci-Fi & Fantasy': 'Zinātniskā fantastika',
  'Soap': 'Seriāls',
  'Talk': 'Sarunu šovs',
  'War & Politics': 'Karš un politika',
  'Western': 'Rietumu'
};

async function getGenreMap(language = 'en-US') {
  if (cachedGenresByLang[language] && Date.now() - (genreCacheTimeByLang[language] || 0) < GENRE_CACHE_TTL) {
    return cachedGenresByLang[language];
  }

  const res = await tmdbGet('/genre/tv/list', {}, language);
  const genresList = res.data.genres || [];

  cachedGenresByLang[language] = {};

  // Pieprasot latviešu valodu, TMDB dažiem žanriem joprojām var atgriezt angliskus nosaukumus.
  // Iegūst angļu nosaukumus un automātiski tulko žanrus, kas sakrīt ar angļu tekstu.
  if (String(language || '').toLowerCase().startsWith('lv')) {
    let enMap = {};
    try {
      const enRes = await tmdbGet('/genre/tv/list', {}, 'en-US');
      (enRes.data.genres || []).forEach(g => { enMap[g.id] = g.name; });
    } catch (err) {
      enMap = {};
    }

    for (const g of genresList) {
      let name = g.name || '';
      const enName = enMap[g.id] || '';

      // Īsām žanru etiķetēm dod priekšroku statiskam tulkojumam, ja tas ir pieejams
      if (enName && STATIC_GENRE_TRANSLATIONS_LV[enName]) {
        name = STATIC_GENRE_TRANSLATIONS_LV[enName];
      } else if (enName && name && name === enName) {
        // Mašīntulkošanu mēģina tikai tad, kad TMDB latviešu pieprasījumam atgrieza angļu tekstu
        try {
          const translated = await translateTextToLatvian(enName);
          if (hasMeaningfulText(translated)) {
            name = translated.trim();
          }
        } catch (err) {
          // Ignorē tulkošanas kļūdas un atgriežas pie sākotnējā nosaukuma
        }
      }

      cachedGenresByLang[language][g.id] = name;
    }
  } else {
    genresList.forEach(g => {
      cachedGenresByLang[language][g.id] = g.name;
    });
  }

  genreCacheTimeByLang[language] = Date.now();
  return cachedGenresByLang[language];
}

function requireAuth(req, res, next) {
  const userId = req.headers.authorization;
  if (!userId || isNaN(userId)) return res.status(401).json({ message: 'Login required' });
  req.userId = parseInt(userId);
  next();
}

async function requireAdmin(req, res, next) {
  const [rows] = await db.promise().query('SELECT role FROM users WHERE id = ?', [req.userId]);
  if (rows.length === 0 || rows[0].role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// Pārbauda un piešķir lietotājam uz sasniegumiem balstītu kosmētiku
async function checkAndAwardMilestones(userId) {
  try {
    const [[reviewStat]] = await db.promise().query(
      'SELECT COUNT(*) AS cnt FROM reviews WHERE user_id = ?', [userId]
    );
    const [[followerStat]] = await db.promise().query(
      'SELECT COUNT(*) AS cnt FROM user_follows WHERE following_id = ?', [userId]
    );
    const [[quizStat]] = await db.promise().query(
      'SELECT COUNT(DISTINCT source_id) AS cnt FROM user_badges WHERE user_id = ? AND badge_source = "quiz"', [userId]
    );

    const stats = {
      review_count: reviewStat.cnt,
      follower_count: followerStat.cnt,
      quiz_completions: quizStat.cnt
    };

    const [sources] = await db.promise().query(
      `SELECT cs.cosmetic_id, cs.milestone_type, cs.milestone_value, c.name, c.type, c.rarity, c.effect_key
       FROM cosmetic_sources cs
       JOIN cosmetics c ON cs.cosmetic_id = c.id
       WHERE cs.source_type = 'milestone'`
    );

    const awarded = [];
    for (const src of sources) {
      const userVal = stats[src.milestone_type] || 0;
      if (userVal >= src.milestone_value) {
        try {
          await db.promise().query(
            'INSERT INTO user_cosmetics (user_id, cosmetic_id, source_detail) VALUES (?, ?, ?)',
            [userId, src.cosmetic_id, `milestone:${src.milestone_type}:${src.milestone_value}`]
          );
          awarded.push({ id: src.cosmetic_id, name: src.name, type: src.type, rarity: src.rarity, effect_key: src.effect_key });
          // Izveido paziņojumu par kosmētikas atbloķēšanu
          await db.promise().query(
            'INSERT INTO notifications (user_id, tmdb_series_id, notification_type, message) VALUES (?, 0, ?, ?)',
            [userId, 'cosmetic_unlock', `You unlocked a new cosmetic: ${src.name} (${src.rarity})`]
          ).catch(() => {});
        } catch (e) {
          if (e.code !== 'ER_DUP_ENTRY') console.error('Milestone award error:', e);
        }
      }
    }
    return awarded;
  } catch (err) {
    console.error('checkAndAwardMilestones error:', err);
    return [];
  }
}

async function ensureDefaultCosmeticUnlocks() {
  try {
    for (const item of DEFAULT_COSMETIC_UNLOCKS) {
      const [existingCosmetics] = await db.promise().query(
        'SELECT id FROM cosmetics WHERE effect_key = ? AND type = ? ORDER BY id ASC LIMIT 1',
        [item.effectKey, item.type]
      );

      let cosmeticId = existingCosmetics[0]?.id;
      if (!cosmeticId) {
        const [created] = await db.promise().query(
          'INSERT INTO cosmetics (name, description, type, effect_key, config, preview_image, rarity) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [item.name, item.description, item.type, item.effectKey, '{}', null, item.rarity]
        );
        cosmeticId = created.insertId;
      }

      const [existingSources] = await db.promise().query(
        `SELECT id FROM cosmetic_sources
         WHERE cosmetic_id = ?
           AND source_type = 'milestone'
           AND milestone_type = ?
           AND milestone_value = ?
         LIMIT 1`,
        [cosmeticId, item.milestoneType, item.milestoneValue]
      );

      if (!existingSources.length) {
        await db.promise().query(
          'INSERT INTO cosmetic_sources (cosmetic_id, source_type, quiz_id, min_score, milestone_type, milestone_value) VALUES (?, ?, ?, ?, ?, ?)',
          [cosmeticId, 'milestone', null, null, item.milestoneType, item.milestoneValue]
        );
      }

      await awardDefaultCosmeticToQualifiedUsers(cosmeticId, item);
    }
    console.log('default cosmetic unlock sources ready');
  } catch (err) {
    console.error('Error ensuring default cosmetic unlocks:', err);
  }
}

async function awardDefaultCosmeticToQualifiedUsers(cosmeticId, item) {
  const milestoneQueries = {
    review_count: `
      SELECT user_id, COUNT(*) AS cnt
      FROM reviews
      GROUP BY user_id
      HAVING cnt >= ?
    `,
    follower_count: `
      SELECT following_id AS user_id, COUNT(*) AS cnt
      FROM user_follows
      GROUP BY following_id
      HAVING cnt >= ?
    `,
    quiz_completions: `
      SELECT user_id, COUNT(DISTINCT source_id) AS cnt
      FROM user_badges
      WHERE badge_source = 'quiz'
      GROUP BY user_id
      HAVING cnt >= ?
    `
  };

  const query = milestoneQueries[item.milestoneType];
  if (!query) return;

  const [qualifiedUsers] = await db.promise().query(query, [item.milestoneValue]);
  for (const user of qualifiedUsers) {
    const [awardResult] = await db.promise().query(
      'INSERT IGNORE INTO user_cosmetics (user_id, cosmetic_id, source_detail) VALUES (?, ?, ?)',
      [user.user_id, cosmeticId, `milestone:${item.milestoneType}:${item.milestoneValue}`]
    );

    if (awardResult.affectedRows > 0) {
      await db.promise().query(
        'INSERT INTO notifications (user_id, tmdb_series_id, notification_type, message) VALUES (?, 0, ?, ?)',
        [user.user_id, 'cosmetic_unlock', `You unlocked a new cosmetic: ${item.name} (${item.rarity})`]
      ).catch(() => {});
    }
  }
}

// Veido ieteikumus konkrētam lietotāja ID. Atgriež ieteikumu objektu masīvu.
async function buildDiscoverForUser(userId, language = 'en-US') {
  const genreMap = await getGenreMap(language);
  const isLatvian = language.startsWith('lv');

  // 1. Iegūst visus seriālus, par kuriem lietotājs rakstījis atsauksmes (patikas skaita globāli), un atgriež tos
  // visus apskatītos seriālus un vēlāk izmanto svarus, lai dotu priekšroku augstākiem
  // vērtējumiem un populārām patikām.
  const [rows] = await db.promise().query(`
      SELECT
        r.tmdb_series_id,
        MAX(r.rating) AS rating,
        COUNT(DISTINCT rr.id) AS like_count
      FROM reviews r
      LEFT JOIN review_reactions rr
        ON rr.review_id = r.id
        AND rr.is_like = 1
      WHERE r.user_id = ?
      GROUP BY r.tmdb_series_id
    `, [userId]);

  if (!rows.length) {
    // rezerves kopa
    let fallbackResults = [];
    const sources = ['top_rated', 'popular'];
    for (const source of sources) {
      for (let page = 1; page <= 3; page++) {
        try {
          const r = await tmdbGet(`/tv/${source}`, { page }, language);
          fallbackResults.push(...(r.data.results || []));
        } catch (e) {}
        if (fallbackResults.length >= 120) break;
      }
      if (fallbackResults.length >= 120) break;
    }

    const seen = new Set();
    const deduped = [];
    for (const s of fallbackResults) {
      if (!s || seen.has(s.id)) continue;
      seen.add(s.id);
      deduped.push(s);
      if (deduped.length >= 60) break;
    }

    return deduped.map(show => {
      const vote = typeof show.vote_average === 'number' ? show.vote_average : 6.5;
      const scaled = Math.round(45 + (vote / 10) * 50);
      const jitter = Math.floor(Math.random() * 7) - 3;
      const score = Math.min(95, Math.max(40, scaled + jitter));
      const stars = Math.min(5, Math.max(1, Math.round(((score - 40) / 55) * 4) + 1));

      const genres = (show.genre_ids || []).map(id => genreMap[id]).filter(Boolean);
      const because = genres.length
        ? (isLatvian ? `Populārs ${genres[0]} ieteikums` : `Popular ${genres[0]} pick`)
        : (isLatvian ? 'Populāra izvēle' : 'Popular pick');

      return {
        id: show.id,
        tmdbId: show.id,
        title: show.name,
        poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
        genres,
        matchScore: score,
        matchStars: stars,
        because,
        becauseIsTitle: false
      };
    });
  }

  const likedSeriesIds = rows.map(r => r.tmdb_series_id);

  // Veido svērtu žanru profilu
  const genreWeights = {};
  const sourceSeries = [];

  await Promise.all(
    rows.map(async row => {
      const tmdbRes = await tmdbGetWithFallback(`/tv/${row.tmdb_series_id}`, {}, language, ['name', 'overview']);

      sourceSeries.push({
        id: row.tmdb_series_id,
        title: tmdbRes.data.name,
        genres: (tmdbRes.data.genres || []).map(g => g.id)
      });

      const weight = (row.rating || 7) + row.like_count * 2;

      (tmdbRes.data.genres || []).forEach(g => {
        genreWeights[g.id] = (genreWeights[g.id] || 0) + weight;
      });
    })
  );

  // Izvēlas vairākus galvenos žanrus (paplašināti) un vaicā pa žanriem, lai
  // palielinātu dažādību (novērš viena dominējoša žanra, piemēram,
  // Animācijas, pārsvaru rezultātos).
  const topGenreIds = Object.entries(genreWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  // Atklāšana no TMDB: katru galveno žanru vaicā atsevišķi un
  // apvieno rezultātus, lai nepārlāgotos vienam žanram.
  let results = [];
  for (const gid of topGenreIds) {
    for (let page = 1; page <= 3; page++) {
      try {
        const discoverRes = await tmdbGet('/discover/tv', {
          with_genres: gid,
          sort_by: 'popularity.desc',
          page
        }, language);
        results.push(...discoverRes.data.results);
      } catch (e) {
        // Ignorē atsevišķas kļūmes un turpina
      }
      if (results.length >= 120) break;
    }
    if (results.length >= 120) break;
  }

  results = results.filter(show => !likedSeriesIds.includes(show.id));

  // aizstājējzīme
  let wildcard = null;
  try {
    const wildcardRes = await tmdbGet('/trending/tv/week', {}, language);
    const wildcardCandidate = wildcardRes.data.results.find(s => !likedSeriesIds.includes(s.id));
    if (wildcardCandidate) {
      wildcard = {
        id: wildcardCandidate.id,
        tmdbId: wildcardCandidate.id,
        title: wildcardCandidate.name,
        poster: wildcardCandidate.poster_path ? `https://image.tmdb.org/t/p/w500${wildcardCandidate.poster_path}` : null,
        genres: wildcardCandidate.genre_ids.map(id => genreMap[id]).filter(Boolean),
        matchScore: 65,
        matchStars: Math.min(5, Math.max(1, Math.round(((65 - 40) / 55) * 4) + 1)),
        because: wildcardCandidate.name || 'Trending',
        becauseIsTitle: Boolean(wildcardCandidate.name)
      };
    }
  } catch (e) {}

  // Noņem dublikātus apvienotajos rezultātos pēc ID (patur pirmo gadījumu)
  const seenResults = new Set();
  const uniqueResults = [];
  for (const s of results) {
    if (!s || seenResults.has(s.id)) continue;
    seenResults.add(s.id);
    uniqueResults.push(s);
    if (uniqueResults.length >= 80) break;
  }

  const recommendations = uniqueResults.map(show => {
      const sharedGenres = (show.genre_ids || []).filter(id => genreWeights[id]);

      const totalSharedWeight = sharedGenres.reduce((s, id) => s + (genreWeights[id] || 0), 0);
      const maxWeight = Math.max(...Object.values(genreWeights), 1);
      let scaled = 40 + (totalSharedWeight / (maxWeight * 3)) * 55;
      const jitter = Math.floor(Math.random() * 7) - 3;
      scaled = Math.round((scaled || 40) + jitter);
      const score = Math.min(95, Math.max(40, scaled));

      let bestOverlap = 0;
      const candidates = [];
      for (const src of sourceSeries) {
        const overlap = (src.genres || []).filter(g => (show.genre_ids || []).includes(g)).length;
        if (overlap > bestOverlap) {
          bestOverlap = overlap;
          candidates.length = 0;
          candidates.push(src);
        } else if (overlap === bestOverlap) {
          candidates.push(src);
        }
      }

      let because = isLatvian ? 'Ieteikts jums' : 'Recommended for you';
      let becauseIsTitle = false;
      if (candidates.length && bestOverlap > 0) {
        const titles = [...new Set(candidates.map(c => c.title).filter(Boolean))];
        if (titles.length === 1) {
          because = titles[0];
          becauseIsTitle = true;
        } else if (titles.length > 1) {
          const short = titles.length <= 3 ? titles.join(' and ') : `${titles[0]} and others`;
          because = short;
          becauseIsTitle = true;
        }
      } else if (show.genre_ids && show.genre_ids.length) {
        const firstGenre = genreMap[show.genre_ids[0]];
        if (firstGenre) {
          because = isLatvian ? `šovi kā ${firstGenre}` : `shows like ${firstGenre}`;
          becauseIsTitle = false;
        }
      }

      const stars = Math.min(5, Math.max(1, Math.round(((score - 40) / 55) * 4) + 1));
      return {
        id: show.id,
        tmdbId: show.id,
        title: show.name,
        poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
        genres: (show.genre_ids || []).map(id => genreMap[id]).filter(Boolean),
        matchScore: score,
        matchStars: stars,
        because,
        becauseIsTitle
      };
    });

  if (wildcard) {
    recommendations.push(wildcard);
  }

  // Kārto pēc matchScore dilstoši, lai augstākās atbilstības būtu pirmās
  recommendations.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  return recommendations;
}

// Iegūst sērijas informāciju no TMDB
async function fetchEpisodeFromTMDB(seriesId, seasonNumber, episodeNumber, language = 'en-US') {
  const res = await tmdbGetWithFallback(
    `/tv/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`,
    {},
    language,
    ['name', 'overview']
  );
  return res.data; // includes episode title, air_date, still_path, etc.
}

// Dienas citats
app.get('/api/daily-quote', async (req, res) => {
  try {
    const language = resolveTmdbLanguage(req.query.lang);
    let response;
    let cleanedText = '';
    do {
      response = await axios.get('https://quotes.jepcd.com/quotes?short=true');
      cleanedText = cleanQuoteText(response.data?.text);
    } while (cleanedText.split(' ').length > 10);

    let text = cleanedText;
    if (language.startsWith('lv')) {
      text = await translateTextToLatvian(cleanedText);
    }

    res.json({ text, series: response.data?.show || '' });
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: 'Failed to fetch daily quote' });
  }
});

app.post('/api/translate', async (req, res) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text : '';
    const sourceLanguage = resolveAppLanguage(req.body?.sourceLanguage);
    const targetLanguage = resolveAppLanguage(req.body?.targetLanguage);

    if (!hasMeaningfulText(text)) {
      return res.status(400).json({ message: 'Text is required' });
    }

    if (sourceLanguage === targetLanguage) {
      return res.json({
        translatedText: text,
        sourceLanguage,
        targetLanguage
      });
    }

    if (sourceLanguage === 'en' && targetLanguage === 'lv') {
      const translatedText = await translateTextToLatvian(text);
      return res.json({ translatedText, sourceLanguage, targetLanguage });
    }

    if (sourceLanguage === 'lv' && targetLanguage === 'en') {
      const translatedText = await translateTextToEnglish(text);
      return res.json({ translatedText, sourceLanguage, targetLanguage });
    }

    return res.status(400).json({ message: 'Unsupported language pair' });
  } catch (error) {
    console.error('Translate error:', error);
    res.status(500).json({ message: 'Failed to translate text' });
  }
});

// Registracija
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  const hashedPassword = bcrypt.hashSync(password, 10);
  db.query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, hashedPassword, 'user'], (err) => {
      if (err) return res.status(500).json({ error: err.sqlMessage || 'Registration failed' });
      res.status(200).json({ message: 'User registered successfully' });
    });
});

// Pieteikšanas
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = results[0];
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.is_banned) return res.status(403).json({ error: 'Your account has been banned. Contact an administrator.' });

    res.json({
      message: 'Login successful',
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        profile_picture: user.profile_picture,
        selected_badge_id: user.selected_badge_id,
        active_cursor_trail: user.active_cursor_trail || null,
        active_background_effect: user.active_background_effect || null
      }
    });
  });
});

app.get('/api/discover', requireAuth, async (req, res) => {
  try {
    const language = resolveTmdbLanguage(req.query.lang);
    const recs = await buildDiscoverForUser(req.userId, language);
    res.json(recs);
  } catch (err) {
    console.error('Discover error:', err);
    res.status(500).json({ message: 'Failed to load discover feed' });
  }
});

// Emulē atklāšanu konkrētam lietotāja ID (bez autentifikācijas) - noder testēšanai
app.get('/api/discover/emulate/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (!userId || isNaN(userId)) return res.status(400).json({ message: 'Invalid user id' });

  try {
    const language = resolveTmdbLanguage(req.query.lang);
    const recs = await buildDiscoverForUser(userId, language);
    res.json(recs);
  } catch (err) {
    console.error('Emulate discover error:', err);
    res.status(500).json({ message: 'Failed to load emulate discover feed' });
  }
});

// Publiska atklāšana izstrādei/testēšanai (autentifikācija nav vajadzīga)
app.get('/api/discover/public', async (req, res) => {
  try {
    const language = resolveTmdbLanguage(req.query.lang);
    const isLatvian = language.startsWith('lv');
    const genreMap = await getGenreMap(language);

    // Veido lielāku, daudzveidīgu rezerves kopu (augsti vērtētie + populārie)
    let fallbackResults = [];
    const sources = ['top_rated', 'popular'];
    for (const source of sources) {
      for (let page = 1; page <= 3; page++) {
        try {
          const r = await tmdbGet(`/tv/${source}`, { page }, language);
          fallbackResults.push(...(r.data.results || []));
        } catch (e) {
          // Ignorē lapu ielādes kļūdas un turpina
        }
        if (fallbackResults.length >= 120) break;
      }
      if (fallbackResults.length >= 120) break;
    }

    // Noņem dublikātus pēc ID un ierobežo
    const seen = new Set();
    const deduped = [];
    for (const s of fallbackResults) {
      if (!s || seen.has(s.id)) continue;
      seen.add(s.id);
      deduped.push(s);
      if (deduped.length >= 60) break;
    }

    const mapped = deduped.map(show => {
      const vote = typeof show.vote_average === 'number' ? show.vote_average : 6.5;
      const scaled = Math.round(45 + (vote / 10) * 50); // 45..95
      // Pievieno nelielu nejaušību
      const jitter = Math.floor(Math.random() * 7) - 3;
      const score = Math.min(95, Math.max(40, scaled + jitter));
      const stars = Math.min(5, Math.max(1, Math.round(((score - 40) / 55) * 4) + 1));

      const genres = (show.genre_ids || []).map(id => genreMap[id]).filter(Boolean);
      const because = genres.length
        ? (isLatvian ? `Populārs ${genres[0]} ieteikums` : `Popular ${genres[0]} pick`)
        : (isLatvian ? 'Populāra izvēle' : 'Popular pick');

      return {
        id: show.id,
        tmdbId: show.id,
        title: show.name,
        poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
        genres,
        matchScore: score,
        matchStars: stars,
        because,
        becauseIsTitle: false
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error('Public discover error:', err);
    res.status(500).json({ message: 'Failed to load public discover feed' });
  }
});



// Pievienot atsauksmi
app.post('/api/reviews', requireAuth, async (req, res) => {
  const { tmdb_series_id, season_number, episode_number, rating, review_text, review_title } = req.body;
  if (
    !Number.isInteger(tmdb_series_id) ||
    !Number.isInteger(season_number) ||
    !Number.isInteger(episode_number)
  ) {
    return res.status(400).json({ error: 'Invalid TMDB identifiers' });
  }

  const query = `
    INSERT INTO reviews 
      (user_id, tmdb_series_id, season_number, episode_number, rating, review_text, review_title, date, likes, dislikes, comment_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 0, 0, 0)
  `;
  db.query(query, [req.userId, tmdb_series_id, season_number, episode_number, rating, review_text, review_title],
    async (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });

      // Paziņo sekotājiem par jauno atsauksmi
      try {
        const [followers] = await db.promise().query(
          'SELECT follower_id FROM user_follows WHERE following_id = ?',
          [req.userId]
        );
        if (followers.length > 0) {
          const [authorRows] = await db.promise().query('SELECT username FROM users WHERE id = ?', [req.userId]);
          const authorName = authorRows.length > 0 ? authorRows[0].username : 'Someone';
          const message = `${authorName} posted a new review: "${review_title || 'Untitled'}"`;
          const insertValues = followers.map(f => [f.follower_id, tmdb_series_id, 'new_review', message]);
          await db.promise().query(
            'INSERT INTO notifications (user_id, tmdb_series_id, notification_type, message) VALUES ?',
            [insertValues]
          );
        }
      } catch (notifErr) {
        console.error('Error creating new_review notifications:', notifErr);
      }

      // Pārbauda sasniegumu kosmētiku pēc atsauksmes izveides
      checkAndAwardMilestones(req.userId).catch(() => {});

      res.status(201).json({ message: 'Review created', reviewId: result.insertId });
    });
});

// Tieši iegūst TMDB sēriju
app.get('/api/tmdb/episode', async (req, res) => {
  const { seriesId, seasonNumber, episodeNumber } = req.query;
  if (!seriesId || !seasonNumber || !episodeNumber) return res.status(400).json({ error: 'Missing parameters' });

  try {
    const language = resolveTmdbLanguage(req.query.lang);
    const data = await fetchEpisodeFromTMDB(seriesId, seasonNumber, episodeNumber, language);
    res.json(data);
  } catch (err) {
    console.error('TMDB fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch episode from TMDB' });
  }
});


// Iegūst visas atsauksmes ar TMDB sērijas informāciju
app.get('/api/reviews', async (req, res) => {
  const { seriesId, userId } = req.query;
  const language = resolveTmdbLanguage(req.query.lang);
  const isLatvian = language.startsWith('lv');

  try {
    // 1. solis: iegūst atsauksmes no DB (joprojām izmantojot lietotāja informāciju un atsauksmju statistiku)
    let query = `
          SELECT
      r.*,
      u.username,
      u.profile_picture,
      u.role,
      COALESCE(ub.badge_image, sb.image) AS selected_badge_image,
      CASE WHEN ub.badge_source = 'quiz' THEN bq.icon_emoji ELSE NULL END AS selected_badge_emoji,
      (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE user_id = u.id
      ) AS user_review_count,
      (
        SELECT AVG(r2.rating)
        FROM reviews r2
        WHERE
          r2.tmdb_series_id = r.tmdb_series_id
          AND r2.season_number = r.season_number
          AND r2.episode_number = r.episode_number
      ) AS average_rating
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    LEFT JOIN user_badges ub ON ub.id = u.selected_badge_id AND ub.user_id = u.id
    LEFT JOIN quizzes bq ON ub.badge_source = 'quiz' AND ub.source_id = bq.id
    LEFT JOIN standalone_badges sb ON ub.badge_source = 'standalone' AND ub.source_id = sb.id

    `;
    const params = [];
    if (seriesId) {
      query += ' WHERE r.tmdb_series_id = ?';
      params.push(seriesId);
    } else if (userId) {
      query += ' WHERE r.user_id = ?';
      params.push(userId);
    }

    const [reviewRows] = await db.promise().query(query, params);

    if (reviewRows.length === 0) return res.json([]);

    const seriesIds = [...new Set(reviewRows.map(r => r.tmdb_series_id))];
    const seriesTitles = {};
    const originalSeriesTitles = {};
    const machineTranslatedSeriesTitles = {};

    await Promise.all(
      seriesIds.map(async id => {
        const [localizedRes, englishRes] = await Promise.all([
          tmdbGetWithFallback(`/tv/${id}`, {}, language, ['name', 'overview']),
          isLatvian ? tmdbGet(`/tv/${id}`, {}, 'en-US') : Promise.resolve(null)
        ]);

        const localizedTitle = localizedRes?.data?.name;
        const englishTitle = englishRes?.data?.name;

        if (isLatvian) {
          const resolved = await resolveLatvianTitleWithFallback(localizedTitle, englishTitle);
          seriesTitles[id] = resolved.title || 'Unknown Series';
          originalSeriesTitles[id] = resolved.englishTitle || seriesTitles[id];
          machineTranslatedSeriesTitles[id] = resolved.machineTranslatedTitle;
        } else {
          seriesTitles[id] = hasMeaningfulText(localizedTitle)
            ? localizedTitle
            : (hasMeaningfulText(englishTitle) ? englishTitle : 'Unknown Series');
          originalSeriesTitles[id] = hasMeaningfulText(englishTitle)
            ? englishTitle
            : seriesTitles[id];
          machineTranslatedSeriesTitles[id] = false;
        }
      })
    );


    // 2. solis: katrai atsauksmei iegūst sērijas informāciju no TMDB API
    const tmdbApiKey = process.env.VITE_TMDB_API_KEY;

    const reviewsWithEpisodes = await Promise.all(
    reviewRows.map(async review => {
      try {
        const epRes = await tmdbGetWithFallback(
          `/tv/${review.tmdb_series_id}/season/${review.season_number}/episode/${review.episode_number}`,
          {},
          language,
          ['name', 'overview']
        );

        return {
          ...review,
          review_language: detectReviewLanguage(review.review_title, review.review_text),
          series_title: seriesTitles[review.tmdb_series_id] || 'Unknown Series',
          original_series_title: originalSeriesTitles[review.tmdb_series_id] || seriesTitles[review.tmdb_series_id] || 'Unknown Series',
          machine_translated_series_title: !!machineTranslatedSeriesTitles[review.tmdb_series_id],
          episode_title: epRes.data.name,
          episode_picture: epRes.data.still_path
            ? `https://image.tmdb.org/t/p/w500${epRes.data.still_path}`
            : null
        };
      } catch {
        return {
          ...review,
          review_language: detectReviewLanguage(review.review_title, review.review_text),
          series_title: seriesTitles[review.tmdb_series_id] || 'Unknown Series',
          original_series_title: originalSeriesTitles[review.tmdb_series_id] || seriesTitles[review.tmdb_series_id] || 'Unknown Series',
          machine_translated_series_title: !!machineTranslatedSeriesTitles[review.tmdb_series_id],
          episode_title: `S${review.season_number}E${review.episode_number}`,
          episode_picture: null
        };
      }
    })
  );


    res.json(reviewsWithEpisodes);

  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});
// GET /api/user-reviews/:userId
app.get('/api/user-reviews/:userId', async (req, res) => {
  const userId = req.params.userId;
  const language = resolveTmdbLanguage(req.query.lang);

  try {
    db.query('SELECT * FROM reviews WHERE user_id = ? ORDER BY date DESC', [userId], async (err, reviews) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      if (!reviews.length) return res.json([]);

      // Savāc unikālas seriāla+sezonas kombinācijas
      const uniqueSeriesSeason = [...new Set(reviews.map(r => `${r.tmdb_series_id}-${r.season_number}`))];

      const episodesData = {};
      const seriesTitles = {};

      // Viens pieprasījums katram seriālam-sezonai (vajadzības gadījumā var samazināt vēl vairāk)
      await Promise.all(uniqueSeriesSeason.map(async (ss) => {
        const [seriesId, seasonNumber] = ss.split('-');

        // Seriāla informāciju iegūst vienreiz
        if (!seriesTitles[seriesId]) {
          const seriesRes = await tmdbGetWithFallback(`/tv/${seriesId}`, {}, language, ['name', 'overview']);
          seriesTitles[seriesId] = seriesRes.data.name;
        }

        // Sezonas informāciju iegūst vienreiz
        const seasonRes = await tmdbGetWithFallback(`/tv/${seriesId}/season/${seasonNumber}`, {}, language, ['name', 'overview']);

        seasonRes.data.episodes.forEach(ep => {
          episodesData[`${seriesId}-${seasonNumber}-${ep.episode_number}`] = ep;
        });
      }));

      // Kartē atsauksmes ar TMDB informāciju
      const enrichedReviews = reviews.map(r => {
        const ep = episodesData[`${r.tmdb_series_id}-${r.season_number}-${r.episode_number}`];
        return {
          ...r,
          series_title: seriesTitles[r.tmdb_series_id] || 'Unknown Series',
          episode_title: ep ? ep.name : `S${r.season_number}E${r.episode_number}`,
          episode_image: ep && ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : null
        };
      });

      res.json(enrichedReviews);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user reviews' });
  }
});
// Statistika
app.get('/api/statistics', async (req, res) => {
  const userId = req.headers.authorization ? parseInt(req.headers.authorization) : null;

  try {
    // Vietnes kopējā statistika
    const [highestRated] = await db.promise().query(
      `SELECT tmdb_series_id, AVG(rating) as avg_rating, COUNT(*) as review_count
       FROM reviews
       GROUP BY tmdb_series_id
       ORDER BY avg_rating DESC
       LIMIT 1`
    );

    const [lowestRated] = await db.promise().query(
      `SELECT tmdb_series_id, AVG(rating) as avg_rating, COUNT(*) as review_count
       FROM reviews
       GROUP BY tmdb_series_id
       ORDER BY avg_rating ASC
       LIMIT 1`
    );

    const [mostReviewed] = await db.promise().query(
      `SELECT tmdb_series_id, COUNT(*) as review_count
       FROM reviews
       GROUP BY tmdb_series_id
       ORDER BY review_count DESC
       LIMIT 1`
    );

    const globalStats = {
      highestRated: highestRated[0] || null,
      lowestRated: lowestRated[0] || null,
      mostReviewed: mostReviewed[0] || null
    };

    let userStats = null;
    if (userId) {
      const [[{ totalReviews }]] = await db.promise().query(
        `SELECT COUNT(*) as totalReviews FROM reviews WHERE user_id = ?`, [userId]
      );

      if (totalReviews >= 5) {
        const [uHighest] = await db.promise().query(
          `SELECT tmdb_series_id, AVG(rating) as avg_rating, COUNT(*) as review_count
           FROM reviews
           WHERE user_id = ?
           GROUP BY tmdb_series_id
           ORDER BY avg_rating DESC
           LIMIT 1`, [userId]
        );

        const [uLowest] = await db.promise().query(
          `SELECT tmdb_series_id, AVG(rating) as avg_rating, COUNT(*) as review_count
           FROM reviews
           WHERE user_id = ?
           GROUP BY tmdb_series_id
           ORDER BY avg_rating ASC
           LIMIT 1`, [userId]
        );

        const [uMost] = await db.promise().query(
          `SELECT tmdb_series_id, COUNT(*) as review_count
           FROM reviews
           WHERE user_id = ?
           GROUP BY tmdb_series_id
           ORDER BY review_count DESC
           LIMIT 1`, [userId]
        );

        userStats = {
          highestRated: uHighest[0] || null,
          lowestRated: uLowest[0] || null,
          mostReviewed: uMost[0] || null
        };
      }
    }

    res.json({ globalStats, userStats });

  } catch (err) {
    console.error('Statistics fetch failed:', err);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});


// Reakcija uz atsauksmi (patīk/nepatīk)
app.post('/api/reviews/:id/react', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { is_like } = req.body;
  const userId = req.userId;
  const isLikeInt = is_like ? 1 : 0;

  try {
    const [reviewRows] = await db.promise().query('SELECT * FROM reviews WHERE id = ?', [id]);
    if (reviewRows.length === 0) return res.status(404).json({ message: 'Review not found' });

    const [existingReaction] = await db.promise().query(
      'SELECT is_like FROM review_reactions WHERE user_id = ? AND review_id = ?',
      [userId, id]
    );

    let currentReaction = null;
    if (existingReaction.length > 0) {
      if (existingReaction[0].is_like === isLikeInt) {
        await db.promise().query('DELETE FROM review_reactions WHERE user_id = ? AND review_id = ?', [userId, id]);
        currentReaction = null;
      } else {
        await db.promise().query('UPDATE review_reactions SET is_like = ? WHERE user_id = ? AND review_id = ?', [isLikeInt, userId, id]);
        currentReaction = is_like ? 'like' : 'dislike';
      }
    } else {
      await db.promise().query('INSERT INTO review_reactions (user_id, review_id, is_like) VALUES (?, ?, ?)', [userId, id, isLikeInt]);
      currentReaction = is_like ? 'like' : 'dislike';
    }

    const [counts] = await db.promise().query(
      'SELECT SUM(is_like = 1) AS likes, SUM(is_like = 0) AS dislikes FROM review_reactions WHERE review_id = ?',
      [id]
    );

    await db.promise().query('UPDATE reviews SET likes = ?, dislikes = ? WHERE id = ?', [counts[0].likes || 0, counts[0].dislikes || 0, id]);

    // Izveido paziņojumu atsauksmes autoram (ne savām reakcijām, tikai jaunām patīk reakcijām)
    const reviewOwnerId = reviewRows[0].user_id;
    if (currentReaction === 'like' && reviewOwnerId !== userId) {
      try {
        const [reactorRows] = await db.promise().query('SELECT username FROM users WHERE id = ?', [userId]);
        const reactorName = reactorRows.length > 0 ? reactorRows[0].username : 'Someone';
        const message = `${reactorName} liked your review "${reviewRows[0].review_title || 'Untitled'}"`;
        await db.promise().query(
          'INSERT INTO notifications (user_id, tmdb_series_id, notification_type, message) VALUES (?, ?, ?, ?)',
          [reviewOwnerId, reviewRows[0].tmdb_series_id, 'like', message]
        );
      } catch (notifErr) {
        console.error('Error creating like notification:', notifErr);
      }
    }

    res.json({ message: 'Reaction processed', likes: counts[0].likes || 0, dislikes: counts[0].dislikes || 0, reaction: currentReaction });

  } catch (err) {
    console.error('Error processing reaction:', err);
    res.status(500).json({ message: 'Failed to process reaction' });
  }
});

// Iegūst lietotāja reakciju uz atsauksmi
app.get('/api/reviews/:id/reaction', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  try {
    const [rows] = await db.promise().query(
      'SELECT is_like FROM review_reactions WHERE user_id = ? AND review_id = ?',
      [userId, id]
    );
    if (rows.length === 0) return res.json({ reaction: null });
    res.json({ reaction: rows[0].is_like === 1 ? 'like' : 'dislike' });
  } catch (err) {
    console.error('Error fetching reaction:', err);
    res.status(500).json({ message: 'Failed to fetch reaction' });
  }
});

// Pārbauda, vai lietotājvārds ir pieejams
app.get('/api/check-username', (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ available: false });
  }

  db.query(
    'SELECT id FROM users WHERE username = ? LIMIT 1',
    [username],
    (err, results) => {
      if (err) {
        return res.status(500).json({ available: false });
      }

      res.json({ available: results.length === 0 });
    }
  );
});

// Atjauninat lietotajvardu
app.put('/api/users/:id/username', requireAuth, (req, res) => {
  const userIdFromParams = parseInt(req.params.id);
  const userIdFromAuth = req.userId;
  const { newUsername } = req.body;

  if (!newUsername || newUsername.trim().length < 3) {
    return res.status(400).json({ message: 'Invalid username' });
  }

  // Lietotāji var atjaunināt tikai savu lietotājvārdu
  if (userIdFromParams !== userIdFromAuth) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  // Pārbauda, vai lietotājvārds jau pastāv
  db.query(
    'SELECT id FROM users WHERE username = ? LIMIT 1',
    [newUsername],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (results.length > 0) {
        return res.status(409).json({ message: 'Username already taken' });
      }

      // Atjauninat lietotajvardu
      db.query(
        'UPDATE users SET username = ? WHERE id = ?',
        [newUsername, userIdFromParams],
        err => {
          if (err) {
            return res.status(500).json({ message: 'Failed to update username' });
          }

          res.json({
            message: 'Username updated',
            user: {
              id: userIdFromParams,
              username: newUsername
            }
          });
        }
      );
    }
  );
});

// Augšupieladet profila attelu
app.post('/api/users/:id/profile-picture', requireAuth, upload.single('profilePicture'), async (req, res) => {
  const userIdFromParams = parseInt(req.params.id);
  const userIdFromAuth = req.userId;

  console.log('Profile picture upload request - Params ID:', userIdFromParams, 'Auth ID:', userIdFromAuth);

  // Lietotāji var atjaunināt tikai savu profila attēlu
  if (userIdFromParams !== userIdFromAuth) {
    console.log('Unauthorized - ID mismatch');
    return res.status(403).json({ message: 'Unauthorized' });
  }

  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filename = req.file.filename;
  const profilePicturePath = `/assets/user_pfp/${filename}`;

  console.log('Uploaded file:', filename);
  console.log('Profile picture path:', profilePicturePath);

  // Iegūst veco profila attēlu, lai to dzēstu
  db.query('SELECT profile_picture FROM users WHERE id = ?', [userIdFromParams], (err, results) => {
    if (err) {
      console.error('Error fetching old profile picture:', err);
    } else if (results.length > 0 && results[0].profile_picture) {
      const oldPicPath = results[0].profile_picture;
      // Dzēš tikai tad, ja tas nav noklusējuma attēls
      if (oldPicPath && !oldPicPath.includes('default_pfp_icons')) {
        const oldFilePath = path.join(__dirname, 'src', oldPicPath);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting old profile picture:', err);
        });
      }
    }
  });

  // Atjaunina profila attēlu datubāzē
  db.query(
    'UPDATE users SET profile_picture = ? WHERE id = ?',
    [profilePicturePath, userIdFromParams],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to update profile picture' });
      }

      res.json({
        message: 'Profile picture updated',
        profilePicture: profilePicturePath
      });
    }
  );
});

// Atjaunina profila attēlu ar noklusējuma opciju
app.post('/api/users/:id/profile-picture-default', requireAuth, (req, res) => {
  const userIdFromParams = parseInt(req.params.id);
  const userIdFromAuth = req.userId;

  // Lietotāji var atjaunināt tikai savu profila attēlu
  if (userIdFromParams !== userIdFromAuth) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { picturePath } = req.body;
  
  if (!picturePath || !picturePath.startsWith('/assets/default_pfp_icons/')) {
    return res.status(400).json({ message: 'Invalid picture path' });
  }

  console.log('Selecting default profile picture:', picturePath);

  db.query(
    'UPDATE users SET profile_picture = ? WHERE id = ?',
    [picturePath, userIdFromParams],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to update profile picture' });
      }

      res.json({
        message: 'Profile picture updated',
        profilePicture: picturePath
      });
    }
  );
});

// Lietotaja favoritu maršruti
// ==================== AVATARA VEIDOTAJA GALAPUNKTI ====================

// Uzskaita pieejamās avatara daļas pa kategorijām
app.get('/api/avatar-parts', (req, res) => {
  const partsDir = path.join(__dirname, 'src/assets/profile_parts');
  const categories = ['background', 'background_gradient', 'body_color', 'body_outline', 'eyes'];
  const result = {};

  for (const cat of categories) {
    const catDir = path.join(partsDir, cat);
    try {
      const files = fs.readdirSync(catDir).filter(f => /\.(png|jpg|jpeg|webp|gif)$/i.test(f));
      result[cat] = files;
    } catch {
      result[cat] = [];
    }
  }

  res.json(result);
});

// Iegūst lietotāja avatara konfigurāciju
app.get('/api/users/:id/avatar-config', requireAuth, (req, res) => {
  const userIdFromParams = parseInt(req.params.id);
  if (userIdFromParams !== req.userId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  db.query('SELECT avatar_config FROM users WHERE id = ?', [userIdFromParams], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!results.length) return res.status(404).json({ message: 'User not found' });
    let config = null;
    try {
      config = results[0].avatar_config ? JSON.parse(results[0].avatar_config) : null;
    } catch { config = null; }
    res.json({ config });
  });
});

// Saglabā lietotāja avatara konfigurāciju
app.post('/api/users/:id/avatar-config', requireAuth, (req, res) => {
  const userIdFromParams = parseInt(req.params.id);
  if (userIdFromParams !== req.userId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { config } = req.body;
  if (!config || typeof config !== 'object') {
    return res.status(400).json({ message: 'Invalid config' });
  }

  // Validē, ka konfigurācija satur tikai atļautās atslēgas un string/null vērtības
  const allowedKeys = ['background', 'background_gradient', 'body_color', 'body_outline', 'eyes'];
  for (const key of Object.keys(config)) {
    if (!allowedKeys.includes(key)) {
      return res.status(400).json({ message: `Invalid config key: ${key}` });
    }
    if (config[key] !== null && typeof config[key] !== 'string') {
      return res.status(400).json({ message: `Invalid value for ${key}` });
    }
  }

  const configJson = JSON.stringify(config);
  db.query('UPDATE users SET avatar_config = ? WHERE id = ?', [configJson, userIdFromParams], (err) => {
    if (err) {
      console.error('Error saving avatar config:', err);
      return res.status(500).json({ message: 'Failed to save avatar config' });
    }
    res.json({ message: 'Avatar config saved' });
  });
});

app.get('/api/users/:id/favorites', requireAuth, (req, res) => {
  const userIdFromParams = parseInt(req.params.id);
  const userIdFromAuth = req.userId;

  if (userIdFromParams !== userIdFromAuth) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  db.query(
    'SELECT position, tmdb_series_id FROM user_favorites WHERE user_id = ? ORDER BY position',
    [userIdFromParams],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to fetch favorites' });
      }
      res.json(results);
    }
  );
});

app.post('/api/users/:id/favorites', requireAuth, (req, res) => {
  const userIdFromParams = parseInt(req.params.id);
  const userIdFromAuth = req.userId;

  if (userIdFromParams !== userIdFromAuth) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const { tmdb_series_id, position } = req.body;

  if (!tmdb_series_id || !position || position < 1 || position > 5) {
    return res.status(400).json({ message: 'Invalid data' });
  }

  db.query(
    'INSERT INTO user_favorites (user_id, tmdb_series_id, position) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE tmdb_series_id = VALUES(tmdb_series_id)',
    [userIdFromParams, tmdb_series_id, position],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to save favorite' });
      }
      res.json({ message: 'Favorite saved' });
    }
  );
});

app.delete('/api/users/:id/favorites/:position', requireAuth, (req, res) => {
  const userIdFromParams = parseInt(req.params.id);
  const userIdFromAuth = req.userId;
  const position = parseInt(req.params.position);

  if (userIdFromParams !== userIdFromAuth || !position || position < 1 || position > 5) {
    return res.status(403).json({ message: 'Unauthorized or invalid position' });
  }

  db.query(
    'DELETE FROM user_favorites WHERE user_id = ? AND position = ?',
    [userIdFromParams, position],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to remove favorite' });
      }
      res.json({ message: 'Favorite removed' });
    }
  );
});

// Lietotāja top seriālu maršruts
app.get('/api/user-top-shows/:id', requireAuth, (req, res) => {
  const userIdFromParams = parseInt(req.params.id);
  const userIdFromAuth = req.userId;

  if (userIdFromParams !== userIdFromAuth) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  db.query(
    `SELECT tmdb_series_id, AVG(rating) as avg_rating, COUNT(*) as review_count
     FROM reviews
     WHERE user_id = ?
     GROUP BY tmdb_series_id
     ORDER BY avg_rating DESC
     LIMIT 5`,
    [userIdFromParams],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Failed to fetch top shows' });
      }
      res.json(results);
    }
  );
});

// Pievienot komentaru
app.post('/api/reviews/:id/comments', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { comment_text, other_user_id } = req.body;
  const userId = req.userId;

  if (!comment_text || comment_text.trim() === '') return res.status(400).json({ message: 'Empty comment not allowed' });

  try {
    await db.promise().query(
      'INSERT INTO comments (user_id, review_id, comment_text, other_user_id) VALUES (?, ?, ?, ?)',
      [userId, id, comment_text, other_user_id || null]
    );
    await db.promise().query('UPDATE reviews SET comment_count = comment_count + 1 WHERE id = ?', [id]);

    // Izveido paziņojumus par komentāru
    try {
      const [reviewRows] = await db.promise().query('SELECT user_id, tmdb_series_id, review_title FROM reviews WHERE id = ?', [id]);
      const [commenterRows] = await db.promise().query('SELECT username FROM users WHERE id = ?', [userId]);
      const commenterName = commenterRows.length > 0 ? commenterRows[0].username : 'Someone';

      if (reviewRows.length > 0) {
        const reviewOwnerId = reviewRows[0].user_id;
        const tmdbSeriesId = reviewRows[0].tmdb_series_id;
        const reviewTitle = reviewRows[0].review_title || 'Untitled';

        // Paziņo atsauksmes autoram (ja tas nav paša komentārs)
        if (reviewOwnerId !== userId) {
          const message = `${commenterName} commented on your review "${reviewTitle}"`;
          await db.promise().query(
            'INSERT INTO notifications (user_id, tmdb_series_id, notification_type, message) VALUES (?, ?, ?, ?)',
            [reviewOwnerId, tmdbSeriesId, 'comment', message]
          );
        }

        // Paziņo pieminētajam lietotājam (ja tas atšķiras no komentētāja un atsauksmes autora)
        if (other_user_id && other_user_id !== userId) {
          const message = `${commenterName} mentioned you in a comment on "${reviewTitle}"`;
          await db.promise().query(
            'INSERT INTO notifications (user_id, tmdb_series_id, notification_type, message) VALUES (?, ?, ?, ?)',
            [other_user_id, tmdbSeriesId, 'mention', message]
          );
        }
      }
    } catch (notifErr) {
      console.error('Error creating comment notification:', notifErr);
    }

    res.json({ message: 'Comment added' });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

// Iegut atsauksmes komentarus
app.get('/api/reviews/:id/comments', (req, res) => {
  const { id } = req.params;
  const conn = getConnection();
  conn.query(
    `SELECT c.id, c.comment_text, c.created_at, c.other_user_id, u.username, u.profile_picture, u.role,
            COALESCE(ub.badge_image, sb.image) AS selected_badge_image,
            CASE WHEN ub.badge_source = 'quiz' THEN bq.icon_emoji ELSE NULL END AS selected_badge_emoji
     FROM comments c
     JOIN users u ON c.user_id = u.id
     LEFT JOIN user_badges ub ON ub.id = u.selected_badge_id AND ub.user_id = u.id
     LEFT JOIN quizzes bq ON ub.badge_source = 'quiz' AND ub.source_id = bq.id
     LEFT JOIN standalone_badges sb ON ub.badge_source = 'standalone' AND ub.source_id = sb.id
     WHERE c.review_id = ?
     ORDER BY c.created_at ASC`,
    [id],
    (err, results) => {
      conn.end();
      if (err) return res.status(500).json({ message: 'Failed to load comments' });
      res.json(results);
    }
  );
});

// Dzest atsauksmi
app.delete('/api/reviews/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const [reviewRows] = await db.promise().query('SELECT user_id FROM reviews WHERE id = ?', [id]);
    if (reviewRows.length === 0) return res.status(404).json({ message: 'Review not found' });

    const [userRows] = await db.promise().query('SELECT role FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) return res.status(403).json({ message: 'User not found' });

    const isOwner = reviewRows[0].user_id === userId;
    const isAdmin = userRows[0].role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized to delete this review' });

    await db.promise().query('DELETE FROM reviews WHERE id = ?', [id]);
    await db.promise().query('DELETE FROM review_reactions WHERE review_id = ?', [id]);
    await db.promise().query('DELETE FROM comments WHERE review_id = ?', [id]);

    res.json({ message: 'Review deleted successfully' });

  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

// Dzest komentaru
app.delete('/api/comments/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const [commentRows] = await db.promise().query('SELECT user_id, review_id FROM comments WHERE id = ?', [id]);
    if (commentRows.length === 0) return res.status(404).json({ message: 'Comment not found' });

    const [userRows] = await db.promise().query('SELECT role FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) return res.status(403).json({ message: 'User not found' });

    const isOwner = commentRows[0].user_id === userId;
    const isAdmin = userRows[0].role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized to delete this comment' });

    await db.promise().query('DELETE FROM comments WHERE id = ?', [id]);
    await db.promise().query('UPDATE reviews SET comment_count = comment_count - 1 WHERE id = ?', [commentRows[0].review_id]);

    res.json({ message: 'Comment deleted successfully' });

  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

// ===== VIKTORINU GALAPUNKTI =====

// Iegūst visas viktorīnas
app.get('/api/quizzes', async (req, res) => {
  try {
    const [quizzes] = await db.promise().query(`
      SELECT q.id, q.title, q.description, q.icon_emoji, q.category, q.difficulty, q.icon_name, q.tmdb_series_id, q.quiz_image, q.badge_name, q.badge_rules, q.created_at,
        (SELECT COUNT(DISTINCT ub.user_id) FROM user_badges ub WHERE ub.badge_source = 'quiz' AND ub.source_id = q.id) AS completion_count,
        (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS question_count
      FROM quizzes q
      ORDER BY q.created_at DESC
    `);
    res.json(quizzes);
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
});

// Iegūst konkrētu viktorīnu ar jautājumiem
app.get('/api/quizzes/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [quiz] = await db.promise().query('SELECT id, title, description, icon_emoji, category, difficulty, icon_name, tmdb_series_id, quiz_image, badge_name, badge_rules FROM quizzes WHERE id = ?', [id]);
    if (quiz.length === 0) return res.status(404).json({ message: 'Quiz not found' });

    const [questions] = await db.promise().query(
      'SELECT id, question_text, option_a, option_b, option_c, option_d, option_e, option_f, option_g, option_h FROM quiz_questions WHERE quiz_id = ? ORDER BY id',
      [id]
    );

    res.json({ ...quiz[0], questions });
  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(500).json({ message: 'Failed to fetch quiz' });
  }
});

// Iegūst lietotāja nopelnītos žetonus (viktorīnu un atsevišķos, vienotā tabulā)
app.get('/api/users/:userid/badges', async (req, res) => {
  const { userid } = req.params;
  try {
    const [badges] = await db.promise().query(
      `SELECT ub.id,
              CASE WHEN ub.badge_source = 'quiz' THEN COALESCE(ub.badge_name_override, q.title) ELSE COALESCE(ub.badge_name_override, sb.name) END AS title,
              CASE WHEN ub.badge_source = 'quiz' THEN q.description ELSE sb.description END AS description,
              CASE WHEN ub.badge_source = 'quiz' THEN q.icon_emoji ELSE NULL END AS icon_emoji,
              ub.earned_at, ub.badge_type,
              CASE WHEN ub.badge_source = 'quiz' THEN ub.source_id ELSE NULL END AS quiz_id,
              CASE WHEN ub.badge_source = 'quiz' THEN ub.badge_image ELSE sb.image END AS badge_image,
              ub.badge_source
       FROM user_badges ub
       LEFT JOIN quizzes q ON ub.badge_source = 'quiz' AND ub.source_id = q.id
       LEFT JOIN standalone_badges sb ON ub.badge_source = 'standalone' AND ub.source_id = sb.id
       WHERE ub.user_id = ?
       ORDER BY ub.earned_at DESC`,
      [userid]
    );
    res.json(badges);
  } catch (err) {
    console.error('Error fetching badges:', err);
    res.status(500).json({ message: 'Failed to fetch badges' });
  }
});

// Iegūst žetona detaļas, tostarp lietotāja pabeigšanas statusu
app.get('/api/users/:userid/quiz-status/:quizid', requireAuth, async (req, res) => {
  const { userid, quizid } = req.params;
  try {
    const [badge] = await db.promise().query(
      'SELECT * FROM user_badges WHERE user_id = ? AND badge_source = "quiz" AND source_id = ?',
      [userid, quizid]
    );
    res.json({ completed: badge.length > 0, earnedAt: badge.length > 0 ? badge[0].earned_at : null });
  } catch (err) {
    console.error('Error checking badge status:', err);
    res.status(500).json({ message: 'Failed to check quiz status' });
  }
});

// Pārbauda viktorīnas gaidīšanas statusu - atgriež, vai lietotājs pēc neveiksmes drīkst mēģināt vēlreiz
app.get('/api/quizzes/:id/cooldown-status', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    // Iegūst jaunāko neveiksmīgo mēģinājumu (rezultāts < 70)
    const [attempts] = await db.promise().query(
      'SELECT score, attempted_at FROM quiz_attempts WHERE user_id = ? AND quiz_id = ? AND score < 70 ORDER BY attempted_at DESC LIMIT 1',
      [userId, id]
    );

    if (attempts.length === 0) {
      // Nav neveiksmīgu mēģinājumu, lietotājs drīkst mēģināt vēlreiz
      return res.json({ canRetake: true, cooldownExpired: true, nextRetakeTime: null });
    }

    const lastFailedAttempt = new Date(attempts[0].attempted_at);
    const now = new Date();
    const hoursElapsed = (now - lastFailedAttempt) / (1000 * 60 * 60);

    if (hoursElapsed >= 24) {
      // Ir pagājušas 24 stundas
      return res.json({ canRetake: true, cooldownExpired: true, nextRetakeTime: null });
    }

    // Joprojām gaidīšanas periodā
    const nextRetakeTime = new Date(lastFailedAttempt.getTime() + 24 * 60 * 60 * 1000);
    return res.json({ 
      canRetake: false, 
      cooldownExpired: false, 
      nextRetakeTime: nextRetakeTime.toISOString(),
      hoursRemaining: Math.ceil((24 - hoursElapsed) * 100) / 100
    });
  } catch (err) {
    console.error('Error checking quiz cooldown:', err);
    res.status(500).json({ message: 'Failed to check quiz cooldown' });
  }
});

// Iesniedz viktorīnas atbildes un piešķir žetonus pēc veiktspējas un žetonu noteikumiem
app.post('/api/quizzes/:id/submit', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const { answers } = req.body; // Object: { questionId: 'A', questionId2: 'B', ... }

  try {
    // Iegūst viktorīnas žetona konfigurāciju
    const [quizRows] = await db.promise().query(
      'SELECT badge_name, badge_rules FROM quizzes WHERE id = ?',
      [id]
    );
    if (quizRows.length === 0) return res.status(404).json({ message: 'Quiz not found' });

    const quiz = quizRows[0];
    const badgeRules = quiz.badge_rules ? JSON.parse(quiz.badge_rules) : null;

    // Iegūst visus jautājumus secībā
    const [questions] = await db.promise().query(
      'SELECT id, correct_answer FROM quiz_questions WHERE quiz_id = ? ORDER BY id',
      [id]
    );
    if (questions.length === 0) return res.status(404).json({ message: 'Quiz not found' });

    // Aprēķina rezultātu
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] && answers[q.id].toUpperCase() === q.correct_answer) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);

    // Nosaka nokārtošanas slieksni "passed" karogam (izmanto pirmā līmeņa slieksni vai 70)
    const passThreshold = badgeRules?.performance?.enabled && badgeRules.performance.tiers?.length
      ? Math.max(...badgeRules.performance.tiers.map(t => t.minScore ?? 0))
      : (badgeRules?.performance?.enabled ? (badgeRules.performance.passThreshold || 70) : 70);
    const passed = score >= passThreshold;

    // Reģistrē mēģinājumu
    await db.promise().query(
      'INSERT INTO quiz_attempts (user_id, quiz_id, score) VALUES (?, ?, ?)',
      [userId, id, score]
    );

    const badgesAwarded = [];
    let badgeAwarded = false;

    const awardBadge = async (badgeType, badgeName, badgeImage = null) => {
      try {
        await db.promise().query(
          'INSERT INTO user_badges (user_id, badge_source, source_id, badge_type, badge_image, badge_name_override) VALUES (?, "quiz", ?, ?, ?, ?)',
          [userId, id, badgeType, badgeImage || null, badgeName || null]
        );
        badgesAwarded.push({ type: badgeType, name: badgeName, image: badgeImage });
        if (badgeType === 'default' || badgeType === 'pass') badgeAwarded = true;
      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY') throw err;
      }
    };

    if (badgeRules?.performance?.enabled) {
      if (badgeRules.performance.tiers?.length) {
        // Vairāki līmeņi: kārto pēc augstākā minScore vispirms un piešķir pirmo atbilstošo līmeni
        const sorted = [...badgeRules.performance.tiers]
          .filter(t => t.badgeName)
          .sort((a, b) => (b.minScore ?? 0) - (a.minScore ?? 0));
        const matchedTier = sorted.find(t => score >= (t.minScore ?? 0));
        if (matchedTier) {
          // Izmanto ON DUPLICATE KEY UPDATE, lai atkārtoti mēģinājumi varētu paaugstināt līmeni
          await db.promise().query(
            'INSERT INTO user_badges (user_id, badge_source, source_id, badge_type, badge_image, badge_name_override) VALUES (?, "quiz", ?, ?, ?, ?) ON DUPLICATE KEY UPDATE earned_at = NOW(), badge_image = VALUES(badge_image), badge_name_override = VALUES(badge_name_override)',
            [userId, id, 'perf', matchedTier.badgeImage || null, matchedTier.badgeName || null]
          );
          badgesAwarded.push({ type: 'perf', name: matchedTier.badgeName, image: matchedTier.badgeImage || null });
          badgeAwarded = true;
        }
      } else {
        // Mantotais viena sliekšņa formāts
        if (passed && badgeRules.performance.passBadgeName) {
          await awardBadge('pass', badgeRules.performance.passBadgeName);
        } else if (!passed && badgeRules.performance.failBadgeName) {
          await awardBadge('fail', badgeRules.performance.failBadgeName);
        }
      }
    } else if (passed && quiz.badge_name) {
      // Noklusējuma viens nokārtošanas žetons
      await awardBadge('default', quiz.badge_name, badgeRules?.defaultBadgeImage || null);
    }

    // Slepenie žetoni: katrs nosacījums ir neatkarīgs; izmanto secret_N badge_type
    const secretConditions = badgeRules?.secrets?.conditions ?? (
      badgeRules?.secret?.enabled ? [{ questionIndex: badgeRules.secret.questionIndex, answer: badgeRules.secret.answer, badgeName: badgeRules.secret.badgeName }] : []
    );
    if ((badgeRules?.secrets?.enabled || badgeRules?.secret?.enabled) && secretConditions.length) {
      for (let i = 0; i < secretConditions.length; i++) {
        const cond = secretConditions[i];
        if (!cond.badgeName) continue;
        const secretQIndex = (cond.questionIndex || 1) - 1;
        const secretQ = questions[secretQIndex];
        if (secretQ && answers[secretQ.id]?.toUpperCase() === cond.answer?.toUpperCase()) {
          await awardBadge(`secret_${i}`, cond.badgeName, cond.badgeImage || null);
        }
      }
    }

    // Piešķir ar šo viktorīnu saistīto kosmētiku
    const cosmeticsAwarded = [];
    try {
      const [cosmeticSources] = await db.promise().query(
        `SELECT cs.cosmetic_id, cs.min_score, c.name, c.type, c.rarity, c.effect_key
         FROM cosmetic_sources cs
         JOIN cosmetics c ON cs.cosmetic_id = c.id
         WHERE cs.source_type = 'quiz' AND cs.quiz_id = ? AND cs.min_score <= ?`,
        [id, score]
      );
      for (const src of cosmeticSources) {
        try {
          await db.promise().query(
            'INSERT INTO user_cosmetics (user_id, cosmetic_id, source_detail) VALUES (?, ?, ?)',
            [userId, src.cosmetic_id, `quiz:${id}`]
          );
          cosmeticsAwarded.push({ id: src.cosmetic_id, name: src.name, type: src.type, rarity: src.rarity, effect_key: src.effect_key });
          // Izveido paziņojumu par kosmētikas atbloķēšanu
          await db.promise().query(
            'INSERT INTO notifications (user_id, tmdb_series_id, notification_type, message) VALUES (?, 0, ?, ?)',
            [userId, 'cosmetic_unlock', `You unlocked a new cosmetic: ${src.name} (${src.rarity})`]
          ).catch(() => {});
        } catch (e) {
          if (e.code !== 'ER_DUP_ENTRY') console.error('Cosmetic award error:', e);
        }
      }
    } catch (cosErr) {
      console.error('Error awarding quiz cosmetics:', cosErr);
    }

    // Pārbauda sasniegumu kosmētiku pēc viktorīnas pabeigšanas
    const milestoneCosmetics = await checkAndAwardMilestones(userId);
    cosmeticsAwarded.push(...milestoneCosmetics);

    res.json({
      score,
      totalQuestions: questions.length,
      correctAnswers: correct,
      passed,
      badgeAwarded,
      badgesAwarded,
      cosmeticsAwarded,
      message: passed
        ? (badgeAwarded || cosmeticsAwarded.length ? 'Congratulations! You earned rewards! 🎉' : 'You already earned this badge!')
        : 'Keep practicing!'
    });
  } catch (err) {
    console.error('Error submitting quiz:', err);
    res.status(500).json({ message: 'Failed to submit quiz' });
  }
});

// Administrators: augšupielādēt jaunu viktorīnas attēlu
app.post('/api/admin/quiz-images', requireAuth, uploadQuizImage.single('quizImage'), async (req, res) => {
  const userId = req.userId;
  try {
    const [user] = await db.promise().query('SELECT role FROM users WHERE id = ?', [userId]);
    if (user.length === 0 || user[0].role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    res.json({ filename: req.file.filename });
  } catch (err) {
    console.error('Error uploading quiz image:', err);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Administrators: izveidot jaunu viktorīnu
app.post('/api/admin/quizzes', requireAuth, async (req, res) => {
  const userId = req.userId;
  const { title, description, icon_emoji, icon_name, category, difficulty, tmdb_series_id, quiz_image, badge_name, badge_rules, questions } = req.body;

  try {
    // Pārbauda, vai lietotājs ir administrators
    const [user] = await db.promise().query('SELECT role FROM users WHERE id = ?', [userId]);
    if (user.length === 0 || user[0].role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create quizzes' });
    }

    // Izveido viktorīnu
    const [result] = await db.promise().query(
      'INSERT INTO quizzes (title, description, icon_emoji, icon_name, category, difficulty, tmdb_series_id, quiz_image, badge_name, badge_rules, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, icon_emoji || '', icon_name || null, category || 'series', difficulty || 'medium', tmdb_series_id || null, quiz_image || null, badge_name || null, badge_rules ? JSON.stringify(badge_rules) : null, userId]
    );

    const quizId = result.insertId;

    // Ievieto jautājumus
    if (questions && questions.length > 0) {
      for (const q of questions) {
        await db.promise().query(
          'INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, option_e, option_f, option_g, option_h, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [quizId, q.question_text, q.option_a || null, q.option_b || null, q.option_c || null, q.option_d || null, q.option_e || null, q.option_f || null, q.option_g || null, q.option_h || null, q.correct_answer, q.explanation || null]
        );
      }
    }

    res.status(201).json({ message: 'Quiz created', quizId });
  } catch (err) {
    console.error('Error creating quiz:', err);
    res.status(500).json({ message: 'Failed to create quiz' });
  }
});

// Administrators: atjaunināt viktorīnu
app.put('/api/admin/quizzes/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const { title, description, icon_name, category, difficulty, tmdb_series_id, quiz_image, badge_name } = req.body;

  try {
    const [user] = await db.promise().query('SELECT role FROM users WHERE id = ?', [userId]);
    if (user.length === 0 || user[0].role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update quizzes' });
    }
    await db.promise().query(
      'UPDATE quizzes SET title=?, description=?, icon_name=?, category=?, difficulty=?, tmdb_series_id=?, quiz_image=?, badge_name=? WHERE id=?',
      [title, description, icon_name || null, category || 'series', difficulty || 'medium', tmdb_series_id || null, quiz_image || null, badge_name || null, id]
    );
    res.json({ message: 'Quiz updated' });
  } catch (err) {
    console.error('Error updating quiz:', err);
    res.status(500).json({ message: 'Failed to update quiz' });
  }
});

// Administrators: dzēst viktorīnu
app.delete('/api/admin/quizzes/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    // Pārbauda, vai lietotājs ir administrators
    const [user] = await db.promise().query('SELECT role FROM users WHERE id = ?', [userId]);
    if (user.length === 0 || user[0].role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete quizzes' });
    }

    // Notīra user_badges ierakstus, kas atsaucas uz šo viktorīnu
    await db.promise().query('DELETE FROM user_badges WHERE badge_source = "quiz" AND source_id = ?', [id]);
    await db.promise().query('DELETE FROM quizzes WHERE id = ?', [id]);
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    console.error('Error deleting quiz:', err);
    res.status(500).json({ message: 'Failed to delete quiz' });
  }
});

// ===== VIKTORINU GALAPUNKTU BEIGAS =====

// Administrators: augšupielādēt žetona attēlu
app.post('/api/admin/badge-images', requireAuth, requireAdmin, uploadBadgeImage.single('badgeImage'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image file provided' });
  res.json({ filename: req.file.filename });
});

// Administrators: iegūt visus atsevišķos žetonus
app.get('/api/admin/standalone-badges', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [badges] = await db.promise().query(
      `SELECT sb.*, u.username AS created_by_username FROM standalone_badges sb
       LEFT JOIN users u ON sb.created_by = u.id
       ORDER BY sb.created_at DESC`
    );
    res.json(badges);
  } catch (err) {
    console.error('Error fetching standalone badges:', err);
    res.status(500).json({ message: 'Failed to fetch badges' });
  }
});

// Administrators: izveidot atsevišķu žetonu
app.post('/api/admin/standalone-badges', requireAuth, requireAdmin, async (req, res) => {
  const { name, description, image } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Badge name is required' });
  try {
    const [result] = await db.promise().query(
      'INSERT INTO standalone_badges (name, description, image, created_by) VALUES (?, ?, ?, ?)',
      [name.trim(), description?.trim() || null, image || null, req.userId]
    );
    res.status(201).json({ message: 'Badge created', badgeId: result.insertId });
  } catch (err) {
    console.error('Error creating badge:', err);
    res.status(500).json({ message: 'Failed to create badge' });
  }
});

// Administrators: piešķirt lietotājam atsevišķu žetonu
app.post('/api/admin/standalone-badges/:id/award', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { userId: targetUserId } = req.body;
  if (!targetUserId) return res.status(400).json({ message: 'userId is required' });
  try {
    const [users] = await db.promise().query('SELECT id FROM users WHERE id = ?', [targetUserId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    await db.promise().query(
      'INSERT INTO user_badges (user_id, badge_source, source_id, badge_type, awarded_by) VALUES (?, "standalone", ?, "standalone", ?)',
      [targetUserId, id, req.userId]
    );
    res.json({ message: 'Badge awarded' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'User already has this badge' });
    console.error('Error awarding badge:', err);
    res.status(500).json({ message: 'Failed to award badge' });
  }
});

// Administrators: dzēst atsevišķu žetonu
app.delete('/api/admin/standalone-badges/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Notīra user_badges ierakstus, kas atsaucas uz šo atsevišķo žetonu
    await db.promise().query('DELETE FROM user_badges WHERE badge_source = "standalone" AND source_id = ?', [req.params.id]);
    await db.promise().query('DELETE FROM standalone_badges WHERE id = ?', [req.params.id]);
    res.json({ message: 'Badge deleted' });
  } catch (err) {
    console.error('Error deleting badge:', err);
    res.status(500).json({ message: 'Failed to delete badge' });
  }
});

// Iegūst seriāla detaļas, ieskaitot sezonas
app.get('/api/tmdb/series-seasons/:id', async (req, res) => {
  const seriesId = req.params.id;
  try {
    const language = resolveTmdbLanguage(req.query.lang);
    const response = await tmdbGetWithFallback(`/tv/${seriesId}`, {}, language, ['name', 'overview']);
    res.json(response.data); // this includes series info + seasons
  } catch (err) {
    console.error('TMDB fetch error:', err.message);
    res.status(err.response?.status || 500).json({ message: 'Failed to fetch series data' });
  }
});


app.get('/api/tmdb/top-series', async (req, res) => {
  try {
    const language = resolveTmdbLanguage(req.query.lang);
    const isLatvian = language.startsWith('lv');
    // 1. Iegūst žanru karti (apstrādā latviešu automātisko tulkošanu un kešošanu)
    const genreMap = await getGenreMap(language);

    // 2. Iegūst populāros TV seriālus (pirmo lapu)
    const response = await tmdbGet('/tv/popular', { page: 1 }, language);
    let enById = new Map();
    if (isLatvian) {
      const enResponse = await tmdbGet('/tv/popular', { page: 1 }, 'en-US');
      enById = new Map((enResponse.data.results || []).map((s) => [s.id, s]));
    }

    // 3. Paņem top 12 seriālus un kartē žanru ID uz nosaukumiem
    const shows = await Promise.all(response.data.results.slice(0, 12).map(async (show) => {
      const enShow = enById.get(show.id) || {};

      const localizedTitle = hasMeaningfulText(show.name) ? show.name.trim() : '';
      const englishTitle = hasMeaningfulText(enShow.name) ? enShow.name.trim() : '';
      const resolvedTitle = isLatvian
        ? await resolveLatvianTitleWithFallback(localizedTitle, englishTitle)
        : { title: localizedTitle || englishTitle || '', englishTitle: englishTitle || localizedTitle || '', machineTranslatedTitle: false };

      let description = normalizeOverview(show.overview);
      const enOverview = normalizeOverview(enShow.overview);
      if (isLatvian && shouldAutoTranslateForLatvian(show.overview, enShow.overview) && hasMeaningfulText(enOverview)) {
        description = normalizeOverview(await translateTextToLatvian(enOverview));
      }

      return {
        id: show.id,
        title: resolvedTitle.title,
        english_title: resolvedTitle.englishTitle || resolvedTitle.title,
        machine_translated_title: !!resolvedTitle.machineTranslatedTitle,
        description,
        release_year: show.first_air_date ? parseInt(show.first_air_date.slice(0, 4)) : null,
        series_picture: show.poster_path,
        genres: show.genre_ids.map(id => genreMap[id] || id)
      };
    }));

    res.json(shows);

  } catch (err) {
    console.error('TMDB fetch error:', err.message);
    res.status(500).json({ message: 'Failed to fetch TMDB series' });
  }
});


// Iegūst seriāla detaļas, ieskaitot visas sezonas un sērijas (viens izsaukums uz seriālu)
app.get('/api/tmdb/series-details/:id', async (req, res) => {
  const seriesId = req.params.id;
  try {
    const language = resolveTmdbLanguage(req.query.lang);
    const isLatvian = language.startsWith('lv');
    const genreMap = await getGenreMap(language);
    const [seriesRes, englishSeriesRes] = await Promise.all([
      tmdbGetWithFallback(`/tv/${seriesId}`, {}, language, ['name', 'overview']),
      isLatvian ? tmdbGet(`/tv/${seriesId}`, {}, 'en-US') : Promise.resolve(null)
    ]);

    // Iegūst sērijas visām sezonām
    const seasonsWithEpisodes = await Promise.all(
      (seriesRes.data.seasons || []).map(async season => {
        const epRes = await tmdbGetWithFallback(
          `/tv/${seriesId}/season/${season.season_number}`,
          {},
          language,
          ['name', 'overview']
        );
        return { ...season, episodes: epRes.data.episodes || [] };
      })
    );

    const seriesGenres = (seriesRes.data?.genres || []).map((genre) => ({
      ...genre,
      name: genreMap[genre.id] || genre.name
    }));

    const resolvedTitle = isLatvian
      ? await resolveLatvianTitleWithFallback(seriesRes.data?.name, englishSeriesRes?.data?.name)
      : {
        title: seriesRes.data?.name || '',
        englishTitle: englishSeriesRes?.data?.name || seriesRes.data?.name || '',
        machineTranslatedTitle: false
      };

    const seriesData = {
      ...seriesRes.data,
      name: resolvedTitle.title || seriesRes.data?.name || '',
      genres: seriesGenres,
      english_name: resolvedTitle.englishTitle || seriesRes.data?.name || '',
      machine_translated_title: !!resolvedTitle.machineTranslatedTitle,
      overview: normalizeOverview(seriesRes.data?.overview)
    };
    res.json({ ...seriesData, seasons: seasonsWithEpisodes });

  } catch (err) {
    console.error('TMDB fetch error:', err.message);
    res.status(err.response?.status || 500).json({ message: 'Failed to fetch series details' });
  }
});
// Iegūst seriāla video (treilerus)
app.get('/api/tmdb/series-videos/:id', async (req, res) => {
  const seriesId = req.params.id;
  try {
    const language = resolveTmdbLanguage(req.query.lang);
    const videosRes = await tmdbGet(`/tv/${seriesId}/videos`, {}, language);

    const videos = videosRes.data?.results || [];
    const channelHints = ['TV Promos', 'Rotten Tomatoes', 'Paramount Plus'];
    const preferred = videos.filter(v => v.site === 'YouTube' && channelHints.some(h => (v.name || '').toLowerCase().includes(h.toLowerCase())));
    const trailer = preferred.find(v => v.type === 'Trailer')
      || preferred.find(v => v.type === 'Teaser')
      || videos.find(v => v.site === 'YouTube' && v.type === 'Trailer')
      || videos.find(v => v.site === 'YouTube' && v.type === 'Teaser')
      || videos.find(v => v.site === 'YouTube');

    if (!trailer) return res.json({ key: null });

    res.json({ key: trailer.key, name: trailer.name, type: trailer.type });
  } catch (err) {
    console.error('TMDB videos fetch error:', err.message);
    res.status(err.response?.status || 500).json({ message: 'Failed to fetch series videos' });
  }
});
// Meklē seriālus pēc vaicājuma (TMDB)
app.get('/api/tmdb/search-series', async (req, res) => {
  const query = req.query.query;
  if (!query) return res.json([]); // return empty array if no query

  try {
    const language = resolveTmdbLanguage(req.query.lang);
    const isLatvian = language.startsWith('lv');
    const response = await tmdbGet('/search/tv', { query, page: 1 }, language);
    let enById = new Map();
    if (isLatvian) {
      const enResponse = await tmdbGet('/search/tv', { query, page: 1 }, 'en-US');
      enById = new Map((enResponse.data.results || []).map((s) => [s.id, s]));
    }

    const results = await Promise.all(response.data.results.map(async (show) => {
      const enShow = enById.get(show.id) || {};
      const localizedTitle = hasMeaningfulText(show.name) ? show.name.trim() : '';
      const englishTitle = hasMeaningfulText(enShow.name) ? enShow.name.trim() : '';
      const resolvedTitle = isLatvian
        ? await resolveLatvianTitleWithFallback(localizedTitle, englishTitle)
        : { title: localizedTitle || englishTitle || '', englishTitle: englishTitle || localizedTitle || '', machineTranslatedTitle: false };

      return {
        id: show.id,
        title: resolvedTitle.title,
        english_title: resolvedTitle.englishTitle || resolvedTitle.title,
        machine_translated_title: !!resolvedTitle.machineTranslatedTitle,
        series_picture: show.poster_path
      };
    }));

    res.json(results);
  } catch (err) {
    console.error('TMDB search error:', err.message);
    res.status(500).json({ message: 'Failed to search series' });
  }
});

// Iegūst vieglus seriāla metadatus, ko izmanto profilā/statistikā/viktorīnās
app.get('/api/tmdb/series/:id', async (req, res) => {
  try {
    const language = resolveTmdbLanguage(req.query.lang);
    const isLatvian = language.startsWith('lv');
    const [response, englishResponse, genreMap] = await Promise.all([
      tmdbGetWithFallback(`/tv/${req.params.id}`, {}, language, ['name', 'overview']),
      isLatvian ? tmdbGet(`/tv/${req.params.id}`, {}, 'en-US') : Promise.resolve(null),
      getGenreMap(language)
    ]);

    const genres = (response.data?.genres || []).map((genre) => ({
      ...genre,
      name: genreMap[genre.id] || genre.name
    }));

    const resolvedTitle = isLatvian
      ? await resolveLatvianTitleWithFallback(response.data?.name, englishResponse?.data?.name)
      : {
        title: response.data?.name || '',
        englishTitle: englishResponse?.data?.name || response.data?.name || '',
        machineTranslatedTitle: false
      };

    res.json({
      ...response.data,
      name: resolvedTitle.title || response.data?.name || '',
      genres,
      english_name: resolvedTitle.englishTitle || response.data?.name || '',
      machine_translated_title: !!resolvedTitle.machineTranslatedTitle,
      overview: normalizeOverview(response.data?.overview)
    });
  } catch (err) {
    console.error('TMDB series fetch error:', err.message);
    res.status(err.response?.status || 500).json({ message: 'Failed to fetch series' });
  }
});

// ===== JAUNAS FUNKCIJAS: PUBLISKIE PROFILI, NOSKATITIE SERIALI, SEKOTIE SERIALI, LIETOTAJU SARAKSTI, PAZINOJUMI =====

// Iegūst cita lietotāja publisko profilu
app.get('/api/users/:userId/public-profile', async (req, res) => {
  const { userId } = req.params;

  try {
    const [users] = await db.promise().query(
      'SELECT id, username, profile_picture, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = users[0];

    // Iegūst lietotāja atsauksmju skaitu
    const [reviewCounts] = await db.promise().query(
      'SELECT COUNT(*) as count FROM reviews WHERE user_id = ?',
      [userId]
    );

    // Iegūst sekoto seriālu skaitu
    const [followedCounts] = await db.promise().query(
      'SELECT COUNT(*) as count FROM user_shows WHERE user_id = ? AND is_followed = 1',
      [userId]
    );

    // Iegūst žetonus
    const [badges] = await db.promise().query(
      `SELECT ub.id, ub.earned_at, ub.badge_type, ub.badge_source, ub.source_id,
              CASE WHEN ub.badge_source = 'quiz' THEN COALESCE(ub.badge_name_override, q.title) ELSE COALESCE(ub.badge_name_override, sb.name) END AS title,
              CASE WHEN ub.badge_source = 'quiz' THEN q.icon_emoji ELSE NULL END AS icon_emoji,
              CASE WHEN ub.badge_source = 'quiz' THEN ub.badge_image ELSE sb.image END AS badge_image
       FROM user_badges ub
       LEFT JOIN quizzes q ON ub.badge_source = 'quiz' AND ub.source_id = q.id
       LEFT JOIN standalone_badges sb ON ub.badge_source = 'standalone' AND ub.source_id = sb.id
       WHERE ub.user_id = ?
       ORDER BY ub.earned_at DESC`,
      [userId]
    );

    res.json({
      user,
      reviewCount: reviewCounts[0].count,
      followedShowsCount: followedCounts[0].count,
      badges
    });
  } catch (err) {
    console.error('Error fetching public profile:', err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Iegūst vienu atsauksmi ar visām detaļām
app.get('/api/reviews/:reviewId', async (req, res) => {
  const { reviewId } = req.params;
  const language = resolveTmdbLanguage(req.query.lang);
  const isLatvian = language.startsWith('lv');

  try {
    const [reviews] = await db.promise().query(
      `SELECT r.*, u.username, u.profile_picture
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [reviewId]
    );

    if (reviews.length === 0) return res.status(404).json({ message: 'Review not found' });

    const review = reviews[0];
    review.review_language = detectReviewLanguage(review.review_title, review.review_text);

    // Iegūst kopējo lietotāja atsauksmju skaitu
    const [userReviews] = await db.promise().query(
      'SELECT COUNT(*) as count FROM reviews WHERE user_id = ?',
      [review.user_id]
    );

    // Iegūst TMDB seriāla detaļas
    const [seriesRes, englishSeriesRes] = await Promise.all([
      tmdbGetWithFallback(`/tv/${review.tmdb_series_id}`, {}, language, ['name', 'overview']),
      isLatvian ? tmdbGet(`/tv/${review.tmdb_series_id}`, {}, 'en-US') : Promise.resolve(null)
    ]);

    const resolvedSeriesTitle = isLatvian
      ? await resolveLatvianTitleWithFallback(seriesRes.data?.name, englishSeriesRes?.data?.name)
      : {
        title: seriesRes.data?.name || '',
        englishTitle: englishSeriesRes?.data?.name || seriesRes.data?.name || '',
        machineTranslatedTitle: false
      };

    // Iegūst sērijas detaļas
    const episodeRes = await tmdbGetWithFallback(
      `/tv/${review.tmdb_series_id}/season/${review.season_number}/episode/${review.episode_number}`,
      {},
      language,
      ['name', 'overview']
    );

    // Iegūst komentārus
    const [comments] = await db.promise().query(
      `SELECT c.*, u.username, u.profile_picture FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.review_id = ?
       ORDER BY c.created_at ASC`,
      [reviewId]
    );

    res.json({
      review,
      seriesInfo: {
        ...seriesRes.data,
        name: resolvedSeriesTitle.title || seriesRes.data?.name || '',
        english_name: resolvedSeriesTitle.englishTitle || seriesRes.data?.name || '',
        machine_translated_title: !!resolvedSeriesTitle.machineTranslatedTitle,
        overview: normalizeOverview(seriesRes.data?.overview)
      },
      episodeInfo: episodeRes.data,
      userReviewCount: userReviews[0].count,
      comments
    });
  } catch (err) {
    console.error('Error fetching review:', err);
    res.status(500).json({ message: 'Failed to fetch review' });
  }
});

// Atzīmē seriālu kā noskatītu
app.post('/api/watched-shows', requireAuth, async (req, res) => {
  const { tmdb_series_id, watched_status } = req.body;
  const userId = req.userId;

  try {
    await db.promise().query(
      `INSERT INTO user_shows (user_id, tmdb_series_id, watched_status, watched_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE watched_status = VALUES(watched_status), watched_at = NOW()`,
      [userId, tmdb_series_id, watched_status]
    );

    res.json({ message: 'Show watch status updated' });
  } catch (err) {
    console.error('Error updating watched show:', err);
    res.status(500).json({ message: 'Failed to update watch status' });
  }
});

// Atzīmē sēriju kā noskatītu
app.post('/api/watched-episodes', requireAuth, async (req, res) => {
  const { tmdb_series_id, season_number, episode_number } = req.body;
  const userId = req.userId;

  try {
    const [existing] = await db.promise().query(
      'SELECT * FROM watched_episodes WHERE user_id = ? AND tmdb_series_id = ? AND season_number = ? AND episode_number = ?',
      [userId, tmdb_series_id, season_number, episode_number]
    );

    if (existing.length === 0) {
      await db.promise().query(
        'INSERT INTO watched_episodes (user_id, tmdb_series_id, season_number, episode_number) VALUES (?, ?, ?, ?)',
        [userId, tmdb_series_id, season_number, episode_number]
      );
    }

    res.json({ message: 'Episode marked as watched' });
  } catch (err) {
    console.error('Error marking episode as watched:', err);
    res.status(500).json({ message: 'Failed to mark episode as watched' });
  }
});

// Iegūst lietotāja noskatītos seriālus
app.get('/api/watched-shows/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [watched] = await db.promise().query(
      'SELECT id, user_id, tmdb_series_id, watched_status, watched_at FROM user_shows WHERE user_id = ? AND watched_status IS NOT NULL',
      [userId]
    );

    res.json(watched);
  } catch (err) {
    console.error('Error fetching watched shows:', err);
    res.status(500).json({ message: 'Failed to fetch watched shows' });
  }
});

// Iegūst seriāla noskatītās sērijas
app.get('/api/watched-episodes/:userId/:seriesId', async (req, res) => {
  const { userId, seriesId } = req.params;

  try {
    const [episodes] = await db.promise().query(
      'SELECT * FROM watched_episodes WHERE user_id = ? AND tmdb_series_id = ?',
      [userId, seriesId]
    );

    res.json(episodes);
  } catch (err) {
    console.error('Error fetching watched episodes:', err);
    res.status(500).json({ message: 'Failed to fetch watched episodes' });
  }
});

// Sekot seriālam
app.post('/api/follow-show', requireAuth, async (req, res) => {
  const { tmdb_series_id } = req.body;
  const userId = req.userId;

  try {
    await db.promise().query(
      `INSERT INTO user_shows (user_id, tmdb_series_id, is_followed, followed_at)
       VALUES (?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE is_followed = 1, followed_at = COALESCE(followed_at, NOW())`,
      [userId, tmdb_series_id]
    );

    res.json({ message: 'Show followed' });
  } catch (err) {
    console.error('Error following show:', err);
    res.status(500).json({ message: 'Failed to follow show' });
  }
});

// Atsekot seriālam
app.post('/api/unfollow-show', requireAuth, async (req, res) => {
  const { tmdb_series_id } = req.body;
  const userId = req.userId;

  try {
    await db.promise().query(
      'UPDATE user_shows SET is_followed = 0, followed_at = NULL WHERE user_id = ? AND tmdb_series_id = ?',
      [userId, tmdb_series_id]
    );

    res.json({ message: 'Show unfollowed' });
  } catch (err) {
    console.error('Error unfollowing show:', err);
    res.status(500).json({ message: 'Failed to unfollow show' });
  }
});

// Iegūst lietotāja sekotos seriālus
app.get('/api/followed-shows/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [shows] = await db.promise().query(
      'SELECT id, user_id, tmdb_series_id, followed_at FROM user_shows WHERE user_id = ? AND is_followed = 1',
      [userId]
    );

    res.json(shows);
  } catch (err) {
    console.error('Error fetching followed shows:', err);
    res.status(500).json({ message: 'Failed to fetch followed shows' });
  }
});

// ===== LIETOTĀJU SEKOŠANA (sekošana citiem lietotājiem) =====

// Sekot lietotājam
app.post('/api/users/:id/follow', requireAuth, async (req, res) => {
  const followingId = parseInt(req.params.id);
  const followerId = req.userId;

  if (followerId === followingId) {
    return res.status(400).json({ message: 'Cannot follow yourself' });
  }

  try {
    const [existing] = await db.promise().query(
      'SELECT * FROM user_follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Already following this user' });
    }

    await db.promise().query(
      'INSERT INTO user_follows (follower_id, following_id) VALUES (?, ?)',
      [followerId, followingId]
    );

    // Izveido paziņojumu lietotājam, kuram seko
    try {
      const [followerRows] = await db.promise().query('SELECT username FROM users WHERE id = ?', [followerId]);
      const followerName = followerRows.length > 0 ? followerRows[0].username : 'Someone';
      const message = `${followerName} started following you`;
      await db.promise().query(
        'INSERT INTO notifications (user_id, tmdb_series_id, notification_type, message) VALUES (?, ?, ?, ?)',
        [followingId, 0, 'follow', message]
      );
    } catch (notifErr) {
      console.error('Error creating follow notification:', notifErr);
    }

    // Pārbauda sasniegumu kosmētiku lietotājam, kurš iegūst sekotāju
    checkAndAwardMilestones(followingId).catch(() => {});

    res.json({ message: 'Now following user' });
  } catch (err) {
    console.error('Error following user:', err);
    res.status(500).json({ message: 'Failed to follow user' });
  }
});

// Atsekot lietotājam
app.delete('/api/users/:id/follow', requireAuth, async (req, res) => {
  const followingId = parseInt(req.params.id);
  const followerId = req.userId;

  try {
    await db.promise().query(
      'DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
    res.json({ message: 'Unfollowed user' });
  } catch (err) {
    console.error('Error unfollowing user:', err);
    res.status(500).json({ message: 'Failed to unfollow user' });
  }
});

// Pārbauda, vai pašreizējais lietotājs seko lietotājam
app.get('/api/users/:id/follow-status', requireAuth, async (req, res) => {
  const followingId = parseInt(req.params.id);
  const followerId = req.userId;

  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM user_follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
    res.json({ isFollowing: rows.length > 0 });
  } catch (err) {
    console.error('Error checking follow status:', err);
    res.status(500).json({ message: 'Failed to check follow status' });
  }
});

// Iegūst lietotāja sekotāju/sekošanas skaitu
app.get('/api/users/:id/follow-counts', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const [followers] = await db.promise().query(
      'SELECT COUNT(*) as count FROM user_follows WHERE following_id = ?',
      [userId]
    );
    const [following] = await db.promise().query(
      'SELECT COUNT(*) as count FROM user_follows WHERE follower_id = ?',
      [userId]
    );
    res.json({
      followers: followers[0].count,
      following: following[0].count
    });
  } catch (err) {
    console.error('Error fetching follow counts:', err);
    res.status(500).json({ message: 'Failed to fetch follow counts' });
  }
});

// Iegūst kopīgos sekotos seriālus starp pašreizējo un citu lietotāju
app.get('/api/users/:id/common-shows', requireAuth, async (req, res) => {
  const otherUserId = parseInt(req.params.id);
  const currentUserId = req.userId;

  try {
    const [commonFollowed] = await db.promise().query(
      `SELECT us1.tmdb_series_id
       FROM user_shows us1
       INNER JOIN user_shows us2 ON us1.tmdb_series_id = us2.tmdb_series_id
       WHERE us1.user_id = ? AND us2.user_id = ? AND us1.is_followed = 1 AND us2.is_followed = 1`,
      [currentUserId, otherUserId]
    );

    const [commonFavorites] = await db.promise().query(
      `SELECT uf1.tmdb_series_id, uf1.position AS your_position, uf2.position AS their_position
       FROM user_favorites uf1
       INNER JOIN user_favorites uf2 ON uf1.tmdb_series_id = uf2.tmdb_series_id
       WHERE uf1.user_id = ? AND uf2.user_id = ?`,
      [currentUserId, otherUserId]
    );

    res.json({
      commonFollowedShows: commonFollowed.map(r => r.tmdb_series_id),
      commonFavorites: commonFavorites
    });
  } catch (err) {
    console.error('Error fetching common shows:', err);
    res.status(500).json({ message: 'Failed to fetch common shows' });
  }
});

// Iegūst lietotāja favorītus (publiskais skats)
app.get('/api/users/:id/public-favorites', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const [favorites] = await db.promise().query(
      'SELECT position, tmdb_series_id FROM user_favorites WHERE user_id = ? ORDER BY position',
      [userId]
    );
    res.json(favorites);
  } catch (err) {
    console.error('Error fetching public favorites:', err);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
});

// Iegūst lietotāja paziņojumus
app.get('/api/notifications', requireAuth, async (req, res) => {
  const userId = req.userId;

  try {
    const [notifications] = await db.promise().query(
      `SELECT n.* FROM notifications n
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Atzīmē visus paziņojumus kā izlasītus (jābūt pirms /:id/read, lai izvairītos no parametra sakritības)
app.post('/api/notifications/mark-all-read', requireAuth, async (req, res) => {
  const userId = req.userId;

  try {
    await db.promise().query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [userId]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

// Atzīmē paziņojumu kā izlasītu
app.post('/api/notifications/:id/read', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    await db.promise().query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Dzēš visus lietotāja paziņojumus (jābūt pirms /:id, lai izvairītos no parametra sakritības)
app.delete('/api/notifications', requireAuth, async (req, res) => {
  const userId = req.userId;

  try {
    await db.promise().query(
      'DELETE FROM notifications WHERE user_id = ?',
      [userId]
    );

    res.json({ message: 'All notifications deleted' });
  } catch (err) {
    console.error('Error deleting all notifications:', err);
    res.status(500).json({ message: 'Failed to delete all notifications' });
  }
});

// Dzēš vienu paziņojumu
app.delete('/api/notifications/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    await db.promise().query(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

// Izvēlas profilā rādāmo žetonu
app.post('/api/users/:userId/select-badge', requireAuth, async (req, res) => {
  const { userId } = req.params;
  const { badgeId } = req.body;
  const authUserId = req.userId;

  if (parseInt(userId) !== authUserId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    // Atļauj notīrīt žetona izvēli
    if (badgeId === null || badgeId === undefined) {
      await db.promise().query(
        'UPDATE users SET selected_badge_id = NULL WHERE id = ?',
        [userId]
      );
      return res.json({ message: 'Badge removed from profile' });
    }

    // Pārbauda, vai žetons pieder šim lietotājam (pārbauda vienoto user_badges tabulu)
    const [ownedBadges] = await db.promise().query(
      'SELECT id FROM user_badges WHERE id = ? AND user_id = ?',
      [badgeId, userId]
    );

    if (ownedBadges.length === 0) {
      return res.status(404).json({ message: 'Badge not found' });
    }

    // Atjaunina users tabulu ar izvēlēto žetonu
    await db.promise().query(
      'UPDATE users SET selected_badge_id = ? WHERE id = ?',
      [badgeId, userId]
    );

    res.json({ message: 'Badge selected for profile' });
  } catch (err) {
    console.error('Error selecting badge:', err);
    res.status(500).json({ message: 'Failed to select badge' });
  }
});

// ==================== KOSMETIKAS GALAPUNKTI ====================

// Iegūst lietotāja nopelnītās kosmētikas inventāru
app.get('/api/users/:userId/cosmetics', async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT c.*, uc.earned_at, uc.source_detail
       FROM user_cosmetics uc
       JOIN cosmetics c ON uc.cosmetic_id = c.id
       WHERE uc.user_id = ?
       ORDER BY uc.earned_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching user cosmetics:', err);
    res.status(500).json({ message: 'Failed to fetch cosmetics' });
  }
});

// Iegūst lietotāja aktīvo (aprīkoto) kosmētiku — publisks galapunkts
app.get('/api/users/:userId/active-cosmetics', async (req, res) => {
  try {
    const [users] = await db.promise().query(
      'SELECT active_cursor_trail, active_background_effect FROM users WHERE id = ?',
      [req.params.userId]
    );
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = users[0];
    let cursorTrail = null;
    let backgroundEffect = null;

    if (user.active_cursor_trail) {
      const [ct] = await db.promise().query('SELECT * FROM cosmetics WHERE id = ?', [user.active_cursor_trail]);
      if (ct.length) cursorTrail = ct[0];
    }
    if (user.active_background_effect) {
      const [bg] = await db.promise().query('SELECT * FROM cosmetics WHERE id = ?', [user.active_background_effect]);
      if (bg.length) backgroundEffect = bg[0];
    }

    res.json({ cursorTrail, backgroundEffect });
  } catch (err) {
    console.error('Error fetching active cosmetics:', err);
    res.status(500).json({ message: 'Failed to fetch active cosmetics' });
  }
});

// Aprīko kosmētiku
app.post('/api/users/:userId/equip-cosmetic', requireAuth, async (req, res) => {
  const { userId } = req.params;
  const { cosmeticId, slot } = req.body;

  if (parseInt(userId) !== req.userId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  if (!['cursor_trail', 'background_effect'].includes(slot)) {
    return res.status(400).json({ message: 'Invalid slot' });
  }

  try {
    // Pārbauda īpašumtiesības
    const [owned] = await db.promise().query(
      'SELECT id FROM user_cosmetics WHERE user_id = ? AND cosmetic_id = ?',
      [userId, cosmeticId]
    );
    if (owned.length === 0) return res.status(404).json({ message: 'Cosmetic not owned' });

    // Pārbauda, vai kosmētikas tips atbilst slotam
    const [cosmetic] = await db.promise().query('SELECT type FROM cosmetics WHERE id = ?', [cosmeticId]);
    if (cosmetic.length === 0) return res.status(404).json({ message: 'Cosmetic not found' });
    if (cosmetic[0].type !== slot) return res.status(400).json({ message: 'Cosmetic type does not match slot' });

    const column = slot === 'cursor_trail' ? 'active_cursor_trail' : 'active_background_effect';
    await db.promise().query(`UPDATE users SET ${column} = ? WHERE id = ?`, [cosmeticId, userId]);

    res.json({ message: 'Cosmetic equipped' });
  } catch (err) {
    console.error('Error equipping cosmetic:', err);
    res.status(500).json({ message: 'Failed to equip cosmetic' });
  }
});

// Noņem kosmētiku
app.post('/api/users/:userId/unequip-cosmetic', requireAuth, async (req, res) => {
  const { userId } = req.params;
  const { slot } = req.body;

  if (parseInt(userId) !== req.userId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  if (!['cursor_trail', 'background_effect'].includes(slot)) {
    return res.status(400).json({ message: 'Invalid slot' });
  }

  try {
    const column = slot === 'cursor_trail' ? 'active_cursor_trail' : 'active_background_effect';
    await db.promise().query(`UPDATE users SET ${column} = NULL WHERE id = ?`, [userId]);
    res.json({ message: 'Cosmetic unequipped' });
  } catch (err) {
    console.error('Error unequipping cosmetic:', err);
    res.status(500).json({ message: 'Failed to unequip cosmetic' });
  }
});

// Iegūst pilnu kosmētikas katalogu ar avotiem
app.get('/api/cosmetics/catalog', async (req, res) => {
  try {
    const [cosmetics] = await db.promise().query('SELECT * FROM cosmetics ORDER BY type, rarity DESC, name');
    const [sources] = await db.promise().query(
      `SELECT cs.*, q.title AS quiz_title
       FROM cosmetic_sources cs
       LEFT JOIN quizzes q ON cs.quiz_id = q.id`
    );

    const catalog = cosmetics.map(c => ({
      ...c,
      config: c.config ? JSON.parse(c.config) : null,
      sources: sources.filter(s => s.cosmetic_id === c.id)
    }));

    res.json(catalog);
  } catch (err) {
    console.error('Error fetching cosmetics catalog:', err);
    res.status(500).json({ message: 'Failed to fetch catalog' });
  }
});

// Administrators: izveidot kosmētiku
app.post('/api/admin/cosmetics', requireAuth, requireAdmin, async (req, res) => {
  const { name, description, type, effect_key, config, preview_image, rarity } = req.body;
  if (!name?.trim() || !type || !effect_key?.trim()) {
    return res.status(400).json({ message: 'name, type, and effect_key are required' });
  }
  try {
    const configStr = config ? (typeof config === 'string' ? config : JSON.stringify(config)) : null;
    const [result] = await db.promise().query(
      'INSERT INTO cosmetics (name, description, type, effect_key, config, preview_image, rarity) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name.trim(), description?.trim() || null, type, effect_key.trim(), configStr, preview_image || null, rarity || 'common']
    );
    res.status(201).json({ message: 'Cosmetic created', cosmeticId: result.insertId });
  } catch (err) {
    console.error('Error creating cosmetic:', err);
    res.status(500).json({ message: 'Failed to create cosmetic' });
  }
});

// Administrators: atjaunināt kosmētiku
app.put('/api/admin/cosmetics/:id', requireAuth, requireAdmin, async (req, res) => {
  const { name, description, type, effect_key, config, preview_image, rarity } = req.body;
  try {
    const configStr = config ? (typeof config === 'string' ? config : JSON.stringify(config)) : null;
    await db.promise().query(
      'UPDATE cosmetics SET name=?, description=?, type=?, effect_key=?, config=?, preview_image=?, rarity=? WHERE id=?',
      [name, description || null, type, effect_key, configStr, preview_image || null, rarity || 'common', req.params.id]
    );
    res.json({ message: 'Cosmetic updated' });
  } catch (err) {
    console.error('Error updating cosmetic:', err);
    res.status(500).json({ message: 'Failed to update cosmetic' });
  }
});

// Administrators: dzēst kosmētiku
app.delete('/api/admin/cosmetics/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.promise().query('DELETE FROM cosmetics WHERE id = ?', [req.params.id]);
    res.json({ message: 'Cosmetic deleted' });
  } catch (err) {
    console.error('Error deleting cosmetic:', err);
    res.status(500).json({ message: 'Failed to delete cosmetic' });
  }
});

// Administrators: piešķirt lietotājam kosmētiku
app.post('/api/admin/cosmetics/:id/award', requireAuth, requireAdmin, async (req, res) => {
  const { userId: targetUserId } = req.body;
  if (!targetUserId) return res.status(400).json({ message: 'userId is required' });
  try {
    const [users] = await db.promise().query('SELECT id FROM users WHERE id = ?', [targetUserId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    await db.promise().query(
      'INSERT INTO user_cosmetics (user_id, cosmetic_id, source_detail) VALUES (?, ?, ?)',
      [targetUserId, req.params.id, 'admin']
    );
    res.json({ message: 'Cosmetic awarded' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'User already has this cosmetic' });
    console.error('Error awarding cosmetic:', err);
    res.status(500).json({ message: 'Failed to award cosmetic' });
  }
});

// Administrators: iegūt visus kosmētikas avotus
app.get('/api/admin/cosmetic-sources', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM cosmetic_sources ORDER BY cosmetic_id, source_type');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching cosmetic sources:', err);
    res.status(500).json({ message: 'Failed to fetch cosmetic sources' });
  }
});

// Administrators: saistīt kosmētiku ar avotu (viktorīnu vai sasniegumu)
app.post('/api/admin/cosmetic-sources', requireAuth, requireAdmin, async (req, res) => {
  const { cosmetic_id, source_type, quiz_id, min_score, milestone_type, milestone_value } = req.body;
  if (!cosmetic_id || !source_type) return res.status(400).json({ message: 'cosmetic_id and source_type are required' });
  try {
    const [result] = await db.promise().query(
      'INSERT INTO cosmetic_sources (cosmetic_id, source_type, quiz_id, min_score, milestone_type, milestone_value) VALUES (?, ?, ?, ?, ?, ?)',
      [cosmetic_id, source_type, quiz_id || null, min_score || 70, milestone_type || null, milestone_value || null]
    );
    res.status(201).json({ message: 'Source linked', sourceId: result.insertId });
  } catch (err) {
    console.error('Error creating cosmetic source:', err);
    res.status(500).json({ message: 'Failed to link source' });
  }
});

// Administrators: dzēst kosmētikas avotu
app.delete('/api/admin/cosmetic-sources/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.promise().query('DELETE FROM cosmetic_sources WHERE id = ?', [req.params.id]);
    res.json({ message: 'Source removed' });
  } catch (err) {
    console.error('Error deleting cosmetic source:', err);
    res.status(500).json({ message: 'Failed to remove source' });
  }
});

// Iegūst lietotāja profila komentārus (lietotāja publicētos komentārus)
app.get('/api/users/:userId/comments', async (req, res) => {
  const { userId } = req.params;

  try {
    const [comments] = await db.promise().query(
      `SELECT c.*, u.username, u.profile_picture, r.id as review_id, r.review_title
       FROM comments c
       JOIN users u ON c.user_id = u.id
       JOIN reviews r ON c.review_id = r.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [userId]
    );

    res.json(comments);
  } catch (err) {
    console.error('Error fetching user comments:', err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});






db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');

  db.query(`CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'guest') NOT NULL DEFAULT 'user',
    profile_picture VARCHAR(255) DEFAULT 'defaultpfp.jpg',
    selected_badge_id INT DEFAULT NULL,
    is_banned TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    avatar_config TEXT DEFAULT NULL,
    active_cursor_trail INT DEFAULT NULL,
    active_background_effect INT DEFAULT NULL
  )`, (err) => {
    if (err) console.error('Error creating users table:', err);
    else console.log('users table ready');
  });

  db.query(`CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tmdb_series_id INT NOT NULL DEFAULT 0,
    season_number INT NOT NULL DEFAULT 1,
    episode_number INT NOT NULL DEFAULT 1,
    rating TINYINT NOT NULL,
    review_text TEXT NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    review_title VARCHAR(200) NOT NULL,
    likes INT DEFAULT 0,
    dislikes INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    INDEX user_id_for_idx (user_id),
    INDEX idx_tmdb_series (tmdb_series_id),
    INDEX idx_tmdb_series_season_episode (tmdb_series_id, season_number, episode_number),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_rating_valid CHECK (rating BETWEEN 1 AND 5)
  )`, (err) => {
    if (err) console.error('Error creating reviews table:', err);
    else console.log('reviews table ready');
  });

  db.query(`CREATE TABLE IF NOT EXISTS review_reactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    review_id INT NOT NULL,
    is_like TINYINT NOT NULL,
    UNIQUE KEY unique_user_review (user_id, review_id),
    KEY review_id (review_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating review_reactions table:', err);
    else console.log('review_reactions table ready');
  });

  db.query(`CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    other_user_id INT DEFAULT NULL,
    review_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY user_id_idx (user_id),
    KEY other_user_id_idx (other_user_id),
    KEY fk_review_id (review_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating comments table:', err);
    else console.log('comments table ready');
  });

  db.query(`CREATE TABLE IF NOT EXISTS quotes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    text TEXT NOT NULL,
    author VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('Error creating quotes table:', err);
    else console.log('quotes table ready');
  });

  db.query("ALTER TABLE reviews ADD COLUMN likes INT DEFAULT 0", () => {});
  db.query("ALTER TABLE reviews ADD COLUMN dislikes INT DEFAULT 0", () => {});
  db.query("ALTER TABLE reviews ADD COLUMN comment_count INT DEFAULT 0", () => {});

  const seedAdminUsername = process.env.SEED_ADMIN_USERNAME;
  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL;
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (seedAdminUsername && seedAdminEmail && seedAdminPassword) {
    const hashedSeedPassword = bcrypt.hashSync(seedAdminPassword, 10);
    db.query(
      `INSERT INTO users (username, email, password, role)
       SELECT ?, ?, ?, 'admin'
       WHERE NOT EXISTS (
         SELECT 1 FROM users WHERE username = ? OR email = ? LIMIT 1
       )`,
      [seedAdminUsername, seedAdminEmail, hashedSeedPassword, seedAdminUsername, seedAdminEmail],
      (err, result) => {
        if (err) console.error('Error seeding admin user:', err);
        else if (result.affectedRows > 0) console.log('seed admin user ready');
        else console.log('seed admin user already exists');
      }
    );
  }
  
  // Izveido user_favorites tabulu, ja tā neeksistē
  db.query(`CREATE TABLE IF NOT EXISTS user_favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tmdb_series_id INT NOT NULL,
    position INT NOT NULL,
    UNIQUE KEY unique_user_position (user_id, position),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT user_favorites_chk_1 CHECK (position BETWEEN 1 AND 5)
  )`, (err) => {
    if (err) console.error('Error creating user_favorites table:', err);
    else console.log('user_favorites table ready');
  });

  // Izveido quizzes tabulu
  db.query(`CREATE TABLE IF NOT EXISTS quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_emoji VARCHAR(10) DEFAULT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(50) DEFAULT 'series',
    difficulty VARCHAR(20) DEFAULT 'medium',
    icon_name VARCHAR(50) DEFAULT NULL,
    tmdb_series_id INT DEFAULT NULL,
    quiz_image VARCHAR(255) DEFAULT NULL,
    badge_name VARCHAR(100) DEFAULT NULL,
    badge_rules TEXT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating quizzes table:', err);
    else console.log('quizzes table ready');
  });

  // Pievieno jaunas kolonnas quizzes tabulai, ja tās neeksistē (migrācija)
  const quizColumns = [
    "ALTER TABLE quizzes ADD COLUMN category VARCHAR(50) DEFAULT 'series'",
    "ALTER TABLE quizzes ADD COLUMN difficulty VARCHAR(20) DEFAULT 'medium'",
    "ALTER TABLE quizzes ADD COLUMN icon_name VARCHAR(50) DEFAULT NULL",
    "ALTER TABLE quizzes ADD COLUMN tmdb_series_id INT DEFAULT NULL",
    "ALTER TABLE quizzes ADD COLUMN quiz_image VARCHAR(255) DEFAULT NULL",
    "ALTER TABLE quizzes ADD COLUMN badge_name VARCHAR(100) DEFAULT NULL",
    "ALTER TABLE quizzes ADD COLUMN badge_rules TEXT DEFAULT NULL"
  ];
  for (const sql of quizColumns) {
    db.query(sql, () => {}); // Ignore errors if column already exists
  }

  // Migrē user_badges, lai atbalstītu vairākus žetonu tipus katrai viktorīnai
  db.query("ALTER TABLE user_badges ADD COLUMN badge_type VARCHAR(20) NOT NULL DEFAULT 'default'", () => {});

  // Izveido quiz_questions tabulu
  db.query(`CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255),
    option_b VARCHAR(255),
    option_c VARCHAR(255),
    option_d VARCHAR(255),
    correct_answer CHAR(1) NOT NULL,
    explanation TEXT,
    option_e VARCHAR(255),
    option_f VARCHAR(255),
    option_g VARCHAR(255),
    option_h VARCHAR(255),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating quiz_questions table:', err);
    else console.log('quiz_questions table ready');
  });

  // Migrē esošo quiz_questions tabulu, lai atbalstītu līdz 8 opcijām
  ['option_e', 'option_f', 'option_g', 'option_h'].forEach(col => {
    db.query(`ALTER TABLE quiz_questions ADD COLUMN ${col} VARCHAR(255)`, () => {});
  });

  // Izveido user_badges tabulu (vienota: viktorīnu žetoni + atsevišķie žetoni)
  db.query(`CREATE TABLE IF NOT EXISTS user_badges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    quiz_id INT DEFAULT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    badge_type VARCHAR(20) NOT NULL DEFAULT 'default',
    badge_image VARCHAR(255),
    badge_name_override VARCHAR(255),
    badge_source VARCHAR(20) NOT NULL DEFAULT 'quiz',
    source_id INT DEFAULT NULL,
    awarded_by INT DEFAULT NULL,
    UNIQUE KEY unique_user_badge_type (user_id, quiz_id, badge_type),
    UNIQUE KEY unique_user_badge_src (user_id, badge_source, source_id, badge_type),
    KEY quiz_id (quiz_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating user_badges table:', err);
    else console.log('user_badges table ready');
  });

  // Migrācija: pievieno jaunas kolonnas user_badges tabulai, ja atjaunina no vecās shēmas
  db.query("ALTER TABLE user_badges ADD COLUMN badge_source VARCHAR(20) NOT NULL DEFAULT 'quiz'", () => {});
  db.query("ALTER TABLE user_badges ADD COLUMN quiz_id INT DEFAULT NULL", () => {});
  db.query("ALTER TABLE user_badges ADD COLUMN source_id INT DEFAULT NULL", () => {});
  db.query("ALTER TABLE user_badges ADD COLUMN awarded_by INT DEFAULT NULL", () => {});
  db.query("ALTER TABLE user_badges ADD COLUMN badge_image VARCHAR(255)", () => {});
  db.query("ALTER TABLE user_badges ADD COLUMN badge_name_override VARCHAR(255)", () => {});
  db.query("UPDATE user_badges SET source_id = quiz_id WHERE source_id IS NULL AND quiz_id IS NOT NULL", () => {});

  // Atsevišķie žetoni (administratora izveidotas žetonu definīcijas)
  db.query(`CREATE TABLE IF NOT EXISTS standalone_badges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
  )`, (err) => {
    if (err) console.error('Error creating standalone_badges table:', err);
    else console.log('standalone_badges table ready');
  });

  // Izveido quiz_attempts tabulu (seko visiem mēģinājumiem)
  db.query(`CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating quiz_attempts table:', err);
    else console.log('quiz_attempts table ready');
  });

  // Izveido user_shows tabulu (aizstāj watched_shows + followed_shows)
  db.query(`CREATE TABLE IF NOT EXISTS user_shows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tmdb_series_id INT NOT NULL,
    watched_status VARCHAR(50) DEFAULT NULL,
    is_followed TINYINT DEFAULT 0,
    watched_at TIMESTAMP NULL DEFAULT NULL,
    followed_at TIMESTAMP NULL DEFAULT NULL,
    UNIQUE KEY unique_user_show (user_id, tmdb_series_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating user_shows table:', err);
    else console.log('user_shows table ready');
  });

  // Izveido watched_episodes tabulu
  db.query(`CREATE TABLE IF NOT EXISTS watched_episodes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tmdb_series_id INT NOT NULL,
    season_number INT NOT NULL,
    episode_number INT NOT NULL,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_episode (user_id, tmdb_series_id, season_number, episode_number),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating watched_episodes table:', err);
    else console.log('watched_episodes table ready');
  });

  // Izveido user_follows tabulu (sekošana citiem lietotājiem)
  db.query(`CREATE TABLE IF NOT EXISTS user_follows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_follow (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating user_follows table:', err);
    else console.log('user_follows table ready');
  });

  // Izveido notifications tabulu
  db.query(`CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tmdb_series_id INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    message TEXT,
    is_read INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating notifications table:', err);
    else console.log('notifications table ready');
  });

  // Pievieno selected_badge_id kolonnu users tabulai, ja tā neeksistē
  db.query(`ALTER TABLE users ADD COLUMN selected_badge_id INT`, (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') console.error('Error altering users table:', err);
    else console.log('users table checked for selected_badge_id');
  });

  // Pievieno is_banned kolonnu users tabulai, ja tā neeksistē
  db.query(`ALTER TABLE users ADD COLUMN is_banned TINYINT DEFAULT 0`, (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') console.error('Error altering users table:', err);
    else console.log('users table checked for is_banned');
  });

  // Pievieno created_at kolonnu users tabulai, ja tā neeksistē
  db.query(`ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`, (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') console.error('Error altering users table:', err);
    else console.log('users table checked for created_at');
  });

  // Pievieno avatar_config kolonnu users tabulai, ja tā neeksistē
  db.query(`ALTER TABLE users ADD COLUMN avatar_config TEXT DEFAULT NULL`, (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') console.error('Error altering users table:', err);
    else console.log('users table checked for avatar_config');
  });

  // Izveido cosmetics tabulu (visu kursora pēdu un fona efektu katalogs)
  db.query(`CREATE TABLE IF NOT EXISTS cosmetics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('cursor_trail', 'background_effect') NOT NULL,
    effect_key VARCHAR(50) NOT NULL,
    config TEXT,
    preview_image VARCHAR(255),
    rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('Error creating cosmetics table:', err);
    else console.log('cosmetics table ready');
  });

  // Izveido cosmetic_sources tabulu (kā kosmētika tiek nopelnīta)
  db.query(`CREATE TABLE IF NOT EXISTS cosmetic_sources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cosmetic_id INT NOT NULL,
    source_type ENUM('quiz', 'milestone', 'admin') NOT NULL,
    quiz_id INT DEFAULT NULL,
    min_score INT DEFAULT 70,
    milestone_type VARCHAR(50) DEFAULT NULL,
    milestone_value INT DEFAULT NULL,
    FOREIGN KEY (cosmetic_id) REFERENCES cosmetics(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating cosmetic_sources table:', err);
    else console.log('cosmetic_sources table ready');
  });

  // Izveido user_cosmetics tabulu (nopelnītais inventārs)
  db.query(`CREATE TABLE IF NOT EXISTS user_cosmetics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    cosmetic_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_detail VARCHAR(100),
    UNIQUE KEY unique_user_cosmetic (user_id, cosmetic_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cosmetic_id) REFERENCES cosmetics(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) console.error('Error creating user_cosmetics table:', err);
    else {
      console.log('user_cosmetics table ready');
      ensureDefaultCosmeticUnlocks();
    }
  });

  // Pievieno aktīvās kosmētikas kolonnas users tabulai
  db.query(`ALTER TABLE users ADD COLUMN active_cursor_trail INT DEFAULT NULL`, (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') console.error('Error altering users table:', err);
    else console.log('users table checked for active_cursor_trail');
  });
  db.query(`ALTER TABLE users ADD COLUMN active_background_effect INT DEFAULT NULL`, (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') console.error('Error altering users table:', err);
    else console.log('users table checked for active_background_effect');
  });

  maybeSeedDatabaseFromEnv().catch((err) => {
    console.error('Error seeding database from SQL:', err);
  });
});

// ==================== ADMINISTRATORA GALAPUNKTI ====================

// Iegūst visus lietotājus (administrators)
app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [users] = await db.promise().query(
      'SELECT id, username, email, role, profile_picture, is_banned, created_at FROM users ORDER BY id ASC'
    );
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Atjaunina lietotāja lomu (administrators)
app.put('/api/admin/users/:id/role', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  if (parseInt(id) === req.userId) {
    return res.status(400).json({ message: 'Cannot change your own role' });
  }
  try {
    await db.promise().query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: 'Role updated' });
  } catch (err) {
    console.error('Error updating role:', err);
    res.status(500).json({ message: 'Failed to update role' });
  }
});

// Bloķē/atbloķē lietotāju (administrators)
app.put('/api/admin/users/:id/ban', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { banned } = req.body;
  if (parseInt(id) === req.userId) {
    return res.status(400).json({ message: 'Cannot ban yourself' });
  }
  try {
    await db.promise().query('UPDATE users SET is_banned = ? WHERE id = ?', [banned ? 1 : 0, id]);
    res.json({ message: banned ? 'User banned' : 'User unbanned' });
  } catch (err) {
    console.error('Error updating ban status:', err);
    res.status(500).json({ message: 'Failed to update ban status' });
  }
});

// Dzēš lietotāju (administrators)
app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.userId) {
    return res.status(400).json({ message: 'Cannot delete yourself' });
  }
  try {
    await db.promise().query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Iegūst visus žetonus ar statistiku (administrators)
app.get('/api/admin/badges', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [badges] = await db.promise().query(
      `SELECT q.id, q.title, q.description, q.icon_emoji, q.created_at,
        (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) AS question_count,
        (SELECT COUNT(*) FROM user_badges WHERE badge_source = 'quiz' AND source_id = q.id) AS earned_count
       FROM quizzes q
       ORDER BY q.created_at DESC`
    );
    res.json(badges);
  } catch (err) {
    console.error('Error fetching badges:', err);
    res.status(500).json({ message: 'Failed to fetch badges' });
  }
});

// Iegūst visas atsauksmes ar lietotāja informāciju (administrators)
app.get('/api/admin/reviews', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [reviews] = await db.promise().query(
      `SELECT r.id, r.tmdb_series_id, r.season_number, r.episode_number,
              r.rating, r.review_title, r.review_text, r.date,
              u.username
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       ORDER BY r.date DESC
       LIMIT 200`
    );
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// Vietnes statistika (administrators)
app.get('/api/admin/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [[userCount]] = await db.promise().query('SELECT COUNT(*) AS count FROM users');
    const [[reviewCount]] = await db.promise().query('SELECT COUNT(*) AS count FROM reviews');
    const [[commentCount]] = await db.promise().query('SELECT COUNT(*) AS count FROM comments');
    const [[quizCount]] = await db.promise().query('SELECT COUNT(*) AS count FROM quizzes');
    res.json({
      totalUsers: userCount.count,
      totalReviews: reviewCount.count,
      totalComments: commentCount.count,
      totalQuizzes: quizCount.count
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Pievieno citātu (administrators)
app.post('/api/admin/quotes', requireAuth, requireAdmin, async (req, res) => {
  const { text, author } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Quote text is required' });
  }
  try {
    await db.promise().query('INSERT INTO quotes (text, author) VALUES (?, ?)', [text.trim(), author ? author.trim() : null]);
    res.json({ message: 'Quote added' });
  } catch (err) {
    console.error('Error adding quote:', err);
    res.status(500).json({ message: 'Failed to add quote' });
  }
});


// Servē priekšgalsistēmu (SPA rezerves ceļš) - turēt tikai beigās
app.use(express.static(path.join(__dirname, "dist")));

// Visu pārķerošais: servē index.html SPA lietotnei (saderīgs ar Express 5)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
