const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // --- Level 1: Sup'Hope fields ---
  anonymous: { type: Boolean, default: false },
  program: { type: String, required: true },
  village: {
    type: String,
    enum: ['Mahras', 'Gammarth', 'Siliana', 'Akouda'],
    required: true
  },
  abuserFirstName: String,
  abuserLastName: String,
  childFirstName: { type: String, required: true },
  childLastName: { type: String, required: true },
  incidentDescription: String,
  incidentType: {
    type: String,
    enum: ['health', 'behavior', 'violence', 'neglect', 'sexual', 'other'],
    required: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  aiAnalysis: {
    risk: String,
    confidence: Number,
    details: Object
  },
  attachments: [String],
  pdfPath: String,

  // --- Status tracking ---
  status: {
    type: String,
    enum: ['en_attente', 'en_cours', 'fausse_signalement', 'cloture', 'overdue'],
    default: 'en_attente'
  },

  // --- Level 2: Psychologue fields ---
  classification: {
    type: String,
    enum: ['sauvegarde', 'prise_en_charge', 'faux', null],
    default: null
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  confidentialNotes: String,
  deadline: Date, // Strict 24h timer for 'sauvegarde'

  // --- Workflow procedure (7 steps - Strict) ---
  workflow: {
    ficheInitiale: { completed: { type: Boolean, default: false }, date: Date, document: String },
    rapportDPE: { completed: { type: Boolean, default: false }, date: Date, document: String, notifiedDirector: { type: Boolean, default: false } },
    evaluationComplete: { completed: { type: Boolean, default: false }, date: Date, document: String },
    planAction: { completed: { type: Boolean, default: false }, date: Date, document: String },
    rapportSuivi: { completed: { type: Boolean, default: false }, date: Date, document: String },
    rapportFinal: { completed: { type: Boolean, default: false }, date: Date, document: String },
    avisCloture: { completed: { type: Boolean, default: false }, date: Date, document: String }
  },

  // --- Level 3: Director fields ---
  directorDecision: {
    type: String,
    enum: ['prise_en_charge', 'sanction', 'suivi', 'archive', null],
    default: null
  },
  archived: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

reportSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Report', reportSchema);