const fs = require('fs');
const path = require('path');
const locationToClimateZone = require('../data/mappings/locationToClimateZone.json');

let locationData = null;

const loadLocationData = () => {
  if (locationData) return locationData;
  
  try {
    const filePath = path.join(__dirname, '../data/mappings/locationToClimateZone.json');
    const rawData = fs.readFileSync(filePath, 'utf8');
    locationData = JSON.parse(rawData);
    return locationData;
  } catch (error) {
    console.error('Error loading location data:', error);
    return null;
  }
};

const getLocationDetails = (locationId) => {
  const data = loadLocationData();
  if (!data) return null;
  
  return data.locations.find(location => location.id === locationId);
};

const getClimateZoneDetails = (climateZoneId) => {
  const data = loadLocationData();
  if (!data) return null;
  
  return data.climateZones.find(zone => zone.id === climateZoneId);
};

const getClimateZoneForLocation = (locationId) => {
  const location = getLocationDetails(locationId);
  if (!location) return null;
  
  return getClimateZoneDetails(location.climateZone);
};

const getAllLocations = () => {
  return locationToClimateZone.locations.map(location => ({
    id: location.id,
    name: location.name,
    state: location.state,
    description: location.description,
    climateZone: location.climateZone
  }));
};

const getAllClimateZones = () => {
  const data = loadLocationData();
  if (!data) return [];
  
  return data.climateZones;
};

const getLocationById = (id) => {
  const data = loadLocationData();
  if (!data) return null;
  
  return data.locations.find(location => location.id === id);
};

const getClimateZoneById = (id) => {
  const data = loadLocationData();
  if (!data) return null;
  
  return data.climateZones.find(zone => zone.id === id);
};

module.exports = {
  loadLocationData,
  getLocationDetails,
  getClimateZoneDetails,
  getClimateZoneForLocation,
  getAllLocations,
  getAllClimateZones,
  getLocationById,
  getClimateZoneById
}; 