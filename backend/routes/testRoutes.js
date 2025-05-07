const express = require('express');
const router = express.Router();
const { loadMonolithicTree, getSection } = require('../utils/decisionTreeFactory');
const path = require('path');
const fs = require('fs').promises;

// Test loading the monolithic tree
router.get('/monolithic', async (req, res) => {
    try {
        const tree = await loadMonolithicTree();
        res.json({
            success: true,
            message: 'Successfully loaded monolithic tree',
            data: {
                version: tree.version,
                lastUpdated: tree.lastUpdated,
                sections: Object.keys(tree)
            }
        });
    } catch (error) {
        console.error('Error loading monolithic tree:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load monolithic tree',
            error: error.message
        });
    }
});

// Test getting a specific section
router.get('/section/:sectionName', async (req, res) => {
    try {
        const { sectionName } = req.params;
        const section = await getSection(sectionName);
        
        if (!section) {
            return res.status(404).json({
                success: false,
                message: `Section '${sectionName}' not found`
            });
        }

        res.json({
            success: true,
            message: `Successfully retrieved section '${sectionName}'`,
            data: section
        });
    } catch (error) {
        console.error(`Error getting section ${req.params.sectionName}:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to get section',
            error: error.message
        });
    }
});

// Test endpoint for exemptions
router.get('/exemptions', async (req, res) => {
  try {
    const exemptionsPath = path.join(__dirname, '..', 'data', 'elemental-provisions', 'exemptions.json');
    const exemptionsData = await fs.readFile(exemptionsPath, 'utf8');
    const exemptions = JSON.parse(exemptionsData);
    res.json(exemptions);
  } catch (error) {
    console.error('Error loading exemptions:', error);
    res.status(500).json({ error: 'Failed to load exemptions data' });
  }
});

module.exports = router; 