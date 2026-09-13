const Order = require('../models/Order');
const User = require('../models/User');
const Inventory = require('../models/Inventory');

// @desc    Get admin dashboard metrics & chart data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getAdminDashboardMetrics = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'USER' });

    // Today's orders
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    // Revenue calculation
    const revenueAgg = await Order.aggregate([
      { $match: { 'paymentInfo.status': 'Paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$pricing.totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Active orders
    const activeOrders = await Order.countDocuments({
      orderStatus: { $in: ['Order Received', 'In Kitchen', 'Sent to Delivery'] }
    });

    // Inventory items below or at threshold
    const inventoryItems = await Inventory.find();
    const lowStockCount = inventoryItems.filter(i => i.quantity <= i.threshold).length;

    // 7-day orders and revenue trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const trendOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          'paymentInfo.status': 'Paid'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format last 7 days chart array
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const found = trendOrders.find(t => t._id === dateStr);

      chartData.push({
        date: dateStr,
        day: dayName,
        orders: found ? found.orders : 0,
        revenue: found ? found.revenue : 0
      });
    }

    // Popular pizza toppings / items breakdown
    const recentOrders = await Order.find({ 'paymentInfo.status': 'Paid' })
      .sort({ createdAt: -1 })
      .limit(50);

    const itemCounts = {};
    recentOrders.forEach(o => {
      o.items.forEach(it => {
        itemCounts[it.name] = (itemCounts[it.name] || 0) + it.quantity;
      });
    });

    const popularPizzas = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, orders: count }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    // Inventory category distribution
    const inventoryByCategory = {
      base: inventoryItems.filter(i => i.category === 'base').length,
      sauce: inventoryItems.filter(i => i.category === 'sauce').length,
      cheese: inventoryItems.filter(i => i.category === 'cheese').length,
      vegetable: inventoryItems.filter(i => i.category === 'vegetable').length
    };

    res.status(200).json({
      success: true,
      metrics: {
        totalOrders,
        todayOrders,
        totalRevenue,
        activeOrders,
        lowStockCount,
        totalUsers
      },
      charts: {
        weeklyTrend: chartData,
        popularPizzas: popularPizzas.length > 0 ? popularPizzas : [
          { name: 'Margherita Supreme', orders: 18 },
          { name: 'Spicy Pepperoni Blast', orders: 24 },
          { name: 'Truffle Mushroom', orders: 15 },
          { name: 'Custom Masterpiece', orders: 32 }
        ],
        inventoryByCategory
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders for admin
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'deliveryInformation.fullName': { $regex: search, $options: 'i' } },
        { 'deliveryInformation.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'USER' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    next(err);
  }
};
