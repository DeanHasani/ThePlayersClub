import mongoose from "mongoose"

// Update the MONGODB_URI assignment and add better error handling
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/playersclub"

console.log("🔍 MongoDB URI:", MONGODB_URI.replace(/\/\/.*@/, "//***:***@"))

if (!MONGODB_URI || MONGODB_URI === "mongodb://127.0.0.1:27017/playersclub") {
  console.warn("⚠️ Using default MongoDB URI. Make sure to set MONGODB_URI in .env.local")
}

// Add global type declaration
declare global {
  var _mongoose: any
}

let cached = global._mongoose

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null }
}

// Increase max listeners to prevent warning
mongoose.connection.setMaxListeners(15)

async function connectDB() {
  if (cached.conn) {
    console.log("♻️ Using existing MongoDB connection")
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    }

    console.log("🔗 Attempting to connect to MongoDB...")
    console.log("📍 Target:", MONGODB_URI.replace(/\/\/.*@/, "//***:***@"))

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("✅ MongoDB connected successfully!")
        console.log("📊 Connection state:", mongoose.connection.readyState)
        console.log("🗄️ Database name:", mongoose.connection.name)
        console.log("🌐 Host:", mongoose.connection.host)
        console.log("🔌 Port:", mongoose.connection.port)
        return mongoose
      })
      .catch((error) => {
        console.error("❌ MongoDB connection error:", error)
        cached.promise = null

        // Provide helpful error messages
        if (error.message.includes("ECONNREFUSED")) {
          console.error("💡 Troubleshooting: MongoDB server is not running")
          console.error("   Try: brew services start mongodb-community (macOS)")
          console.error("   Or: sudo systemctl start mongod (Linux)")
          console.error("   Or: mongod --dbpath /usr/local/var/mongodb")
        } else if (error.message.includes("authentication failed")) {
          console.error("💡 Troubleshooting: Check your MongoDB credentials")
        } else if (error.message.includes("timeout")) {
          console.error("💡 Troubleshooting: Connection timeout - check if MongoDB is accessible")
        }

        throw error
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    console.error("❌ MongoDB connection failed:", e)
    cached.promise = null
    throw e
  }

  return cached.conn
}

// Add connection event listeners only once
let listenersAdded = false

if (!listenersAdded) {
  mongoose.connection.on("connected", () => {
    console.log("🟢 Mongoose connected to MongoDB")
  })

  mongoose.connection.on("error", (err) => {
    console.error("🔴 Mongoose connection error:", err)
  })

  mongoose.connection.on("disconnected", () => {
    console.log("🟡 Mongoose disconnected from MongoDB")
  })

  // Handle process termination
  process.on("SIGINT", async () => {
    try {
      await mongoose.connection.close()
      console.log("🔴 MongoDB connection closed due to app termination")
    } catch (error) {
      console.error("❌ Error closing MongoDB connection:", error)
    }
    process.exit(0)
  })

  process.on("SIGTERM", async () => {
    try {
      await mongoose.connection.close()
      console.log("🔴 MongoDB connection closed due to app termination")
    } catch (error) {
      console.error("❌ Error closing MongoDB connection:", error)
    }
    process.exit(0)
  })

  listenersAdded = true
}

export default connectDB
