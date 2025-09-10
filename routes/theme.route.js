
const router = require("express").Router()
const { body, param } = require("express-validator")
const themeController = require("../controllers/theme.controller")
const { requireAuth, requireRole } = require("../middleware/auth.middleware")

// Validation rules
const themeValidationRules = [
  body("title").trim().isLength({ min: 3, max: 100 }).withMessage("Title must be between 3 and 100 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
  body("color").optional().isHexColor().withMessage("Color must be a valid hex color"),
]

/**
 * @swagger
 * components:
 *   schemas:
 *     Theme:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *         color:
 *           type: string
 *         discussionCount:
 *           type: integer
 *         lastActivityAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// GET /api/themes - Get all themes
router.get("/", themeController.getAllThemes)

// GET /api/themes/:id - Get theme by ID
router.get("/:id", themeController.getThemeById)

// GET /api/themes/slug/:slug - Get theme by slug
router.get("/slug/:slug", themeController.getThemeBySlug)

// POST /api/themes - Create new theme
router.post("/", requireAuth,
  requireRole(["ADMIN", "MODERATOR"]),
  themeValidationRules,
  themeController.createTheme)

// PUT /api/themes/:id - Update theme
router.put("/:id", requireAuth, requireRole(["ADMIN", "MODERATOR"]), themeValidationRules, themeController.updateTheme)

// DELETE /api/themes/:id - Delete theme
router.delete("/:id", requireAuth, requireRole(["ADMIN"]), themeController.deleteTheme)

// GET /api/themes/:id/discussions - Get all discussions for a theme
router.get("/:id/discussions", themeController.getThemeDiscussions)

// GET /api/themes/:id/stats - Get theme statistics
router.get("/:id/stats", themeController.getThemeStats)

module.exports = router
