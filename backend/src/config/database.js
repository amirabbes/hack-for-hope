// Database configuration
module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/sos-tunisie',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
};