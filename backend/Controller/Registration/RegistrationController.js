const DatabaseConnectivity = require("../../database/databaseConnectivity"); // Import the class

class RegistrationController {
    constructor() {
        this.databaseConnectivity = new DatabaseConnectivity(); // Create an instance of DatabaseConnectivity
    }

    // Method to handle user registration
    async newParticipant(data) 
    {
        let db; // Variable to hold the database reference
        try {
            // Connect to the database
            var result = await this.databaseConnectivity.initialize();
            console.log("Database Connectivity:", result);

            if(result === "Connected to MongoDB Atlas!")
            {
                var databaseName = "Courses-Management-System";
                var collectionName = "Registration Forms";
                var connectedDatabase = await this.databaseConnectivity.insertToDatabase(databaseName, collectionName, data);   
                console.log("Insert New Participants:", connectedDatabase);
                if(connectedDatabase === true)
                {
                    return {
                        success: true,
                        message: "User registered successfully",
                        data: result
                    };
                }
            }
        } 
        catch (error) 
        {
            return {
                success: false,
                message: "Error registering user",
                error: error
            };
        }
        finally {
            await this.databaseConnectivity.close(); // Ensure the connection is closed
        }    
    }

    async allParticipants() 
    {
        try {
            // Connect to the database
            var result = await this.databaseConnectivity.initialize();
            console.log("Database Connectivity:", result);

            if(result === "Connected to MongoDB Atlas!")
            {
                var databaseName = "Courses-Management-System";
                var collectionName = "Registration Forms";
                var connectedDatabase = await this.databaseConnectivity.retrieveFromDatabase(databaseName, collectionName);   
                return connectedDatabase;
                //console.log(connectedDatabase);
            }
        } 
        catch (error) 
        {
            return {
                success: false,
                message: "Error retrieving all user",
                error: error
            };
        }
        finally {
            await this.databaseConnectivity.close(); // Ensure the connection is closed
        }    
    }

    async updateParticipant(id, newStatus) 
    {
        try {
            // Connect to the database
            var result = await this.databaseConnectivity.initialize();
            console.log("Database Connectivity:", result);

            if(result === "Connected to MongoDB Atlas!")
            {
                var databaseName = "Courses-Management-System";
                var connectedDatabase = await this.databaseConnectivity.updateInDatabase(databaseName, id, newStatus);  
                return connectedDatabase.acknowledged;
                //console.log(connectedDatabase);
            }
        } 
        catch (error) 
        {
            return {
                success: false,
                message: "Error updating user",
                error: error
            };
        }
        finally {
            await this.databaseConnectivity.close(); // Ensure the connection is closed
        }    
    }

    async updateReceiptNumber(id, receiptNo) 
    {
        try {
            // Connect to the database
            var result = await this.databaseConnectivity.initialize();
            console.log("Database Connectivity:", result);

            if(result === "Connected to MongoDB Atlas!")
            {
                var databaseName = "Courses-Management-System";
                var connectedDatabase = await this.databaseConnectivity.updateReceiptNumberData(databaseName, id, receiptNo);  
                return connectedDatabase.acknowledged;
                //console.log(connectedDatabase);
            }
        } 
        catch (error) 
        {
            return {
                success: false,
                message: "Error updating user",
                error: error
            };
        }
        finally {
            await this.databaseConnectivity.close(); // Ensure the connection is closed
        }    
    }

    async updateOfficialUse(id, name, date, time, status)
    {
        try {
            // Connect to the database
            var result = await this.databaseConnectivity.initialize();
            console.log("Database Connectivity:", result);

            if(result === "Connected to MongoDB Atlas!")
            {
                var databaseName = "Courses-Management-System"; 
                var connectedDatabase = await this.databaseConnectivity.updatePaymentOfficialUse(databaseName, id, name, date, time, status);  
                return connectedDatabase.acknowledged;
                //console.log(connectedDatabase);
            }
        } 
        catch (error) 
        {
            return {
                success: false,
                message: "Error updating user",
                error: error
            };
        }
        finally {
            await this.databaseConnectivity.close(); // Ensure the connection is closed
        }    
    }
    
    async updateRemarks(id, remarks, staff, date, time)
    {
        try {
            // Connect to the database
            var result = await this.databaseConnectivity.initialize();
            console.log("Database Connectivity:", result);

            if(result === "Connected to MongoDB Atlas!")
            {
                var databaseName = "Courses-Management-System"; 
                var connectedDatabase = await this.databaseConnectivity.updatePaymentRemarks(databaseName, id, remarks, staff, date, time);  
                return connectedDatabase.acknowledged;
                //console.log(connectedDatabase);
            }
        } 
        catch (error) 
        {
            return {
                success: false,
                message: "Error updating user",
                error: error
            };
        }
        finally {
            await this.databaseConnectivity.close(); // Ensure the connection is closed
        }    
    }
    
}

module.exports = RegistrationController;
