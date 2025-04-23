const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env vars based on environment
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.join(__dirname, envFile) });

// Log environment info
console.log('Loading environment from:', envFile);

// Construct MongoDB URI from individual components
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoPath = process.env.MONGO_PATH;
const mongoPort = process.env.MONGO_PORT;
const mongoDatabase = process.env.MONGO_DATABASE;

// Check if all required MongoDB components are present
if (!mongoUser || !mongoPassword || !mongoPath || !mongoPort || !mongoDatabase) {
  console.error('Missing required MongoDB configuration:');
  console.error('MONGO_USER:', !!mongoUser);
  console.error('MONGO_PASSWORD:', !!mongoPassword);
  console.error('MONGO_PATH:', !!mongoPath);
  console.error('MONGO_PORT:', !!mongoPort);
  console.error('MONGO_DATABASE:', !!mongoDatabase);
  process.exit(1);
}

// Construct MongoDB URI
const MONGODB_URI = `mongodb://${mongoUser}:${mongoPassword}@${mongoPath}:${mongoPort}/${mongoDatabase}`;
console.log('MongoDB URI constructed successfully');

// Import models
const ClimateZone = require('./models/ClimateZone');
const CompliancePathway = require('./models/CompliancePathway');
const SpecialRequirement = require('./models/SpecialRequirement');

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
    console.log('Connected to database:', mongoDatabase);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      code: err.code
    });
    process.exit(1);
  });

// Read decision tree data
// Use relative paths consistently in both environments
const decisionTreePath = path.join(__dirname, 'data/Decision-Tree.json');
const locationToClimateZonePath = path.join(__dirname, 'data/mappings/locationToClimateZone.json');

// Log the paths being used
console.log('Environment:', process.env.NODE_ENV === 'production' ? 'production' : 'development');
console.log('Current directory:', __dirname);
console.log('Decision tree path:', decisionTreePath);
console.log('Location to climate zone path:', locationToClimateZonePath);

try {
  const decisionTreeData = JSON.parse(fs.readFileSync(decisionTreePath, 'utf8'));
  const locationToClimateZoneData = JSON.parse(fs.readFileSync(locationToClimateZonePath, 'utf8'));

  // Building Classifications data - Keep for reference but don't seed
  const buildingClassifications = Object.entries(decisionTreeData.decision_tree.building_classification).map(([name, data]) => ({
    classType: name,
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
      await mongoose.connection.collection('compliancepathways').drop().catch(err => console.log('No compliancepathways collection to drop'));
      await mongoose.connection.collection('specialrequirements').drop().catch(err => console.log('No specialrequirements collection to drop'));

      // Remove Building Classes seeding
      console.log('Building Classes are now accessed directly from Decision-Tree.json');

      // Seed Climate Zones
      const climateZones = locationToClimateZoneData.climateZones.map(zone => ({
        name: `Climate Zone ${zone.id}`,
        code: `CZ${zone.id}`,
        description: zone.description,
        temperatureRange: {
          min: zone.id <= 3 ? 25 : zone.id <= 6 ? 15 : 5,
          max: zone.id <= 3 ? 35 : zone.id <= 6 ? 25 : 15
        },
        humidityRange: {
          min: zone.id <= 3 ? 60 : zone.id <= 6 ? 40 : 20,
          max: zone.id <= 3 ? 90 : zone.id <= 6 ? 70 : 50
        },
        solarRadiation: zone.id <= 3 ? 6.5 : zone.id <= 6 ? 5.0 : 3.5,
        windSpeed: zone.id <= 3 ? 3.0 : zone.id <= 6 ? 4.0 : 5.0,
        insulation: zone.requirements?.insulation || (zone.id <= 6 ? 'standard' : 'enhanced'),
        wallRValue: zone.id <= 3 ? 'R1.4' : zone.id <= 6 ? 'R2.0' : 'R2.8',
        roofRValue: zone.id <= 3 ? 'R2.7' : zone.id <= 6 ? 'R3.2' : 'R3.7',
        glazing: {
          shgc: zone.id <= 3 ? 0.4 : zone.id <= 6 ? 0.5 : 0.6,
          uValue: zone.id <= 3 ? 5.4 : zone.id <= 6 ? 5.0 : 4.5
        },
        hvac: {
          cooling: zone.id <= 3 ? 'required' : 'optional',
          heating: zone.id >= 6 ? 'required' : 'optional'
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
} catch (error) {
  console.error('Error reading file:', error);
  process.exit(1);
} 