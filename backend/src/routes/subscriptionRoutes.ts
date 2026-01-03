import { Router } from 'express';
import { subscriptionController } from '../controllers/subscriptionController';
import { supabaseAuth } from '../middleware/auth';

const router = Router();

router.get('/plans', subscriptionController.getPlans);

router.get('/me', supabaseAuth, subscriptionController.getUserSubscription);

router.post('/checkout', supabaseAuth, subscriptionController.checkout);

router.post('/cancel', supabaseAuth, subscriptionController.cancelSubscription);

router.get('/features/:featureName/check', supabaseAuth, subscriptionController.checkFeatureAccess);

router.get('/features/:featureName/limit', supabaseAuth, subscriptionController.getFeatureLimit);

export default router;
