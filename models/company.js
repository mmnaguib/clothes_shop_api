const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  image: { type: String, required: true }, // مسار الصورة
});

module.exports = mongoose.model("Company", companySchema);
