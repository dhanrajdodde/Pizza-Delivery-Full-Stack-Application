import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import {
  Search,
  Filter,
  Star,
  Plus,
  SlidersHorizontal,
  Flame,
  Leaf,
  Sparkles,
  Check
} from 'lucide-react';

const CATEGORIES = ['All', 'Classic', 'Premium', 'Veggie', 'Spicy', 'Cheese Lovers'];

export const Menu = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [addedItem, setAddedItem] = useState(null);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPizzas = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== 'All') params.append('category', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);
        if (sortBy) params.append('sortBy', sortBy);

        const res = await api.get(`/pizzas?${params.toString()}`);
        if (res.data.success) {
          setPizzas(res.data.pizzas);
        }
      } catch (err) {
        console.error('Failed to load menu pizzas:', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchPizzas();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [selectedCategory, searchQuery, sortBy]);

  const handleAddToCart = (pizza) => {
    addToCart({
      pizzaId: pizza._id,
      name: pizza.name,
      isCustom: false,
      configuration: pizza.defaultConfig,
      unitPrice: pizza.price,
      quantity: 1,
    });
    setAddedItem(pizza._id);
    setTimeout(() => setAddedItem(null), 1500);
  };

  const handleCustomizeIn3D = (pizza) => {
    navigate('/build-pizza', {
      state: {
        presetBase: pizza.defaultConfig?.base,
        presetSauce: pizza.defaultConfig?.sauce,
        presetCheese: pizza.defaultConfig?.cheese,
        presetVegetables: pizza.defaultConfig?.vegetables,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-pizza-orange uppercase tracking-widest">
          Artisan Bakery & Kitchen
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
          Our Handcrafted Pizza Menu
        </h1>
        <p className="text-sm text-slate-400 font-light">
          Each pie is prepared with slow-fermented dough, San Marzano sauce, and artisan cheeses baked at 450°C.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/5">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-pizza-orange text-white shadow-glow-orange'
                  : 'bg-charcoal-800 text-slate-400 hover:text-white hover:bg-charcoal-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pizzas or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-charcoal-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pizza-orange transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-charcoal-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-pizza-orange cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="rating">Top Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

      </div>

      {/* Pizza Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-panel h-96 rounded-2xl animate-pulse p-4 space-y-4">
              <div className="h-48 bg-charcoal-800 rounded-xl" />
              <div className="h-4 bg-charcoal-800 rounded w-3/4" />
              <div className="h-3 bg-charcoal-800 rounded w-1/2" />
              <div className="h-10 bg-charcoal-800 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : pizzas.length === 0 ? (
        <div className="text-center py-16 space-y-4 glass-panel rounded-2xl max-w-lg mx-auto p-8">
          <span className="text-4xl">🔍</span>
          <h3 className="text-lg font-bold text-white">No pizzas match your query</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search query or category filter, or build a custom creation in 3D!
          </p>
          <button
            onClick={() => navigate('/build-pizza')}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white neon-glow-btn inline-flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Build Custom Pizza
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {pizzas.map((pizza) => (
            <motion.div
              key={pizza._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col border border-white/5 group"
            >
              {/* Image Container */}
              <div className="h-52 relative overflow-hidden">
                <img
                  src={pizza.image}
                  alt={pizza.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-transparent to-transparent opacity-80" />

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-charcoal-900/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1 text-[11px] font-bold text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {pizza.rating}
                </div>

                {/* Category Tag */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="bg-charcoal-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[10px] font-semibold text-slate-300 border border-white/10">
                    {pizza.category}
                  </span>
                  {pizza.isSpicy && (
                    <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Spicy
                    </span>
                  )}
                  {pizza.isVegetarian && (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                      <Leaf className="w-3 h-3" /> Veg
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-pizza-orange transition-colors">
                    {pizza.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {pizza.description}
                  </p>

                  {/* Ingredients Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {pizza.ingredients?.map((ing, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-charcoal-800 text-[10px] text-slate-300 rounded border border-white/5"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Price</span>
                    <span className="text-lg font-bold text-pizza-orange">₹{pizza.price}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCustomizeIn3D(pizza)}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-charcoal-800 hover:bg-charcoal-700 hover:text-white border border-white/10 transition-colors flex items-center gap-1"
                      title="Open in 3D Pizza Studio"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-pizza-orange" />
                      3D Mod
                    </button>

                    <button
                      onClick={() => handleAddToCart(pizza)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-1.5 ${
                        addedItem === pizza._id
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'neon-glow-btn'
                      }`}
                    >
                      {addedItem === pizza._id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Added!
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
};
