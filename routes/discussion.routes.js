const router = require("express").Router()
const { body, param } = require("express-validator")
const discussionController = require("../controllers/discussion.controller")
const { requireAuth, requireRole } = require("../middleware/auth.middleware")

// Validation rules
const discussionValidationRules = [
  body("title").trim().isLength({ min: 3, max: 200 }).withMessage("Title must be between 3 and 200 characters"),
  body("content").trim().isLength({ min: 5 }).withMessage("Content must be at least 5 characters long"),
  body("themeId").notEmpty().withMessage("Theme ID is required"),
]

// GET /api/discussions - Get all discussions
router.get("/", discussionController.getAllDiscussions)

// GET /api/discussions/:id - Get discussion by ID
router.get("/:id", discussionController.getDiscussionById)

// GET /api/discussions/slug/:slug - Get discussion by slug
router.get("/slug/:slug", discussionController.getDiscussionBySlug)

// GET /api/discussions/theme/:id - Get discussions by theme ID
router.get("/theme/:id", discussionController.getAllDiscussionsTheme)

// GET /api/discussions/theme/:id/with-comments - Get discussions with comments by theme
router.get("/theme/:id/with-comments", discussionController.getDiscussionsWithComments)

// GET /api/discussions/:id/with-comments - Get single discussion with comments
router.get("/:id/with-comments", discussionController.getDiscussionWithComments)

// POST /api/discussions - Create new discussion
router.post(
  "/",
  requireAuth,
  requireRole(["ADMIN","SUPER_ADMIN", "MEMBER"]),
  discussionValidationRules,
  discussionController.createDiscussion,
)

// PUT /api/discussions/:id - Update discussion
router.put(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "SUPER_ADMIN", "MEMBER"]),
  discussionValidationRules,
  discussionController.updateDiscussion,
)

// DELETE /api/discussions/:id - Delete discussion
router.delete("/:id", requireAuth, requireRole(["ADMIN"]), discussionController.deleteDiscussion)

// POST /api/discussions/:discussionId/comments - Create comment
router.post(
  "/:discussionId/comments",
  requireAuth,
  requireRole(["ADMIN", "SUPER_ADMIN", "MEMBER", "MEMBER"]),
  body("content").trim().isLength({ min: 2 }).withMessage("Content is required"),
  discussionController.createComment,
)

// GET /api/discussions/:discussionId/comments - Get all comments for discussion
router.get("/:discussionId/comments", discussionController.getDiscussionComments)

// POST /api/discussions/:id/like - Like/unlike discussion
router.post(
  "/:id/like",
  requireAuth,
  requireRole(["ADMIN", "SUPER_ADMIN", "MEMBER", "MEMBER"]),
  discussionController.toggleLikeDiscussion,
)


// POST /api/discussions/:id/pin - Pin/unpin discussion
router.post("/:id/pin", requireAuth, requireRole(["ADMIN","SUPER_ADMIN", "MEMBER"]), discussionController.togglePinDiscussion)

// POST /api/discussions/:id/close - Close/open discussion
router.post("/:id/close", requireAuth, requireRole(["ADMIN", "SUPER_ADMIN", "MEMBER"]), discussionController.toggleCloseDiscussion)



// POST /api/discussions/:discussionId/comments/:commentId/reply - Reply to a comment
router.post(
  "/:discussionId/comments/:commentId/reply",
  requireAuth,
  requireRole(["ADMIN", "SUPER_ADMIN", "MEMBER", "MEMBER"]),
  discussionController.replyToComment,
);



// POST /api/discussions/:discussionId/comments/:commentId/like - Like/Unlike a comment
router.post(
  "/:discussionId/comments/:commentId/like",
  requireAuth,
  requireRole(["ADMIN", "SUPER_ADMIN", "MEMBER", "MEMBER"]),
  discussionController.likeComment,
);


module.exports = router
