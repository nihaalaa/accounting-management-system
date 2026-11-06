const express = require("express");
const cors = require("cors");
const mongoose=require("mongoose");

const cloudinary = require("cloudinary").v2;
const multer = require("multer");

const path = require("path");
const hsnData = require("./data/hsn-directory.json");
const gstRateData = require("./data/gst-rate-directory.json");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
const Category = require("./models/Category");
const Product = require("./models/Product");
const Expense = require("./models/Expense");
const Customer = require("./models/Customer")
const Invoice = require("./models/Invoice");
const Quotation = require("./models/Quotation");
const Counter = require("./models/Counter");
const Supplier = require("./models/Supplier");
const Purchase = require("./models/Purchase");
const SalesReturn = require("./models/SalesReturn");
const PurchaseReturn = require("./models/PurchaseReturn");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.log(err));
app.get("/", (req, res) => {
    res.send("Accounting System Backend is running");
});

app.post("/categories", async (req, res) => {
    try {
        const { name, image } = req.body;

        const category = new Category({
            name,
            image
        });

        await category.save();

        res.status(201).send("Category added successfully");
    } catch (error) {    console.log("Category error:", error);

        res.status(500).send("Error adding category");
    }
})
app.get("/categories", async (req, res) => {
    try {
        const categories = await Category.find();
        res.send(categories);
    } catch (error) {
        res.status(500).send("Error fetching categories");
    }
});
app.get("/categories/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).send("Category not found");
    }

    res.send(category);

  } catch (err) {
    res.status(500).send(err);
  }
});
app.delete("/categories/:id", async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);

        res.send("Category deleted successfully");
    } catch (error) {
        res.status(500).send("Error deleting category");
    }
});
app.put("/categories/:id",async(req,res)=>{
    try {
        const updateCategory=await Category.findByIdAndUpdate(req.params.id,req.body,
            {new:true})
            res.send(updateCategory)
    }
    catch(err){
        res.status(500).send(err)
    }
})
// PRODUTCS
app.post("/products", async (req, res) => {
  try {
    const {
      name,
      category,
      purchasePrice,
      sellingPrice,
      tax,
      unit,
      openingStock,
      minimumStock,
      expiryDate,
      description,
      image,
    } = req.body;
console.log("Received expiry date:", expiryDate);
console.log("Full request body:", req.body);
    // Get the next permanent product number
    const counter = await Counter.findOneAndUpdate(
      { name: "product" },
      { $inc: { value: 1 } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // Generate automatic product code
    const code = `PR-${String(counter.value).padStart(2, "0")}`;

    const product = new Product({
      name,
      code,
      category,
      purchasePrice,
      sellingPrice,
      tax,
      unit,
      openingStock,
        currentStock: openingStock,
      minimumStock,
      expiryDate,
      description,
      image,
    });

    await product.save();
    console.log("Product expiry before save:", product.expiryDate);

    res.status(201).send("Product added successfully");

  } catch (error) {
    console.log("product error:", error);
    res.status(500).send(error.message);
  }
});
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();

    res.send(products);

  } catch (error) {
    console.log("Fetch products error:", error);
    res.status(500).send(error.message);
  }
});
app.get("/products/next-code", async (req, res) => {
  try {
    const counter = await Counter.findOne({
      name: "product",
    });

    const nextNumber = counter ? counter.value + 1 : 1;

    const nextCode = `PR-${String(nextNumber).padStart(2, "0")}`;

    res.send({
      code: nextCode,
    });

  } catch (error) {
    console.log("Next product code error:", error);
    res.status(500).send(error.message);
  }
});
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.send(product);

  } catch (error) {
    console.log("Get product error:", error);
    res.status(500).send(error.message);
  }
});

// SEARCH HSN CODES
app.get("/hsn", (req, res) => {
  try {
    const search = (req.query.search || "").trim().toLowerCase();

    if (!search) {
      return res.json([]);
    }

    const results = hsnData
      .filter(
        (item) =>
          item.code.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search)
      )
      .slice(0, 20);

    res.json(results);
  } catch (error) {
    console.error("HSN search error:", error);
    res.status(500).json({ message: "Failed to search HSN codes." });
  }
});


/* SEARCH GST RATE CANDIDATES */
app.get("/gst-rates", (req, res) => {
  try {
    const search = (req.query.search || "").trim();

    if (!search) {
      return res.json([]);
    }

    const results = gstRateData
      .filter(
        (item) =>
          item.type?.toLowerCase() === "hsn" &&
          item.code?.toString() === search
      )
      .map((item) => ({
        code: item.code,
        description: item.description,
        gstPercent: item.gstPercent,
        condition: item.condition,
        notificationNo: item.notificationNo,
        asOf: item.asOf,
      }));

    res.json(results);
  } catch (error) {
    console.error("GST rate search error:", error);

    res.status(500).json({
      message: "Failed to search GST rates.",
    });
  }
});

app.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.send("Product deleted successfully");

  } catch (error) {
    console.log("Delete product error:", error);
    res.status(500).send(error.message);
  }
});
app.put("/products/:id", async (req, res) => {
  try {
    const {
      name,
      category,
      purchasePrice,
      sellingPrice,
      tax,
      unit,
      openingStock,
      minimumStock,
       expiryDate,
      description,
      image,
    } = req.body;

    const updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category,
        purchasePrice,
        sellingPrice,
        tax,
        unit,
        openingStock,
        minimumStock,
              expiryDate,
        description,
        image,
      },
      { new: true ,  runValidators: true}
    );

    if (!updateProduct) {
      return res.status(404).send("Product not found");
    }

    res.send(updateProduct);

  } catch (error) {
    console.log("Update product error:", error);
    res.status(500).send(error.message);
  }
});
app.patch("/products/:id/adjust-stock", async (req, res) => {
  try {
    const { type, quantity, notes } = req.body;

    if (!["increase", "decrease"].includes(type)) {
      return res.status(400).send("Invalid stock adjustment type");
    }

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).send("Quantity must be greater than 0");
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    const adjustmentQuantity = Number(quantity);
    const previousStock = Number(product.currentStock || 0);

    let newStock;

    if (type === "increase") {
      newStock = previousStock + adjustmentQuantity;
    } else {
      newStock = previousStock - adjustmentQuantity;
    }

    if (newStock < 0) {
      return res.status(400).send(
        `Cannot decrease stock by ${adjustmentQuantity}. Current stock is ${previousStock}.`
      );
    }

    product.currentStock = newStock;

    await product.save();

    res.send({
      message: "Stock adjusted successfully",
      product,
      adjustment: {
        type,
        quantity: adjustmentQuantity,
        previousStock,
        newStock,
        notes: notes || "",
      },
    });
  } catch (error) {
    console.log("Stock adjustment error:", error);
    res.status(500).send(error.message);
  }
});
 
// ================= EXPENSES =================

// ADD EXPENSE
app.post("/expenses", async (req, res) => {
  try {
    const expense = new Expense(req.body);

    const savedExpense = await expense.save();

    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({
      message: "Failed to add expense",
      error: error.message,
    });
  }
});


// GET ALL EXPENSES
app.get("/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch expenses",
      error: error.message,
    });
  }
});


// DELETE EXPENSE
app.delete("/expenses/:id", async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(
      req.params.id
    );

    if (!deletedExpense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete expense",
      error: error.message,
    });
  }
});
// UPDATE EXPENSE
app.put("/expenses/:id", async (req, res) => {
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update expense",
      error: error.message,
    });
  }
});
// GET SINGLE EXPENSE
app.get("/expenses/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch expense",
      error: error.message,
    });
  }
});

// ================= CUSTOMERS =================

// ADD CUSTOMER
app.post("/customers", async (req, res) => {
  try {
    const customer = new Customer(req.body);

    const savedCustomer = await customer.save();

    res.status(201).json(savedCustomer);
  } catch (error) {
    res.status(500).json({
      message: "Failed to add customer",
      error: error.message,
    });
  }
});

// GET ALL CUSTOMERS
app.get("/customers", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: 1 });

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
});

// GET SINGLE CUSTOMER
app.get("/customers/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// UPDATE CUSTOMER
app.put("/customers/:id", async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// DELETE CUSTOMER
app.delete("/customers/:id", async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(
      req.params.id
    );

    if (!deletedCustomer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete customer",
      error: error.message,
    });
  }
});

// ================= INVOICES =================

function cleanInvoiceData(data) {
  const cleaned = { ...data };

  if (cleaned.customerId === "") {
    cleaned.customerId = null;
  }

  if (cleaned.dueDate === "") {
    cleaned.dueDate = null;
  }

  return cleaned;
}


app.post("/quotations", async (req, res) => {
  try {
    const {
      date,
      validUntil,
      customerId,
      customerName,
      customerPhone,
      customerAddress,
      items,
      subtotal,
      taxAmount,
      discount,
      grandTotal,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Quotation must contain at least one product",
      });
    }

    // Validate product quantities and product existence
    for (const item of items) {
      if (
        !item.productId ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1
      ) {
        return res.status(400).json({
          message: "Invalid product or quantity",
        });
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }
    }

    // Generate quotation number
    const counter = await Counter.findOneAndUpdate(
      { name: "quotation" },
      { $inc: { value: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const quotationNumber = `QT-${String(counter.value).padStart(3, "0")}`;

    const quotation = new Quotation({
      quotationNumber,
      date: date || Date.now(),
      validUntil: validUntil || null,
      customerId: customerId || null,
      customerName: customerName || "Walk-in Customer",
      customerPhone: customerPhone || "",
      customerAddress: customerAddress || "",
      items,
      subtotal: Number(subtotal) || 0,
      taxAmount: Number(taxAmount) || 0,
      discount: Number(discount) || 0,
      grandTotal: Number(grandTotal) || 0,
      notes: notes || "",
      status: "Draft",
    });

    const savedQuotation = await quotation.save();

    res.status(201).json({
      message: "Quotation created successfully",
      quotation: savedQuotation,
    });
  } catch (error) {
    console.error("Create quotation error:", error);

    res.status(500).json({
      message: "Failed to create quotation",
      error: error.message,
    });
  }
});
app.get("/quotations", async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .sort({ createdAt: -1 });

    res.status(200).json(quotations);
  } catch (error) {
    console.error("Get quotations error:", error);

    res.status(500).json({
      message: "Failed to fetch quotations",
      error: error.message,
    });
  }
});
app.get("/quotations/next-number", async (req, res) => {
  try {
    const counter = await Counter.findOne({
      name: "quotation",
    });

    const nextValue = (counter?.value || 0) + 1;

    const quotationNumber = `QT-${String(nextValue).padStart(3, "0")}`;

    res.status(200).json({
      quotationNumber,
    });
  } catch (error) {
    console.error("Get next quotation number error:", error);

    res.status(500).json({
      message: "Failed to generate quotation number",
    });
  }
});
app.get("/quotations/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        message: "Quotation not found",
      });
    }

    res.status(200).json(quotation);
  } catch (error) {
    console.error("Get quotation error:", error);

    res.status(500).json({
      message: "Failed to fetch quotation",
      error: error.message,
    });
  }
});

app.put("/quotations/:id", async (req, res) => {
  try {
    const {
      date,
      validUntil,
      customerId,
      customerName,
      customerPhone,
      customerAddress,
      items,
      subtotal,
      taxAmount,
      discount,
      grandTotal,
      status,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Quotation must contain at least one product",
      });
    }

    // Validate products and quantities
    for (const item of items) {
      if (
        !item.productId ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1
      ) {
        return res.status(400).json({
          message: "Invalid product or quantity",
        });
      }

      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }
    }

    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        message: "Quotation not found",
      });
    }

    if (quotation.status === "Converted") {
      return res.status(400).json({
        message: "Converted quotations cannot be edited",
      });
    }

    quotation.date = date || quotation.date;
    quotation.validUntil = validUntil || null;
    quotation.customerId = customerId || null;
    quotation.customerName = customerName || "Walk-in Customer";
    quotation.customerPhone = customerPhone || "";
    quotation.customerAddress = customerAddress || "";
    quotation.items = items;
    quotation.subtotal = Number(subtotal) || 0;
    quotation.taxAmount = Number(taxAmount) || 0;
    quotation.discount = Number(discount) || 0;
    quotation.grandTotal = Number(grandTotal) || 0;
    quotation.status = status || quotation.status;
    quotation.notes = notes || "";

    const updatedQuotation = await quotation.save();

    res.status(200).json({
      message: "Quotation updated successfully",
      quotation: updatedQuotation,
    });
  } catch (error) {
    console.error("Update quotation error:", error);

    res.status(500).json({
      message: "Failed to update quotation",
      error: error.message,
    });
  }
});
app.delete("/quotations/:id", async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        message: "Quotation not found",
      });
    }

    if (quotation.status === "Converted") {
      return res.status(400).json({
        message: "Converted quotations cannot be deleted",
      });
    }

    await Quotation.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Quotation deleted successfully",
    });
  } catch (error) {
    console.error("Delete quotation error:", error);

    res.status(500).json({
      message: "Failed to delete quotation",
      error: error.message,
    });
  }
});

// ADD INVOICE

app.post("/invoices", async (req, res) => {
  const deductedStock = [];

  try {
    const invoiceData = cleanInvoiceData(req.body);
console.log("POST /invoices route called");
console.log("Invoice items:", JSON.stringify(invoiceData.items, null, 2));
    if (!invoiceData.items || invoiceData.items.length === 0) {
      return res.status(400).json({
        message: "Invoice must contain at least one product",
      });
    }

    // Combine quantities if the same product appears more than once
    const productQuantities = new Map();

    for (const item of invoiceData.items) {
      const productId = String(item.productId);
      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Product quantity must be a positive integer");
      }

      productQuantities.set(
        productId,
        (productQuantities.get(productId) || 0) + quantity
      );
    }

    // Reduce stock only when enough stock is available
    for (const [productId, quantity] of productQuantities) {
      const product = await Product.findOneAndUpdate(
        {
          _id: productId,
          currentStock: { $gte: quantity },
        },
        {
          $inc: { currentStock: -quantity },
        },
        { new: true }
      );

if (!product) {
  const existingProduct = await Product.findById(productId);

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  throw new Error(
    `${existingProduct.name} has insufficient stock. Available stock: ${existingProduct.currentStock}`
  );
}

      // Remember each deduction in case invoice saving fails
      deductedStock.push({ productId, quantity });
    }

    // Save invoice after stock deductions succeed
    const invoice = new Invoice(invoiceData);
    const savedInvoice = await invoice.save();

    return res.status(201).json({
      message: "Invoice saved and stock updated successfully",
      invoice: savedInvoice,
    });
  } catch (error) {
    console.error("Save invoice error:", error);

    // Restore deducted stock if any step fails
    for (const item of deductedStock) {
      try {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { currentStock: item.quantity } }
        );
      } catch (rollbackError) {
        console.error("Stock rollback error:", rollbackError);
      }
    }

    return res.status(400).json({
      message: "Failed to save invoice",
      error: error.message,
    });
  }
});

app.post("/quotations/:id/convert", async (req, res) => {
  const deductedStock = [];

  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        message: "Quotation not found",
      });
    }

    if (quotation.status === "Converted" || quotation.convertedInvoiceId) {
      return res.status(400).json({
        message: "This quotation has already been converted",
      });
    }

    if (!quotation.items || quotation.items.length === 0) {
      return res.status(400).json({
        message: "Quotation has no products",
      });
    }

    // Generate invoice number using the existing frontend format
    const invoiceCount = await Invoice.countDocuments();

    const invoiceNumber =
      `INV-${String(invoiceCount + 1).padStart(4, "0")}`;

    // Prepare invoice data from quotation
    const invoiceData = {
      invoiceNumber,
      date: new Date(),
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      customerPhone: quotation.customerPhone,
      customerAddress: quotation.customerAddress,
      items: quotation.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        tax: item.tax,
        total: item.total,
      })),
      subtotal: quotation.subtotal,
      taxAmount: quotation.taxAmount,
      discount: quotation.discount,
      grandTotal: quotation.grandTotal,

      // New invoices converted from quotations start unpaid
      paymentMethod: "Cash",
      paymentStatus: "Unpaid",
      amountReceived: 0,
      balanceDue: quotation.grandTotal,
      dueDate: null,

      notes: quotation.notes,
    };

    // Combine quantities for duplicate products
    const productQuantities = new Map();

    for (const item of invoiceData.items) {
      const productId = String(item.productId);
      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Product quantity must be a positive integer");
      }

      productQuantities.set(
        productId,
        (productQuantities.get(productId) || 0) + quantity
      );
    }

    // Deduct stock
    for (const [productId, quantity] of productQuantities) {
      const product = await Product.findOneAndUpdate(
        {
          _id: productId,
          currentStock: { $gte: quantity },
        },
        {
          $inc: { currentStock: -quantity },
        },
        { new: true }
      );

      if (!product) {
        const existingProduct = await Product.findById(productId);

        if (!existingProduct) {
          throw new Error("Product not found");
        }

        throw new Error(
          `${existingProduct.name} has insufficient stock. Available stock: ${existingProduct.currentStock}`
        );
      }

      deductedStock.push({ productId, quantity });
    }

    // Save invoice
    const invoice = new Invoice(invoiceData);
    const savedInvoice = await invoice.save();

    // Mark quotation as converted
    quotation.status = "Converted";
    quotation.convertedInvoiceId = savedInvoice._id;

    await quotation.save();

    return res.status(201).json({
      message: "Quotation converted into invoice successfully",
      invoice: savedInvoice,
      quotation,
    });

  } catch (error) {
    console.error("Convert quotation error:", error);

    // Restore stock if conversion fails
    for (const item of deductedStock) {
      try {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { currentStock: item.quantity } }
        );
      } catch (rollbackError) {
        console.error("Stock rollback error:", rollbackError);
      }
    }

    return res.status(400).json({
      message: "Failed to convert quotation",
      error: error.message,
    });
  }
});

// GET ALL INVOICES
app.get("/invoices", async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .sort({ createdAt: 1 });

    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
});


// GET SINGLE INVOICE
app.get("/invoices/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch invoice",
      error: error.message,
    });
  }
});


// UPDATE INVOICE

app.put("/invoices/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    // Update the invoice with the submitted fields
Object.assign(invoice, cleanInvoiceData(req.body));
    const updatedInvoice = await invoice.save();

    return res.status(200).json({
      message: "Invoice updated successfully",
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error("Update invoice error:", error);

    return res.status(400).json({
      message: "Failed to update invoice",
      error: error.message,
    });
  }
});

// DELETE INVOICE
app.delete("/invoices/:id", async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(
      req.params.id
    );

    if (!deletedInvoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete invoice",
      error: error.message,
    });
  }
});

//SALES RETURN

// GET RETURNABLE ITEMS FROM AN INVOICE
app.get("/invoices/:id/returnable-items", async (req, res) => {
  try {
    // Find original invoice
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    // Find completed returns for this invoice
    const previousReturns = await SalesReturn.find({
      invoiceId: invoice._id,
      status: "Completed",
    });

    // Calculate previously returned quantity for each product
    const returnedQuantities = {};

    previousReturns.forEach((salesReturn) => {
      salesReturn.items.forEach((item) => {
        const productId = item.productId.toString();

        returnedQuantities[productId] =
          (returnedQuantities[productId] || 0) +
          item.returnQuantity;
      });
    });

    // Calculate remaining returnable quantity
    const returnableItems = invoice.items.map((item) => {
      const productId = item.productId.toString();

      const previouslyReturned =
        returnedQuantities[productId] || 0;

      const remainingQuantity =
        item.quantity - previouslyReturned;

      return {
        productId: item.productId,
        productName: item.productName,
        quantitySold: item.quantity,
        previouslyReturned,
        remainingQuantity: Math.max(0, remainingQuantity),
        price: item.price,
        tax: item.tax || 0,
      };
    });

    res.status(200).json({
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId || null,
      customerName: invoice.customerName || "Walk-in Customer",
      items: returnableItems,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch returnable items",
      error: error.message,
    });
  }
});

// GET NEXT SALES RETURN NUMBER
app.get("/sales-returns/next-number", async (req, res) => {
  try {
    const counter = await Counter.findOne({ name: "salesReturn" });

    const nextValue = (counter?.value || 0) + 1;

    const returnNumber = `SR-${String(nextValue).padStart(2, "0")}`;

    res.status(200).json({ returnNumber });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate sales return number",
      error: error.message,
    });
  }
});

// CREATE SALES RETURN
app.post("/sales-returns", async (req, res) => {
  const stockUpdates = [];
  let customerCreditUpdated = false;
  let invoiceUpdated = false;
  let savedReturn = null;
  let originalBalanceDue = 0;
  let originalPaymentStatus = "";

  try {
    const {
      invoiceId,
      items,
      refundMethod,
      notes,
    } = req.body;

    // Validate basic information
    if (!invoiceId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Invoice and returned products are required",
      });
    }

    if (!["Cash", "Customer Credit"].includes(refundMethod)) {
      return res.status(400).json({
        message: "Invalid refund method",
      });
    }

    // Find original invoice
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    if (
      refundMethod === "Customer Credit" &&
      !invoice.customerId
    ) {
      return res.status(400).json({
        message: "Customer Credit is only available for registered customers",
      });
    }

    // Get previous completed returns
    const previousReturns = await SalesReturn.find({
      invoiceId: invoice._id,
      status: "Completed",
    });

    const returnedQuantities = {};
    const previousDiscounts = {};

    previousReturns.forEach((salesReturn) => {
      salesReturn.items.forEach((item) => {
        const id = item.productId.toString();

        returnedQuantities[id] =
          (returnedQuantities[id] || 0) + item.returnQuantity;

        previousDiscounts[id] =
          (previousDiscounts[id] || 0) +
          (item.discountAmount || 0);
      });
    });

    // Calculate original invoice gross amount before discount
    const invoiceGross = invoice.items.reduce((sum, item) => {
      const base = item.quantity * item.price;
      const tax = base * ((item.tax || 0) / 100);

      return sum + base + tax;
    }, 0);

    const invoiceDiscount = Math.min(
      Number(invoice.discount || 0),
      invoiceGross
    );

    if (invoiceGross <= 0) {
      return res.status(400).json({
        message: "Invalid invoice amount",
      });
    }

    const processedItems = [];
    const submittedProducts = new Set();

    let subtotal = 0;
    let totalTax = 0;
    let totalRefund = 0;

    // Validate and calculate each returned product
    for (const returnedItem of items) {
      const productId = String(returnedItem.productId);
      const returnQuantity = Number(returnedItem.returnQuantity);

      if (submittedProducts.has(productId)) {
        throw new Error("A product can only appear once in a return");
      }

      submittedProducts.add(productId);

      if (!Number.isInteger(returnQuantity) || returnQuantity < 1) {
        throw new Error("Return quantity must be a positive integer");
      }

      if (
        !["Good", "Damaged", "Defective"].includes(
          returnedItem.condition
        )
      ) {
        throw new Error("Invalid product condition");
      }

      const invoiceItem = invoice.items.find(
        (item) => item.productId.toString() === productId
      );

      if (!invoiceItem) {
        throw new Error("Product does not belong to this invoice");
      }

      const previouslyReturned = returnedQuantities[productId] || 0;

      const remainingQuantity =
        invoiceItem.quantity - previouslyReturned;

      if (returnQuantity > remainingQuantity) {
        throw new Error(
          `Only ${Math.max(0, remainingQuantity)} units can be returned for ${invoiceItem.productName}`
        );
      }

      const baseAmount = returnQuantity * invoiceItem.price;

      const taxAmount =
        baseAmount * ((invoiceItem.tax || 0) / 100);

      const itemGross = baseAmount + taxAmount;

      // Allocate invoice discount proportionally
      const originalItemGross =
        invoiceItem.quantity *
        invoiceItem.price *
        (1 + (invoiceItem.tax || 0) / 100);

      const fullItemDiscount =
        invoiceDiscount * (originalItemGross / invoiceGross);

      const cumulativeQuantity =
        previouslyReturned + returnQuantity;

      const cumulativeDiscount =
        fullItemDiscount *
        (cumulativeQuantity / invoiceItem.quantity);

      const discountAmount = Math.max(
        0,
        cumulativeDiscount - (previousDiscounts[productId] || 0)
      );

      const refundAmount = Math.max(
        0,
        itemGross - discountAmount
      );

      processedItems.push({
        productId: invoiceItem.productId,
        productName: invoiceItem.productName,
        quantitySold: invoiceItem.quantity,
        previouslyReturned,
        returnQuantity,
        price: invoiceItem.price,
        tax: invoiceItem.tax || 0,
        total: itemGross,
        discountAmount,
        refundAmount,
        condition: returnedItem.condition,
        reason: returnedItem.reason,
      });

      subtotal += baseAmount;
      totalTax += taxAmount;
      totalRefund += refundAmount;
    }

    // Apply return value against outstanding invoice balance first
    originalBalanceDue = Number(invoice.balanceDue || 0);
    originalPaymentStatus = invoice.paymentStatus;

    const appliedToBalance = Math.min(
      originalBalanceDue,
      totalRefund
    );

    const remainingRefund = Math.max(
      0,
      totalRefund - appliedToBalance
    );

    const cashRefund =
      refundMethod === "Cash" ? remainingRefund : 0;

    const creditRefund =
      refundMethod === "Customer Credit" ? remainingRefund : 0;

    // Generate actual return number
    const counter = await Counter.findOneAndUpdate(
      { name: "salesReturn" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    const returnNumber =
      `SR-${String(counter.value).padStart(2, "0")}`;

    // Create return record
    const salesReturn = new SalesReturn({
      returnNumber,
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customerId || null,
      customerName: invoice.customerName || "Walk-in Customer",
      returnDate: new Date(),
      items: processedItems,
      subtotal,
      totalTax,
      totalRefund,
      appliedToBalance,
      cashRefund,
      creditRefund,
      refundMethod,
      notes: notes || "",
      status: "Completed",
    });

    savedReturn = await salesReturn.save();

    // Increase stock only for Good-condition products
    for (const item of processedItems) {
      if (item.condition === "Good") {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { currentStock: item.returnQuantity } }
        );

        stockUpdates.push({
          productId: item.productId,
          quantity: item.returnQuantity,
        });
      }
    }

    // Add excess refund to registered customer's credit
    if (creditRefund > 0) {
      await Customer.updateOne(
        { _id: invoice.customerId },
        { $inc: { creditBalance: creditRefund } }
      );

      customerCreditUpdated = true;
    }

    // Update invoice outstanding balance
    const newBalanceDue = Math.max(
      0,
      originalBalanceDue - appliedToBalance
    );

    let newPaymentStatus = "Unpaid";

    if (newBalanceDue === 0) {
      newPaymentStatus = "Paid";
    } else if (Number(invoice.amountReceived || 0) > 0) {
      newPaymentStatus = "Partially Paid";
    }

    await Invoice.updateOne(
      { _id: invoice._id },
      {
        $set: {
          balanceDue: newBalanceDue,
          paymentStatus: newPaymentStatus,
        },
      }
    );

    invoiceUpdated = true;

    return res.status(201).json({
      message: "Sales return created successfully",
      salesReturn: savedReturn,
    });

  } catch (error) {
    console.error("Sales return error:", error);

    // Roll back stock changes if something fails
    for (const item of stockUpdates) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { currentStock: -item.quantity } }
      );
    }

    // Roll back customer credit
    if (customerCreditUpdated && savedReturn) {
      await Customer.updateOne(
        { _id: savedReturn.customerId },
        { $inc: { creditBalance: -savedReturn.creditRefund } }
      );
    }

    // Roll back invoice balance
    if (invoiceUpdated && savedReturn) {
      await Invoice.updateOne(
        { _id: savedReturn.invoiceId },
        {
          $set: {
            balanceDue: originalBalanceDue,
            paymentStatus: originalPaymentStatus,
          },
        }
      );
    }

    // Remove incomplete return record
    if (savedReturn) {
      await SalesReturn.deleteOne({ _id: savedReturn._id });
    }

    return res.status(400).json({
      message: "Failed to create sales return",
      error: error.message,
    });
  }
});


app.patch("/sales-returns/:id", async (req, res) => {
  const stockChanges = [];
  const creditChanges = [];

  let salesReturn = null;
  let originalReturnData = null;
  let returnSaveAttempted = false;

  let invoiceUpdated = false;
  let originalBalanceDue = 0;
  let originalPaymentStatus = "";

  try {
    const { id } = req.params;
    const { items, refundMethod, notes } = req.body;

    // 1. Validate submitted information
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "At least one returned product is required",
      });
    }

    if (!["Cash", "Customer Credit"].includes(refundMethod)) {
      return res.status(400).json({
        message: "Invalid refund method",
      });
    }

    // 2. Find existing sales return
    salesReturn = await SalesReturn.findById(id);

    if (!salesReturn) {
      return res.status(404).json({
        message: "Sales return not found",
      });
    }

    if (salesReturn.status !== "Completed") {
      return res.status(400).json({
        message: "Only completed sales returns can be edited",
      });
    }

    // Keep a copy of the original return for rollback
    originalReturnData = salesReturn.toObject();

    // 3. Only allow editing the latest completed return
    const latestReturn = await SalesReturn.findOne({
      invoiceId: salesReturn.invoiceId,
      status: "Completed",
    }).sort({ createdAt: -1, _id: -1 });

    if (
      !latestReturn ||
      latestReturn._id.toString() !== salesReturn._id.toString()
    ) {
      return res.status(400).json({
        message:
          "Only the latest completed return for this invoice can be edited. Edit or cancel newer returns first.",
      });
    }

    // 4. Find original invoice
    const invoice = await Invoice.findById(salesReturn.invoiceId);

    if (!invoice) {
      throw new Error("Original invoice not found");
    }

    if (refundMethod === "Customer Credit" && !invoice.customerId) {
      return res.status(400).json({
        message:
          "Customer Credit is only available for registered customers",
      });
    }

    originalBalanceDue = Number(invoice.balanceDue || 0);
    originalPaymentStatus = invoice.paymentStatus;

    // 5. Check stock required to reverse the original return
    const oldStockToReverse = {};

    for (const item of salesReturn.items) {
      if (item.condition === "Good") {
        const productId = item.productId.toString();

        oldStockToReverse[productId] =
          (oldStockToReverse[productId] || 0) +
          Number(item.returnQuantity || 0);
      }
    }

    for (const [productId, quantity] of Object.entries(
      oldStockToReverse
    )) {
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error(
          `Product ${productId} was not found`
        );
      }

      if (Number(product.currentStock || 0) < quantity) {
        throw new Error(
          `Cannot edit this return because there is not enough current stock for ${product.name}. The returned stock may already have been sold.`
        );
      }
    }

    // 6. Check customer credit before reversing original credit
    const oldCreditRefund = Number(salesReturn.creditRefund || 0);

    if (oldCreditRefund > 0) {
      if (!salesReturn.customerId) {
        throw new Error(
          "Customer information is missing for the original credit refund"
        );
      }

      const customer = await Customer.findById(
        salesReturn.customerId
      );

      if (!customer) {
        throw new Error("Original customer not found");
      }

      if (Number(customer.creditBalance || 0) < oldCreditRefund) {
        throw new Error(
          "Cannot edit this return because the customer has already used some of the credited amount."
        );
      }
    }

    // 7. Get previous completed returns, excluding this return
    const previousReturns = await SalesReturn.find({
      invoiceId: invoice._id,
      status: "Completed",
      _id: { $ne: salesReturn._id },
    });

    const returnedQuantities = {};
    const previousDiscounts = {};

    previousReturns.forEach((previousReturn) => {
      previousReturn.items.forEach((item) => {
        const productId = item.productId.toString();

        returnedQuantities[productId] =
          (returnedQuantities[productId] || 0) +
          Number(item.returnQuantity || 0);

        previousDiscounts[productId] =
          (previousDiscounts[productId] || 0) +
          Number(item.discountAmount || 0);
      });
    });

    // 8. Calculate original invoice gross amount
    const invoiceGross = invoice.items.reduce((sum, item) => {
      const base = item.quantity * item.price;
      const tax = base * ((item.tax || 0) / 100);

      return sum + base + tax;
    }, 0);

    const invoiceDiscount = Math.min(
      Number(invoice.discount || 0),
      invoiceGross
    );

    if (invoiceGross <= 0) {
      throw new Error("Invalid invoice amount");
    }

    // 9. Validate and calculate edited return items
    const processedItems = [];
    const submittedProducts = new Set();

    let subtotal = 0;
    let totalTax = 0;
    let totalRefund = 0;

    for (const returnedItem of items) {
      const productId = String(returnedItem.productId);
      const returnQuantity = Number(returnedItem.returnQuantity);

      if (submittedProducts.has(productId)) {
        throw new Error(
          "A product can only appear once in a return"
        );
      }

      submittedProducts.add(productId);

      if (!Number.isInteger(returnQuantity) || returnQuantity < 1) {
        throw new Error(
          "Return quantity must be a positive integer"
        );
      }

      if (
        !["Good", "Damaged", "Defective"].includes(
          returnedItem.condition
        )
      ) {
        throw new Error("Invalid product condition");
      }

      const allowedReasons = [
        "Damaged Product",
        "Defective Product",
        "Wrong Product",
        "Customer Changed Mind",
        "Expired Product",
        "Other",
      ];

      if (!allowedReasons.includes(returnedItem.reason)) {
        throw new Error("Invalid return reason");
      }

      const invoiceItem = invoice.items.find(
        (item) => item.productId.toString() === productId
      );

      if (!invoiceItem) {
        throw new Error(
          "Product does not belong to this invoice"
        );
      }

      const previouslyReturned =
        returnedQuantities[productId] || 0;

      const remainingQuantity =
        Number(invoiceItem.quantity) - previouslyReturned;

      if (returnQuantity > remainingQuantity) {
        throw new Error(
          `Only ${Math.max(0, remainingQuantity)} units can be returned for ${invoiceItem.productName}`
        );
      }

      const baseAmount =
        returnQuantity * invoiceItem.price;

      const taxAmount =
        baseAmount * ((invoiceItem.tax || 0) / 100);

      const itemGross = baseAmount + taxAmount;

      // Calculate proportional invoice discount
      const originalItemGross =
        invoiceItem.quantity *
        invoiceItem.price *
        (1 + (invoiceItem.tax || 0) / 100);

      const fullItemDiscount =
        invoiceDiscount *
        (originalItemGross / invoiceGross);

      const cumulativeQuantity =
        previouslyReturned + returnQuantity;

      const cumulativeDiscount =
        fullItemDiscount *
        (cumulativeQuantity / invoiceItem.quantity);

      const discountAmount = Math.max(
        0,
        cumulativeDiscount -
          (previousDiscounts[productId] || 0)
      );

      const refundAmount = Math.max(
        0,
        itemGross - discountAmount
      );

      processedItems.push({
        productId: invoiceItem.productId,
        productName: invoiceItem.productName,
        quantitySold: invoiceItem.quantity,
        previouslyReturned,
        returnQuantity,
        price: invoiceItem.price,
        tax: invoiceItem.tax || 0,
        total: itemGross,
        discountAmount,
        refundAmount,
        condition: returnedItem.condition,
        reason: returnedItem.reason,
      });

      subtotal += baseAmount;
      totalTax += taxAmount;
      totalRefund += refundAmount;
    }

    // 10. Calculate new refund allocation
    // First restore the amount applied by the old return
    const balanceBeforeNewReturn =
      originalBalanceDue +
      Number(salesReturn.appliedToBalance || 0);

    const appliedToBalance = Math.min(
      balanceBeforeNewReturn,
      totalRefund
    );

    const remainingRefund = Math.max(
      0,
      totalRefund - appliedToBalance
    );

    const cashRefund =
      refundMethod === "Cash" ? remainingRefund : 0;

    const creditRefund =
      refundMethod === "Customer Credit" ? remainingRefund : 0;

    // 11. Reverse original stock changes
    for (const [productId, quantity] of Object.entries(
      oldStockToReverse
    )) {
      const result = await Product.updateOne(
        {
          _id: productId,
          currentStock: { $gte: quantity },
        },
        {
          $inc: {
            currentStock: -quantity,
          },
        }
      );

      if (result.modifiedCount !== 1) {
        throw new Error(
          `Could not reverse original stock for product ${productId}`
        );
      }

      stockChanges.push({
        productId,
        quantity: -quantity,
      });
    }

    // 12. Reverse original customer credit
    if (oldCreditRefund > 0) {
      const result = await Customer.updateOne(
        {
          _id: salesReturn.customerId,
          creditBalance: { $gte: oldCreditRefund },
        },
        {
          $inc: {
            creditBalance: -oldCreditRefund,
          },
        }
      );

      if (result.modifiedCount !== 1) {
        throw new Error(
          "Could not reverse original customer credit"
        );
      }

      creditChanges.push(-oldCreditRefund);
    }

    // 13. Apply stock changes for the edited return
    for (const item of processedItems) {
      if (item.condition === "Good") {
        const result = await Product.updateOne(
          { _id: item.productId },
          {
            $inc: {
              currentStock: item.returnQuantity,
            },
          }
        );

        if (result.modifiedCount !== 1) {
          throw new Error(
            `Could not update stock for ${item.productName}`
          );
        }

        stockChanges.push({
          productId: item.productId,
          quantity: item.returnQuantity,
        });
      }
    }

    // 14. Apply new customer credit
    if (creditRefund > 0) {
      const result = await Customer.updateOne(
        { _id: invoice.customerId },
        {
          $inc: {
            creditBalance: creditRefund,
          },
        }
      );

      if (result.modifiedCount !== 1) {
        throw new Error(
          "Could not update customer credit"
        );
      }

      creditChanges.push(creditRefund);
    }

    // 15. Update invoice outstanding balance
    const newBalanceDue = Math.max(
      0,
      balanceBeforeNewReturn - appliedToBalance
    );

    let newPaymentStatus = "Unpaid";

    if (newBalanceDue === 0) {
      newPaymentStatus = "Paid";
    } else if (Number(invoice.amountReceived || 0) > 0) {
      newPaymentStatus = "Partially Paid";
    }

    await Invoice.updateOne(
      { _id: invoice._id },
      {
        $set: {
          balanceDue: newBalanceDue,
          paymentStatus: newPaymentStatus,
        },
      }
    );

    invoiceUpdated = true;

    // 16. Update existing sales return
    // Return number, invoice, ID and original date remain unchanged
    salesReturn.items = processedItems;
    salesReturn.subtotal = subtotal;
    salesReturn.totalTax = totalTax;
    salesReturn.totalRefund = totalRefund;
    salesReturn.appliedToBalance = appliedToBalance;
    salesReturn.cashRefund = cashRefund;
    salesReturn.creditRefund = creditRefund;
    salesReturn.refundMethod = refundMethod;
    salesReturn.notes = notes || "";

    returnSaveAttempted = true;

    await salesReturn.save();

    return res.status(200).json({
      message: "Sales return updated successfully",
      salesReturn,
    });

  } catch (error) {
    console.error("Edit sales return error:", error);

    // 17. Roll back stock changes
    for (const item of stockChanges.reverse()) {
      try {
        await Product.updateOne(
          { _id: item.productId },
          {
            $inc: {
              currentStock: -item.quantity,
            },
          }
        );
      } catch (rollbackError) {
        console.error(
          "Stock rollback error:",
          rollbackError
        );
      }
    }

    // 18. Roll back customer credit changes
    for (const amount of creditChanges.reverse()) {
      try {
        await Customer.updateOne(
          { _id: salesReturn.customerId },
          {
            $inc: {
              creditBalance: -amount,
            },
          }
        );
      } catch (rollbackError) {
        console.error(
          "Credit rollback error:",
          rollbackError
        );
      }
    }

    // 19. Restore original invoice balance
    if (invoiceUpdated && salesReturn) {
      try {
        await Invoice.updateOne(
          { _id: salesReturn.invoiceId },
          {
            $set: {
              balanceDue: originalBalanceDue,
              paymentStatus: originalPaymentStatus,
            },
          }
        );
      } catch (rollbackError) {
        console.error(
          "Invoice rollback error:",
          rollbackError
        );
      }
    }

    // 20. Restore original sales return if save was attempted
    if (returnSaveAttempted && originalReturnData) {
      try {
        await SalesReturn.updateOne(
          { _id: salesReturn._id },
          {
            $set: {
              items: originalReturnData.items,
              subtotal: originalReturnData.subtotal,
              totalTax: originalReturnData.totalTax,
              totalRefund: originalReturnData.totalRefund,
              appliedToBalance:
                originalReturnData.appliedToBalance,
              cashRefund: originalReturnData.cashRefund,
              creditRefund: originalReturnData.creditRefund,
              refundMethod: originalReturnData.refundMethod,
              notes: originalReturnData.notes,
            },
          }
        );
      } catch (rollbackError) {
        console.error(
          "Sales return rollback error:",
          rollbackError
        );
      }
    }

    return res.status(400).json({
      message: "Failed to update sales return",
      error: error.message,
    });
  }
});


app.patch("/sales-returns/:id/cancel", async (req, res) => {
  let salesReturn = null;
  const stockReversed = [];
  let creditReversed = false;
  let invoiceReversed = false;
  let returnCancelled = false;

  let originalInvoiceBalance = 0;
  let originalPaymentStatus = "";

  try {
    const { id } = req.params;

    // 1. Find the sales return
salesReturn = await SalesReturn.findById(id);

    if (!salesReturn) {
      return res.status(404).json({
        message: "Sales return not found",
      });
    }

    // 2. Prevent cancelling an already cancelled return
    if (salesReturn.status === "Cancelled") {
      return res.status(400).json({
        message: "This sales return is already cancelled",
      });
    }

    // 3. Only allow cancelling the latest completed return
    // This protects previous return quantities and discount calculations.
    const latestReturn = await SalesReturn.findOne({
      invoiceId: salesReturn.invoiceId,
      status: "Completed",
    }).sort({ createdAt: -1, _id: -1 });

    if (
      !latestReturn ||
      latestReturn._id.toString() !== salesReturn._id.toString()
    ) {
      return res.status(400).json({
        message:
          "Only the most recent completed return for this invoice can be cancelled. Cancel newer returns first.",
      });
    }

    // 4. Find original invoice
    const invoice = await Invoice.findById(salesReturn.invoiceId);

    if (!invoice) {
      return res.status(404).json({
        message: "Original invoice not found",
      });
    }

    // 5. Calculate stock that needs to be removed
    const stockToReverse = {};

    for (const item of salesReturn.items) {
      if (item.condition === "Good") {
        const productId = item.productId.toString();

        stockToReverse[productId] =
          (stockToReverse[productId] || 0) +
          item.returnQuantity;
      }
    }

    // 6. Check that enough stock exists before reversing it
    for (const [productId, quantity] of Object.entries(stockToReverse)) {
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error(
          `Product ${productId} was not found`
        );
      }

      if (Number(product.currentStock || 0) < quantity) {
        throw new Error(
          `Cannot cancel this return because there is not enough current stock for ${product.name}. The returned stock may have already been sold.`
        );
      }
    }

    // 7. Check customer credit before reversing it
    if (Number(salesReturn.creditRefund || 0) > 0) {
      if (!salesReturn.customerId) {
        throw new Error(
          "Customer information is missing for this credit refund"
        );
      }

      const customer = await Customer.findById(
        salesReturn.customerId
      );

      if (!customer) {
        throw new Error("Customer not found");
      }

      if (
        Number(customer.creditBalance || 0) <
        Number(salesReturn.creditRefund)
      ) {
        throw new Error(
          "Cannot cancel this return because the customer has already used some of the credited amount."
        );
      }
    }

    // 8. Reverse stock changes
    for (const [productId, quantity] of Object.entries(stockToReverse)) {
      await Product.updateOne(
        { _id: productId },
        {
          $inc: {
            currentStock: -quantity,
          },
        }
      );

      stockReversed.push({
        productId,
        quantity,
      });
    }

    // 9. Reverse customer credit
    if (Number(salesReturn.creditRefund || 0) > 0) {
      await Customer.updateOne(
        { _id: salesReturn.customerId },
        {
          $inc: {
            creditBalance: -Number(salesReturn.creditRefund),
          },
        }
      );

      creditReversed = true;
    }

    // 10. Restore invoice outstanding balance
    originalInvoiceBalance = Number(invoice.balanceDue || 0);
    originalPaymentStatus = invoice.paymentStatus;

    const restoredBalance =
      originalInvoiceBalance +
      Number(salesReturn.appliedToBalance || 0);

    let newPaymentStatus = "Unpaid";

    if (restoredBalance === 0) {
      newPaymentStatus = "Paid";
    } else if (Number(invoice.amountReceived || 0) > 0) {
      newPaymentStatus = "Partially Paid";
    }

    await Invoice.updateOne(
      { _id: invoice._id },
      {
        $set: {
          balanceDue: restoredBalance,
          paymentStatus: newPaymentStatus,
        },
      }
    );

    invoiceReversed = true;

    // 11. Mark return as cancelled
    salesReturn.status = "Cancelled";
    await salesReturn.save();

    returnCancelled = true;

    return res.status(200).json({
      message: "Sales return cancelled successfully",
      salesReturn,
    });

  } catch (error) {
    console.error("Cancel sales return error:", error);

    // Roll back stock changes
    for (const item of stockReversed) {
      await Product.updateOne(
        { _id: item.productId },
        {
          $inc: {
            currentStock: item.quantity,
          },
        }
      );
    }

    // Restore customer credit if cancellation failed
    if (creditReversed) {
      await Customer.updateOne(
        { _id: salesReturn.customerId },
        {
          $inc: {
            creditBalance: Number(salesReturn.creditRefund || 0),
          },
        }
      );
    }

    // Restore original invoice balance and status
    if (invoiceReversed) {
      await Invoice.updateOne(
        { _id: salesReturn.invoiceId },
        {
          $set: {
            balanceDue: originalInvoiceBalance,
            paymentStatus: originalPaymentStatus,
          },
        }
      );
    }

    // Restore return status if necessary
    if (returnCancelled) {
      await SalesReturn.updateOne(
        { _id: salesReturn._id },
        {
          $set: {
            status: "Completed",
          },
        }
      );
    }

    return res.status(400).json({
      message: "Failed to cancel sales return",
      error: error.message,
    });
  }
});


// GET ALL SALES RETURNS
app.get("/sales-returns", async (req, res) => {
  try {
    const salesReturns = await SalesReturn.find()
      .populate("customerId", "name phone")
      .sort({ createdAt: -1 });

    res.status(200).json(salesReturns);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sales returns",
      error: error.message,
    });
  }
});

// GET SALES RETURN BY ID
app.get("/sales-returns/:id", async (req, res) => {
  try {
    const salesReturn = await SalesReturn.findById(req.params.id)
      .populate("customerId", "name phone")
      .populate("items.productId", "name code");

    if (!salesReturn) {
      return res.status(404).json({
        message: "Sales return not found",
      });
    }

    res.status(200).json(salesReturn);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sales return",
      error: error.message,
    });
  }
});
/* =========================
   SUPPLIER ROUTES
========================= */

// GET all active suppliers
app.get("/suppliers", async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json(suppliers);
  } catch (error) {
    console.error("Fetch suppliers error:", error);
    res.status(500).json({
      message: "Failed to fetch suppliers.",
    });
  }
});

// GET a single supplier
app.get("/suppliers/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid supplier ID.",
      });
    }

    const supplier = await Supplier.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found.",
      });
    }

    res.status(200).json(supplier);
  } catch (error) {
    console.error("Fetch supplier error:", error);
    res.status(500).json({
      message: "Failed to fetch supplier.",
    });
  }
});

// ADD a supplier
app.post("/suppliers", async (req, res) => {
  try {
    const {
      supplierName,
      phone,
      email,
      address,
      companyName,
      gstNumber,
      openingBalance,
      notes,
    } = req.body;

    if (
      !supplierName?.trim() ||
      !phone?.trim() ||
      !address?.trim()
    ) {
      return res.status(400).json({
        message: "Supplier name, phone and address are required.",
      });
    }

    const balance = Number(openingBalance ?? 0);

    if (!Number.isFinite(balance) || balance < 0) {
      return res.status(400).json({
        message: "Opening balance must be zero or greater.",
      });
    }

    const supplier = await Supplier.create({
      supplierName: supplierName.trim(),
      phone: phone.trim(),
      email: email?.trim() || "",
      address: address.trim(),
      companyName: companyName?.trim() || "",
      gstNumber: gstNumber?.trim().toUpperCase() || "",
      openingBalance: balance,
      notes: notes?.trim() || "",
    });

    res.status(201).json({
      message: "Supplier added successfully.",
      supplier,
    });
  } catch (error) {
    console.error("Add supplier error:", error);
    res.status(500).json({
      message: "Failed to add supplier.",
    });
  }
});

// UPDATE a supplier
app.put("/suppliers/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid supplier ID.",
      });
    }

    const {
      supplierName,
      phone,
      email,
      address,
      companyName,
      gstNumber,
      openingBalance,
      notes,
    } = req.body;

    if (
      !supplierName?.trim() ||
      !phone?.trim() ||
      !address?.trim()
    ) {
      return res.status(400).json({
        message: "Supplier name, phone and address are required.",
      });
    }

    const balance = Number(openingBalance ?? 0);

    if (!Number.isFinite(balance) || balance < 0) {
      return res.status(400).json({
        message: "Opening balance must be zero or greater.",
      });
    }

    const supplier = await Supplier.findOneAndUpdate(
      {
        _id: req.params.id,
        isActive: true,
      },
      {
        $set: {
          supplierName: supplierName.trim(),
          phone: phone.trim(),
          email: email?.trim() || "",
          address: address.trim(),
          companyName: companyName?.trim() || "",
          gstNumber: gstNumber?.trim().toUpperCase() || "",
          openingBalance: balance,
          notes: notes?.trim() || "",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found.",
      });
    }

    res.status(200).json({
      message: "Supplier updated successfully.",
      supplier,
    });
  } catch (error) {
    console.error("Update supplier error:", error);
    res.status(500).json({
      message: "Failed to update supplier.",
    });
  }
});

// DEACTIVATE a supplier
app.delete("/suppliers/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid supplier ID.",
      });
    }

    const supplier = await Supplier.findOneAndUpdate(
      {
        _id: req.params.id,
        isActive: true,
      },
      {
        $set: { isActive: false },
      },
      {
        new: true,
      }
    );

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found.",
      });
    }

    res.status(200).json({
      message: "Supplier deactivated successfully.",
    });
  } catch (error) {
    console.error("Deactivate supplier error:", error);
    res.status(500).json({
      message: "Failed to deactivate supplier.",
    });
  }
});


/* =========================
   PURCHASE ROUTES
========================= */

// Calculate purchase details and validate supplier/products.

async function preparePurchaseData(data) {
  const {
    supplierId,
    purchaseDate,
    items,
    amountPaid = 0,
    notes = "",
    supplierInvoiceNumber = "",
    paymentMethod = "Cash",
    paymentDueDate = "",
  } = data;

  if (
    !supplierId ||
    !mongoose.Types.ObjectId.isValid(supplierId)
  ) {
    throw new Error("Please select a valid supplier.");
  }

  const supplier = await Supplier.findOne({
    _id: supplierId,
    isActive: true,
  });

  if (!supplier) {
    throw new Error("Supplier not found or inactive.");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Add at least one product.");
  }

  const preparedItems = [];

  for (const item of items) {
    const productId = item.productId;

    if (
      !productId ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      throw new Error("Please select a valid product.");
    }

    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Product quantity must be a positive whole number.");
    }

    const product = await Product.findById(productId);

    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    const purchasePrice =
      item.purchasePrice === undefined ||
      item.purchasePrice === ""
        ? Number(product.purchasePrice)
        : Number(item.purchasePrice);

    if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
      throw new Error(
        `Invalid purchase price for ${product.name}.`
      );
    }

    preparedItems.push({
      productId: product._id,
      productName: product.name,
      productCode: product.code,
      quantity,
      purchasePrice,
      total: Number((quantity * purchasePrice).toFixed(2)),
    });
  }

  const grandTotal = Number(
    preparedItems
      .reduce((sum, item) => sum + item.total, 0)
      .toFixed(2)
  );

  const paid = Number(amountPaid);

  if (
    !Number.isFinite(paid) ||
    paid < 0 ||
    paid > grandTotal
  ) {
    throw new Error(
      "Amount paid must be between zero and the purchase total."
    );
  }

  const paymentStatus =
    paid === grandTotal
      ? "Paid"
      : paid > 0
        ? "Partially Paid"
        : "Unpaid";

  const parsedDate = purchaseDate
    ? new Date(purchaseDate)
    : new Date();

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid purchase date.");
  }

  const allowedPaymentMethods = [
    "Cash",
    "Bank Transfer",
    "UPI",
    "Card",
    "Cheque",
    "Credit",
  ];

  if (!allowedPaymentMethods.includes(paymentMethod)) {
    throw new Error("Please select a valid payment method.");
  }

  let parsedDueDate = null;

  if (paymentDueDate) {
    // Parse the date-only input as a local calendar date.
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      paymentDueDate
    );

    if (!match) {
      throw new Error("Invalid payment due date.");
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    parsedDueDate = new Date(year, month - 1, day);

    if (
      parsedDueDate.getFullYear() !== year ||
      parsedDueDate.getMonth() !== month - 1 ||
      parsedDueDate.getDate() !== day
    ) {
      throw new Error("Invalid payment due date.");
    }
  }

  if (paymentStatus !== "Paid" && !parsedDueDate) {
    throw new Error(
      "Please select a payment due date for unpaid or partially paid purchases."
    );
  }

  return {
    supplierId: supplier._id,
    supplierName: supplier.supplierName,
    purchaseDate: parsedDate,
    items: preparedItems,
    grandTotal,
    amountPaid: paid,
    paymentStatus,
    paymentMethod,
    paymentDueDate: parsedDueDate,
    notes: String(notes || "").trim(),
    supplierInvoiceNumber: String(
      supplierInvoiceNumber || ""
    ).trim(),
  };
}

// Return the net stock change for each product.
function getStockDeltas(newItems, oldItems = []) {
  const deltas = new Map();

  for (const item of oldItems) {
    const id = String(item.productId);
    deltas.set(
      id,
      (deltas.get(id) || 0) - Number(item.quantity)
    );
  }

  for (const item of newItems) {
    const id = String(item.productId);
    deltas.set(
      id,
      (deltas.get(id) || 0) + Number(item.quantity)
    );
  }

  return deltas;
}

// Apply stock changes. Reverse already-applied changes if one fails.
async function applyPurchaseStockChanges(deltas) {
  const applied = [];

  try {
    for (const [productId, delta] of deltas) {
      if (delta === 0) continue;

      const filter = { _id: productId };

      // Never let stock become negative.
      if (delta < 0) {
        filter.currentStock = { $gte: Math.abs(delta) };
      }

      const result = await Product.updateOne(
        filter,
        { $inc: { currentStock: delta } }
      );

      if (result.matchedCount !== 1) {
        throw new Error(
          delta < 0
            ? `Cannot remove ${Math.abs(delta)} units from product ${productId}. Stock may already have been sold.`
            : `Product not found: ${productId}`
        );
      }

      applied.push({ productId, delta });
    }
  } catch (error) {
    // Best-effort rollback of changes from this operation.
    for (const change of applied.reverse()) {
      try {
        await Product.updateOne(
          { _id: change.productId },
          { $inc: { currentStock: -change.delta } }
        );
      } catch (rollbackError) {
        console.error("Purchase stock rollback error:", rollbackError);
      }
    }

    throw error;
  }
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
    debug: true,
});

const uploadSupplierInvoice = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      return callback(null, true);
    }

    callback(
      new Error("Only PDF, JPG, and PNG files are allowed.")
    );
  },
});

function uploadInvoiceToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "accounting-system/supplier-invoices",
        resource_type: "auto",
      },
(error, result) => {
if (error) {
  console.error("Cloudinary upload error details:", {
    message: error.message,
    http_code: error.http_code,
    name: error.name,
    request_id: error.request_id,
    response: error.response,
    response_headers: error.response?.headers,
    response_body: error.response?.body,
  });

  return reject(error);
}

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
        });
      }
    );

    stream.end(file.buffer);
  });
}

//PURCHASE ROUTES
// GET ALL PURCHASES
app.get("/purchases", async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .sort({ createdAt: -1 });

    res.status(200).json(purchases);
  } catch (error) {
    console.error("Fetch purchases error:", error);
    res.status(500).json({
      message: "Failed to fetch purchases.",
      error: error.message,
    });
  }
});

// GET ONE PURCHASE
app.get("/purchases/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid purchase ID.",
      });
    }

    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found.",
      });
    }

    res.status(200).json(purchase);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch purchase.",
      error: error.message,
    });
  }
});

// ADD PURCHASE
app.post("/purchases", uploadSupplierInvoice.none(), async (req, res) => {  console.log("Received invoice URL:", req.body.supplierInvoiceUrl);
console.log("Received invoice public ID:", req.body.supplierInvoicePublicId);
console.log("Received invoice filename:", req.body.supplierInvoiceOriginalName);
    let stockDeltas;
    try {
      // FormData sends items as a JSON string.
      const requestData = {
        ...req.body,
        items:
          typeof req.body.items === "string"
            ? JSON.parse(req.body.items)
            : req.body.items,
      };

      const purchaseData = await preparePurchaseData(requestData);
      if (requestData.supplierInvoiceUrl) {
  purchaseData.supplierInvoiceFile = {
    url: requestData.supplierInvoiceUrl,
    publicId: requestData.supplierInvoicePublicId || "",
    originalName: requestData.supplierInvoiceOriginalName || "",
    resourceType: requestData.supplierInvoiceResourceType || "",
  };
}

      // Generate the next purchase number.
      const counter = await Counter.findOneAndUpdate(
        { name: "purchase" },
        {
          $inc: { value: 1 },
          $setOnInsert: { name: "purchase" },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      purchaseData.purchaseNumber =
        `PUR-${String(counter.value).padStart(4, "0")}`;

      stockDeltas = getStockDeltas(purchaseData.items);

      await applyPurchaseStockChanges(stockDeltas);

      try {
        const purchase = await Purchase.create(purchaseData);

        return res.status(201).json({
          message: "Purchase created and stock updated successfully.",
          purchase,
        });
      } catch (saveError) {
        // Restore stock if saving the purchase fails.
        const reverseDeltas = new Map(
          [...stockDeltas].map(([id, delta]) => [id, -delta])
        );

        await applyPurchaseStockChanges(reverseDeltas);
        throw saveError;
      }
    } catch (error) {
      console.error("Add purchase error:", error);

      return res.status(400).json({
        message: "Failed to add purchase.",
        error: error.message,
      });
    }
  }
);


 // EDIT PURCHASE
app.put(
  "/purchases/:id",
  uploadSupplierInvoice.single("supplierInvoiceFile"),
  async (req, res) => {
    let newInvoice = null;

    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          message: "Invalid purchase ID.",
        });
      }

      const existingPurchase = await Purchase.findById(req.params.id);

      if (!existingPurchase) {
        return res.status(404).json({
          message: "Purchase not found.",
        });
      }

      // Parse items sent through FormData.
      const requestData = {
        ...req.body,
        items:
          typeof req.body.items === "string"
            ? JSON.parse(req.body.items)
            : req.body.items,
      };

      const updatedData = await preparePurchaseData(requestData);

// Keep the existing invoice unless a replacement is uploaded.
updatedData.supplierInvoiceFile =
  existingPurchase.supplierInvoiceFile;

if (requestData.supplierInvoiceUrl) {
  updatedData.supplierInvoiceFile = {
    url: requestData.supplierInvoiceUrl,
    publicId: requestData.supplierInvoicePublicId || "",
    originalName: requestData.supplierInvoiceOriginalName || "",
    resourceType: requestData.supplierInvoiceResourceType || "",
  };
} else if (req.file) {
  newInvoice = await uploadInvoiceToCloudinary(req.file);
  updatedData.supplierInvoiceFile = newInvoice;
}


      // Only apply the difference between old and new quantities.
      const stockDeltas = getStockDeltas(
        updatedData.items,
        existingPurchase.items
      );

      await applyPurchaseStockChanges(stockDeltas);

      try {
        Object.assign(existingPurchase, updatedData);

        const updatedPurchase = await existingPurchase.save();

        return res.status(200).json({
          message: "Purchase updated and stock adjusted successfully.",
          purchase: updatedPurchase,
        });
      } catch (saveError) {
        const reverseDeltas = new Map(
          [...stockDeltas].map(([id, delta]) => [id, -delta])
        );

        await applyPurchaseStockChanges(reverseDeltas);
        throw saveError;
      }
    } catch (error) {
      // Clean up a newly uploaded file if the update fails.
      if (newInvoice?.publicId) {
        try {
          await cloudinary.uploader.destroy(newInvoice.publicId, {
            resource_type: "raw",
          });
        } catch (cleanupError) {
          console.error("Invoice cleanup error:", cleanupError);
        }
      }

      console.error("Update purchase error:", error);

      return res.status(400).json({
        message: "Failed to update purchase.",
        error: error.message,
      });
    }
  }
);


// DELETE PURCHASE
app.delete("/purchases/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid purchase ID.",
      });
    }

    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found.",
      });
    }

    // Reverse the stock added by this purchase.
    const reverseDeltas = getStockDeltas([], purchase.items);

    await applyPurchaseStockChanges(reverseDeltas);

    try {
      await Purchase.deleteOne({ _id: purchase._id });

      return res.status(200).json({
        message: "Purchase deleted and stock adjusted successfully.",
      });
    } catch (deleteError) {
      // Restore stock if deleting the record fails.
      const restoreDeltas = new Map(
        [...reverseDeltas].map(([id, delta]) => [id, -delta])
      );

      await applyPurchaseStockChanges(restoreDeltas);
      throw deleteError;
    }
  } catch (error) {
    console.error("Delete purchase error:", error);
    res.status(400).json({
      message: "Failed to delete purchase.",
      error: error.message,
    });
  }
});


app.post("/purchase-returns", async (req, res) => {
  let stockDeltas = new Map();
  let stockUpdated = false;
  let purchase = null;
  let purchaseReturn = null;
  let purchaseSaved = false;

  const previousReturnedQuantities = new Map();

  try {
    const {
      purchaseId,
      returnDate,
      items,
      refundMethod = "Credit Note",
      refundAmount = 0,
      notes = "",
    } = req.body;

    // 1. Validate purchase ID
    if (
      !purchaseId ||
      !mongoose.Types.ObjectId.isValid(purchaseId)
    ) {
      throw new Error("Please select a valid purchase.");
    }

    // 2. Find original purchase
    purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
      return res.status(404).json({
        message: "Purchase not found.",
      });
    }

    // 3. Validate return items
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Add at least one product to return.");
    }

    const preparedItems = [];
    const returnedByPurchaseItem = new Map();

    // 4. Validate each returned product
    for (const item of items) {
      const purchaseItem = purchase.items.find(
        (p) => String(p._id) === String(item.purchaseItemId)
      );

      if (!purchaseItem) {
        throw new Error(
          "Selected product does not belong to this purchase."
        );
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error(
          `Invalid return quantity for ${purchaseItem.productName}.`
        );
      }

      const itemId = String(purchaseItem._id);

      const alreadyRequested =
        returnedByPurchaseItem.get(itemId) || 0;

      const alreadyReturned = Number(
        purchaseItem.returnedQuantity || 0
      );

      const availableQuantity =
        purchaseItem.quantity -
        alreadyReturned -
        alreadyRequested;

      if (quantity > availableQuantity) {
        throw new Error(
          `Only ${availableQuantity} units of ${purchaseItem.productName} can be returned.`
        );
      }

      returnedByPurchaseItem.set(
        itemId,
        alreadyRequested + quantity
      );

      const total = Number(
        (quantity * purchaseItem.purchasePrice).toFixed(2)
      );

      preparedItems.push({
        purchaseItemId: itemId,
        productId: purchaseItem.productId,
        productName: purchaseItem.productName,
        productCode: purchaseItem.productCode,
        quantity,
        purchasePrice: purchaseItem.purchasePrice,
        total,
        reason: String(item.reason || "").trim(),
      });
    }

    // 5. Calculate return total
    const grandTotal = Number(
      preparedItems
        .reduce((sum, item) => sum + item.total, 0)
        .toFixed(2)
    );

    const paidRefund = Number(refundAmount);

    if (
      !Number.isFinite(paidRefund) ||
      paidRefund < 0 ||
      paidRefund > grandTotal
    ) {
      throw new Error(
        "Refund amount must be between zero and the return total."
      );
    }

    // 6. Validate refund method
    const allowedRefundMethods = [
      "Cash",
      "Bank Transfer",
      "UPI",
      "Card",
      "Cheque",
      "Credit Note",
    ];

    if (!allowedRefundMethods.includes(refundMethod)) {
      throw new Error("Invalid refund method.");
    }

    // 7. Validate return date
    const parsedReturnDate = returnDate
      ? new Date(returnDate)
      : new Date();

    if (Number.isNaN(parsedReturnDate.getTime())) {
      throw new Error("Invalid return date.");
    }

    // 8. Generate return number
    const counter = await Counter.findOneAndUpdate(
      { name: "purchaseReturn" },
      {
        $inc: { value: 1 },
        $setOnInsert: { name: "purchaseReturn" },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const returnNumber =
      `PRN-${String(counter.value).padStart(4, "0")}`;

    // 9. Calculate stock reduction
    const stockItems = preparedItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    stockDeltas = getStockDeltas([], stockItems);

    await applyPurchaseStockChanges(stockDeltas);
    stockUpdated = true;

    // 10. Store previous returned quantities
    for (const [itemId, quantity] of returnedByPurchaseItem) {
      const purchaseItem = purchase.items.find(
        (p) => String(p._id) === itemId
      );

      previousReturnedQuantities.set(
        itemId,
        Number(purchaseItem.returnedQuantity || 0)
      );

      purchaseItem.returnedQuantity =
        Number(purchaseItem.returnedQuantity || 0) +
        quantity;
    }

    // 11. Update original purchase
    await purchase.save();
    purchaseSaved = true;

    // 12. Create Purchase Return record
    purchaseReturn = await PurchaseReturn.create({
      returnNumber,
      purchaseId: purchase._id,
      purchaseNumber: purchase.purchaseNumber,
      supplierId: purchase.supplierId,
      supplierName: purchase.supplierName,
      returnDate: parsedReturnDate,
      items: preparedItems,
      grandTotal,
      refundMethod,
      refundAmount: paidRefund,
      notes: String(notes || "").trim(),
    });

    return res.status(201).json({
      message: "Purchase return created successfully.",
      purchaseReturn,
    });

  } catch (error) {
    console.error("Create purchase return error:", error);

    // 13. Remove return record if one was created
    if (purchaseReturn) {
      try {
        await PurchaseReturn.deleteOne({
          _id: purchaseReturn._id,
        });
      } catch (cleanupError) {
        console.error("Return cleanup error:", cleanupError);
      }
    }

    // 14. Restore purchase returned quantities
    if (purchaseSaved && purchase) {
      try {
        const freshPurchase = await Purchase.findById(
          purchase._id
        );

        if (freshPurchase) {
          for (const [itemId, previousQuantity] of previousReturnedQuantities) {
            const purchaseItem = freshPurchase.items.find(
              (p) => String(p._id) === itemId
            );

            if (purchaseItem) {
              purchaseItem.returnedQuantity = previousQuantity;
            }
          }

          await freshPurchase.save();
        }
      } catch (restoreError) {
        console.error(
          "Purchase quantity restoration error:",
          restoreError
        );
      }
    }

    // 15. Restore product stock
    if (stockUpdated) {
      try {
        const reverseDeltas = new Map(
          [...stockDeltas].map(([id, delta]) => [
            id,
            -delta,
          ])
        );

        await applyPurchaseStockChanges(reverseDeltas);
      } catch (rollbackError) {
        console.error(
          "Purchase return stock rollback error:",
          rollbackError
        );
      }
    }

    return res.status(400).json({
      message: "Failed to create purchase return.",
      error: error.message,
    });
  }
});


app.get("/purchase-returns", async (req, res) => {
  try {
    const returns = await PurchaseReturn.find()
      .sort({ createdAt: -1 });

    res.status(200).json(returns);
  } catch (error) {
    console.error("Fetch purchase returns error:", error);

    res.status(500).json({
      message: "Failed to fetch purchase returns.",
      error: error.message,
    });
  }
});


app.get("/purchase-returns/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid purchase return ID.",
      });
    }

    const purchaseReturn = await PurchaseReturn.findById(
      req.params.id
    );

    if (!purchaseReturn) {
      return res.status(404).json({
        message: "Purchase return not found.",
      });
    }

    res.status(200).json(purchaseReturn);
  } catch (error) {
    console.error("Fetch purchase return error:", error);

    res.status(500).json({
      message: "Failed to fetch purchase return.",
      error: error.message,
    });
  }
});


app.put("/purchase-returns/:id", async (req, res) => {
  let purchase = null;
  let existingReturn = null;
  let stockDeltas = new Map();
  let stockUpdated = false;
  let purchaseSaved = false;

  const previousQuantities = new Map();

  try {
    const { id } = req.params;

    // 1. Validate return ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid purchase return ID.",
      });
    }

    // 2. Find existing return
    existingReturn = await PurchaseReturn.findById(id);

    if (!existingReturn) {
      return res.status(404).json({
        message: "Purchase return not found.",
      });
    }

    // 3. Find original purchase
    purchase = await Purchase.findById(
      existingReturn.purchaseId
    );

    if (!purchase) {
      throw new Error("Original purchase not found.");
    }

    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Add at least one product to return.");
    }

    // 4. Calculate quantities from the existing return
    const oldQuantities = new Map();

    for (const item of existingReturn.items) {
      const itemId = String(item.purchaseItemId);

      oldQuantities.set(
        itemId,
        (oldQuantities.get(itemId) || 0) +
          Number(item.quantity)
      );
    }

    // 5. Prepare updated items
    const preparedItems = [];
    const newQuantities = new Map();

    for (const item of items) {
      const purchaseItem = purchase.items.find(
        (p) =>
          String(p._id) === String(item.purchaseItemId)
      );

      if (!purchaseItem) {
        throw new Error(
          "Selected product does not belong to the original purchase."
        );
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error(
          `Invalid return quantity for ${purchaseItem.productName}.`
        );
      }

      const itemId = String(purchaseItem._id);

      const alreadyRequested =
        newQuantities.get(itemId) || 0;

      const previouslyReturned =
        Number(purchaseItem.returnedQuantity || 0);

      const oldReturnQuantity =
        oldQuantities.get(itemId) || 0;

      const availableQuantity =
        purchaseItem.quantity -
        previouslyReturned +
        oldReturnQuantity -
        alreadyRequested;

      if (quantity > availableQuantity) {
        throw new Error(
          `Only ${availableQuantity} units of ${purchaseItem.productName} can be returned.`
        );
      }

      newQuantities.set(
        itemId,
        alreadyRequested + quantity
      );

      preparedItems.push({
        purchaseItemId: itemId,
        productId: purchaseItem.productId,
        productName: purchaseItem.productName,
        productCode: purchaseItem.productCode,
        quantity,
        purchasePrice: purchaseItem.purchasePrice,
        total: Number(
          (quantity * purchaseItem.purchasePrice).toFixed(2)
        ),
        reason: String(item.reason || "").trim(),
      });
    }

    // 6. Calculate new return total
    const grandTotal = Number(
      preparedItems
        .reduce((sum, item) => sum + item.total, 0)
        .toFixed(2)
    );

    const refundAmount =
      req.body.refundAmount === undefined
        ? Number(existingReturn.refundAmount || 0)
        : Number(req.body.refundAmount);

    if (
      !Number.isFinite(refundAmount) ||
      refundAmount < 0 ||
      refundAmount > grandTotal
    ) {
      throw new Error(
        "Refund amount must be between zero and the return total."
      );
    }

    const refundMethod =
      req.body.refundMethod || existingReturn.refundMethod;

    const allowedRefundMethods = [
      "Cash",
      "Bank Transfer",
      "UPI",
      "Card",
      "Cheque",
      "Credit Note",
    ];

    if (!allowedRefundMethods.includes(refundMethod)) {
      throw new Error("Invalid refund method.");
    }

    let parsedReturnDate = existingReturn.returnDate;

    if (req.body.returnDate !== undefined) {
      parsedReturnDate = new Date(req.body.returnDate);

      if (Number.isNaN(parsedReturnDate.getTime())) {
        throw new Error("Invalid return date.");
      }
    }

    // 7. Calculate stock difference
    const oldStockItems = existingReturn.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const newStockItems = preparedItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    // Restores stock when return quantity decreases.
    // Reduces stock when return quantity increases.
    stockDeltas = getStockDeltas(
      oldStockItems,
      newStockItems
    );

    // 8. Update returned quantities in original purchase
    const allItemIds = new Set([
      ...oldQuantities.keys(),
      ...newQuantities.keys(),
    ]);

    for (const itemId of allItemIds) {
      const purchaseItem = purchase.items.find(
        (p) => String(p._id) === itemId
      );

      if (!purchaseItem) continue;

      const previous = Number(
        purchaseItem.returnedQuantity || 0
      );

      previousQuantities.set(itemId, previous);

      const oldQuantity = oldQuantities.get(itemId) || 0;
      const newQuantity = newQuantities.get(itemId) || 0;

      purchaseItem.returnedQuantity =
        previous - oldQuantity + newQuantity;
    }

    // 9. Save purchase quantity changes
    await purchase.save();
    purchaseSaved = true;

    // 10. Apply stock difference
    await applyPurchaseStockChanges(stockDeltas);
    stockUpdated = true;

    // 11. Update return document
    existingReturn.items = preparedItems;
    existingReturn.grandTotal = grandTotal;
    existingReturn.refundAmount = refundAmount;
    existingReturn.refundMethod = refundMethod;
    existingReturn.returnDate = parsedReturnDate;

    if (req.body.notes !== undefined) {
      existingReturn.notes = String(req.body.notes).trim();
    }

    const updatedReturn = await existingReturn.save();

    return res.status(200).json({
      message: "Purchase return updated successfully.",
      purchaseReturn: updatedReturn,
    });

  } catch (error) {
    console.error("Update purchase return error:", error);

    // 12. Restore stock if necessary
    if (stockUpdated) {
      try {
        const reverseDeltas = new Map(
          [...stockDeltas].map(([id, delta]) => [
            id,
            -delta,
          ])
        );

        await applyPurchaseStockChanges(reverseDeltas);
      } catch (rollbackError) {
        console.error("Stock rollback error:", rollbackError);
      }
    }

    // 13. Restore original purchase quantities
    if (purchaseSaved && purchase) {
      try {
        const freshPurchase = await Purchase.findById(
          purchase._id
        );

        if (freshPurchase) {
          for (const [itemId, quantity] of previousQuantities) {
            const purchaseItem = freshPurchase.items.find(
              (p) => String(p._id) === itemId
            );

            if (purchaseItem) {
              purchaseItem.returnedQuantity = quantity;
            }
          }

          await freshPurchase.save();
        }
      } catch (restoreError) {
        console.error(
          "Purchase quantity rollback error:",
          restoreError
        );
      }
    }

    return res.status(400).json({
      message: "Failed to update purchase return.",
      error: error.message,
    });
  }
});


app.delete("/purchase-returns/:id", async (req, res) => {
  let purchase = null;
  let purchaseReturn = null;
  let purchaseSaved = false;
  let stockUpdated = false;

  let stockDeltas = new Map();
  const previousQuantities = new Map();

  try {
    // 1. Validate return ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid purchase return ID.",
      });
    }

    // 2. Find purchase return
    purchaseReturn = await PurchaseReturn.findById(
      req.params.id
    );

    if (!purchaseReturn) {
      return res.status(404).json({
        message: "Purchase return not found.",
      });
    }

    // 3. Find original purchase
    purchase = await Purchase.findById(
      purchaseReturn.purchaseId
    );

    if (!purchase) {
      throw new Error("Original purchase not found.");
    }

    // 4. Prepare returned quantities
    const returnedQuantities = new Map();

    for (const item of purchaseReturn.items) {
      const itemId = String(item.purchaseItemId);

      returnedQuantities.set(
        itemId,
        (returnedQuantities.get(itemId) || 0) +
          Number(item.quantity)
      );
    }

    // 5. Validate and restore purchase quantities
    for (const [itemId, quantity] of returnedQuantities) {
      const purchaseItem = purchase.items.find(
        (p) => String(p._id) === itemId
      );

      if (!purchaseItem) {
        throw new Error(
          "Original purchase item not found."
        );
      }

      const currentReturned = Number(
        purchaseItem.returnedQuantity || 0
      );

      if (currentReturned < quantity) {
        throw new Error(
          `Return quantity mismatch for ${purchaseItem.productName}.`
        );
      }

      previousQuantities.set(itemId, currentReturned);

      purchaseItem.returnedQuantity =
        currentReturned - quantity;
    }

    // 6. Save original purchase
    await purchase.save();
    purchaseSaved = true;

    // 7. Restore product stock
    const returnedStockItems = purchaseReturn.items.map(
      (item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })
    );

    stockDeltas = getStockDeltas(
      returnedStockItems,
      []
    );

    await applyPurchaseStockChanges(stockDeltas);
    stockUpdated = true;

    // 8. Delete return record
    await PurchaseReturn.deleteOne({
      _id: purchaseReturn._id,
    });

    return res.status(200).json({
      message:
        "Purchase return deleted and stock restored successfully.",
    });

  } catch (error) {
    console.error("Delete purchase return error:", error);

    // 9. Reverse stock restoration if deletion failed
    if (stockUpdated) {
      try {
        const reverseDeltas = new Map(
          [...stockDeltas].map(([id, delta]) => [
            id,
            -delta,
          ])
        );

        await applyPurchaseStockChanges(reverseDeltas);
      } catch (rollbackError) {
        console.error("Stock rollback error:", rollbackError);
      }
    }

    // 10. Restore previous returned quantities
    if (purchaseSaved && purchase) {
      try {
        const freshPurchase = await Purchase.findById(
          purchase._id
        );

        if (freshPurchase) {
          for (const [itemId, quantity] of previousQuantities) {
            const purchaseItem = freshPurchase.items.find(
              (p) => String(p._id) === itemId
            );

            if (purchaseItem) {
              purchaseItem.returnedQuantity = quantity;
            }
          }

          await freshPurchase.save();
        }
      } catch (restoreError) {
        console.error(
          "Purchase quantity rollback error:",
          restoreError
        );
      }
    }

    return res.status(400).json({
      message: "Failed to delete purchase return.",
      error: error.message,
    });
  }
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
