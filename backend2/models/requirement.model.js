const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Requirement code is required'],
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Requirement title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Requirement description is required']
  },
  conditions: {
    buildingClass: {
      type: [String],
      required: true,
      enum: ['Class_1', 'Class_2', 'Class_3', 'Class_4', 'Class_5', 
             'Class_6', 'Class_7', 'Class_8', 'Class_9', 'Class_10', '0']
    },
    climateZone: {
      type: [String],
      required: true,
      enum: ['1', '2', '3', '4', '5', '6', '7', '8', '0']
    },
    totalArea: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 0
      }
    },
    totalAreaHabitableRooms: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 0
      }
    }
  },
  calculations: [{
    name: {
      type: String,
      required: true
    },
    formula: {
      type: String,
      required: true
    },
    parameters: [{
      name: {
        type: String,
        required: true
      },
      source: {
        type: String,
        required: true,
        enum: ['project', 'climate_data', 'calculation']
      },
      description: String
    }]
  }],
  complianceCriteria: [{
    parameter: {
      type: String,
      required: true
    },
    operator: {
      type: String,
      required: true,
      enum: ['>', '<', '>=', '<=', '==', '!=']
    },
    value: {
      type: Number,
      required: true
    }
  }],
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
requirementSchema.index({ code: 1 });
requirementSchema.index({ 'conditions.buildingClass': 1 });
requirementSchema.index({ 'conditions.climateZone': 1 });

module.exports = mongoose.model('Requirement', requirementSchema); 