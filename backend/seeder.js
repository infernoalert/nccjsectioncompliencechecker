const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env vars
dotenv.config();

// Import models
const BuildingClass = require('./models/BuildingClass');
const ClimateZone = require('./models/ClimateZone');
const CompliancePathway = require('./models/CompliancePathway');
const SpecialRequirement = require('./models/SpecialRequirement');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Read decision tree data
const decisionTreeData = JSON.parse(fs.readFileSync(path.join(__dirname, '../Decision-Tree.json'), 'utf8'));
const zoneData = JSON.parse(fs.readFileSync(path.join(__dirname, '../zone.json'), 'utf8'));

// Building Classifications data
const buildingClassifications = Object.entries(decisionTreeData.decision_tree.building_classification).map(([name, data]) => ({
  name,
  description: data.description,
  subtypes: data.subtypes || {},
  climateZones: data.climate_zones || {},
  compliancePathways: data.compliance_pathways || [],
  sizeBasedProvisions: data.size_based_provisions || {}
}));

// Climate zone descriptions
const climateZoneDescriptions = {
  1: 'Hot humid summer, warm winter',
  2: 'Warm humid summer, mild winter',
  3: 'Hot dry summer, warm winter',
  4: 'Hot dry summer, cool winter',
  5: 'Warm temperate',
  6: 'Mild temperate',
  7: 'Cool temperate',
  8: 'Alpine'
};

// Import data
const importData = async () => {
  try {
    // Drop existing collections
    await mongoose.connection.collection('climatezones').drop().catch(err => console.log('No climatezones collection to drop'));
    await mongoose.connection.collection('buildingclasses').drop().catch(err => console.log('No buildingclasses collection to drop'));
    await mongoose.connection.collection('compliancepathways').drop().catch(err => console.log('No compliancepathways collection to drop'));
    await mongoose.connection.collection('specialrequirements').drop().catch(err => console.log('No specialrequirements collection to drop'));

    // Seed Building Classes
    await BuildingClass.insertMany(buildingClassifications);
    console.log('Building Classes seeded');

    // Seed Climate Zones
    const climateZones = zoneData.climateZones.map(zone => ({
      zone: zone.zone,
      locations: zone.locations,
      description: climateZoneDescriptions[zone.zone],
      insulation: zone.zone <= 6 ? 'standard' : 'enhanced',
      wallRValue: zone.zone <= 3 ? 'R1.4' : zone.zone <= 6 ? 'R2.0' : 'R2.8',
      roofRValue: zone.zone <= 3 ? 'R2.7' : zone.zone <= 6 ? 'R3.2' : 'R3.7',
      glazing: {
        shgc: zone.zone <= 3 ? 0.4 : zone.zone <= 6 ? 0.5 : 0.6,
        uValue: zone.zone <= 3 ? 5.4 : zone.zone <= 6 ? 5.0 : 4.5
      },
      hvac: {
        cooling: zone.zone <= 3 ? 'required' : 'optional',
        heating: zone.zone >= 6 ? 'required' : 'optional'
      }
    }));
    await ClimateZone.insertMany(climateZones);
    console.log('Climate Zones seeded');

    // Seed Compliance Pathways
    const compliancePathways = Object.entries(decisionTreeData.decision_tree.compliance_pathways || {}).map(([name, data]) => ({
      name,
      description: data.description,
      applicability: data.applicability,
      verification: data.verification
    }));
    await CompliancePathway.insertMany(compliancePathways);
    console.log('Compliance Pathways seeded');

    // Seed Special Requirements
    const specialRequirements = Object.entries(decisionTreeData.decision_tree.special_requirements || {}).map(([name, data]) => ({
      name,
      trigger: data.trigger,
      requirements: new Map(Object.entries(data.requirements || {})),
      conditions: data.conditions || [],
      exemptions: new Map(Object.entries(data.exemptions || {}))
    }));
    await SpecialRequirement.insertMany(specialRequirements);
    console.log('Special Requirements seeded');

    console.log('Data Imported...');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await BuildingClass.deleteMany();
    await ClimateZone.deleteMany();
    await CompliancePathway.deleteMany();
    await SpecialRequirement.deleteMany();

    console.log('Data Destroyed...');
    process.exit();
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
};

// Run seeder based on command line argument
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please specify -i to import data or -d to delete data');
  process.exit(1);
} 