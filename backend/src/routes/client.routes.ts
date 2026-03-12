// // src/routes/client.routes.ts
// import { Router } from 'express';
// import { clientController } from '../controllers/client.controller';
// import { authenticate } from '../middleware/auth.middleware';
// import { validate } from '../middleware/validation.middleware';
// import { createClientSchema } from '../validators/client.validator';

// const router = Router();

// router.get('/', authenticate, clientController.getClients);
// router.get('/:id', authenticate, clientController.getClientById);
// router.post('/', authenticate, validate(createClientSchema), clientController.createClient);
// router.put('/:id', authenticate, clientController.updateClient);

// export default router;


// src/routes/client.routes.ts
import { Router } from 'express';
import { clientController } from '../controllers/client.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.middleware';
import { cacheService } from '../services/redis.service';
import { 
  createClientSchema, 
  updateClientSchema 
} from '../validators/client.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Cache key generators
const getClientsCacheKey = (req: any) => cacheService.key.clients(req.user?.userId || 'all');
const getClientCacheKey = (req: any) => cacheService.key.client(req.params.id);

// Client routes with caching
router.get('/', cacheMiddleware(getClientsCacheKey, cacheService.TTL.SHORT), clientController.getClients);
router.get('/countries', clientController.getCountries);

// Invalidate client cache on mutations
router.post('/', invalidateCache(['clients:*', 'users:*']), validate(createClientSchema), clientController.createClient);
router.get('/:id', cacheMiddleware(getClientCacheKey, cacheService.TTL.SHORT), clientController.getClientById);
router.put('/:id', invalidateCache(['clients:*', 'users:*']), validate(updateClientSchema), clientController.updateClient);
router.delete('/:id', invalidateCache(['clients:*', 'users:*']), clientController.deleteClient);
router.get('/:id/users', clientController.getClientUsers);

export default router;