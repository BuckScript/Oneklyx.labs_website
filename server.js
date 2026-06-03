const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure required directories exist
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'orders.json');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
}

// Multer storage configuration for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Generate secure filename: timestamp + original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (accept PDF, PNG, JPG/JPEG)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Hanya PDF, PNG, JPG yang diperbolehkan.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Serve Static Assets Securely (Avoid exposure of root files like .env or package.json)
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve index.html as primary page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Helpers to read/write JSON database
const getOrders = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading orders file:', error);
    return [];
  }
};

const saveOrder = (order) => {
  try {
    const orders = getOrders();
    orders.push(order);
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving order to JSON file:', error);
    return false;
  }
};

// ============================================
// NOTIFICATION UTILITIES
// ============================================

// Helper to send email via SMTP (or log if credentials are missing)
const sendEmailNotifications = async (order) => {
  const isSmtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  
  const emailContentAdmin = `
    <h2>New Project Order Received!</h2>
    <p><strong>Reference Number:</strong> ${order.referenceNumber}</p>
    <p><strong>Client Name:</strong> ${order.fullName}</p>
    <p><strong>Email:</strong> ${order.email}</p>
    <p><strong>WhatsApp:</strong> ${order.whatsapp}</p>
    <p><strong>Company/Institution:</strong> ${order.company || '-'}</p>
    <hr />
    <p><strong>Project Type:</strong> ${order.projectType}</p>
    <p><strong>Budget Range:</strong> ${order.budget}</p>
    <p><strong>Project Title:</strong> ${order.projectTitle}</p>
    <p><strong>Description:</strong></p>
    <blockquote style="background:#f4f4f4; padding:15px; border-left:5px solid #0066ff;">
      ${order.projectDesc.replace(/\n/g, '<br>') || '-'}
    </blockquote>
    <p><strong>Target Deadline:</strong> ${order.deadline || '-'}</p>
    <p><strong>Tech Stack Preference:</strong> ${order.techStack.length > 0 ? order.techStack.join(', ') : 'No Preference'}</p>
    <p><strong>Reference Links:</strong> ${order.referenceLinks.length > 0 ? order.referenceLinks.join(', ') : '-'}</p>
    <p><strong>Uploaded File:</strong> ${order.uploadedFile ? `<a href="http://localhost:${PORT}/uploads/${order.uploadedFile.filename}">${order.uploadedFile.originalname}</a>` : 'None'}</p>
  `;

  const emailContentClient = `
    <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e2e8f0; border-radius:8px;">
      <h2 style="color:#0066ff;">Order Received 🎉</h2>
      <p>Dear ${order.fullName},</p>
      <p>Thank you for reaching out to <strong>OneKlyx</strong>! We have received your project inquiry.</p>
      <div style="background:#f8fafc; padding:15px; border-radius:6px; margin:20px 0;">
        <p style="margin:0;"><strong>Reference Number:</strong> ${order.referenceNumber}</p>
        <p style="margin:5px 0 0 0;"><strong>Project Title:</strong> ${order.projectTitle}</p>
        <p style="margin:5px 0 0 0;"><strong>Project Type:</strong> ${order.projectType}</p>
      </div>
      <p>Our team is currently reviewing your requirements. We will contact you via WhatsApp or email within the next <strong>24 hours</strong> to discuss details and schedule a free consultation.</p>
      <p>If you have any quick updates, feel free to chat with us directly on WhatsApp using this reference number: <a href="https://wa.me/${process.env.WHATSAPP_PHONE_NUMBER || '6281234567890'}?text=Hi%20OneKlyx%2C%20my%20order%20reference%20is%20${order.referenceNumber}">Chat on WhatsApp</a>.</p>
      <br>
      <p>Best regards,</p>
      <p><strong>OneKlyx Team</strong><br>Technology · AI · Cloud · Security</p>
    </div>
  `;

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Send to Admin
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.ADMIN_EMAIL || 'oneklyx.labs@gmail.com',
        subject: `[OneKlyx] New Order ${order.referenceNumber} - ${order.projectTitle}`,
        html: emailContentAdmin
      });

      // Send Confirmation to Client
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: order.email,
        subject: `OneKlyx - Order Confirmed [Ref: ${order.referenceNumber}]`,
        html: emailContentClient
      });

      console.log(`[Email] Notifications sent successfully for ${order.referenceNumber}`);
    } catch (error) {
      console.error('[Email] Failed to send SMTP emails:', error);
    }
  } else {
    console.log('\n--- [MOCK EMAIL NOTIFICATION] ---');
    console.log(`Admin Recipient: ${process.env.ADMIN_EMAIL || 'oneklyx.labs@gmail.com'}`);
    console.log(`Subject: [OneKlyx] New Order ${order.referenceNumber}`);
    console.log(`Client Recipient: ${order.email}`);
    console.log('---------------------------------\n');
  }
};

// Helper to trigger Google Sheets webhook
const triggerSheetsWebhook = async (order) => {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('[Webhook] Google Sheets Webhook URL not set. Skipping.');
    return;
  }

  try {
    const payload = {
      timestamp: order.timestamp,
      referenceNumber: order.referenceNumber,
      fullName: order.fullName,
      email: order.email,
      whatsapp: order.whatsapp,
      company: order.company || '',
      projectType: order.projectType,
      budget: order.budget,
      projectTitle: order.projectTitle,
      projectDesc: order.projectDesc,
      deadline: order.deadline || '',
      techStack: order.techStack.join(', '),
      referenceLinks: order.referenceLinks.join(', '),
      fileName: order.uploadedFile ? order.uploadedFile.originalname : '',
      fileUrl: order.uploadedFile ? `http://localhost:${PORT}/uploads/${order.uploadedFile.filename}` : ''
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log(`[Webhook] Order ${order.referenceNumber} successfully synced to Google Sheets.`);
    } else {
      console.warn(`[Webhook] Webhook response returned status ${response.status}`);
    }
  } catch (error) {
    console.error('[Webhook] Failed to trigger Google Sheets webhook:', error);
  }
};

// Helper for WhatsApp Gateway or CLI logging
const triggerWhatsAppNotification = (order) => {
  const clientText = `Halo ${order.fullName}, terima kasih telah menghubungi OneKlyx! Pesanan proyek Anda "${order.projectTitle}" telah kami terima dengan nomor referensi ${order.referenceNumber}. Kami akan menghubungi Anda dalam waktu 24 jam.`;
  const adminText = `[OneKlyx Admin Alert] Pesanan baru masuk!\nRef: ${order.referenceNumber}\nNama: ${order.fullName}\nWhatsApp: ${order.whatsapp}\nProyek: ${order.projectTitle}\nBudget: ${order.budget}`;
  
  if (process.env.WHATSAPP_API_KEY) {
    // If user has WhatsApp API key configured, make an API request to their gateway
    console.log(`[WhatsApp Gateway] Sending notification via API for ${order.referenceNumber}...`);
    // Example fetch to Wablas/Fonnte goes here
  } else {
    console.log('\n--- [MOCK WHATSAPP NOTIFICATION] ---');
    console.log(`To Client (${order.whatsapp}): ${clientText}`);
    console.log(`To Admin (${process.env.WHATSAPP_PHONE_NUMBER || '6281234567890'}): ${adminText}`);
    console.log('-------------------------------------\n');
  }
};

// ============================================
// API ROUTES
// ============================================

// Submit Order Route
app.post('/api/orders', upload.single('file'), async (req, res) => {
  try {
    const {
      fullName,
      email,
      whatsapp,
      company,
      projectType,
      budget,
      projectTitle,
      projectDesc,
      deadline,
      referenceLinks,
      techStack
    } = req.body;

    // Generate unique reference number: OKX-YYYYMMDD-[4 Random Digits]
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `OKX-${today}-${randDigits}`;

    const orderData = {
      referenceNumber,
      timestamp: new Date().toISOString(),
      fullName,
      email,
      whatsapp,
      company: company || '',
      projectType,
      budget,
      projectTitle,
      projectDesc,
      deadline: deadline || '',
      referenceLinks: referenceLinks ? (Array.isArray(referenceLinks) ? referenceLinks : JSON.parse(referenceLinks)) : [],
      techStack: techStack ? (Array.isArray(techStack) ? techStack : JSON.parse(techStack)) : [],
      uploadedFile: req.file ? {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    };

    // Save to local database
    const saved = saveOrder(orderData);
    if (!saved) {
      return res.status(500).json({ success: false, message: 'Gagal menyimpan pesanan ke database.' });
    }

    // Trigger asynchronous notifications
    sendEmailNotifications(orderData).catch(err => console.error(err));
    triggerWhatsAppNotification(orderData);
    triggerSheetsWebhook(orderData).catch(err => console.error(err));

    // Construct direct WhatsApp chat text for the user on client-side redirect
    const waText = encodeURIComponent(`Halo OneKlyx, saya ingin menindaklanjuti pesanan saya dengan nomor referensi *${referenceNumber}*.`);
    const waChatUrl = `https://wa.me/${process.env.WHATSAPP_PHONE_NUMBER || '6281234567890'}?text=${waText}`;

    // Return response
    return res.status(201).json({
      success: true,
      message: 'Pesanan berhasil diserahkan.',
      referenceNumber,
      whatsappUrl: waChatUrl
    });

  } catch (error) {
    console.error('Error processing order submission:', error);
    return res.status(500).json({ success: false, message: error.message || 'Terjadi kesalahan pada server.' });
  }
});

// Error handling middleware for file upload issues
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: `Masalah upload file: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  OneKlyx Web Server running on: http://localhost:${PORT}`);
  console.log(`  Mode: Development / Production`);
  console.log(`==================================================`);
});
