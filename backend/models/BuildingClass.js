const mongoose = require('mongoose');

const BuildingClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  subtypes: {
    type: Map,
    of: new mongoose.Schema({
      requirements: [String],
      thermal_performance: Boolean,
      energy_usage: Boolean,
      hvac: Boolean,
      special_requirements: Boolean,
      compliance_pathways: [String],
      special_requirements: {
        type: Map,
        of: String
      },
      applicable_clauses: [String]
    }, { _id: false }),
    default: {}
  },
  climateZones: {
    type: Map,
    of: new mongoose.Schema({
      type: String,
      insulation: String,
      wall_r_value: String,
      roof_r_value: String,
      glazing: {
        shgc: Number,
        u_value: Number
      }
    }, { _id: false }),
    default: {}
  },
  sizeBasedProvisions: {
    type: Map,
    of: new mongoose.Schema({
      max_area: Number,
      min_area: Number,
      provisions: String
    }, { _id: false }),
    default: {}
  },
  compliancePathways: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
BuildingClassSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
BuildingClassSchema.index({ name: 1 });
BuildingClassSchema.index({ 'climateZones.type': 1 });

module.exports = mongoose.model('BuildingClass', BuildingClassSchema); 