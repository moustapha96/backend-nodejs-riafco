const router = require("express").Router()
const { body } = require("express-validator")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const eventController = require("../controllers/event.controller")
const { requireAuth, requireRole, requirePermission } = require("../middleware/auth.middleware")

// Ensure upload directory exists
const uploadDir = "uploads/events"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure multer for event image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "event-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
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
const createEventValidation = [
  body("title").trim().isLength({ min: 3, max: 200 }).withMessage("Title must be between 3 and 200 characters"),
  body("description").trim().isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
  body("startDate").isISO8601().withMessage("Please provide a valid start date"),
  body("endDate").optional().isISO8601().withMessage("Please provide a valid end date"),
  body("location").optional().trim().isLength({ max: 200 }).withMessage("Location must be less than 200 characters"),
  body("registrationLink").optional().isURL().withMessage("Please provide a valid registration URL"),
  body("status").optional().isIn(["PUBLISHED", "DRAFT"]).withMessage("Invalid status"),
]

const updateEventValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("description").optional().trim().isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
  body("startDate").optional().isISO8601().withMessage("Please provide a valid start date"),
  body("endDate").optional().isISO8601().withMessage("Please provide a valid end date"),
  body("location").optional().trim().isLength({ max: 200 }).withMessage("Location must be less than 200 characters"),
  body("registrationLink").optional().isURL().withMessage("Please provide a valid registration URL"),
  body("status").optional().isIn(["PUBLISHED", "DRAFT"]).withMessage("Invalid status"),
]

const registrationValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
]

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management and registrations
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events (public)
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/", eventController.getAllEvents)
/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID (public)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get("/:id", eventController.getEvent)

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event (Admin/Moderator only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               registrationLink:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PUBLISHED, DRAFT]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Event created
 */
router.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "MODERATOR"]),
  upload.single("image"),
  createEventValidation,
  eventController.createEvent,
)

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update an event (Admin/Moderator only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               registrationLink:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PUBLISHED, DRAFT]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Event updated
 */
router.put(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "MODERATOR"]),
  upload.single("image"),
  updateEventValidation,
  eventController.updateEvent,
)

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete an event (Admin/Moderator only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted
 */
router.delete("/:id", requireAuth, requireRole(["ADMIN", "MODERATOR"]), eventController.deleteEvent)


module.exports = router
