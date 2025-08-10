"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Upload } from "lucide-react"

interface ColorForm {
  name: string
  value: string
  images: {
    front: string
    back: string
    optional: string[]
  }
}

interface ColorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (color: ColorForm) => void
  editingColor?: ColorForm | null
}

export default function ColorModal({ isOpen, onClose, onSave, editingColor }: ColorModalProps) {
  const [color, setColor] = useState<ColorForm>(
    editingColor || {
      name: "",
      value: "",
      images: {
        front: "/placeholder.png",
        back: "/placeholder.png",
        optional: [],
      },
    },
  )
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (file: File, imageType: "front" | "back") => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("files", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      const imageUrl = data.files[0]

      setColor((prev) => ({
        ...prev,
        images: {
          ...prev.images,
          [imageType]: imageUrl,
        },
      }))

      if (typeof window !== "undefined" && (window as any).showToast) {
        ;(window as any).showToast(`${imageType} image uploaded successfully!`, "success")
      }
    } catch (error) {
      if (typeof window !== "undefined" && (window as any).showToast) {
        ;(window as any).showToast("Failed to upload image", "error")
      }
    } finally {
      setUploading(false)
    }
  }

  const handleSave = () => {
    if (!color.name.trim()) {
      if (typeof window !== "undefined" && (window as any).showToast) {
        ;(window as any).showToast("Color name is required", "error")
      }
      return
    }

    if (color.images.front === "/placeholder.png" || color.images.back === "/placeholder.png") {
      if (typeof window !== "undefined" && (window as any).showToast) {
        ;(window as any).showToast("Both front and back images are required", "error")
      }
      return
    }

    const finalColor = {
      ...color,
      value: color.value || color.name.toLowerCase().replace(/\s+/g, "-"),
    }

    onSave(finalColor)
    onClose()

    // Reset form
    setColor({
      name: "",
      value: "",
      images: {
        front: "/placeholder.png",
        back: "/placeholder.png",
        optional: [],
      },
    })
  }

  const handleClose = () => {
    onClose()
    // Reset form
    setColor({
      name: "",
      value: "",
      images: {
        front: "/placeholder.png",
        back: "/placeholder.png",
        optional: [],
      },
    })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white border-2 border-black w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b-2 border-black">
            <h2 className="text-xl font-bold tracking-wider">{editingColor ? "EDIT COLOR" : "ADD COLOR"}</h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Color Name */}
            <div className="space-y-2">
              <Label htmlFor="colorName" className="text-sm font-bold tracking-wider">
                COLOR NAME
              </Label>
              <Input
                id="colorName"
                value={color.name}
                onChange={(e) => setColor((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Black, White, Red"
                className="border-2 border-gray-300 focus:border-black"
              />
            </div>

            {/* Color Value */}
            <div className="space-y-2">
              <Label htmlFor="colorValue" className="text-sm font-bold tracking-wider">
                COLOR VALUE (OPTIONAL)
              </Label>
              <Input
                id="colorValue"
                value={color.value}
                onChange={(e) => setColor((prev) => ({ ...prev, value: e.target.value }))}
                placeholder="e.g., black, white, red (auto-generated if empty)"
                className="border-2 border-gray-300 focus:border-black"
              />
            </div>

            {/* Images */}
            <div className="grid grid-cols-2 gap-4">
              {/* Front Image */}
              <div className="space-y-2">
                <Label className="text-sm font-bold tracking-wider">FRONT IMAGE</Label>
                <div className="border-2 border-dashed border-gray-300 p-4 text-center">
                  {color.images.front !== "/placeholder.png" ? (
                    <div className="space-y-2">
                      <img
                        src={color.images.front || "/placeholder.svg"}
                        alt="Front view"
                        className="w-20 h-20 object-cover mx-auto border-2 border-gray-300"
                      />
                      <p className="text-xs text-green-600 font-bold">✅ UPLOADED</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-xs text-gray-500 font-medium">UPLOAD FRONT</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, "front")
                    }}
                    className="mt-2 text-xs"
                    disabled={uploading}
                  />
                </div>
              </div>

              {/* Back Image */}
              <div className="space-y-2">
                <Label className="text-sm font-bold tracking-wider">BACK IMAGE</Label>
                <div className="border-2 border-dashed border-gray-300 p-4 text-center">
                  {color.images.back !== "/placeholder.png" ? (
                    <div className="space-y-2">
                      <img
                        src={color.images.back || "/placeholder.svg"}
                        alt="Back view"
                        className="w-20 h-20 object-cover mx-auto border-2 border-gray-300"
                      />
                      <p className="text-xs text-green-600 font-bold">✅ UPLOADED</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-xs text-gray-500 font-medium">UPLOAD BACK</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, "back")
                    }}
                    className="mt-2 text-xs"
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t-2 border-black">
            <div className="flex space-x-3">
              <Button
                onClick={handleSave}
                disabled={uploading}
                className="flex-1 bg-black text-white hover:bg-gray-800 font-bold tracking-wider"
              >
                {uploading ? "UPLOADING..." : "SAVE COLOR"}
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-2 border-black text-black hover:bg-black hover:text-white font-bold tracking-wider bg-transparent"
              >
                CANCEL
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
