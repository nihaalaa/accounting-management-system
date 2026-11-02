
const mongoose = require("mongoose");

// Individual returned product
const salesReturnItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  productName: {
    type: String,
    required: true,
  },

  quantitySold: {
    type: Number,
    required: true,
    min: 1,
  },

  previouslyReturned: {
    type: Number,
    default: 0,
    min: 0,
  },

  returnQuantity: {
    type: Number,
    required: true,
    min: 1,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  tax: {
    type: Number,
    default: 0,
    min: 0,
  },

  total: {
    type: Number,
    required: true,
    min: 0,
  },

  discountAmount: {
  type: Number,
  default: 0,
  min: 0,
},
refundAmount: {
  type: Number,
  required: true,
  min: 0,
},

  condition: {
    type: String,
    enum: ["Good", "Damaged", "Defective"],
    required: true,
  },

  reason: {
    type: String,
    enum: [
      "Damaged Product",
      "Defective Product",
      "Wrong Product",
      "Customer Changed Mind",
      "Expired Product",
      "Other",
    ],
    required: true,
  },
});

// Main Sales Return Schema
const salesReturnSchema = new mongoose.Schema(
  {
    returnNumber: {
      type: String,
      required: true,
      unique: true,
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    customerName: {
      type: String,
      required: true,
      default: "Walk-in Customer",
    },

    returnDate: {
      type: Date,
      default: Date.now,
    },

    items: {
      type: [salesReturnItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "At least one returned product is required",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    totalTax: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalRefund: {
      type: Number,
      required: true,
      min: 0,
    },

    appliedToBalance: {
  type: Number,
  default: 0,
  min: 0,
},
cashRefund: {
  type: Number,
  default: 0,
  min: 0,
},
creditRefund: {
  type: Number,
  default: 0,
  min: 0,
},

    refundMethod: {
      type: String,
      enum: ["Cash", "Customer Credit"],
      required: true,
    },

    notes: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Completed", "Cancelled"],
      default: "Completed",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SalesReturn", salesReturnSchema);
