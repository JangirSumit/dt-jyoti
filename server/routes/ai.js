const { Router } = require('express');
const { getDb } = require('../db');

const OpenAI = require('openai');

const router = Router();

const MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    })
  : null;

const SECTION_LABELS = {
  morning: 'Morning',
  midMorning: 'Mid-morning',
  lunch: 'Lunch',
  teaTime: 'Tea time',
  evening: 'Evening',
  dinner: 'Dinner',
  bedTime: 'Bed time'
};
const SECTION_ORDER = Object.keys(SECTION_LABELS);

const CACHE_TTL_MS = 60 * 60 * 1000; // 1h
const cache = new Map(); // key -> { text, t }

// Simple sleep
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Basic rule-based fallback respecting diet pref and common allergies
function ruleBasedSuggestion(section, ctx) {
  const { dietPref = '', conditions = [], allergies = [] } = ctx || {};
  const has = (arr, v) => arr.some((x) => (x || '').toLowerCase() === v.toLowerCase());
  const avoid = (s) => {
    const a = allergies.map((x) => (x || '').toLowerCase());
    const banned = [
      ...(a.includes('milk') ? ['milk', 'curd', 'yogurt', 'buttermilk', 'paneer', 'cheese'] : []),
      ...(a.includes('gluten') ? ['wheat', 'chapati', 'bread'] : []),
      ...(a.includes('egg') ? ['egg'] : []),
      ...(a.includes('peanut') || a.includes('tree nuts') ? ['peanut', 'almond', 'nuts'] : []),
      ...(a.includes('soy') ? ['soy', 'tofu'] : [])
    ];
    return s.filter((it) => !banned.some((b) => it.toLowerCase().includes(b)));
  };
  const lowGiCue = conditions.some((c) => /diabetes/i.test(c)) || conditions.some((c) => /pcos/i.test(c));
  const lowSaltCue = conditions.some((c) => /hypertension/i.test(c));
  const lowFatCue = conditions.some((c) => /cholesterol|obesity/i.test(c));

  const veg = /veg|jain|vegetarian/i.test(dietPref) && !/non-veg/i.test(dietPref);

  let items = [];
  switch (section) {
    case 'morning':
      items = [
        'warm water with lemon',
        ...(!has(allergies, 'Tree nuts') && !has(allergies, 'Peanut') ? ['5–6 soaked almonds'] : []),
        lowGiCue ? 'vegetable oats/poha, no sugar' : 'vegetable oats/poha',
        'green tea/black coffee, no sugar'
      ];
      break;
    case 'midMorning':
      items = [
        'low‑GI fruit bowl (apple/guava/pear)',
        has(allergies, 'Milk') ? 'herbal/green tea' : 'buttermilk or green tea'
      ];
      break;
    case 'lunch':
      items = [
        has(allergies, 'Gluten') ? '1 cup steamed rice or millet' : '1–2 chapati (multi‑grain)',
        veg || has(allergies, 'Egg') ? 'dal/beans for protein' : 'dal + grilled egg/chicken',
        has(allergies, 'Milk') ? 'salad + lemon' : 'salad + curd',
        lowSaltCue ? 'use less salt; avoid pickles' : null
      ].filter(Boolean);
      break;
    case 'teaTime':
      items = [
        'roasted chana/makhana',
        'herbal/green tea, no sugar',
        lowFatCue ? 'avoid fried snacks' : null
      ].filter(Boolean);
      break;
    case 'evening':
      items = [
        'sprouts or chana salad with veggies',
        'lemon water'
      ];
      break;
    case 'dinner':
      items = [
        has(allergies, 'Gluten') ? 'millet roti or rice' : '1 chapati',
        'sabzi (non‑starchy)',
        veg ? (has(allergies, 'Soy') ? 'paneer/curd for protein' : 'paneer/tofu for protein')
            : 'egg/chicken/fish (grilled)',
        lowGiCue ? 'keep portions small; avoid desserts' : null
      ].filter(Boolean);
      break;
    case 'bedTime':
      items = [
        has(allergies, 'Milk') ? 'chamomile/herbal tea' : 'warm turmeric milk (unsweetened)'
      ];
      break;
    default:
      items = ['water', 'light snack'];
  }

  items = avoid(items);
  return items.join(', ');
}

router.post('/diet-suggest', async (req, res) => {
  try {
    const section = String(req.body?.section || '').trim();
    const patientKey = String(req.body?.patientKey || '').trim();
    const save = Boolean(req.body?.save); // NEW
    if (!SECTION_ORDER.includes(section)) return res.status(400).json({ error: 'invalid section' });
    if (!patientKey) return res.status(400).json({ error: 'patientKey required' });

    // Cache hit?
    const key = `${patientKey}:${section}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.t < CACHE_TTL_MS) return res.json({ text: hit.text });

    const db = await getDb();
    const p = await db.get(
      `SELECT id, name, contact, email, age, sex, height_cm, weight_kg, activity, diet_pref,
              conditions, allergies, goal_tags, goal_notes
         FROM patients WHERE id = ?`,
      patientKey
    );

    const height = p?.height_cm ?? null;
    const weight = p?.weight_kg ?? null;
    let bmi = null;
    if (height && weight) {
      const h = Number(height) / 100;
      if (h > 0) bmi = +(Number(weight) / (h * h)).toFixed(1);
    }

    const ctx = {
      age: p?.age ?? null,
      sex: p?.sex || '',
      height_cm: height,
      weight_kg: weight,
      bmi,
      activity: p?.activity || '',
      dietPref: p?.diet_pref || '',
      conditions: p?.conditions ? JSON.parse(p.conditions) : [],
      allergies: p?.allergies ? JSON.parse(p.allergies) : [],
      goalTags: p?.goal_tags ? JSON.parse(p.goal_tags) : [],
      goalNotes: p?.goal_notes || ''
    };

    // Try LLM (with tiny retry on 429), else fallback
    let text = '';
    if (client) {
      const system = [
        'You are a clinical dietitian.',
        'Write a short, safe, and practical food recommendation for ONE diet chart section.',
        'Return only plain text without headings or bullets.',
        'Keep it 1–3 lines, separated by commas or semicolons.',
        'Respect patient diet preference and allergies strictly.',
        'Consider diagnosis/conditions and goals.'
      ].join(' ');

      const label = SECTION_LABELS[section];
      const user = `Patient profile:
- Age/Sex: ${ctx.age ?? 'NA'} ${ctx.sex}
- BMI: ${ctx.bmi ?? 'NA'} (Ht ${ctx.height_cm ?? 'NA'} cm, Wt ${ctx.weight_kg ?? 'NA'} kg)
- Activity: ${ctx.activity || 'NA'}
- Diet: ${ctx.dietPref || 'NA'}
- Conditions: ${(ctx.conditions || []).join(', ') || 'None'}
- Allergies: ${(ctx.allergies || []).join(', ') || 'None'}
- Goals: ${[...(ctx.goalTags || []), ctx.goalNotes].filter(Boolean).join(', ') || 'NA'}
Write a concise suggestion for the "${label}" section.`;

      let attempt = 0;
      let lastErr = null;
      while (attempt < 3) {
        try {
          const resp = await client.chat.completions.create({
            model: MODEL,
            temperature: 0.7,
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user }
            ]
          });
          text = resp?.choices?.[0]?.message?.content?.trim() || '';
          if (text) break;
        } catch (e) {
          lastErr = e;
          // 429 backoff
          if (e?.status === 429) {
            const ra = Number(e?.headers?.get?.('retry-after') || 0);
            await sleep((ra ? ra * 1000 : 1000) * (attempt + 1));
            attempt++;
            continue;
          }
          break;
        }
        attempt++;
      }
      if (!text && lastErr) console.error('diet-suggest LLM error', lastErr);
    }

    if (!text) {
      text = ruleBasedSuggestion(section, {
        dietPref: ctx.dietPref,
        conditions: ctx.conditions || [],
        allergies: ctx.allergies || []
      });
    }

    // Cache and (optionally) save
    cache.set(key, { text, t: Date.now() });

    if (save) {
      const db = await getDb();
      // ensure patient exists
      const patient = await db.get(`SELECT id FROM patients WHERE id = ?`, patientKey);
      if (!patient) return res.status(404).json({ error: 'patient not found' });

      const now = new Date().toISOString();
      const r = await db.run(
        `INSERT INTO prescriptions (patient_id, content, created_at, updated_at)
         VALUES (?, ?, ?, ?)`,
        patient.id, text, now, now
      );
      return res.json({ text, saved: { id: r.lastID, created_at: now } });
    }

    return res.json({ text });
  } catch (e) {
    console.error('diet-suggest error', e);
    return res.json({ text: 'Water; light, low‑oil, low‑sugar choices; avoid processed foods.' });
  }
});

module.exports = router;