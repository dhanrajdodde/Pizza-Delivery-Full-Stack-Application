const Pizza = require('../models/Pizza');
const Inventory = require('../models/Inventory');

// @desc    Get all pizzas with search and filter
// @route   GET /api/pizzas
// @access  Public
exports.getPizzas = async (req, res, next) => {
  try {
    const { category, search, sortBy } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ingredients: { $regex: search, $options: 'i' } }
      ];
    }

    let queryPromise = Pizza.find(query);

    if (sortBy === 'price-asc') {
      queryPromise = queryPromise.sort({ price: 1 });
    } else if (sortBy === 'price-desc') {
      queryPromise = queryPromise.sort({ price: -1 });
    } else if (sortBy === 'rating') {
      queryPromise = queryPromise.sort({ rating: -1 });
    } else {
      queryPromise = queryPromise.sort({ isChefSpecial: -1, createdAt: -1 });
    }

    const pizzas = await queryPromise;

    res.status(200).json({
      success: true,
      count: pizzas.length,
      pizzas
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single pizza
// @route   GET /api/pizzas/:id
// @access  Public
exports.getPizzaById = async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) {
      return res.status(404).json({ success: false, message: 'Pizza not found' });
    }
    res.status(200).json({ success: true, pizza });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Pizza Builder Options with real inventory stock status
// @route   GET /api/pizza-builder/ingredients
// @access  Public
exports.getBuilderIngredients = async (req, res, next) => {
  try {
    const items = await Inventory.find().sort({ category: 1, name: 1 });

    const bases = items.filter(i => i.category === 'base');
    const sauces = items.filter(i => i.category === 'sauce');
    const cheeses = items.filter(i => i.category === 'cheese');
    const vegetables = items.filter(i => i.category === 'vegetable');

    res.status(200).json({
      success: true,
      ingredients: {
        bases,
        sauces,
        cheeses,
        vegetables
      }
    });
  } catch (err) {
    next(err);
  }
};
