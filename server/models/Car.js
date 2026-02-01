import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  productionYears: {
    type: [Number],
    required: true,
    validate: {
      validator: function(array) {
        return array && array.length > 0;
      },
      message: 'At least one production year is required'
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
carSchema.index({ brand: 1, model: 1 });

const Car = mongoose.model('Car', carSchema);

export default Car;
