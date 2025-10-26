// backend/index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { getPool } = require('./db');

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_IMAGE_SIZE =
  (process.env.OPENAI_IMAGE_SIZE || '1024x1024').trim().toLowerCase();

const ALLOWED_SIZES = new Set([
  '1024x1024',
  '1024x1536',
  '1536x1024',
  'auto',
]);

function normalizeImageSize(size) {
  const s = (size || '').trim().toLowerCase();
  return ALLOWED_SIZES.has(s) ? s : '1024x1024';
}

// ---------- middleware ----------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  cors({
    origin: FRONTEND_URL === '*' ? true : FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// ---------- static uploads ----------
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ---------- health ----------
app.get('/health', async (_req, res) => {
  res.json({
    ok: true,
    port: String(PORT),
    base: BASE_URL,
    db: {
      host: process.env.DB_HOST,
      name: process.env.DB_NAME,
      user: process.env.DB_USER ? 'present' : 'missing',
    },
    ai: {
      key: OPENAI_API_KEY ? 'present' : 'missing',
      image_size: normalizeImageSize(OPENAI_IMAGE_SIZE),
    },
  });
});

// ---------- AI image helpers ----------
function imagePromptForPlant(name) {
  return `High-quality, realistic botanical photograph of the plant "${name}".
Full plant visible (leaves and stem), white background, centered, natural light, DSLR look. No text, no watermark.`;
}

async function openaiFetchJSON(url, body, retries = 2) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const json = await resp.json();
      if (!resp.ok) {
        const msg = json?.error?.message || 'OpenAI error';
        throw new Error(msg);
      }
      return json;
    } catch (e) {
      lastErr = e;
      // transient network error retry
      if (String(e.code || e.message).includes('ECONNRESET') && i < retries) {
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
        continue;
      }
      break;
    }
  }
  throw lastErr;
}

async function generateImageAndSave(prompt) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');

  const size = normalizeImageSize(OPENAI_IMAGE_SIZE);

  const body = await openaiFetchJSON(
    'https://api.openai.com/v1/images/generations',
    {
      prompt,
      n: 1,
      size, // ⬅️ always valid size now
      response_format: 'b64_json',
    }
  );

  const b64 = body?.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI: empty image');

  const buffer = Buffer.from(b64, 'base64');
  const filename = `${uuidv4()}.png`;
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);

  return `${BASE_URL}/uploads/${filename}`;
}

// ---------- /api/suggest (AI text) ----------
/**
 * POST /api/suggest
 * { plantName: "tulsi" }
 * -> { suggestions: { scientific_name, watering, sunlight, soil, fertilizer, seasonality, seasonalMonths[], uses_notes, image? } }
 */
app.post('/api/suggest', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) return res.status(400).json({ error: 'OPENAI_API_KEY missing' });
    const name = (req.body?.plantName || '').toString().trim();
    if (!name) return res.status(400).json({ error: 'plantName required' });

    const system = `You are a helpful botanist. Return concise factual care info as JSON. 
Keys:
- scientific_name (string)
- watering (string)
- sunlight (string)
- soil (string)
- fertilizer (string)
- seasonality (string)
- seasonalMonths (array of 3-letter month codes, e.g. ["Jan","Apr"])
- uses_notes (string)
- image (optional absolute URL photo; leave empty if unsure)`;

    const user = `Give JSON for plant "${name}". Only JSON, no prose.`;

    const body = await openaiFetchJSON(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }
    );

    const raw = body?.choices?.[0]?.message?.content || '{}';
    // content may contain code fences; strip them
    const cleaned = raw.replace(/```json|```/g, '').trim();
    let suggestions = {};
    try {
      suggestions = JSON.parse(cleaned);
    } catch {
      suggestions = {};
    }

    // safety: ensure shapes
    if (!Array.isArray(suggestions.seasonalMonths)) suggestions.seasonalMonths = [];

    res.json({ suggestions });
  } catch (e) {
    console.error('POST /api/suggest error:', e);
    res.status(500).json({ error: e.message || 'server error' });
  }
});

// ---------- /api/plant (AI image + DB cache) ----------
// GET /api/plant?name=banana
app.get('/api/plant', async (req, res) => {
  try {
    const raw = (req.query.name || '').toString().trim();
    if (!raw) return res.status(400).json({ error: 'name query is required' });
    const name = raw.toLowerCase();

    const pool = await getPool();

    // 1) check cache in DB
    const [rows] = await pool.query('SELECT id, image_url FROM plants WHERE name=?', [name]);
    if (rows.length && rows[0].image_url) {
      return res.json({ name, imageUrl: rows[0].image_url, source: 'cache' });
    }

    // 2) generate via OpenAI and save
    let imageUrl;
    try {
      imageUrl = await generateImageAndSave(imagePromptForPlant(name));
    } catch (err) {
      console.error('image gen failed:', err.message || err);
      return res.status(500).json({ error: 'image generation failed' });
    }

    // 3) upsert in DB
    if (rows.length) {
      await pool.query('UPDATE plants SET image_url=? WHERE id=?', [imageUrl, rows[0].id]);
    } else {
      await pool.query('INSERT INTO plants (name, image_url) VALUES (?,?)', [name, imageUrl]);
    }

    res.json({ name, imageUrl, source: 'generated' });
  } catch (e) {
    console.error('GET /api/plant error:', e);
    res.status(500).json({ error: e.message || 'server error' });
  }
});

/**
 * ---------- CRUD (MySQL) ----------
 * GET    /api/plants           -> list all
 * GET    /api/plant/:id        -> get one
 * POST   /api/plants           -> create
 * PUT    /api/plant/:id        -> update
 * DELETE /api/plant/:id        -> delete
 */

// List all
app.get('/api/plants', async (_req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM plants ORDER BY id DESC');
    res.json({ plants: rows });
  } catch (e) {
    console.error('GET /api/plants error:', e);
    res.status(500).json({ error: 'server error' });
  }
});

// Get one
app.get('/api/plant/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query('SELECT * FROM plants WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (e) {
    console.error('GET /api/plant/:id error:', e);
    res.status(500).json({ error: 'server error' });
  }
});

// Create
app.post('/api/plants', async (req, res) => {
  try {
    const p = req.body || {};
    const pool = await getPool();

    const [result] = await pool.query(
      `INSERT INTO plants
       (user_email, name, scientific_name, plantType, sunlight, watering, soil, fertilizer, seasonality, seasonalMonths, uses_notes, image_url, qr_code)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        p.user_email || 'guest@example.com',
        p.name || null,
        p.scientific_name || null,
        p.plantType || null,
        p.sunlight || null,
        p.watering || null,
        p.soil || null,
        p.fertilizer || null,
        p.seasonality || null,
        p.seasonalMonths ? JSON.stringify(p.seasonalMonths) : null,
        p.uses_notes || null,
        p.image_url || p.image || null,
        p.qr_code || null,
      ]
    );

    res.json({ success: true, id: result.insertId });
  } catch (e) {
    console.error('POST /api/plants error:', e);
    res.status(500).json({ error: 'server error' });
  }
});

// Update
app.put('/api/plant/:id', async (req, res) => {
  try {
    const p = req.body || {};
    const pool = await getPool();

    await pool.query(
      `UPDATE plants SET
         user_email = COALESCE(?, user_email),
         name = COALESCE(?, name),
         scientific_name = COALESCE(?, scientific_name),
         plantType = COALESCE(?, plantType),
         sunlight = COALESCE(?, sunlight),
         watering = COALESCE(?, watering),
         soil = COALESCE(?, soil),
         fertilizer = COALESCE(?, fertilizer),
         seasonality = COALESCE(?, seasonality),
         seasonalMonths = COALESCE(?, seasonalMonths),
         uses_notes = COALESCE(?, uses_notes),
         image_url = COALESCE(?, image_url),
         qr_code = COALESCE(?, qr_code)
       WHERE id = ?`,
      [
        p.user_email ?? null,
        p.name ?? null,
        p.scientific_name ?? null,
        p.plantType ?? null,
        p.sunlight ?? null,
        p.watering ?? null,
        p.soil ?? null,
        p.fertilizer ?? null,
        p.seasonality ?? null,
        p.seasonalMonths ? JSON.stringify(p.seasonalMonths) : null,
        p.uses_notes ?? null,
        p.image_url ?? null,
        p.qr_code ?? null,
        req.params.id,
      ]
    );

    res.json({ success: true });
  } catch (e) {
    console.error('PUT /api/plant/:id error:', e);
    res.status(500).json({ error: 'server error' });
  }
});

// Delete
app.delete('/api/plant/:id', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.query('DELETE FROM plants WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/plant/:id error:', e);
    res.status(500).json({ error: 'server error' });
  }
});

// ---------- start ----------
getPool()
  .then(() =>
    app.listen(PORT, () => {
      console.log('DB cfg ->', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        db: process.env.DB_NAME,
      });
      console.log(`backend running at ${BASE_URL}`);
    })
  )
  .catch((err) => {
    console.error('DB init failed:', err);
    process.exit(1);
  });