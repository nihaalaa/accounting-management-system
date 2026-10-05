// const mongoose = require("mongoose");

// const saleItemSchema = new mongoose.Schema(
//   {
//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product",
//       required: true,
//     },

//     productName: {
//       type: String,
//       required: true,
//     },

//     productCode: {
//       type: String,
//       default: "",
//     },

//     quantity: {
//       type: Number,
//       required: true,
//       min: 1,
//     },

//     unit: {
//       type: String,
//       default: "",
//     },

//     sellingPrice: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     tax: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     discount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     total: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//   },
//   { _id: true }
// );

// const saleSchema = new mongoose.Schema(
//   {
//     invoiceNumber: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//     },

//     saleDate: {
//       type: Date,
//       default: Date.now,
//     },

//     customer: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Customer",
//       default: null,
//     },

//     customerName: {
//       type: String,
//       default: "Walk-in Customer",
//       trim: true,
//     },

//     items: {
//       type: [saleItemSchema],
//       required: true,
//       validate: {
//         validator: function (items) {
//           return items.length > 0;
//         },
//         message: "At least one product is required",
//       },
//     },

//     subtotal: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     totalTax: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     totalDiscount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     grandTotal: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     paymentMethod: {
//       type: String,
//       enum: ["Cash", "Card", "UPI", "Credit", "Other"],
//       default: "Cash",
//     },

//     amountPaid: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     balance: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     paymentStatus: {
//       type: String,
//       enum: ["Paid", "Partially Paid", "Unpaid"],
//       default: "Unpaid",
//     },

//     notes: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Sale", saleSchema);