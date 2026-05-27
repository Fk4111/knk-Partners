const express = require("express");

const {
  getApiRequests,
  createApiRequest,
  processApiRequest,
  getRecentApiActivity,
} = require("../controllers/ApiInboxController");

const router = express.Router();


// GET ALL
router.get("/", getApiRequests);


// RECENT API ACTIVITY
router.get("/activity", getRecentApiActivity);

// CREATE REQUEST
router.post("/", createApiRequest);


// PROCESS REQUEST
router.post("/process/:id", processApiRequest);



module.exports = router;