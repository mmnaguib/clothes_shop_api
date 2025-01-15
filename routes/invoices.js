const express = require("express");
const Invoice = require("../models/invoice");
const Product = require("../models/product"); // تأكد من استيراد نموذج المنتج

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: API for managing invoices
 */

/**
 * @swagger
 * /invoices:
 *   get:
 *     summary: Retrieve all invoices
 *     tags: [Invoices]
 *     responses:
 *       200:
 *         description: A list of all invoices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   customerName:
 *                     type: string
 *                   products:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         productId:
 *                           type: string
 *                         title:
 *                           type: string
 *                         quantity:
 *                           type: number
 *                         price:
 *                           type: number
 *                         total:
 *                           type: number
 *                   totalAmount:
 *                     type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.status(200).send({ invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Retrieve an invoice by ID
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the invoice to retrieve
 *     responses:
 *       200:
 *         description: The requested invoice
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 customerName:
 *                   type: string
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                       title:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       price:
 *                         type: number
 *                       total:
 *                         type: number
 *                 totalAmount:
 *                   type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Invoice not found
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).send({ message: "Invoice not found" });
    }

    res.status(200).send({ invoice });
  } catch (error) {
    console.error("Error fetching invoice by ID:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: Save a new invoice
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *                     total:
 *                       type: number
 *               totalAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Invoice saved successfully.
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
 *                     customerName:
 *                       type: string
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                           title:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           price:
 *                             type: number
 *                           total:
 *                             type: number
 *                     totalAmount:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Internal server error.
 */
router.post("/", async (req, res) => {
  try {
    const { customerName, products, totalAmount } = req.body;

    const invoice = new Invoice({
      customerName,
      products,
      totalAmount,
    });

    await invoice.save();

    // تحديث كميات المنتجات
    for (const product of products) {
      await Product.findByIdAndUpdate(
        product.productId,
        { $inc: { quantity: -product.quantity } }, // إنقاص الكمية
        { new: true }
      );
    }

    res.status(201).send({ message: "Invoice saved successfully", invoice });
  } catch (error) {
    console.error("Error saving invoice:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

module.exports = router;
