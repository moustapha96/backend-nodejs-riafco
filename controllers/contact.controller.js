const { PrismaClient } = require("@prisma/client")
const { validationResult } = require("express-validator")
const { logAudit } = require("../utils/audit")
const { sendEmail } = require("../services/email.service")

const prisma = new PrismaClient()

// Get all contacts with pagination and filtering
const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const where = {}
    if (status) {
      where.status = status
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ]
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: Number.parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.contact.count({ where }),
    ])

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("Get contacts error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching contacts",
      error: error.message,
    })
  }
}

// Create new contact (public endpoint)
const createContact = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { name, email, subject, message } = req.body

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    })

    // Send notification email to admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || "admin@riafco.org",
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `,
      })
    } catch (emailError) {
      console.error("Failed to send notification email:", emailError)
    }

    res.status(201).json({
      success: true,
      message: "Contact form submitted successfully",
      data: contact,
    })
  } catch (error) {
    console.error("Create contact error:", error)
    res.status(500).json({
      success: false,
      message: "Error submitting contact form",
      error: error.message,
    })
  }
}

// Update contact status and add response
const updateContact = async (req, res) => {
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
    const { status, response } = req.body

    const contact = await prisma.contact.findUnique({
      where: { id },
    })

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      })
    }

    const updateData = {
      status,
      response,
      respondedBy: req.user.id,
      respondedAt: new Date(),
    }

    const updatedContact = await prisma.contact.update({
      where: { id },
      data: updateData,
    })

    // Send response email if provided
    if (response && status === "RESOLVED") {
      try {
        await sendEmail({
          to: contact.email,
          subject: `Re: ${contact.subject}`,
          html: `
            <h2>Response to your inquiry</h2>
            <p>Dear ${contact.name},</p>
            <p>Thank you for contacting us. Here is our response:</p>
            <p>${response.replace(/\n/g, "<br>")}</p>
            <p>Best regards,<br>RIAFCO Team</p>
          `,
        })
      } catch (emailError) {
        console.error("Failed to send response email:", emailError)
      }
    }

    await logAudit(req.user.id, "UPDATE", "Contact", id, updateData, req.ip, req.get("User-Agent"))

    res.json({
      success: true,
      message: "Contact updated successfully",
      data: updatedContact,
    })
  } catch (error) {
    console.error("Update contact error:", error)
    res.status(500).json({
      success: false,
      message: "Error updating contact",
      error: error.message,
    })
  }
}

// Delete contact
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params

    const contact = await prisma.contact.findUnique({
      where: { id },
    })

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      })
    }

    await prisma.contact.delete({
      where: { id },
    })

    await logAudit(req.user.id, "DELETE", "Contact", id, { subject: contact.subject }, req.ip, req.get("User-Agent"))

    res.json({
      success: true,
      message: "Contact deleted successfully",
    })
  } catch (error) {
    console.error("Delete contact error:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting contact",
      error: error.message,
    })
  }
}

module.exports = {
  getAllContacts,
  createContact,
  updateContact,
  deleteContact,
}
