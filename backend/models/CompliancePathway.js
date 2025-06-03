const mongoose = require('mongoose');

// Base schema for compliance pathway properties
const compliancePathwayBaseSchema = {
  applicability: {
    type: String
  },
  verification: {
    type: String
  },
  requirements: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
};

// Schema for embedded use (no required fields)
const embeddedCompliancePathwaySchema = new mongoose.Schema(compliancePathwayBaseSchema, { _id: false });

// Schema for standalone use (with additional fields)
const standaloneCompliancePathwaySchema = new mongoose.Schema({
  ...compliancePathwayBaseSchema,
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
  applicability: {
    type: String,
    required: [true, 'Please add applicability information']
  },
  verification: {
    type: String,
    required: [true, 'Please add verification method']
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp before saving
standaloneCompliancePathwaySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for standalone schema
standaloneCompliancePathwaySchema.index({ name: 1 });

// Export both schemas and the model
module.exports = {
  embeddedSchema: embeddedCompliancePathwaySchema,
  schema: standaloneCompliancePathwaySchema,
  model: mongoose.model('CompliancePathway', standaloneCompliancePathwaySchema)
}; 