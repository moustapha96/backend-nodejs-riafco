
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
  requireRole(["ADMIN", "GUEST", "SUPER_ADMIN", "MEMBER"]),
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
  requireRole(["ADMIN","GUEST", "SUPER_ADMIN", "MEMBER"]),
  commentController.toggleLikeComment,
)

// POST /api/comments/:id/reply - Reply to comment
router.post(
  "/:id/reply",
  requireAuth,
  requireRole(["ADMIN", "GUEST", "SUPER_ADMIN", "MEMBER"]),
  commentValidationRules,
  commentController.replyToComment,
)

// GET /api/comments/:id/replies - Get replies to comment
router.get("/:id/replies", commentController.getCommentReplies)

// POST /api/comments/:id/report - Report comment
router.post(
  "/:id/report",
  requireAuth,
  requireRole(["ADMIN", "GUEST", "SUPER_ADMIN", "MEMBER"]),
  body("reason").trim().isLength({ min: 5 }).withMessage("Report reason is required"),
  commentController.reportComment,
)

module.exports = router
