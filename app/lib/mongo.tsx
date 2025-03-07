import { MongoClient } from "mongodb";
import dotenv from "dotenv"

// Load environment variables
dotenv.config();

/**
 * MongoDB connection details.
 *
 * @constant {string} MONGODB_URL - The connection URL for MongoDB.
 * @constant {string} DB_NAME - The name of the database used for storing units.
 */
const MONGODB_URL = process.env.MONGODB_URL as string;
const DB_NAME = process.env.DB_NAME as string;
/**
 * MongoClient instance used to connect to MongoDB.
 *
 * This instance provides access to the database and collection,
 * allowing interaction with the MongoDB server.
 *
 * @constant {MongoClient} client - The MongoDB client instance.
 */
const client = new MongoClient(MONGODB_URL); // MongoDB client initialization

/**
 * MongoDB database instance.
 *
 * Provides access to the database where collections such as "units" can be found.
 *
 * @constant {Db} db - The MongoDB database instance.
 */
const db = client.db(DB_NAME); // Database initialization

/**
 * The MongoDB collection of units.
 *
 * This collection stores information about the units, such as employees or machines,
 * which are listed by their respective fields (name, IP address, etc.).
 *
 * @constant {Collection} units - The collection for storing unit data.
 */
const units = db.collection("units"); // Collection of units within the database

// Export the client, database, and collection for use in other parts of the application
export { client, db, units };
