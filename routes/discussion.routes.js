const router = require("express").Router();
const { body } = require("express-validator");
const discussionController = require("../controllers/discussion.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

// Validation rules
const discussionValidationRules = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("content")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Content must be at least 5 characters long"),
  body("themeId")
    .notEmpty()
    .withMessage("Theme ID is required"),
];

/**
 * @swagger
 * tags:
 *   name: Discussions
 *   description: Discussion management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Discussion:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         slug:
 *           type: string
 *         content:
 *           type: string
 *         theme:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             slug:
 *               type: string
 *         createdBy:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *         _count:
 *           type: object
 *           properties:
 *             comments:
 *               type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - title
 *         - slug
 *         - content
 *         - theme
 *         - createdBy
 *         - createdAt
 *         - updatedAt
 */

/**
 * @swagger
 * /api/discussions:
 *   get:
 *     summary: Get all discussions
 *     tags: [Discussions]
 *     parameters:
 *       - in: query
 *         name: themeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter discussions by theme ID
 *     responses:
 *       200:
 *         description: List of discussions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 discussions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Discussion'
 *       500:
 *         description: Error fetching discussions
 */
router.get("/", discussionController.getAllDiscussions);


router.get("/theme/:id", discussionController.getAllDiscussionsTheme);


/**
 * @swagger
 * /api/discussions:
 *   post:
 *     summary: Create a discussion
 *     tags: [Discussions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - themeId
 *             properties:
 *               title:
 *                 type: string
 *                 example: "First discussion"
 *               content:
 *                 type: string
 *                 example: "This is the first discussion content."
 *               themeId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Discussion created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Discussion'
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Error creating discussion
 */
router.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "MODERATOR", "MEMBER"]),
  discussionValidationRules,
  discussionController.createDiscussion
);

/**
 * @swagger
 * /api/discussions/{discussionId}/comments:
 *   post:
 *     summary: Create a comment for a discussion
 *     tags: [Discussions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: discussionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the discussion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "This is a comment"
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Discussion not found
 *       500:
 *         description: Error creating comment
 */
router.post(
  "/:discussionId/comments",
  requireAuth,
  requireRole(["ADMIN", "MODERATOR", "MEMBER"]),
  body("content").trim().isLength({ min: 2 }).withMessage("Content is required"),
  discussionController.createComment
);


/**
 * @swagger
 * /api/discussions/with-comments:
 *   get:
 *     summary: Récupérer toutes les discussions avec leurs commentaires
 *     tags: [Discussions]
 *     parameters:
 *       - in: query
 *         name: themeId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *         description: Filtrer les discussions par thème
 *     responses:
 *       200:
 *         description: Liste des discussions avec leurs commentaires
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Discussion'
 *       500:
 *         description: Erreur lors de la récupération des discussions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve discussions with comments"
 *                 error:
 *                   type: string
 */
router.get("/theme/:id/with-comments", discussionController.getDiscussionsWithComments);
module.exports = router;
