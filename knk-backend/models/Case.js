const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    comp_ref_no: {
      type: String,
      required: [true, "Complaint reference number is required"],
      unique: true,
      trim: true,
      match: [/^REF-\d+$/, "Invalid format. Use REF-001"]
    },

    candidate_name: String,
    father_name: String,
    candidate_dob: Date,
    street_address: String,
    city: String,
    state: String,
    pincode: String,
    vendor: String,
    tat: String,
    attachment: String,
    remark: String,
    callback_url: String,

    check_status: {
      type: String,
      enum: [
        "NEW",
        "IN_PROGRESS",
        "Q_CHECK",
        "DONE",
        "INSUFFICIENT",
        "ON_HOLD",
        "STOPPED",
        "REJECTED"
      ],
      default: "NEW"
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Case || mongoose.model("Case", caseSchema);