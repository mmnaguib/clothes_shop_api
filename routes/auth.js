const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

const JWT_SECRET = "tia_secret_key";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Authorization APIs
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 description: The user's username.
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 description: The user's password.
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   description: JWT token.
 *       401:
 *         description: Invalid password.
 *       404:
 *         description: User not found.
 */
router.post("/login", async (req, res) => {
  try {
    const { userName, password } = req.body;

    // التحقق من وجود المستخدم
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({ message: "Invalid password" });
    }

    // إنشاء JWT
    const token = jwt.sign(
      {
        id: user._id,
        userName: user.userName,
        isAdmin: user.isAdmin,
      },
      JWT_SECRET,
      { expiresIn: "1h" } // مدة صلاحية التوكن
    );

    res.status(200).send({ message: "Login successful", token });
  } catch (error) {
    toast.error("Error during login:", error);
    res.status(500).send({ message: "Internal server error", error });
  }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 description: The new user's username.
 *                 example: "newuser"
 *               password:
 *                 type: string
 *                 description: The new user's password.
 *                 example: "password123"
 *               isAdmin:
 *                 type: boolean
 *                 description: Whether the user is an admin.
 *                 example: false
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *       400:
 *         description: User already exists.
 */
router.post("/register", async (req, res) => {
  try {
    const { userName, password, isAdmin } = req.body;

    // التحقق من وجود المستخدم مسبقًا
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      return res.status(400).send({ message: "User already exists" });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء مستخدم جديد
    const newUser = new User({
      userName,
      password: hashedPassword,
      isAdmin: isAdmin || false,
    });

    await newUser.save();
    res.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    toast.error("Error during registration:", error);
    res.status(500).send({ message: "Internal server error", error });
  }
});

module.exports = router;
