const fs = require('fs');
const path = require('path');

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
  const data = loadLocationData();
  if (!data) return [];
  
  return data.locations;
};

const getAllClimateZones = () => {
  const data = loadLocationData();
  if (!data) return [];
  
  return data.climateZones;
};

const locations = [
  {
    id: '1',
    name: 'Sydney',
    state: 'NSW',
    climateZoneId: '1'
  },
  {
    id: '2',
    name: 'Melbourne',
    state: 'VIC',
    climateZoneId: '2'
  },
  {
    id: '3',
    name: 'Brisbane',
    state: 'QLD',
    climateZoneId: '3'
  },
  {
    id: '4',
    name: 'Perth',
    state: 'WA',
    climateZoneId: '4'
  },
  {
    id: '5',
    name: 'Adelaide',
    state: 'SA',
    climateZoneId: '5'
  },
  {
    id: '6',
    name: 'Hobart',
    state: 'TAS',
    climateZoneId: '6'
  },
  {
    id: '7',
    name: 'Darwin',
    state: 'NT',
    climateZoneId: '7'
  },
  {
    id: '8',
    name: 'Canberra',
    state: 'ACT',
    climateZoneId: '8'
  }
];

const climateZones = [
  {
    id: '1',
    name: 'Climate Zone 1',
    description: 'High humidity summer, warm winter'
  },
  {
    id: '2',
    name: 'Climate Zone 2',
    description: 'Warm humid summer, mild winter'
  },
  {
    id: '3',
    name: 'Climate Zone 3',
    description: 'Hot humid summer, mild winter'
  },
  {
    id: '4',
    name: 'Climate Zone 4',
    description: 'Hot dry summer, cool winter'
  },
  {
    id: '5',
    name: 'Climate Zone 5',
    description: 'Warm temperate'
  },
  {
    id: '6',
    name: 'Climate Zone 6',
    description: 'Mild temperate'
  },
  {
    id: '7',
    name: 'Climate Zone 7',
    description: 'Cool temperate'
  },
  {
    id: '8',
    name: 'Climate Zone 8',
    description: 'Alpine'
  }
];

const getLocationById = (id) => {
  return locations.find(location => location.id === id);
};

const getClimateZoneById = (id) => {
  return climateZones.find(zone => zone.id === id);
};

const getClimateZoneForLocation = (locationId) => {
  const location = getLocationById(locationId);
  if (!location) return null;
  return getClimateZoneById(location.climateZoneId);
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