import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const files: File[] = data.getAll("files") as unknown as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files received." }, { status: 400 })
    }

    const uploadedFiles: string[] = []

    // Check if running in a Vercel production environment
    const isVercelProduction = process.env.VERCEL_ENV === "production"

    for (const file of files) {
      const timestamp = Date.now()
      const uniqueFilename = `${timestamp}-${file.name.replace(/\s+/g, "-")}`

      if (isVercelProduction) {
        // --- PRODUCTION LOGIC: Upload to Vercel Blob ---
        const blob = await put(uniqueFilename, file, {
          access: "public",
        })
        uploadedFiles.push(blob.url)
      } else {
        // --- LOCAL DEVELOPMENT LOGIC: Save to public/uploads ---
        const uploadsDir = join(process.cwd(), "public/uploads")
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const path = join(uploadsDir, uniqueFilename)
        await writeFile(path, buffer)

        const publicUrl = `/uploads/${uniqueFilename}`
        uploadedFiles.push(publicUrl)
      }
    }

    return NextResponse.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    })
  } catch (error) {
    console.error("❌ Error uploading files:", error)
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 })
  }
}
