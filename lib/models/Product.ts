import mongoose from "mongoose"

// Clear any existing model to avoid caching issues
delete mongoose.models.Product

const colorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Color name is required"],
  },
  value: {
    type: String,
    required: [true, "Color value is required"],
  },
  images: {
    front: {
      type: String,
      required: [true, "Front image is required"],
    },
    back: {
      type: String,
      required: [true, "Back image is required"],
    },
    optional: {
      type: [String],
      default: [],
    },
  },
})

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["tshirts", "hoodies", "pants"],
        message: "Category must be one of: tshirts, hoodies, pants",
      },
    },
    colors: {
      type: [colorSchema],
      required: [true, "At least one color is required"],
      validate: {
        validator: (colors: any[]) => colors && colors.length > 0,
        message: "At least one color is required",
      },
    },
    sizes: {
      type: [String],
      default: [],
    },
    availableSizes: {
      type: [String],
      required: [true, "Available sizes are required"],
      validate: {
        validator: (sizes: string[]) => sizes && sizes.length > 0,
        message: "At least one size is required",
      },
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    details: {
      type: [String],
      required: [true, "Product details are required"],
      validate: {
        validator: (details: string[]) =>
          details && details.length > 0 && details.some((detail) => detail.trim().length > 0),
        message: "At least one product detail is required",
      },
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      index: true,
    },
    addedToBagCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    checkoutCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for better query performance
productSchema.index({ category: 1 })
productSchema.index({ name: "text", description: "text" })
productSchema.index({ createdAt: -1 })

// Pre-save middleware to generate slug if not provided
productSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
  }
  next()
})

// Virtual for formatted price
productSchema.virtual("formattedPrice").get(function () {
  return `$${this.price.toFixed(2)}`
})

const Product = mongoose.model("Product", productSchema)

export default Product
