const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");

// إعداد Express
const app = express();

// جعل مسار الصور المرفوعة متاحًا للجميع
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.json());

app.use(cors());

// اتصال بـ MongoDB
mongoose.connect("mongodb://localhost:27017/myDatabase", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// إعدادات Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Clothes Shop API",
      version: "1.0.0",
      description: "API documentation for managing categories",
      contact: {
        name: "Your Name",
        email: "your.email@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./routes/*.js"], // مكان ملفات التوثيق
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Import Routes
const categoryRoutes = require("./routes/categories");
const productRoutes = require("./routes/products");
const authRoutes = require("./routes/auth");
const companyRoutes = require("./routes/companies");
const invoiceRoutes = require("./routes/invoices");
// استخدام الـ Routes
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use("/auth", authRoutes);
app.use("/companies", companyRoutes);
app.use("/invoices", invoiceRoutes);
// بدء السيرفر
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
