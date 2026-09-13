const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const dns = require("dns");
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

// Middleware
app.use(
  cors({
    origin: [
      "https://cafe-boss-client-ten.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.svgbh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Database Connection Caching (Serverless Optmized)
let db;
async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("cafe-boss-DB");
  }
  return db;
}

// Root Route
app.get("/", (req, res) => {
  res.send("Cafe Boss Restaurant Server is running...");
});

// Menu Route
app.get("/menu", async (req, res) => {
  try {
    const database = await connectDB();
    const menuCollection = database.collection("menu");
    const result = await menuCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).send({ message: "Failed to fetch menu items" });
  }
});

// Reviews Route
app.get("/reviews", async (req, res) => {
  try {
    const database = await connectDB();
    const reviewsCollection = database.collection("reviews");
    const result = await reviewsCollection.find().toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).send({ message: "Failed to fetch reviews" });
  }
});

// Cart Collection
app.post("/carts", async (req, res) => {
  const cartItem = req.body;
  const database = await connectDB();
  const cartsCollection = database.collection("carts");
  const result = await cartsCollection.insertOne(cartItem);
  res.send(result)
})

app.get("/carts", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.send([]);
    }
    const query = { email: email }
    const database = await connectDB();
    const cartsCollection = database.collection("carts");
    const result = await cartsCollection.find(query).toArray();
    res.send(result)
  }
  catch (error) {
    console.error("Error fetching carts:", error);
    res.status(500).send({ message: "Failed to fetch reviews" });
  }
})

app.delete("/carts/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid ObjectId format" });
    }

    const database = await connectDB();
    const cartsCollection = database.collection("carts");

    const query = { _id: new ObjectId(id) };
    const result = await cartsCollection.deleteOne(query);

    res.send(result);
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).send({ message: "Failed to delete cart item", error: error.message });
  }
});

// Export for Vercel Serverless
module.exports = app;

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
}