const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const prisma = new PrismaClient();

module.exports.createNewsletter = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: "Validation errors", errors: errors.array() });

    const { email , firstName , lastName } = req.body;

    const newsletter = await prisma.newsletter.create({
      data: { email, firstName , lastName  },
    });

    res.status(201).json({ message: "Newsletter created successfully", newsletter });
  } catch (error) {
    console.error("Create newsletter error:", error);
    res.status(500).json({ message: "Failed to create newsletter", code: "CREATE_NEWSLETTER_ERROR" });
  }
};


module.exports.getAllNewsletters = async (req, res) => {
  try {
   const {
      page = 1,
      limit = 10,
      status,
      search,
      author,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (page - 1) * limit;
    const take = Number.parseInt(limit);
    const where = {};
    if (status) where.status = status;
    if (author) where.authorId = author;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [newsletters, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({ where, skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.newsletterSubscriber.count({ where }),
    ]);

    res.status(200).json({
      newsletters,
      pagination: { page: Number.parseInt(page), limit: take, total, pages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error("Get newsletters error:", error);
    res.status(500).json({ message: "Failed to retrieve newsletters", code: "GET_NEWSLETTERS_ERROR" });
  }
};

// Récupérer une newsletter par ID
module.exports.getNewsletterById = async (req, res) => {
  try {
    const { id } = req.params;

    const newsletter = await prisma.newsletterSubscriber.findUnique({ where: { id } });
    if (!newsletter) return res.status(404).json(
      {
      message: "Newsletter not found",
      code: "NEWSLETTER_NOT_FOUND"
      }
    );

    res.status(200).json({ newsletter });
  } catch (error) {
    console.error("Get newsletter error:", error);
    res.status(500).json({
      message: "Failed to retrieve newsletter", code: "GET_NEWSLETTER_ERROR"
    });
  }
};


module.exports.updateNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    const { email , firstName , lastName , status } = req.body;

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({
      message: "Newsletter not found", code: "NEWSLETTER_NOT_FOUND"
    });

    const updated = await prisma.newsletterSubscriber.update({
      where: { id },
      data: { email, firstName , lastName , status },
    });

    res.status(200).json({
      message: "Newsletter updated successfully", newsletter: updated
    });

  } catch (error) {
    console.error("Update newsletter error:", error);
    res.status(500).json({ message: "Failed to update newsletter", code: "UPDATE_NEWSLETTER_ERROR" });
  }
};


module.exports.deleteNewsletter = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({
        message: "Newsletter not found", code: "NEWSLETTER_NOT_FOUND"
    });

    await prisma.newsletterSubscriber.delete({ where: { id } });

    res.status(200).json({ message: "Newsletter deleted successfully" });
  } catch (error) {
    console.error("Delete newsletter error:", error);
    res.status(500).json({ message: "Failed to delete newsletter", code: "DELETE_NEWSLETTER_ERROR" });
  }
};


module.exports.subscribeToNewsletter = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { email } = req.params;
  
    let subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (subscriber) {
      if (subscriber.status === "ACTIVE") {
        return res.status(200).json({
          message: "Already subscribed, added to this news",
        });
      } else {
        subscriber = await prisma.newsletterSubscriber.update({
          where: { email: email.toLowerCase() },
          data: { status: "ACTIVE" },
        });
      }
    } else {
      subscriber = await prisma.newsletterSubscriber.create({
        data: {
          email: email.toLowerCase(),
          status: "ACTIVE",
        },
      });
    }


    await createAuditLog({
      action: "NEWSLETTER_SUBSCRIPTION",
      resource: "newsletter_subscribers",
      details: { email },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      message: "Subscribed to news successfully",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    res.status(500).json({
      message: "Failed to subscribe to newsletter",
      code: "SUBSCRIPTION_ERROR",
    });
  }
};

module.exports.unsubscribeFromNewsletter = async (req, res) => {
  try {
     const { email } = req.params;
   
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!subscriber) {
      return res.status(404).json({
        message: "Email not found in subscribers",
        code: "SUBSCRIBER_NOT_FOUND",
      });
    }

    await prisma.newsletterSubscriber.update({
      where: { email: email.toLowerCase() },
      data: { status: "UNSUBSCRIBED" },
    });
    

    await createAuditLog({
      action: "NEWSLETTER_UNSUBSCRIPTION",
      resource: "newsletter_subscribers",
      details: { email },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      message: "Unsubscribed from newsletter successfully",
    });
  } catch (error) {
    console.error("Newsletter unsubscription error:", error);
    res.status(500).json({
      message: "Failed to unsubscribe from newsletter",
      code: "UNSUBSCRIPTION_ERROR",
    });
  }
};


