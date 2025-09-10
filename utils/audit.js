const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

/**
 * Create an audit log entry
 * @param {Object} logData - The audit log data
 * @param {string} logData.userId - ID of the user performing the action (optional)
 * @param {string} logData.action - The action performed
 * @param {string} logData.resource - The resource type
 * @param {string} logData.resourceId - ID of the resource (optional)
 * @param {Object} logData.details - Additional details (optional)
 * @param {string} logData.ipAddress - IP address of the user (optional)
 * @param {string} logData.userAgent - User agent string (optional)
 */
async function createAuditLog({ userId, action, resource, resourceId, details, ipAddress, userAgent }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
    // Don't throw error to avoid breaking the main operation
  }
}

/**
 * Get audit logs with filtering and pagination
 * @param {Object} filters - Filter options
 * @param {string} filters.userId - Filter by user ID
 * @param {string} filters.action - Filter by action
 * @param {string} filters.resource - Filter by resource
 * @param {Date} filters.startDate - Filter by start date
 * @param {Date} filters.endDate - Filter by end date
 * @param {number} filters.page - Page number
 * @param {number} filters.limit - Items per page
 */
async function getAuditLogs({ userId, action, resource, startDate, endDate, page = 1, limit = 50 }) {
  try {
    const skip = (page - 1) * limit

    const where = {}
    if (userId) where.userId = userId
    if (action) where.action = action
    if (resource) where.resource = resource
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = startDate
      if (endDate) where.createdAt.lte = endDate
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ])

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Failed to get audit logs:", error)
    throw error
  }
}


async function getAllAuditLogs() {
  try {
    
    const logs = await Promise.all([
      prisma.auditLog.findMany({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    ])

    return logs
    
  } catch (error) {
    console.error("Failed to get audit logs:", error)
    throw error
  }
}

module.exports = {
  createAuditLog,
  getAuditLogs,
  getAllAuditLogs
}
