import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/lib/models/Product"

export async function GET() {
  try {
    console.log("🧪 Testing database connection...")
    console.log("🔍 MongoDB URI:", process.env.MONGODB_URI)

    // Test connection with timeout
    const connectionPromise = connectDB()
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Connection timeout after 10 seconds")), 10000)
    })

    await Promise.race([connectionPromise, timeoutPromise])
    console.log("✅ Database connection successful")

    // Test product model
    const productCount = await Product.countDocuments()
    console.log(`📊 Total products in database: ${productCount}`)

    // Test creating a simple document (without saving)
    const testProduct = new Product({
      name: "Test Product",
      price: 99.99,
      category: "tshirts", // This should now work
      description: "Test description",
      details: ["Test detail 1", "Test detail 2"],
      slug: "test-product-" + Date.now(),
      images: ["/placeholder.png"],
      colors: [
        {
          name: "Black",
          value: "black",
          images: {
            front: "/placeholder.png", // This should now be allowed
            back: "/placeholder.png",
            optional: [],
          },
        },
      ],
      sizes: ["S", "M", "L"],
      availableSizes: ["S", "M", "L"],
      inStock: true,
    })

    const validationResult = testProduct.validateSync()
    if (validationResult) {
      console.error("❌ Product model validation failed:", validationResult)
      return NextResponse.json({
        success: false,
        error: "Product model validation failed",
        details: validationResult.message,
      })
    }

    console.log("✅ Product model validation successful")

    return NextResponse.json({
      success: true,
      message: "Database connection and model validation successful",
      productCount,
      connectionState: "Connected",
      mongoUri: process.env.MONGODB_URI?.replace(/\/\/.*@/, "//***:***@") || "Not set",
    })
  } catch (error) {
    console.error("❌ Database test failed:", error)

    let errorMessage = "Unknown error"
    let troubleshooting: string[] = []

    if (error instanceof Error) {
      errorMessage = error.message

      // Provide specific troubleshooting based on error type
      if (error.message.includes("ECONNREFUSED")) {
        troubleshooting = [
          "MongoDB is not running on your system",
          "Start MongoDB with: brew services start mongodb-community (macOS) or sudo systemctl start mongod (Linux)",
          "Or run: mongod --dbpath /usr/local/var/mongodb (manual start)",
        ]
      } else if (error.message.includes("timeout")) {
        troubleshooting = [
          "Connection is timing out",
          "Check if MongoDB is running: ps aux | grep mongod",
          "Verify the port 27017 is not blocked",
        ]
      } else if (error.message.includes("authentication")) {
        troubleshooting = [
          "Authentication failed",
          "Check your MongoDB username and password",
          "Verify database permissions",
        ]
      } else {
        troubleshooting = [
          "Check if MongoDB is installed and running",
          "Verify your MONGODB_URI in .env.local",
          "Try connecting manually: mongo mongodb://127.0.0.1:27017/playersclub",
        ]
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Database test failed",
        details: errorMessage,
        mongoUri: process.env.MONGODB_URI?.replace(/\/\/.*@/, "//***:***@") || "Not set",
        troubleshooting,
      },
      { status: 500 },
    )
  }
}
