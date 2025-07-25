// routes/admin.js
import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import {
  getAllUsers,
  getUserTests,
  deleteUser,
  makeAdmin,
  getStats,
} from '../controllers/admin.js';

const router = express.Router();
router.use(authMiddleware, adminMiddleware);

router.get('/users', getAllUsers);
router.delete('/user/:id', deleteUser);
router.post('/make-admin', makeAdmin);
router.get('/user/:id/tests', getUserTests);
router.get('/stats', getStats);

export default router;
