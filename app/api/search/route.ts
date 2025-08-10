import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/lib/models/Product"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.trim().length === 0) {
      return NextResponse.json([])
    }

    console.log("🔍 Search query:", query)
    await connectDB()

    const searchTerm = query.trim().toLowerCase()
    const searchWords = searchTerm.split(/\s+/)

    // Create search conditions
    const searchConditions = []

    // 1. Search by product name (partial match)
    searchConditions.push({
      name: { $regex: searchTerm, $options: "i" },
    })

    // 2. Search by category
    const categoryMap: { [key: string]: string } = {
      tshirt: "tshirts",
      tshirts: "tshirts",
      "t-shirt": "tshirts",
      "t-shirts": "tshirts",
      shirt: "tshirts",
      shirts: "tshirts",
      hoodie: "hoodies",
      hoodies: "hoodies",
      sweatshirt: "hoodies",
      sweatshirts: "hoodies",
      pant: "pants",
      pants: "pants",
      trouser: "pants",
      trousers: "pants",
      bottom: "pants",
      bottoms: "pants",
    }

    // Check if any search word matches a category
    for (const word of searchWords) {
      const category = categoryMap[word]
      if (category) {
        searchConditions.push({ category })
      }
    }

    // 3. Search by description
    searchConditions.push({
      description: { $regex: searchTerm, $options: "i" },
    })

    // 4. Search by details
    searchConditions.push({
      details: { $elemMatch: { $regex: searchTerm, $options: "i" } },
    })

    // 5. Combined category + name search
    for (const word of searchWords) {
      const category = categoryMap[word]
      if (category) {
        // Remove the category word and search for the remaining words in product names of that category
        const remainingWords = searchWords.filter((w) => w !== word).join(" ")
        if (remainingWords.length > 0) {
          searchConditions.push({
            $and: [{ category }, { name: { $regex: remainingWords, $options: "i" } }],
          })
        }
      }
    }

    // Execute search with OR conditions
    const products = await Product.find({
      $or: searchConditions,
    }).sort({ createdAt: -1 })

    console.log(`✅ Found ${products.length} products for search: "${query}"`)

    // Remove duplicates based on _id
    const uniqueProducts = products.filter(
      (product, index, self) => index === self.findIndex((p) => p._id.toString() === product._id.toString()),
    )

    return NextResponse.json(uniqueProducts)
  } catch (error) {
    console.error("❌ Search error:", error)
    return NextResponse.json(
      {
        error: "Failed to search products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
