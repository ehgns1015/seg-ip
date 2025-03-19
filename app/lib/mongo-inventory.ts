import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * MongoDB connection details for inventory management.
 */
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "inventory";

/**
 * MongoClient instance used to connect to MongoDB.
 */
const client = new MongoClient(MONGODB_URL);

/**
 * MongoDB database instance.
 */
const db = client.db(DB_NAME);

/**
 * The MongoDB collection for inventory items.
 * This collection stores information about inventory items across different locations.
 */
const inventory = db.collection("inventory");

// Export the client, database, and collection for use in other parts of the application
export { client, db, inventory };
