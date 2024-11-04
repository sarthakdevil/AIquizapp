// src/lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = "mongodb://localhost:27017/";
const options = { useNewUrlParser: true, useUnifiedTopology: true };
let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, create a new client for every request
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
} else {
  // In production mode, use a singleton client
  if (!client) {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export { clientPromise };
