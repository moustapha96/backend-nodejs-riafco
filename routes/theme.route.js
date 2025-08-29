const router = require("express").Router();
const { body } = require("express-validator");
const themeController = require("../controllers/theme.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Themes
 *   description: Theme management
 */

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
 *           description: The auto-generated ID of the theme
 *         title:
 *           type: string
 *           description: Title of the theme
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of the theme
 *         createdBy:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             profilePic:
 *               type: string
 *               nullable: true
 *         discussions:
 *           type: array
 *           items:
 *             type: object
 *           description: List of discussions associated with this theme
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the theme was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the theme was last updated
 *       required:
 *         - id
 *         - title
 *         - createdBy
 *         - createdAt
 *         - updatedAt
 *
 *     CreateTheme:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Nouvelles technologies"
 *         description:
 *           type: string
 *           example: "Discussions sur les dernières innovations technologiques"
 *       required:
 *         - title
 *
 *     UpdateTheme:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Technologies émergentes"
 *         description:
 *           type: string
 *           example: "Discussions sur les technologies de demain"
 */

/**
 * @swagger
 * /api/themes:
 *   get:
 *     summary: Get all themes
 *     description: Retrieve a list of all themes
 *     tags: [Themes]
 *     responses:
 *       200:
 *         description: A list of themes
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
 *                     $ref: '#/components/schemas/Theme'
 *       500:
 *         description: Internal server error
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
 *                   example: "Error fetching themes"
 *                 error:
 *                   type: string
 *                   example: "Detailed error message"
 */

// Validation rules
const themeValidationRules = [
  body("title").trim().isLength({ min: 3, max: 100 }).withMessage("Title must be between 3 and 100 characters"),
  body("description").optional().trim().isLength({ max: 1000 }).withMessage("Description must be less than 1000 characters"),
];

// Routes
router.get("/", themeController.getAllThemes);

/**
 * @swagger
 * /api/themes:
 *   post:
 *     summary: Create a new theme
 *     description: Create a new discussion theme (Admin/Moderator/Member only)
 *     tags: [Themes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTheme'
 *     responses:
 *       201:
 *         description: Theme created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Theme created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Theme'
 *       400:
 *         description: Validation error
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
 *                   example: "Validation failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Title must be between 3 and 100 characters"
 *                       param:
 *                         type: string
 *                         example: "title"
 *                       location:
 *                         type: string
 *                         example: "body"
 *       401:
 *         description: Unauthorized - Missing or invalid authentication token
 *       403:
 *         description: Forbidden - User doesn't have the required role
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "MODERATOR", "MEMBER"]),
  themeValidationRules,
  themeController.createTheme
);

/**
 * @swagger
 * /api/themes/{id}:
 *   put:
 *     summary: Update a theme
 *     description: Update an existing theme (Admin/Moderator/Member only)
 *     tags: [Themes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the theme to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTheme'
 *     responses:
 *       200:
 *         description: Theme updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Theme updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Theme'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Missing or invalid authentication token
 *       403:
 *         description: Forbidden - User doesn't have the required role
 *       404:
 *         description: Theme not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "MODERATOR", "MEMBER"]),
  themeValidationRules,
  themeController.updateTheme
);

/**
 * @swagger
 * /api/themes/{id}:
 *   delete:
 *     summary: Delete a theme
 *     description: Delete an existing theme (Admin/Moderator only)
 *     tags: [Themes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the theme to delete
 *     responses:
 *       200:
 *         description: Theme deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Theme deleted successfully"
 *       401:
 *         description: Unauthorized - Missing or invalid authentication token
 *       403:
 *         description: Forbidden - User doesn't have the required role
 *       404:
 *         description: Theme not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "MODERATOR"]),
  themeController.deleteTheme
);

module.exports = router;
