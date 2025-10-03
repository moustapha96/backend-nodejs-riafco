
const express = require("express")
const { body } = require("express-validator")
const { requireAuth, requireRole } = require("../middleware/auth.middleware")

/**
 * @swagger
 * tags:
 *   name: Invitations
 *   description: Invitation management
 */

const invitationController = require("../controllers/invitation.controller")
const router = express.Router()

// Validation middleware
const invitationValidation = [
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").optional().isMobilePhone().withMessage("Valid phone number required"),
  body("role").optional().isIn(["ADMIN", "SUPER_ADMIN", "MEMBER", "GUEST"]).withMessage("Valid role is required"),
]

const acceptValidation = [body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")]

// Routes
/**
 * @swagger
 * /api/invitations:
 *   get:
 *     summary: Get all invitations
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, ACCEPTED, EXPIRED, CANCELLED]
 *         description: Filter by invitation status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of invitations per page
 *     responses:
 *       200:
 *         description: Invitations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invitations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Invitation'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/", requireAuth, requireRole(["ADMIN", "SUPER_ADMIN", "MEMBER"]), invitationController.getAllInvitations)

/**
 * @swagger
 * /api/invitations:
 *   post:
 *     summary: Create new invitation
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Full name of the invitee
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the invitee
 *               phone:
 *                 type: string
 *                 description: Phone number (optional)
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MODERATOR, MEMBER, GUEST]
 *                 default: MEMBER
 *                 description: Role to assign to the invitee
 *     responses:
 *       201:
 *         description: Invitation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 invitation:
 *                   $ref: '#/components/schemas/Invitation'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post("/", requireAuth, requireRole(["ADMIN", "SUPER_ADMIN", "MEMBER"]), invitationValidation, invitationController.createInvitation)

/**
 * @swagger
 * /api/invitations/{token}/accept:
 *   post:
 *     summary: Accept invitation
 *     tags: [Invitations]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Password for the new account
 *     responses:
 *       200:
 *         description: Invitation accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid token or validation error
 *       404:
 *         description: Invitation not found
 */
router.post("/:token/accept", acceptValidation, invitationController.acceptInvitation)

/**
 * @swagger
 * /api/invitations/{token}/reject:
 *   post:
 *     summary: Reject invitation
 *     tags: [Invitations]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation token
 *     responses:
 *       200:
 *         description: Invitation rejected successfully
 *       400:
 *         description: Invalid token
 *       404:
 *         description: Invitation not found
 */
router.post("/:token/reject", invitationController.rejectInvitation)

/**
 * @swagger
 * /api/invitations/{id}/resend:
 *   post:
 *     summary: Resend invitation
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Invitation ID
 *     responses:
 *       200:
 *         description: Invitation resent successfully
 *       404:
 *         description: Invitation not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post("/:id/resend", requireAuth, requireRole(["ADMIN", "SUPER_ADMIN", "MEMBER"]), invitationController.resendInvitation)

module.exports = router
