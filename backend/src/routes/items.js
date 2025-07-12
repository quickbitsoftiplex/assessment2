const express = require('express');
const router = express.Router();
const repo = require('../data/items.repository');

router.get('/', async (req, res, next) => {
  try {
    const allItems = await repo.getAll();

    // Get query params with defaults
    const { q = '', limit } = req.query;

    // Normalise helper -> removes accents, lowercases, trims
    const normalize = str =>
      str
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .trim();

    const query = normalize(q);

    // Filter by search term if provided
    let results = query
      ? allItems.filter(item => normalize(item.name).includes(query))
      : allItems;

    // Apply limit if provided
    const parsedLimit = parseInt(limit);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      results = results.slice(0, parsedLimit);
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await repo.getAll();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    const item = req.body;
    const data = await repo.getAll();
    item.id = Date.now();
    data.push(item);
    await repo.saveAll(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;