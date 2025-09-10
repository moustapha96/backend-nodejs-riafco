const router = require("express").Router();
const governanceReportController = require("../controllers/governanceReport.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");



const uploadDir = "uploads/reports"
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure multer for partner logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "report-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5 Mo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|jpeg|jpg|png|gif|webp|mp4|mp3|zip|rar/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Seuls les fichiers image sont autorisés (JPEG, JPG, PNG, GIF, WEBP, SVG)"));
    }
  },
});



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
  upload.single("fileUrl"),
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
  upload.single("fileUrl"),
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
router.delete("/:id", requireAuth, requireRole(["ADMIN"]), governanceReportController.deleteGovernanceReport);

module.exports = router;
