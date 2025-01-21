const mongoose = require("mongoose");

// Sub-schema for size and color details
const sizeColorSchema = new mongoose.Schema({
  size: { type: String, required: true }, // Size of the product
  color: { type: String, required: true }, // Color of the product
  quantity: { type: Number, required: true }, // Quantity available for this size and color
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: [sizeColorSchema], // Array of size and color combinations with quantities
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
