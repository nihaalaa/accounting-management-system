
const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
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
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    purchaseNumber: {
      type: String,
      required: true,
      unique: true,
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
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    items: {
      type: [purchaseItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "A purchase must contain at least one product.",
      },
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Partially Paid", "Unpaid"],
      default: "Unpaid",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
supplierInvoiceNumber: {
  type: String,
  default: "",
  trim: true,
},
supplierInvoiceFile: {
  url: {
    type: String,
    default: "",
  },
  publicId: {
    type: String,
    default: "",
  },
  originalName: {
    type: String,
    default: "",
  },
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
