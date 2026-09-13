require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Pizza = require('../models/Pizza');
const Order = require('../models/Order');

const seedInventory = [
  // 5 PIZZA BASES (EXACTLY 5)
  { name: 'Classic Hand Tossed', category: 'base', quantity: 60, threshold: 15, unit: 'crusts', price: 0, description: 'Traditional golden-baked artisan crust with crisp edges and airy center.', color: '#d4883b' },
  { name: 'Thin Crust', category: 'base', quantity: 45, threshold: 12, unit: 'crusts', price: 30, description: 'Ultra-crispy Roman style cracker-thin crust baked to perfection.', color: '#c97f32' },
  { name: 'Cheese Burst', category: 'base', quantity: 35, threshold: 10, unit: 'crusts', price: 79, description: 'Decadent double-layer crust overflowing with molten artisan cheese inside.', color: '#f59e0b' },
  { name: 'Whole Wheat', category: 'base', quantity: 28, threshold: 8, unit: 'crusts', price: 40, description: '100% stone-ground whole wheat dough rich in fiber and earthy flavor.', color: '#a76a2e' },
  { name: 'Italian Herb', category: 'base', quantity: 30, threshold: 10, unit: 'crusts', price: 50, description: 'Infused with oregano, basil, thyme, and roasted garlic in the dough.', color: '#8a9a5b' },

  // 5 SAUCES (EXACTLY 5)
  { name: 'Classic Tomato', category: 'sauce', quantity: 120, threshold: 25, unit: 'ladles', price: 0, description: 'Sun-ripened San Marzano tomatoes simmered with extra virgin olive oil.', color: '#e63946' },
  { name: 'Spicy Arrabbiata', category: 'sauce', quantity: 80, threshold: 20, unit: 'ladles', price: 20, description: 'Fiery crushed red chili, garlic, and slow-roasted tomato reduction.', color: '#c1121f' },
  { name: 'Smoky BBQ', category: 'sauce', quantity: 65, threshold: 15, unit: 'ladles', price: 30, description: 'Rich hickory-smoked barbecue sauce with sweet molasses and tangy notes.', color: '#78290f' },
  { name: 'Garlic Cream', category: 'sauce', quantity: 50, threshold: 15, unit: 'ladles', price: 40, description: 'Velvety Alfredo sauce made with roasted garlic cloves, cream, and black pepper.', color: '#fdfbf7' },
  { name: 'Artisan Pesto', category: 'sauce', quantity: 40, threshold: 12, unit: 'ladles', price: 50, description: 'Genovese basil, roasted pine nuts, cold-pressed olive oil, and aged parmesan.', color: '#2d6a4f' },

  // CHEESE (4 CHOICES)
  { name: 'Fior di Latte Mozzarella', category: 'cheese', quantity: 90, threshold: 20, unit: 'portions', price: 0, description: 'Fresh creamy whole-milk mozzarella that melts into rich golden pools.', color: '#fffdf0' },
  { name: 'Sharp Cheddar', category: 'cheese', quantity: 70, threshold: 15, unit: 'portions', price: 35, description: 'Aged Wisconsin sharp cheddar offering deep savory sharpness.', color: '#fbbf24' },
  { name: 'Parmigiano Reggiano', category: 'cheese', quantity: 50, threshold: 12, unit: 'portions', price: 55, description: 'Authentic 24-month aged Italian parmesan with granular umami crystals.', color: '#fef08a' },
  { name: 'Four Cheese Volcano', category: 'cheese', quantity: 45, threshold: 12, unit: 'portions', price: 75, description: 'A luxurious quartet of Mozzarella, Gorgonzola, Fontina, and Smoked Gouda.', color: '#f59e0b' },

  // VEGETABLES (9 CHOICES)
  { name: 'Red Onion', category: 'vegetable', quantity: 110, threshold: 25, unit: 'portions', price: 25, description: 'Crisp caramelized sweet red onion slivers.', color: '#9d4edd' },
  { name: 'San Marzano Tomato', category: 'vegetable', quantity: 95, threshold: 20, unit: 'portions', price: 25, description: 'Juicy sliced heirloom tomatoes seasoned with sea salt.', color: '#e63946' },
  { name: 'Green Capsicum', category: 'vegetable', quantity: 85, threshold: 20, unit: 'portions', price: 25, description: 'Crunchy bell pepper diced fresh daily.', color: '#38b000' },
  { name: 'Button Mushroom', category: 'vegetable', quantity: 75, threshold: 18, unit: 'portions', price: 35, description: 'Earthy white button and cremini mushrooms sautéed in olive oil.', color: '#d3c5b4' },
  { name: 'Fire Jalapeño', category: 'vegetable', quantity: 65, threshold: 15, unit: 'portions', price: 30, description: 'Pickled Mexican jalapeño rings packing lively zest and heat.', color: '#55a630' },
  { name: 'Golden Sweet Corn', category: 'vegetable', quantity: 80, threshold: 20, unit: 'portions', price: 25, description: 'Plump golden sweet corn kernels bursting with sweet crunch.', color: '#ffea00' },
  { name: 'Kalamata Black Olives', category: 'vegetable', quantity: 70, threshold: 15, unit: 'portions', price: 35, description: 'Rich Mediterranean pitted black olives sliced thin.', color: '#2b2d42' },
  { name: 'Baby Spinach', category: 'vegetable', quantity: 55, threshold: 15, unit: 'portions', price: 30, description: 'Tender organic baby spinach wilted lightly over bubbly cheese.', color: '#2d6a4f' },
  { name: 'Tricolor Bell Pepper', category: 'vegetable', quantity: 60, threshold: 15, unit: 'portions', price: 35, description: 'Vibrant medley of yellow, red, and orange crisp sweet peppers.', color: '#ff9e00' }
];

const seedPizzas = [
  {
    name: 'Margherita Royale',
    description: 'The timeless classic. San Marzano tomato sauce, hand-torn Fior di Latte mozzarella, fresh basil, and cold-pressed extra virgin olive oil drizzle.',
    category: 'Classic',
    price: 349,
    rating: 4.9,
    isVegetarian: true,
    isSpicy: false,
    isChefSpecial: true,
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80',
    ingredients: ['Classic Hand Tossed', 'Classic Tomato', 'Fior di Latte Mozzarella', 'San Marzano Tomato', 'Fresh Basil'],
    defaultConfig: {
      base: 'Classic Hand Tossed',
      sauce: 'Classic Tomato',
      cheese: 'Fior di Latte Mozzarella',
      vegetables: ['San Marzano Tomato']
    }
  },
  {
    name: 'Truffle Wild Mushroom',
    description: 'Sautéed button & cremini mushrooms over velvet roasted garlic cream, smothered in mozzarella, thyme, and white truffle oil essence.',
    category: 'Premium',
    price: 529,
    rating: 4.95,
    isVegetarian: true,
    isSpicy: false,
    isChefSpecial: true,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    ingredients: ['Italian Herb', 'Garlic Cream', 'Parmigiano Reggiano', 'Button Mushroom', 'Baby Spinach'],
    defaultConfig: {
      base: 'Italian Herb',
      sauce: 'Garlic Cream',
      cheese: 'Parmigiano Reggiano',
      vegetables: ['Button Mushroom', 'Baby Spinach']
    }
  },
  {
    name: 'Fiery Arrabbiata Diablo',
    description: 'For thrill seekers: Slow-simmered spicy arrabbiata sauce, sharp Wisconsin cheddar, fire jalapeños, red onions, and hot chili flakes.',
    category: 'Spicy',
    price: 449,
    rating: 4.8,
    isVegetarian: true,
    isSpicy: true,
    isChefSpecial: false,
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&auto=format&fit=crop&q=80',
    ingredients: ['Thin Crust', 'Spicy Arrabbiata', 'Sharp Cheddar', 'Fire Jalapeño', 'Red Onion', 'Green Capsicum'],
    defaultConfig: {
      base: 'Thin Crust',
      sauce: 'Spicy Arrabbiata',
      cheese: 'Sharp Cheddar',
      vegetables: ['Fire Jalapeño', 'Red Onion', 'Green Capsicum']
    }
  },
  {
    name: 'Four Cheese Magma Volcano',
    description: 'An eruption of pure dairy bliss: Cheese burst crust stuffed with molten cheese, topped with Mozzarella, Cheddar, and Parmigiano Reggiano.',
    category: 'Cheese Lovers',
    price: 499,
    rating: 4.9,
    isVegetarian: true,
    isSpicy: false,
    isChefSpecial: true,
    image: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=800&auto=format&fit=crop&q=80',
    ingredients: ['Cheese Burst', 'Classic Tomato', 'Four Cheese Volcano', 'San Marzano Tomato'],
    defaultConfig: {
      base: 'Cheese Burst',
      sauce: 'Classic Tomato',
      cheese: 'Four Cheese Volcano',
      vegetables: ['San Marzano Tomato']
    }
  },
  {
    name: 'Verdant Garden Harvest',
    description: 'Whole wheat artisan base loaded with baby spinach, sweet corn, tricolor bell peppers, kalamata olives, red onion, and fresh herb pesto.',
    category: 'Veggie',
    price: 429,
    rating: 4.75,
    isVegetarian: true,
    isSpicy: false,
    isChefSpecial: false,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80',
    ingredients: ['Whole Wheat', 'Artisan Pesto', 'Fior di Latte Mozzarella', 'Baby Spinach', 'Golden Sweet Corn', 'Kalamata Black Olives', 'Tricolor Bell Pepper'],
    defaultConfig: {
      base: 'Whole Wheat',
      sauce: 'Artisan Pesto',
      cheese: 'Fior di Latte Mozzarella',
      vegetables: ['Baby Spinach', 'Golden Sweet Corn', 'Kalamata Black Olives', 'Tricolor Bell Pepper']
    }
  },
  {
    name: 'Smoky BBQ Paneer Rustica',
    description: 'Hickory smoked barbecue sauce topped with caramelized red onions, roasted capsicum, sweet corn, and artisan mozzarella.',
    category: 'Premium',
    price: 479,
    rating: 4.85,
    isVegetarian: true,
    isSpicy: false,
    isChefSpecial: false,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
    ingredients: ['Classic Hand Tossed', 'Smoky BBQ', 'Fior di Latte Mozzarella', 'Red Onion', 'Green Capsicum', 'Golden Sweet Corn'],
    defaultConfig: {
      base: 'Classic Hand Tossed',
      sauce: 'Smoky BBQ',
      cheese: 'Fior di Latte Mozzarella',
      vegetables: ['Red Onion', 'Green Capsicum', 'Golden Sweet Corn']
    }
  },
  {
    name: 'Pesto Genovese Supreme',
    description: 'Fragrant Genovese basil pesto base, fresh mozzarella, sun-ripened tomatoes, kalamata olives, and shaved parmesan.',
    category: 'Classic',
    price: 469,
    rating: 4.88,
    isVegetarian: true,
    isSpicy: false,
    isChefSpecial: false,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&auto=format&fit=crop&q=80',
    ingredients: ['Thin Crust', 'Artisan Pesto', 'Parmigiano Reggiano', 'San Marzano Tomato', 'Kalamata Black Olives'],
    defaultConfig: {
      base: 'Thin Crust',
      sauce: 'Artisan Pesto',
      cheese: 'Parmigiano Reggiano',
      vegetables: ['San Marzano Tomato', 'Kalamata Black Olives']
    }
  },
  {
    name: 'Pepperoni Heatwave Feast',
    description: 'Loaded with double layers of spicy pepperoni, molten mozzarella, fire jalapeños, and slow-simmered San Marzano tomato sauce.',
    category: 'Spicy',
    price: 549,
    rating: 4.96,
    isVegetarian: false,
    isSpicy: true,
    isChefSpecial: true,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80',
    ingredients: ['Classic Hand Tossed', 'Classic Tomato', 'Fior di Latte Mozzarella', 'Fire Jalapeño', 'Red Onion'],
    defaultConfig: {
      base: 'Classic Hand Tossed',
      sauce: 'Classic Tomato',
      cheese: 'Fior di Latte Mozzarella',
      vegetables: ['Fire Jalapeño', 'Red Onion']
    }
  }
];

const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    console.log('Seeding PizzaVerse database...');

    // 1. Clear existing collections
    await User.deleteMany({});
    await Inventory.deleteMany({});
    await Pizza.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing collections.');

    // 2. Seed Admin User
    const adminUser = await User.create({
      name: 'PizzaVerse Commander',
      email: 'admin@pizzaverse.com',
      phone: '+91 9998887770',
      password: 'Admin@123456',
      role: 'ADMIN',
      isVerified: true
    });
    console.log(`✅ Admin user seeded: admin@pizzaverse.com (password: Admin@123456)`);

    // 3. Seed Verified Customer User
    const customerUser = await User.create({
      name: 'Alex PizzaLover',
      email: 'user@pizzaverse.com',
      phone: '+91 9876543210',
      password: 'User@123456',
      role: 'USER',
      isVerified: true,
      address: {
        street: '42 Silicon Boulevard, Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560034'
      }
    });
    console.log(`✅ Customer user seeded: user@pizzaverse.com (password: User@123456)`);

    // 4. Seed Inventory (23 items)
    const seededInventory = await Inventory.insertMany(seedInventory);
    console.log(`✅ Seeded ${seededInventory.length} inventory items across 4 categories.`);

    // 5. Seed Pizzas (8 signature items)
    const seededPizzas = await Pizza.insertMany(seedPizzas);
    console.log(`✅ Seeded ${seededPizzas.length} signature pizzas into the menu catalog.`);

    // 6. Seed Sample Past Orders for Admin Analytics
    const sampleOrders = [
      {
        orderNumber: 'PV-892101-4412',
        user: customerUser._id,
        items: [
          {
            pizza: seededPizzas[0]._id,
            name: seededPizzas[0].name,
            isCustom: false,
            configuration: seededPizzas[0].defaultConfig,
            quantity: 1,
            unitPrice: seededPizzas[0].price,
            totalPrice: seededPizzas[0].price
          },
          {
            pizza: seededPizzas[1]._id,
            name: seededPizzas[1].name,
            isCustom: false,
            configuration: seededPizzas[1].defaultConfig,
            quantity: 1,
            unitPrice: seededPizzas[1].price,
            totalPrice: seededPizzas[1].price
          }
        ],
        pricing: {
          subtotal: 878,
          deliveryFee: 0,
          tax: 44,
          totalAmount: 922
        },
        deliveryInformation: {
          fullName: 'Alex PizzaLover',
          phone: '+91 9876543210',
          street: '42 Silicon Boulevard, Koramangala',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560034',
          deliveryNotes: 'Leave at front desk with security.'
        },
        paymentInfo: {
          method: 'razorpay',
          paymentId: 'pay_sim_seed_101',
          razorpayOrderId: 'order_seed_101',
          status: 'Paid',
          paidAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
        },
        orderStatus: 'Delivered',
        timeline: [
          { status: 'Order Received', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), note: 'Payment verified.' },
          { status: 'In Kitchen', timestamp: new Date(Date.now() - 47 * 60 * 60 * 1000), note: 'Hand-crafted dough stretched & fired.' },
          { status: 'Sent to Delivery', timestamp: new Date(Date.now() - 46 * 60 * 60 * 1000), note: 'Dispatched with hot-bag rider.' },
          { status: 'Delivered', timestamp: new Date(Date.now() - 45 * 60 * 60 * 1000), note: 'Delivered hot and fresh.' }
        ]
      },
      {
        orderNumber: 'PV-910452-8821',
        user: customerUser._id,
        items: [
          {
            name: 'Custom Artisan Creation',
            isCustom: true,
            configuration: {
              base: 'Cheese Burst',
              sauce: 'Smoky BBQ',
              cheese: 'Four Cheese Volcano',
              vegetables: ['Fire Jalapeño', 'Button Mushroom', 'Kalamata Black Olives']
            },
            quantity: 1,
            unitPrice: 599,
            totalPrice: 599
          }
        ],
        pricing: {
          subtotal: 599,
          deliveryFee: 0,
          tax: 30,
          totalAmount: 629
        },
        deliveryInformation: {
          fullName: 'Alex PizzaLover',
          phone: '+91 9876543210',
          street: '42 Silicon Boulevard, Koramangala',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560034'
        },
        paymentInfo: {
          method: 'razorpay',
          paymentId: 'pay_sim_seed_102',
          razorpayOrderId: 'order_seed_102',
          status: 'Paid',
          paidAt: new Date(Date.now() - 25 * 60 * 1000)
        },
        orderStatus: 'In Kitchen',
        timeline: [
          { status: 'Order Received', timestamp: new Date(Date.now() - 25 * 60 * 1000), note: 'Payment confirmed.' },
          { status: 'In Kitchen', timestamp: new Date(Date.now() - 15 * 60 * 1000), note: 'Pizza is currently baking in 450°C stone oven.' }
        ]
      }
    ];

    await Order.insertMany(sampleOrders);
    console.log(`✅ Seeded ${sampleOrders.length} initial sample orders.`);

    console.log('\n🎉 PizzaVerse database successfully seeded with complete production dataset!\n');
    return { adminUser, customerUser };
  } catch (err) {
    console.error('Database seeding error:', err);
    throw err;
  }
};

// If run directly via node seedData.js
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedDatabase;
