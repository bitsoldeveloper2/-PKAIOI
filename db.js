const { MongoClient } = require("mongodb");

// The connection string comes from the environment (set MONGODB_URI in Hostinger);
// never hardcode credentials here, this file is committed to GitHub.
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "pioai";

let client;
let connecting;

async function connectDB() {
  if (!uri) throw new Error("MONGODB_URI is not set");
  client ??= new MongoClient(uri);
  connecting ??= client.connect();
  await connecting;
  return client.db(dbName);
}

module.exports = { connectDB };
