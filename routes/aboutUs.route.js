const router = require("express").Router();
const aboutUsController = require("../controllers/aboutUs.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const multer = require("multer")
const path = require("path")
const fs = require("fs")


const uploadDir = "uploads/about-us"
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
    cb(null, "about-us-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5 Mo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
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
 *   name: AboutUs
 *   description: API for managing About Us content
 */

/**
 * @swagger
 * /api/about-us:
 *   get:
 *     summary: Get About Us content
 *     tags: [AboutUs]
 *     responses:
 *       200:
 *         description: About Us content
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AboutUs'
 *       404:
 *         description: About Us content not found
 */
router.get("/", aboutUsController.getAboutUs);

router.get("/all", aboutUsController.getAboutUsAll);

/**
 * @swagger
 * /api/about-us:
 *   post:
 *     summary: Create About Us content
 *     tags: [AboutUs]
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
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: About Us content created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AboutUs'
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  requireAuth,
  upload.single("image"),
  aboutUsController.createAboutUs,
);

/**
 * @swagger
 * /api/about-us/{id}:
 *   put:
 *     summary: Update About Us content
 *     tags: [AboutUs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: About Us content ID
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
 *               isPublished:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: About Us content updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AboutUs'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: About Us content not found
 */
router.put(
  "/:id",
  requireAuth,
  upload.single("image"),
  aboutUsController.updateAboutUs,
);

/**
 * @swagger
 * /api/about-us/{id}/image:
 *   delete:
 *     summary: Delete About Us image
 *     tags: [AboutUs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: About Us content ID
 *     responses:
 *       200:
 *         description: About Us image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AboutUs'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: About Us content not found
 */
router.delete("/:id/image", requireAuth, requireRole(["ADMIN"]), aboutUsController.deleteAboutUsImage);

module.exports = router;
