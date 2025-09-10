const router = require("express").Router();
const { body } = require("express-validator");
const teamMemberController = require("../controllers/teamMember.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const multer = require("multer")
const path = require("path")
const fs = require("fs")


// Validation rules
const createTeamMemberValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("position").trim().isLength({ min: 2, max: 100 }).withMessage("Position must be between 2 and 100 characters"),
  body("bio").optional().trim().isLength({ max: 1000 }).withMessage("Bio must be less than 1000 characters"),
  body("order").optional().isInt({ min: 0 }).withMessage("Order must be a positive integer"),
];

const updateTeamMemberValidation = [
  body("name").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("position").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Position must be between 2 and 100 characters"),
  body("bio").optional().trim().isLength({ max: 1000 }).withMessage("Bio must be less than 1000 characters"),
  body("order").optional().isInt({ min: 0 }).withMessage("Order must be a positive integer"),
];

const reorderTeamMembersValidation = [
  body("members").isArray().withMessage("Members must be an array"),
  body("members.*.id").isString().withMessage("Member ID must be a string"),
  body("members.*.order").isInt({ min: 0 }).withMessage("Order must be a positive integer"),
];


// Ensure upload directory exists
const uploadDir = "uploads/teams"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "team-member-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"))
    }
  },
})


/**
 * @swagger
 * tags:
 *   name: TeamMember
 *   description: Team member management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TeamMember:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         position:
 *           type: string
 *         bio:
 *           type: string
 *         photo:
 *           type: string
 *         order:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/team-members:
 *   get:
 *     summary: Get all team members
 *     tags: [TeamMember]
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: order
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           default: asc
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of team members
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teamMembers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TeamMember'
 */
router.get("/", requireAuth, teamMemberController.getAllTeamMembers);


/**
 * @swagger
 * /api/team-members/{id}:
 *   get:
 *     summary: Get team member by ID
 *     tags: [TeamMember]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team member ID
 *     responses:
 *       200:
 *         description: Team member details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamMember'
 *       404:
 *         description: Team member not found
 */
router.get("/:id", teamMemberController.getTeamMemberById);


/**
 * @swagger
 * /api/team-members:
 *   post:
 *     summary: Create a new team member (Admin/Moderator only)
 *     tags: [TeamMember]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - position
 *             properties:
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               bio:
 *                 type: string
 *               order:
 *                 type: integer
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Team member created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamMember'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  requireAuth,
  upload.single("photo"),
  createTeamMemberValidation,
  teamMemberController.createTeamMember,
);

/**
 * @swagger
 * /api/team-members/{id}:
 *   put:
 *     summary: Update a team member (Admin/Moderator only)
 *     tags: [TeamMember]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team member ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               bio:
 *                 type: string
 *               order:
 *                 type: integer
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Team member updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamMember'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Team member not found
 */
router.put(
  "/:id",
  requireAuth,
  upload.single("photo"),
  updateTeamMemberValidation,
  teamMemberController.updateTeamMember,
);

/**
 * @swagger
 * /api/team-members/{id}:
 *   delete:
 *     summary: Delete a team member (Admin only)
 *     tags: [TeamMember]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team member ID
 *     responses:
 *       200:
 *         description: Team member deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Team member not found
 */
router.delete("/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  teamMemberController.deleteTeamMember);

/**
 * @swagger
 * /api/team-members/reorder:
 *   put:
 *     summary: Reorder team members (Admin/Moderator only)
 *     tags: [TeamMember]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - members
 *             properties:
 *               members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Team members reordered successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put(
  "/reorder",
  requireAuth,
  reorderTeamMembersValidation,
  teamMemberController.reorderTeamMembers,
);

module.exports = router;
