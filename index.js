const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Localhost testing-এ DNS ইস্যু থাকলে নিরাপদভাবে সেট করা
const dns = require('dns');
if (process.env.NODE_ENV !== 'production') {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

// Middleware setup (CORS-এ Frontend Origin দিন)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.svgbh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("cafe-boss-DB");
  }
  return db;
}

app.get("/", (req, res) => {
  res.send("Cafe Boss Server Running");
});

app.get("/menu", async (req, res) => {
  try {
    const database = await connectDB();
    const menuCollection = database.collection("menu");
    const result = await menuCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error("Menu fetch error:", error);
    res.status(500).send({ message: "Failed to fetch menu" });
  }
});

app.get("/reviews", async (req, res) => {
  try {
    const database = await connectDB();
    const reviewCollection = database.collection("reviews");
    const result = await reviewCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error("Reviews fetch error:", error);
    res.status(500).send({ message: "Failed to fetch reviews" });
  }
});

// Vercel serverless-এর জন্য এটি প্রয়োজন
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}















// const dns = require('dns');
// dns.setServers(['8.8.8.8', '8.8.4.4']);

// const express = require("express");
// const cors = require("cors");
// const { MongoClient, ServerApiVersion } = require("mongodb");
// require("dotenv").config();

// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(cors({
//   origin: 'http://localhost:5173',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true
// }));
// app.use(express.json());

// // MongoDB Connection URI
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.svgbh.mongodb.net/?appName=Cluster0`;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     // Connect the client to the server
//     // await client.connect();

//     const menuCollection = client.db("cafe-boss-BD").collection("menu");
//     const reviewsCollection = client.db("cafe-boss-BD").collection("reviews");

//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");

//     app.get("/menu", async(req, res)=> {
//         const result = await menuCollection.find().toArray();
//         res.send(result)
//     })

//     app.get("/reviews", async(req, res)=> {
//         const result = await reviewsCollection.find().toArray();
//         res.send(result)
//     })

//   } finally {
     
//   }
// }
// run().catch(console.dir);


// // Root Route
// app.get("/", (req, res) => {
//   res.send("Cafe Boss Restaurant Server is running...");
// });


// app.listen(port, () => {
//   console.log(`Server is running on port: ${port}`);
// });