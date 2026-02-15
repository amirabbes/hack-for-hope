const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/users', require('./routes/users'));

// Socket.IO
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Start with in-memory MongoDB
async function start() {
  try {
    // Fallback to In-Memory if no URI or if previous connection failed (simulated by just using memory for now as requested fix)
    console.log('Starting In-Memory MongoDB (Reliable Fallback)...');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    await mongoose.connect(uri);
    console.log('MongoDB connected (In-Memory)');

    // Seed a test user for immediate testing
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');

    const testUsers = [
      { email: 'mother@sos-tunisie.org', password: bcrypt.hashSync('test123', 10), role: 'mother' },
      { email: 'director@sos-tunisie.org', password: bcrypt.hashSync('test123', 10), role: 'director' },
      // Mahras
      { email: 'psycho.mahras1@sos-tunisie.org', password: bcrypt.hashSync('test123', 10), role: 'psychologist', village: 'Mahras' },
      { email: 'psycho.mahras2@sos-tunisie.org', password: bcrypt.hashSync('test123', 10), role: 'psychologist', village: 'Mahras' },
      // Gammarth
      { email: 'psycho.gammarth1@sos-tunisie.org', password: bcrypt.hashSync('test123', 10), role: 'psychologist', village: 'Gammarth' },
      { email: 'psycho.gammarth2@sos-tunisie.org', password: bcrypt.hashSync('test123', 10), role: 'psychologist', village: 'Gammarth' },
      // Siliana
      { email: 'psycho.siliana1@sos-tunisie.org', password: bcrypt.hashSync('test123', 10), role: 'psychologist', village: 'Siliana' },
      { email: 'psycho.siliana2@sos-tunisie.org', password: bcrypt.hashSync('test123', 10), role: 'psychologist', village: 'Siliana' },
      // Akouda
      { email: 'psycho.akouda1@sos-tunisie.org', password: bcrypt.hashSync('test123', 10), role: 'psychologist', village: 'Akouda' },
      { email: 'psycho.akouda2@sos-tunisie.org', password: bcrypt.hashSync('test123', 10), role: 'psychologist', village: 'Akouda' },
    ];

    for (const u of testUsers) {
      await User.findOneAndUpdate({ email: u.email }, u, { upsert: true });
    }
    console.log('Test users created:');
    console.log('  mother@sos-tunisie.org / test123');
    console.log('  psycho@sos-tunisie.org / test123');
    console.log('  director@sos-tunisie.org / test123');

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start:', err);
  }
}

start();