const mongoose = require('mongoose');
const { embeddedSchema: wallSchema } = require('./Wall');
const { embeddedSchema: roofSchema } = require('./Roof');
const { embeddedSchema: floorSchema } = require('./Floor');
const { embeddedSchema: glazingSchema } = require('./Glazing');

const buildingFabricSchema = new mongoose.Schema({
  walls: {
    type: wallSchema,
    required: true
  },
  roof: {
    type: roofSchema,
    required: true
  },
  floor: {
    type: floorSchema,
    required: true
  },
  glazing: {
    type: glazingSchema,
    required: true
  }
}, { _id: false });

module.exports = {
  embeddedSchema: buildingFabricSchema,
  schema: new mongoose.Schema(buildingFabricSchema),
  model: mongoose.model('BuildingFabric', buildingFabricSchema)
}; 