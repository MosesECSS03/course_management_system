const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection string
const uri = 'mongodb+srv://moseslee:Mlxy6695@ecss-course.hejib.mongodb.net/?retryWrites=true&w=majority&appName=ECSS-Course'; // Use env variable

class DatabaseConnectivity {
    constructor() {
        this.client = new MongoClient(uri);
        this.isConnected = false;
    }

    // Connect to the database
    async initialize()
    {
        try 
        {
            if (!this.isConnected) 
            {
                await this.client.connect();
                this.isConnected = true;
                return "Connected to MongoDB Atlas!";
            }   
        } catch (error) {
            console.error("Error connecting to MongoDB Atlas:", error);
            throw error;
        }
    }

    async login(dbname, collectionName, email, password, date, time)
    {
        const db = this.client.db(dbname);
        try
        {
            var table = db.collection(collectionName);
            // Find a user with matching email and password
            const user = await table.findOne({ email: email, password: password });
            if (user) {
                await table.updateOne(
                    { _id: user._id }, // Filter to find the user
                    {
                        $set: {
                            date_log_in: date,
                            time_log_in: time
                        }
                    }
                );
    
            // User found, login successful
            return {
                success: true,
                message: 'Login successful',
                user: user // or you can choose to return specific user details
            };
            } else {
            // No user found, login failed
            return {
                success: false,
                message: 'Invalid email or password'
            };
            }
        }
        catch(error)
        {
            console.log(error);
        }
    }

    async changePassword(dbname, collectionName, accountId, newPassword)
    {
        const db = this.client.db(dbname);
        try
        {
            var table = db.collection(collectionName);
            // Find a user with matching email and password
            const result = await table.updateOne(
                { _id: accountId }, // Filter
                { $set: { password: newPassword,
                            first_time_log_in: "No"
                 } } // Update
            );

            if (result) {
            // User found, login successful
            return {
                success: true,
                message: 'Change Password Successful',
            };
            } else {
            // No user found, login failed
            return {
                success: false,
                message: 'Change Password Failure'
            };
            }
        }
        catch(error)
        {
            console.log(error);
        }
    }

    async insertToDatabase(dbname, collectionName, data) {
        console.log("Database:", dbname);
        console.log("Data:", data);
    
        const db = this.client.db(dbname); // Get the database object
        let result;
    
        try {
            if (db) {
                const table = db.collection(collectionName);
                const count = await table.countDocuments();
                console.log("No. of entry:", count)
    
                if (collectionName === "Receipts") {
                    // Ensure registration_id is an ObjectId
                    const registrationId = new ObjectId(data.registration_id);
                    data.registration_id = registrationId;
    
                    // Check for existing document with the same registration_id
                    const existingDocument = await table.findOne({ registration_id: registrationId });
    
                    if(count > 0)
                    {
                        if (!existingDocument) { // Check for duplicates
                            result = await table.insertOne(data);
                        } else {
                            console.log(`Duplicate entry found for registration_id: ${registrationId}`);
                            return { acknowledged: false, message: 'Duplicate entry' }; // Optionally return a message
                        }
                    }
                    else
                    {
                        result = await table.insertOne(data);
                    }
                } else {
                    // Insert data if not "Receipt" collection
                    result = await table.insertOne(data);
                }
    
                // Return the result based on the collection name
                if (collectionName === "Accounts") {
                    return { acknowledged: result.acknowledged, accountId: result.insertedId };
                } else {
                    return { acknowledged: result.acknowledged }; // For other collections
                }
            }
        } catch (error) {
            console.error('Error during database operation:', error);
            return { acknowledged: false, error: error.message }; // Return error status
        }
    }
        
    async retrieveFromDatabase(dbname, collectionName)
    {
        var db = this.client.db(dbname); // return the db object
        try
        {
            if(db)
            {
                var table = db.collection(collectionName);
                var result = await table.find().toArray();
                return result;
            }
        }
        catch(error)
        {
            console.log(error);
        }
    }

    async retrieveOneFromDatabase(dbname, collectionName, id) {
        console.log("Selected One");
        console.log("Id:", id);
        var db = this.client.db(dbname); // Return the db object
        try {
            if (db) {
                var table = db.collection(collectionName);
                // Use findOne to get the document by nested field
                var result = await table.findOne({ "Account Details.Account ID": new ObjectId(id) }); // Convert id to ObjectId
                console.log(result); // Log the result
                return result; // Return the single document
            }
        } catch (error) {
            console.log(error);
        }
    }
    
            
    async updateInDatabase(dbname, id, newStatus) {
        var db = this.client.db(dbname); // return the db object
        try {
            if (db) {
                var tableName = "Registration Forms";
                var table = db.collection(tableName);
    
                // Use updateOne to update a single document
                const filter = { _id: new ObjectId(id) };

                // Add the new key "confirmation" to the update data
                const update = {
                    $set: {
                        status: newStatus // Add new key "confirmation"
                    }
                };
    
               // Call updateOne
                const result = await table.updateOne(filter, update);
    
                return result;
            }
        } catch (error) {
            console.log("Error updating database:", error);
        }
    }

    async updatePaymentOfficialUse(dbname,  id, name, date, time) {
        var db = this.client.db(dbname); // return the db object
        try {
            if (db) {
                var tableName = "Registration Forms";
                var table = db.collection(tableName);
    
                // Use updateOne to update a single document
                const filter = { _id: new ObjectId(id) };

                // Add the new key "confirmation" to the update data
                const update = {
                    $set: {
                        official:
                        {
                            name: name,
                            date: date,
                            time: time
                        }
                    }
                };
    
               // Call updateOne
                const result = await table.updateOne(filter, update);
    
                return result;
            }
        } catch (error) {
            console.log("Error updating database:", error);
        }
    }

    async getNextReceiptNumber(databaseName, collectionName, courseLocation) {
        const db = this.client.db(databaseName);
        const collection = db.collection(collectionName);
    
        // Retrieve all receipts matching the specified courseLocation
        const existingReceipts = await collection.find({
            receiptNo: { $regex: `^${courseLocation} - ` } // Match receipt numbers starting with courseLocation -
        }).toArray();
    
        console.log("Current:", existingReceipts);
    
        // If there are no receipts for the specific courseLocation, return '001'
        if (existingReceipts.length === 0) {
            return `${courseLocation} - 001`; // No existing receipts, start at '001'
        }
    
        // Extract the numeric part and find the latest number for the specific courseLocation
        const receiptNumbers = existingReceipts.map(receipt => {
            const numberPart = receipt.receiptNo.substring(courseLocation.length + 3); // Extract the numeric part
            return parseInt(numberPart, 10); // Convert to integer
        }).filter(num => !isNaN(num)); // Filter out NaN values in case of invalid formats
    
        // Find the latest (maximum) existing number
        const latestNumber = Math.max(...receiptNumbers);
    
        // Determine the next number
        const nextNumber = latestNumber + 1;
    
        // Calculate the length dynamically based on the maximum length of existing numbers
        const maxLength = Math.max(...receiptNumbers.map(num => String(num).length), 3); // Ensure at least 3 digits
    
        // Return the next receipt number with dynamic length
        return `${courseLocation} - ${String(nextNumber).padStart(maxLength, '0')}`;
    }
    

    // Close the connection to the database
    async close() {
        if (this.isConnected) {
            await this.client.close();
            this.isConnected = false;
            console.log("MongoDB connection closed.");
        }
    }
}

// Export the instance for use in other modules
module.exports = DatabaseConnectivity;