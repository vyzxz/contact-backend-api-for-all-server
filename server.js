import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createOwnerEmailTemplate, createUserEmailTemplate } from './utils/emailTemplates.js';

// Load environment variables first
dotenv.config();

const app = express();
app.set('trust proxy', 1);

// ========================
// SECURITY CONFIGURATION
// ========================

// Enhanced Helmet configuration
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  })
);

// Enhanced CORS for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://www.vyzx.live', 'https://vyzx.live'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Pre-flight requests
app.options('*', cors(corsOptions));

// Enhanced Rate Limiting
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 10, // Stricter in production
  message: {
    success: false,
    error: 'Too many contact form submissions. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // General API limit
  message: {
    success: false,
    error: 'Too many requests from this IP.',
  }
});

// Apply rate limiting
app.use('/api/contact', contactLimiter);
app.use('/api/', generalLimiter);

// ========================
// BODY PARSING & SECURITY
// ========================

// Enhanced body parsing with size limits
app.use(express.json({ 
  limit: '1mb', // Reduced from 10mb for security
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb',
  parameterLimit: 10 // Prevent parameter pollution
}));

// Remove X-Powered-By header
app.disable('x-powered-by');

// ========================
// EMAIL CONFIGURATION
// ========================

// Enhanced email transporter with retry logic
const createTransporter = (retryCount = 0) => {
  const maxRetries = 3;
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zoho.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
    tls: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 15000,
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
  });

  // Add retry mechanism
  transporter.verify().catch(async (error) => {
    if (retryCount < maxRetries) {
      console.warn(`Email verification failed, retrying... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
      return createTransporter(retryCount + 1);
    }
    throw error;
  });

  return transporter;
};

// ========================
// VALIDATION & SANITIZATION
// ========================

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .substring(0, 1000); // Limit length
};

const validateContactForm = (data) => {
  const errors = {};
  const sanitizedData = {};

  // Sanitize all inputs
  sanitizedData.name = sanitizeInput(data.name);
  sanitizedData.email = sanitizeInput(data.email);
  sanitizedData.subject = sanitizeInput(data.subject);
  sanitizedData.message = sanitizeInput(data.message);

  // Validation rules
  if (!sanitizedData.name || sanitizedData.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!sanitizedData.email || !emailRegex.test(sanitizedData.email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!sanitizedData.subject || sanitizedData.subject.length < 3) {
    errors.subject = 'Subject must be at least 3 characters';
  }

  if (!sanitizedData.message || sanitizedData.message.length < 10) {
    errors.message = 'Message must be at least 10 characters';
  }

  // Check for potential spam
  if (sanitizedData.message.length > 500) {
    errors.message = 'Message is too long (max 500 characters)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};

// ========================
// MIDDLEWARE
// ========================

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Security headers middleware
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ========================
// ROUTES
// ========================

// Health check with system info
app.get('/api/health', (req, res) => {
  const healthCheck = {
    success: true,
    message: '🚀 VYZ Portfolio API is running smoothly',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      email: 'Ready',
      database: 'Not required',
      rateLimiting: 'Active',
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    }
  };

  res.json(healthCheck);
});

// Test email configuration
app.get('/api/test-email', async (req, res) => {
  try {
    const transporter = createTransporter();
    await transporter.verify();

    res.json({
      success: true,
      message: '✅ Email configuration is correct and ready to send emails!',
      service: process.env.SMTP_HOST,
      user: process.env.EMAIL_USER?.replace(/.(?=.{4})/g, '*') // Mask email
    });
  } catch (error) {
    console.error('Email test failed:', error);

    res.status(500).json({
      success: false,
      message: '❌ Email configuration error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Check server logs',
      code: error.code
    });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
        errors: {
          name: !name ? 'Name is required' : '',
          email: !email ? 'Email is required' : '',
          subject: !subject ? 'Subject is required' : '',
          message: !message ? 'Message is required' : '',
        },
      });
    }

    // Validate and sanitize form data
    const validation = validateContactForm({ name, email, subject, message });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Please fix the validation errors',
        errors: validation.errors,
      });
    }

    const { sanitizedData } = validation;
    const transporter = createTransporter();

    // Prepare emails
    const ownerMail = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      replyTo: sanitizedData.email,
      subject: `🎯 New Portfolio Lead: ${sanitizedData.subject}`,
      html: createOwnerEmailTemplate(sanitizedData),
      text: `
NEW CONTACT FORM SUBMISSION
───────────────────────────
Name: ${sanitizedData.name}
Email: ${sanitizedData.email}
Subject: ${sanitizedData.subject}
Message: ${sanitizedData.message}
───────────────────────────
Received: ${new Date().toLocaleString()}
IP: ${req.ip}
      `.trim(),
    };

    const userMail = {
      from: process.env.EMAIL_FROM,
      to: sanitizedData.email,
      subject: '🎉 Thank You for Contacting VYZ Portfolio!',
      html: createUserEmailTemplate(sanitizedData),
      text: `
Thank you for contacting VYZ Portfolio!

Hi ${sanitizedData.name},

We've received your message and will get back to you within 24 hours.

Message Details:
• Subject: ${sanitizedData.subject}
• Submitted: ${new Date().toLocaleString()}

We're excited to discuss your project!

Best regards,
VYZ Team
      `.trim(),
    };

    // Send emails with timeout
    const emailPromise = Promise.all([
      transporter.sendMail(ownerMail),
      transporter.sendMail(userMail),
    ]);

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout')), 30000);
    });

    const [ownerResult, userResult] = await Promise.race([emailPromise, timeoutPromise]);
    const processingTime = Date.now() - startTime;

    // Log successful submission
    console.log(`✅ Contact form submitted - ${sanitizedData.email} - ${processingTime}ms`);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully! Check your email for confirmation.',
      data: {
        messageId: ownerResult.messageId,
        userMessageId: userResult.messageId,
        timestamp: new Date().toISOString(),
        processingTime: `${processingTime}ms`
      },
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Contact form error:', error);

    // Enhanced error handling
    let userMessage = 'Failed to send message. Please try again later.';
    let statusCode = 500;

    if (error.message.includes('timeout')) {
      userMessage = 'Request timeout. Please try again.';
    } else if (error.code === 'EAUTH') {
      userMessage = 'Email service temporarily unavailable.';
      statusCode = 503;
    } else if (error.code === 'EENVELOPE') {
      userMessage = 'Invalid email address. Please check and try again.';
      statusCode = 400;
    } else if (error.code === 'ECONNECTION') {
      userMessage = 'Connection error. Please try again later.';
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      message: userMessage,
      processingTime: `${processingTime}ms`,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// ========================
// ERROR HANDLING
// ========================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '🔍 Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Global Error Handler:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(error.errors).map(e => e.message)
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // Default error response
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error
    })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Starting graceful shutdown...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Starting graceful shutdown...');
  process.exit(0);
});

// ========================
// SERVER STARTUP
// ========================

const PORT = process.env.PORT || 3001;

// Validate required environment variables
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM', 'EMAIL_TO'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Please check your .env file');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`
✨ VYZ PORTFOLIO BACKEND - PRODUCTION READY
───────────────────────────────────────────
📍 Port: ${PORT}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
📧 Email Service: ${process.env.SMTP_HOST}
🕒 Started: ${new Date().toISOString()}

📋 ENDPOINTS:
   • GET  /api/health      - Health check
   • GET  /api/test-email  - Email test
   • POST /api/contact     - Contact form

🔒 SECURITY FEATURES:
   ✅ Enhanced CORS
   ✅ Rate Limiting
   ✅ Helmet Security
   ✅ Input Sanitization
   ✅ Request Logging
   ✅ Error Handling

🚀 Server ready: http://localhost:${PORT}
───────────────────────────────────────────
  `);
});


export default app;

