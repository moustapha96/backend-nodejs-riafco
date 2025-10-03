
/**
 * @swagger
 * tags:
 *   name: Social
 *   description: Social network management
 */

const router = require("express").Router()
const { body } = require("express-validator")

const socialController = require("../controllers/social.controller")
const { requireAuth, requireRole } = require("../middleware/auth.middleware")

// Validation rules
const createSocialValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("platform")
    .isIn(["FACEBOOK", "TWITTER", "LINKEDIN", "INSTAGRAM", "YOUTUBE", "WHATSAPP", "TELEGRAM", "OTHER"])
    .withMessage("Invalid platform"),
  body("url").isURL().withMessage("Please provide a valid URL"),
  body("icon").optional().trim().isLength({ max: 200 }).withMessage("Icon must be less than 200 characters"),
  body("order").optional().isInt({ min: 0 }).withMessage("Order must be a positive integer"),
]

const updateSocialValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("platform")
    .optional()
    .isIn(["FACEBOOK", "TWITTER", "LINKEDIN", "INSTAGRAM", "YOUTUBE", "WHATSAPP", "TELEGRAM", "OTHER"])
    .withMessage("Invalid platform"),
  body("url").optional().isURL().withMessage("Please provide a valid URL"),
  body("icon").optional().trim().isLength({ max: 200 }).withMessage("Icon must be less than 200 characters"),
  body("order").optional().isInt({ min: 0 }).withMessage("Order must be a positive integer"),
]


/**
 * @swagger
 * /api/social:
 *   get:
 *     summary: Get all social networks (public)
 *     tags: [Social]
 *     responses:
 *       200:
 *         description: List of social networks
 */
router.get("/", socialController.getAllSocialNetworks);

/**
 * @swagger
 * /api/social:
 *   post:
 *     summary: Create a new social network (Admin/Moderator only)
 *     tags: [Social]
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
 *               platform:
 *                 type: string
 *                 enum: [FACEBOOK, TWITTER, LINKEDIN, INSTAGRAM, YOUTUBE, WHATSAPP, TELEGRAM, OTHER]
 *               url:
 *                 type: string
 *               icon:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Social network created
 */
router.post("/", requireAuth, requireRole(["ADMIN", "SUPER_ADMIN", "MEMBER"]), createSocialValidation, socialController.createSocialNetwork);

/**
 * @swagger
 * /api/social/{id}:
 *   put:
 *     summary: Update a social network (Admin/Moderator only)
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Social network ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               platform:
 *                 type: string
 *                 enum: [FACEBOOK, TWITTER, LINKEDIN, INSTAGRAM, YOUTUBE, WHATSAPP, TELEGRAM, OTHER]
 *               url:
 *                 type: string
 *               icon:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Social network updated
 */
router.put("/:id", requireAuth, requireRole(["ADMIN", "SUPER_ADMIN", "MEMBER"]), updateSocialValidation, socialController.updateSocialNetwork);

/**
 * @swagger
 * /api/social/{id}:
 *   delete:
 *     summary: Delete a social network (Admin only)
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Social network ID
 *     responses:
 *       200:
 *         description: Social network deleted
 */
router.delete("/:id", requireAuth, requireRole(["ADMIN"]), socialController.deleteSocialNetwork);

module.exports = router;