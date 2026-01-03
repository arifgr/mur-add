import express from 'express';
import {
  getCategories,
  getCategoryByPath,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import authSeller from '../middlewares/authSeller.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:path', getCategoryByPath);

// Admin routes (protected with seller authentication)
router.post('/', authSeller, createCategory);
router.put('/:id', authSeller, updateCategory);
router.delete('/:id', authSeller, deleteCategory);

export default router;
