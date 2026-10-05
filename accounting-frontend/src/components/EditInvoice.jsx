import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Form, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  BsArrowLeft,
  BsPlus,
  BsTrash,
  BsCheck2,
  BsReceipt,
  BsPerson,
  BsCart3,
  BsCreditCard,
  BsCalendar3,
  BsFileEarmarkText,
} from "react-icons/bs";

export const EditInvoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState("");
  const [customerId, setCustomerId] = useState("");

  const [items, setItems] = useState([]);

  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [notes, setNotes] = useState("");

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  // =====================================================
  // FETCH DATA
  // =====================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          customersResponse,
          productsResponse,
          invoiceResponse,
        ] = await Promise.all([
          axios.get("http://localhost:5000/customers"),
          axios.get("http://localhost:5000/products"),
          axios.get(`http://localhost:5000/invoices/${id}`),
        ]);

        setCustomers(customersResponse.data);
        setProducts(productsResponse.data);

        const invoice = invoiceResponse.data;

        setInvoiceNumber(invoice.invoiceNumber || "");

        if (invoice.date) {
          setDate(
            new Date(invoice.date)
              .toISOString()
              .split("T")[0]
          );
        }

        setCustomerId(invoice.customerId || "");

        setItems(
          (invoice.items || []).map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            tax: Number(item.tax) || 0,
            total: Number(item.total) || 0,
          }))
        );

        setDiscount(Number(invoice.discount) || 0);
        setPaymentMethod(invoice.paymentMethod || "Cash");
        setPaymentStatus(invoice.paymentStatus || "Paid");
        setNotes(invoice.notes || "");
      } catch (error) {
        console.error("Error loading invoice:", error);

        alert(
          error.response?.data?.message ||
            "Failed to load invoice"
        );

        navigate("/invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // =====================================================
  // SELECTED CUSTOMER
  // =====================================================

  const selectedCustomer = customers.find(
    (customer) => customer._id === customerId
  );

  // =====================================================
  // SELECTED PRODUCT
  // =====================================================

  const selectedProductData = products.find(
    (product) => product._id === selectedProduct
  );

  // =====================================================
  // ADD PRODUCT
  // =====================================================

  const handleAddProduct = () => {
    if (!selectedProduct) {
      alert("Please select a product");
      return;
    }

    if (Number(quantity) < 1) {
      alert("Quantity must be at least 1");
      return;
    }

    const product = products.find(
      (item) => item._id === selectedProduct
    );

    if (!product) return;

    const existingIndex = items.findIndex(
      (item) => item.productId === product._id
    );

    const price = Number(product.sellingPrice) || 0;
    const tax = Number(product.tax) || 0;

    if (existingIndex !== -1) {
      const updatedItems = [...items];

      const newQuantity =
        Number(updatedItems[existingIndex].quantity) +
        Number(quantity);

      const baseTotal = newQuantity * price;
      const taxAmount = (baseTotal * tax) / 100;

      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: newQuantity,
        price,
        tax,
        total: baseTotal + taxAmount,
      };

      setItems(updatedItems);
    } else {
      const qty = Number(quantity);

      const baseTotal = qty * price;
      const taxAmount = (baseTotal * tax) / 100;

      setItems([
        ...items,
        {
          productId: product._id,
          productName: product.name,
          quantity: qty,
          price,
          tax,
          total: baseTotal + taxAmount,
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity(1);
  };

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  const handleRemoveItem = (index) => {
    setItems(
      items.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  // =====================================================
  // CHANGE QUANTITY
  // =====================================================

  const handleQuantityChange = (index, newQuantity) => {
    const qty = Number(newQuantity);

    if (qty < 1 || Number.isNaN(qty)) return;

    const updatedItems = [...items];
    const item = updatedItems[index];

    const baseTotal =
      qty * Number(item.price || 0);

    const taxAmount =
      (baseTotal * Number(item.tax || 0)) / 100;

    updatedItems[index] = {
      ...item,
      quantity: qty,
      total: baseTotal + taxAmount,
    };

    setItems(updatedItems);
  };

  // =====================================================
  // CALCULATIONS
  // =====================================================

  const subtotal = items.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 0),
    0
  );

  const taxAmount = items.reduce((total, item) => {
    const itemSubtotal =
      Number(item.price || 0) *
      Number(item.quantity || 0);

    return (
      total +
      (itemSubtotal * Number(item.tax || 0)) / 100
    );
  }, 0);

  const grandTotal = Math.max(
    0,
    subtotal +
      taxAmount -
      Number(discount || 0)
  );

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    if (status === "Paid") {
      return {
        color: "#047857",
        backgroundColor: "#ecfdf5",
      };
    }

    if (status === "Pending") {
      return {
        color: "#b45309",
        backgroundColor: "#fffbeb",
      };
    }

    return {
      color: "#6d28d9",
      backgroundColor: "#f5f3ff",
    };
  };

  // =====================================================
  // SAVE
  // =====================================================

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

    if (Number(discount) < 0) {
      alert("Discount cannot be negative");
      return;
    }

    if (Number(discount) > subtotal + taxAmount) {
      alert(
        "Discount cannot be greater than the invoice total"
      );
      return;
    }

    try {
      setSaving(true);

      const invoiceData = {
        invoiceNumber,
        date,
        customerId,

        customerName: selectedCustomer?.name || "",
        customerPhone: selectedCustomer?.phone || "",
        customerAddress:
          selectedCustomer?.address || "",

        items,

        subtotal: Number(subtotal.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        discount: Number(discount || 0),
        grandTotal: Number(grandTotal.toFixed(2)),

        paymentMethod,
        paymentStatus,
        notes,
      };

      await axios.put(
        `http://localhost:5000/invoices/${id}`,
        invoiceData
      );

      alert("Invoice updated successfully");

      navigate("/invoices");
    } catch (error) {
      console.error(
        "Error updating invoice:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update invoice"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={loadingContainer}>
          <div style={loadingSpinner}>
            <BsReceipt size={20} />
          </div>

          <div style={loadingTitle}>
            Loading invoice...
          </div>

          <div style={loadingText}>
            Please wait while the invoice is being loaded.
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div style={pageStyle}>

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div style={pageHeader}>

        <div>
          <button
            type="button"
            onClick={() => navigate("/invoices")}
            style={backButton}
          >
            <BsArrowLeft size={14} />
            Back to Invoices
          </button>

          <h1 style={pageTitle}>
            Edit Invoice
          </h1>

          <p style={pageSubtitle}>
            Update invoice details, products and payment information.
          </p>
        </div>

        <div style={invoiceBadge}>
          <BsReceipt size={17} />

          <div>
            <div style={invoiceBadgeLabel}>
              INVOICE
            </div>

            <div style={invoiceBadgeNumber}>
              {invoiceNumber}
            </div>
          </div>
        </div>

      </div>


      {/* =================================================
          FORM
      ================================================= */}

      <Form onSubmit={handleSubmit}>

        <div style={mainLayout}>

          {/* =================================================
              LEFT CONTENT
          ================================================= */}

          <div>

            {/* INVOICE DETAILS */}

            <Card style={cardStyle}>

              <div style={sectionHeader}>
                <div style={sectionIcon}>
                  <BsReceipt size={16} />
                </div>

                <div>
                  <div style={sectionTitle}>
                    Invoice Details
                  </div>

                  <div style={sectionSubtitle}>
                    Basic information for this invoice.
                  </div>
                </div>
              </div>

              <Card.Body style={cardBody}>

                <div style={twoColumn}>

                  <Form.Group>
                    <Form.Label style={labelStyle}>
                      Invoice Number
                    </Form.Label>

                    <Form.Control
                      type="text"
                      value={invoiceNumber}
                      disabled
                      style={{
                        ...inputStyle,
                        backgroundColor: "#f5f7f9",
                        color: "#7b8490",
                      }}
                    />

                    <div style={helpText}>
                      Invoice number cannot be changed.
                    </div>
                  </Form.Group>


                  <Form.Group>
                    <Form.Label style={labelStyle}>
                      Invoice Date
                      <span style={required}>*</span>
                    </Form.Label>

                    <div style={inputWithIcon}>
                      <BsCalendar3 style={inputIcon} />

                      <Form.Control
                        type="date"
                        value={date}
                        onChange={(e) =>
                          setDate(e.target.value)
                        }
                        required
                        style={{
                          ...inputStyle,
                          paddingLeft: "36px",
                        }}
                      />
                    </div>
                  </Form.Group>

                </div>

              </Card.Body>

            </Card>


            {/* CUSTOMER */}

            <Card style={cardStyle}>

              <div style={sectionHeader}>
                <div style={sectionIcon}>
                  <BsPerson size={17} />
                </div>

                <div>
                  <div style={sectionTitle}>
                    Customer
                  </div>

                  <div style={sectionSubtitle}>
                    Select the customer for this invoice.
                  </div>
                </div>
              </div>

              <Card.Body style={cardBody}>

                <Form.Group>

                  <Form.Label style={labelStyle}>
                    Customer
                    <span style={required}>*</span>
                  </Form.Label>

                  <Form.Select
                    value={customerId}
                    onChange={(e) =>
                      setCustomerId(e.target.value)
                    }
                    required
                    style={inputStyle}
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


                {selectedCustomer && (
                  <div style={customerPreview}>

                    <div style={customerAvatar}>
                      <BsPerson size={16} />
                    </div>

                    <div style={customerInfo}>

                      <div style={customerName}>
                        {selectedCustomer.name}
                      </div>

                      <div style={customerMeta}>
                        {selectedCustomer.phone && (
                          <span>
                            {selectedCustomer.phone}
                          </span>
                        )}

                        {selectedCustomer.email && (
                          <span>
                            {selectedCustomer.email}
                          </span>
                        )}
                      </div>

                      {selectedCustomer.address && (
                        <div style={customerAddress}>
                          {selectedCustomer.address}
                        </div>
                      )}

                    </div>

                    <span style={selectedBadge}>
                      Selected
                    </span>

                  </div>
                )}

              </Card.Body>

            </Card>


            {/* PRODUCTS */}

            <Card style={cardStyle}>

              <div style={sectionHeader}>

                <div style={sectionIcon}>
                  <BsCart3 size={17} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={sectionTitle}>
                    Products
                  </div>

                  <div style={sectionSubtitle}>
                    Add or update products included in this invoice.
                  </div>
                </div>

                <span style={itemsBadge}>
                  {items.length}{" "}
                  {items.length === 1
                    ? "Item"
                    : "Items"}
                </span>

              </div>


              <Card.Body style={cardBody}>

                {/* ADD PRODUCT */}

                <div style={addProductBox}>

                  <div style={addProductTitle}>
                    Add Product
                  </div>

                  <div style={productAddRow}>

                    <Form.Group style={{ flex: 1 }}>

                      <Form.Label style={labelStyle}>
                        Product
                      </Form.Label>

                      <Form.Select
                        value={selectedProduct}
                        onChange={(e) =>
                          setSelectedProduct(
                            e.target.value
                          )
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
                            {product.name}

                            {product.code
                              ? ` (${product.code})`
                              : ""}

                            {" — ₹"}

                            {Number(
                              product.sellingPrice || 0
                            ).toFixed(2)}
                          </option>
                        ))}

                      </Form.Select>

                    </Form.Group>


                    <Form.Group style={quantityGroup}>

                      <Form.Label style={labelStyle}>
                        Quantity
                      </Form.Label>

                      <Form.Control
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            e.target.value
                          )
                        }
                        style={inputStyle}
                      />

                    </Form.Group>


                    <Button
                      type="button"
                      onClick={handleAddProduct}
                      style={addButton}
                    >
                      <BsPlus size={16} />
                      Add Product
                    </Button>

                  </div>


                  {selectedProductData && (
                    <div style={selectedProductPreview}>

                      <div style={selectedProductIcon}>
                        <BsCart3 size={13} />
                      </div>

                      <div>

                        <div style={selectedProductName}>
                          {selectedProductData.name}
                        </div>

                        <div style={selectedProductDetails}>
                          Selling Price: ₹
                          {Number(
                            selectedProductData.sellingPrice || 0
                          ).toFixed(2)}

                          <span style={dot}>
                            •
                          </span>

                          Tax:{" "}
                          {selectedProductData.tax || 0}%
                        </div>

                      </div>

                    </div>
                  )}

                </div>


                {/* PRODUCT TABLE */}

                {items.length > 0 ? (

                  <div style={tableWrapper}>

                    <Table
                      responsive
                      hover
                      style={tableStyle}
                    >

                      <thead>
                        <tr>

                          <th style={tableHeader}>
                            Product
                          </th>

                          <th
                            style={{
                              ...tableHeader,
                              width: "100px",
                            }}
                          >
                            Quantity
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
                              textAlign: "center",
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
                              width: "55px",
                              textAlign: "center",
                            }}
                          >
                            Action
                          </th>

                        </tr>
                      </thead>


                      <tbody>

                        {items.map((item, index) => (

                          <tr
                            key={`${item.productId}-${index}`}
                          >

                            <td style={tableCell}>

                              <div style={productCell}>

                                <div style={productIcon}>
                                  <BsCart3 size={12} />
                                </div>

                                <div>

                                  <div style={productName}>
                                    {item.productName}
                                  </div>

                                  <div style={productSub}>
                                    Product
                                  </div>

                                </div>

                              </div>

                            </td>


                            <td style={tableCell}>

                              <Form.Control
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    index,
                                    e.target.value
                                  )
                                }
                                style={quantityInput}
                              />

                            </td>


                            <td
                              style={{
                                ...tableCell,
                                textAlign: "right",
                              }}
                            >
                              ₹
                              {Number(
                                item.price || 0
                              ).toFixed(2)}
                            </td>


                            <td
                              style={{
                                ...tableCell,
                                textAlign: "center",
                              }}
                            >
                              <span style={taxBadge}>
                                {item.tax || 0}%
                              </span>
                            </td>


                            <td
                              style={{
                                ...tableCell,
                                textAlign: "right",
                              }}
                            >
                              <strong style={itemTotal}>
                                ₹
                                {Number(
                                  item.total || 0
                                ).toFixed(2)}
                              </strong>
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
                                  handleRemoveItem(index)
                                }
                                style={deleteButton}
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
                      Select a product above to add it to this invoice.
                    </div>

                  </div>

                )}

              </Card.Body>

            </Card>


            {/* PAYMENT */}

            <Card style={cardStyle}>

              <div style={sectionHeader}>

                <div style={sectionIcon}>
                  <BsCreditCard size={17} />
                </div>

                <div>
                  <div style={sectionTitle}>
                    Payment Information
                  </div>

                  <div style={sectionSubtitle}>
                    Update payment method and status.
                  </div>
                </div>

              </div>


              <Card.Body style={cardBody}>

                <div style={threeColumn}>

                  <Form.Group>

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


                  <Form.Group>

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


                  <Form.Group>

                    <Form.Label style={labelStyle}>
                      Discount
                    </Form.Label>

                    <div style={discountInputWrapper}>

                      <span style={currencySymbol}>
                        ₹
                      </span>

                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        value={discount}
                        onChange={(e) =>
                          setDiscount(
                            e.target.value
                          )
                        }
                        style={discountInput}
                      />

                    </div>

                  </Form.Group>

                </div>

              </Card.Body>

            </Card>


            {/* NOTES */}

            <Card style={cardStyle}>

              <div style={sectionHeader}>

                <div style={sectionIcon}>
                  <BsFileEarmarkText size={16} />
                </div>

                <div>
                  <div style={sectionTitle}>
                    Notes
                  </div>

                  <div style={sectionSubtitle}>
                    Add additional information if required.
                  </div>
                </div>

              </div>


              <Card.Body style={cardBody}>

                <Form.Group>

                  <Form.Label style={labelStyle}>
                    Additional Notes
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={notes}
                    onChange={(e) =>
                      setNotes(e.target.value)
                    }
                    placeholder="Add any notes for this invoice..."
                    style={textareaStyle}
                  />

                </Form.Group>

              </Card.Body>

            </Card>

          </div>


          {/* =================================================
              RIGHT SUMMARY
          ================================================= */}

          <div style={sideColumn}>

            {/* SUMMARY */}

            <Card style={sideCard}>

              <div style={sideHeader}>

                <div>
                  <div style={sideTitle}>
                    Invoice Summary
                  </div>

                  <div style={sideSubtitle}>
                    Updated automatically
                  </div>
                </div>

                <div style={sideIcon}>
                  <BsReceipt size={14} />
                </div>

              </div>


              <div style={summaryBody}>

                <div style={invoiceSummaryTop}>

                  <div style={summaryInvoiceIcon}>
                    <BsReceipt size={20} />
                  </div>

                  <div>

                    <div style={summaryInvoiceNumber}>
                      {invoiceNumber}
                    </div>

                    <div style={summaryInvoiceDate}>
                      {date || "No date selected"}
                    </div>

                  </div>

                </div>


                <div style={summaryCustomer}>

                  <div style={summarySmallLabel}>
                    CUSTOMER
                  </div>

                  <div style={summaryCustomerName}>
                    {selectedCustomer?.name ||
                      "No customer selected"}
                  </div>

                </div>


                <div style={summaryRow}>
                  <span>Subtotal</span>

                  <strong>
                    ₹{subtotal.toFixed(2)}
                  </strong>
                </div>


                <div style={summaryRow}>
                  <span>Tax</span>

                  <strong>
                    ₹{taxAmount.toFixed(2)}
                  </strong>
                </div>


                <div style={summaryRow}>
                  <span>Discount</span>

                  <span style={discountValue}>
                    - ₹
                    {Number(
                      discount || 0
                    ).toFixed(2)}
                  </span>
                </div>


                <div style={summaryDivider}></div>


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


            {/* PAYMENT */}

            <Card style={sideCard}>

              <div style={sideHeader}>

                <div>
                  <div style={sideTitle}>
                    Payment
                  </div>

                  <div style={sideSubtitle}>
                    Current payment details
                  </div>
                </div>

                <div style={sideIcon}>
                  <BsCreditCard size={14} />
                </div>

              </div>


              <div style={paymentSummaryBody}>

                <div style={paymentRow}>
                  <span>Method</span>

                  <strong>
                    {paymentMethod}
                  </strong>
                </div>

                <div style={paymentRow}>
                  <span>Status</span>

                  <span
                    style={{
                      ...statusBadge,
                      ...getStatusStyle(
                        paymentStatus
                      ),
                    }}
                  >
                    {paymentStatus}
                  </span>
                </div>

                <div style={paymentRow}>
                  <span>Items</span>

                  <strong>
                    {items.length}
                  </strong>
                </div>

              </div>

            </Card>


            {/* CUSTOMER */}

            <Card style={sideCard}>

              <div style={sideHeader}>

                <div>
                  <div style={sideTitle}>
                    Customer
                  </div>

                  <div style={sideSubtitle}>
                    Selected customer
                  </div>
                </div>

                <div style={sideIcon}>
                  <BsPerson size={14} />
                </div>

              </div>


              <div style={sideCustomerBody}>

                <div style={sideCustomerAvatar}>
                  <BsPerson size={16} />
                </div>

                <div style={{ minWidth: 0 }}>

                  <div style={sideCustomerName}>
                    {selectedCustomer?.name ||
                      "No customer selected"}
                  </div>

                  <div style={sideCustomerPhone}>
                    {selectedCustomer?.phone ||
                      "No phone number"}
                  </div>

                </div>

              </div>

            </Card>


            {/* CHECKLIST */}

            <Card style={sideCard}>

              <div style={sideHeader}>

                <div>
                  <div style={sideTitle}>
                    Before Updating
                  </div>

                  <div style={sideSubtitle}>
                    Quick checklist
                  </div>
                </div>

              </div>


              <div style={checklistBody}>

                <div style={checkItem}>
                  <span style={checkCircle}>
                    <BsCheck2 size={10} />
                  </span>

                  Check customer information
                </div>

                <div style={checkItem}>
                  <span style={checkCircle}>
                    <BsCheck2 size={10} />
                  </span>

                  Verify product quantities
                </div>

                <div style={checkItem}>
                  <span style={checkCircle}>
                    <BsCheck2 size={10} />
                  </span>

                  Review discount and tax
                </div>

                <div
                  style={{
                    ...checkItem,
                    marginBottom: 0,
                  }}
                >
                  <span style={checkCircle}>
                    <BsCheck2 size={10} />
                  </span>

                  Confirm payment status
                </div>

              </div>

            </Card>

          </div>

        </div>


        {/* =================================================
            ACTION BAR
        ================================================= */}

        <div style={bottomBar}>

          <div>
            <div style={bottomTitle}>
              Edit Invoice
            </div>

            <div style={bottomText}>
              Save your changes to update this invoice.
            </div>
          </div>


          <div style={actionButtons}>

            <Button
              type="button"
              onClick={() =>
                navigate("/invoices")
              }
              style={cancelButton}
            >
              <BsArrowLeft size={14} />
              Cancel
            </Button>


            <Button
              type="submit"
              disabled={saving}
              style={{
                ...updateButton,
                opacity: saving ? 0.7 : 1,
              }}
            >

              <BsCheck2 size={15} />

              {saving
                ? "Updating..."
                : "Update Invoice"}

            </Button>

          </div>

        </div>

      </Form>

    </div>
  );
};


// =========================================================
// PAGE
// =========================================================

const pageStyle = {
  width: "100%",
  minHeight: "100vh",
  padding: "24px 30px 35px",
  backgroundColor: "#f8fafb",
  boxSizing: "border-box",
};


// =========================================================
// HEADER
// =========================================================

const pageHeader = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "20px",
  marginBottom: "22px",
};

const backButton = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  border: "none",
  backgroundColor: "transparent",
  padding: 0,
  marginBottom: "9px",
  color: "#6b7280",
  fontSize: "11px",
  cursor: "pointer",
};

const pageTitle = {
  margin: 0,
  fontSize: "23px",
  fontWeight: "600",
  color: "#26313d",
  letterSpacing: "-0.2px",
};

const pageSubtitle = {
  margin: "5px 0 0",
  fontSize: "10px",
  color: "#929aa3",
};

const invoiceBadge = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  padding: "9px 12px",
  backgroundColor: "#ffffff",
  border: "1px solid #e0e5e9",
  borderRadius: "7px",
};

const invoiceBadgeLabel = {
  fontSize: "7px",
  fontWeight: "700",
  color: "#9aa1aa",
  letterSpacing: "0.8px",
};

const invoiceBadgeNumber = {
  marginTop: "2px",
  fontSize: "11px",
  fontWeight: "600",
  color: "#374151",
};


// =========================================================
// LAYOUT
// =========================================================

const mainLayout = {
  width: "100%",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 300px",
  gap: "20px",
  alignItems: "start",
};


// =========================================================
// CARDS
// =========================================================

const cardStyle = {
  width: "100%",
  marginBottom: "18px",
  border: "1px solid #e1e5e9",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.025)",
};

const sectionHeader = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "14px 18px",
  borderBottom: "1px solid #e8ebee",
};

const sectionIcon = {
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

const sectionTitle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#303b47",
};

const sectionSubtitle = {
  marginTop: "2px",
  fontSize: "9px",
  color: "#9aa1aa",
};

const cardBody = {
  padding: "19px",
};


// =========================================================
// FORM
// =========================================================

const twoColumn = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "17px",
};

const threeColumn = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "17px",
};

const labelStyle = {
  display: "block",
  fontSize: "9px",
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
  border: "1px solid #d5dbe1",
  borderRadius: "5px",
  fontSize: "10px",
  color: "#374151",
  boxShadow: "none",
};

const helpText = {
  marginTop: "4px",
  fontSize: "8px",
  color: "#a0a7af",
};

const inputWithIcon = {
  position: "relative",
};

const inputIcon = {
  position: "absolute",
  left: "12px",
  top: "12px",
  color: "#8d98a3",
  zIndex: 2,
};


// =========================================================
// CUSTOMER
// =========================================================

const customerPreview = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginTop: "13px",
  padding: "10px 11px",
  border: "1px solid #e1e6ea",
  borderRadius: "6px",
  backgroundColor: "#f8fafb",
};

const customerAvatar = {
  width: "33px",
  height: "33px",
  borderRadius: "6px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const customerInfo = {
  flex: 1,
  minWidth: 0,
};

const customerName = {
  fontSize: "10px",
  fontWeight: "600",
  color: "#374151",
};

const customerMeta = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "2px",
  fontSize: "8px",
  color: "#7b8490",
};

const customerAddress = {
  marginTop: "2px",
  fontSize: "8px",
  color: "#9aa1aa",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const selectedBadge = {
  padding: "3px 6px",
  borderRadius: "4px",
  backgroundColor: "#ecfdf5",
  color: "#047857",
  fontSize: "7px",
  fontWeight: "600",
};


// =========================================================
// PRODUCTS
// =========================================================

const itemsBadge = {
  padding: "4px 7px",
  borderRadius: "4px",
  backgroundColor: "#f1f4f6",
  color: "#6b7280",
  fontSize: "8px",
  fontWeight: "600",
};

const addProductBox = {
  padding: "13px",
  border: "1px solid #e1e6ea",
  borderRadius: "6px",
  backgroundColor: "#fafbfc",
  marginBottom: "16px",
};

const addProductTitle = {
  fontSize: "9px",
  fontWeight: "600",
  color: "#4b5563",
  marginBottom: "10px",
};

const productAddRow = {
  display: "flex",
  alignItems: "flex-end",
  gap: "10px",
};

const quantityGroup = {
  width: "105px",
  flexShrink: 0,
};

const addButton = {
  height: "38px",
  minWidth: "112px",
  padding: "7px 12px",
  border: "none",
  borderRadius: "5px",
  backgroundColor: "#4b6985",
  color: "#ffffff",
  fontSize: "9px",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "5px",
  boxShadow: "0 2px 5px rgba(75,105,133,0.18)",
};

const selectedProductPreview = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "10px",
  padding: "8px 10px",
  borderRadius: "5px",
  backgroundColor: "#f1f5f8",
};

const selectedProductIcon = {
  width: "27px",
  height: "27px",
  borderRadius: "5px",
  backgroundColor: "#e5edf3",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const selectedProductName = {
  fontSize: "9px",
  fontWeight: "600",
  color: "#374151",
};

const selectedProductDetails = {
  marginTop: "2px",
  fontSize: "8px",
  color: "#8a97a6",
};

const dot = {
  margin: "0 5px",
  color: "#c2c8ce",
};

const tableWrapper = {
  width: "100%",
  border: "1px solid #e1e5e9",
  borderRadius: "6px",
  overflow: "hidden",
};

const tableStyle = {
  marginBottom: 0,
  verticalAlign: "middle",
};

const tableHeader = {
  padding: "9px 10px",
  backgroundColor: "#f7f9fa",
  color: "#6b7280",
  fontSize: "8px",
  fontWeight: "600",
  borderBottom: "1px solid #e3e7ea",
  whiteSpace: "nowrap",
};

const tableCell = {
  padding: "9px 10px",
  fontSize: "9px",
  color: "#4b5563",
  borderColor: "#edf0f2",
};

const productCell = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
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

const productName = {
  fontSize: "9px",
  fontWeight: "600",
  color: "#374151",
};

const productSub = {
  marginTop: "1px",
  fontSize: "7px",
  color: "#a0a7af",
};

const quantityInput = {
  width: "65px",
  height: "30px",
  borderRadius: "4px",
  border: "1px solid #d5dbe1",
  fontSize: "9px",
  boxShadow: "none",
};

const taxBadge = {
  display: "inline-block",
  padding: "3px 6px",
  borderRadius: "4px",
  backgroundColor: "#f1f4f6",
  color: "#64748b",
  fontSize: "7px",
  fontWeight: "600",
};

const itemTotal = {
  color: "#374151",
  fontSize: "9px",
};

const deleteButton = {
  width: "27px",
  height: "27px",
  padding: 0,
  border: "1px solid #f0d2d2",
  borderRadius: "5px",
  backgroundColor: "#fff8f8",
  color: "#dc3545",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const emptyProducts = {
  minHeight: "125px",
  border: "1px dashed #d5dce2",
  borderRadius: "6px",
  backgroundColor: "#fafbfc",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

const emptyIcon = {
  width: "38px",
  height: "38px",
  borderRadius: "7px",
  backgroundColor: "#edf3f7",
  color: "#8a9aaa",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "7px",
};

const emptyTitle = {
  fontSize: "10px",
  fontWeight: "600",
  color: "#6b7280",
};

const emptyText = {
  marginTop: "3px",
  fontSize: "8px",
  color: "#9ca3af",
};


// =========================================================
// DISCOUNT
// =========================================================

const discountInputWrapper = {
  display: "flex",
  height: "38px",
};

const currencySymbol = {
  width: "31px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f7f9fa",
  border: "1px solid #d5dbe1",
  borderRight: "none",
  borderRadius: "5px 0 0 5px",
  color: "#64748b",
  fontSize: "10px",
};

const discountInput = {
  height: "38px",
  borderRadius: "0 5px 5px 0",
  border: "1px solid #d5dbe1",
  fontSize: "10px",
  boxShadow: "none",
};


// =========================================================
// SIDEBAR
// =========================================================

const sideColumn = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const sideCard = {
  backgroundColor: "#ffffff",
  border: "1px solid #e1e5e9",
  borderRadius: "7px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.025)",
};

const sideHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 14px",
  borderBottom: "1px solid #e7eaed",
};

const sideTitle = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#303b47",
};

const sideSubtitle = {
  marginTop: "2px",
  fontSize: "8px",
  color: "#9aa1aa",
};

const sideIcon = {
  width: "27px",
  height: "27px",
  borderRadius: "5px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


// =========================================================
// SUMMARY
// =========================================================

const summaryBody = {
  padding: "14px",
};

const invoiceSummaryTop = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  paddingBottom: "12px",
  borderBottom: "1px solid #eef1f3",
};

const summaryInvoiceIcon = {
  width: "35px",
  height: "35px",
  borderRadius: "6px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const summaryInvoiceNumber = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#374151",
};

const summaryInvoiceDate = {
  marginTop: "2px",
  fontSize: "8px",
  color: "#9aa1aa",
};

const summaryCustomer = {
  padding: "11px 0",
  borderBottom: "1px solid #eef1f3",
};

const summarySmallLabel = {
  fontSize: "7px",
  fontWeight: "700",
  letterSpacing: "0.7px",
  color: "#9aa1aa",
};

const summaryCustomerName = {
  marginTop: "3px",
  fontSize: "9px",
  fontWeight: "600",
  color: "#374151",
};

const summaryRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "6px 0",
  fontSize: "9px",
  color: "#7b8490",
};

const discountValue = {
  color: "#dc3545",
};

const summaryDivider = {
  height: "1px",
  backgroundColor: "#e9edf0",
  margin: "8px 0",
};

const grandTotalRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: "12px",
  fontWeight: "600",
  color: "#374151",
};


// =========================================================
// PAYMENT SUMMARY
// =========================================================

const paymentSummaryBody = {
  padding: "11px 14px 13px",
};

const paymentRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "6px 0",
  fontSize: "9px",
  color: "#8a929b",
};

const statusBadge = {
  padding: "3px 6px",
  borderRadius: "4px",
  fontSize: "7px",
  fontWeight: "600",
};


// =========================================================
// SIDE CUSTOMER
// =========================================================

const sideCustomerBody = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  padding: "13px 14px",
};

const sideCustomerAvatar = {
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

const sideCustomerName = {
  fontSize: "9px",
  fontWeight: "600",
  color: "#374151",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const sideCustomerPhone = {
  marginTop: "2px",
  fontSize: "8px",
  color: "#9aa1aa",
};


// =========================================================
// CHECKLIST
// =========================================================

const checklistBody = {
  padding: "13px 14px",
};

const checkItem = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  marginBottom: "9px",
  fontSize: "8px",
  color: "#6b7280",
};

const checkCircle = {
  width: "18px",
  height: "18px",
  borderRadius: "50%",
  backgroundColor: "#ecfdf5",
  color: "#047857",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};


// =========================================================
// NOTES
// =========================================================

const textareaStyle = {
  width: "100%",
  minHeight: "95px",
  border: "1px solid #d5dbe1",
  borderRadius: "5px",
  padding: "9px 11px",
  fontSize: "10px",
  color: "#374151",
  resize: "vertical",
  boxShadow: "none",
};


// =========================================================
// BOTTOM ACTION BAR
// =========================================================

const bottomBar = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "20px",
  padding: "13px 17px",
  marginBottom: "18px",
  border: "1px solid #e1e5e9",
  borderRadius: "7px",
  backgroundColor: "#ffffff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.025)",
};

const bottomTitle = {
  fontSize: "10px",
  fontWeight: "600",
  color: "#374151",
};

const bottomText = {
  marginTop: "2px",
  fontSize: "8px",
  color: "#9aa1aa",
};

const actionButtons = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
};

const cancelButton = {
  height: "34px",
  padding: "6px 13px",
  border: "1px solid #d2d8de",
  borderRadius: "5px",
  backgroundColor: "#ffffff",
  color: "#59636e",
  fontSize: "9px",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
  gap: "5px",
};

const updateButton = {
  height: "34px",
  padding: "6px 15px",
  border: "none",
  borderRadius: "5px",
  backgroundColor: "#4b6985",
  color: "#ffffff",
  fontSize: "9px",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  boxShadow: "0 2px 5px rgba(75,105,133,0.18)",
};


// =========================================================
// LOADING
// =========================================================

const loadingContainer = {
  minHeight: "70vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const loadingSpinner = {
  width: "44px",
  height: "44px",
  borderRadius: "7px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "10px",
};

const loadingTitle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#374151",
};

const loadingText = {
  marginTop: "4px",
  fontSize: "9px",
  color: "#9aa1aa",
};