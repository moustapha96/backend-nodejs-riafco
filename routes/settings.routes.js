const router = require("express").Router();
const { body } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const settingsController = require("../controllers/settings.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");


const uploadDir = "uploads/settings";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "setting-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|ico/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
});

// Validation pour la mise à jour des paramètres
const settingsValidation = [
  body("siteName").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Site name must be between 2 and 100 characters"),
  body("contactEmail").optional().trim().isEmail().withMessage("Contact email must be a valid email address"),
  body("socialMedia").optional().isObject().withMessage("Social media must be an object"),
  body("footer").optional().trim().isLength({ max: 2000 }).withMessage("Footer content must be less than 2000 characters"),
];

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Site settings management
 */


/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get site settings (public)
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Current site settings
 */
router.get("/", settingsController.getSiteSettings);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update site settings (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               siteName:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               socialMedia:
 *                 type: object
 *               footer:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *               favicon:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Site settings updated
 */
router.put(
  "/",
  requireAuth,
  requireRole(["ADMIN","SUPER_ADMIN"]),
  upload.fields([{ name: "logo", maxCount: 1 }, { name: "favicon", maxCount: 1 }]),
  settingsController.updateSiteSettings
);

router.get("/audit-logs",   requireAuth,
  requireRole(["ADMIN", "SUPER_ADMIN"]),
  settingsController.getAuditLogs);

module.exports = router;
