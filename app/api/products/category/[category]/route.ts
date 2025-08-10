import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/lib/models/Product"

export async function GET(request: NextRequest, { params }: { params: { category: string } }) {
  try {
    console.log("🔄 GET /api/products/category/[category] - Starting for:", params.category)

    // Validate category
    const validCategories = ["tshirts", "hoodies", "pants"]
    if (!validCategories.includes(params.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    await connectDB()
    console.log("✅ Database connected for category request")

    const products = await Product.find({ category: params.category }).sort({ createdAt: -1 })
    console.log(`📦 Found ${products.length} products in ${params.category} category`)

    return NextResponse.json(products)
  } catch (error) {
    console.error("❌ GET /api/products/category/[category] error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch products by category",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
