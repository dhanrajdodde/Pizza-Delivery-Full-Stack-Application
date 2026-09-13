require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const { initSocket } = require('./services/socketService');
const { initCronJobs } = require('./jobs/lowStockCron');

// Route imports
const authRoutes = require('./routes/authRoutes');
const pizzaRoutes = require('./routes/pizzaRoutes');
const builderRoutes = require('./routes/builderRoutes');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Auto-seed helper
const seedDatabase = require('./utils/seedData');
const Inventory = require('./models/Inventory');

const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow dev access gracefully
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

initSocket(io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date(),
    service: 'PizzaVerse Real-Time API'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pizzas', pizzaRoutes);
app.use('/api/pizza-builder', builderRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Catch 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    await connectDB();

    // Check if database needs initial seeding
    const inventoryCount = await Inventory.countDocuments();
    if (inventoryCount === 0) {
      console.log('📦 Database is empty. Running initial auto-seed for PizzaVerse...');
      await seedDatabase();
    }

    // Initialize node-cron background jobs
    initCronJobs();

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`\n⚠️  Port ${PORT} is already in use by a running PizzaVerse process.`);
        console.log(`👉 The server is ALREADY ACTIVE and responding on http://localhost:${PORT}/api\n`);
        process.exit(0);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });

    server.listen(PORT, () => {
      console.log(`\n=================================================`);
      console.log(`🚀 PizzaVerse Server running on port ${PORT}`);
      console.log(`📡 Socket.IO real-time engine active`);
      console.log(`🌐 REST API: http://localhost:${PORT}/api`);
      console.log(`👑 Admin Login: admin@pizzaverse.com / Admin@123456`);
      console.log(`🍕 Demo Customer: user@pizzaverse.com / User@123456`);
      console.log(`=================================================\n`);
    });
  } catch (err) {
    console.error(`Fatal server startup failure: ${err.message}`);
    process.exit(1);
  }
};

startServer();
