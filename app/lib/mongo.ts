import { MongoClient, Db } from "mongodb"; // Add Db type import
import dotenv from "dotenv";

// Load environment variables from .env.local file
dotenv.config();

// MongoDB connection details
const MONGODB_URL = process.env.MONGODB_URL;
const DB_NAME = process.env.DB_NAME;

// Validate environment variables
if (!MONGODB_URL) {
  throw new Error(
    "Please define the MONGODB_URL environment variable inside .env.local"
  );
}

if (!DB_NAME) {
  throw new Error(
    "Please define the DB_NAME environment variable inside .env.local"
  );
}

// For development purposes, log configuration details
console.log(`MongoDB Database Name: ${DB_NAME}`);
console.log(`Connection URL: ${MONGODB_URL.substring(0, 12)}...`); // Only show beginning for security

// Connection caching
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null; // Use Db type instead of any

/**
 * Creates a cached connection to MongoDB
 * Uses singleton pattern to reuse connections across API routes
 */
export async function connectToDatabase() {
  // If we have a cached connection, return it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Otherwise, create a new connection
  try {
    // Type assertion to tell TypeScript we've already validated this value
    const client = new MongoClient(MONGODB_URL as string);
    await client.connect();
    const db = client.db(DB_NAME as string);
    
    // Test the connection with a ping
    await db.command({ ping: 1 });
    console.log("✅ MongoDB connection successful");
    
    // Cache the connection
    cachedClient = client;
    cachedDb = db;
    
    // Log available collections (for debugging)
    const collections = await db.listCollections().toArray();
    console.log(`Available collections in ${DB_NAME}:`);
    collections.forEach(coll => console.log(` - ${coll.name}`));
    
    return { client, db };
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

// Create a standard client for backward compatibility with existing code
// Using type assertion to tell TypeScript we know these values are defined
const client = new MongoClient(MONGODB_URL as string);
const db = client.db(DB_NAME as string);

// Initialize connection check when the server starts
(async () => {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error("Error initializing MongoDB connection:", error);
    // Don't throw here - allow server to start anyway for non-DB routes
  }
})();

export { client, db };