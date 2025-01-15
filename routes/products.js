const express = require("express");
const multer = require("multer");
const Product = require("../models/product");

const router = express.Router();

// إعداد Multer لتخزين الصور
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/"); // مكان تخزين الصور
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // اسم الصورة مع التوقيت لضمان عدم تكرار الأسماء
  },
});

// فلترة الملفات (لضمان رفع صور فقط)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true); // السماح برفع الملف
  } else {
    cb(new Error("Invalid file type, only JPEG and PNG are allowed!"), false);
  }
};

// إعداد Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // الحد الأقصى لحجم الصورة 5 ميجابايت
  fileFilter: fileFilter,
});

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API for managing products
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Retrieve all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Product ID.
 *                   title:
 *                     type: string
 *                     description: Product title.
 *                   description:
 *                     type: string
 *                     description: Product description.
 *                   price:
 *                     type: number
 *                     description: Product price.
 *                   quantity:
 *                     type: number
 *                     description: Available quantity.
 *                   sizeId:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: List of size IDs.
 *                   colorId:
 *                     type: array
 *                     items:
 *                       type: number
 *                     description: List of color IDs.
 *                   category:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Category ID.
 *                       name:
 *                         type: string
 *                         description: Category name.
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of image paths.
 */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("categoryId", "_id name");
    res.send({ products });
  } catch (error) {
    res.status(500).send({ message: "Error fetching products", error });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Retrieve a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: A single product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).send({ message: "Product not found" });
    res.send({ product });
  } catch (error) {
    res.status(500).send({ message: "Error fetching product", error });
  }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: JSON string of product data.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the product.
 *     responses:
 *       201:
 *         description: Product created successfully.
 */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId, colorId, sizeId } =
      req.body;

    // تحقق من وجود الصورة
    if (!req.file) {
      return res.status(400).send({ message: "Image is required" });
    }

    // إنشاء المنتج
    const product = new Product({
      title,
      description,
      price,
      quantity,
      categoryId,
      colorId: JSON.parse(colorId), // تحويل النصوص إلى JSON
      sizeId: JSON.parse(sizeId),
      image: req.file.path,
    });

    // حفظ المنتج في قاعدة البيانات
    await product.save();

    res.status(201).send({ message: "Product created successfully", product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: JSON string of product data.
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the product.
 *     responses:
 *       200:
 *         description: Product updated successfully.
 */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = JSON.parse(req.body); // قراءة البيانات من الـ FormData

    if (req.file) {
      updatedData.images = [req.file.path]; // تحديث مسار الصورة الجديدة إذا تم رفعها
    }

    const product = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!product) return res.status(404).send({ message: "Product not found" });

    res.send({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).send({ message: "Error updating product", error });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully.
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) return res.status(404).send({ message: "Product not found" });

    res.send({ message: "Product deleted successfully", product });
  } catch (error) {
    res.status(500).send({ message: "Error deleting product", error });
  }
});

module.exports = router;
