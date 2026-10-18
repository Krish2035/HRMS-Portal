import { Router } from 'express';
import { ScimController } from './scim.controller';

const router = Router();

// SCIM 2.0 Identity Directory Synchronization Routes
router.get('/ServiceProviderConfig', ScimController.getServiceProviderConfig);
router.get('/Users', ScimController.listUsers);
router.post('/Users', ScimController.createUser);
router.patch('/Users/:id', ScimController.patchUser);

export default router;
