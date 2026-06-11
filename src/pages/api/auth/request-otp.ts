export const prerender = false;

import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { db } from '../../../lib/firebase';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const csrfTokenHeader = request.headers.get('x-csrf-token');
    const csrfTokenCookie = cookies.get('csrf_token')?.value;

    if (!csrfTokenHeader || !csrfTokenCookie || csrfTokenHeader !== csrfTokenCookie) {
      return new Response(JSON.stringify({ error: 'CSRF token mismatch' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const adminEmail = import.meta.env.ADMIN_EMAIL;
    const jwtSecret = import.meta.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    
    if (!adminEmail) {
      console.warn("ADMIN_EMAIL is not set in environment variables.");
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // In a real production scenario with SMTP configured:
    const smtpHost = import.meta.env.SMTP_HOST;
    if (smtpHost) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(import.meta.env.SMTP_PORT || '587'),
        secure: import.meta.env.SMTP_PORT === '465',
        auth: {
          user: import.meta.env.SMTP_USER,
          pass: import.meta.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Admin Dashboard" <${import.meta.env.SMTP_USER}>`,
        to: adminEmail,
        subject: 'Admin Panel OTP',
        text: `Hey DineshReddy&Co your otp for admin panel is ${otp} -by Autcust`,
        html: `<p>Hey DineshReddy&Co your otp for admin panel is <strong>${otp}</strong> -by Autcust</p>`,
      });
    } else {
      // Fallback for development/testing if SMTP is not configured
      console.log('====================================');
      console.log(`DEVELOPMENT MODE - OTP for ${adminEmail}: ${otp}`);
      console.log('====================================');
    }

    // Save OTP to Firebase
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await db.collection('otps').doc(adminEmail).set({
      otp,
      expiresAt
    });

    return new Response(JSON.stringify({ success: true, message: 'OTP sent' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Request OTP Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

