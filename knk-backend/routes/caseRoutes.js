const express = require("express");

const router = express.Router();

const validateCase = require("../middlewares/validateCase");
const validateStatus = require("../middlewares/validateStatus");

const {
  protect,
  adminOnly,
} = require("../middlewares/authMiddleware");

const {
  createCase,
  getAllCases,
  getSingleCase, // ✅ changed
  updateCase,
  deleteCase,
  updateCaseStatus,
  assignCase,
  getDashboardStats,
} = require("../controllers/caseController");


// DASHBOARD
router.get(
  "/cases/stats",
  protect,
  getDashboardStats
);


// CASE CRUD
router.post(
  "/cases",
  protect,
  validateCase,
  createCase
);

router.get(
  "/cases",
  protect,
  getAllCases
);

router.get(
  "/cases/:id",
  protect,
  getSingleCase // ✅ changed
);

router.put(
  "/cases/:id",
  protect,
  validateCase,
  updateCase
);

router.delete(
  "/cases/:id",
  protect,
  deleteCase
);


// STATUS UPDATE
router.put(
  "/cases/:id/status",
  protect,
  validateStatus,
  updateCaseStatus
);


// ASSIGN CASE
router.patch(
  "/cases/:id/assign",
  protect,
  adminOnly,
  assignCase
);


// TEST ROUTE
router.get("/test", (req, res) => {
  res.send("Route working");
});

module.exports = router;