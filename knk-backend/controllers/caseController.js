const Case = require("../models/Case");
const createAuditLog = require("../utils/auditLogger");
const sendWebhook = require("../utils/sendWebhook");

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

// GET - all cases with pagination, filtering, search and sorting

exports.getAllCases = async (req, res, next) => {

  console.log(req.user);

  try {

    // Pagination
    const page =
      parseInt(req.query.page) || 1;

    const limit =
      parseInt(req.query.limit) || 5;

    const skip =
      (page - 1) * limit;

    // Filters
    let filter = {
      $or: [
        { isArchived: false },
        { isArchived: { $exists: false } },
      ],
    };

    // Agent → only assigned cases
    if (
      req.user.role !== "admin"
    ) {
      filter.assignedTo =
        req.user._id;
    }

    // Status filter
    if (req.query.status) {
      filter.check_status =
        req.query.status;
    }

    // Pending filter
    if (req.query.pending) {

      filter.check_status = {
        $nin: [
          "DONE",
          "REJECTED",
          "STOPPED"
        ]
      };

    }

    // Search filter
    if (req.query.search) {

      filter.$or = [

        {
          comp_ref_no: {
            $regex:
              req.query.search,
            $options: "i",
          }
        },

        {
          candidate_name: {
            $regex:
              req.query.search,
            $options: "i",
          }
        }

      ];
    }
    // Overdue filter
if (req.query.overdue === "true") {

  const baseCases =
    await Case.find(filter);

  const overdueIds =
    baseCases
      .filter((c) => {

        if (!c.tat)
          return false;

        const status =
          (c.check_status || "")
            .toUpperCase();

        // ignore closed cases only
        if (
          [
            "DONE",
            "REJECTED",
            "STOPPED"
          ].includes(status)
        ) {
          return false;
        }

        const tatEnd =
          new Date(
            c.createdAt
          ).getTime() +
          (
            parseInt(c.tat) *
            24 *
            60 *
            60 *
            1000
          );

        return (
          Date.now() >
          tatEnd
        );

      })
      .map(c => c._id);

  filter._id = {
    $in: overdueIds
  };
}

    // Sorting
    let sortBy =
      "-createdAt";

    if (req.query.sort) {
      sortBy =
        req.query.sort;
    }

    // Total count
    const total =
      await Case.countDocuments(
        filter
      );

    // Fetch data
    const cases =
      await Case.find(filter)
        .populate(
          "user",
          "email role"
        )
        .populate(
          "assignedTo",
          "email role"
        )
        
        .sort(sortBy)
        .skip(skip)
        .limit(limit);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages:
        Math.ceil(
          total / limit
        ),
      sort: sortBy,
      data: cases,
    });

  } catch (error) {
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
    console.log("ASSIGN CASE HIT");
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
     
    // Audit log 
    await createAuditLog({
      userId: req.user.id,
      action: "CASE_ASSIGNED",
      caseId: updatedCase._id,
      details: `Assigned to ${assignedTo}`,
      module: "CASE",
    });

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
// DASHBOARD STATS
exports.getDashboardStats = async (req, res, next) => {
  try {

    let filter = {};

    // Agent → only assigned cases
    if (req.user.role !== "admin") {
      filter.assignedTo = req.user._id;
    }

    // Fetch all visible cases
    const allCases =
      await Case.find(filter);

    // OVERDUE CALCULATION
    const overdueCases =
      allCases.filter((c) => {

        // must have TAT
        if (!c.tat)
          return false;

        const status =
          (c.check_status || "")
            .toUpperCase();

        // ignore final/closed cases
        if (
          [
            "DONE",
            "REJECTED",
            "STOPPED",
            "INSUFFICIENT"
          ].includes(status)
        ) {
          return false;
        }

        const deadline =
          new Date(c.createdAt);

        deadline.setDate(
          deadline.getDate() +
          Number(c.tat)
        );

        return (
          deadline <
          new Date()
        );

      }).length;

    const totalCases =
      await Case.countDocuments(filter);

    // Bell icon / NEW cases
    const newCases =
      await Case.countDocuments({
        ...filter,
        check_status: "NEW"
      });

    // Active / unfinished cases
    const pendingCases =
      await Case.countDocuments({
        ...filter,
        check_status: {
          $nin: [
            "DONE",
            "REJECTED",
            "STOPPED",
            "INSUFFICIENT"
          ]
        }
      });

    const inProgressCases =
      await Case.countDocuments({
        ...filter,
        check_status: "IN_PROGRESS"
      });

    const qCheckCases =
      await Case.countDocuments({
        ...filter,
        check_status: "Q_CHECK"
      });

    const doneCases =
      await Case.countDocuments({
        ...filter,
        check_status: "DONE"
      });

    const insufficientCases =
      await Case.countDocuments({
        ...filter,
        check_status: "INSUFFICIENT"
      });

    const onHoldCases =
      await Case.countDocuments({
        ...filter,
        check_status: "ON_HOLD"
      });

    const stoppedCases =
      await Case.countDocuments({
        ...filter,
        check_status: "STOPPED"
      });

    const rejectedCases =
      await Case.countDocuments({
        ...filter,
        check_status: "REJECTED"
      });

    res.status(200).json({
      success: true,
      data: {
        totalCases,
        pendingCases,
        overdueCases,
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

  } catch (error) {
    next(error);
  }
};

//GetSingleCase

exports.getSingleCase = async (req, res, next) => {

  try {

    console.log(req.params.id);

    const singleCase =
  await Case.findById(
    req.params.id
  )
    .populate(
      "assignedTo",
      "email role"
    )
    .populate(
      "user",
      "email role"
    )
    .populate(
      "verified_by",
      "email role"
    );

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

// UPDATE CASE STATUS
exports.updateCaseStatus = async (
  req,
  res,
  next
) => {
  try {

    console.log("STATUS UPDATE HIT");

    const { check_status } =
      req.body;

    const updatedCase =
      await Case.findByIdAndUpdate(
        req.params.id,
        { check_status },
        { new: true }
      );

    if (!updatedCase) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    await sendWebhook(updatedCase);

    await createAuditLog({
      userId: req.user.id,
      action: "STATUS_UPDATED",
      caseId: updatedCase._id,
      details:
        `Status changed to ${check_status}`,
      module: "CASE",
    });

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

    console.log(
      "INSUFFICIENT HIT"
    );

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

    await sendWebhook(caseData);

    await createAuditLog({
      userId: req.user.id,
      action:
        "INSUFFICIENT_RAISED",
      caseId: caseData._id,
      details:
        `Insufficient query raised: ${req.body.query}`,
      module: "CASE",
    });

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



exports.saveVerification =
async (req, res, next) => {

  try {

    const {
      verification_result,
      verification_remark,
      proof_document,
    } = req.body;

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

    caseData.verification_result =
      verification_result;

    caseData.verification_remark =
      verification_remark;

    caseData.proof_document =
      proof_document || "";

    caseData.verified_by =
      req.user._id;

    caseData.verified_date =
      new Date();

    // Auto move to Q_CHECK
    caseData.check_status =
      "Q_CHECK";

    await caseData.save();

    await sendWebhook(caseData);

    await createAuditLog({
      userId: req.user.id,
      action: "VERIFICATION_SAVED",
      caseId: caseData._id,
      details:
        `Verification result: ${verification_result}`,
      module: "CASE",
    });

    res.status(200).json({
      success: true,
      message:
        "Verification saved successfully",
      data: caseData,
    });

  } catch (error) {
    next(error);
  }
};

exports.uploadProofDocument =
  async (req, res, next) => {

    try {

      const caseItem =
        await Case.findById(
          req.params.id
        );

      if (!caseItem) {
        return res.status(404).json({
          success: false,
          message: "Case not found",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      caseItem.proof_document =
        `/uploads/proofs/${req.file.filename}`;

      await caseItem.save();

      res.status(200).json({
        success: true,
        message:
          "Proof uploaded successfully",
        proof_document:
          caseItem.proof_document,
      });

    } catch (error) {
      next(error);
    }
  };


  // To Archive cases

  // ARCHIVE CASE
exports.archiveCase = async (req, res) => {
  try {

    const caseData =
      await Case.findById(req.params.id);

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    caseData.isArchived = true;
    caseData.archivedAt = new Date();
    caseData.archivedBy =
      req.user?.email || "Admin";

    await caseData.save();

    await createAuditLog({
      userId: req.user.id,
      action: "CASE_ARCHIVED",
      caseId: caseData._id,
      details: "Case archived",
      module: "CASE",
    });

    res.status(200).json({
      success: true,
      message: "Case archived successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

  exports.getArchivedCases = async (req, res) => {
  try {

    const cases = await Case.find({
      isArchived: true,
    })
      .populate(
        "assignedTo",
        "email"
      )
      .sort({
        archivedAt: -1,
      });

    res.status(200).json({
      success: true,
      data: cases,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// restore archive cases
exports.restoreCase = async (req, res) => {
  try {

    const updatedCase =
      await Case.findByIdAndUpdate(
        req.params.id,
        {
          isArchived: false,
          archivedAt: null,
          archivedBy: null,
        },
        {
          new: true,
        }
      );

    if (!updatedCase) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Case restored successfully",
      data: updatedCase,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// Multiple select 
exports.bulkDeleteCases = async (
  req,
  res
) => {
  try {

    const { ids } = req.body;

    await Case.deleteMany({
      _id: { $in: ids },
      isArchived: true,
    });

    res.status(200).json({
      success: true,
      message:
        "Cases deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};