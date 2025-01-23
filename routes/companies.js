const express = require("express");
const multer = require("multer");
const Company = require("../models/company");

const router = express.Router();

// إعداد Multer لتخزين الصور
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/"); // مكان تخزين الصور
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // اسم الصورة مع التوقيت
  },
});

const upload = multer({
  storage: storage,
});

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: API for managing companies
 */

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Retrieve all companies
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: A list of companies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The company ID
 *                   companyName:
 *                     type: string
 *                     description: The name of the company
 *                   mobilePhone:
 *                     type: string
 *                     description: The mobile phone number of the company
 *                   address:
 *                     type: string
 *                     description: The address of the company
 *                   image:
 *                     type: string
 *                     description: The URL of the company image
 */
router.get("/", async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).send({ companies });
  } catch (error) {
    toast.error("Error fetching companies:", error);
    res.status(500).send({ message: "Internal server error", error });
  }
});

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Retrieve a single company by ID
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The company ID
 *     responses:
 *       200:
 *         description: A single company
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The company ID
 *                 companyName:
 *                   type: string
 *                   description: The name of the company
 *                 phoneNumber:
 *                   type: string
 *                   description: The mobile phone number of the company
 *                 address:
 *                   type: string
 *                   description: The address of the company
 *                 image:
 *                   type: string
 *                   description: The URL of the company image
 *       404:
 *         description: Company not found
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).send({ message: "Company not found" });
    }
    res.status(200).send({ company });
  } catch (error) {
    toast.error("Error fetching company:", error);
    res.status(500).send({ message: "Internal server error", error });
  }
});

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Add a new company
 *     tags: [Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: The name of the company
 *               phoneNumber:
 *                 type: string
 *                 description: The mobile phone number of the company
 *               address:
 *                 type: string
 *                 description: The address of the company
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The company logo image
 *     responses:
 *       201:
 *         description: Company added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     companyName:
 *                       type: string
 *                     phoneNumber:
 *                       type: string
 *                     address:
 *                       type: string
 *                     image:
 *                       type: string
 *       500:
 *         description: Internal server error
 */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { companyName, phoneNumber, address } = req.body;

    // التحقق من وجود الصورة
    if (!req.file) {
      return res.status(400).send({ message: "Image is required" });
    }

    // إنشاء كيان الشركة
    const company = new Company({
      companyName,
      phoneNumber,
      address,
      image: req.file.path, // تخزين مسار الصورة
    });

    await company.save();

    res.status(201).send({ message: "Company added successfully", company });
  } catch (error) {
    toast.error("Error adding company:", error);
    res.status(500).send({ message: "Internal server error", error });
  }
});

/**
 * @swagger
 * /companies/{id}:
 *   delete:
 *     summary: Delete a company
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The companies ID.
 *     responses:
 *       200:
 *         description: companies deleted successfully.
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Company.findByIdAndDelete(id);
    res.send({ message: "Company deleted successfully", id });
  } catch (error) {
    res.status(500).send({ message: "Error deleting Company", error });
  }
});

module.exports = router;
