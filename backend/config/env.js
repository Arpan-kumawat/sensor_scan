require('dotenv').config();

const parseOrigins = (value) =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const isProduction = process.env.NODE_ENV === 'production';

const localOrigins = [
  'http://localhost:5173',
  'https://localhost:5173',
  'http://127.0.0.1:5173',
  'https://127.0.0.1:5173',
];

const clientOrigins = parseOrigins(process.env.CLIENT_URL);

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  allowedOrigins: isProduction
    ? [...new Set([...clientOrigins])]
    : [...new Set([...clientOrigins, ...localOrigins])],
};

const validateEnv = () => {
  const missing = [];

  if (!config.mongoUri) missing.push('MONGO_URI');
  if (isProduction && config.allowedOrigins.length === 0) {
    missing.push('CLIENT_URL');
  }

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
};

module.exports = { config, validateEnv };
