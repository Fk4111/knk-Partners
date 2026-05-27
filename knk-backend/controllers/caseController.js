const Case = require("../models/Case");

// POST - create case
exports.createCase = async (req, res, next) => {
  console.log("CREATE CASE HIT");
  try {
      const newCase = await Case.create({
      ...req.body,
      user: req.user._id   // 🔥 logged-in user
    });

    res.status(201).json({
      success: true,
      message: "Case created successfully",
      data: newCase,
    });

  } catch (error) {
    next(error);
  }
};


// GET - all cases with pagination, filtering, search, and Sorting

exports.getAllCases = async (req, res, next) => {

  console.log(req.user);
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Filters
    let filter = {};

    // If user is NOT admin → only own cases
        if (req.user.role !== "admin") {
      filter.assignedTo = req.user._id;
    }

    if (req.query.status) {
      filter.check_status = req.query.status;
    }

    if (req.query.search) {
      filter.$or = [
        {
          comp_ref_no: {
            $regex: req.query.search,
            $options: "i",
          }
        },
        {
          candidate_name: {
            $regex: req.query.search,
            $options: "i",
          }
        }
      ];
    }

    // Sorting & How Sorting will work:-
      // sort=createdAt   → ascending (old → new)
     //  sort=-createdAt  → descending (new → old)
     
    let sortBy = "-createdAt"; // default (latest first)

    if (req.query.sort) {
      sortBy = req.query.sort;
    }

    // Total count
    const total = await Case.countDocuments(filter);

    // Fetch data
    const cases = await Case.find(filter)
    .populate("user", "email role")
    .populate("assignedTo", "email role")
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      sort: sortBy,
      data: cases,
    });

  } catch (error) {
    next(error);
  }
};

// GET - case by ID
exports.getCaseById = async (req, res, next) => {

  try {

    console.log("PARAM ID:", req.params.id);

    const singleCase = await Case.findOne({
      _id: req.params.id
    });

    console.log("CASE FOUND:", singleCase);

    if (!singleCase) {

      const error = new Error("Case not found");

      error.statusCode = 404;

      return next(error);

    }

    res.status(200).json({
      success: true,
      data: singleCase,
    });

  } catch (error) {

    console.log(error);

    next(error);

  }

};





// PUT - update full case
exports.updateCase = async (req, res, next) => {
  try {

    let filter = { _id: req.params.id };

    // Non-admin users can update only their own cases
    if (req.user.role !== "admin") {
      filter.user = req.user._id;
    }

    const updatedCase = await Case.findOneAndUpdate(
      filter,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCase) {
      const error = new Error("Case not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Case updated successfully",
      data: updatedCase,
    });

  } catch (error) {
    next(error);
  }
};


// DELETE - case by ID
exports.deleteCase = async (req, res, next) => {
  try {
      const deletedCase = await Case.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

    if (!deletedCase) {
      const error = new Error("Case not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Case deleted successfully",
    });

  } catch (error) {
    next(error);
  }
};

// Assign case
exports.assignCase = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      const error = new Error("assignedTo is required");
      error.statusCode = 400;
      return next(error);
    }

    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true }
    ).populate("assignedTo", "email role");

    if (!updatedCase) {
      const error = new Error("Case not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Case assigned successfully",
      data: updatedCase
    });

  } catch (error) {
    next(error);
  }
};

// DASHBOARD STATS
exports.getDashboardStats = async (req,res,next)=>{
 try{

   let filter = {};

   // Agent → only assigned cases
   if(req.user.role !== "admin"){
      filter.assignedTo = req.user._id;
   }

   const totalCases =
      await Case.countDocuments(filter);

   const newCases =
      await Case.countDocuments({
      ...filter,
      check_status:"NEW"
   });

    // for Bell icon
   const pendingCases =
   await Case.countDocuments({
      check_status:"PENDING"
   });

   const inProgressCases =
      await Case.countDocuments({
      ...filter,
      check_status:"IN_PROGRESS"
   });

   const qCheckCases =
      await Case.countDocuments({
      ...filter,
      check_status:"Q_CHECK"
   });

   const doneCases =
      await Case.countDocuments({
      ...filter,
      check_status:"DONE"
   });

   const insufficientCases =
      await Case.countDocuments({
      ...filter,
      check_status:"INSUFFICIENT"
   });

   const onHoldCases =
      await Case.countDocuments({
      ...filter,
      check_status:"ON_HOLD"
   });

   const stoppedCases =
      await Case.countDocuments({
      ...filter,
      check_status:"STOPPED"
   });

   const rejectedCases =
      await Case.countDocuments({
      ...filter,
      check_status:"REJECTED"
   });

   res.status(200).json({
      success:true,
     data:{
          totalCases,
          pendingCases,
          newCases,
          inProgressCases,
          qCheckCases,
          doneCases,
          insufficientCases,
          onHoldCases,
          stoppedCases,
          rejectedCases
          }
   });

 }
 catch(error){
   next(error)
 }
}

//GetSingleCase

exports.getSingleCase = async (req, res, next) => {

  try {

    console.log(req.params.id);

    const singleCase = await Case.findById(req.params.id);

    console.log(singleCase);

    if (!singleCase) {

      const error = new Error("Case not found");

      error.statusCode = 404;

      return next(error);

    }

    res.status(200).json({
      success: true,
      data: singleCase,
    });

  } catch (error) {

    next(error);

  }

};

// update case status 
exports.updateCaseStatus = async (req, res, next) => {

  try {

    const { check_status } = req.body;

    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      { check_status },
      { new: true }
    );

    if (!updatedCase) {

      const error = new Error("Case not found");

      error.statusCode = 404;

      return next(error);

    }

    res.status(200).json({
      success: true,
      data: updatedCase,
    });

  } catch (error) {

    next(error);

  }

};

// RAISE INSUFFICIENT QUERY
exports.raiseInsufficientQuery =
async (req, res, next) => {

  try {

    const caseData =
      await Case.findById(
        req.params.id
      );

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    caseData.insufficient_query =
      req.body.query;

    caseData.check_status =
      "INSUFFICIENT";

    await caseData.save();

    res.status(200).json({
      success: true,
      message:
        "Query raised successfully",
      data: caseData,
    });

  } catch (error) {
    next(error);
  }
};