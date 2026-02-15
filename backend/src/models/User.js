const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@sos-tunisie\.org$/, 'Please use a @sos-tunisie.org email']
  },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['mother', 'tante', 'educator', 'psychologist', 'director'],
    required: true
  },
  village: {
    type: String,
    enum: ['Mahras', 'Gammarth', 'Siliana', 'Akouda', null],
    default: null
  },
  authCode: { type: String },
  authCodeExpires: { type: Date },
});

module.exports = mongoose.model('User', userSchema);