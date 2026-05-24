require("dotenv").config();
const express = require("express");
const cors = require("cors");
const caseRoutes = require("./routes/caseRoutes");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const ApiInboxRoutes = require("./routes/ApiInboxRoutes");

const connectDB = require("./config/db");

const app = express();

/* Connect Database */
connectDB();

/* Middlewares */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://knk-panel.vercel.app"
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/v1", caseRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/api-inbox", ApiInboxRoutes);

/* Error Handling Middleware */
app.use(errorHandler);


/* Test Route */
app.get("/", (req, res) => {
  res.send("API is running...");
});

/* Start Server */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});