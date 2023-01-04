import { Router } from 'express';
import AuthorizationRouter from './auth.route';

const router = Router();

router.use( AuthorizationRouter );

export default router;
