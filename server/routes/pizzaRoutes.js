const express = require('express');
const router = express.Router();
const {
  getPizzas,
  getPizzaById,
  getBuilderIngredients
} = require('../controllers/pizzaController');

// Menu pizzas
router.get('/', getPizzas);
router.get('/:id', getPizzaById);

module.exports = router;
