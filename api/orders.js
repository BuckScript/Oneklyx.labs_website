const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const path = require('path');

// ============================================
// VALIDATORS & HELPERS
// ============================================

function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 255;
}

function validateWhatsApp(whatsapp) {
  // Indonesia format: +62, 62, or 08 followed by 8-13 digits
  const waRegex = /^(\+62|62|08)[0-9]{8,13}$/;
  const cleaned = whatsapp.replace(/[\s-]/g, '');
  return waRegex.test(cleaned);
}

function sanitizeFileName(fileName) {
  // Remove path traversal attempts and keep only alphanumeric, dots, hyphens
  return path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message, ...data };
  console.log(JSON.stringify(logEntry));
}

// ============================================
// VERCEL SERVERLESS HANDLER
// ============================================

module.exports = async (req, res) => {
  // Enforce CORS & method
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    log('WARN', 'Invalid HTTP method', { method: req.method });
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

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
      techStack,
      fileData,
      fileName,
      fileType
    } = req.body;

    // ---- Validate required fields ----
    if (!fullName || !email || !whatsapp || !projectTitle) {
      log('ERROR', 'Missing required fields', { fullName: !!fullName, email: !!email, whatsapp: !!whatsapp, projectTitle: !!projectTitle });
      return res.status(400).json({ success: false, message: 'Kolom wajib diisi: nama, email, WhatsApp, judul proyek' });
    }

    // ---- Validate email format ----
    if (!validateEmail(email)) {
      log('ERROR', 'Invalid email format', { email });
      return res.status(400).json({ success: false, message: 'Format email tidak valid' });
    }

    // ---- Validate WhatsApp format (Indonesia) ----
    if (!validateWhatsApp(whatsapp)) {
      log('ERROR', 'Invalid WhatsApp format', { whatsapp });
      return res.status(400).json({ success: false, message: 'Format WhatsApp tidak valid. Gunakan +62 atau 08 diikuti 8-13 angka' });
    }

    // ---- Check Supabase configuration ----
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'public';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      log('ERROR', 'Supabase not configured', { hasUrl: !!SUPABASE_URL, hasKey: !!SUPABASE_SERVICE_ROLE_KEY });
      return res.status(500).json({ success: false, message: 'Konfigurasi server tidak lengkap. Hubungi admin' });
    }

    // ---- Validate file payload size (max 3MB to be safe) ----
    const maxPayloadSize = 3 * 1024 * 1024; // 3MB
    if (fileData && fileData.length > maxPayloadSize) {
      log('WARN', 'File payload exceeds limit', { size: fileData.length, limit: maxPayloadSize });
      return res.status(413).json({ success: false, message: 'File terlalu besar. Maksimal 3MB setelah encode' });
    }

    // ---- Validate file properties if present ----
    if (fileData && fileName) {
      const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg'];
      if (!allowedMimeTypes.includes(fileType)) {
        log('ERROR', 'Invalid file MIME type', { fileType, allowed: allowedMimeTypes });
        return res.status(400).json({ success: false, message: 'Format file tidak didukung. Gunakan PDF, PNG, atau JPG' });
      }
    }

    // ---- Initialize Supabase client ----
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    // ---- Generate reference number ----
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `OKX-${today}-${rand}`;
    const timestamp = new Date().toISOString();

    log('INFO', 'Processing order', { referenceNumber, email, whatsapp: whatsapp.substring(0, 5) + '***' });

    // ---- Upload file to Supabase Storage if provided ----
    let fileUrl = null;
    let storedFileName = null;
    if (fileData && fileName) {
      try {
        const buffer = Buffer.from(fileData, 'base64');
        const sanitizedName = sanitizeFileName(fileName);
        const storagePath = `proposals/${referenceNumber}-${Date.now()}-${sanitizedName}`;

        log('INFO', 'Starting file upload', { fileName: sanitizedName, size: buffer.length });

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(SUPABASE_BUCKET)
          .upload(storagePath, buffer, { contentType: fileType, upsert: false });

        if (uploadError) {
          log('ERROR', 'Supabase storage upload failed', { error: uploadError.message, code: uploadError.status });
          return res.status(500).json({ success: false, message: 'Gagal upload file ke storage. Coba lagi' });
        }

        // Get public URL
        const { data: publicData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(storagePath);
        fileUrl = publicData.publicUrl;
        storedFileName = storagePath;

        log('INFO', 'File uploaded successfully', { fileUrl });
      } catch (err) {
        log('ERROR', 'File upload exception', { error: err.message });
        return res.status(500).json({ success: false, message: 'Kesalahan saat upload file' });
      }
    }

    // ---- Insert order into Supabase Postgres ----
    try {
      const orderRow = {
        reference_number: referenceNumber,
        timestamp,
        full_name: escapeHtml(fullName),
        email: email.toLowerCase(),
        whatsapp: whatsapp.replace(/\s/g, ''),
        company: company ? escapeHtml(company) : null,
        project_type: escapeHtml(projectType || ''),
        budget: escapeHtml(budget || ''),
        project_title: escapeHtml(projectTitle),
        project_desc: projectDesc ? escapeHtml(projectDesc) : null,
        deadline: deadline || null,
        reference_links: referenceLinks && Array.isArray(referenceLinks) ? referenceLinks.map(l => escapeHtml(l)) : [],
        tech_stack: techStack && Array.isArray(techStack) ? techStack.map(t => escapeHtml(t)) : [],
        file_name: fileName ? sanitizeFileName(fileName) : null,
        file_url: fileUrl || null
      };

      log('INFO', 'Inserting order into database', { referenceNumber });

      const { data: insertData, error: insertError } = await supabase
        .from('orders')
        .insert([orderRow])
        .select()
        .single();

      if (insertError) {
        log('ERROR', 'Database insert failed', { error: insertError.message, code: insertError.code });
        return res.status(500).json({ success: false, message: 'Gagal menyimpan pesanan ke database' });
      }

      log('INFO', 'Order saved successfully', { orderId: insertData?.id, referenceNumber });
    } catch (err) {
      log('ERROR', 'Database insert exception', { error: err.message });
      return res.status(500).json({ success: false, message: 'Kesalahan saat menyimpan pesanan' });
    }

    // ---- Send emails ----
    const isSmtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM && process.env.ADMIN_EMAIL;

    const emailContentAdmin = `
      <h2>New Project Order Received!</h2>
      <p><strong>Reference Number:</strong> ${escapeHtml(referenceNumber)}</p>
      <p><strong>Client Name:</strong> ${escapeHtml(fullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>
      <p><strong>Company/Institution:</strong> ${company ? escapeHtml(company) : '-'}</p>
      <hr />
      <p><strong>Project Type:</strong> ${escapeHtml(projectType)}</p>
      <p><strong>Budget Range:</strong> ${escapeHtml(budget)}</p>
      <p><strong>Project Title:</strong> ${escapeHtml(projectTitle)}</p>
      <p><strong>Description:</strong></p>
      <blockquote style="background:#f4f4f4; padding:15px; border-left:5px solid #0066ff; white-space: pre-wrap; word-wrap: break-word;">
        ${projectDesc ? escapeHtml(projectDesc).replace(/\n/g, '<br>') : '-'}
      </blockquote>
      <p><strong>Target Deadline:</strong> ${deadline ? escapeHtml(deadline) : '-'}</p>
      <p><strong>Tech Stack Preference:</strong> ${Array.isArray(techStack) && techStack.length > 0 ? techStack.map(t => escapeHtml(t)).join(', ') : '-'}</p>
      <p><strong>Reference Links:</strong> ${Array.isArray(referenceLinks) && referenceLinks.length > 0 ? referenceLinks.map(l => escapeHtml(l)).join(', ') : '-'}</p>
      <p><strong>Uploaded File:</strong> ${fileUrl ? `<a href="${fileUrl}">${escapeHtml(fileName || 'Download')}</a>` : 'None'}</p>
    `;

    const emailContentClient = `
      <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e2e8f0; border-radius:8px;">
        <h2 style="color:#0066ff;">Pesanan Diterima 🎉</h2>
        <p>Halo ${escapeHtml(fullName)},</p>
        <p>Terima kasih telah menghubungi <strong>OneKlyx</strong>! Kami telah menerima permintaan proyek Anda.</p>
        <div style="background:#f8fafc; padding:15px; border-radius:6px; margin:20px 0;">
          <p style="margin:0;"><strong>Nomor Referensi:</strong> ${escapeHtml(referenceNumber)}</p>
          <p style="margin:5px 0 0 0;"><strong>Judul Proyek:</strong> ${escapeHtml(projectTitle)}</p>
          <p style="margin:5px 0 0 0;"><strong>Jenis Proyek:</strong> ${escapeHtml(projectType)}</p>
        </div>
        <p>Tim kami sedang meninjau kebutuhan Anda. Kami akan menghubungi Anda melalui WhatsApp atau email dalam waktu <strong>24 jam</strong> untuk membahas detail dan menjadwalkan konsultasi gratis.</p>
        <p>Jika ada update cepat, silakan chat dengan kami langsung di WhatsApp dengan nomor referensi ini: <a href="https://wa.me/${process.env.WHATSAPP_PHONE_NUMBER || '6281234567890'}?text=Halo%20OneKlyx%2C%20nomor%20referensi%20pesanan%20saya%20adalah%20${referenceNumber}">Chat di WhatsApp</a>.</p>
        <br>
        <p>Salam,</p>
        <p><strong>Tim OneKlyx</strong><br>Technology · AI · Cloud · Security</p>
      </div>
    `;

    if (isSmtpConfigured) {
      try {
        log('INFO', 'Preparing email delivery', { adminEmail: process.env.ADMIN_EMAIL, clientEmail: email });

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: parseInt(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          },
          connectionTimeout: 5000,
          socketTimeout: 5000
        });

        // Send to admin
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: process.env.ADMIN_EMAIL,
          subject: `[OneKlyx] Pesanan Baru ${referenceNumber} - ${escapeHtml(projectTitle)}`,
          html: emailContentAdmin
        });

        log('INFO', 'Admin email sent', { to: process.env.ADMIN_EMAIL });

        // Send to client
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: email,
          subject: `OneKlyx - Pesanan Dikonfirmasi [Ref: ${referenceNumber}]`,
          html: emailContentClient
        });

        log('INFO', 'Client confirmation email sent', { to: email });
      } catch (err) {
        log('ERROR', 'Email sending failed', { error: err.message, stage: 'SMTP' });
        // Don't fail the order if email fails - still return success
      }
    } else {
      log('WARN', 'SMTP not fully configured', { hasHost: !!process.env.SMTP_HOST, hasUser: !!process.env.SMTP_USER, hasPass: !!process.env.SMTP_PASS, hasFrom: !!process.env.SMTP_FROM, hasAdmin: !!process.env.ADMIN_EMAIL });
    }

    // ---- Trigger Google Sheets webhook ----
    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        log('INFO', 'Sending to Google Sheets', { webhookUrl: process.env.GOOGLE_SHEETS_WEBHOOK_URL.substring(0, 50) + '...' });

        const response = await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceNumber,
            timestamp,
            fullName: escapeHtml(fullName),
            email,
            whatsapp,
            company: company ? escapeHtml(company) : '',
            projectType: escapeHtml(projectType),
            budget: escapeHtml(budget),
            projectTitle: escapeHtml(projectTitle),
            projectDesc: projectDesc ? escapeHtml(projectDesc) : '',
            deadline: deadline || '',
            techStack: techStack ? techStack.join(', ') : '',
            referenceLinks: referenceLinks ? referenceLinks.join(', ') : '',
            fileName: fileName ? sanitizeFileName(fileName) : '',
            fileUrl: fileUrl || ''
          }),
          timeout: 10000
        });

        if (response.ok) {
          log('INFO', 'Google Sheets webhook sent successfully', { referenceNumber });
        } else {
          log('WARN', 'Google Sheets webhook returned non-200 status', { status: response.status });
        }
      } catch (err) {
        log('ERROR', 'Google Sheets webhook failed', { error: err.message });
        // Don't fail order if webhook fails
      }
    }

    // ---- Generate WhatsApp chat URL ----
    const waText = encodeURIComponent(`Halo OneKlyx, saya ingin menindaklanjuti pesanan saya dengan nomor referensi *${referenceNumber}*.`);
    const waChatUrl = `https://wa.me/${process.env.WHATSAPP_PHONE_NUMBER}?text=${waText}`;

    log('INFO', 'Order processed successfully', { referenceNumber, email, fileUrl: !!fileUrl });

    return res.status(201).json({
      success: true,
      referenceNumber,
      whatsappUrl: waChatUrl,
      message: 'Pesanan berhasil diterima. Silakan tunggu konfirmasi dari tim kami.'
    });

  } catch (error) {
    log('ERROR', 'Unhandled exception in order handler', { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: 'Kesalahan server. Silakan coba lagi nanti.' });
  }
};
