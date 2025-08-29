const { PrismaClient } = require("@prisma/client")
const { validationResult } = require("express-validator")
const { createAuditLog } = require("../utils/audit")
const fs = require("fs")
const path = require("path")

const prisma = new PrismaClient()

module.exports.getAllActivities = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, sortBy = "createdAt", sortOrder = "desc" } = req.query

    const skip = (page - 1) * limit
    const take = Number.parseInt(limit)

    const where = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePic: true,
              status: true,
              role: true
            },
          },
        },
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.activity.count({ where }),
    ])

    res.status(200).json({
      activities,
      pagination: {
        page: Number.parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    })

  } catch (error) {
    console.error("Get all activities error:", error)
    res.status(500).json({
      message: "Failed to retrieve activities",
      code: "GET_ACTIVITIES_ERROR",
    })
  }
}

module.exports.getActivity = async (req, res) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
            status: true,
            role: true
          },
        },
      },
    })

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
        code: "ACTIVITY_NOT_FOUND",
      })
    }

    res.status(200).json({ activity })
  } catch (error) {
    console.error("Get activity error:", error)
    res.status(500).json({
      message: "Failed to retrieve activity",
      code: "GET_ACTIVITY_ERROR",
    })
  }
}

module.exports.createActivity = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { title, description, status = "DRAFT" } = req.body
    const authorId = res.locals.user.id

    // Ensure upload directory exists
    const uploadDir = "uploads/activities"
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    let iconPath = null
    let imagePath = null

    // Handle file uploads
    if (req.files) {
      if (req.files.icon) {
        const iconFile = req.files.icon[0]
        iconPath = `/uploads/activities/${Date.now()}-icon-${iconFile.originalname}`
        fs.renameSync(iconFile.path, path.join(uploadDir, path.basename(iconPath)))
      }

      if (req.files.image) {
        const imageFile = req.files.image[0]
        imagePath = `/uploads/activities/${Date.now()}-image-${imageFile.originalname}`
        fs.renameSync(imageFile.path, path.join(uploadDir, path.basename(imagePath)))
      }
    }

    const activity = await prisma.activity.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        icon: iconPath,
        image: imagePath,
        status,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
    })

    await createAuditLog({
      userId: authorId,
      action: "ACTIVITY_CREATED",
      resource: "activities",
      resourceId: activity.id,
      details: { title: activity.title, status },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(201).json({
      message: "Activity created successfully",
      activity,
    })
  } catch (error) {
    console.error("Create activity error:", error)
    res.status(500).json({
      message: "Failed to create activity",
      code: "CREATE_ACTIVITY_ERROR",
    })
  }
}

module.exports.updateActivity = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { id } = req.params
    const { title, description, status } = req.body

    const existingActivity = await prisma.activity.findUnique({
      where: { id },
    })

    if (!existingActivity) {
      return res.status(404).json({
        message: "Activity not found",
        code: "ACTIVITY_NOT_FOUND",
      })
    }

    const updateData = {
      title: title?.trim(),
      description: description?.trim(),
      status,
    }

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    // Handle file uploads
    if (req.files) {
      const uploadDir = "uploads/activities"
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      if (req.files.icon) {
        const iconFile = req.files.icon[0]
        updateData.icon = `/uploads/activities/${Date.now()}-icon-${iconFile.originalname}`
        fs.renameSync(iconFile.path, path.join(uploadDir, path.basename(updateData.icon)))
      }

      if (req.files.image) {
        const imageFile = req.files.image[0]
        updateData.image = `/uploads/activities/${Date.now()}-image-${imageFile.originalname}`
        fs.renameSync(imageFile.path, path.join(uploadDir, path.basename(updateData.image)))
      }
    }

    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePic: true,
          },
        },
      },
    })

    await createAuditLog({
      userId: res.locals.user.id,
      action: "ACTIVITY_UPDATED",
      resource: "activities",
      resourceId: id,
      details: { changes: updateData },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(200).json({
      message: "Activity updated successfully",
      activity: updatedActivity,
    })
  } catch (error) {
    console.error("Update activity error:", error)
    res.status(500).json({
      message: "Failed to update activity",
      code: "UPDATE_ACTIVITY_ERROR",
    })
  }
}

module.exports.deleteActivity = async (req, res) => {
  try {
    const { id } = req.params

    const existingActivity = await prisma.activity.findUnique({
      where: { id },
    })

    if (!existingActivity) {
      return res.status(404).json({
        message: "Activity not found",
        code: "ACTIVITY_NOT_FOUND",
      })
    }

    await prisma.activity.delete({
      where: { id },
    })

    await createAuditLog({
      userId: res.locals.user.id,
      action: "ACTIVITY_DELETED",
      resource: "activities",
      resourceId: id,
      details: { title: existingActivity.title },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(200).json({
      message: "Activity deleted successfully",
    })
  } catch (error) {
    console.error("Delete activity error:", error)
    res.status(500).json({
      message: "Failed to delete activity",
      code: "DELETE_ACTIVITY_ERROR",
    })
  }
}

// activities/${id}/status
module.exports.updateActivityStatus = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const { id } = req.params
    const { status } = req.body

    const existingActivity = await prisma.activity.findUnique({
      where: { id },
    })

    if (!existingActivity) {
      return res.status(404).json({
        message: "Activity not found",
        code: "ACTIVITY_NOT_FOUND",
      })
    }

    const updateData = {
      status,
    }

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    // Handle file uploads
    
    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: updateData
    })

    await createAuditLog({
      userId: res.locals.user.id,
      action: "ACTIVITY_UPDATED_STATUS",
      resource: "activities",
      resourceId: id,
      details: { changes: updateData },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(200).json({
      message: "Activity Status updated successfully",
      activity: updatedActivity,
    })
  } catch (error) {
    console.error("Update Status activity error:", error)
    res.status(500).json({
      message: "Failed to update status activity",
      code: "UPDATE_ACTIVITY_ERROR",
    })
  }
}
