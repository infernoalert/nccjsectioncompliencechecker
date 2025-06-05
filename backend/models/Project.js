const mongoose = require('mongoose');
const { embeddedSchema: buildingFabricSchema } = require('./BuildingFabric');
const { embeddedSchema: buildingClassSchema } = require('./BuildingClass');
const { embeddedSchema: specialRequirementSchema } = require('./SpecialRequirement');
const { embeddedSchema: compliancePathwaySchema } = require('./CompliancePathway');
const { embeddedSchema: electricalSchema } = require('./Electrical');
const { embeddedSchema: mcpSchema } = require('./mcp');
const { embeddedSchema: fileSchema } = require('./File');


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
    type: buildingClassSchema,
    default: () => ({})
  },
  location: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Location is required'],
    validate: {
      validator: function(value) {
        // Allow both string and object values
        return typeof value === 'string' || (typeof value === 'object' && value !== null);
      },
      message: 'Location must be either a string or an object'
    }
  },
  climateZone: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Climate zone is required'],
    validate: {
      validator: function(value) {
        // Allow both string and object values
        return typeof value === 'string' || (typeof value === 'object' && value !== null);
      },
      message: 'Climate zone must be either a string or an object'
    }
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
        // If the value is null, it's valid (for non-Class_2 and non-Class_4 buildings)
        if (value === null) return true;
        
        // For Class_2 and Class_4 buildings, the value must be a positive number
        return value > 0;
      },
      message: 'Total area of habitable rooms must be a positive number for Class_2 and Class_4 buildings'
    }
  },
  buildingFabric: {
    type: buildingFabricSchema,
    default: () => ({})
  },
  specialRequirements: {
    type: [specialRequirementSchema],
    default: []
  },
  compliancePathway: {
    type: compliancePathwaySchema,
    default: () => ({})
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
  },
  electrical: {
    type: electricalSchema,
    default: () => ({})
  },
  mcp: {
    type: mcpSchema,
    default: () => ({})
  },
  files: [fileSchema]
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