const express = require("express");
const cors = require("cors");
const mongoose=require("mongoose");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
const Category = require("./models/Category");
const Product = require("./models/Product");
const Expense = require("./models/Expense");
const Customer = require("./models/Customer")
const Invoice = require("./models/Invoice");
const Counter = require("./models/Counter");

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
      description,
      image,
    } = req.body;

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
      description,
      image,
    });

    await product.save();

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
        description,
        image,
      },
      { new: true }
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

// ADD INVOICE
app.post("/invoices", async (req, res) => {
  try {
    const invoice = new Invoice(req.body);

    const savedInvoice = await invoice.save();

    res.status(201).json(savedInvoice);
  } catch (error) {
    console.log("Invoice error:", error);

    res.status(500).json({
      message: "Failed to add invoice",
      error: error.message,
    });
  }
});


// GET ALL INVOICES
app.get("/invoices", async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .sort({ createdAt: -1 });

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
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedInvoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    res.status(200).json(updatedInvoice);
  } catch (error) {
    res.status(500).json({
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
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
