import Car from '../models/Car.js';

// Get all cars
const getCars = async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json({ success: true, cars });
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single car by ID
const getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id);
    
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    
    res.json({ success: true, car });
  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create new car
const createCar = async (req, res) => {
  try {
    const { brand, model, productionYears } = req.body;
    
    // Check if any car with same brand, model and any overlapping productionYears exists
    const existingCar = await Car.findOne({ 
      brand, 
      model,
      productionYears: { $in: productionYears } 
    });
    if (existingCar) {
      return res.status(400).json({ success: false, message: 'A car with the same brand, model, and production years already exists' });
    }
    
    const newCar = new Car({
      brand,
      model,
      productionYears
    });
    
    await newCar.save();
    res.status(201).json({ success: true, car: newCar });
  } catch (error) {
    console.error('Error creating car:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update car
const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand, model, productionYears } = req.body;
    
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    
    // Check if another car with same brand, model and any overlapping productionYears exists
    const checkBrand = brand !== undefined ? brand : car.brand;
    const checkModel = model !== undefined ? model : car.model;
    const checkYears = productionYears !== undefined ? productionYears : car.productionYears;
    
    const existingCar = await Car.findOne({ 
      brand: checkBrand,
      model: checkModel,
      productionYears: { $in: checkYears },
      _id: { $ne: id } 
    });
    if (existingCar) {
      return res.status(400).json({ success: false, message: 'A car with the same brand, model, and production years already exists' });
    }
    
    // Update fields
    if (brand !== undefined) car.brand = brand;
    if (model !== undefined) car.model = model;
    if (productionYears !== undefined) car.productionYears = productionYears;
    
    await car.save();
    res.json({ success: true, car });
  } catch (error) {
    console.error('Error updating car:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete car
const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    
    const car = await Car.findByIdAndDelete(id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    
    res.json({ success: true, message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar
};
