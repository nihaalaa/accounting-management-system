const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
    },
customerType: {
  type: String,
  enum: [
    "Regular Customer",
    "Wholesale Customer",
    "Business Customer",
    "VIP Customer",
    "Credit Customer",
  ],
  default: "Regular Customer",
},
    address: {
      type: String,
    },

    // outstandingBalance: {
    //   type: Number,
    //   default: 0,
    // },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", customerSchema);