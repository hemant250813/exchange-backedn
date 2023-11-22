const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      maxLength: 100,
    },
    password: {
      type: String,
      required: true,
      maxLength: 100,
    },
    passwordText: {
      type: String,
      required: true,
      maxLength: 100,
    },
    mobile_no: {
      type: String,
      maxLength: 15,
    },
    otp: {
      type: String,
      maxLength: 10,
    },
    otp_expiry: {
      type: Date,
    },
    verified: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      default: "0",
      enum: ["0", "1", "2"], //0-inactive, 1- active, 2- deleted
    },
    createDate: "date",
    updatedDate: "date",
  },
  { timestamps: { createDate: "created_at", updatedDate: "updated_at" } }
);

const User = mongoose.model("User", taskSchema);
module.exports = { User };
