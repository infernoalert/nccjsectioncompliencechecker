const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buildingType: {
    type: String,
    required: [true, 'Building type is required']
  },
  buildingClassification: {
    type: {
      classification: String,
      description: String,
      typicalUse: String,
      commonFeatures: [String],
      notes: String
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  climateZone: {
    type: String,
    required: [true, 'Climate zone is required']
  },
  floorArea: {
    type: Number,
    required: [true, 'Floor area is required'],
    min: [0, 'Floor area must be greater than 0']
  },
  buildingFabric: {
    type: {
      walls: {
        type: {
          material: String,
          thickness: Number,
          rValue: Number
        }
      },
      roof: {
        type: {
          material: String,
          thickness: Number,
          rValue: Number
        }
      },
      floor: {
        type: {
          material: String,
          thickness: Number,
          rValue: Number
        }
      },
      windows: {
        type: {
          material: String,
          thickness: Number,
          uValue: Number
        }
      }
    }
  },
  specialRequirements: {
    type: [{
      type: {
        type: String,
        enum: ['fire', 'accessibility', 'acoustic', 'energy', 'other']
      },
      description: String,
      status: {
        type: String,
        enum: ['pending', 'compliant', 'non_compliant'],
        default: 'pending'
      }
    }]
  },
  compliancePathway: {
    type: {
      type: String,
      enum: ['performance', 'prescriptive', 'deemed_to_satisfy']
    },
    description: String,
    status: {
      type: String,
      enum: ['pending', 'compliant', 'non_compliant'],
      default: 'pending'
    }
  },
  complianceStatus: {
    type: String,
    enum: ['pending', 'compliant', 'non_compliant'],
    default: 'pending'
  },
  lastAssessmentDate: {
    type: Date
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

// Create indexes
projectSchema.index({ owner: 1 });

// Pre-save middleware to automatically set size based on floor area
projectSchema.pre('save', function(next) {
  if (this.floorArea) {
    if (this.floorArea < 500) {
      this.size = 'small';
    } else if (this.floorArea >= 500 && this.floorArea <= 2500) {
      this.size = 'medium';
    } else {
      this.size = 'large';
    }
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema); 