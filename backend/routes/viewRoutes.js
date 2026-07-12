import express from 'express';
import Asset from '../models/Asset.js';

const router = express.Router();

// Root route redirects to directory path index
router.get('/', (req, res) => {
  res.redirect('/directory');
});

// Route handler for login interface
router.get('/login', (req, res) => {
  res.render('index', { title: 'Sign In — AssetFlow' });
});

// Dynamic Asset Registry Matrix View Loader supporting automated query filters
router.get('/directory', async (req, res, next) => {
  try {
    const { assetTag, serialNumber, category, status, location } = req.query;
    let queryFilter = {};

    // Generate dynamic regular expression criteria matching input vectors
    if (assetTag) queryFilter.assetTag = { $regex: assetTag, $options: 'i' };
    if (serialNumber) queryFilter.serialNumber = { $regex: serialNumber, $options: 'i' };
    if (location) queryFilter.location = { $regex: location, $options: 'i' };
    if (category && category !== 'All Categories') queryFilter.category = category;
    if (status && status !== 'Any Status') queryFilter.status = status;

    // Fetch corresponding models directly from MongoDB
    const assets = await Asset.find(queryFilter);

    res.render('directory', { 
      title: 'Asset Master Registry', 
      assets 
    });
  } catch (error) {
    next(error);
  }
});

// Static placeholder structures pointing cleanly to remaining frontend files
router.get('/process', (req, res) => { res.render('process', { title: 'Operational Process Desk' }); });
router.get('/resources-1', (req, res) => { res.render('resources-1', { title: 'Resource Matrix Alpha' }); });
router.get('/resources-2', (req, res) => { res.render('resources-2', { title: 'Resource Matrix Beta' }); });
router.get('/terminal', (req, res) => { res.render('terminal', { title: 'System Tracking Console' }); });

export default router;