const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import the database connection
const connectDB = require('./config/database');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import routes (check if these files exist)
let authRoutes, formsRoutes, responsesRoutes, publicRoutes;

try {
  authRoutes = require('./routes/auth');
} catch (e) {
  console.log('⚠️  auth.js routes not found, using fallback');
  authRoutes = express.Router();
  authRoutes.post('/register', (req, res) => res.json({ message: 'Register endpoint' }));
  authRoutes.post('/login', (req, res) => res.json({ message: 'Login endpoint' }));
}

try {
  formsRoutes = require('./routes/forms');
} catch (e) {
  console.log('⚠️  forms.js routes not found, using fallback');
  formsRoutes = express.Router();
  formsRoutes.get('/user/:userId', (req, res) => res.json({ message: 'Get user forms' }));
  formsRoutes.post('/create', (req, res) => res.json({ message: 'Create form' }));
}

try {
  responsesRoutes = require('./routes/responses');
} catch (e) {
  console.log('⚠️  responses.js routes not found, using fallback');
  responsesRoutes = express.Router();
  responsesRoutes.post('/:formId/submit', (req, res) => res.json({ message: 'Submit response' }));
}

try {
  publicRoutes = require('./routes/public');
} catch (e) {
  console.log('⚠️  public.js routes not found, using fallback');
  publicRoutes = express.Router();
  publicRoutes.get('/form/:formId', (req, res) => res.json({ message: 'Get public form' }));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formsRoutes);
app.use('/api/responses', responsesRoutes);
app.use('/api/public', publicRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FeedbackFuse API is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'FeedbackFuse API is working! 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'
  });
});

// List all available endpoints
app.get('/api', (req, res) => {
  const routes = [
    'GET  /api/health - Server health check',
    'GET  /api/test - Test endpoint',
    'GET  /api - List all endpoints',
    'POST /api/auth/register - User registration',
    'POST /api/auth/login - User login',
    'GET  /api/forms/user/:userId - Get user forms',
    'POST /api/forms/create - Create new form',
    'GET  /api/public/form/:formId - Get public form',
    'POST /api/responses/:formId/submit - Submit response'
  ];
  res.json({ 
    message: 'FeedbackFuse API - Available endpoints',
    endpoints: routes 
  });
});

// 404 handler - MUST be the last route
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'API endpoint not found',
    suggestion: 'Visit GET /api to see available endpoints'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('===================================');
  console.log('🚀 FeedbackFuse Server is running!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`💾 Database: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
  console.log('===================================');
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});