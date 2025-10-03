const router = require("express").Router()
const { body } = require("express-validator")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const resourceController = require("../controllers/resource.controller")
const { requireAuth, requireRole } = require("../middleware/auth.middleware")

// Ensure upload directory exists
const uploadDir = "uploads/resources"
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure multer for resource file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        cb(null, "resource-" + uniqueSuffix + path.extname(file.originalname))
    },
})

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|jpeg|jpg|png|gif|webp|mp4|mp3|zip|rar/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())

        if (extname) {
            return cb(null, true)
        } else {
            cb(new Error("File type not allowed"))
        }
    },
})

// Validation rules
const createResourceValidation = [
    body("title").trim().isLength({ min: 3, max: 200 }).withMessage("Title must be between 3 and 200 characters"),
    body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),
    body("categoryId").optional().isUUID().withMessage("Please provide a valid category ID"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
]

const updateResourceValidation = [
    body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
    body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),
    body("categoryId").optional().isUUID().withMessage("Please provide a valid category ID"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
]

const categoryValidation = [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Category name must be between 2 and 100 characters"),
    body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must be less than 500 characters"),
]



/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: Resource and category management
 */



/**
 * @swagger
 * /api/resources:
 *   get:
 *     summary: Get all resources (public)
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: List of resources
 */
router.get("/", resourceController.getAllResources);

/**
 * @swagger
 * /api/resources/{id}:
 *   get:
 *     summary: Get resource by ID (public)
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource details
 */
router.get("/:id", resourceController.getResource);

/**
 * @swagger
 * /api/resources/{id}/download:
 *   get:
 *     summary: Download resource file (public)
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource file download
 */
router.get("/:id/download", resourceController.downloadResource);


/**
 * @swagger
 * /api/resources:
 *   post:
 *     summary: Create a resource (Admin/Moderator only)
 *     tags: [Resources]
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
 *               categoryId:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Resource created
 */
router.post("/",
    requireAuth,
    requireRole(["ADMIN", "SUPER_ADMIN", "MEMBER"]),
    upload.fields([
        { name: "file", maxCount: 1 },
        { name: "couverture", maxCount: 1 }
    ]),

    resourceController.createResource);

/**
 * @swagger
 * /api/resources/{id}:
 *   put:
 *     summary: Update a resource (Admin/Moderator only)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
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
 *               categoryId:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Resource updated
 */
router.put("/:id",
    requireAuth,
    requireRole(["ADMIN", "SUPER_ADMIN", "MEMBER"]),
    upload.fields([
        { name: "file", maxCount: 1 },
        { name: "couverture", maxCount: 1 }
    ]),
    resourceController.updateResource);

/**
 * @swagger
 * /api/resources/{id}:
 *   delete:
 *     summary: Delete a resource (Admin/Moderator only)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource deleted
 */
router.delete("/:id", requireAuth, requireRole(["ADMIN"]), resourceController.deleteResource);

/**
 * @swagger
 * /api/resources/categories/all:
 *   get:
 *     summary: Get all categories (public)
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/categories/all", resourceController.getAllCategories);

/**
 * @swagger
 * /api/resources/categories:
 *   post:
 *     summary: Create a category (Admin only)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 */
router.post("/categories", requireAuth, requireRole("ADMIN"), resourceController.createCategory);

/**
 * @swagger
 * /api/resources/categories/{id}:
 *   put:
 *     summary: Update a category (Admin only)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 */
router.put("/categories/:id", requireAuth, requireRole("ADMIN"), resourceController.updateCategory);

/**
 * @swagger
 * /api/resources/categories/{id}:
 *   delete:
 *     summary: Delete a category (Admin only)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.delete("/categories/:id", requireAuth, requireRole("ADMIN"), resourceController.deleteCategory);

module.exports = router;