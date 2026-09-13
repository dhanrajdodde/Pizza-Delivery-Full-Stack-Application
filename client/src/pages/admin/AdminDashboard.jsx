import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Users,
  DollarSign,
  Clock,
  Flame,
  Plus,
  Minus,
  Edit2,
  RefreshCw,
  Send,
  Eye,
  CheckCircle2,
  Bell
} from 'lucide-react';

const ORDER_STATUS_OPTIONS = [
  'Order Received',
  'In Kitchen',
  'Sent to Delivery',
  'Delivered',
  'Cancelled'
];

export const AdminDashboard = () => {
  const { joinAdminRoom, lastAdminNotification } = useSocket();

  // Tab: 'overview', 'orders', 'inventory', 'users'
  const [activeTab, setActiveTab] = useState('overview');

  // Overview metrics state
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    lowStockCount: 0,
    totalUsers: 0,
  });
  const [charts, setCharts] = useState({
    weeklyTrend: [],
    popularPizzas: [],
    inventoryByCategory: {},
  });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');

  // Inventory state
  const [inventory, setInventory] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [editThreshold, setEditThreshold] = useState('');

  // Users state
  const [usersList, setUsersList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [alertNotification, setAlertNotification] = useState(null);

  useEffect(() => {
    joinAdminRoom();
    loadDashboardData();
  }, []);

  // Listen to live Socket.IO events for automatic dashboard refresh
  useEffect(() => {
    if (lastAdminNotification) {
      console.log('⚡ Admin received real-time socket event:', lastAdminNotification);
      setAlertNotification(
        lastAdminNotification.type === 'NEW_ORDER'
          ? `New Order Placed: #${lastAdminNotification.order?.orderNumber}`
          : `Inventory Stock Changed: ${lastAdminNotification.item?.name}`
      );
      // Reload active metrics
      loadDashboardData();

      setTimeout(() => setAlertNotification(null), 5000);
    }
  }, [lastAdminNotification]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, ordersRes, invRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/orders'),
        api.get('/inventory'),
        api.get('/admin/users'),
      ]);

      if (dashRes.data.success) {
        setMetrics(dashRes.data.metrics);
        setCharts(dashRes.data.charts);
      }
      if (ordersRes.data.success) {
        setOrders(ordersRes.data.orders);
      }
      if (invRes.data.success) {
        setInventory(invRes.data.inventory);
        setInventoryStats(invRes.data.stats);
      }
      if (usersRes.data.success) {
        setUsersList(usersRes.data.users);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Status transition handler for orders (triggers Socket.IO to customer)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  // Quick adjust inventory stock (+5 or -5)
  const handleQuickAdjustStock = async (id, delta) => {
    try {
      const res = await api.post('/inventory/adjust', { id, delta });
      if (res.data.success) {
        setInventory((prev) =>
          prev.map((it) => (it._id === id ? { ...it, quantity: res.data.item.quantity, status: res.data.item.status } : it))
        );
      }
    } catch (err) {
      alert('Failed to adjust stock level');
    }
  };

  // Save detailed inventory edit modal
  const handleSaveInventoryEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const res = await api.put(`/inventory/${editingItem._id}`, {
        quantity: Number(editQty),
        threshold: Number(editThreshold),
      });

      if (res.data.success) {
        setInventory((prev) =>
          prev.map((it) => (it._id === editingItem._id ? res.data.item : it))
        );
        setEditingItem(null);
      }
    } catch (err) {
      alert('Failed to save inventory updates');
    }
  };

  // Trigger low stock check & email job
  const handleTriggerLowStockCheck = async () => {
    try {
      const res = await api.post('/inventory/trigger-alert-check');
      alert(res.data.message || 'Low stock evaluation completed.');
    } catch (err) {
      alert('Failed to trigger low stock check.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            PizzaVerse Operations Center • SOC Dashboard
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white mt-1">
            Real-Time Command Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live order dispatcher, real-time inventory synchronizer, and sales analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-charcoal-800 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>

          <button
            onClick={handleTriggerLowStockCheck}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors flex items-center gap-1.5"
            title="Execute node-cron low-stock alert job immediately"
          >
            <Bell className="w-3.5 h-3.5" />
            Check Low Stock Alerts
          </button>
        </div>
      </div>

      {/* Live Socket Broadcast Alert Toast */}
      {alertNotification && (
        <div className="p-3 bg-pizza-orange/20 border border-pizza-orange/40 rounded-xl text-xs text-pizza-orange font-bold flex items-center gap-2 animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-pizza-orange animate-ping" />
          <span>{alertNotification}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-charcoal-900/80 p-1.5 rounded-2xl border border-white/10 w-fit">
        {[
          { id: 'overview', label: 'Operations Radar', count: null },
          { id: 'orders', label: 'Kitchen Orders', count: metrics.activeOrders },
          { id: 'inventory', label: 'Inventory Hub', count: metrics.lowStockCount },
          { id: 'users', label: 'Customers', count: metrics.totalUsers },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && tab.count > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id
                    ? 'bg-black text-amber-400'
                    : 'bg-pizza-orange/20 text-pizza-orange'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* KPI Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Total Revenue</span>
              <p className="text-2xl font-bold text-emerald-400 font-mono">₹{metrics.totalRevenue}</p>
              <span className="text-[10px] text-slate-500">Paid orders</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Total Orders</span>
              <p className="text-2xl font-bold text-white font-mono">{metrics.totalOrders}</p>
              <span className="text-[10px] text-slate-500">Lifetime volume</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Today's Orders</span>
              <p className="text-2xl font-bold text-pizza-orange font-mono">{metrics.todayOrders}</p>
              <span className="text-[10px] text-slate-500">Past 24 hours</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Active In Kitchen</span>
              <p className="text-2xl font-bold text-amber-400 font-mono">{metrics.activeOrders}</p>
              <span className="text-[10px] text-slate-500">In prep / dispatch</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Low Stock Items</span>
              <p className={`text-2xl font-bold font-mono ${metrics.lowStockCount > 0 ? 'text-red-400' : 'text-slate-200'}`}>
                {metrics.lowStockCount}
              </p>
              <span className="text-[10px] text-slate-500">Below threshold</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Registered Users</span>
              <p className="text-2xl font-bold text-sky-400 font-mono">{metrics.totalUsers}</p>
              <span className="text-[10px] text-slate-500">Customer base</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Weekly Revenue & Orders Area Chart */}
            <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Daily Revenue & Order Trends</h3>
                  <p className="text-xs text-slate-400">Past 7 Days Analytics</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-pizza-orange">
                    <span className="w-2 h-2 rounded-full bg-pizza-orange" /> Revenue (₹)
                  </span>
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <span className="w-2 h-2 rounded-full bg-sky-400" /> Orders
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.weeklyTrend}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ff6b00" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2c3144" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#161822',
                        borderColor: '#2c3144',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#ffffff',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#ff6b00"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Popular Pizzas Bar Chart */}
            <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white">Most Popular Pizzas</h3>
              <p className="text-xs text-slate-400">Top customer favorites</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.popularPizzas} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#2c3144" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={10} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={90} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#161822',
                        borderColor: '#2c3144',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="orders" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 2: KITCHEN ORDERS ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          
          {/* Order Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              {['All', ...ORDER_STATUS_OPTIONS].map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    orderStatusFilter === status
                      ? 'bg-pizza-orange text-white shadow-glow-orange'
                      : 'bg-charcoal-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search by order # or customer..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="w-full sm:w-64 px-3.5 py-1.5 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pizza-orange"
            />
          </div>

          {/* Orders Table */}
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-charcoal-900 border-b border-white/10 text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Pizzas & Recipe</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Kitchen Status Transition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders
                    .filter((o) => {
                      if (orderStatusFilter !== 'All' && o.orderStatus !== orderStatusFilter) return false;
                      if (orderSearch) {
                        const q = orderSearch.toLowerCase();
                        return (
                          o.orderNumber.toLowerCase().includes(q) ||
                          o.deliveryInformation?.fullName?.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((order) => (
                      <tr key={order._id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono font-bold text-white">
                          {order.orderNumber}
                          <span className="block text-[10px] text-slate-500 font-sans mt-0.5">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        <td className="p-4">
                          <p className="font-semibold text-white">{order.deliveryInformation.fullName}</p>
                          <p className="text-[11px] text-slate-400">{order.deliveryInformation.phone}</p>
                          <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{order.deliveryInformation.city}</p>
                        </td>

                        <td className="p-4 max-w-xs">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="space-y-0.5 mb-1.5 last:mb-0">
                              <span className="font-semibold text-slate-200">
                                {it.quantity}x {it.name}
                              </span>
                              {it.configuration && (
                                <span className="block text-[10px] text-slate-400 truncate">
                                  {it.configuration.base} • {it.configuration.sauce} • {it.configuration.cheese}
                                  {it.configuration.vegetables?.length > 0 && ` • [${it.configuration.vegetables.join(', ')}]`}
                                </span>
                              )}
                            </div>
                          ))}
                        </td>

                        <td className="p-4 font-bold text-pizza-orange font-mono">
                          ₹{order.pricing.totalAmount}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              order.paymentInfo.status === 'Paid'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {order.paymentInfo.status}
                          </span>
                          <span className="block text-[10px] text-slate-500 uppercase mt-0.5">
                            {order.paymentInfo.method}
                          </span>
                        </td>

                        <td className="p-4">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className="bg-charcoal-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-pizza-orange cursor-pointer"
                          >
                            {ORDER_STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 3: INVENTORY HUB ================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          
          {/* Inventory Health Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400">Total Items Tracked</span>
              <p className="text-xl font-bold text-white font-mono">{inventoryStats.totalItems}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-white/5">
              <span className="text-xs text-emerald-400 font-semibold">Healthy In Stock</span>
              <p className="text-xl font-bold text-emerald-400 font-mono">{inventoryStats.inStock}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-white/5">
              <span className="text-xs text-amber-400 font-semibold">Low Stock</span>
              <p className="text-xl font-bold text-amber-400 font-mono">{inventoryStats.lowStock}</p>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-white/5">
              <span className="text-xs text-red-400 font-semibold">Critical / Out of Stock</span>
              <p className="text-xl font-bold text-red-400 font-mono">
                {(inventoryStats.critical || 0) + (inventoryStats.outOfStock || 0)}
              </p>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-charcoal-900 border-b border-white/10 text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Ingredient</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Stock Level</th>
                    <th className="p-4">Threshold Alert</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Quick Adjust Stock</th>
                    <th className="p-4">Configure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {inventory.map((item) => (
                    <tr key={item._id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <span className="font-semibold text-white">{item.name}</span>
                        <span className="block text-[10px] text-slate-500">{item.description}</span>
                      </td>

                      <td className="p-4 capitalize text-slate-300">
                        {item.category}
                      </td>

                      <td className="p-4 font-mono font-bold text-white text-sm">
                        {item.quantity} <span className="text-xs text-slate-500 font-normal">{item.unit}</span>
                      </td>

                      <td className="p-4 font-mono text-slate-400">
                        {item.threshold} {item.unit}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'In Stock'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : item.status === 'Low Stock'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleQuickAdjustStock(item._id, -5)}
                            className="p-1 rounded bg-charcoal-800 hover:bg-charcoal-700 text-slate-300"
                            title="Decrease by 5"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleQuickAdjustStock(item._id, 5)}
                            className="p-1 rounded bg-charcoal-800 hover:bg-charcoal-700 text-slate-300"
                            title="Increase by 5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setEditQty(item.quantity);
                            setEditThreshold(item.threshold);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                          title="Edit Stock & Threshold"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Stock Modal */}
          {editingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-charcoal-900 border border-white/10 rounded-2xl max-w-sm w-full p-6 space-y-4">
                <h3 className="text-base font-bold text-white">Adjust {editingItem.name}</h3>
                
                <form onSubmit={handleSaveInventoryEdit} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Quantity in Stock ({editingItem.unit})</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-white/10 text-xs text-white focus:outline-none focus:border-pizza-orange"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Safety Threshold Alert Level</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={editThreshold}
                      onChange={(e) => setEditThreshold(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-white/10 text-xs text-white focus:outline-none focus:border-pizza-orange"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white neon-glow-btn"
                    >
                      Save Updates
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================= TAB 4: USERS ================= */}
      {activeTab === 'users' && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-sm font-bold text-white">Registered Customer Accounts ({usersList.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-900 border-b border-white/10 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersList.map((usr) => (
                  <tr key={usr._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-semibold text-white">{usr.name}</td>
                    <td className="p-4 text-slate-300">{usr.email}</td>
                    <td className="p-4 text-slate-400">{usr.phone}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        Active
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(usr.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
