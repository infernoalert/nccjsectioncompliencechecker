// Migration script to convert embedded subdocuments in Project to manual references
const mongoose = require('mongoose');
const Project = require('../models/Project');
const { model: EnergyMonitoring } = require('../models/EnergyMonitoring');
const { model: Load } = require('../models/Load');
const { model: SpecialRequirement } = require('../models/SpecialRequirement');
const { model: CompliancePathway } = require('../models/CompliancePathway');
const { model: File } = require('../models/File');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nccjsectioncompliencechecker';

async function migrate() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const projects = await Project.find({});
  console.log(`Found ${projects.length} projects.`);

  for (const project of projects) {
    let modified = false;

    // --- Electrical: energyMonitoring ---
    if (project.electrical && Array.isArray(project.electrical.energyMonitoring)) {
      const newEMIds = [];
      for (const em of project.electrical.energyMonitoring) {
        if (em && em.label && em.panel) {
          const created = await EnergyMonitoring.create({ ...em });
          newEMIds.push(created._id);
        }
      }
      if (newEMIds.length) {
        project.electrical.energyMonitoring = newEMIds;
        modified = true;
      }
    }

    // --- Electrical: loads ---
    if (project.electrical && Array.isArray(project.electrical.loads)) {
      const newLoadIds = [];
      for (const load of project.electrical.loads) {
        if (load && load.name) {
          const created = await Load.create({ ...load });
          newLoadIds.push(created._id);
        }
      }
      if (newLoadIds.length) {
        project.electrical.loads = newLoadIds;
        modified = true;
      }
    }

    // --- SpecialRequirements ---
    if (Array.isArray(project.specialRequirements)) {
      const newSRIds = [];
      for (const sr of project.specialRequirements) {
        if (sr) {
          const created = await SpecialRequirement.create({ ...sr });
          newSRIds.push(created._id);
        }
      }
      if (newSRIds.length) {
        project.specialRequirements = newSRIds;
        modified = true;
      }
    }

    // --- CompliancePathway ---
    if (project.compliancePathway && typeof project.compliancePathway === 'object' && !mongoose.isValidObjectId(project.compliancePathway)) {
      const created = await CompliancePathway.create({ ...project.compliancePathway });
      project.compliancePathway = created._id;
      modified = true;
    }

    // --- Files ---
    if (Array.isArray(project.files)) {
      const newFileIds = [];
      for (const file of project.files) {
        if (file && file.filename) {
          const created = await File.create({ ...file });
          newFileIds.push(created._id);
        }
      }
      if (newFileIds.length) {
        project.files = newFileIds;
        modified = true;
      }
    }

    if (modified) {
      await project.save();
      console.log(`Migrated project ${project._id}`);
    }
  }

  await mongoose.disconnect();
  console.log('Migration complete.');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 