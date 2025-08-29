const router = require("express").Router()
const { body } = require("express-validator")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const partnerController = require("../controllers/partner.controller")
const { requireAuth, requireRole } = require("../middleware/auth.middleware")

// Ensure upload directory exists
const uploadDir = "uploads/partners"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure multer for partner logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "partner-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"))
    }
  },
})

// Validation rules
const createPartnerValidation = [
  body("name").trim().isLength({ min: 2, max: 200 }).withMessage("Name must be between 2 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),
  body("country").trim().isLength({ min: 2, max: 100 }).withMessage("Country must be between 2 and 100 characters"),
  body("address").optional().trim().isLength({ max: 500 }).withMessage("Address must be less than 500 characters"),
  body("email").optional().isEmail().withMessage("Please provide a valid email"),
  body("phone").optional().trim().isLength({ max: 20 }).withMessage("Phone must be less than 20 characters"),
  body("website").optional().isURL().withMessage("Please provide a valid website URL"),
]

const updatePartnerValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Name must be between 2 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),
  body("country")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Country must be between 2 and 100 characters"),
  body("address").optional().trim().isLength({ max: 500 }).withMessage("Address must be less than 500 characters"),
  body("email").optional().isEmail().withMessage("Please provide a valid email"),
  body("phone").optional().trim().isLength({ max: 20 }).withMessage("Phone must be less than 20 characters"),
  body("website").optional().isURL().withMessage("Please provide a valid website URL"),
]
/**
 * @swagger
 * tags:
 *   name: Partners
 *   description: Partner management
 */



// // Routes
// // Get all partners (public)
// router.get("/", partnerController.getAllPartners)

// // Get partner by ID (public)
// router.get("/:id", partnerController.getPartner)

// // Create new partner (Admin/Moderator only)
// router.post(
//   "/",
//   requireAuth,
//   requireRole(["ADMIN", "MODERATOR"]),
//   upload.single("logo"),
//   createPartnerValidation,
//   partnerController.createPartner,
// )

// // Update partner (Admin/Moderator only)
// router.put(
//   "/:id",
//   requireAuth,
//   requireRole(["ADMIN", "MODERATOR"]),
//   upload.single("logo"),
//   updatePartnerValidation,
//   partnerController.updatePartner,
// )

// // Delete partner (Admin/Moderator only)
// router.delete("/:id", requireAuth, requireRole(["ADMIN", "MODERATOR"]), partnerController.deletePartner)

// module.exports = router
/**
 * @swagger
 * /api/partners:
 *   get:
 *     summary: Get all partners (public)
 *     tags: [Partners]
 *     responses:
 *       200:
 *         description: List of partners
 */
router.get("/", partnerController.getAllPartners);

/**
 * @swagger
 * /api/partners/{id}:
 *   get:
 *     summary: Get partner by ID (public)
 *     tags: [Partners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Partner ID
 *     responses:
 *       200:
 *         description: Partner details
 */
router.get("/:id", partnerController.getPartner);

/**
 * @swagger
 * /api/partners:
 *   post:
 *     summary: Create a partner (Admin/Moderator only)
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               country:
 *                 type: string
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               website:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Partner created
 */
router.post("/", requireAuth, requireRole(["ADMIN", "MODERATOR"]), upload.single("logo"), partnerController.createPartner);

/**
 * @swagger
 * /api/partners/{id}:
 *   put:
 *     summary: Update a partner (Admin/Moderator only)
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Partner ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               country:
 *                 type: string
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               website:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Partner updated
 */
router.put("/:id", requireAuth, requireRole(["ADMIN", "MODERATOR"]), upload.single("logo"), partnerController.updatePartner);

/**
 * @swagger
 * /api/partners/{id}:
 *   delete:
 *     summary: Delete a partner (Admin/Moderator only)
 *     tags: [Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Partner ID
 *     responses:
 *       200:
 *         description: Partner deleted
 */
router.delete("/:id", requireAuth, requireRole(["ADMIN", "MODERATOR"]), partnerController.deletePartner);

module.exports = router;