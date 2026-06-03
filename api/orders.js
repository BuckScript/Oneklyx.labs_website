const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

// Vercel serverless handler
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
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

    // Basic validation
    if (!fullName || !email || !whatsapp || !projectTitle) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Setup Supabase client (server-side service role key)
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'public';

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ success: false, message: 'Supabase configuration missing' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    // Generate reference number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `OKX-${today}-${rand}`;
    const timestamp = new Date().toISOString();

    // Upload file to Supabase Storage if provided
    let fileUrl = null;
    let storedFileName = null;
    if (fileData && fileName) {
      const buffer = Buffer.from(fileData, 'base64');
      const path = `proposals/${referenceNumber}-${Date.now()}-${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(path, buffer, { contentType: fileType, upsert: false });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return res.status(500).json({ success: false, message: 'Failed to upload file' });
      }

      // Get public URL
      const { data: publicData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
      fileUrl = publicData.publicUrl;
      storedFileName = path;
    }

    // Insert order into Supabase Postgres
    const orderRow = {
      reference_number: referenceNumber,
      timestamp,
      full_name: fullName,
      email,
      whatsapp,
      company: company || '',
      project_type: projectType,
      budget: budget || '',
      project_title: projectTitle,
      project_desc: projectDesc || '',
      deadline: deadline || null,
      reference_links: referenceLinks || [],
      tech_stack: techStack || [],
      file_name: fileName || null,
      file_url: fileUrl || null
    };

    const { data: insertData, error: insertError } = await supabase
      .from('orders')
      .insert([orderRow])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return res.status(500).json({ success: false, message: 'Failed to save order' });
    }

    // Send emails (SMTP configured via env)
    const isSmtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
    const emailContentAdmin = `
      <h2>New Project Order Received!</h2>
      <p><strong>Reference Number:</strong> ${referenceNumber}</p>
      <p><strong>Client Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>WhatsApp:</strong> ${whatsapp}</p>
      <p><strong>Company/Institution:</strong> ${company || '-'}</p>
      <hr />
      <p><strong>Project Type:</strong> ${projectType}</p>
      <p><strong>Budget Range:</strong> ${budget}</p>
      <p><strong>Project Title:</strong> ${projectTitle}</p>
      <p><strong>Description:</strong></p>
      <blockquote style="background:#f4f4f4; padding:15px; border-left:5px solid #0066ff;">
        ${projectDesc ? projectDesc.replace(/\n/g, '<br>') : '-'}
      </blockquote>
      <p><strong>Target Deadline:</strong> ${deadline || '-'}</p>
      <p><strong>Tech Stack Preference:</strong> ${Array.isArray(techStack) ? techStack.join(', ') : techStack}</p>
      <p><strong>Reference Links:</strong> ${Array.isArray(referenceLinks) ? referenceLinks.join(', ') : referenceLinks}</p>
      <p><strong>Uploaded File:</strong> ${fileUrl ? `<a href="${fileUrl}">${fileName}</a>` : 'None'}</p>
    `;

    const emailContentClient = `
      <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e2e8f0; border-radius:8px;">
        <h2 style="color:#0066ff;">Order Received 🎉</h2>
        <p>Dear ${fullName},</p>
        <p>Thank you for reaching out to <strong>OneKlyx</strong>! We have received your project inquiry.</p>
        <div style="background:#f8fafc; padding:15px; border-radius:6px; margin:20px 0;">
          <p style="margin:0;"><strong>Reference Number:</strong> ${referenceNumber}</p>
          <p style="margin:5px 0 0 0;"><strong>Project Title:</strong> ${projectTitle}</p>
          <p style="margin:5px 0 0 0;"><strong>Project Type:</strong> ${projectType}</p>
        </div>
        <p>Our team is currently reviewing your requirements. We will contact you via WhatsApp or email within the next <strong>24 hours</strong> to discuss details and schedule a free consultation.</p>
        <p>If you have any quick updates, feel free to chat with us directly on WhatsApp using this reference number: <a href="https://wa.me/${process.env.WHATSAPP_PHONE_NUMBER || '6281234567890'}?text=Hi%20OneKlyx%2C%20my%20order%20reference%20is%20${referenceNumber}">Chat on WhatsApp</a>.</p>
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

        // Send to admin
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: process.env.ADMIN_EMAIL || process.env.SMTP_FROM,
          subject: `[OneKlyx] New Order ${referenceNumber} - ${projectTitle}`,
          html: emailContentAdmin
        });

        // Send to client
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: email,
          subject: `OneKlyx - Order Confirmed [Ref: ${referenceNumber}]`,
          html: emailContentClient
        });
      } catch (err) {
        console.error('Email sending failed:', err);
      }
    } else {
      console.log('[Email] SMTP not configured. Skipping actual send.');
    }

    // Google Sheets webhook
    if (process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceNumber,
            timestamp,
            fullName,
            email,
            whatsapp,
            company,
            projectType,
            budget,
            projectTitle,
            projectDesc,
            deadline,
            techStack,
            referenceLinks,
            fileName,
            fileUrl
          })
        });
      } catch (err) {
        console.error('Webhook failed:', err);
      }
    }

    // WhatsApp URL
    const waText = encodeURIComponent(`Halo OneKlyx, saya ingin menindaklanjuti pesanan saya dengan nomor referensi *${referenceNumber}*.`);
    const waChatUrl = `https://wa.me/${process.env.WHATSAPP_PHONE_NUMBER || '6281234567890'}?text=${waText}`;

    return res.status(201).json({ success: true, referenceNumber, whatsappUrl: waChatUrl });

  } catch (error) {
    console.error('Order handling error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
