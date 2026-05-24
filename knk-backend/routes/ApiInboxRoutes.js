const express = require("express");

const {
  getApiRequests,
  createApiRequest,
  processApiRequest,
} = require("../controllers/ApiInboxController");

const router = express.Router();


// GET ALL
router.get("/", getApiRequests);


// CREATE REQUEST
router.post("/", createApiRequest);


// PROCESS REQUEST
router.post("/process/:id", processApiRequest);


module.exports = router;