const { PrismaClient } = require("@prisma/client")
const { validationResult } = require("express-validator")
const { logAudit, createAuditLog } = require("../utils/audit")

const prisma = new PrismaClient()

// Get all legal mentions
const getAllLegalMentions = async (req, res) => {
  try {
    const { type, active } = req.query

    const where = {}
    if (type) {
      where.type = type
    }
    if (active !== undefined) {
      where.isActive = active === "true"
    }

    const legalMentions = await prisma.legalMention.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    res.json({
      success: true,
      data: legalMentions,
    })
  } catch (error) {
    console.error("Get legal mentions error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching legal mentions",
      error: error.message,
    })
  }
}

// Get single legal mention
const getLegalMention = async (req, res) => {
  try {
    const { id } = req.params

    const legalMention = await prisma.legalMention.findUnique({
      where: { id },
    })

    if (!legalMention) {
      return res.status(404).json({
        success: false,
        message: "Legal mention not found",
      })
    }

    res.json({
      success: true,
      data: legalMention,
    })
  } catch (error) {
    console.error("Get legal mention error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching legal mention",
      error: error.message,
    })
  }
}

// Create new legal mention
const createLegalMention = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { type, title_fr, title_en, content_fr, content_en, isActive = true, version = "1.0", effectiveDate } = req.body

    const legalMention = await prisma.legalMention.create({
      data: {
        type,
        title_fr,
        title_en,
        content_fr,
        content_en,
        isActive,
        version,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      },
    })

    await createAuditLog(
      res.locals.user.id,
      "CREATE",
      "LegalMention",
      legalMention.id,
      { type, title },
      req.ip,
      req.get("User-Agent"),
    )

    res.status(201).json({
      success: true,
      message: "Legal mention created successfully",
      data: legalMention,
    })
  } catch (error) {
    console.error("Create legal mention error:", error)
    res.status(500).json({
      success: false,
      message: "Error creating legal mention",
      error: error.message
    })
  }
}

// Update legal mention
const updateLegalMention = async (req, res) => {
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
    const { type, title_fr, title_en, content_fr, content_en, isActive, version, effectiveDate } = req.body

    const legalMention = await prisma.legalMention.findUnique({
      where: { id },
    })

    if (!legalMention) {
      return res.status(404).json({
        success: false,
        message: "Legal mention not found",
      })
    }

    const updateData = {
      type,
      title_fr,
      title_en,
      content_fr,
      content_en,
      isActive,
      version,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : legalMention.effectiveDate,
    }

    const updatedLegalMention = await prisma.legalMention.update({
      where: { id },
      data: updateData,
    })

    await createAuditLog(res.locals.user.id, "UPDATE", "LegalMention", id, updateData, req.ip, req.get("User-Agent"))

    res.json({
      success: true,
      message: "Legal mention updated successfully",
      data: updatedLegalMention,
    })
  } catch (error) {
    console.error("Update legal mention error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating legal mention",
      error: error.message,
    })
  }
}

// Delete legal mention
const deleteLegalMention = async (req, res) => {
  try {
    const  id  = req.params.id
    console.log(req.params)
    console.log(id)
    const legalMention = await prisma.legalMention.findUnique({
      where: { id : id },
    })

    if (!legalMention) {
      return res.status(404).json({
        success: false,
        message: "Legal mention not found",
      })
    }

    await prisma.legalMention.delete({
      where: { id },
    })

    await createAuditLog(
      res.locals.user.id,
      "DELETE",
      "LegalMention",
      id,
      { title: legalMention.title },
      req.ip,
      req.get("User-Agent"),
    )

    res.json({
      success: true,
      message: "Legal mention deleted successfully",
    })
  } catch (error) {
    console.error("Delete legal mention error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting legal mention",
      error: error.message,
    })
  }
}

module.exports = {
  getAllLegalMentions,
  getLegalMention,
  createLegalMention,
  updateLegalMention,
  deleteLegalMention,
}
