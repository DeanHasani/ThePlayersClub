import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/lib/models/Product"
import { Types } from "mongoose"
import { del } from "@vercel/blob"
import { unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

// --- Helper function to safely delete local files ---
async function deleteLocalFile(urlPath: string) {
  if (!urlPath || !urlPath.startsWith("/uploads/")) {
    return
  }
  const filename = urlPath.split("/").pop()
  if (!filename) return

  const filePath = join(process.cwd(), "public/uploads", filename)
  try {
    if (existsSync(filePath)) {
      await unlink(filePath)
      console.log(`✅ Successfully deleted local file: ${filePath}`)
    }
  } catch (error) {
    console.error(`⚠️ Error deleting local file ${filePath}:`, error)
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }
    await connectDB()
    const product = await Product.findById(params.id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error("❌ GET /api/products/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }
    await connectDB()
    const body = await request.json()
    if (body.name) {
      body.slug = body.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    }
    if (body.colors) {
      body.colors = body.colors.map((color: any) => ({
        name: color.name,
        value: color.value,
        images: {
          front: color.images?.front || "/placeholder.png",
          back: color.images?.back || "/placeholder.png",
          optional: Array.isArray(color.images?.optional) ? color.images.optional : [],
        },
      }))
    }
    if (body.details && typeof body.details === "string") {
      body.details = body.details.split("\n").filter((d: string) => d.trim())
    }
    const product = await Product.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error("❌ PUT /api/products/[id] error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }
    await connectDB()
    const productToDelete = await Product.findById(params.id)
    if (!productToDelete) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const imageUrls: string[] = []
    productToDelete.colors.forEach((color: any) => {
      if (color.images) {
        const { front, back, optional } = color.images
        if (front && !front.includes("placeholder")) imageUrls.push(front)
        if (back && !back.includes("placeholder")) imageUrls.push(back)
        if (Array.isArray(optional)) {
          optional.forEach((imgUrl: string) => {
            if (imgUrl && !imgUrl.includes("placeholder")) imageUrls.push(imgUrl)
          })
        }
      }
    })

    const isVercelProduction = process.env.VERCEL_ENV === "production"

    if (imageUrls.length > 0) {
      if (isVercelProduction) {
        // --- PRODUCTION LOGIC: Delete from Vercel Blob ---
        const blobUrls = imageUrls.filter((url) => url.includes("blob.vercel-storage.com"))
        if (blobUrls.length > 0) {
          try {
            await del(blobUrls)
            console.log(`✅ Successfully deleted ${blobUrls.length} images from Vercel Blob.`)
          } catch (blobError) {
            console.error("⚠️ Error deleting files from Vercel Blob.", blobError)
          }
        }
      } else {
        // --- LOCAL DEVELOPMENT LOGIC: Delete from public/uploads ---
        console.log(`🗑️ Deleting ${imageUrls.length} local images...`)
        for (const url of imageUrls) {
          await deleteLocalFile(url)
        }
      }
    }

    const deletedProduct = await Product.findByIdAndDelete(params.id)
    if (!deletedProduct) {
      return NextResponse.json({ error: "Failed to delete product from database" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Product and associated images deleted successfully",
      deletedProduct: { id: deletedProduct._id, name: deletedProduct.name },
    })
  } catch (error) {
    console.error("❌ DELETE /api/products/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
