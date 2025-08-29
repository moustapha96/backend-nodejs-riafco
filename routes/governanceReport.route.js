const router = require("express").Router();
const governanceReportController = require("../controllers/governanceReport.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const multer = require("multer");
const upload = multer({ dest: "./uploads/governance/" });

/**
 * @swagger
 * tags:
 *   name: GovernanceReports
 *   description: API for managing governance reports
 */

/**
 * @swagger
 * /api/governance-reports:
 *   get:
 *     summary: Get all governance reports
 *     tags: [GovernanceReports]
 *     responses:
 *       200:
 *         description: List of governance reports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GovernanceReport'
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
router.get("/", governanceReportController.getAllGovernanceReports);

/**
 * @swagger
 * /api/governance-reports/{id}:
 *   get:
 *     summary: Get governance report by ID
 *     tags: [GovernanceReports]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Governance report ID
 *     responses:
 *       200:
 *         description: Governance report details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GovernanceReport'
 *       404:
 *         description: Governance report not found
 */
router.get("/:id", governanceReportController.getGovernanceReport);

/**
 * @swagger
 * /api/governance-reports:
 *   post:
 *     summary: Create a new governance report
 *     tags: [GovernanceReports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title_fr:
 *                 type: string
 *               title_en:
 *                 type: string
 *               paragraphe_fr:
 *                 type: string
 *               paragraphe_en:
 *                 type: string
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Governance report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GovernanceReport'
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  requireAuth,
  upload.single("file"),
  governanceReportController.createGovernanceReport,
);

/**
 * @swagger
 * /api/governance-reports/{id}:
 *   put:
 *     summary: Update governance report
 *     tags: [GovernanceReports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Governance report ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title_fr:
 *                 type: string
 *               title_en:
 *                 type: string
 *               paragraphe_fr:
 *                 type: string
 *               paragraphe_en:
 *                 type: string
 *               publishedAt:
 *                 type: string
 *                 format: date-time
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Governance report updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GovernanceReport'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Governance report not found
 */
router.put(
  "/:id",
  requireAuth,
  upload.single("file"),
  governanceReportController.updateGovernanceReport,
);

/**
 * @swagger
 * /api/governance-reports/{id}:
 *   delete:
 *     summary: Delete governance report
 *     tags: [GovernanceReports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Governance report ID
 *     responses:
 *       200:
 *         description: Governance report deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Governance report not found
 */
router.delete("/:id", requireAuth, governanceReportController.deleteGovernanceReport);

module.exports = router;
