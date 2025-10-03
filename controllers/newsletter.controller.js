const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const { createAuditLog } = require("../utils/audit");
const emailService = require("../services/email.service");
const prisma = new PrismaClient();

module.exports.createNewsletter = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: "Validation errors", errors: errors.array() });

    const { email, firstName, lastName } = req.body;

    const newsletter = await prisma.newsletter.create({
      data: { email, firstName, lastName },
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
      prisma.newsletterSubscriber.findMany({
        where, skip,
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
    const { email, firstName, lastName, status } = req.body;

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({
      message: "Newsletter not found", code: "NEWSLETTER_NOT_FOUND"
    });

    const updated = await prisma.newsletterSubscriber.update({
      where: { id },
      data: { email, firstName, lastName, status },
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
    const { sig } = req.query;

    if (typeof sig !== "undefined" && !verifyUnsubscribe(email, sig)) {
      return res.status(400).json({ message: "Invalid unsubscribe signature", code: "BAD_UNSUB_SIG" });
    }


    const normalizedEmail = String(email).toLowerCase().trim();

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
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
      userId: subscriber.id,
      action: "NEWSLETTER_UNSUBSCRIPTION",
      resource: "newsletter_subscribers",
      details: { email },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    await emailService.sendUnsubscribeConfirmation(normalizedEmail);

    const siteSettings = await prisma.siteSettings.findFirst();
    const siteName = siteSettings?.siteName || "RIAFCO";
    const contactEmail = siteSettings?.contactEmail || "contact@riafco.org";
    const subject = `${siteName} — Désabonnement confirmé`;
    
    const logoUrl = `${process.env.BACKEND_URL}/${siteSettings?.logo}` || "http://localhost:3000/logo.png";

    
    const html = renderUnsubHtml({
      siteName, logoUrl, contactEmail,
      title: "Désabonnement confirmé",
      heading: "Vous êtes désabonné(e)",
      message: "Votre adresse a bien été retirée de notre liste de diffusion. Vous pourrez vous réabonner depuis notre site quand vous le souhaiterez.",
    });

    return res.status(200).send(html);

  } catch (error) {
    console.error("Newsletter unsubscription error:", error);
    res.status(500).json({
      message: "Failed to unsubscribe from newsletter",
      code: "UNSUBSCRIPTION_ERROR",
    });
  }
};



function renderUnsubHtml({ siteName, logoUrl, title, heading, message, contactEmail }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  :root{color-scheme:light dark}
  body{font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#222;background:#f6f7f9;margin:0}
  .wrap{max-width:640px;margin:6vh auto;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.06);border-radius:16px;overflow:hidden}
  header{padding:24px 24px 16px;border-bottom:1px solid #eee;text-align:center}
  header img{max-width:160px;height:auto}
  main{padding:24px}
  h1{margin:0 0 8px;font-size:22px;color:#1e81b0}
  p{margin:0 0 10px}
  .muted{color:#6b7280;font-size:14px}
  footer{padding:16px 24px;border-top:1px solid #eee;text-align:center;font-size:12px;color:#6b7280}
  a.btn{display:inline-block;margin-top:12px;padding:10px 14px;border-radius:10px;text-decoration:none;border:1px solid #1e81b0}
</style>
</head>
<body>
  <div class="wrap">
    <header>
      ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(siteName)}">` : ""}
    </header>
    <main>
      <h1>${escapeHtml(heading)}</h1>
      <p>${message}</p>
      <p class="muted">Besoin d’aide ? Écrivez-nous : <a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a></p>
    </main>
    <footer>&copy; ${new Date().getFullYear()} ${escapeHtml(siteName)}</footer>
  </div>
</body>
</html>`;
}


function escapeHtml(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}