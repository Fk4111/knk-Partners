// Whenever client API / callback / inbox request will hit ... it will automatically save Logs in MongoDB

const ApiLog =
  require("../models/ApiLog");

const createApiLog =
  async ({
    appId = "",
    endpoint = "",
    method = "POST",
    status = "SUCCESS",
    source = "Client API",
    requestBody = {},
    responseBody = {},
  }) => {

    try {

      console.log(
        "API LOGGER HIT"
      );

      const log =
        await ApiLog.create({
          appId,
          endpoint,
          method,
          status,
          source,
          requestBody,
          responseBody,
        });

      console.log(
        "API LOG SAVED:",
        log._id
      );

      return log;

    }
    catch (error) {

      console.log(
        "API LOG ERROR:",
        error.message
      );

    }
  };

module.exports =
  createApiLog;