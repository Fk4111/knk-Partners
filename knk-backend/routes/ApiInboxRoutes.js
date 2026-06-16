const express = require("express");

const {
  getApiRequests,
  createApiRequest,
  processApiRequest,
  getRecentApiActivity,
} = require("../controllers/ApiInboxController");
const apiKeyAuth = require("../middlewares/apiKeyAuth");

const router = express.Router();


// GET ALL
router.get("/", getApiRequests);


// RECENT API ACTIVITY
router.get("/activity", getRecentApiActivity);

// // CREATE REQUEST
// router.post("/", createApiRequest);


// PROCESS REQUEST
router.post("/process/:id", processApiRequest);

// CLIENT ROUTE (Protected by API Key)
router.post("/client", apiKeyAuth, createApiRequest);



module.exports = router;