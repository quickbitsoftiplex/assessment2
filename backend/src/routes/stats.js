const express = require('express');
const fs = require('fs');
const { readFile, stat } = require('fs/promises');
const path = require('path');
const router = express.Router();
const { mean } = require('../utils/stats')
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let cachedStats = null; // { total, avg price }
let cachedMtimeMs = 0; // Last modified time in milliseconds

async function getStats() {
  const { mtimeMs } = await stat(DATA_PATH);

  // quick server cache, check if file hast not changed since last computation
  if (cachedStats && mtimeMs === cachedMtimeMs) {
    return cachedStats;
  }

  const raw = await readFile(DATA_PATH, 'utf8');
  const items = JSON.parse(raw);

  const total = items.length;
  const averagePrice = total === 0
    ? 0
    : items.reduce((s, x) => s + x.price, 0) / total;

  cachedStats = { total, averagePrice };
  cachedMtimeMs = mtimeMs;
  return cachedStats;
}
// detects if the file changes on this and trigger a callback clearing the in-memory cache ( found this suggestion on stackoverflow, seemed really nice to add :D )
fs.watchFile(DATA_PATH, () => { cachedStats = null; });

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});


module.exports = router;