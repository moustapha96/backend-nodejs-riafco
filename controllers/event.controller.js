

const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const { createAuditLog } = require("../utils/audit");
const emailService = require("../services/email.service");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

// Récupérer tous les événements
module.exports.getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, upcoming, sortBy = "startDate", sortOrder = "asc" } = req.query;
    const skip = (page - 1) * limit;
    const take = Number.parseInt(limit);
    const where = {};

    if (status) where.status = status;
    if (upcoming === "true") where.startDate = { gte: new Date() };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
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
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.event.count({ where }),
    ]);

    res.status(200).json({
      events,
      pagination: {
        page: Number.parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error("Get all events error:", error);
    res.status(500).json({
      message: "Failed to retrieve events",
      code: "GET_EVENTS_ERROR",
    });
  }
};

// Récupérer un événement par ID
module.exports.getEvent = async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
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
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
        code: "EVENT_NOT_FOUND",
      });
    }

    res.status(200).json({ event });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({
      message: "Failed to retrieve event",
      code: "GET_EVENT_ERROR",
    });
  }
};

// Créer un nouvel événement
module.exports.createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }
    const { title, description,
      startDate, endDate,maxAttendees,
      isVirtual, location, status = "DRAFT",
      registrationLink
    } = req.body;

    const authorId = res.locals.user.id;

    // Vérifier et créer le dossier de téléchargement
    const uploadDir = "uploads/events";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Gérer l'image
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/events/${Date.now()}-${req.file.originalname}`;
      fs.renameSync(req.file.path, path.join(uploadDir, path.basename(imagePath)));
    }

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        maxAttendees: maxAttendees ? Number(maxAttendees) : 0,
        location: location?.trim(),
        status,
        isVirtual: isVirtual ?? false,
        registrationLink: registrationLink?.trim(),
        image: imagePath,
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
    });

    await createAuditLog({
      userId: authorId,
      action: "EVENT_CREATED",
      resource: "events",
      resourceId: event.id,
      details: { title: event.title, startDate, status },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({
      message: "Failed to create event",
      code: "CREATE_EVENT_ERROR",
    });
  }
};

// Mettre à jour un événement
module.exports.updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { title, description, startDate, endDate, location,
            isVirtual, status, registrationLink } = req.body;

    const existingEvent = await prisma.event.findUnique({
      where: { id }
    });

    if (!existingEvent) {
      return res.status(404).json({
        message: "Event not found",
        code: "EVENT_NOT_FOUND",
      });
    }

    const updateData = {
      title: title?.trim(),
      description: description?.trim(),
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      location: location?.trim(),
      maxAttendees: maxAttendees ? Number(maxAttendees) : existingEvent.maxAttendees,
      isVirtual: isVirtual ?? existingEvent.isVirtual,
      status,
      registrationLink: registrationLink?.trim(),
    };

    // Supprimer les champs non définis
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Gérer l'image
    if (req.file) {
      const uploadDir = "uploads/events";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      updateData.image = `/uploads/events/${Date.now()}-${req.file.originalname}`;
      fs.renameSync(req.file.path, path.join(uploadDir, path.basename(updateData.image)));
    }
console.log("updateData =>", updateData);
    const updatedEvent = await prisma.event.update({
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
    });

    // Envoyer des notifications aux participants si demandé
    // if (notifyParticipants && existingEvent.registrations.length > 0) {
    //   try {
    //     const emailPromises = existingEvent.registrations.map((registration) =>
    //       emailService.sendEmail({
    //         to: registration.email,
    //         subject: `Event Update: ${updatedEvent.title}`,
    //         html: `
    //           <h2>Event Update</h2>
    //           <p>Hello ${registration.name},</p>
    //           <p>The event "${updatedEvent.title}" has been updated.</p>
    //           <p>Please check the latest details and mark your calendar accordingly.</p>
    //           <p>Best regards,<br>The RIAFCO Team</p>
    //         `,
    //         text: `Event Update: ${updatedEvent.title} has been updated. Please check the latest details.`,
    //       }),
    //     );
    //     await Promise.allSettled(emailPromises);
    //   } catch (emailError) {
    //     console.error("Failed to send event update notifications:", emailError);
    //   }
    // }

    await createAuditLog({
      userId: res.locals.user.id,
      action: "EVENT_UPDATED",
      resource: "events",
      resourceId: id,
      details: { changes: updateData },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({
      message: "Failed to update event",
      code: "UPDATE_EVENT_ERROR",
      error: error,
    });
  }
};

// Supprimer un événement
module.exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return res.status(404).json({
        message: "Event not found",
        code: "EVENT_NOT_FOUND",
      });
    }

    await prisma.event.delete({
      where: { id },
    });

    await createAuditLog({
      userId: res.locals.user.id,
      action: "EVENT_DELETED",
      resource: "events",
      resourceId: id,
      details: { title: existingEvent.title },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({
      message: "Failed to delete event",
      code: "DELETE_EVENT_ERROR",
    });
  }
};
