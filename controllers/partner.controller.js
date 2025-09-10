const { PrismaClient } = require("@prisma/client")
const { validationResult } = require("express-validator")
const fs = require("fs")
const path = require("path")
const { logAudit, createAuditLog } = require("../utils/audit")

const prisma = new PrismaClient()

// Get all partners with pagination and filtering
const getAllPartners = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, country } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const where = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }
    if (country) {
      where.country = { contains: country, mode: "insensitive" }
    }

    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        skip,
        take: Number.parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.partner.count({ where }),
    ])

    res.json({
      success: true,
      data: partners,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("Get partners error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching partners",
      error: error.message,
    })
  }
}

// Get single partner
const getPartner = async (req, res) => {
  try {
    const { id } = req.params

    const partner = await prisma.partner.findUnique({
      where: { id },
    })

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    res.json({
      success: true,
      data: partner,
    })
  } catch (error) {
    console.error("Get partner error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching partner",
      error: error.message,
    })
  }
}

// Create new partner
const createPartner = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { name, description, country, address, email, phone, website } = req.body
    let logo = null

     // Handle logo update
    if (req.file) {
      logo = `/partners/${req.file.filename}`
    }
    console.log(logo, name, description, country, address, email, phone, website)
    const partner = await prisma.partner.create({
      data: {
        name,
        description,
        country,
        address,
        email,
        phone,
        website,
        logo,
      },
    })

    await createAuditLog({
      userId: res.locals.user.id,
      action: "CREATE",
      resource: "Partner",
      resourceId: partner.id,
      data: { name },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.status(201).json({
      success: true,
      message: "Partner created successfully",
      data: partner,
    })
  } catch (error) {
    console.error("Create partner error:", error)
    res.status(500).json({
      success: false,
      message: "Error creating partner",
      error: error.message,
    })
  }
}

// Update partner
const updatePartner = async (req, res) => {
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
    const { name, description, country, address, email, phone, website } = req.body

    const existingPartner = await prisma.partner.findUnique({
      where: { id },
    })

    if (!existingPartner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

     let logo = null
     // Handle logo update
    if (req.file) {
      logo = `/partners/${req.file.filename}`
    }

    const updateData = {
      name,
      description,
      country,
      address,
      email,
      phone,
      website,
    }
    if (logo) {
      updateData.logo = logo
    }


    const partner = await prisma.partner.update({
      where: { id },
      data: updateData,
    })

   await createAuditLog({
      userId: res.locals.user.id,
      action: "UPDATE",
      resource: "Partner",
      resourceId: partner.id,
      data: updateData,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.json({
      success: true,
      message: "Partner updated successfully",
      data: partner,
    })
  } catch (error) {
    console.error("Update partner error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating partner",
      error: error.message,
    })
  }
}

// Delete partner
const deletePartner = async (req, res) => {
  try {
    const { id } = req.params

    const partner = await prisma.partner.findUnique({
      where: { id },
    })

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    // Delete logo file if exists
    if (partner.logo) {
      const logoPath = path.join("uploads/partners", partner.logo)
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath)
      }
    }

    await prisma.partner.delete({
      where: { id },
    })

    await createAuditLog({
      userId: res.locals.user.id,
      action: "DELETE",
      resource: "Partner",
      resourceId: id,
      data: { name: partner.name },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    })

    res.json({
      success: true,
      message: "Partner deleted successfully",
    })
  } catch (error) {
    console.error("Delete partner error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting partner",
      error: error.message,
    })
  }
}

module.exports = {
  getAllPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner,
}
