const { getBuildingClassification } = require('../utils/decisionTreeUtils');
const { getClimateZoneForLocation } = require('../utils/locationUtils');
const path = require('path');
const fs = require('fs').promises;

class J6HvacReportService {
  constructor(project) {
    this.project = project;
    this.j6hvacDir = path.join(__dirname, '..', 'data', 'j6hvac');
  }

  async loadJ6HvacSections() {
    try {
      // Check if directory exists
      try {
        await fs.access(this.j6hvacDir);
      } catch (error) {
        console.error(`J6 HVAC directory not found at: ${this.j6hvacDir}`);
        throw new Error('J6 HVAC sections directory not found');
      }

      const files = await fs.readdir(this.j6hvacDir);
      const sections = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(this.j6hvacDir, file);
            const content = await fs.readFile(filePath, 'utf8');
            
            // Skip empty files
            if (!content.trim()) {
              console.warn(`Skipping empty file: ${file}`);
              continue;
            }

            const section = JSON.parse(content);
            sections.push({
              sectionId: path.basename(file, '.json'),
              ...section
            });
          } catch (error) {
            console.error(`Error processing file ${file}:`, error);
            // Continue with other files even if one fails
            continue;
          }
        }
      }

      if (sections.length === 0) {
        throw new Error('No valid J6 HVAC sections found');
      }

      return sections;
    } catch (error) {
      console.error('Error loading J6 HVAC sections:', error);
      throw new Error(`Failed to load J6 HVAC sections: ${error.message}`);
    }
  }

  async generateReport() {
    try {
      // Get building classification
      let buildingClassification;
      try {
        buildingClassification = getBuildingClassification(this.project.buildingType);
      } catch (error) {
        console.error('Error getting building classification:', error);
        throw new Error(`Failed to get building classification: ${error.message}`);
      }
      
      // Get climate zone details
      let climateZone;
      try {
        climateZone = getClimateZoneForLocation(this.project.location);
        if (!climateZone) {
          throw new Error(`No climate zone found for location: ${this.project.location}`);
        }
      } catch (error) {
        console.error('Error getting climate zone:', error);
        throw new Error(`Failed to get climate zone: ${error.message}`);
      }
      
      // Load J6 HVAC sections
      let sections;
      try {
        sections = await this.loadJ6HvacSections();
      } catch (error) {
        console.error('Error loading J6 HVAC sections:', error);
        throw new Error(`Failed to load J6 HVAC sections: ${error.message}`);
      }
      
      // Generate the report
      return {
        projectId: this.project._id,
        projectName: this.project.name,
        buildingType: this.project.buildingType,
        location: this.project.location,
        floorArea: this.project.floorArea,
        totalAreaOfHabitableRooms: this.project.totalAreaOfHabitableRooms,
        status: this.project.status,
        buildingClassification,
        climateZone,
        compliancePathway: this.project.compliancePathway,
        buildingFabric: this.project.buildingFabric,
        specialRequirements: this.project.specialRequirements,
        sections,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error generating J6 HVAC report:', error);
      throw error;
    }
  }
}

module.exports = J6HvacReportService; 