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

    async insertToDatabase(dbname, collectionName, data)
    {
        console.log("Database:", dbname);
        console.log("Data:", data);
        var db = this.client.db(dbname); // return the db object
        try
        {
            if(db)
            {
                var table = db.collection(collectionName);
                var result = await table.insertOne(data);
                if(collectionName === "Accounts")
                {
                    return {acknowledged: result.acknowledged, accountId: result.insertedId };
                }
                else
                {
                    return {acknowledged: result.acknowledged};
                }
            }
        }
        catch(error)
        {
            console.log(error);
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