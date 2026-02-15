const Report = require('../models/Report');
const User = require('../models/User');
const { extractTextFromPDF, generatePDFFromText, combinePDFs } = require('../services/pdfService');
const aiService = require('../services/aiService');

// --- Level 1: Create Report ---
exports.createReport = async (req, res) => {
  try {
    const {
      program, // = Village
      childFirstName, childLastName,
      incidentType, urgency, incidentDescription,
      anonymous, abuserFirstName, abuserLastName
    } = req.body;

    const village = program; // In Sup'Hope logic, program IS the village
    if (!['Mahras', 'Gammarth', 'Siliana', 'Akouda'].includes(village)) {
      return res.status(400).json({ message: 'Invalid village selected' });
    }

    // 1. Handle attachments (mock processing)
    const attachments = req.files ? req.files.map(f => f.path) : [];

    // 2. AI Analysis (Media & Text)
    // Pass the full file objects to AI service
    const aiAnalysis = await aiService.analyzeMedia(req.files || []);

    // AI Urgency Prediction (Replacing manual selection)
    const aiResult = await aiService.predictUrgency(incidentDescription);
    const aiUrgency = aiResult.risk;

    const pdfPath = await generatePDFFromText(
      `SIGNALEMENT: ${childFirstName} ${childLastName}\n\n` +
      `TYPE: ${incidentType} | URGENCE (IA): ${aiUrgency}\n` +
      `DESCRIPTION: ${incidentDescription}\n\n` +
      `ANALYSE MEDIA IA: ${aiAnalysis}`
    );

    // 3. Auto-assign to a psychologist in that village (Round-robin or Random)
    // Find all psychs in village
    const psychs = await User.find({ role: 'psychologist', village: village });
    let assignedTo = null;
    if (psychs.length > 0) {
      // Simple random assignment for now
      assignedTo = psychs[Math.floor(Math.random() * psychs.length)]._id;
    }

    // 4. Create Report
    const report = new Report({
      program,
      village,
      childFirstName,
      childLastName,
      incidentType,
      incidentDescription,
      urgency: aiUrgency, // AI Determined
      aiAnalysis: aiResult,
      anonymous: anonymous === 'true',
      abuserFirstName,
      abuserLastName,
      attachments,
      pdfPath,
      assignedTo,
      status: 'en_attente'
    });

    await report.save();

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('new-report', { childName: childFirstName, urgency: aiUrgency, village });
    }

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Level 1: Get My Reports ---
exports.getMyReports = async (req, res) => {
  try {
    // In a real app we'd filter by creator ID. 
    // For demo/MVP, we return all reports for 'mother' role or specific user logic.
    // Assuming we want to show all reports created by this user session (if we tracked creator).
    // For now, let's return all for "history" view purposes in demo.
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Level 2: Get Prioritized Reports (Queue) ---
exports.getPrioritizedReports = async (req, res) => {
  try {
    // Should filter by assignedTo = req.user._id in production
    // For demo, we return all or filter by village if user has one
    let filter = { status: { $in: ['en_attente', 'en_cours', 'overdue'] } };

    // Check overdue deadlines dynamically? 
    // Ideally this is a background job, but we can do a quick check here
    const now = new Date();
    await Report.updateMany(
      { status: 'en_cours', deadline: { $lt: now } },
      { status: 'overdue' }
    );

    const reports = await Report.find(filter).sort({
      urgency: -1, // Critical first
      createdAt: 1 // Oldest first
    });

    // Custom sort order for urgency enum string if needed, 
    // but typically we'd map enum to numbers.
    // Let's rely on basic sort for now or re-sort in memory
    const urgencyWeight = { critical: 4, high: 3, medium: 2, low: 1 };
    reports.sort((a, b) => urgencyWeight[b.urgency] - urgencyWeight[a.urgency]);

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Level 2: Classify Report ---
exports.classifyReport = async (req, res) => {
  try {
    const { classification } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.classification = classification;

    if (classification === 'sauvegarde') {
      report.status = 'en_cours';
      // Set 24h deadline
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 24);
      report.deadline = deadline;
    } else {
      // Prise en charge OR Faux signalement -> Clôture immédiate
      report.status = 'cloture';
      report.deadline = null;
    }

    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Level 2: Update Workflow Step ---
exports.updateWorkflowStep = async (req, res) => {
  try {
    const { step } = req.params;
    const report = await Report.findById(req.params.id);

    // Strict Workflow Logic
    const stepsOrder = [
      'ficheInitiale', 'rapportDPE', 'evaluationComplete',
      'planAction', 'rapportSuivi', 'rapportFinal', 'avisCloture'
    ];

    const stepIndex = stepsOrder.indexOf(step);
    if (stepIndex === -1) return res.status(400).json({ message: 'Invalid step' });

    // Enforce File Upload
    if (!req.file) {
      return res.status(400).json({ message: 'Un document justificatif est OBLIGATOIRE pour valider cette étape.' });
    }

    // 1. Check strict order: Previous step must be completed
    if (stepIndex > 0) {
      const prevStep = stepsOrder[stepIndex - 1];
      if (!report.workflow[prevStep].completed) {
        return res.status(400).json({ message: `L'étape précédente (${prevStep}) n'est pas terminée.` });
      }
    }

    // 2. Mark completed
    report.workflow[step].completed = true;
    report.workflow[step].date = new Date();
    // Use actual uploaded file path
    report.workflow[step].document = req.file.path;

    // 3. Special Actions based on step
    if (step === 'rapportDPE') {
      report.workflow[step].notifiedDirector = true;
      // Trigger Notification to Director (Socket.IO)
      const io = req.app.get('io');
      if (io) io.emit('director-alert', { message: `Rapport DPE soumis pour ${report.childFirstName}`, reportId: report._id });
    }

    // 4. If Final Step (avisCloture) done -> Close report
    if (step === 'avisCloture') {
      report.status = 'cloture';
    }

    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateConfidentialNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    await Report.findByIdAndUpdate(req.params.id, { confidentialNotes: notes });
    res.json({ message: 'Notes updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// --- Level 3: Get Final Reports ---
exports.getFinalReports = async (req, res) => {
  try {
    // Directors see reports that are classified (even if closed) or needing decision
    // Also include overdue reports
    const reports = await Report.find({
      $or: [
        { classification: { $ne: null } },
        { status: 'overdue' }
      ]
    }).sort({ updatedAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Level 3: Get Village Stats ---
exports.getReportsByVillage = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: "$village", // Group by village
          total: { $sum: 1 },
          critical: {
            $sum: { $cond: [{ $eq: ["$urgency", "critical"] }, 1, 0] }
          },
          enAttente: {
            $sum: { $cond: [{ $eq: ["$status", "en_attente"] }, 1, 0] }
          },
          enCours: {
            $sum: { $cond: [{ $eq: ["$status", "en_cours"] }, 1, 0] }
          },
          cloture: {
            $sum: { $cond: [{ $eq: ["$status", "cloture"] }, 1, 0] }
          }
        }
      }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Level 3: Make Decision ---
exports.makeDecision = async (req, res) => {
  try {
    const { decision } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.directorDecision = decision;
    if (decision === 'archive') {
      report.archived = true;
    }

    // Ensure it is closed if decision is made (if not already)
    report.status = 'cloture';

    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.analyzeText = async (req, res) => {
  try {
    const { text } = req.body;
    const result = await aiService.predictUrgency(text);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'AI Analysis Failed' });
  }
};