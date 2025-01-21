const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      title: { type: String, required: true },
      size: { type: String, required: true }, // المقاس
      color: { type: String, required: true }, // اللون
      quantity: { type: Number, required: true }, // الكمية المطلوبة
      price: { type: Number, required: true }, // سعر الوحدة
      total: { type: Number, required: true }, // الإجمالي لهذا المنتج
    },
  ],
  totalAmount: { type: Number, required: true }, // الإجمالي الكامل للفاتورة
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Invoice", invoiceSchema);
