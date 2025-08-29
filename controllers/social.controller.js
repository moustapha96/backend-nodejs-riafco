const { PrismaClient } = require("@prisma/client")
const { validationResult } = require("express-validator")
const { logAudit } = require("../utils/audit")

const prisma = new PrismaClient()

// Get all social networks
const getAllSocialNetworks = async (req, res) => {
  try {
    const { active } = req.query

    const where = {}
    if (active !== undefined) {
      where.isActive = active === "true"
    }

    const socialNetworks = await prisma.socialNetwork.findMany({
      where,
      orderBy: { order: "asc" },
    })

    res.json({
      success: true,
      data: socialNetworks,
    })
  } catch (error) {
    console.error("Get social networks error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching social networks",
      error: error.message,
    })
  }
}

// Create new social network
const createSocialNetwork = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { name, platform, url, icon, isActive = true, order = 0 } = req.body

    const socialNetwork = await prisma.socialNetwork.create({
      data: {
        name,
        platform,
        url,
        icon,
        isActive,
        order: Number.parseInt(order),
      },
    })

    await logAudit(
      req.user.id,
      "CREATE",
      "SocialNetwork",
      socialNetwork.id,
      { name, platform },
      req.ip,
      req.get("User-Agent"),
    )

    res.status(201).json({
      success: true,
      message: "Social network created successfully",
      data: socialNetwork,
    })
  } catch (error) {
    console.error("Create social network error:", error)
    res.status(500).json({
      success: false,
      message: "Error creating social network",
      error: error.message,
    })
  }
}

// Update social network
const updateSocialNetwork = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { id } = req.params
    const { name, platform, url, icon, isActive, order } = req.body

    const socialNetwork = await prisma.socialNetwork.findUnique({
      where: { id },
    })

    if (!socialNetwork) {
      return res.status(404).json({
        success: false,
        message: "Social network not found",
      })
    }

    const updateData = {
      name,
      platform,
      url,
      icon,
      isActive,
      order: order ? Number.parseInt(order) : socialNetwork.order,
    }

    const updatedSocialNetwork = await prisma.socialNetwork.update({
      where: { id },
      data: updateData,
    })

    await logAudit(req.user.id, "UPDATE", "SocialNetwork", id, updateData, req.ip, req.get("User-Agent"))

    res.json({
      success: true,
      message: "Social network updated successfully",
      data: updatedSocialNetwork,
    })
  } catch (error) {
    console.error("Update social network error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating social network",
      error: error.message,
    })
  }
}

// Delete social network
const deleteSocialNetwork = async (req, res) => {
  try {
    const { id } = req.params

    const socialNetwork = await prisma.socialNetwork.findUnique({
      where: { id },
    })

    if (!socialNetwork) {
      return res.status(404).json({
        success: false,
        message: "Social network not found",
      })
    }

    await prisma.socialNetwork.delete({
      where: { id },
    })

    await logAudit(
      req.user.id,
      "DELETE",
      "SocialNetwork",
      id,
      { name: socialNetwork.name },
      req.ip,
      req.get("User-Agent"),
    )

    res.json({
      success: true,
      message: "Social network deleted successfully",
    })
  } catch (error) {
    console.error("Delete social network error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting social network",
      error: error.message,
    })
  }
}

module.exports = {
  getAllSocialNetworks,
  createSocialNetwork,
  updateSocialNetwork,
  deleteSocialNetwork,
}
