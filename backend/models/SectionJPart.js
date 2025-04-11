const mongoose = require('mongoose');

const sectionJPartSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    enum: ['partJ1', 'partJ2', 'partJ3', 'partJ4', 'partJ5', 'partJ6', 'partJ7', 'partJ8', 'partJ9']
  },
  title: {
    type: String,
    required: true
  },
  applicableBuildingClasses: {
    type: String,
    required: true
  },
  keyRequirements: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes
sectionJPartSchema.index({ _id: 1 });

module.exports = mongoose.model('SectionJPart', sectionJPartSchema); 