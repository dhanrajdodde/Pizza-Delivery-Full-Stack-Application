import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BuilderPizzaCanvas } from '../components/3d/BuilderPizzaCanvas';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  ShoppingBag,
  Flame,
  Info,
  Layers,
  AlertTriangle
} from 'lucide-react';

// Steps definition
const STEPS = [
  { id: 1, name: 'Crust Base', subtitle: 'Select from 5 artisan dough styles' },
  { id: 2, name: 'Gourmet Sauce', subtitle: 'Pick your rich simmered sauce layer' },
  { id: 3, name: 'Artisan Cheese', subtitle: 'Choose your melted dairy blend' },
  { id: 4, name: 'Fresh Vegetables', subtitle: 'Layer multiple farm-fresh toppings' },
];

const BASE_PRICE = 299;

export const PizzaBuilder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Selection states (can be pre-populated from preset passed in route state)
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBase, setSelectedBase] = useState(location.state?.presetBase || 'Classic Hand Tossed');
  const [selectedSauce, setSelectedSauce] = useState(location.state?.presetSauce || 'Classic Tomato');
  const [selectedCheese, setSelectedCheese] = useState(location.state?.presetCheese || 'Fior di Latte Mozzarella');
  const [selectedVegetables, setSelectedVegetables] = useState(location.state?.presetVegetables || ['Button Mushroom', 'Kalamata Black Olives']);

  // Inventory options from API
  const [inventoryData, setInventoryData] = useState({
    bases: [],
    sauces: [],
    cheeses: [],
    vegetables: [],
  });
  const [loading, setLoading] = useState(true);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const res = await api.get('/pizza-builder/ingredients');
        if (res.data.success) {
          setInventoryData({
            bases: res.data.bases || [],
            sauces: res.data.sauces || [],
            cheeses: res.data.cheeses || [],
            vegetables: res.data.vegetables || [],
          });
        }
      } catch (err) {
        console.error('Failed to load builder ingredients:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchIngredients();
  }, []);

  // Calculate live dynamic price
  const calculatePrice = () => {
    let total = BASE_PRICE;

    // Base extra cost
    const baseItem = inventoryData.bases.find((b) => b.name === selectedBase);
    if (baseItem) total += Number(baseItem.price || 0);

    // Sauce extra cost
    const sauceItem = inventoryData.sauces.find((s) => s.name === selectedSauce);
    if (sauceItem) total += Number(sauceItem.price || 0);

    // Cheese extra cost
    const cheeseItem = inventoryData.cheeses.find((c) => c.name === selectedCheese);
    if (cheeseItem) total += Number(cheeseItem.price || 0);

    // Vegetables extra cost
    selectedVegetables.forEach((vegName) => {
      const vegItem = inventoryData.vegetables.find((v) => v.name === vegName);
      if (vegItem) total += Number(vegItem.price || 25);
    });

    return total;
  };

  const totalPrice = calculatePrice();

  // Toggle vegetable selection
  const toggleVegetable = (vegName, isOutOfStock) => {
    if (isOutOfStock) return;
    setSelectedVegetables((prev) =>
      prev.includes(vegName) ? prev.filter((v) => v !== vegName) : [...prev, vegName]
    );
  };

  const handleAddCustomPizzaToCart = () => {
    addToCart({
      name: 'Custom 3D Masterpiece',
      isCustom: true,
      configuration: {
        base: selectedBase,
        sauce: selectedSauce,
        cheese: selectedCheese,
        vegetables: selectedVegetables,
      },
      unitPrice: totalPrice,
      quantity: 1,
    });

    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Title Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-pizza-orange uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Interactive 3D Pizza Studio
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white mt-1">
            Build Your Custom Pizza
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Watch every ingredient update live on the 3D rotating canvas below.
          </p>
        </div>

        {/* Live Price Tag */}
        <div className="glass-panel px-6 py-3 rounded-2xl border border-pizza-orange/30 flex items-center gap-4 shadow-glow-orange">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Live Calculated Price</span>
            <span className="text-2xl font-bold text-pizza-orange font-mono">₹{totalPrice}</span>
          </div>
          <button
            onClick={handleAddCustomPizzaToCart}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white neon-glow-btn flex items-center gap-2 shadow-lg"
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4 text-white" />
                Added!
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left 3D Canvas, Right Stepper Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: 3D Visualizer Canvas (Sticky on desktop) */}
        <div className="lg:col-span-6 sticky lg:top-24 space-y-4">
          <BuilderPizzaCanvas
            base={selectedBase}
            sauce={selectedSauce}
            cheese={selectedCheese}
            vegetables={selectedVegetables}
          />

          {/* Configuration Summary Pill Box */}
          <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400 border-b border-white/10 pb-2">
              <span className="font-semibold text-white">Active 3D Configuration</span>
              <span className="text-[11px] text-pizza-orange font-mono">Base ₹{BASE_PRICE} + Addons ₹{totalPrice - BASE_PRICE}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div><span className="text-slate-500">Crust:</span> <span className="text-slate-200 font-medium">{selectedBase}</span></div>
              <div><span className="text-slate-500">Sauce:</span> <span className="text-slate-200 font-medium">{selectedSauce}</span></div>
              <div><span className="text-slate-500">Cheese:</span> <span className="text-slate-200 font-medium">{selectedCheese}</span></div>
              <div className="col-span-2">
                <span className="text-slate-500">Vegetables:</span>{' '}
                <span className="text-slate-200 font-medium">
                  {selectedVegetables.length > 0 ? selectedVegetables.join(', ') : 'None selected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Stepper Selection Panel */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Stepper Tabs Bar */}
          <div className="grid grid-cols-4 gap-2 bg-charcoal-900/80 p-1.5 rounded-2xl border border-white/10">
            {STEPS.map((step) => {
              const isActive = currentStep === step.id;
              const isPassed = currentStep > step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`py-2 px-2 rounded-xl text-center transition-all ${
                    isActive
                      ? 'bg-pizza-orange text-white shadow-glow-orange font-bold'
                      : isPassed
                      ? 'bg-white/5 text-slate-300 hover:text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider opacity-70">Step 0{step.id}</div>
                  <div className="text-xs truncate font-medium">{step.name}</div>
                </button>
              );
            })}
          </div>

          {/* Stepper Content Body */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6 min-h-[420px] flex flex-col justify-between">
            <div>
              <div className="mb-5">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Step {currentStep}: {STEPS[currentStep - 1].name}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {STEPS[currentStep - 1].subtitle}
                </p>
              </div>

              {/* STEP 1: PIZZA BASE (EXACTLY 5) */}
              {currentStep === 1 && (
                <div className="space-y-3">
                  {inventoryData.bases.map((base) => {
                    const isSelected = selectedBase === base.name;
                    const isOutOfStock = base.quantity <= 0;

                    return (
                      <div
                        key={base._id || base.name}
                        onClick={() => !isOutOfStock && setSelectedBase(base.name)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-pizza-orange/15 border-pizza-orange shadow-glow-orange'
                            : 'bg-charcoal-800/60 border-white/5 hover:border-white/20'
                        } ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: isSelected ? '#ff6b00' : '#4b5563' }}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-pizza-orange" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-white">{base.name}</h4>
                              {isOutOfStock && (
                                <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                                  Out of stock
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{base.description}</p>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-pizza-orange whitespace-nowrap ml-4">
                          {base.price > 0 ? `+₹${base.price}` : 'Free'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* STEP 2: SAUCE (EXACTLY 5) */}
              {currentStep === 2 && (
                <div className="space-y-3">
                  {inventoryData.sauces.map((sauce) => {
                    const isSelected = selectedSauce === sauce.name;
                    const isOutOfStock = sauce.quantity <= 0;

                    return (
                      <div
                        key={sauce._id || sauce.name}
                        onClick={() => !isOutOfStock && setSelectedSauce(sauce.name)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-pizza-orange/15 border-pizza-orange shadow-glow-orange'
                            : 'bg-charcoal-800/60 border-white/5 hover:border-white/20'
                        } ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: isSelected ? '#ff6b00' : '#4b5563' }}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-pizza-orange" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-white">{sauce.name}</h4>
                              {isOutOfStock && (
                                <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                                  Out of stock
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{sauce.description}</p>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-pizza-orange whitespace-nowrap ml-4">
                          {sauce.price > 0 ? `+₹${sauce.price}` : 'Free'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* STEP 3: CHEESE (4 CHOICES) */}
              {currentStep === 3 && (
                <div className="space-y-3">
                  {inventoryData.cheeses.map((ch) => {
                    const isSelected = selectedCheese === ch.name;
                    const isOutOfStock = ch.quantity <= 0;

                    return (
                      <div
                        key={ch._id || ch.name}
                        onClick={() => !isOutOfStock && setSelectedCheese(ch.name)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-pizza-orange/15 border-pizza-orange shadow-glow-orange'
                            : 'bg-charcoal-800/60 border-white/5 hover:border-white/20'
                        } ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: isSelected ? '#ff6b00' : '#4b5563' }}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-pizza-orange" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-white">{ch.name}</h4>
                              {isOutOfStock && (
                                <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                                  Out of stock
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{ch.description}</p>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-pizza-orange whitespace-nowrap ml-4">
                          {ch.price > 0 ? `+₹${ch.price}` : 'Free'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* STEP 4: VEGETABLES (9 OPTIONS - MULTI-SELECT) */}
              {currentStep === 4 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inventoryData.vegetables.map((veg) => {
                    const isSelected = selectedVegetables.includes(veg.name);
                    const isOutOfStock = veg.quantity <= 0;

                    return (
                      <div
                        key={veg._id || veg.name}
                        onClick={() => toggleVegetable(veg.name, isOutOfStock)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-pizza-orange/15 border-pizza-orange shadow-glow-orange'
                            : 'bg-charcoal-800/60 border-white/5 hover:border-white/20'
                        } ${isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isSelected
                                ? 'bg-pizza-orange border-pizza-orange text-white'
                                : 'border-slate-600'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <h5 className="text-xs font-semibold text-white">{veg.name}</h5>
                            {isOutOfStock ? (
                              <span className="text-[9px] text-red-400">Out of stock</span>
                            ) : (
                              <span className="text-[10px] text-slate-400">{veg.unit}</span>
                            )}
                          </div>
                        </div>

                        <span className="text-xs font-bold text-pizza-orange">
                          +₹{veg.price || 25}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Stepper Navigation Buttons */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  currentStep === 1
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-300 hover:text-white bg-charcoal-800'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Step
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
                  className="px-6 py-2 rounded-xl text-xs font-semibold text-white neon-glow-btn flex items-center gap-1.5"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleAddCustomPizzaToCart}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white neon-glow-btn flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart (₹{totalPrice})
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
