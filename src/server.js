import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { ErrorHandler } from './middlewares/index.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { validateEnv } from './config/env.js';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnv();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
};

app.use(cors(corsOptions));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'UPT-PIK Backend API',
    version: '1.0.0',
  });
});

// Routes
app.use('/api', apiLimiter);
app.use('/api', routes);

// Error handling
app.use(ErrorHandler.notFound);
app.use(ErrorHandler.handle);

// Function untuk start traditional server
const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║   🚀 Server UPT-PIK Backend           ║
║                                       ║
║   Port: ${PORT}                          ║
║   Environment: ${process.env.NODE_ENV || 'development'}            ║
║   URL: http://localhost:${PORT}          ║
║   API: http://localhost:${PORT}/api      ║
║                                       ║
╚═══════════════════════════════════════╝
      `);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Promise Rejection:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

startServer();

// Export app untuk serverless platforms (Vercel, Netlify, AWS Lambda, dll)
export default app;
