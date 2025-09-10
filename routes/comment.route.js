// const router = require("express").Router({ mergeParams: true });
// const { body } = require("express-validator");
// const commentController = require("../controllers/comment.controller");
// const { requireAuth, requireRole } = require("../middleware/auth.middleware");

// // Validation rules
// const commentValidationRules = [
//   body("content").trim().isLength({ min: 2, max: 2000 }).withMessage("Content must be between 2 and 2000 characters"),
// ];

// // Routes
// /**
//  * @swagger
//  * tags:
//  *   name: Comments
//  *   description: Comment management
//  */

// /**
//  * @swagger
//  * components:
//  *   schemas:
//  *     Comment:
//  *       type: object
//  *       properties:
//  *         id:
//  *           type: string
//  *           format: uuid
//  *           description: The auto-generated ID of the comment
//  *         content:
//  *           type: string
//  *           description: The content of the comment
//  *         discussionId:
//  *           type: string
//  *           format: uuid
//  *           description: The ID of the discussion this comment belongs to
//  *         createdBy:
//  *           type: object
//  *           properties:
//  *             id:
//  *               type: string
//  *               format: uuid
//  *             firstName:
//  *               type: string
//  *             lastName:
//  *               type: string
//  *             profilePic:
//  *               type: string
//  *               nullable: true
//  *         createdAt:
//  *           type: string
//  *           format: date-time
//  *           description: The date and time when the comment was created
//  *         updatedAt:
//  *           type: string
//  *           format: date-time
//  *           description: The date and time when the comment was last updated
//  *       required:
//  *         - id
//  *         - content
//  *         - discussionId
//  *         - createdBy
//  *         - createdAt
//  *         - updatedAt
//  */

// /**
//  * @swagger
//  * /api/discussions/{discussionId}/comments:
//  *   get:
//  *     summary: Get all comments for a discussion
//  *     tags: [Comments]
//  *     parameters:
//  *       - in: path
//  *         name: discussionId
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *         description: The ID of the discussion
//  *     responses:
//  *       200:
//  *         description: A list of comments
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/Comment'
//  *       500:
//  *         description: Error fetching comments
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: false
//  *                 message:
//  *                   type: string
//  *                   example: "Error fetching comments"
//  *                 error:
//  *                   type: string
//  *                   example: "Detailed error message"
//  */
// router.get("/", commentController.getAllComments);

// /**
//  * @swagger
//  * /api/discussions/{discussionId}/comments:
//  *   post:
//  *     summary: Create a new comment
//  *     tags: [Comments]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: discussionId
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *         description: The ID of the discussion
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - content
//  *             properties:
//  *               content:
//  *                 type: string
//  *                 example: "This is a comment"
//  *     responses:
//  *       201:
//  *         description: Comment created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 message:
//  *                   type: string
//  *                   example: "Comment created successfully"
//  *                 data:
//  *                   $ref: '#/components/schemas/Comment'
//  *       400:
//  *         description: Validation failed
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: false
//  *                 message:
//  *                   type: string
//  *                   example: "Validation failed"
//  *                 errors:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *       401:
//  *         description: Unauthorized
//  *       403:
//  *         description: Forbidden
//  *       404:
//  *         description: Discussion not found
//  *       500:
//  *         description: Error creating comment
//  */
// router.post(
//   "/",
//   requireAuth,
//   requireRole(["ADMIN", "MODERATOR", "MEMBER"]),
//   commentValidationRules,
//   commentController.createComment
// );

// /**
//  * @swagger
//  * /api/comments/{id}:
//  *   put:
//  *     summary: Update a comment
//  *     tags: [Comments]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *         description: The ID of the comment
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - content
//  *             properties:
//  *               content:
//  *                 type: string
//  *                 example: "Updated comment content"
//  *     responses:
//  *       200:
//  *         description: Comment updated successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 message:
//  *                   type: string
//  *                   example: "Comment updated successfully"
//  *                 data:
//  *                   $ref: '#/components/schemas/Comment'
//  *       400:
//  *         description: Validation failed
//  *       401:
//  *         description: Unauthorized
//  *       403:
//  *         description: Not authorized to update this comment
//  *       404:
//  *         description: Comment not found
//  *       500:
//  *         description: Error updating comment
//  */
// router.put(
//   "/:id",
//   requireAuth,
//   commentValidationRules,
//   commentController.updateComment
// );

// /**
//  * @swagger
//  * /api/comments/{id}:
//  *   delete:
//  *     summary: Delete a comment
//  *     tags: [Comments]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: uuid
//  *         description: The ID of the comment
//  *     responses:
//  *       200:
//  *         description: Comment deleted successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 message:
//  *                   type: string
//  *                   example: "Comment deleted successfully"
//  *       401:
//  *         description: Unauthorized
//  *       403:
//  *         description: Not authorized to delete this comment
//  *       404:
//  *         description: Comment not found
//  *       500:
//  *         description: Error deleting comment
//  */
// router.delete("/:id", requireAuth, commentController.deleteComment);

// module.exports = router;

const router = require("express").Router()
const { body, param } = require("express-validator")
const commentController = require("../controllers/comment.controller")
const { requireAuth, requireRole } = require("../middleware/auth.middleware")

// Validation rules
const commentValidationRules = [
  body("content").trim().isLength({ min: 2, max: 1000 }).withMessage("Content must be between 2 and 1000 characters"),
]

// GET /api/comments - Get all comments (with pagination)
router.get("/", commentController.getAllComments)

// GET /api/comments/:id - Get comment by ID
router.get("/:id", commentController.getCommentById)

// GET /api/comments/discussion/:discussionId - Get comments by discussion
router.get("/discussion/:discussionId", commentController.getCommentsByDiscussion)

// GET /api/comments/user/:userId - Get comments by user
router.get("/user/:userId", commentController.getCommentsByUser)

// POST /api/comments - Create new comment
router.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "MODERATOR", "MEMBER"]),
  [...commentValidationRules, body("discussionId").notEmpty().withMessage("Discussion ID is required")],
  commentController.createComment,
)

// PUT /api/comments/:id - Update comment
router.put("/:id", requireAuth, commentValidationRules, commentController.updateComment)

// DELETE /api/comments/:id - Delete comment
router.delete("/:id", requireAuth, commentController.deleteComment)

// POST /api/comments/:id/like - Like/unlike comment
router.post(
  "/:id/like",
  requireAuth,
  requireRole(["ADMIN", "MODERATOR", "MEMBER"]),
  commentController.toggleLikeComment,
)

// POST /api/comments/:id/reply - Reply to comment
router.post(
  "/:id/reply",
  requireAuth,
  requireRole(["ADMIN", "MODERATOR", "MEMBER"]),
  commentValidationRules,
  commentController.replyToComment,
)

// GET /api/comments/:id/replies - Get replies to comment
router.get("/:id/replies", commentController.getCommentReplies)

// POST /api/comments/:id/report - Report comment
router.post(
  "/:id/report",
  requireAuth,
  requireRole(["ADMIN", "MODERATOR", "MEMBER"]),
  body("reason").trim().isLength({ min: 5 }).withMessage("Report reason is required"),
  commentController.reportComment,
)

module.exports = router
