const ApiRequest = require("../models/ApiRequest");
const Case = require("../models/Case");
const User = require("../models/User");
const createApiLog = require("../utils/apiLogger");


// GET ALL API REQUESTS
const getApiRequests = async (req, res) => {
  try {

    const requests =
      await ApiRequest.find({
        processed: false,
      }).sort({ createdAt: -1 });

    res.json(requests);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// CREATE NEW API REQUEST
const createApiRequest = async (
  req,
  res
) => {
  try {

    const request =
      await ApiRequest.create(
        req.body
      );

    // API LOG CREATE
    await createApiLog({
      appId:
        request.applicationId ||
        "",

      endpoint:
        req.originalUrl,

      method:
        req.method,

      status:
        "SUCCESS",

      source:
        "Client API",

      requestBody:
        req.body,

      responseBody: {
        message:
          "API request received",
      },
    });

    res.status(201).json(
      request
    );

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    });

  }
};


// PROCESS API REQUEST -> CREATE REAL CASE
const processApiRequest = async (
  req,
  res
) => {
  try {

    const request =
      await ApiRequest.findById(
        req.params.id
      );

    if (!request) {
      return res.status(404).json({
        message:
          "API request not found",
      });
    }

    // prevent duplicate processing
    if (request.processed) {
      return res.status(400).json({
        message:
          "Already processed",
      });
    }

    // find default admin user
    const defaultUser =
      await User.findOne({
        role: "admin",
      });

    if (!defaultUser) {
      return res.status(404).json({
        message:
          "No admin user found",
      });
    }

    // use applicationId from API as real ref no
    const comp_ref_no =
      request.applicationId;

    // prevent duplicate case ref
    const existingCase =
      await Case.findOne({
        comp_ref_no,
      });

    if (existingCase) {
      return res.status(400).json({
        message:
          "Case already exists",
      });
    }

    // CREATE REAL CASE
    const newCase =
      await Case.create({
        comp_ref_no,

        user:
          defaultUser._id,

        check_status:
          "NEW",

        callback_url: "",

        candidate_name:
          request.candidateName,

        father_name:
          request.fatherName,

        candidate_dob:
          request.dob,

        city:
          request.city,

        state:
          request.state,

        vendor:
          request.vendor,

        tat:
          request.tat,

        remark:
          request.remark,

        attachment:
          request.attachment,
      });

    // mark request processed
    request.processed = true;
    await request.save();

    // API LOG FOR PROCESSING
    await createApiLog({
      appId:
        request.applicationId ||
        "",

      endpoint:
        req.originalUrl,

      method:
        req.method,

      status:
        "PROCESSED",

      source:
        "Client API",

      requestBody: {
        apiRequestId:
          request._id,
      },

      responseBody: {
        caseId:
          newCase._id,
        message:
          "Case created successfully",
      },
    });

    res.json({
      success: true,
      message:
        "Case created successfully",
      case: newCase,
    });

  } catch (error) {

    res.status(500).json({
      message:
        error.message,
    });

  }
};


// RECENT API ACTIVITY
const getRecentApiActivity =
  async (req, res) => {
    try {

      const logs =
        await ApiRequest.find()
          .sort({
            createdAt: -1,
          })
          .limit(5);

      res.status(200).json({
        success: true,
        data: logs,
      });

    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });

    }
  };


module.exports = {
  getApiRequests,
  createApiRequest,
  processApiRequest,
  getRecentApiActivity,
};