// Calculate total cooling load
const calculateTotalCoolingLoad = (getCoolingDegreeHours, getDehumidificationGramHours, getTotalAreaOfHabitableRooms) => {
    // Get the Annual Cooling Degree Hours from the provided function
    // If no function is provided, use a default value
    const CDH = getCoolingDegreeHours ? getCoolingDegreeHours() : 5000;
    
    // Get the Annual Dehumidification Gram Hours from the provided function
    // If no function is provided, use a default value
    const DGH = getDehumidificationGramHours ? getDehumidificationGramHours() : 1000;
    
    // Get the Total Area of Habitable Rooms from the provided function
    // If no function is provided, use a default value
    const AH = getTotalAreaOfHabitableRooms ? getTotalAreaOfHabitableRooms() : 100;
    
    // Calculate the Area Adjustment Factor (Fc)
    let Fc;
    if (AH <= 50) {
        Fc = 1.34;
    } else if (AH > 50 && AH <= 200) {
        Fc = (1.29 * Math.pow(10, -5)) * Math.pow(AH, 2) - (5.55 * Math.pow(10, -3)) * AH + 1.58;
    } else if (AH > 200 && AH <= 1000) {
        Fc = (3.76 * Math.pow(10, -7)) * Math.pow(AH, 2) - (7.82 * Math.pow(10, -4)) * AH + 1.12;
    } else {
        Fc = 0.71;
    }
    
    // Calculate the Cooling Load Limit (CLL)
    const CLL = (5.4 + 0.00617 * (CDH + 1.85 * DGH)) * Fc;
    
    // Final Cooling Load Limit
    const totalcoolingloadvalue = CLL;
    
    return {
        description: "The total cooling load of the habitable rooms and conditioned spaces in a sole-occupancy unit of a Class 2 building or a Class 4 part of a building must not exceed ",
        descriptionValue: totalcoolingloadvalue.toString() + " MJ/m² per annum"
    };
};

// Export the function that calculates the total cooling load
module.exports = calculateTotalCoolingLoad; 