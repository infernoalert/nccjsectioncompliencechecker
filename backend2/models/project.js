const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buildingType: {
    type: String,
    required: [true, 'Building type is required'],
    enum: ['residential', 'commercial', 'industrial', 'mixed-use']
  },
  buildingClassification: {
    type: {
      classification: {
        type: String,
        required: true,
        enum: ['Class_1', 'Class_2', 'Class_3', 'Class_4', 'Class_5', 'Class_6', 'Class_7', 'Class_8', 'Class_9', 'Class_10']
      },
      description: String,
      typicalUse: String,
      commonFeatures: [String],
      notes: String
    },
    required: true
  },
  location: {
    type: {
      address: String,
      state: String,
      postcode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    required: true
  },
  climateZone: {
    type: String,
    required: [true, 'Climate zone is required'],
    ref: 'ClimateZone'
  },
  floorArea: {
    type: Number,
    required: [true, 'Floor area is required'],
    min: [0, 'Floor area must be greater than 0']
  },
  totalAreaOfHabitableRooms: {
    type: Number,
    min: [0, 'Total area of habitable rooms must be greater than or equal to 0'],
    default: null,
    validate: {
      validator: function(value) {
        if (value === null) return true;
        return value > 0;
      },
      message: 'Total area of habitable rooms must be a positive number for Class_2 and Class_4 buildings'
    }
  },
  buildingFabric: {
    type: {
      walls: {
        type: {
          material: String,
          thickness: Number,
          rValue: Number,
          uValue: Number
        }
      },
      roof: {
        type: {
          material: String,
          thickness: Number,
          rValue: Number,
          uValue: Number
        }
      },
      floor: {
        type: {
          material: String,
          thickness: Number,
          rValue: Number,
          uValue: Number
        }
      },
      windows: {
        type: {
          material: String,
          thickness: Number,
          uValue: Number,
          shgc: Number,
          visibleTransmittance: Number
        }
      }
    }
  },
  specialRequirements: {
    type: [{
      type: {
        type: String,
        enum: ['fire', 'accessibility', 'acoustic', 'energy', 'other'],
        required: true
      },
      description: String,
      status: {
        type: String,
        enum: ['pending', 'compliant', 'non_compliant'],
        default: 'pending'
      },
      reference: String,
      notes: String
    }]
  },
  complianceStatus: {
    type: String,
    enum: ['pending', 'compliant', 'non_compliant'],
    default: 'pending'
  },
  lastAssessmentDate: {
    type: Date
  },
  assessmentHistory: [{
    date: Date,
    status: String,
    notes: String,
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes
projectSchema.index({ owner: 1 });
projectSchema.index({ buildingType: 1 });
projectSchema.index({ 'buildingClassification.classification': 1 });
projectSchema.index({ climateZone: 1 });
projectSchema.index({ complianceStatus: 1 });

// Virtual for project size
projectSchema.virtual('size').get(function() {
  if (this.floorArea < 500) return 'small';
  if (this.floorArea <= 2500) return 'medium';
  return 'large';
});

// Pre-save middleware
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if project is compliant
projectSchema.methods.isCompliant = function() {
  return this.complianceStatus === 'compliant';
};

// Method to update compliance status
projectSchema.methods.updateComplianceStatus = function(status, userId, notes) {
  this.complianceStatus = status;
  this.lastAssessmentDate = new Date();
  this.assessmentHistory.push({
    date: new Date(),
    status: status,
    notes: notes,
    assessedBy: userId
  });
};

module.exports = mongoose.model('Project', projectSchema); 