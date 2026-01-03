import Category from '../models/Category.js';

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single category by path
const getCategoryByPath = async (req, res) => {
  try {
    const { path } = req.params;
    const category = await Category.findOne({ path, isActive: true });
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.json({ success: true, category });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    const { text, path } = req.body;
    
    // Check if category with same path already exists
    const existingCategory = await Category.findOne({ path });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category with this path already exists' });
    }
    
    const newCategory = new Category({
      text,
      path
    });
    
    await newCategory.save();
    res.status(201).json({ success: true, category: newCategory });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, path, isActive } = req.body;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    // Check if path is being changed and if new path already exists
    if (path && path !== category.path) {
      const existingCategory = await Category.findOne({ path, _id: { $ne: id } });
      if (existingCategory) {
        return res.status(400).json({ success: false, message: 'Category with this path already exists' });
      }
    }
    
    // Update fields
    if (text !== undefined) category.text = text;
    if (path !== undefined) category.path = path;
    if (isActive !== undefined) category.isActive = isActive;
    
    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete category (soft delete)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    category.isActive = false;
    await category.save();
    
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export {
  getCategories,
  getCategoryByPath,
  createCategory,
  updateCategory,
  deleteCategory
};
