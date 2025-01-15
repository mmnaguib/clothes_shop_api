const express = require("express");
const router = express.Router();
const Category = require("../models/category");

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API for managing categories
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Retrieve all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The category ID.
 *                   name:
 *                     type: string
 *                     description: The category name.
 */
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({}, { _id: 1, name: 1 });
    res.send(categories);
  } catch (error) {
    res.status(500).send({ message: "Error fetching categories", error });
  }
});

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Add a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The category name.
 *     responses:
 *       201:
 *         description: Category added successfully.
 */
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const category = new Category({ name });
    await category.save();
    res.status(201).send({ message: "Category added successfully", category });
  } catch (error) {
    res.status(500).send({ message: "Error adding category", error });
  }
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID.
 *     responses:
 *       200:
 *         description: Category deleted successfully.
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.send({ message: "Category deleted successfully", id });
  } catch (error) {
    res.status(500).send({ message: "Error deleting category", error });
  }
});

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the category.
 *     responses:
 *       200:
 *         description: Category updated successfully.
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // تعديل القسم
    const category = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true } // يرجع النسخة المحدثة ويفعل التحقق
    );

    if (!category) {
      return res.status(404).send({ message: "Category not found" });
    }

    res.send({ message: "Category updated successfully", category });
  } catch (error) {
    res.status(500).send({ message: "Error updating category", error });
  }
});

module.exports = router;
