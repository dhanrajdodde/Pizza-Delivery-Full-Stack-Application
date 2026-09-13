# 🍕 PizzaVerse — Full-Stack Pizza Delivery & Inventory Management Platform

> A Level 3 full-stack, production-grade pizza ordering and operations management platform featuring real-time WebGL 3D customization, instant inventory synchronization, live WebSocket order tracking, and Razorpay test payments.

---

## 🌟 Key Features

### 🎮 Interactive 3D WebGL Pizza Experience
- **Cinematic 3D Hero Showcase**: Interactive 3D pizza model with dynamic camera presentation controls, realistic dough crust, bubbly mozzarella cheese with golden blister spots, pepperoni, sautéed mushrooms, kalamata olives, tricolor bell peppers, fresh baby spinach, gentle rising steam particles, and orbiting floating ingredients.
- **Real-Time 3D Custom Pizza Builder**: Live 4-step customization stepper (*Crust Base*, *Gourmet Sauce*, *Artisan Cheese*, *Fresh Farm Vegetables*). Changing crust thickness/color, sauce hues, cheese melt tones, and toggling toppings instantly renders on the 3D rotating canvas with live dynamic price calculation.

### 🔐 Full Authentication & Security
- **JWT Authentication & Bcrypt Password Hashing**: Clean separation between customer accounts and administrative roles.
- **Email Verification Flow**: Generates secure verification tokens and sends HTML verification emails via Nodemailer. Features automated dev-mode simulation links to test without SMTP constraints.
- **Password Reset**: Expiring SHA-256 tokens with secure password hashing.
- **Dedicated Admin Portal**: Separate `/admin/login` operations portal restricted by role-based authorization (`ADMIN` vs `USER`).

### 📦 Automated Real-Time Inventory Control
- **23-Ingredient Catalog Tracking**: Bases (5), Sauces (5), Cheeses (4), and Vegetables (9).
- **Atomic Backend Decrement**: Placing and confirming paid orders automatically decrements individual ingredient stocks server-side.
- **Low-Stock Safety Thresholds**: Live status badges (*In Stock*, *Low Stock*, *Critical*, *Out of Stock*).
- **Node-Cron Background Engine**: Scheduled hourly background job monitoring low-stock items with cooldown notification throttling to prevent email spam.
- **Manual Stock Adjustments**: Quick `+5` / `-5` stock adjusters and custom threshold configuration modals in the Admin Hub.

### 💳 Razorpay Test Payment Integration
- **Dual-Mode Razorpay Gateway**: Backend order generation (`orders.create`), client-side Razorpay Checkout SDK launcher, and HMAC-SHA256 signature verification.
- **1-Click Sandbox Demo Simulation**: Integrated test fallback button that simulates full payment verification and inventory decrement without requiring live bank credentials.

### 📡 Real-Time Order Radar (Socket.IO)
- **Visual Order Timeline**: Four milestone stages:
  1. `Order Received`
  2. `In Kitchen` (stone oven firing)
  3. `Sent to Delivery` (hot-bag rider dispatch)
  4. `Delivered`
- **Instant Status Sync**: When an admin updates an order's status in the Operations Center, the customer's tracking screen immediately reflects the change without page reload via Socket.IO rooms.
- **Printable Tax Invoices**: Formatted receipt and customer invoice view.

### 📊 SOC Admin Operations Center
- **Executive KPI Cards**: Real-time revenue counters, today's order volume, active kitchen orders, and low-stock alerts.
- **Recharts Data Visualization**: 7-day revenue & order volume area graphs, pizza popularity rankings, and category breakdown.
- **Kitchen Order Dispatcher**: Live order queue with customer details, recipe specifications, and live status switchers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts, Canvas Confetti |
| **3D Graphics** | Three.js, React Three Fiber (`@react-three/fiber`), React Three Drei (`@react-three/drei`) |
| **Backend** | Node.js, Express.js, Socket.IO, Nodemailer, Node-Cron, Razorpay SDK, Morgan |
| **Database** | MongoDB, Mongoose, MongoMemoryServer (automatic zero-config fallback) |
| **Auth & Security** | JSON Web Tokens (JWT), Bcrypt.js, Crypto |

---

## 📁 Project Structure

```
pizza/
├── client/                     # Vite + React 18 Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/             # Three.js 3D models and interactive canvas
│   │   │   │   ├── PizzaModel.jsx          # Procedural 3D pizza geometry & toppings
│   │   │   │   ├── HeroPizzaCanvas.jsx     # Interactive hero scene with floating ingredients
│   │   │   │   ├── BuilderPizzaCanvas.jsx  # Live 3D custom pizza builder canvas
│   │   │   │   └── FloatingIngredients.jsx # Orbiting 3D veggies & cheese
│   │   │   ├── common/         # Navbar, Footer
│   │   │   ├── cart/           # Cart slide-over drawer
│   │   │   ├── checkout/       # Razorpay payment modal & simulation
│   │   │   └── tracking/       # Real-time order progress timeline
│   │   ├── context/            # AuthContext, CartContext, SocketContext
│   │   ├── pages/              # Landing, Menu, Builder, Cart, Orders, Dashboard, Profile, Admin
│   │   ├── services/           # api.js Axios client
│   │   ├── App.jsx             # Routes & layout definition
│   │   └── index.css           # Tailwind CSS directives & glassmorphic styling
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Node.js + Express Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection with MongoMemoryServer fallback
│   ├── controllers/            # authController, pizzaController, orderController,
│   │                           # inventoryController, paymentController, adminController
│   ├── middleware/             # authMiddleware (JWT protect & admin authorize), errorMiddleware
│   ├── models/                 # User.js, Pizza.js, Inventory.js, Order.js
│   ├── routes/                 # authRoutes, pizzaRoutes, builderRoutes, orderRoutes,
│   │                           # inventoryRoutes, paymentRoutes, adminRoutes
│   ├── services/               # emailService.js, socketService.js, inventoryService.js
│   ├── jobs/                   # lowStockCron.js (hourly node-cron inventory monitor)
│   ├── utils/                  # seedData.js (preloads menu, ingredients, admin & sample orders)
│   ├── server.js               # Express app & Socket.IO server initialization
│   └── package.json
│
├── .env.example                # Root environment configuration reference
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18 or higher (tested on Node v24.x)
- **npm**: v9 or higher

### 2. Setup Environment Variables
Copy `.env.example` to `server/.env`:
```bash
# Server Environment
PORT=5000
NODE_ENV=development

# Database (leave as is for zero-config automatic embedded Mongo or set your Atlas URI)
MONGO_URI=mongodb://127.0.0.1:27017/pizzaverse

# Authentication
JWT_SECRET=super_secret_pizzaverse_jwt_key_9837428479219
JWT_EXPIRES_IN=7d

# Razorpay Test Credentials (or use Sandbox Demo mode)
RAZORPAY_KEY_ID=rzp_test_pizzaverse12345
RAZORPAY_KEY_SECRET=secret_test_pizzaverse67890

# Email (Nodemailer)
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=demo@pizzaverse.com
EMAIL_PASSWORD=demo_password

# Client URL
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
```

### 3. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 4. Seed the Database
Run the seed script in `server/` to initialize default administrator credentials, customer account, 23 inventory items, 8 signature pizzas, and sample past orders:
```bash
cd server
npm run seed
```

### 5. Start Backend and Frontend
In terminal 1 (Backend):
```bash
cd server
npm start
```
*Backend runs on `http://localhost:5000` with real-time Socket.IO.*

In terminal 2 (Frontend):
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Access Portal |
|---|---|---|---|
| **Administrator** | `admin@pizzaverse.com` | `Admin@123456` | `/admin/login` |
| **Customer** | `user@pizzaverse.com` | `User@123456` | `/login` |

*(Both login pages feature 1-click **"Quick Auto-Fill Demo Credentials"** buttons for effortless testing.)*

---

## 📡 REST API Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new customer with verification token
- `POST /api/auth/login` — Customer login returning JWT
- `POST /api/auth/admin-login` — Administrator login with role check
- `GET /api/auth/verify-email?token=` — Confirm email address
- `POST /api/auth/quick-verify` — Dev-mode instant account verification
- `GET /api/auth/me` — Current authenticated session profile
- `PUT /api/auth/profile` — Update contact information & delivery address
- `POST /api/auth/forgot-password` — Generate expiring password reset token
- `POST /api/auth/reset-password` — Set new password using token

### Menu Catalog (`/api/pizzas`)
- `GET /api/pizzas` — List all signature pizzas with category filters, sorting, and search
- `GET /api/pizzas/:id` — Single pizza details

### 3D Pizza Builder (`/api/pizza-builder`)
- `GET /api/pizza-builder/ingredients` — Returns all bases, sauces, cheeses, and veggies with real-time inventory stock levels
- `GET /api/pizza-builder/bases` — 5 pizza bases
- `GET /api/pizza-builder/sauces` — 5 gourmet sauces
- `GET /api/pizza-builder/cheeses` — 4 cheese blends
- `GET /api/pizza-builder/vegetables` — 9 fresh vegetables

### Orders (`/api/orders`)
- `POST /api/orders` — Create new pizza order (requires verified customer)
- `GET /api/orders` — List orders for authenticated customer
- `GET /api/orders/:id` — Single order details with timeline
- `PUT /api/orders/:id/status` — Admin order status updater (triggers real-time Socket.IO update)

### Payments (`/api/payment`)
- `POST /api/payment/create-order` — Create Razorpay order
- `POST /api/payment/verify` — Verify signature, trigger automatic inventory decrement & socket push

### Inventory (`/api/inventory`)
- `GET /api/inventory` — Stock levels and threshold status
- `PUT /api/inventory/:id` — Edit item quantity or threshold
- `POST /api/inventory/adjust` — Increment/decrement stock by delta
- `POST /api/inventory/trigger-alert-check` — Trigger manual low-stock check

### Admin Operations Center (`/api/admin`)
- `GET /api/admin/dashboard` — SOC metrics, 7-day revenue trend, and popularity charts
- `GET /api/admin/orders` — Global order stream with filters
- `GET /api/admin/users` — Customer accounts list

---

## 🛡️ Architecture & Verification Highlights
- **Zero-Friction DB Deployment**: If standard MongoDB is not installed locally, `server/config/db.js` automatically boots an in-memory Mongo server with real Mongoose model support and persistence.
- **Device-Aware 3D WebGL**: Three.js canvases feature error boundaries with graceful 2D fallbacks in environments without WebGL acceleration.
- **End-to-End Testing**: Validated via browser automation subagent covering the entire journey: landing page 3D hero, custom builder, shopping cart, Razorpay test payment, real-time tracking radar, and admin SOC order status updates.
