const router = require("express").Router()
const { body } = require("express-validator")

const legalController = require("../controllers/legal.controller")
const { requireAuth, requireRole } = require("../middleware/auth.middleware")

// Validation rules
const createLegalValidation = [
  body("type")
    .isIn(["TERMS_OF_SERVICE", "PRIVACY_POLICY", "COOKIE_POLICY", "DISCLAIMER", "COPYRIGHT", "OTHER"])
    .withMessage("Invalid legal type"),
  body("title").trim().isLength({ min: 5, max: 200 }).withMessage("Title must be between 5 and 200 characters"),
  body("content").trim().isLength({ min: 25 }).withMessage("Content must be at least 50 characters"),
  body("language").optional().isLength({ min: 2, max: 5 }).withMessage("Language must be 2-5 characters"),
  body("version").optional().trim().isLength({ max: 20 }).withMessage("Version must be less than 20 characters"),
]

const updateLegalValidation = [
  body("type")
    .optional()
    .isIn(["TERMS_OF_SERVICE", "PRIVACY_POLICY", "COOKIE_POLICY", "DISCLAIMER", "COPYRIGHT", "OTHER"])
    .withMessage("Invalid legal type"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("content").optional().trim().isLength({ min: 50 }).withMessage("Content must be at least 50 characters"),
  body("language").optional().isLength({ min: 2, max: 5 }).withMessage("Language must be 2-5 characters"),
  body("version").optional().trim().isLength({ max: 20 }).withMessage("Version must be less than 20 characters"),
]


/**
 * @swagger
 * tags:
 *   name: Legal
 *   description: Legal mentions management
 */

// Validation rules omitted for Swagger

/**
 * @swagger
 * /api/legal:
 *   get:
 *     summary: Get all legal mentions
 *     tags: [Legal]
 *     responses:
 *       200:
 *         description: List of legal mentions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/", legalController.getAllLegalMentions);

/**
 * @swagger
 * /api/legal/{id}:
 *   get:
 *     summary: Get legal mention by ID
 *     tags: [Legal]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Legal mention ID
 *     responses:
 *       200:
 *         description: Legal mention details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/:id", legalController.getLegalMention);

/**
 * @swagger
 * /api/legal:
 *   post:
 *     summary: Create a new legal mention (Admin only)
 *     tags: [Legal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: ["TERMS_OF_SERVICE", "PRIVACY_POLICY", "COOKIE_POLICY", "DISCLAIMER", "COPYRIGHT", "OTHER"]
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               language:
 *                 type: string
 *               version:
 *                 type: string
 *     responses:
 *       201:
 *         description: Legal mention created
 */
router.post("/", requireAuth, requireRole(["ADMIN"]), createLegalValidation, legalController.createLegalMention);

/**
 * @swagger
 * /api/legal/{id}:
 *   put:
 *     summary: Update a legal mention (Admin only)
 *     tags: [Legal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Legal mention ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: ["TERMS_OF_SERVICE", "PRIVACY_POLICY", "COOKIE_POLICY", "DISCLAIMER", "COPYRIGHT", "OTHER"]
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               language:
 *                 type: string
 *               version:
 *                 type: string
 *     responses:
 *       200:
 *         description: Legal mention updated
 */
router.put("/:id", requireAuth, requireRole(["ADMIN"]), updateLegalValidation, legalController.updateLegalMention);

/**
 * @swagger
 * /api/legal/{id}:
 *   delete:
 *     summary: Delete a legal mention (Admin only)
 *     tags: [Legal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Legal mention ID
 *     responses:
 *       200:
 *         description: Legal mention deleted
 */
router.delete("/:id", requireAuth, requireRole(["ADMIN"]), legalController.deleteLegalMention);

module.exports = router;