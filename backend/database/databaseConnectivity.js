const { MongoClient } = require('mongodb');

// MongoDB connection string
const uri = "mongodb+srv://moseslee:Mlxy6695@ecss-course.hejib.mongodb.net/?retryWrites=true&w=majority&appName=ECSS-Course";

const client = new MongoClient(uri);

let isConnected = false; // Track connection state

async function connectToDatabase() {
    try {
        console.log("isConnected:", isConnected);
        if (!isConnected) {
            await client.connect();
            isConnected = true; // Mark as connected
            console.log("Connected to MongoDB Atlas!");
        }
    } catch (error) {
        console.error("Error connecting to MongoDB Atlas:", error);
    }
}

async function listCollections(databaseName) {
    try {
        const database = client.db(databaseName);
        const collections = await database.listCollections().toArray();
        console.log("Collections in the database:");
        collections.forEach(collection => {
            console.log(`- ${collection.name}`);
        });
    } catch (error) {
        console.error("Error listing collections:", error);
    }
}

async function createCollection(databaseName, collectionName) {
    try {
        const database = client.db(databaseName);
        const collections = await database.listCollections().toArray();
        const collectionExists = collections.some(collection => collection.name === collectionName);
        
        if (!collectionExists) {
            await database.createCollection(collectionName);
            console.log(`Collection '${collectionName}' created.`);
        } else {
            console.log(`Collection '${collectionName}' already exists.`);
        }
    } catch (error) {
        console.error("Error creating collection:", error);
    }
}

async function fetchDocuments(databaseName, collectionName) {
    try {
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);
        const documents = await collection.find({}).toArray(); // Fetch all documents
        
        console.log(`Documents in the collection '${collectionName}':`);
        documents.forEach(doc => {
            console.log(doc);
        });
    } catch (error) {
        console.error("Error fetching documents:", error);
    }
}

async function closeConnection() {
    if (isConnected) {
        await client.close();
        console.log("MongoDB connection closed.");
    }
}

// Main function to execute the tasks
async function main() {
    await connectToDatabase();

    // Specify your database name
    const databaseName = 'Courses-Management-System'; // Replace with your actual database name
    await listCollections(databaseName);
    
    // Create the collection 'Registration Forms'
    const collectionName = 'Registration Forms'; 
    await createCollection(databaseName, collectionName);
    
    // Fetch and display documents in the newly created collection
    //await fetchDocuments(databaseName, collectionName);
    
    await closeConnection();
}

// Call the main function to execute
main();
