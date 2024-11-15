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

    async logout(dbname, collectionName, accountId, date, time)
    {
        const db = this.client.db(dbname);
        try
        {
            var table = db.collection(collectionName);
            // Find a user with matching email and password
            const user = await table.findOne({ _id: new ObjectId(accountId) });
            if (user) {
                await table.updateOne(
                    { _id: user._id }, // Filter to find the user
                    {
                        $set: {
                            date_log_out: date,
                            time_log_out: time
                        }
                    }
                );
    
            // User found, login successful
            return {
                success: true,
                message: 'Logout successful',
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

    async resetPassword(dbname, collectionName, username, password)
    {
        const db = this.client.db(dbname);
        try
        {
            var table = db.collection(collectionName);
            // Find a user with matching email and password
            const result = await table.updateOne(
                {email: username }, // Filter
                { $set: {   password: password,
                            first_time_log_in: "No"
                 } } // Update
            );
            console.log(result);
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
                var result = await table.findOne({ "Account Details.Account ID": new ObjectId(id)}); // Convert id to ObjectId
                console.log("Retrieve:", result); // Log the result
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
                        status: newStatus, // Add new key "confirmation"
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

    async updateReceiptNumberData(dbname, id, receiptNumber) {
        console.log("Parameters:", dbname, id, receiptNumber);
        var db = this.client.db(dbname); // return the db object
        try {
            if (db) {
                var tableName = "Registration Forms";
                var table = db.collection(tableName);
    
                // Use updateOne to update a single document
                const filter = { _id: new ObjectId(id) };
    
                // Update only the `receiptNo` field inside the `official` object
                const update = {
                    $set: {
                        "official.receiptNo": receiptNumber
                    }
                };

                // Call updateOne
                const result = await table.updateOne(filter, update);
                console.log("updateReceiptNumberData:", result)
    
                return result;
            }
        } catch (error) {
            console.log("Error updating database:", error);
        }
    }
    
    
    async updatePaymentOfficialUse(dbname, id, name, date, time, status) {
        var db = this.client.db(dbname); // return the db object
        try {
            if (db) {
                var tableName = "Registration Forms";
                var table = db.collection(tableName);
    
                // Use updateOne to update a single document
                const filter = { _id: new ObjectId(id) };
    
                // Define the update object conditionally based on status
                let update = null;
    
                if (status === "Paid") {
                    update = {
                        $set: {
                            "official.name": name,
                            "official.date": date,
                            "official.time": time
                        }
                    };
                } else {
                    update = {
                        $set: {
                            "official.name": "",
                            "official.date": "",
                            "official.time": "",
                            "official.receiptNo": "",
                            "official.remarks": ""
                        }
                    };
                }
    
                // Call updateOne
                const result = await table.updateOne(filter, update);
    
                return result;
            }
        } catch (error) {
            console.log("Error updating database:", error);
        }
    }

    async updatePaymentRemarks(dbname, id, remarks, staff, date, time) {
        var db = this.client.db(dbname); // return the db object
        try {
            if (db) {
                var tableName = "Registration Forms";
                var table = db.collection(tableName);
    
                // Use updateOne to update a single document
                const filter = { _id: new ObjectId(id) };
    
                // Define the update object conditionally based on status
                let update = null;
                var newPaymentMethod = remarks.split(" ")[5].trim();

                //Remarks: Change Payment From What To What
                if(remarks.includes("Change") || remarks.includes("Payment"))
                {
                    update = {
                            $set: {
                                "course.payment": newPaymentMethod,
                                "official.remarks": remarks,
                                "official.receiptNo": "",
                                "official.name": staff,
                                "official.date": date,
                                "official.time": time,
                            }
                        };
                }
                else
                {
                    update = {
                        $set: {
                            "official.remarks": remarks,
                        }
                    };
                }
    
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
            receiptNo: { $regex: `^${courseLocation} - \\d+$` } // Match receipt numbers with courseLocation and numeric part
        }).toArray();
    
        console.log("Current receipts:", existingReceipts);
    
        // If there are no receipts for the specific courseLocation, return '1' as the starting number
        if (existingReceipts.length === 0) {
            return `${courseLocation} - 0001`; // Start from '1' for new courseLocation
        }
    
        // Extract the numeric part of receipt numbers
        const receiptNumbers = existingReceipts.map(receipt => {
            const match = receipt.receiptNo.match(new RegExp(`^${courseLocation} - (\\d+)$`));
            return match ? parseInt(match[1], 10) : null; // Extract and parse numeric part
        }).filter(num => num !== null); // Remove invalid entries
    
        // Find the latest (maximum) existing number
        const latestNumber = Math.max(...receiptNumbers);
    
        // Determine the next number
        const nextNumber = latestNumber + 1;
    
        // Calculate the length dynamically based on the maximum numeric length in existing receipts
       // const maxLength = Math.max(...receiptNumbers.map(num => String(num).length), String(nextNumber).length);
       const maxLength = Math.max(...receiptNumbers.map(num => String(num).length), 4);
    
        // Format the next number with leading zeros to match the dynamic length
        return `${courseLocation} - ${String(nextNumber).padStart(maxLength, '0')}`;
    }
        

    async deleteAccount(databaseName, collectionName, id) {
        const db = this.client.db(databaseName);
        const table = db.collection(collectionName);
    
        try {
            const filter = { _id: new ObjectId(id) }; // Find document by ID
            const result = await table.deleteOne(filter);
    
            if (result.deletedCount === 1) {
                console.log("Successfully deleted the document.");
                return { success: true, message: "Document deleted successfully." };
            } else {
                console.log("No document found with that ID.");
                return { success: false, message: "No document found with that ID." };
            }
        } catch (error) {
            console.log("Error deleting document:", error);
            return { success: false, error };
        }
    }

    async deleteFromDatabase(databaseName, collectionName, id) {
        const db = this.client.db(databaseName);
        const table = db.collection(collectionName);
    
        try {
            const filter = { _id: new ObjectId(id) }; // Find document by ID
            const result = await table.deleteOne(filter);
    
            if (result.deletedCount === 1) {
                console.log("Successfully deleted the document.");
                return { success: true, message: "Document deleted successfully." };
            } else {
                console.log("No document found with that ID.");
                return { success: false, message: "No document found with that ID." };
            }
        } catch (error) {
            console.log("Error deleting document:", error);
            return { success: false, error };
        }
    }

    async deleteAccessRights(databaseName, collectionName, id) {
        const db = this.client.db(databaseName);
        const table = db.collection(collectionName);
    
        try {
            // Using bracket notation to access 'Account ID' under 'Account Details'
            const filter = { "Account Details.Account ID": new ObjectId(id) }; 
    
            const result = await table.deleteOne(filter);
    
            if (result.deletedCount === 1) {
                console.log("Successfully deleted the access right.");
                return { success: true, message: "Document deleted successfully." };
            } else {
                console.log("No document found with that ID.");
                return { success: false, message: "No document found with that ID." };
            }
        } catch (error) {
            console.log("Error deleting document:", error);
            return { success: false, error };
        }
    }

    async updateAccessRight(databaseName, collectionName, id, updateAccessRight) {
        const db = this.client.db(databaseName);
        const table = db.collection(collectionName);
    
        try {
            // Define your filter to find the correct document
            const filter = { _id: new ObjectId(id) };
            console.log("Filter:", filter);
    
            // Exclude _id from the updateAccessRight if it exists
            const { _id, "Account Details": accountDetails, ...updateData } = updateAccessRight; 
    
            // Prepare the update object
            const update = {
                $set: {}
            };

    
            // Add any other fields from updateData
            for (const key in updateData) {
                update.$set[key] = updateData[key];
            }
    
            console.log("Update object:", update);
    
            // Perform the update operation
            const result = await table.updateOne(filter, update);
    
            if (result.modifiedCount === 1) {
                console.log("Successfully updated the access right.");
                return { success: true, message: "Document updated successfully." };
            } else {
                console.log("No document found with that ID or no changes made.");
                return { success: false, message: "No document found with that ID or no changes made." };
            }
        } catch (error) {
            console.log("Error updating document:", error);
            return { success: false, error };
        }
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