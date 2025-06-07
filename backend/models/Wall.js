const mongoose = require('mongoose');
const { embeddedSchema: externalWallSchema } = require('./ExternalWall');

const wallSchema = new mongoose.Schema({
  external: {
    type: externalWallSchema,
    required: true
  }
}, { _id: false });

module.exports = {
  embeddedSchema: wallSchema,
  schema: new mongoose.Schema(wallSchema),
  model: mongoose.model('Wall', wallSchema)
}; 