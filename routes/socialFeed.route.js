const router = require("express").Router();
const { body } = require("express-validator");
const socialFeedController = require("../controllers/socialFeed.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

// Validation rules
const createSocialFeedValidation = [
  body("platform")
    .isIn(["FACEBOOK", "TWITTER", "LINKEDIN", "INSTAGRAM", "YOUTUBE", "WHATSAPP", "TELEGRAM", "OTHER"])
    .withMessage("Invalid platform"),
  body("postId").trim().notEmpty().withMessage("Post ID is required"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("postUrl").trim().isURL().withMessage("Post URL must be a valid URL"),
  body("author").trim().notEmpty().withMessage("Author is required"),
  body("publishedAt").isISO8601().withMessage("Published at must be a valid date"),
];

const updateSocialFeedValidation = [
  body("content").optional().trim().notEmpty().withMessage("Content cannot be empty"),
  body("postUrl").optional().trim().isURL().withMessage("Post URL must be a valid URL"),
  body("author").optional().trim().notEmpty().withMessage("Author cannot be empty"),
  body("publishedAt").optional().isISO8601().withMessage("Published at must be a valid date"),
];

/**
 * @swagger
 * tags:
 *   name: SocialFeed
 *   description: Social feed management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SocialFeed:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         platform:
 *           type: string
 *           enum: [FACEBOOK, TWITTER, LINKEDIN, INSTAGRAM, YOUTUBE, WHATSAPP, TELEGRAM, OTHER]
 *         postId:
 *           type: string
 *         content:
 *           type: string
 *         postUrl:
 *           type: string
 *           format: url
 *         author:
 *           type: string
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/social-feeds:
 *   get:
 *     summary: Get all social feeds
 *     tags: [SocialFeed]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [FACEBOOK, TWITTER, LINKEDIN, INSTAGRAM, YOUTUBE, WHATSAPP, TELEGRAM, OTHER]
 *         description: Filter by platform
 *     responses:
 *       200:
 *         description: List of social feeds
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feeds:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SocialFeed'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get("/", socialFeedController.getAllSocialFeeds);

/**
 * @swagger
 * /api/social-feeds/{id}:
 *   get:
 *     summary: Get social feed by ID
 *     tags: [SocialFeed]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Social feed ID
 *     responses:
 *       200:
 *         description: Social feed details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SocialFeed'
 *       404:
 *         description: Social feed not found
 */
router.get("/:id", socialFeedController.getSocialFeedById);

/**
 * @swagger
 * /api/social-feeds:
 *   post:
 *     summary: Create a new social feed (Admin/Moderator only)
 *     tags: [SocialFeed]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - platform
 *               - postId
 *               - content
 *               - postUrl
 *               - author
 *               - publishedAt
 *             properties:
 *               platform:
 *                 type: string
 *                 enum: [FACEBOOK, TWITTER, LINKEDIN, INSTAGRAM, YOUTUBE, WHATSAPP, TELEGRAM, OTHER]
 *               postId:
 *                 type: string
 *               content:
 *                 type: string
 *               postUrl:
 *                 type: string
 *                 format: url
 *               author:
 *                 type: string
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Social feed created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SocialFeed'
 *       400:
 *         description: Validation error or social feed already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "MODERATOR"]),
  createSocialFeedValidation,
  socialFeedController.createSocialFeed,
);

/**
 * @swagger
 * /api/social-feeds/{id}:
 *   put:
 *     summary: Update a social feed (Admin/Moderator only)
 *     tags: [SocialFeed]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Social feed ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               postUrl:
 *                 type: string
 *                 format: url
 *               author:
 *                 type: string
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Social feed updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SocialFeed'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Social feed not found
 */
router.put(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "MODERATOR"]),
  updateSocialFeedValidation,
  socialFeedController.updateSocialFeed,
);

/**
 * @swagger
 * /api/social-feeds/{id}:
 *   delete:
 *     summary: Delete a social feed (Admin only)
 *     tags: [SocialFeed]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Social feed ID
 *     responses:
 *       200:
 *         description: Social feed deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Social feed not found
 */
router.delete("/:id", requireAuth, requireRole(["ADMIN"]), socialFeedController.deleteSocialFeed);

module.exports = router;
