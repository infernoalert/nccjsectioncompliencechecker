const fs = require('fs').promises;
const path = require('path');
const Project = require('../models/Project');

class DiagramService {
  constructor() {
    this.diagramsDir = path.join(__dirname, '../data/diagrams');
    this.ensureDiagramsDirectory();
  }

  async ensureDiagramsDirectory() {
    try {
      await fs.access(this.diagramsDir);
    } catch {
      await fs.mkdir(this.diagramsDir, { recursive: true });
    }
  }

  generateFileName(projectId) {
    // Create a shorter unique identifier for the file name
    const shortId = projectId.toString().slice(-8);
    return `diagram-${shortId}.json`;
  }

  async saveDiagram(projectId, diagramData) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const fileName = this.generateFileName(projectId);
      const filePath = path.join(this.diagramsDir, fileName);

      // Save the diagram data to file
      await fs.writeFile(filePath, JSON.stringify(diagramData, null, 2));

      // Update project with diagram information
      project.diagram = {
        fileName,
        lastModified: new Date(),
        version: (project.diagram?.version || 0) + 1
      };

      await project.save();

      return {
        success: true,
        fileName,
        lastModified: project.diagram.lastModified,
        version: project.diagram.version
      };
    } catch (error) {
      throw new Error(`Failed to save diagram: ${error.message}`);
    }
  }

  async getDiagram(projectId) {
    try {
      const project = await Project.findById(projectId);
      if (!project || !project.diagram?.fileName) {
        throw new Error('Diagram not found');
      }

      const filePath = path.join(this.diagramsDir, project.diagram.fileName);
      const diagramData = await fs.readFile(filePath, 'utf8');

      return {
        success: true,
        data: JSON.parse(diagramData),
        lastModified: project.diagram.lastModified,
        version: project.diagram.version
      };
    } catch (error) {
      throw new Error(`Failed to get diagram: ${error.message}`);
    }
  }

  async deleteDiagram(projectId) {
    try {
      const project = await Project.findById(projectId);
      if (!project || !project.diagram?.fileName) {
        return { success: true }; // No diagram to delete
      }

      const filePath = path.join(this.diagramsDir, project.diagram.fileName);
      
      // Delete the file if it exists
      try {
        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }

      // Clear diagram information from project
      project.diagram = {
        fileName: null,
        lastModified: null,
        version: 1
      };

      await project.save();

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete diagram: ${error.message}`);
    }
  }
}

module.exports = new DiagramService(); 