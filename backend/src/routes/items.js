const express = require('express');
const router = express.Router();
const repo = require('../data/items.repository');
// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await repo.getAll();
    const { limit, q } = req.query;
    let results = data;

    if (q) {
      // Simple substring search (sub‑optimal)
      results = results.filter(item => item.name.toLowerCase().includes(q.toLowerCase()));
    }

    if (limit) {
      results = results.slice(0, parseInt(limit));
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