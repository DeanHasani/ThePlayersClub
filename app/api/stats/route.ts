import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/lib/models/Product"

export async function GET() {
  try {
    console.log("🔄 GET /api/stats - Starting...")
    await connectDB()
    console.log("✅ Database connected for stats")

    const products = await Product.find({})
    console.log(`📊 Found ${products.length} products for stats`)

    const totalProducts = products.length
    const totalCheckouts = products.reduce((sum, product) => sum + (product.checkoutCount || 0), 0)
    const totalRevenue = products.reduce((sum, product) => sum + (product.checkoutCount || 0) * product.price, 0)

    // Handle case when no products exist
    let mostAddedToBag = null
    let mostCheckout = null

    if (products.length > 0) {
      mostAddedToBag = products.reduce((prev, current) =>
        (prev.addedToBagCount || 0) > (current.addedToBagCount || 0) ? prev : current,
      )

      mostCheckout = products.reduce((prev, current) =>
        (prev.checkoutCount || 0) > (current.checkoutCount || 0) ? prev : current,
      )
    }

    const stats = {
      totalProducts,
      totalCheckouts,
      totalRevenue,
      mostAddedToBag,
      mostCheckout,
    }

    console.log("✅ Stats calculated:", stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("❌ GET /api/stats error:", error)

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        details: error instanceof Error ? error.message : "Unknown error",
        type: error instanceof Error ? error.name : "Unknown",
      },
      { status: 500 },
    )
  }
}
