
const router = require("express").Router();
const { body } = require("express-validator");
const memberCountryController = require("../controllers/memberCountry.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: MemberCountry
 *   description: Member country management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MemberCountry:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         flag:
 *           type: string
 *         latitude:
 *           type: number
 *           format: float
 *         longitude:
 *           type: number
 *           format: float
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Criterion:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Validation rules for MemberCountry
const createMemberCountryValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("code").trim().isLength({ min: 2, max: 3 }).withMessage("Code must be between 2 and 3 characters"),
  body("status").optional().isIn(["ACTIVE", "INACTIVE"]).withMessage("Invalid status"),
  body("latitude").optional().isFloat({ min: -90, max: 90 }).withMessage("Latitude must be between -90 and 90"),
  body("longitude").optional().isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 and 180"),
];

// Validation rules for CritereMemberCountry
const createCriterionValidation = [
  body("name").trim().isLength({ min: 2, max: 200 }).withMessage("Name must be between 2 and 200 characters"),
  body("description").optional().trim().isLength({ max: 1000 }).withMessage("Description must be less than 1000 characters"),
];

/**
 * @swagger
 * /api/member-countries:
 *   get:
 *     summary: Get all member countries
 *     tags: [MemberCountry]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term (name or code)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of member countries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 countries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MemberCountry'
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
router.get("/", memberCountryController.getAllMemberCountries);


/**
 * @swagger
 * /api/member-countries/{id}:
 *   get:
 *     summary: Get member country by ID
 *     tags: [MemberCountry]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Member country ID
 *     responses:
 *       200:
 *         description: Member country details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberCountry'
 *       404:
 *         description: Member country not found
 */
router.get("/:id", memberCountryController.getMemberCountryById);

/**
 * @swagger
 * /api/member-countries:
 *   post:
 *     summary: Create a new member country (Admin only)
 *     tags: [MemberCountry]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               flag:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 format: float
 *               longitude:
 *                 type: number
 *                 format: float
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       201:
 *         description: Member country created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberCountry'
 *       400:
 *         description: Validation error or country already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  requireAuth,
  
  createMemberCountryValidation,
  memberCountryController.createMemberCountry,
);

/**
 * @swagger
 * /api/member-countries/{id}:
 *   put:
 *     summary: Update a member country (Admin only)
 *     tags: [MemberCountry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Member country ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               flag:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 format: float
 *               longitude:
 *                 type: number
 *                 format: float
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Member country updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberCountry'
 *       400:
 *         description: Validation error or country already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Member country not found
 */
router.put(
  "/:id",
  requireAuth,
  
  createMemberCountryValidation,
  memberCountryController.updateMemberCountry,
);

/**
 * @swagger
 * /api/member-countries/{id}:
 *   delete:
 *     summary: Delete a member country (Admin only)
 *     tags: [MemberCountry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Member country ID
 *     responses:
 *       200:
 *         description: Member country deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Member country not found
 */
router.delete("/:id", requireAuth,  memberCountryController.deleteMemberCountry);

/**
 * @swagger
 * /api/member-countries/{countryId}/criteria:
 *   get:
 *     summary: Get all criteria for a member country
 *     tags: [MemberCountry]
 *     parameters:
 *       - in: path
 *         name: countryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member country ID
 *     responses:
 *       200:
 *         description: List of criteria for the member country
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 criteria:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Criterion'
 *       404:
 *         description: Member country not found
 *       500:
 *         description: Failed to retrieve criteria
 */
router.get("/:countryId/criteria", memberCountryController.getAllCriteriaForCountry);

/**
 * @swagger
 * /api/member-countries/{countryId}/criteria:
 *   post:
 *     summary: Add a criterion to a member country (Admin only)
 *     tags: [MemberCountry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: countryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member country ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Criterion added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Criterion'
 *       400:
 *         description: Validation error or criterion name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Member country not found
 *       500:
 *         description: Failed to add criterion
 */
router.post(
  "/:countryId/criteria",
  requireAuth,
  
  createCriterionValidation,
  memberCountryController.addCriterionToCountry,
);

/**
 * @swagger
 * /api/member-countries/criteria/{criterionId}:
 *   put:
 *     summary: Update a criterion (Admin only)
 *     tags: [MemberCountry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: criterionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Criterion ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Criterion updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Criterion'
 *       400:
 *         description: Validation error or criterion name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Criterion not found
 *       500:
 *         description: Failed to update criterion
 */
router.put(
  "/criteria/:criterionId",
  requireAuth,
  
  createCriterionValidation,
  memberCountryController.updateCriterion,
);

/**
 * @swagger
 * /api/member-countries/criteria/{criterionId}:
 *   delete:
 *     summary: Delete a criterion (Admin only)
 *     tags: [MemberCountry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: criterionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Criterion ID
 *     responses:
 *       200:
 *         description: Criterion deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Criterion not found
 *       500:
 *         description: Failed to delete criterion
 */
router.delete("/criteria/:criterionId", requireAuth,  memberCountryController.deleteCriterion);

module.exports = router;
