const mongoose = require('mongoose');
const { embeddedSchema: wallSchema } = require('./Wall');
const { embeddedSchema: roofSchema } = require('./Roof');
const { embeddedSchema: floorSchema } = require('./Floor');
const { embeddedSchema: glazingSchema } = require('./Glazing');

const buildingFabricSchema = new mongoose.Schema({
  walls: {
    type: wallSchema,
    required: false
  },
  roof: {
    type: roofSchema,
    required: false
  },
  floor: {
    type: floorSchema,
    required: false
  },
  glazing: {
    type: glazingSchema,
    required: false
  }
}, { _id: false });

module.exports = {
  embeddedSchema: buildingFabricSchema,
  schema: new mongoose.Schema(buildingFabricSchema),
  model: mongoose.model('BuildingFabric', buildingFabricSchema)
}; 