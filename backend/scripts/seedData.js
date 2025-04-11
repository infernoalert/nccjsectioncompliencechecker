const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const BuildingClass = require('../models/BuildingClass');
const ClimateZone = require('../models/ClimateZone');
const CompliancePathway = require('../models/CompliancePathway');
const SectionJPart = require('../models/SectionJPart');
const SpecialRequirement = require('../models/SpecialRequirement');
const ExemptionAndConcession = require('../models/ExemptionAndConcession');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected for seeding'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Read the NCC Section J mapping file
const nccMappingPath = path.join(__dirname, '../../ncc_section_j_mapping.json');
const nccMapping = JSON.parse(fs.readFileSync(nccMappingPath, 'utf8'));

// Seed building classes
const seedBuildingClasses = async () => {
  try {
    // Clear existing data
    await BuildingClass.deleteMany({});
    
    // Prepare data for insertion
    const buildingClasses = Object.entries(nccMapping.buildingClassifications).map(([id, data]) => ({
      _id: id,
      description: data.description,
      sectionJApplicability: data.sectionJApplicability,
      primaryRequirements: data.primaryRequirements,
      specialConsiderations: data.specialConsiderations,
      compliancePathways: data.compliancePathways,
      climateZoneRequirements: Object.entries(data.climateZoneRequirements || {}).map(([zone, reqs]) => ({
        zone,
        description: reqs.description,
        wallRValue: reqs.wallRValue,
        roofRValue: reqs.roofRValue,
        floorRValue: reqs.floorRValue,
        glazing: reqs.glazing
      })),
      buildingSizeRequirements: data.buildingSizeRequirements ? Object.entries(data.buildingSizeRequirements).map(([size, reqs]) => ({
        size,
        floorArea: reqs.floorArea,
        provisions: reqs.provisions
      })) : [],
      specialTypes: data.specialTypes ? Object.entries(data.specialTypes).map(([type, reqs]) => ({
        type,
        applicability: reqs.applicability,
        concessions: reqs.concessions,
        requirements: reqs.requirements
      })) : [],
      subTypes: data.subTypes ? Object.entries(data.subTypes).map(([type, reqs]) => ({
        type,
        description: reqs.description,
        specialRequirements: reqs.specialRequirements,
        applicableClauses: reqs.applicableClauses,
        exemptions: reqs.exemptions,
        decisionLogic: reqs.decisionLogic
      })) : [],
      specialRequirements: data.specialRequirements || {}
    }));
    
    // Insert data
    await BuildingClass.insertMany(buildingClasses);
    console.log('Building classes seeded successfully');
  } catch (error) {
    console.error('Error seeding building classes:', error);
  }
};

// Seed climate zones
const seedClimateZones = async () => {
  try {
    // Clear existing data
    await ClimateZone.deleteMany({});
    
    // Prepare data for insertion
    const climateZones = Object.entries(nccMapping.climateZones).map(([id, data]) => ({
      _id: id,
      description: data.description,
      wallRValue: data.wallRValue,
      roofRValue: data.roofRValue,
      floorRValue: data.floorRValue,
      glazingRequirements: data.glazingRequirements
    }));
    
    // Insert data
    await ClimateZone.insertMany(climateZones);
    console.log('Climate zones seeded successfully');
  } catch (error) {
    console.error('Error seeding climate zones:', error);
  }
};

// Seed compliance pathways
const seedCompliancePathways = async () => {
  try {
    // Clear existing data
    await CompliancePathway.deleteMany({});
    
    // Prepare data for insertion
    const compliancePathways = Object.entries(nccMapping.compliancePathways).map(([id, data]) => ({
      _id: id,
      description: data.description,
      applicableBuildingClasses: data.applicableBuildingClasses,
      requirements: data.requirements,
      benefits: data.benefits
    }));
    
    // Insert data
    await CompliancePathway.insertMany(compliancePathways);
    console.log('Compliance pathways seeded successfully');
  } catch (error) {
    console.error('Error seeding compliance pathways:', error);
  }
};

// Seed Section J parts
const seedSectionJParts = async () => {
  try {
    // Clear existing data
    await SectionJPart.deleteMany({});
    
    // Prepare data for insertion
    const sectionJParts = Object.entries(nccMapping.sectionJParts).map(([id, data]) => ({
      _id: id,
      title: data.title,
      applicableBuildingClasses: data.applicableBuildingClasses,
      keyRequirements: data.keyRequirements
    }));
    
    // Insert data
    await SectionJPart.insertMany(sectionJParts);
    console.log('Section J parts seeded successfully');
  } catch (error) {
    console.error('Error seeding Section J parts:', error);
  }
};

// Seed special requirements
const seedSpecialRequirements = async () => {
  try {
    // Clear existing data
    await SpecialRequirement.deleteMany({});
    
    // Prepare data for insertion
    const specialRequirements = Object.entries(nccMapping.specialRequirements).map(([id, data]) => ({
      _id: id,
      triggerCondition: data.triggerCondition,
      applicableBuildingClasses: data.applicableBuildingClasses,
      specificRequirements: data.specificRequirements
    }));
    
    // Insert data
    await SpecialRequirement.insertMany(specialRequirements);
    console.log('Special requirements seeded successfully');
  } catch (error) {
    console.error('Error seeding special requirements:', error);
  }
};

// Seed exemptions and concessions
const seedExemptionsAndConcessions = async () => {
  try {
    // Clear existing data
    await ExemptionAndConcession.deleteMany({});
    
    // Prepare data for insertion
    const exemptionsAndConcessions = Object.entries(nccMapping.exemptionsAndConcessions).map(([id, data]) => ({
      _id: id,
      description: data.description,
      applicableBuildingClasses: data.applicableBuildingClasses,
      conditions: data.conditions,
      limitations: data.limitations
    }));
    
    // Insert data
    await ExemptionAndConcession.insertMany(exemptionsAndConcessions);
    console.log('Exemptions and concessions seeded successfully');
  } catch (error) {
    console.error('Error seeding exemptions and concessions:', error);
  }
};

// Run all seed functions
const seedAll = async () => {
  try {
    await seedBuildingClasses();
    await seedClimateZones();
    await seedCompliancePathways();
    await seedSectionJParts();
    await seedSpecialRequirements();
    await seedExemptionsAndConcessions();
    console.log('All data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Execute the seed function
seedAll(); 