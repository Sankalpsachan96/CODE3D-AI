import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { isDbOnline } from '../db.js';
import * as authController from '../controllers/authController.js';
import * as executionController from '../controllers/executionController.js';
import * as historyController from '../controllers/historyController.js';
import * as savedController from '../controllers/savedController.js';
import * as projectController from '../controllers/projectController.js';
import * as quizController from '../controllers/quizController.js';
import * as aiController from '../controllers/aiController.js';
import * as settingsController from '../controllers/settingsController.js';
import * as dsaController from '../controllers/dsaController.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = Router();

// ------------------------------------------------------------
// System
// ------------------------------------------------------------
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    online: true,
    database: isDbOnline(),
    supportedLanguages: ['java', 'python', 'cpp', 'c', 'javascript'],
    timestamp: new Date().toISOString(),
  });
});

// ------------------------------------------------------------
// Authentication
// ------------------------------------------------------------
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', optionalAuth, authController.logout);
router.get('/auth/me', requireAuth, authController.getMe);

// ------------------------------------------------------------
// Execution / analysis
// ------------------------------------------------------------
router.post('/executions/run', optionalAuth, executionController.runExecution);
router.post('/execute', optionalAuth, executionController.runExecution);
router.post('/execute/run', optionalAuth, executionController.runExecution);
router.post('/analyze', optionalAuth, executionController.analyzeCode);

// ------------------------------------------------------------
// AI Tutor
// ------------------------------------------------------------
router.post('/ai/explain', optionalAuth, aiController.explainContext);

// ------------------------------------------------------------
// Execution history
// ------------------------------------------------------------
router.post('/history/execution', requireAuth, historyController.createHistoryExecution);
router.get('/history', requireAuth, historyController.getHistory);
router.get('/history/:id', requireAuth, historyController.getHistoryItem);
router.delete('/history/:id', requireAuth, historyController.deleteHistoryItem);
router.delete('/history', requireAuth, historyController.clearHistory);

// ------------------------------------------------------------
// Projects
// ------------------------------------------------------------
router.get('/projects', requireAuth, projectController.getProjects);
router.get('/projects/:id', requireAuth, projectController.getProjectById);
router.post('/projects', requireAuth, projectController.createProject);
router.put('/projects/:id', requireAuth, projectController.updateProject);
router.delete('/projects/:id', requireAuth, projectController.deleteProject);

// ------------------------------------------------------------
// Saved visualizations
// ------------------------------------------------------------
router.get('/saved', requireAuth, savedController.getSavedList);
router.get('/saved/:id', requireAuth, savedController.getSavedItem);
router.post('/saved', requireAuth, savedController.createSaved);
router.put('/saved/:id', requireAuth, savedController.updateSaved);
router.delete('/saved/:id', requireAuth, savedController.deleteSaved);

// ------------------------------------------------------------
// Quiz
// ------------------------------------------------------------
router.get('/quiz/attempts', requireAuth, quizController.getQuizAttempts);
router.post('/quiz/attempts', requireAuth, quizController.recordQuizAttempt);

// Legacy quiz endpoint retained for existing frontend clients.
router.get('/quiz', optionalAuth, (req, res) => {
  res.json({ success: true, questions: [], conceptId: req.query.conceptId || 'general' });
});

// ------------------------------------------------------------
// DSA curriculum
// ------------------------------------------------------------
router.get('/dsa/topics', dsaController.getTopics);
router.get('/dsa/problems', dsaController.getProblems);
router.get('/dsa/problems/:slug', dsaController.getProblemBySlug);
router.get('/dsa/sheets', dsaController.getSheets);
router.get('/dsa/sheets/:slug', dsaController.getSheetBySlug);
router.get('/dsa/progress', requireAuth, dsaController.getProgress);
router.post('/dsa/progress', requireAuth, dsaController.updateProgress);

// ------------------------------------------------------------
// Dashboard / settings
// ------------------------------------------------------------
router.get('/dashboard/stats', optionalAuth, dashboardController.getDashboardStats);
router.get('/settings', requireAuth, settingsController.getSettings);
router.put('/settings', requireAuth, settingsController.updateSettings);

export default router;
