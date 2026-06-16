const axios = require("axios");
const Client = require("../models/Client");

const sendWebhook = async (caseData) => {
  try {

    if (!caseData.vendor) {
      return;
    }

    const client =
      await Client.findOne({
        vendorName: caseData.vendor,
        isActive: true,
      });

    if (
      !client ||
      !client.callbackUrl
    ) {
      return;
    }

    await axios.post(
      client.callbackUrl,
      {
        applicationId:
          caseData.comp_ref_no,

        candidateName:
          caseData.candidate_name,

        vendor:
          caseData.vendor,

        status:
          caseData.check_status,

        remark:
          caseData.verification_remark ||
          caseData.remark ||
          "",

        updatedAt:
          caseData.updatedAt,
      }
    );

    console.log(
      "Webhook sent successfully"
    );

  } catch (error) {

    console.error(
      "Webhook Error:",
      error.message
    );

  }
};

module.exports = sendWebhook;