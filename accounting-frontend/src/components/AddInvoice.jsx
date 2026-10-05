import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Form, Table } from "react-bootstrap";
import axios from "axios";
import {
  BsArrowLeft,
  BsFileEarmarkText,
  BsPlus,
  BsTrash,
  BsCheck2,
  BsReceipt,
  BsPerson,
  BsCreditCard,
  BsCart3,
} from "react-icons/bs";

export const AddInvoice = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [items, setItems] = useState([]);

  /* =====================================================
     FETCH DATA
  ===================================================== */

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    generateInvoiceNumber();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/customers"
      );

      setCustomers(res.data);
    } catch (error) {
      console.log("Customer error:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/products"
      );

      setProducts(res.data);
    } catch (error) {
      console.log("Product error:", error);
    }
  };

  /* =====================================================
     GENERATE INVOICE NUMBER
  ===================================================== */

  const generateInvoiceNumber = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/invoices"
      );

      const invoices = res.data;

      const nextNumber = invoices.length + 1;

      setInvoiceNumber(
        `INV-${String(nextNumber).padStart(4, "0")}`
      );
    } catch (error) {
      setInvoiceNumber("INV-0001");
    }
  };

  /* =====================================================
     ADD PRODUCT
  ===================================================== */

  const addProduct = () => {
    if (!selectedProduct) {
      alert("Please select a product");
      return;
    }

    if (Number(quantity) < 1) {
      alert("Quantity must be at least 1");
      return;
    }

    const product = products.find(
      (p) => p._id === selectedProduct
    );

    if (!product) return;

    const existingItem = items.find(
      (item) => item.productId === product._id
    );

    if (existingItem) {
      setItems(
        items.map((item) =>
          item.productId === product._id
            ? {
                ...item,
                quantity:
                  item.quantity + Number(quantity),

                total:
                  (item.quantity + Number(quantity)) *
                  item.price *
                  (1 + item.tax / 100),
              }
            : item
        )
      );
    } else {
      const baseAmount =
        Number(quantity) *
        Number(product.sellingPrice);

      const taxAmount =
        baseAmount *
        (Number(product.tax) / 100);

      const total = baseAmount + taxAmount;

      const newItem = {
        productId: product._id,
        productName: product.name,
        quantity: Number(quantity),
        price: Number(product.sellingPrice),
        tax: Number(product.tax),
        total,
      };

      setItems([...items, newItem]);
    }

    setSelectedProduct("");
    setQuantity(1);
  };

  /* =====================================================
     REMOVE PRODUCT
  ===================================================== */

  const removeItem = (productId) => {
    setItems(
      items.filter(
        (item) => item.productId !== productId
      )
    );
  };

  /* =====================================================
     CALCULATIONS
  ===================================================== */

  const subtotal = items.reduce(
    (sum, item) =>
      sum + item.quantity * item.price,
    0
  );

  const taxAmount = items.reduce(
    (sum, item) =>
      sum +
      item.quantity *
        item.price *
        (item.tax / 100),
    0
  );

  const grandTotal = Math.max(
    0,
    subtotal +
      taxAmount -
      Number(discount || 0)
  );

  /* =====================================================
     SELECTED CUSTOMER
  ===================================================== */

  const selectedCustomer = customers.find(
    (customer) => customer._id === customerId
  );

  /* =====================================================
     SAVE INVOICE
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId) {
      alert("Please select a customer");
      return;
    }

    if (items.length === 0) {
      alert("Please add at least one product");
      return;
    }

    const customer = customers.find(
      (c) => c._id === customerId
    );

    const invoiceData = {
      invoiceNumber,
      date,

      customerId,
      customerName: customer.name,
      customerPhone: customer.phone || "",
      customerAddress: customer.address || "",

      items,

      subtotal,
      taxAmount,
      discount: Number(discount || 0),
      grandTotal,

      paymentMethod,
      paymentStatus,

      notes,
    };

    try {
      await axios.post(
        "http://localhost:5000/invoices",
        invoiceData
      );

      alert("Invoice created successfully!");

      navigate("/invoices");
    } catch (error) {
      console.log("Invoice save error:", error);

      alert(
        error.response?.data?.error ||
          "Failed to create invoice"
      );
    }
  };

  return (
    <div style={pageStyle}>
      <div style={pageContainer}>

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div style={pageHeader}>
          <div>

            <div style={breadcrumb}>
              <span>Sales</span>
              <span style={breadcrumbSeparator}>
                /
              </span>
              <span style={breadcrumbCurrent}>
                Invoices
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
              }}
            >
              <h1 style={pageTitle}>
                Create Invoice
              </h1>

              <span style={invoiceBadge}>
                New
              </span>
            </div>

            <p style={pageSubtitle}>
              Create a new sales invoice for your customer.
            </p>

          </div>

          <Link
            to="/invoices"
            style={backButton}
          >
            <BsArrowLeft size={14} />
            Back to Invoices
          </Link>
        </div>


        {/* =================================================
            FORM
        ================================================= */}

        <Form onSubmit={handleSubmit}>

          <div style={mainLayout}>

            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <Card style={mainCard}>

              {/* CARD HEADER */}

              <div style={cardHeader}>

                <div style={cardHeaderIcon}>
                  <BsReceipt size={17} />
                </div>

                <div>
                  <h2 style={cardTitle}>
                    Invoice Information
                  </h2>

                  <p style={cardSubtitle}>
                    Enter invoice, customer and product details.
                  </p>
                </div>

              </div>


              <Card.Body style={cardBody}>

                {/* =================================================
                    INVOICE DETAILS
                ================================================= */}

                <div style={sectionHeader}>

                  <div style={sectionTitle}>
                    Invoice Details
                  </div>

                  <div style={sectionDescription}>
                    Basic information about this sales invoice.
                  </div>

                </div>


                <div style={twoColumnRow}>

                  <Form.Group style={fieldStyle}>

                    <Form.Label style={labelStyle}>
                      Invoice Number
                      <span style={required}>*</span>
                    </Form.Label>

                    <Form.Control
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) =>
                        setInvoiceNumber(e.target.value)
                      }
                      style={inputStyle}
                      required
                    />

                    <div style={helpText}>
                      Unique identification number for this invoice.
                    </div>

                  </Form.Group>


                  <Form.Group style={fieldStyle}>

                    <Form.Label style={labelStyle}>
                      Invoice Date
                      <span style={required}>*</span>
                    </Form.Label>

                    <Form.Control
                      type="date"
                      value={date}
                      onChange={(e) =>
                        setDate(e.target.value)
                      }
                      style={inputStyle}
                      required
                    />

                  </Form.Group>

                </div>


                <div style={sectionDivider} />


                {/* =================================================
                    CUSTOMER
                ================================================= */}

                <div style={sectionHeader}>

                  <div style={sectionTitle}>
                    Customer Information
                  </div>

                  <div style={sectionDescription}>
                    Select the customer for this invoice.
                  </div>

                </div>


                <Form.Group
                  style={{
                    marginBottom: "16px",
                  }}
                >

                  <Form.Label style={labelStyle}>
                    Customer
                    <span style={required}>*</span>
                  </Form.Label>

                  <Form.Select
                    value={customerId}
                    onChange={(e) =>
                      setCustomerId(e.target.value)
                    }
                    style={inputStyle}
                    required
                  >

                    <option value="">
                      Select customer
                    </option>

                    {customers.map((customer) => (
                      <option
                        key={customer._id}
                        value={customer._id}
                      >
                        {customer.name}

                        {customer.phone
                          ? ` — ${customer.phone}`
                          : ""}
                      </option>
                    ))}

                  </Form.Select>

                </Form.Group>


                {/* CUSTOMER PREVIEW */}

                {selectedCustomer && (
                  <div style={customerPreview}>

                    <div style={customerIcon}>
                      <BsPerson size={16} />
                    </div>

                    <div style={{ minWidth: 0 }}>

                      <div style={customerName}>
                        {selectedCustomer.name}
                      </div>

                      <div style={customerDetails}>
                        {selectedCustomer.phone ||
                          "No phone number"}

                        {selectedCustomer.email
                          ? ` • ${selectedCustomer.email}`
                          : ""}
                      </div>

                      {selectedCustomer.address && (
                        <div style={customerAddress}>
                          {selectedCustomer.address}
                        </div>
                      )}

                    </div>

                  </div>
                )}


                <div style={sectionDivider} />


                {/* =================================================
                    PRODUCTS
                ================================================= */}

                <div style={sectionHeader}>

                  <div style={sectionTitle}>
                    Products
                  </div>

                  <div style={sectionDescription}>
                    Add products and quantities to this invoice.
                  </div>

                </div>


                <div style={productAddRow}>

                  <Form.Group
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >

                    <Form.Label style={labelStyle}>
                      Product
                    </Form.Label>

                    <Form.Select
                      value={selectedProduct}
                      onChange={(e) =>
                        setSelectedProduct(e.target.value)
                      }
                      style={inputStyle}
                    >

                      <option value="">
                        Select product
                      </option>

                      {products.map((product) => (
                        <option
                          key={product._id}
                          value={product._id}
                        >
                          {product.name} — ₹
                          {Number(
                            product.sellingPrice
                          ).toFixed(2)}
                        </option>
                      ))}

                    </Form.Select>

                  </Form.Group>


                  <Form.Group
                    style={{
                      width: "105px",
                      flexShrink: 0,
                    }}
                  >

                    <Form.Label style={labelStyle}>
                      Quantity
                    </Form.Label>

                    <Form.Control
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(e.target.value)
                      }
                      style={inputStyle}
                    />

                  </Form.Group>


                  <Button
                    type="button"
                    onClick={addProduct}
                    style={addProductButton}
                  >
                    <BsPlus size={16} />
                    Add Product
                  </Button>

                </div>


                {/* =================================================
                    ITEMS TABLE
                ================================================= */}

                {items.length > 0 ? (

                  <div style={itemsTableWrapper}>

                    <Table
                      responsive
                      hover
                      style={{
                        marginBottom: 0,
                      }}
                    >

                      <thead>
                        <tr>

                          <th style={tableHeader}>
                            Product
                          </th>

                          <th
                            style={{
                              ...tableHeader,
                              textAlign: "center",
                            }}
                          >
                            Qty
                          </th>

                          <th
                            style={{
                              ...tableHeader,
                              textAlign: "right",
                            }}
                          >
                            Price
                          </th>

                          <th
                            style={{
                              ...tableHeader,
                              textAlign: "right",
                            }}
                          >
                            Tax
                          </th>

                          <th
                            style={{
                              ...tableHeader,
                              textAlign: "right",
                            }}
                          >
                            Total
                          </th>

                          <th
                            style={{
                              ...tableHeader,
                              width: "65px",
                              textAlign: "center",
                            }}
                          >
                            Action
                          </th>

                        </tr>
                      </thead>

                      <tbody>

                        {items.map((item) => (

                          <tr key={item.productId}>

                            <td style={tableCell}>
                              <div style={productCell}>

                                <div style={productIcon}>
                                  <BsCart3 size={13} />
                                </div>

                                <span>
                                  {item.productName}
                                </span>

                              </div>
                            </td>

                            <td
                              style={{
                                ...tableCell,
                                textAlign: "center",
                              }}
                            >
                              {item.quantity}
                            </td>

                            <td
                              style={{
                                ...tableCell,
                                textAlign: "right",
                              }}
                            >
                              ₹
                              {item.price.toFixed(2)}
                            </td>

                            <td
                              style={{
                                ...tableCell,
                                textAlign: "right",
                              }}
                            >
                              {item.tax}%
                            </td>

                            <td
                              style={{
                                ...tableCell,
                                textAlign: "right",
                                fontWeight: "650",
                                color: "#303844",
                              }}
                            >
                              ₹
                              {item.total.toFixed(2)}
                            </td>

                            <td
                              style={{
                                ...tableCell,
                                textAlign: "center",
                              }}
                            >

                              <Button
                                type="button"
                                onClick={() =>
                                  removeItem(
                                    item.productId
                                  )
                                }
                                style={deleteButton}
                                title="Remove product"
                              >
                                <BsTrash size={13} />
                              </Button>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </Table>

                  </div>

                ) : (

                  <div style={emptyProducts}>

                    <div style={emptyIcon}>
                      <BsCart3 size={19} />
                    </div>

                    <div style={emptyTitle}>
                      No products added
                    </div>

                    <div style={emptyText}>
                      Select a product and quantity above to add it to the invoice.
                    </div>

                  </div>

                )}


                <div style={sectionDivider} />


                {/* =================================================
                    PAYMENT
                ================================================= */}

                <div style={sectionHeader}>

                  <div style={sectionTitle}>
                    Payment Information
                  </div>

                  <div style={sectionDescription}>
                    Choose the payment method and current payment status.
                  </div>

                </div>


                <div style={twoColumnRow}>

                  <Form.Group style={fieldStyle}>

                    <Form.Label style={labelStyle}>
                      Payment Method
                      <span style={required}>*</span>
                    </Form.Label>

                    <Form.Select
                      value={paymentMethod}
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    >

                      <option value="Cash">
                        Cash
                      </option>

                      <option value="Card">
                        Card
                      </option>

                      <option value="UPI">
                        UPI
                      </option>

                      <option value="Credit">
                        Credit
                      </option>

                    </Form.Select>

                  </Form.Group>


                  <Form.Group style={fieldStyle}>

                    <Form.Label style={labelStyle}>
                      Payment Status
                      <span style={required}>*</span>
                    </Form.Label>

                    <Form.Select
                      value={paymentStatus}
                      onChange={(e) =>
                        setPaymentStatus(
                          e.target.value
                        )
                      }
                      style={inputStyle}
                    >

                      <option value="Paid">
                        Paid
                      </option>

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Partially Paid">
                        Partially Paid
                      </option>

                    </Form.Select>

                  </Form.Group>

                </div>


                {/* =================================================
                    NOTES
                ================================================= */}

                <Form.Group
                  style={{
                    marginTop: "4px",
                  }}
                >

                  <Form.Label style={labelStyle}>
                    Notes
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={notes}
                    onChange={(e) =>
                      setNotes(e.target.value)
                    }
                    placeholder="Add optional notes..."
                    style={textareaStyle}
                  />

                </Form.Group>

              </Card.Body>


              {/* =================================================
                  FORM FOOTER
              ================================================= */}

              <div style={formFooter}>

                <div>
                  <div style={footerTitle}>
                    Ready to create this invoice?
                  </div>

                  <div style={footerText}>
                    Review the invoice details before saving.
                  </div>
                </div>


                <div style={footerActions}>

                  <Button
                    type="button"
                    onClick={() =>
                      navigate("/invoices")
                    }
                    style={cancelButton}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    style={saveButton}
                  >
                    <BsCheck2 size={15} />
                    Save Invoice
                  </Button>

                </div>

              </div>

            </Card>


            {/* =================================================
                RIGHT COLUMN
            ================================================= */}

            <div style={rightColumn}>

              {/* =================================================
                  INVOICE SUMMARY
              ================================================= */}

              <Card style={sideCard}>

                <div style={sideCardHeader}>

                  <div style={sideHeaderIcon}>
                    <BsFileEarmarkText size={15} />
                  </div>

                  <div>

                    <h3 style={sideTitle}>
                      Invoice Summary
                    </h3>

                    <p style={sideSubtitle}>
                      Review totals before saving.
                    </p>

                  </div>

                </div>


                <div style={summaryBody}>

                  <div style={summaryInvoiceNumber}>
                    {invoiceNumber || "INV-0001"}
                  </div>

                  <div style={summaryDate}>
                    {date}
                  </div>


                  <div style={summaryDivider} />


                  <div style={summaryRow}>

                    <span>
                      Customer
                    </span>

                    <strong>
                      {selectedCustomer?.name ||
                        "Not selected"}
                    </strong>

                  </div>


                  <div style={summaryRow}>

                    <span>
                      Products
                    </span>

                    <strong>
                      {items.length}
                    </strong>

                  </div>


                  <div style={summaryRow}>

                    <span>
                      Payment
                    </span>

                    <strong>
                      {paymentMethod}
                    </strong>

                  </div>


                  <div style={summaryRow}>

                    <span>
                      Status
                    </span>

                    <span
                      style={statusStyle(
                        paymentStatus
                      )}
                    >
                      {paymentStatus}
                    </span>

                  </div>

                </div>

              </Card>


              {/* =================================================
                  TOTALS
              ================================================= */}

              <Card style={sideCard}>

                <div style={sideCardHeader}>

                  <div style={sideHeaderIcon}>
                    <BsReceipt size={15} />
                  </div>

                  <div>

                    <h3 style={sideTitle}>
                      Amount Summary
                    </h3>

                    <p style={sideSubtitle}>
                      Current invoice calculation.
                    </p>

                  </div>

                </div>


                <div style={amountBody}>

                  <div style={amountRow}>

                    <span>
                      Subtotal
                    </span>

                    <span>
                      ₹{subtotal.toFixed(2)}
                    </span>

                  </div>


                  <div style={amountRow}>

                    <span>
                      Tax
                    </span>

                    <span>
                      ₹{taxAmount.toFixed(2)}
                    </span>

                  </div>


                  <div style={amountRow}>

                    <span>
                      Discount
                    </span>

                    <span>
                      - ₹
                      {Number(
                        discount || 0
                      ).toFixed(2)}
                    </span>

                  </div>


                  <div style={amountDivider} />


                  <div style={grandTotalRow}>

                    <span>
                      Grand Total
                    </span>

                    <strong>
                      ₹{grandTotal.toFixed(2)}
                    </strong>

                  </div>

                </div>

              </Card>


              {/* =================================================
                  DISCOUNT
              ================================================= */}

              <Card style={sideCard}>

                <div style={sideCardHeader}>

                  <div>

                    <h3 style={sideTitle}>
                      Discount
                    </h3>

                    <p style={sideSubtitle}>
                      Apply an optional discount.
                    </p>

                  </div>

                </div>


                <div style={discountBody}>

                  <Form.Group>

                    <Form.Label style={labelStyle}>
                      Discount Amount
                    </Form.Label>

                    <div style={discountInputWrapper}>

                      <span style={currencyPrefix}>
                        ₹
                      </span>

                      <Form.Control
                        type="number"
                        min="0"
                        value={discount}
                        onChange={(e) =>
                          setDiscount(
                            e.target.value
                          )
                        }
                        placeholder="0.00"
                        style={discountInput}
                      />

                    </div>

                  </Form.Group>

                </div>

              </Card>


              {/* =================================================
                  QUICK INFORMATION
              ================================================= */}

              <Card style={sideCard}>

                <div style={sideCardHeader}>

                  <div style={sideHeaderIcon}>
                    <BsCreditCard size={15} />
                  </div>

                  <div>

                    <h3 style={sideTitle}>
                      Payment
                    </h3>

                    <p style={sideSubtitle}>
                      Current payment selection.
                    </p>

                  </div>

                </div>


                <div style={quickInfoBody}>

                  <div style={quickInfoRow}>

                    <span style={quickInfoLabel}>
                      Method
                    </span>

                    <span style={quickInfoValue}>
                      {paymentMethod}
                    </span>

                  </div>


                  <div style={quickInfoRow}>

                    <span style={quickInfoLabel}>
                      Status
                    </span>

                    <span
                      style={statusStyle(
                        paymentStatus
                      )}
                    >
                      {paymentStatus}
                    </span>

                  </div>

                </div>

              </Card>

            </div>

          </div>

        </Form>

      </div>
    </div>
  );
};


/* =========================================================
   PAGE
========================================================= */

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#f8fafb",
  padding: "26px 30px 40px",
};

const pageContainer = {
  width: "100%",
  maxWidth: "1280px",
  margin: "0 auto",
};


/* =========================================================
   HEADER
========================================================= */

const pageHeader = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "20px",
  marginBottom: "22px",
};

const breadcrumb = {
  display: "flex",
  alignItems: "center",
  fontSize: "11px",
  color: "#8a94a3",
  marginBottom: "6px",
};

const breadcrumbSeparator = {
  margin: "0 7px",
  color: "#b7bec6",
};

const breadcrumbCurrent = {
  color: "#596574",
  fontWeight: "600",
};

const pageTitle = {
  margin: 0,
  fontSize: "22px",
  fontWeight: "650",
  color: "#29323d",
  letterSpacing: "-0.25px",
};

const invoiceBadge = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "24px",
  padding: "0 8px",
  borderRadius: "5px",
  border: "1px solid #d9e4ec",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  fontSize: "10px",
  fontWeight: "650",
};

const pageSubtitle = {
  margin: "5px 0 0",
  fontSize: "12px",
  color: "#7b8592",
};

const backButton = {
  height: "38px",
  padding: "0 13px",
  borderRadius: "6px",
  border: "1px solid #d9e0e6",
  backgroundColor: "#ffffff",
  color: "#4b5563",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "7px",
  fontSize: "12px",
  fontWeight: "600",
  textDecoration: "none",
  whiteSpace: "nowrap",
  boxShadow: "0 1px 2px rgba(15,23,42,0.03)",
};


/* =========================================================
   MAIN LAYOUT
========================================================= */

const mainLayout = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 320px",
  gap: "22px",
  alignItems: "start",
};


/* =========================================================
   MAIN CARD
========================================================= */

const mainCard = {
  border: "1px solid #e1e6eb",
  borderRadius: "9px",
  backgroundColor: "#ffffff",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(15,23,42,0.035)",
};

const cardHeader = {
  display: "flex",
  alignItems: "center",
  gap: "11px",
  padding: "18px 22px",
  borderBottom: "1px solid #e3e7eb",
};

const cardHeaderIcon = {
  width: "34px",
  height: "34px",
  borderRadius: "6px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const cardTitle = {
  margin: 0,
  fontSize: "14px",
  fontWeight: "650",
  color: "#303844",
};

const cardSubtitle = {
  margin: "3px 0 0",
  fontSize: "11px",
  color: "#8a94a3",
};

const cardBody = {
  padding: "24px 24px 27px",
};


/* =========================================================
   SECTIONS
========================================================= */

const sectionHeader = {
  marginBottom: "15px",
};

const sectionTitle = {
  fontSize: "11px",
  fontWeight: "700",
  color: "#596574",
  textTransform: "uppercase",
  letterSpacing: "0.45px",
};

const sectionDescription = {
  marginTop: "4px",
  fontSize: "10px",
  color: "#8d97a3",
};

const sectionDivider = {
  height: "1px",
  backgroundColor: "#edf0f3",
  margin: "24px 0 22px",
};


/* =========================================================
   FORM
========================================================= */

const twoColumnRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "17px",
  marginBottom: "19px",
};

const fieldStyle = {
  minWidth: 0,
};

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: "600",
  color: "#4b5563",
  marginBottom: "6px",
};

const required = {
  color: "#dc3545",
  marginLeft: "3px",
};

const inputStyle = {
  height: "38px",
  borderRadius: "6px",
  border: "1px solid #d6dce2",
  backgroundColor: "#ffffff",
  color: "#374151",
  fontSize: "12px",
  boxShadow: "none",
};

const textareaStyle = {
  minHeight: "92px",
  borderRadius: "6px",
  border: "1px solid #d6dce2",
  backgroundColor: "#ffffff",
  color: "#374151",
  fontSize: "12px",
  resize: "vertical",
  boxShadow: "none",
};

const helpText = {
  marginTop: "5px",
  fontSize: "10px",
  color: "#929ba6",
};


/* =========================================================
   CUSTOMER
========================================================= */

const customerPreview = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "11px 13px",
  border: "1px solid #dfe5ea",
  borderRadius: "6px",
  backgroundColor: "#f8fafb",
};

const customerIcon = {
  width: "32px",
  height: "32px",
  borderRadius: "6px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const customerName = {
  fontSize: "12px",
  fontWeight: "650",
  color: "#374151",
};

const customerDetails = {
  marginTop: "2px",
  fontSize: "10px",
  color: "#7b8592",
};

const customerAddress = {
  marginTop: "2px",
  fontSize: "10px",
  color: "#929ba6",
};


/* =========================================================
   PRODUCTS
========================================================= */

const productAddRow = {
  display: "flex",
  alignItems: "flex-end",
  gap: "12px",
  marginBottom: "17px",
};

const addProductButton = {
  height: "38px",
  padding: "0 13px",
  borderRadius: "6px",
  border: "1px solid #4b6985",
  backgroundColor: "#4b6985",
  color: "#ffffff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  fontSize: "11px",
  fontWeight: "600",
  whiteSpace: "nowrap",
  boxShadow: "0 2px 5px rgba(75,105,133,0.18)",
};

const itemsTableWrapper = {
  border: "1px solid #e1e6eb",
  borderRadius: "7px",
  overflow: "hidden",
};

const tableHeader = {
  padding: "10px 12px",
  backgroundColor: "#f8fafb",
  borderBottom: "1px solid #dfe5ea",
  color: "#687483",
  fontSize: "9px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.35px",
  whiteSpace: "nowrap",
};

const tableCell = {
  padding: "10px 12px",
  borderBottom: "1px solid #edf0f2",
  verticalAlign: "middle",
  fontSize: "11px",
  color: "#596574",
};

const productCell = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const productIcon = {
  width: "28px",
  height: "28px",
  borderRadius: "5px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const deleteButton = {
  width: "29px",
  height: "29px",
  padding: 0,
  border: "1px solid #f0d7da",
  borderRadius: "5px",
  backgroundColor: "#fff7f7",
  color: "#c94a55",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const emptyProducts = {
  minHeight: "130px",
  border: "1px dashed #d6dde4",
  borderRadius: "7px",
  backgroundColor: "#fafbfc",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "20px",
};

const emptyIcon = {
  width: "38px",
  height: "38px",
  borderRadius: "6px",
  backgroundColor: "#edf3f7",
  color: "#7d91a3",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "8px",
};

const emptyTitle = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#687483",
};

const emptyText = {
  marginTop: "3px",
  fontSize: "10px",
  color: "#9aa3ad",
};


/* =========================================================
   RIGHT COLUMN
========================================================= */

const rightColumn = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const sideCard = {
  border: "1px solid #e1e6eb",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  overflow: "hidden",
  boxShadow: "0 1px 4px rgba(15,23,42,0.03)",
};

const sideCardHeader = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  padding: "15px 17px",
  borderBottom: "1px solid #e5e9ed",
};

const sideHeaderIcon = {
  width: "29px",
  height: "29px",
  borderRadius: "5px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const sideTitle = {
  margin: 0,
  fontSize: "12px",
  fontWeight: "650",
  color: "#3c4652",
};

const sideSubtitle = {
  margin: "3px 0 0",
  fontSize: "9px",
  color: "#929ba6",
};


/* =========================================================
   SUMMARY
========================================================= */

const summaryBody = {
  padding: "17px",
};

const summaryInvoiceNumber = {
  fontSize: "15px",
  fontWeight: "700",
  color: "#303844",
};

const summaryDate = {
  marginTop: "3px",
  fontSize: "10px",
  color: "#8a94a3",
};

const summaryDivider = {
  height: "1px",
  backgroundColor: "#edf0f2",
  margin: "14px 0 9px",
};

const summaryRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  padding: "7px 0",
  fontSize: "10px",
  color: "#89929d",
};

const statusStyle = (status) => {
  if (status === "Paid") {
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 7px",
      borderRadius: "4px",
      backgroundColor: "#eaf6ee",
      border: "1px solid #d2ead9",
      color: "#287a45",
      fontSize: "9px",
      fontWeight: "650",
    };
  }

  if (status === "Pending") {
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 7px",
      borderRadius: "4px",
      backgroundColor: "#fff6df",
      border: "1px solid #f0dfb3",
      color: "#9a6b16",
      fontSize: "9px",
      fontWeight: "650",
    };
  }

  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 7px",
    borderRadius: "4px",
    backgroundColor: "#edf3f7",
    border: "1px solid #d9e4ec",
    color: "#4b6985",
    fontSize: "9px",
    fontWeight: "650",
  };
};


/* =========================================================
   AMOUNT SUMMARY
========================================================= */

const amountBody = {
  padding: "16px 17px 17px",
};

const amountRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "6px 0",
  fontSize: "11px",
  color: "#7d8792",
};

const amountDivider = {
  height: "1px",
  backgroundColor: "#e7ebee",
  margin: "9px 0 11px",
};

const grandTotalRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: "13px",
  color: "#303844",
};

const discountBody = {
  padding: "17px",
};

const discountInputWrapper = {
  display: "flex",
  height: "38px",
};

const currencyPrefix = {
  width: "34px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f8fafb",
  border: "1px solid #d6dce2",
  borderRight: "none",
  borderRadius: "6px 0 0 6px",
  color: "#687483",
  fontSize: "11px",
};

const discountInput = {
  height: "38px",
  borderRadius: "0 6px 6px 0",
  border: "1px solid #d6dce2",
  fontSize: "11px",
  color: "#374151",
};


/* =========================================================
   QUICK INFO
========================================================= */

const quickInfoBody = {
  padding: "13px 17px",
};

const quickInfoRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 0",
  borderBottom: "1px solid #f0f2f4",
};

const quickInfoLabel = {
  fontSize: "10px",
  color: "#929ba6",
};

const quickInfoValue = {
  fontSize: "10px",
  fontWeight: "600",
  color: "#596574",
};


/* =========================================================
   FORM FOOTER
========================================================= */

const formFooter = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "15px",
  padding: "16px 22px",
  borderTop: "1px solid #e3e7eb",
  backgroundColor: "#fafbfc",
};

const footerTitle = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#4b5563",
};

const footerText = {
  marginTop: "3px",
  fontSize: "10px",
  color: "#929ba6",
};

const footerActions = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const cancelButton = {
  height: "38px",
  padding: "0 14px",
  borderRadius: "6px",
  border: "1px solid #d9e0e6",
  backgroundColor: "#ffffff",
  color: "#596574",
  fontSize: "11px",
  fontWeight: "600",
};

const saveButton = {
  height: "38px",
  padding: "0 15px",
  borderRadius: "6px",
  border: "1px solid #4b6985",
  backgroundColor: "#4b6985",
  color: "#ffffff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "7px",
  fontSize: "11px",
  fontWeight: "600",
  boxShadow: "0 2px 5px rgba(75,105,133,0.18)",
};


/* =========================================================
   RESPONSIVE
========================================================= */

const responsiveStyles = `
  @media (max-width: 1050px) {
    .invoice-main-layout {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 700px) {
    .invoice-page-header {
      align-items: flex-start !important;
      flex-direction: column !important;
    }

    .invoice-two-column {
      grid-template-columns: 1fr !important;
    }

    .invoice-product-row {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .invoice-product-row > div {
      width: 100% !important;
    }

    .invoice-footer {
      align-items: flex-start !important;
      flex-direction: column !important;
    }

    .invoice-footer-actions {
      width: 100%;
    }

    .invoice-footer-actions button {
      flex: 1;
    }
  }
`;

const OriginalPage = pageStyle;

export default AddInvoice;