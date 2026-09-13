const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// GET /api/pizza-builder/ingredients (all)
router.get('/ingredients', async (req, res, next) => {
  try {
    const items = await Inventory.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      bases: items.filter(i => i.category === 'base'),
      sauces: items.filter(i => i.category === 'sauce'),
      cheeses: items.filter(i => i.category === 'cheese'),
      vegetables: items.filter(i => i.category === 'vegetable')
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/pizza-builder/bases
router.get('/bases', async (req, res, next) => {
  try {
    const bases = await Inventory.find({ category: 'base' });
    res.status(200).json({ success: true, count: bases.length, bases });
  } catch (err) {
    next(err);
  }
});

// GET /api/pizza-builder/sauces
router.get('/sauces', async (req, res, next) => {
  try {
    const sauces = await Inventory.find({ category: 'sauce' });
    res.status(200).json({ success: true, count: sauces.length, sauces });
  } catch (err) {
    next(err);
  }
});

// GET /api/pizza-builder/cheeses
router.get('/cheeses', async (req, res, next) => {
  try {
    const cheeses = await Inventory.find({ category: 'cheese' });
    res.status(200).json({ success: true, count: cheeses.length, cheeses });
  } catch (err) {
    next(err);
  }
});

// GET /api/pizza-builder/vegetables
router.get('/vegetables', async (req, res, next) => {
  try {
    const vegetables = await Inventory.find({ category: 'vegetable' });
    res.status(200).json({ success: true, count: vegetables.length, vegetables });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
