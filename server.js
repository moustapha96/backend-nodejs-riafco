const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const path = require("path")

const { swaggerUi, specs } = require('./swagger');

require("dotenv").config()
require("./config/db")


const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { checkUser, requireAuth } = require("./middleware/auth.middleware")

// Import all routes
const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/user.routes")
const activityRoutes = require("./routes/activity.routes")
const eventRoutes = require("./routes/event.routes")
const newsRoutes = require("./routes/news.routes")
const resourceRoutes = require("./routes/resource.routes")
const partnerRoutes = require("./routes/partner.routes")
const historyRoutes = require("./routes/history.routes")
const settingsRoutes = require("./routes/settings.routes")
const dashboardRoutes = require("./routes/dashboard.routes")
const contactRoutes = require("./routes/contact.routes")
const socialRoutes = require("./routes/social.routes")
const legalRoutes = require("./routes/legal.routes")
const themeRoutes = require("./routes/theme.route");
const invitationRoutes = require("./routes/invitation.route");
const socialFeedRoutes = require("./routes/socialFeed.route");
const memberCountryRoutes = require("./routes/memberCountry.route");
const teamMembersRoutes = require("./routes/teamMember.route");
const commentRoutes = require("./routes/comment.route");
const discussionRoutes = require("./routes/discussion.routes");
const governanceReportRoutes = require("./routes/governanceReport.route");
const aboutUsRoutes = require("./routes/aboutUs.route")
const campaignsRoutes = require("./routes/campaigns.routes")
const newsletterRoutes = require("./routes/newsletter.routes")


app.use(helmet())



const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500, 
  message: "Too many requests from this IP, please try again later.",
})


app.use(bodyParser.json({ limit: "10mb" }))
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3030",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
)


app.use("/api/", limiter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use(express.static(path.join(__dirname, "uploads")));


app.use("/profiles", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  next();
}, express.static(path.join(__dirname, "uploads")));


app.use("/about-us", express.static(path.join(__dirname, "uploads")));
app.use("/activities", express.static(path.join(__dirname, "uploads")));
app.use("/countries", express.static(path.join(__dirname, "uploads")));
app.use("/events", express.static(path.join(__dirname, "uploads")));
app.use("/gouvernance", express.static(path.join(__dirname, "uploads")));
app.use("/history", express.static(path.join(__dirname, "uploads")));
app.use("/news", express.static(path.join(__dirname, "uploads")));
app.use("/partners", express.static(path.join(__dirname, "uploads")));
app.use("/resources", express.static(path.join(__dirname, "uploads")));
app.use("/settings", express.static(path.join(__dirname, "uploads")));
app.use("/teams", express.static(path.join(__dirname, "uploads")));
app.use("/flags", express.static(path.join(__dirname, "uploads")));
app.use("/reports", express.static(path.join(__dirname, "uploads")));


app.get("/", (req, res) => {
  res.status(200).json({
    message: "RIAFCO Backoffice API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  })
})
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  })
})
app.get("/api/jwtid", requireAuth, (req, res) => {
  res.status(200).json({ userId: res.locals.user.id })
})

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/activities", activityRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/news", newsRoutes)
app.use("/api/resources", resourceRoutes)
app.use("/api/partners", partnerRoutes)
app.use("/api/settings", settingsRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/contacts", contactRoutes)

app.use("/api/social", socialRoutes)
app.use("/api/legal", legalRoutes)
app.use("/api/social-feeds", socialFeedRoutes);
app.use("/api/governance-reports", governanceReportRoutes);
app.use("/api/history", historyRoutes)
app.use("/api/about-us", aboutUsRoutes)

app.use("/api/member-countries", memberCountryRoutes);
app.use("/api/team-members", teamMembersRoutes);

app.use("/api/comments", commentRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/themes", themeRoutes);

app.use("/api/campaigns", campaignsRoutes)
app.use("/api/newsletter", newsletterRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  })
})

app.get(checkUser)
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  })
})


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 RIAFCO Backoffice API listening on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔗 Api doc: http://localhost:${PORT}/api-doc`)
})
