import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';   // ADD
import categoryRoutes from './routes/categoryRoutes.js';       // ADD
import viewRoutes from './routes/viewRoutes.js'; 

// ES Modules directory resolution fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables prior to database execution
dotenv.config();

// Establish connection to MongoDB cluster
connectDB();

const app = express();

// Configure EJS view engine parameters to accurately target the local workspace architecture
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Core parsing and static file routing middleware packages
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Mount API Rest Handlers
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/departments', departmentRoutes);   // ADD
app.use('/api/categories', categoryRoutes);      // ADD

// Mount Frontend Template Interface Routers
app.use('/', viewRoutes);

// App Base Health Verification Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Structural Fallback Middleware Layers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` AssetFlow Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});