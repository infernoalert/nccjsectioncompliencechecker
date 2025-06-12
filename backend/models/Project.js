const mongoose = require('mongoose');
const { embeddedSchema: buildingFabricSchema } = require('./BuildingFabric');
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
  location: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Location is required'],
    validate: {
      validator: function(value) {
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
        if (value === null) return true;
        return value > 0;
      },
      message: 'Total area of habitable rooms must be a positive number for Class_2 and Class_4 buildings'
    }
  },
  buildingFabric: {
    type: buildingFabricSchema,
    default: () => ({
      walls: {
        external: {
          rValueByZone: new Map([
            ['zone1', 0],
            ['zone2', 0],
            ['zone3', 0],
            ['zone4', 0],
            ['zone5', 0],
            ['zone6', 0],
            ['zone7', 0],
            ['zone8', 0]
          ]),
          thermalBreaks: {
            metalFramed: false
          }
        }
      },
      roof: {
        rValueByZone: new Map([
          ['zone1', 0],
          ['zone2', 0],
          ['zone3', 0],
          ['zone4', 0],
          ['zone5', 0],
          ['zone6', 0],
          ['zone7', 0],
          ['zone8', 0]
        ]),
        solarAbsorptance: {
          max: 0.7,
          exemptZones: []
        },
        area: 0
      },
      floor: {
        rValueByZone: new Map([
          ['zone1', 0],
          ['zone2', 0],
          ['zone3', 0],
          ['zone4', 0],
          ['zone5', 0],
          ['zone6', 0],
          ['zone7', 0],
          ['zone8', 0]
        ]),
        area: 0
      },
      glazing: {
        external: {
          uValueByZone: new Map([
            ['zone1', 0],
            ['zone2', 0],
            ['zone3', 0],
            ['zone4', 0],
            ['zone5', 0],
            ['zone6', 0],
            ['zone7', 0],
            ['zone8', 0]
          ]),
          shgcByZone: new Map([
            ['zone1', 0],
            ['zone2', 0],
            ['zone3', 0],
            ['zone4', 0],
            ['zone5', 0],
            ['zone6', 0],
            ['zone7', 0],
            ['zone8', 0]
          ]),
          area: 0
        }
      }
    })
  },
  specialRequirements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpecialRequirement',
    required: false
  }],
  compliancePathway: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompliancePathway',
    required: false
  },
  electrical: {
    type: electricalSchema,
    default: function() {
      return {
        loads: [],
        energyMonitoring: [],
        complianceStatus: 'pending',
        lastAssessmentDate: new Date()
      };
    }
  },
  mcp: {
    type: mcpSchema,
    default: () => ({
      currentStep: 'initial',
      lastUpdated: new Date(),
      history: [],
      analysisResults: {
        status: 'pending',
        results: [],
        timestamp: new Date()
      },
      processingStatus: 'pending'
    })
  },
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
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
  diagram: {
    fileName: {
      type: String,
      default: null
    },
    lastModified: {
      type: Date,
      default: null
    },
    version: {
      type: Number,
      default: 1
    }
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
  next();
});

module.exports = mongoose.model('Project', projectSchema); 