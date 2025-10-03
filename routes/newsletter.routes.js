const router = require("express").Router();
const { body } = require("express-validator");
const newsletterController = require("../controllers/newsletter.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Newsletter
 *   description: Newsletter management
 */


/**
 * @swagger
 * /api/newsletter:
 *   post:
 *     summary: Create a newsletter subscriber
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Newsletter subscriber created successfully
 */
router.post(
  "/",
  [body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email")],
  newsletterController.createNewsletter
);

/**
 * @swagger
 * /api/newsletter:
 *   get:
 *     summary: Get all newsletter subscribers
 *     tags: [Newsletter]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of newsletter subscribers
 */
router.get("/", newsletterController.getAllNewsletters);

/**
 * @swagger
 * /api/newsletter/{id}:
 *   get:
 *     summary: Get a newsletter subscriber by ID
 *     tags: [Newsletter]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscriber ID
 *     responses:
 *       200:
 *         description: Newsletter subscriber details
 */
router.get("/:id", newsletterController.getNewsletterById);


/**
 * @swagger
 * /api/newsletter/{id}:
 *   put:
 *     summary: Update a newsletter subscriber
 *     tags: [Newsletter]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscriber ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Newsletter subscriber updated successfully
 */
router.put(
  "/:id",
  // [body("email").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email")],
  newsletterController.updateNewsletter
);

/**
 * @swagger
 * /api/newsletter/{id}:
 *   delete:
 *     summary: Delete a newsletter subscriber
 *     tags: [Newsletter]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscriber ID
 *     responses:
 *       200:
 *         description: Newsletter subscriber deleted successfully
 */
router.delete("/:id", requireAuth ,requireRole(["ADMIN"]), newsletterController.deleteNewsletter);


/**
 * @swagger
 * /api/newsletter/subscribe/{email}:
 *   post:
 *     summary: Subscribe to newsletter
 *     tags: [Newsletter]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscriber email
 *     responses:
 *       201:
 *         description: Subscribed successfully
 */
router.post(
  "/subscribe/:email",
  newsletterController.subscribeToNewsletter
);

/**
 * @swagger
 * /api/newsletter/unsubscribe/{email}:
 *   post:
 *     summary: Unsubscribe from newsletter
 *     tags: [Newsletter]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscriber email
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 */
router.get(
  "/unsubscribe/:email",
  newsletterController.unsubscribeFromNewsletter
);

module.exports = router;
