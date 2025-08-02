import express from 'express';
import { register, login, requestPasswordReset, resetPassword } from '../controllers/auth.js';
import { validate } from '../middleware/validate.js';
import { authSchema, requestResetSchema, resetPasswordSchema } from '../validation/schemas.js';

const router = express.Router();

router.post('/register', validate(authSchema, { checkEmailUnique: true }), register);
router.post('/login', validate(authSchema, { checkUserExists: true, checkPassword: true }), login);
router.post('/request-reset', validate(requestResetSchema), requestPasswordReset);
router.post('/reset-password', validate(resetPasswordSchema, { checkResetToken: true }), resetPassword);


export default router;