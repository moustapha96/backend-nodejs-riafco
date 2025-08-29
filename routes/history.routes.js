const router = require("express").Router();
const { body } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const historyController = require("../controllers/history.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

// Configuration de Multer pour les uploads d'images et documents
const uploadDir = "uploads/history";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "history-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
});

// Validation pour la création et la mise à jour
const historyValidation = [
  body("date").isISO8601().withMessage("Date must be a valid ISO date"),
  body("title").trim().isLength({ min: 3, max: 200 }).withMessage("Title must be between 3 and 200 characters"),
  body("description").trim().isLength({ min: 3, max: 2000 }).withMessage("Description must be between 3 and 2000 characters"),
];

/**
 * @swagger
 * tags:
 *   name: History
 *   description: Historical items management (images and documents)
 */

// Multer configuration omitted for Swagger

/**
 * @swagger
 * /api/history:
 *   get:
 *     summary: Get all history items
 *     tags: [History]
 *     responses:
 *       200:
 *         description: List of history items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/", historyController.getAllHistoryItems);

/**
 * @swagger
 * /api/history/{id}:
 *   get:
 *     summary: Get history item by ID
 *     tags: [History]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: History item ID
 *     responses:
 *       200:
 *         description: History item details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/:id", historyController.getHistoryItem);

/**
 * @swagger
 * /api/history:
 *   post:
 *     summary: Create a new history item (Admin/Moderator only)
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: History item created
 */
router.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "MODERATOR"]),
  historyController.createHistoryItem
);

/**
 * @swagger
 * /api/history/{id}:
 *   put:
 *     summary: Update a history item (Admin/Moderator only)
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: History item ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: History item updated
 */
router.put(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "MODERATOR"]),
  historyController.updateHistoryItem
);

/**
 * @swagger
 * /api/history/{id}:
 *   delete:
 *     summary: Delete a history item (Admin/Moderator only)
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: History item ID
 *     responses:
 *       200:
 *         description: History item deleted
 */
router.delete("/:id", requireAuth, requireRole(["ADMIN", "MODERATOR"]), historyController.deleteHistoryItem);

module.exports = router;