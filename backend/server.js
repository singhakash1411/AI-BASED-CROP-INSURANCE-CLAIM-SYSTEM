const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Create Express app
const app = express();

// Global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Body parser with increased limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enable CORS
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!require('fs').existsSync(uploadDir)) {
  require('fs').mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the frontend directory
const frontendPath = path.join(__dirname, '../frontend');
console.log('Frontend directory path:', frontendPath);
app.use(express.static(frontendPath));

// Connect to database
let isDbConnected = false;
const initDB = async () => {
  try {
    isDbConnected = await connectDB();
    if (!isDbConnected) {
      console.error('Warning: Running without database connection. Only static files will be served.');
    }
  } catch (error) {
    console.error('Database connection error:', error);
  }
};
initDB();

// API Routes - Only mount if database is connected
app.use('/api/*', (req, res, next) => {
  if (!isDbConnected) {
    return res.status(503).json({ 
      success: false, 
      error: 'Database connection is not available' 
    });
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// Mount API routers with try-catch blocks
try {
  app.use('/api/v1/auth', require('./routes/auth'));
  app.use('/api/v1/farmers', require('./routes/farmers'));
  app.use('/api/v1/policies', require('./routes/policies'));
  app.use('/api/v1/claims', require('./routes/claims'));
  app.use('/api/v1/insurance', require('./routes/insurance'));
} catch (error) {
  console.error('Error mounting routes:', error);
}

// Serve HTML files
const serveHTML = (fileName) => (req, res) => {
  try {
    const filePath = path.join(frontendPath, fileName);
    console.log('Attempting to serve:', filePath);
    res.sendFile(filePath);
  } catch (error) {
    console.error(`Error serving ${fileName}:`, error);
    res.status(500).send('Error serving file');
  }
};

// HTML routes
app.get('/', serveHTML('new.html'));
app.get('/register', serveHTML('register.html'));
app.get('/login', serveHTML('login.html'));
app.get('/insurance-form', serveHTML('insurance_form.html'));

// Handle all other routes
app.get('*', (req, res) => {
  try {
    if (req.url.endsWith('.html')) {
      const htmlFile = path.join(frontendPath, req.url);
      return res.sendFile(htmlFile);
    }
    res.sendFile(path.join(frontendPath, 'new.html'));
  } catch (error) {
    console.error('Error handling route:', error);
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Don't exit the process on database errors
  if (!err.message.includes('MongoDB')) {
    server.close(() => process.exit(1));
  }
}); 