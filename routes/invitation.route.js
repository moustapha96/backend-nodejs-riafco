// const router = require("express").Router();
// const { body } = require("express-validator");
// const invitationController = require("../controllers/invitation.controller");
// const { requireAuth, requireRole } = require("../middleware/auth.middleware");

// /**
//  * @swagger
//  * tags:
//  *   name: Invitations
//  *   description: Invitation management
//  */

// /**
//  * @swagger
//  * components:
//  *   schemas:
//  *     Invitation:
//  *       type: object
//  *       properties:
//  *         id:
//  *           type: string
//  *           format: uuid
//  *           description: The auto-generated ID of the invitation
//  *         fullName:
//  *           type: string
//  *           description: Full name of the invited person
//  *         email:
//  *           type: string
//  *           format: email
//  *           description: Email address of the invited person
//  *         phone:
//  *           type: string
//  *           nullable: true
//  *           description: Phone number of the invited person
//  *         profilePic:
//  *           type: string
//  *           nullable: true
//  *           description: URL to the profile picture
//  *         status:
//  *           type: string
//  *           enum: [PENDING, ACCEPTED, DECLINED]
//  *           description: Current status of the invitation
//  *         token:
//  *           type: string
//  *           nullable: true
//  *           description: Unique token for invitation acceptance
//  *         invitedBy:
//  *           type: object
//  *           properties:
//  *             id:
//  *               type: string
//  *               format: uuid
//  *             firstName:
//  *               type: string
//  *             lastName:
//  *               type: string
//  *         organization:
//  *           type: object
//  *           nullable: true
//  *           properties:
//  *             id:
//  *               type: string
//  *               format: uuid
//  *             name:
//  *               type: string
//  *         createdAt:
//  *           type: string
//  *           format: date-time
//  *           description: The date and time when the invitation was created
//  *         updatedAt:
//  *           type: string
//  *           format: date-time
//  *           description: The date and time when the invitation was last updated
//  *       required:
//  *         - id
//  *         - fullName
//  *         - email
//  *         - status
//  *         - invitedBy
//  *         - createdAt
//  *         - updatedAt
//  *
//  *     AcceptInvitation:
//  *       type: object
//  *       properties:
//  *         password:
//  *           type: string
//  *           format: password
//  *           description: New password for the invited user
//  *       required:
//  *         - password
//  */

// /**
//  * @swagger
//  * /api/invitations:
//  *   get:
//  *     summary: Get all invitations
//  *     description: Retrieve a list of all invitations (Admin/Moderator only)
//  *     tags: [Invitations]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: A list of invitations
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
//  *                     $ref: '#/components/schemas/Invitation'
//  *       401:
//  *         description: Unauthorized - Missing or invalid authentication token
//  *       403:
//  *         description: Forbidden - User doesn't have the required role
//  *       500:
//  *         description: Internal server error
//  */
// const createInvitationValidation = [
//   body("fullName").trim().notEmpty().withMessage("Full name is required"),
//   body("email").isEmail().withMessage("Invalid email"),
//   body("phone").optional().isMobilePhone().withMessage("Invalid phone number"),
// ];

// /**
//  * @swagger
//  * /api/invitations:
//  *   post:
//  *     summary: Create a new invitation
//  *     description: Create and send a new invitation (Admin/Moderator only)
//  *     tags: [Invitations]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - fullName
//  *               - email
//  *             properties:
//  *               fullName:
//  *                 type: string
//  *                 example: "Jean Dupont"
//  *               email:
//  *                 type: string
//  *                 format: email
//  *                 example: "jean.dupont@example.com"
//  *               phone:
//  *                 type: string
//  *                 example: "+33612345678"
//  *               profilePic:
//  *                 type: string
//  *                 format: binary
//  *                 description: Profile picture file
//  *               organizationId:
//  *                 type: string
//  *                 format: uuid
//  *                 example: "123e4567-e89b-12d3-a456-426614174000"
//  *               sendEmail:
//  *                 type: boolean
//  *                 example: true
//  *     responses:
//  *       201:
//  *         description: Invitation created successfully
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
//  *                   example: "Invitation created successfully"
//  *                 data:
//  *                   $ref: '#/components/schemas/Invitation'
//  *       400:
//  *         description: Validation error
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
//  *                     properties:
//  *                       msg:
//  *                         type: string
//  *                         example: "Invalid email"
//  *                       param:
//  *                         type: string
//  *                         example: "email"
//  *                       location:
//  *                         type: string
//  *                         example: "body"
//  *       401:
//  *         description: Unauthorized - Missing or invalid authentication token
//  *       403:
//  *         description: Forbidden - User doesn't have the required role
//  *       500:
//  *         description: Internal server error
//  */
// router.get("/", requireAuth, requireRole(["ADMIN", "MODERATOR"]), invitationController.getAllInvitations);
// router.post("/", requireAuth, requireRole(["ADMIN", "MODERATOR"]), createInvitationValidation, invitationController.createInvitation);

// /**
//  * @swagger
//  * /api/invitations/{token}/accept:
//  *   post:
//  *     summary: Accept an invitation
//  *     description: Accept an invitation using the unique token and set a password
//  *     tags: [Invitations]
//  *     parameters:
//  *       - in: path
//  *         name: token
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Unique invitation token
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/AcceptInvitation'
//  *     responses:
//  *       201:
//  *         description: Invitation accepted successfully - User created
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
//  *                   example: "Invitation accepted successfully"
//  *                 data:
//  *                   type: object
//  *                   properties:
//  *                     user:
//  *                       type: object
//  *                       properties:
//  *                         id:
//  *                           type: string
//  *                           format: uuid
//  *                         firstName:
//  *                           type: string
//  *                         lastName:
//  *                           type: string
//  *                         email:
//  *                           type: string
//  *                           format: email
//  *       400:
//  *         description: Invalid token, expired invitation, or validation error
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
//  *                   example: "Invitation has expired"
//  *       404:
//  *         description: Invitation not found
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
//  *                   example: "Invitation not found or already accepted"
//  *       500:
//  *         description: Internal server error
//  */
// router.post("/:token/accept", invitationController.acceptInvitation);

// module.exports = router;

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
  body("role").optional().isIn(["ADMIN", "MODERATOR", "MEMBER", "GUEST"]).withMessage("Valid role is required"),
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
router.get("/", requireAuth, requireRole(["ADMIN", "MODERATOR"]), invitationController.getAllInvitations)

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
router.post("/", requireAuth, requireRole(["ADMIN", "MODERATOR"]), invitationValidation, invitationController.createInvitation)

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
router.post("/:id/resend", requireAuth, requireRole(["ADMIN", "MODERATOR"]), invitationController.resendInvitation)

module.exports = router
