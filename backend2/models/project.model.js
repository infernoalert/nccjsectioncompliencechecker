const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  location: {
    state: {
      type: String,
      required: [true, 'State is required']
    },
    postcode: {
      type: String,
      required: [true, 'Postcode is required']
    },
    suburb: {
      type: String,
      required: [true, 'Suburb is required']
    }
  },
  buildingClass: {
    type: String,
    required: [true, 'Building class is required'],
    enum: ['Class_1', 'Class_2', 'Class_3', 'Class_4', 'Class_5', 
           'Class_6', 'Class_7', 'Class_8', 'Class_9', 'Class_10']
  },
  climateZone: {
    type: String,
    required: [true, 'Climate zone is required']
  },
  totalArea: {
    type: Number,
    required: [true, 'Total area is required'],
    min: [0, 'Total area must be positive']
  },
  totalAreaHabitableRooms: {
    type: Number,
    required: [true, 'Total area of habitable rooms is required'],
    min: [0, 'Total area of habitable rooms must be positive']
  },
  annualHeatingDegreeHours: {
    type: Number,
    required: [true, 'Annual heating degree hours is required']
  },
  annualCoolingDegreeHours: {
    type: Number,
    required: [true, 'Annual cooling degree hours is required']
  },
  annualDehumidificationGramHours: {
    type: Number,
    required: [true, 'Annual dehumidification gram hours is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for efficient querying
projectSchema.index({ buildingClass: 1, climateZone: 1 });

module.exports = mongoose.model('Project', projectSchema); 