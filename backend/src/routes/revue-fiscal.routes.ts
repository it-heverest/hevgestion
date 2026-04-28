import { Router } from 'express';
import { RevueFiscalController } from '../controllers/revue-fiscal.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new RevueFiscalController();

// All routes require authentication
router.use(authenticate);

// Get all companies with stats
router.get('/companies', controller.getCompanies.bind(controller));

// Create a new company
router.post('/companies', controller.createCompany.bind(controller));

// Get a specific company with question states
router.get('/companies/:id', controller.getCompany.bind(controller));

// Update a company
router.put('/companies/:id', controller.updateCompany.bind(controller));

// Delete a company
router.delete('/companies/:id', controller.deleteCompany.bind(controller));

// Update a single question state
router.post('/question-states', controller.updateQuestionState.bind(controller));

// Bulk update question states
router.post('/question-states/bulk', controller.bulkUpdateQuestionStates.bind(controller));

// Get company statistics
router.get('/stats', controller.getCompanyStats.bind(controller));

export default router;