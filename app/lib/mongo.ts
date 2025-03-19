import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * MongoDB connection details.
 */
const MONGODB_URL = process.env.MONGODB_URL as string;
const DB_NAME = process.env.DB_NAME as string;

/**
 * MongoClient instance used to connect to MongoDB.
 */
const client = new MongoClient(MONGODB_URL);

/**
 * MongoDB database instance.
 */
const db = client.db(DB_NAME);

// Export the client, database, and collections for use in other parts of the application
export { client, db};