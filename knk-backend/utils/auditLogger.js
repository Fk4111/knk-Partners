const AuditLog = require("../models/AuditLog");

const createAuditLog = async ({
  userId,
  action,
  caseId,
  details,
  module,
}) => {

  console.log("AUDIT LOGGER HIT");

  try {

    const log =
      await AuditLog.create({
        userId,
        action,
        caseId,
        details,
        module,
      });

    console.log(
      "AUDIT SAVED:",
      log
    );

  }
  catch (err) {

    console.log(
      "AUDIT ERROR:",
      err.message
    );

  }

};

module.exports =
  createAuditLog;