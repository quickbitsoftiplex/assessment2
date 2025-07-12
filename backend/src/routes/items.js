const express = require('express');
const Joi = require('joi');
const router = express.Router();
const repo = require('../data/items.repository');

const itemSchema = Joi.object({
  name: Joi.string().min(2).required(),
  category: Joi.string().min(2).required(),
  price: Joi.number().positive().required()
});

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
    const { error, value } = itemSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: 'Invalid payload',
        details: error.details.map(d => d.message)
      });
    }

    const data = await repo.getAll();
    const newItem = { ...value, id: Date.now() };
    data.push(newItem);
    await repo.saveAll(data);

    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;