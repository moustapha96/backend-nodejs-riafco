
// controllers/invitation.controller.js
const { PrismaClient } = require("@prisma/client")
const { validationResult } = require("express-validator")
const crypto = require("crypto")
const bcrypt = require("bcryptjs")
const { createAuditLog } = require("../utils/audit")
const prisma = new PrismaClient()
const emailService = require("../services/email.service")

/**
 * @desc Get all invitations
 * @route GET /api/invitations
 * @access Private (ADMIN, GUEST , MEMBER)
 */
module.exports.getAllInvitations = async (req, res) => {
  try {
    const { status, search } = req.query
    const where = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    const invitations = await prisma.invitation.findMany({
      where,
      include: {
        invitedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        organization: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    res.status(200).json({ invitations })
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve invitations", error: error.message })
  }
}

/**
 * @desc Create an invitation
 * @route POST /api/invitations
 * @access Private (ADMIN, GUEST , MEMBER)
 */
module.exports.createInvitation = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { fullName, email, phone, organizationId } = req.body
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours

    const invitation = await prisma.invitation.create({
      data: {
        fullName,
        email,
        phone,
        token,
        expiresAt,
        invitedById: res.locals.user.id,
        organizationId,
      },
      include: {
        invitedBy: { select: { firstName: true, lastName: true } },
        organization: { select: { name: true } },
      },
    })

    // Envoyer un email d'invitation
    await emailService.sendInvitationEmail(invitation, token)

    await createAuditLog({
      userId: res.locals.user.id,
      action: "INVITATION_CREATED",
      resource: "invitations",
      resourceId: invitation.id,
      details: { email: invitation.email, organization: invitation.organization?.name },
    })

    res.status(201).json({ invitation })
  } catch (error) {
    res.status(500).json({ message: "Failed to create invitation", error: error.message })
  }
}

/**
 * @desc Accept an invitation
 * @route POST /api/invitations/:token/accept
 * @access Public
 */
module.exports.acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    const invitation = await prisma.invitation.findUnique({
      where: { token, status: "PENDING" },
    })

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found or already accepted" })
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ message: "Invitation has expired" })
    }

    // Créer un utilisateur
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        firstName: invitation.fullName.split(" ")[0],
        lastName: invitation.fullName.split(" ").slice(1).join(" "),
        email: invitation.email,
        phone: invitation.phone,
        password: hashedPassword,
        profilePic: invitation.profilePic,
      },
    })

    // Mettre à jour le statut de l'invitation
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: "ACCEPTED",
        userId: user.id,
        acceptedAt: new Date(),
      },
    })

    res.status(201).json({ user })
  } catch (error) {
    res.status(500).json({ message: "Failed to accept invitation", error: error.message })
  }
}
/**
 * @desc Reject an invitation
 * @route POST /api/invitations/:token/reject
 * @access Public
 */
module.exports.rejectInvitation = async (req, res) => {
  try {
    const { token } = req.params

    const invitation = await prisma.invitation.findUnique({
      where: { token, status: "PENDING" },
    })

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found or already processed" })
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ message: "Invitation has expired" })
    }

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
      },
    })

    await createAuditLog({
      userId: null,
      action: "INVITATION_REJECTED",
      resource: "invitations",
      resourceId: invitation.id,
      details: { email: invitation.email, token },
    })

    res.status(200).json({ message: "Invitation rejected successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to reject invitation", error: error.message })
  }
}

/**
 * @desc Resend an invitation
 * @route POST /api/invitations/:id/resend
 * @access Private (ADMIN, GUEST , MEMBER)
 */
module.exports.resendInvitation = async (req, res) => {
  try {
    const { id } = req.params

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: {
        invitedBy: { select: { firstName: true, lastName: true } },
        organization: { select: { name: true } },
      },
    })

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" })
    }

    if (invitation.status !== "PENDING") {
      return res.status(400).json({ message: "Can only resend pending invitations" })
    }

    const newToken = crypto.randomBytes(32).toString("hex")
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const updatedInvitation = await prisma.invitation.update({
      where: { id },
      data: {
        token: newToken,
        expiresAt: newExpiresAt,
        resentAt: new Date(),
      },
      include: {
        invitedBy: { select: { firstName: true, lastName: true } },
        organization: { select: { name: true } },
      },
    })

    await emailService.sendInvitationEmail(updatedInvitation, newToken)

    await createAuditLog({
      userId: res.locals.user.id,
      action: "INVITATION_RESENT",
      resource: "invitations",
      resourceId: invitation.id,
      details: { email: invitation.email, resentBy: res.locals.user.email },
    })

    res.status(200).json({ message: "Invitation resent successfully", invitation: updatedInvitation })
  } catch (error) {
    res.status(500).json({ message: "Failed to resend invitation", error: error.message })
  }
}