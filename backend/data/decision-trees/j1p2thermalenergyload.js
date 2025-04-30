// Calculate thermal energy load
const calculateThermalEnergyLoad = (getHeatingLoadLimit, getCoolingLoadLimit) => {
    // Get the Heating Load Limit from the provided function
    // If no function is provided, use a default value
    const HLL = getHeatingLoadLimit ? getHeatingLoadLimit() : 30;
    
    // Get the Cooling Load Limit from the provided function
    // If no function is provided, use a default value
    const CLL = getCoolingLoadLimit ? getCoolingLoadLimit() : 45;
    
    // Calculate the Thermal Energy Load Limit (TLL)
    // Using the formula: TLL = (19.3 * HLL + 22.6 * CLL - 8.4) / (Tr + 10.74) - 15
    // For simplicity, we'll use a default value of 0 for Tr (temperature rise)
    
    const TLL = (19.3 * HLL + 22.6 * CLL - 8.4) ;
    
    // Final Thermal Energy Load Limit
    const thermalenergyloadvalue = TLL;
    
    return {
        description: "The total thermal energy load of the habitable rooms and conditioned spaces in a sole-occupancy unit of a Class 2 building or a Class 4 part of a building must not exceed ",
        descriptionValue: "[[" +thermalenergyloadvalue.toString() +"]" + "/ (Tr + 10.74) ] - 15 MJ/m² per annum. Find the annual average daily outdoor temperature range (Tr) for the location."
    };
};

// Export the function that calculates the thermal energy load
module.exports = calculateThermalEnergyLoad; 