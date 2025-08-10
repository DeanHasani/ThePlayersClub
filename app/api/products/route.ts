import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/lib/models/Product"

export async function GET() {
  try {
    console.log("🔄 GET /api/products - Starting...")
    await connectDB()
    console.log("✅ Database connected for GET request")

    const products = await Product.find({}).sort({ createdAt: -1 })
    console.log(`📦 Found ${products.length} products in database`)

    // Log first few products for debugging
    if (products.length > 0) {
      console.log(
        "📋 Sample products:",
        products.slice(0, 2).map((p) => ({
          id: p._id,
          name: p.name,
          price: p.price,
        })),
      )
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error("❌ GET /api/products error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 POST /api/products - Starting...")

    // Connect to database
    await connectDB()
    console.log("✅ Database connected for POST request")

    // Parse request body
    const body = await request.json()
    console.log("📝 Request body received:", JSON.stringify(body, null, 2))

    // Validate required fields
    const requiredFields = ["name", "price", "category", "description"]
    const missingFields = requiredFields.filter((field) => !body[field])

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields)
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
          missingFields,
        },
        { status: 400 },
      )
    }

    // Validate specific field requirements
    if (!body.details || (typeof body.details === "string" && !body.details.trim())) {
      console.error("❌ Product details are required")
      return NextResponse.json(
        {
          error: "Product details are required",
        },
        { status: 400 },
      )
    }

    if (!body.availableSizes || !Array.isArray(body.availableSizes) || body.availableSizes.length === 0) {
      console.error("❌ At least one available size is required")
      return NextResponse.json(
        {
          error: "At least one available size is required",
        },
        { status: 400 },
      )
    }

    if (!body.colors || !Array.isArray(body.colors) || body.colors.length === 0) {
      console.error("❌ At least one color is required")
      return NextResponse.json(
        {
          error: "At least one color is required",
        },
        { status: 400 },
      )
    }

    // Validate color images - check for the correct structure
    for (let i = 0; i < body.colors.length; i++) {
      const color = body.colors[i]
      console.log(`🎨 Validating color ${i}:`, color)

      if (!color.images || typeof color.images !== "object") {
        console.error(`❌ Color ${color.name || i} is missing images object`)
        return NextResponse.json(
          {
            error: `Color "${color.name || i + 1}" must have an images object with front and back properties`,
          },
          { status: 400 },
        )
      }

      if (!color.images.front || !color.images.back) {
        console.error(`❌ Color ${color.name || i} is missing front or back image`)
        return NextResponse.json(
          {
            error: `Color "${color.name || i + 1}" must have both front and back images`,
          },
          { status: 400 },
        )
      }

      if (color.images.front === "/placeholder.png" || color.images.back === "/placeholder.png") {
        console.error(`❌ Color ${color.name || i} has placeholder images`)
        return NextResponse.json(
          {
            error: `Color "${color.name || i + 1}" must have actual images uploaded (not placeholders)`,
          },
          { status: 400 },
        )
      }
    }

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

    console.log("🔗 Generated slug:", slug)

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug })
    if (existingProduct) {
      console.error("❌ Product with this slug already exists:", slug)
      return NextResponse.json(
        {
          error: "A product with this name already exists",
          existingSlug: slug,
        },
        { status: 409 },
      )
    }

    // Process colors to ensure proper structure
    const processedColors = body.colors.map((color: any, index: number) => {
      console.log(`Processing color ${index}:`, color)

      return {
        name: color.name || `Color ${index + 1}`,
        value: color.value || color.name?.toLowerCase().replace(/\s+/g, "-") || `color-${index + 1}`,
        images: {
          front: color.images.front,
          back: color.images.back,
          optional: Array.isArray(color.images.optional)
            ? color.images.optional.filter((img: string) => img && img !== "/placeholder.png")
            : [],
        },
      }
    })

    console.log("🎨 Processed colors:", JSON.stringify(processedColors, null, 2))

    // Process details
    const processedDetails =
      typeof body.details === "string"
        ? body.details.split("\n").filter((d: string) => d.trim())
        : Array.isArray(body.details)
          ? body.details.filter((d: string) => d && d.trim())
          : []

    if (processedDetails.length === 0) {
      console.error("❌ No valid product details found")
      return NextResponse.json(
        {
          error: "Product details are required and cannot be empty",
        },
        { status: 400 },
      )
    }

    // Create product object with all required fields
    const productData = {
      name: body.name.trim(),
      price: Number(body.price),
      images: processedColors.length > 0 ? [processedColors[0].images.front] : ["/placeholder.png"],
      category: body.category,
      colors: processedColors,
      sizes: body.availableSizes, // Use availableSizes for both
      availableSizes: body.availableSizes,
      description: body.description.trim(),
      details: processedDetails,
      inStock: body.inStock !== undefined ? body.inStock : true,
      slug,
      addedToBagCount: 0,
      checkoutCount: 0,
    }

    console.log("📦 Final product data to save:", JSON.stringify(productData, null, 2))

    // Create and validate product
    const product = new Product(productData)

    // Manual validation check
    const validationError = product.validateSync()
    if (validationError) {
      console.error("❌ Mongoose validation error:", validationError)

      const errorDetails = Object.keys(validationError.errors)
        .map((key) => {
          const error = validationError.errors[key]
          return `${key}: ${error.message}`
        })
        .join("; ")

      return NextResponse.json(
        {
          error: "Product validation failed",
          details: errorDetails,
          validationErrors: Object.keys(validationError.errors),
          productData: productData, // Include for debugging
        },
        { status: 400 },
      )
    }

    console.log("✅ Product validation passed, attempting to save...")

    const savedProduct = await product.save()
    console.log("✅ Product created successfully:", savedProduct._id, savedProduct.name)

    return NextResponse.json(savedProduct, { status: 201 })
  } catch (error) {
    console.error("❌ POST /api/products error:", error)

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    // Handle specific MongoDB errors
    if (error instanceof Error && error.name === "ValidationError") {
      // Extract specific validation errors
      const validationErrors = (error as any).errors || {}
      const errorMessages = Object.keys(validationErrors)
        .map((key) => {
          return `${key}: ${validationErrors[key].message}`
        })
        .join("; ")

      return NextResponse.json(
        {
          error: "Product validation failed",
          details: errorMessages,
          validationErrors: Object.keys(validationErrors),
        },
        { status: 400 },
      )
    }

    if (error instanceof Error && error.name === "MongoServerError" && (error as any).code === 11000) {
      return NextResponse.json(
        {
          error: "Product with this name already exists",
          details: error.message,
        },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error instanceof Error ? error.message : "Unknown error",
        type: error instanceof Error ? error.name : "Unknown",
      },
      { status: 500 },
    )
  }
}
