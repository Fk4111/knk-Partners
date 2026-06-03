const Case = require("../models/Case");

// GET REPORT SUMMARY
const getReportSummary = async (
  req,
  res
) => {
  try {

    const totalCases =
      await Case.countDocuments();

    const newCases =
      await Case.countDocuments({
        check_status: "NEW",
      });

    const inProgress =
      await Case.countDocuments({
        check_status: "IN_PROGRESS",
      });

    const doneCases =
      await Case.countDocuments({
        check_status: "DONE",
      });

    const insufficientCases =
      await Case.countDocuments({
        check_status: "INSUFFICIENT",
      });

    const overdueCases =
      await Case.countDocuments({
        check_status: "OVERDUE",
      });

    res.status(200).json({
      success: true,
      data: {
        totalCases,
        newCases,
        inProgressCases: inProgress,
        doneCases,
        insufficientCases,
        overdueCases,
      },
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = {
  getReportSummary,
};