import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import Routes
import sharedRoutes from './routes/shared.routes';
import superadminRoutes from './routes/superadmin.routes';
import adminRoutes from './routes/admin.routes';
import customerRoutes from './routes/customer.routes';

// Import Middleware
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse incoming request JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check / Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Laptop Recommendation Aggregator API (SPK)',
    timestamp: new Date()
  });
});

// Register Role-Based API Routes
app.use('/api/shared', sharedRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);

// Catch-All 404 Route
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.url}`
  });
});

// Register Global Error Handler Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
