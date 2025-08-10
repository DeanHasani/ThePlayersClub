import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  console.log("Received request to /api/upload")

  try {
    const data = await request.formData()
    const files: File[] = data.getAll("files") as unknown as File[]

    if (!files || files.length === 0) {
      console.error("No files found in the request.")
      return NextResponse.json({ error: "No files received." }, { status: 400 })
    }
    console.log(`Found ${files.length} file(s) to process.`)

    const uploadedFiles: string[] = []

    // This is a reliable way to check if we are on Vercel
    const isVercel = !!process.env.VERCEL_URL
    console.log(`Is Vercel environment? ${isVercel}`)

    if (isVercel) {
      console.log("Checking for BLOB_READ_WRITE_TOKEN...")
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error("FATAL: BLOB_READ_WRITE_TOKEN is not set in the Vercel environment.")
        return NextResponse.json({ error: "Server configuration error: Missing storage token." }, { status: 500 })
      }
      console.log("BLOB_READ_WRITE_TOKEN is present.")
    }

    for (const file of files) {
      const timestamp = Date.now()
      const uniqueFilename = `${timestamp}-${file.name.replace(/\s+/g, "-")}`

      if (isVercel) {
        // --- PRODUCTION LOGIC: Upload to Vercel Blob ---
        console.log(`🚀 Vercel mode: Uploading ${uniqueFilename} to Vercel Blob...`)
        const blob = await put(uniqueFilename, file, {
          access: "public",
        })
        uploadedFiles.push(blob.url)
        console.log(`✅ Successfully uploaded to Vercel Blob: ${blob.url}`)
      } else {
        // --- LOCAL DEVELOPMENT LOGIC: Save to public/uploads ---
        console.log(`🛠️ Local mode: Saving ${uniqueFilename} to public/uploads...`)
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
        console.log(`✅ Successfully saved locally: ${publicUrl}`)
      }
    }

    return NextResponse.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    })
  } catch (error) {
    console.error("❌ Error in /api/upload:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: `Failed to upload files: ${errorMessage}` }, { status: 500 })
  }
}
