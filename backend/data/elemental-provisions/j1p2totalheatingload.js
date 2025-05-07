// Calculate total heating load
const calculateTotalHeatingLoad = (getHeatingDegreeHours, getTotalAreaOfHabitableRooms) => {
    // Get the Annual Heating Degree Hours from the provided function
    // If no function is provided, use a default value
    const HDH = getHeatingDegreeHours ? getHeatingDegreeHours() : 15000;
    
    // Get the Total Area of Habitable Rooms from the provided function
    // If no function is provided, use a default value
    const AH = getTotalAreaOfHabitableRooms ? getTotalAreaOfHabitableRooms() : 100;
    
    // Calculate the Area Adjustment Factor (FH)
    let FH;
    if (AH <= 50) {
        FH = 1.37;
    } else if (AH > 50 && AH <= 350) {
        FH = (5.11 * Math.pow(10, -6)) * Math.pow(AH, 2) - (3.82 * Math.pow(10, -3)) * AH + 1.55;
    } else {
        FH = 0.84;
    }
    
    // Calculate the Base Value
    const baseValue = (0.0044 * HDH - 5.9) * FH;
    
    // Final Heating Load Limit is the greater of 4 and the Base Value
    const totalheatingloadvalue = Math.max(4, baseValue);
    
    return {
        description: "The total heating load of the habitable rooms and conditioned spaces in a sole-occupancy unit of a Class 2 building or a Class 4 part of a building must not exceed ",
        descriptionValue: totalheatingloadvalue.toString() + " MJ/m² per annum"
    };
};

// Export the function that calculates the total heating load
module.exports = calculateTotalHeatingLoad; 