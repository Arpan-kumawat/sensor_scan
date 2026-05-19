const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');
const { config, validateEnv } = require('./config/env');
const sensorRoutes = require('./routes/sensorRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { apiLimiter } = require('./middleware/rateLimiter');

validateEnv();

const app = express();

if (config.isProduction) {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (config.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (!config.isProduction) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: config.nodeEnv,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.json({
    name: 'Sensor Inventory API',
    health: '/api/health',
    docs: 'See README for API routes',
  });
});

app.use('/api/sensors', sensorRoutes);
app.use(notFound);
app.use(errorHandler);

let server;

const startServer = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('Connected to MongoDB');

    server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} (${config.nodeEnv})`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
