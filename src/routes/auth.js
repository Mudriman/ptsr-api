import express from 'express';
import { register, login } from '../controllers/auth.js';
import { validate } from '../middleware/validate.js';
import { authSchema } from '../validation/schemas.js';
import crypto from 'crypto';

const router = express.Router();

router.post('/register', validate(authSchema), register);
router.post('/login', validate(authSchema), login);


export default router;