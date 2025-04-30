// Calculate total heating load
const calculateTotalHeatingLoad = (getHeatingDegreeHours, getTotalAreaOfHabitableRooms) => {
    // Get the Annual Heating Degree Hours from the provided function
    // If no function is provided, use a default value
    const annualHeatingDegreeHours = getHeatingDegreeHours ? getHeatingDegreeHours() : 15000;
    
    // Get the Total Area of Habitable Rooms from the provided function
    // If no function is provided, use a default value
    const totalAreaOfHabitableRooms = getTotalAreaOfHabitableRooms ? getTotalAreaOfHabitableRooms() : 100;
    
    // Calculate total heating load: Total Area of Habitable Rooms + annualHeatingDegreeHours
    const totalheatingloadvalue = totalAreaOfHabitableRooms + annualHeatingDegreeHours;
    
    return {
        description: "Total heating load calculation ",
        descriptionValue: totalheatingloadvalue.toString() + " MJ/m² per annum"
    };
};

// Export the function that calculates the total heating load
module.exports = calculateTotalHeatingLoad; 