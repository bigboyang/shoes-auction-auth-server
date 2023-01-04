import { Router } from 'express';
import AuthRouter from './auth.route';

const router = Router();

router.use( AuthRouter );

export default router;
