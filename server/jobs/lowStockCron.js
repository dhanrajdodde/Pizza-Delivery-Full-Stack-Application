const cron = require('node-cron');
const { checkAllLowStock } = require('../services/inventoryService');
const { sendLowStockAlert } = require('../services/emailService');
const User = require('../models/User');

let lastAlertTime = 0;
const ALERT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown between automated cron emails

const runLowStockCheck = async (force = false) => {
  try {
    const now = Date.now();
    if (!force && (now - lastAlertTime < ALERT_COOLDOWN_MS)) {
      return;
    }

    const lowStockItems = await checkAllLowStock();
    if (lowStockItems.length > 0) {
      console.log(`\n🕒 [NODE-CRON JOB] Found ${lowStockItems.length} low stock items in inventory:`);
      lowStockItems.forEach(i => console.log(` - ${i.name}: ${i.quantity}/${i.threshold} ${i.unit} (${i.status})`));

      const admin = await User.findOne({ role: 'ADMIN' });
      const targetEmail = admin ? admin.email : (process.env.EMAIL_USER || 'admin@pizzaverse.com');

      await sendLowStockAlert({
        adminEmail: targetEmail,
        lowStockItems
      });

      lastAlertTime = now;
    } else {
      console.log(`🕒 [NODE-CRON JOB] Inventory health check completed: All items healthy.`);
    }
  } catch (err) {
    console.error('Error running low stock cron check:', err.message);
  }
};

const initCronJobs = () => {
  // Run once every hour at minute 0: '0 * * * *'
  cron.schedule('0 * * * *', () => {
    console.log('⏰ Running scheduled hourly low-stock inventory check...');
    runLowStockCheck();
  });

  console.log('🕒 Node-cron inventory alert scheduler initialized (Hourly schedule).');
};

module.exports = {
  initCronJobs,
  runLowStockCheck
};
