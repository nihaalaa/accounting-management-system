
const mongoose = require("mongoose");

const purchaseReturnItemSchema = new mongoose.Schema(
  {
    purchaseItemId: {
      type: String,
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    productCode: {
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number.",
      },
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    reason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: true }
);

const purchaseReturnSchema = new mongoose.Schema(
  {
    returnNumber: {
      type: String,
      required: true,
      unique: true,
    },

    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
    },

    purchaseNumber: {
      type: String,
      required: true,
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    supplierName: {
      type: String,
      required: true,
    },

    returnDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    items: {
      type: [purchaseReturnItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "A purchase return must contain products.",
      },
    },

    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    refundMethod: {
      type: String,
      enum: [
        "Cash",
        "Bank Transfer",
        "UPI",
        "Card",
        "Cheque",
        "Credit Note",
      ],
      default: "Credit Note",
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PurchaseReturn",
  purchaseReturnSchema
);
