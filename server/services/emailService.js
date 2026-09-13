const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Check if real SMTP credentials are provided
  if (
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASSWORD &&
    process.env.EMAIL_USER !== 'demo@pizzaverse.com'
  ) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    return transporter;
  }

  // Otherwise, use Ethereal or test transporter
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log(`Ethereal Test Mailer initialized (${testAccount.user})`);
    return transporter;
  } catch (err) {
    console.warn(`Failed to create test email account, using console logging fallback: ${err.message}`);
    return null;
  }
};

// Send Email Verification
exports.sendVerificationEmail = async ({ to, name, token }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0c0d12; color: #f1f5f9; padding: 40px 20px; border-radius: 12px; max-width: 600px; margin: auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ff6b00; margin: 0; font-size: 28px; letter-spacing: 1px;">🍕 PIZZAVERSE</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Artisan Pizza & 3D Culinary Experience</p>
      </div>
      <div style="background-color: #14161f; border: 1px solid #2c3144; padding: 24px; border-radius: 8px;">
        <h2 style="color: #ffffff; margin-top: 0;">Welcome to PizzaVerse, ${name}!</h2>
        <p style="color: #cbd5e1; line-height: 1.6;">
          Thank you for joining PizzaVerse. To activate your account and start crafting delicious artisan pizzas, please verify your email address.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="background-color: #ff6b00; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(255,107,0,0.4);">
            Verify My Email Address
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
          Or copy and paste this verification URL into your browser:<br/>
          <a href="${verifyUrl}" style="color: #ff6b00; word-break: break-all;">${verifyUrl}</a>
        </p>
      </div>
      <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 24px;">
        If you didn't create a PizzaVerse account, you can safely ignore this email.
      </p>
    </div>
  `;

  console.log(`\n📧 [EMAIL DISPATCH - VERIFICATION]`);
  console.log(`To: ${to}`);
  console.log(`Verify Link: ${verifyUrl}\n`);

  try {
    const mailer = await getTransporter();
    if (mailer) {
      const info = await mailer.sendMail({
        from: process.env.EMAIL_FROM || '"PizzaVerse Team" <no-reply@pizzaverse.com>',
        to,
        subject: '🍕 Verify Your PizzaVerse Account',
        html
      });
      console.log(`Verification email sent: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    }
  } catch (err) {
    console.warn(`Could not send email via transport: ${err.message}`);
  }

  return { verifyUrl };
};

// Send Password Reset Email
exports.sendPasswordResetEmail = async ({ to, name, token }) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0c0d12; color: #f1f5f9; padding: 40px 20px; border-radius: 12px; max-width: 600px; margin: auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ff6b00; margin: 0; font-size: 28px;">🍕 PIZZAVERSE</h1>
        <p style="color: #94a3b8; font-size: 14px;">Password Reset Request</p>
      </div>
      <div style="background-color: #14161f; border: 1px solid #2c3144; padding: 24px; border-radius: 8px;">
        <h2 style="color: #ffffff; margin-top: 0;">Hi ${name},</h2>
        <p style="color: #cbd5e1; line-height: 1.6;">
          You requested a password reset for your PizzaVerse account. Click the button below to set a new password. This link is valid for 1 hour.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #ff6b00; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 12px;">
          Or open this link: <a href="${resetUrl}" style="color: #ff6b00; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
    </div>
  `;

  console.log(`\n📧 [EMAIL DISPATCH - PASSWORD RESET]`);
  console.log(`To: ${to}`);
  console.log(`Reset Link: ${resetUrl}\n`);

  try {
    const mailer = await getTransporter();
    if (mailer) {
      await mailer.sendMail({
        from: process.env.EMAIL_FROM || '"PizzaVerse Support" <support@pizzaverse.com>',
        to,
        subject: '🔒 Reset Your PizzaVerse Password',
        html
      });
    }
  } catch (err) {
    console.warn(`Could not send reset email via transport: ${err.message}`);
  }

  return { resetUrl };
};

// Send Low-Stock Inventory Alert to Admin
exports.sendLowStockAlert = async ({ adminEmail, lowStockItems }) => {
  const itemsList = lowStockItems
    .map(
      item => `
      <tr style="border-bottom: 1px solid #2c3144;">
        <td style="padding: 10px; color: #ffffff; font-weight: 600;">${item.name}</td>
        <td style="padding: 10px; color: #cbd5e1; text-transform: capitalize;">${item.category}</td>
        <td style="padding: 10px; color: #e63946; font-weight: bold;">${item.quantity} ${item.unit}</td>
        <td style="padding: 10px; color: #94a3b8;">${item.threshold} ${item.unit}</td>
        <td style="padding: 10px; color: #ff6b00; font-weight: bold;">${item.status}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0c0d12; color: #f1f5f9; padding: 40px 20px; border-radius: 12px; max-width: 650px; margin: auto;">
      <h2 style="color: #e63946; margin-top: 0;">⚠️ Low Stock Inventory Alert</h2>
      <p style="color: #cbd5e1;">The following PizzaVerse ingredients have fallen at or below their safety reorder threshold:</p>
      <table style="width: 100%; text-align: left; border-collapse: collapse; margin: 20px 0; background-color: #14161f; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background-color: #1e2230; color: #94a3b8; font-size: 13px;">
            <th style="padding: 10px;">Item</th>
            <th style="padding: 10px;">Category</th>
            <th style="padding: 10px;">Current Stock</th>
            <th style="padding: 10px;">Threshold</th>
            <th style="padding: 10px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>
      <p style="color: #94a3b8; font-size: 13px;">
        Recommended Action: Log in to the Admin Operations Center to restock these items immediately to prevent pizza builder outages.
      </p>
    </div>
  `;

  console.log(`\n⚠️ [EMAIL DISPATCH - LOW STOCK ALERT]`);
  console.log(`Admin Recipient: ${adminEmail}`);
  console.log(`Items count: ${lowStockItems.length}\n`);

  try {
    const mailer = await getTransporter();
    if (mailer) {
      await mailer.sendMail({
        from: process.env.EMAIL_FROM || '"PizzaVerse Ops" <ops@pizzaverse.com>',
        to: adminEmail,
        subject: `⚠️ Alert: ${lowStockItems.length} Low Stock Inventory Items in PizzaVerse`,
        html
      });
    }
  } catch (err) {
    console.warn(`Could not send low stock alert email: ${err.message}`);
  }
};
