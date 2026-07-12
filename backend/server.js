import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Establish connection to MongoDB
connectDB();

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Base Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Fallback Middleware for Error and Route Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` AssetFlow Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});