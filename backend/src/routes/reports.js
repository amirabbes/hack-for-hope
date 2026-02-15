const express = require('express');
const router = express.Router();
const rc = require('../controllers/reportController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Level 1: Déclarant
router.post('/create', upload.array('attachments'), rc.createReport);
router.get('/my-reports', rc.getMyReports);

// Level 2: Psychologue
router.get('/prioritized', rc.getPrioritizedReports);
router.put('/:id/classify', rc.classifyReport);
router.put('/:id/workflow/:step', upload.single('document'), rc.updateWorkflowStep);
router.put('/:id/notes', rc.updateConfidentialNotes);

// Level 3: Director
router.get('/final', rc.getFinalReports);
router.get('/by-village', rc.getReportsByVillage);
router.put('/:id/decision', rc.makeDecision);

// AI Analysis
router.post('/analyze', rc.analyzeText);

module.exports = router;