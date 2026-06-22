require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

const caseRoutes = require("./routes/caseRoutes");
const authRoutes = require("./routes/authRoutes");
const ApiInboxRoutes = require("./routes/ApiInboxRoutes");
const ApiLogRoutes = require("./routes/ApiLogRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const reportRoutes = require("./routes/reportRoutes");
const clientApiRoutes = require("./routes/clientApiRoutes");
const clientRoutes = require("./routes/clientRoutes");
const path = require("path");

const app = express();

/* Connect Database */
connectDB();

/* Middlewares */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://knk-partners.vercel.app",
      "https://www.knkpartner.com",
      "https://knkpartner.com",
      "https://knk-partners-aldhtmjqn-khanfaiyaz359-8312s-projects.vercel.app",
    ],
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    credentials: true,
  })
);

app.use(express.json());


//for file upload
const uploadsPath = path.resolve(
  __dirname,
  "uploads"
);

app.use(
  "/uploads",
  express.static(uploadsPath)
);

app.get("/test-upload", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "uploads",
      "proofs",
      "1780577657739-823550676.jpeg"
    )
  );
});

/* Routes */

app.use("/api/v1", caseRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/api-inbox", ApiInboxRoutes);
app.use("/api/v1/api-logs", ApiLogRoutes);
app.use("/api/v1/audit-logs", auditLogRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/client", clientApiRoutes);
app.use("/api/v1/clients", clientRoutes);

/* Error Handling Middleware */
app.use(errorHandler);

/* Test Route */
app.get("/", (req, res) => {
  res.send("API is running...");
});

/* Start Server */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    "Server running on port",
    PORT
  );
});