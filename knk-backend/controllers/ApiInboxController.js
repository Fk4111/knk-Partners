const ApiRequest = require("../models/ApiRequest");
const Case = require("../models/Case");


// GET ALL API REQUESTS
const getApiRequests = async (req, res) => {
  try {

    const requests = await ApiRequest.find({
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
const createApiRequest = async (req, res) => {
  try {

    const request = await ApiRequest.create(req.body);

    res.status(201).json(request);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// PROCESS API REQUEST -> CREATE CASE
const processApiRequest = async (req, res) => {
  try {

    const request = await ApiRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "API request not found",
      });
    }

    // CREATE REAL CASE
    const newCase = await Case.create({
      applicationId: request.applicationId,
      candidateName: request.candidateName,
      fatherName: request.fatherName,
      dob: request.dob,
      city: request.city,
      state: request.state,
      vendor: request.vendor,
      remark: request.remark,
      status: "NEW",
      source: "CLIENT_API",
    });

    // MARK AS PROCESSED
    request.processed = true;
    await request.save();

    res.json({
      message: "Case created successfully",
      case: newCase,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  getApiRequests,
  createApiRequest,
  processApiRequest,
};