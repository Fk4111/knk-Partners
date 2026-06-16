const express = require("express");
const router = express.Router();

const {
  getCaseStatus,
  getBulkCaseStatus,
  getVendorCasesStatus,
} = require("../controllers/clientApiController");

const apiKeyAuth = require("../middlewares/apiKeyAuth");

router.post(
  "/status/bulk",
  apiKeyAuth,
  getBulkCaseStatus
);

router.get(
  "/status/vendor",
  apiKeyAuth,
  getVendorCasesStatus
);

router.get(
  "/status/:applicationId",
  apiKeyAuth,
  getCaseStatus
);

module.exports = router;