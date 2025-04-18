const { getCompliancePathway } = require('../utils/decisionTreeUtils');

describe('Decision Tree Utilities', () => {
  describe('getCompliancePathway', () => {
    it('should return correct pathway for Class 2 in Zones 1-3', async () => {
      const pathway = await getCompliancePathway('Class_2', 2);
      expect(pathway).toBeDefined();
      expect(pathway.pathway).toBe('Performance Solution');
      expect(pathway.requirements.thermal_performance.R_value_roof).toBe(4.1);
      expect(pathway.requirements.energy_usage.max_kWh_per_m2).toBe(95);
    });

    it('should return correct pathway for Class 3 in Zones 4-8', async () => {
      const pathway = await getCompliancePathway('Class_3', 5);
      expect(pathway).toBeDefined();
      expect(pathway.pathway).toBe('Deemed-to-Satisfy');
      expect(pathway.requirements.thermal_performance.R_value_roof).toBe(5.0);
      expect(pathway.requirements.energy_usage.max_kWh_per_m2).toBe(95);
    });

    it('should throw error for invalid building class', async () => {
      await expect(getCompliancePathway('Invalid_Class', 2))
        .rejects
        .toThrow('Invalid building class type: Invalid_Class');
    });

    it('should throw error for invalid climate zone', async () => {
      await expect(getCompliancePathway('Class_2', 9))
        .rejects
        .toThrow('No compliance pathway found for Class_2 in Zones_4_8');
    });
  });
}); 