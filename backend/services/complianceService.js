const ClimateZone = require('../models/ClimateZone');
const BuildingFabric = require('../models/BuildingFabric');
const CompliancePathway = require('../models/CompliancePathway');
const SpecialRequirement = require('../models/SpecialRequirement');
const Project = require('../models/Project');
const { getBuildingClassification } = require('../utils/decisionTreeUtils');

class ComplianceService {
  async checkCompliance(projectId) {
    try {
      const project = await Project.findById(projectId)
        .populate('climateZone')
        .populate('buildingFabric')
        .populate('compliancePathway')
        .populate('specialRequirements');

      if (!project) {
        throw new Error('Project not found');
      }

      const complianceResults = {
        status: 'pending',
        checks: []
      };

      // Check building classification requirements
      const buildingClassChecks = await this.checkBuildingClassification(project);
      complianceResults.checks.push(...buildingClassChecks);

      // Check climate zone requirements
      const climateZoneChecks = await this.checkClimateZone(project);
      complianceResults.checks.push(...climateZoneChecks);

      // Check building fabric requirements
      const buildingFabricChecks = await this.checkBuildingFabric(project);
      complianceResults.checks.push(...buildingFabricChecks);

      // Check special requirements
      const specialRequirementChecks = await this.checkSpecialRequirements(project);
      complianceResults.checks.push(...specialRequirementChecks);

      // Determine overall compliance status
      complianceResults.status = this.determineOverallStatus(complianceResults.checks);

      // Update project with compliance results
      project.complianceResults = {
        ...complianceResults,
        lastChecked: new Date(),
        nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      };

      await project.save();

      return project.complianceResults;
    } catch (error) {
      throw new Error(`Compliance check failed: ${error.message}`);
    }
  }

  async checkBuildingClassification(project) {
    const checks = [];
    
    try {
      // Get building classification from decision tree
      const buildingClass = getBuildingClassification(project.buildingType);
      
      if (!buildingClass) {
        checks.push({
          requirement: 'Building Classification',
          status: 'failed',
          details: `Building classification not found for type: ${project.buildingType}`
        });
        return checks;
      }
      
      // Check applicable clauses
      if (buildingClass.applicableClauses && buildingClass.applicableClauses.length > 0) {
        for (const clause of buildingClass.applicableClauses) {
          checks.push({
            requirement: `Clause ${clause}`,
            status: 'pending',
            details: 'To be verified by compliance pathway'
          });
        }
      }

      // Check subtypes if applicable
      if (buildingClass.subtypes && buildingClass.subtypes.length > 0) {
        for (const subtype of buildingClass.subtypes) {
          if (subtype.requirements) {
            for (const requirement of subtype.requirements) {
              checks.push({
                requirement: `Subtype requirement: ${requirement}`,
                status: 'pending',
                details: 'To be verified by compliance pathway'
              });
            }
          }
        }
      }
    } catch (error) {
      checks.push({
        requirement: 'Building Classification',
        status: 'error',
        details: `Error checking building classification: ${error.message}`
      });
    }

    return checks;
  }

  async checkClimateZone(project) {
    const checks = [];
    const climateZone = project.climateZone;

    // Check insulation requirements
    checks.push({
      requirement: 'Wall R-Value',
      status: this.compareRValue(project.buildingFabric.walls.external.rValueByZone[climateZone.zoneRange], climateZone.wallRValue),
      details: `Required: ${climateZone.wallRValue}, Provided: ${project.buildingFabric.walls.external.rValueByZone[climateZone.zoneRange]}`
    });

    checks.push({
      requirement: 'Roof R-Value',
      status: this.compareRValue(project.buildingFabric.roof.rValueByZone[climateZone.zoneRange], climateZone.roofRValue),
      details: `Required: ${climateZone.roofRValue}, Provided: ${project.buildingFabric.roof.rValueByZone[climateZone.zoneRange]}`
    });

    // Check glazing requirements
    if (climateZone.glazing) {
      checks.push({
        requirement: 'Glazing SHGC',
        status: this.compareGlazingValue(project.buildingFabric.glazing.external.shgcByZone[climateZone.zoneRange], climateZone.glazing.shgc),
        details: `Required: ${climateZone.glazing.shgc}, Provided: ${project.buildingFabric.glazing.external.shgcByZone[climateZone.zoneRange]}`
      });

      checks.push({
        requirement: 'Glazing U-Value',
        status: this.compareGlazingValue(project.buildingFabric.glazing.external.uValueByZone[climateZone.zoneRange], climateZone.glazing.uValue),
        details: `Required: ${climateZone.glazing.uValue}, Provided: ${project.buildingFabric.glazing.external.uValueByZone[climateZone.zoneRange]}`
      });
    }

    return checks;
  }

  async checkBuildingFabric(project) {
    const checks = [];
    const buildingFabric = project.buildingFabric;

    // Check thermal breaks
    if (buildingFabric.walls.external.thermalBreaks.metalFramed) {
      checks.push({
        requirement: 'Thermal breaks for metal framing',
        status: 'compliant',
        details: 'Metal framing thermal breaks implemented'
      });
    }

    // Check solar absorptance
    const solarAbsorptance = buildingFabric.roof.solarAbsorptance;
    if (solarAbsorptance.max && !solarAbsorptance.exemptZones.includes(project.climateZone.zoneRange)) {
      checks.push({
        requirement: 'Roof solar absorptance',
        status: 'pending',
        details: `Maximum allowed: ${solarAbsorptance.max}`
      });
    }

    return checks;
  }

  async checkSpecialRequirements(project) {
    const checks = [];
    
    for (const requirement of project.specialRequirements) {
      if (requirement.trigger) {
        const isTriggered = await this.evaluateTrigger(project, requirement.trigger);
        
        if (isTriggered) {
          for (const req of requirement.requirements) {
            checks.push({
              requirement: `${requirement.name}: ${req}`,
              status: 'pending',
              details: 'To be verified by compliance pathway'
            });
          }
        }
      }
    }

    return checks;
  }

  async evaluateTrigger(project, trigger) {
    // Implement trigger evaluation logic based on project parameters
    // This is a placeholder implementation
    return true;
  }

  compareRValue(provided, required) {
    // Extract numeric values from R-value strings (e.g., "R1.4-R2.8")
    const [requiredMin, requiredMax] = required.split('-').map(v => parseFloat(v.replace('R', '')));
    const providedValue = parseFloat(provided.replace('R', ''));

    if (providedValue >= requiredMin && providedValue <= requiredMax) {
      return 'compliant';
    }
    return 'non_compliant';
  }

  compareGlazingValue(provided, required) {
    if (provided <= required) {
      return 'compliant';
    }
    return 'non_compliant';
  }

  determineOverallStatus(checks) {
    if (checks.some(check => check.status === 'non_compliant')) {
      return 'non_compliant';
    }
    if (checks.every(check => check.status === 'compliant')) {
      return 'compliant';
    }
    return 'pending';
  }
}

module.exports = new ComplianceService(); 