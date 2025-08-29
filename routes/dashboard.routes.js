const router = require("express").Router()
const dashboardController = require("../controllers/dashboard.controller")
const { requireAuth, requireRole } = require("../middleware/auth.middleware")

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard and admin statistics
 */

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics (Admin/Moderator only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/stats", requireAuth, requireRole(["ADMIN", "MODERATOR"]), dashboardController.getDashboardStats)
/**
 * @swagger
 * /api/dashboard/recent-activities:
 *   get:
 *     summary: Get recent activities (Admin/Moderator only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activities list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/recent-activities",
  requireAuth,
  requireRole(["ADMIN", "MODERATOR"]),
  dashboardController.getRecentActivities,
)

/**
 * @swagger
 * /api/dashboard/notifications:
 *   get:
 *     summary: Get system notifications (Admin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of system notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/notifications", requireAuth, requireRole("ADMIN"), dashboardController.getSystemNotifications)

/**
 * @swagger
 * /api/dashboard/audit-logs:
 *   get:
 *     summary: Get audit logs (Admin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit logs list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/audit-logs", requireAuth, requireRole("ADMIN"), dashboardController.getAuditLogs)

module.exports = router
