const router = require("express").Router()
const { body } = require("express-validator")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const newsController = require("../controllers/news.controller")
const { requireAuth, requireRole } = require("../middleware/auth.middleware")

// Ensure upload directory exists
const uploadDir = "uploads/news"
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "galleries") {
            const galleryDir = "uploads/news/galleries";
            if (!fs.existsSync(galleryDir)) {
                fs.mkdirSync(galleryDir, { recursive: true });
            }
            cb(null, galleryDir);
        } else {
            cb(null, "uploads/news");
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "news-" + uniqueSuffix + path.extname(file.originalname));
    },
});

// // Configure multer for news image uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir)
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
//     cb(null, "news-" + uniqueSuffix + path.extname(file.originalname))
//   },
// })

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
const createNewsValidation = [
    body("title").trim().isLength({ min: 3, max: 200 }).withMessage("Title must be between 3 and 200 characters"),
    body("content").trim().isLength({ min: 50 }).withMessage("Content must be at least 50 characters"),
    body("status").optional().isIn(["PUBLISHED", "DRAFT"]).withMessage("Invalid status"),
    body("publishedAt").optional().isISO8601().withMessage("Please provide a valid publication date"),
]

const updateNewsValidation = [
    body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
    body("content").optional().trim().isLength({ min: 50 }).withMessage("Content must be at least 50 characters"),
    body("status").optional().isIn(["PUBLISHED", "DRAFT"]).withMessage("Invalid status"),
    body("publishedAt").optional().isISO8601().withMessage("Please provide a valid publication date"),
]


/**
 * @swagger
 * tags:
 *   name: News
 *   description: News management
 */


/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Get all news (public)
 *     tags: [News]
 *     responses:
 *       200:
 *         description: List of news
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/", newsController.getAllNews);

/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     summary: Get news item by ID (public)
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News ID
 *     responses:
 *       200:
 *         description: News item details
 */
router.get("/:id", newsController.getNewsItem);

/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Create a news item (Admin/Moderator only)
 *     tags: [News]
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
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PUBLISHED, DRAFT]
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: News created
 */
router.post("/",
    requireAuth,
    requireRole(["ADMIN", "SUPER_ADMIN", "MEMBER"]),
    // upload.single("image"),
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "galleries", maxCount: 10 },
    ]),
    newsController.createNews);


/**
 * @swagger
 * /api/news/{id}:
 *   put:
 *     summary: Update a news item (Admin/Moderator only)
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PUBLISHED, DRAFT]
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: News updated
 */
router.put("/:id",
    requireAuth,
    requireRole(["ADMIN", "SUPER_ADMIN", "MEMBER"]),
    // upload.single("image"),
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "galleries", maxCount: 10 },
    ]),
    newsController.updateNews);

/**
 * @swagger
 * /api/news/{id}:
 *   delete:
 *     summary: Delete a news item (Admin/Moderator only)
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: News ID
 *     responses:
 *       200:
 *         description: News deleted
 */
router.delete("/:id", requireAuth, requireRole(["ADMIN", "SUPER_ADMIN"]), newsController.deleteNews);

router.put("/:id/validated", requireAuth, newsController.updateValidated);

router.put("/:id/status", requireAuth, newsController.updateStatus);

module.exports = router;