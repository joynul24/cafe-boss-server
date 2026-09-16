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

// Admin Related APIs
app.get("/users/admin/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const database = await connectDB();
  const usersCollection = await database.collection("users");
  const user = await usersCollection.findOne(query);
  let admin = false;
  if (user) {
    admin = user?.role === "admin";
  }
  res.send({ admin });
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

// User Related APIs
// POST: Save or update user in MongoDB
app.post('/users', async (req, res) => {
  const user = req.body;
  const query = { email: user.email };
  const database = await connectDB();
  const usersCollection = await database.collection("users");
  // Checking if user already exists
  const existingUser = await usersCollection.findOne(query);
  if (existingUser) {
    return res.send({ message: 'User already exists', insertedId: null });
  }

  const result = await usersCollection.insertOne(user);
  res.send(result);
});


app.get("/users", async (req, res) => {
  const database = await connectDB();
  const usersCollection = await database.collection("users");
  const result = await usersCollection.find().toArray();
  res.send(result);
})

app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const database = await connectDB();
  const usersCollection = await database.collection("users");
  const result = await usersCollection.deleteOne(query);
  res.send(result);
})


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