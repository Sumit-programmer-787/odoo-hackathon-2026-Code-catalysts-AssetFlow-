import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// 1. ROUTE IMPORTS
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';   // ADD
import categoryRoutes from './routes/categoryRoutes.js';       // ADD
import viewRoutes from './routes/viewRoutes.js'; 

// Resolve directory paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Establish connection to MongoDB
connectDB();

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

//  FIXED INTERFACE ROUTING FOR /frontend/views DIRECTORY
app.set('view engine', 'ejs');

// Yeh line backend se bahar nikal kar frontend/views folder ko pakdegi
app.set('views', path.resolve(__dirname, '../frontend/views'));
app.use(express.static(path.resolve(__dirname, '../frontend/public')));
// ---  WEB APP INTERFACE ROUTING ---

// Root Gate: Landing Portal Authentication Screen
app.get('/', (req, res) => {
  res.render('index', { title: 'AssetFlow ERP | System Authentication' });
});

// Operations Console Dashboard Route
app.get('/terminal', (req, res) => {
  res.render('terminal');
});

// Master Registry Directory Grid Route
app.get('/directory', (req, res) => {
  // Pass an empty array as fallback if database metrics aren't populated yet
  res.render('directory', { assets: [] }); 
});

// Logistics Timeline Bookings Router Links
app.get('/resources-1', (req, res) => {
  res.render('resources-1');
});

app.get('/resources-2', (req, res) => {
  res.render('resources-2');
});

// Telemetry 3D Pipeline Visualization Link
app.get('/process', (req, res) => {
  res.render('process');
});

//  SYSTEM SESSION DESTRUCTION ROUTINE (Our new logout feature!)
app.get('/logout', (req, res) => {
  res.clearCookie('token'); 
  res.redirect('/');
});


// 2. BACKEND API ROUTE MOUNTING
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/departments', departmentRoutes);   // ADD
app.use('/api/categories', categoryRoutes);      // ADD

// Base Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Fallback Middleware for Error and Route Handling (MUST stay at the bottom)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` AssetFlow Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});