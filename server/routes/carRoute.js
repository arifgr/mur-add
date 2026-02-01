import express from 'express';
import {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar
} from '../controllers/carController.js';
import authSeller from '../middlewares/authSeller.js';

const router = express.Router();

// Public routes
router.get('/', getCars);
router.get('/:id', getCarById);

// Admin routes (protected with seller authentication)
router.post('/', authSeller, createCar);
router.put('/:id', authSeller, updateCar);
router.delete('/:id', authSeller, deleteCar);

export default router;
