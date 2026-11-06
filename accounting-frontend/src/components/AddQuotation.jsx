
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Form, Table } from "react-bootstrap";
import axios from "axios";
import {
  BsArrowLeft,
  BsFileEarmarkText,
  BsTrash,
  BsCheck2,
  BsReceipt,
  BsPerson,
  BsCart3,
  BsSearch,
} from "react-icons/bs";

const API_URL = import.meta.env.VITE_API_URL;

const today = new Date();
const todayString = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0"),
].join("-");

const defaultValidity = new Date();
defaultValidity.setDate(defaultValidity.getDate() + 30);
const validityString = [
  defaultValidity.getFullYear(),
  String(defaultValidity.getMonth() + 1).padStart(2, "0"),
  String(defaultValidity.getDate()).padStart(2, "0"),
].join("-");

const AddQuotation = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [date, setDate] = useState(todayString);
  const [validUntil, setValidUntil] = useState(validityString);
  const [customerId, setCustomerId] = useState("");

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [showProductOptions, setShowProductOptions] = useState(false);

  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

    const [quotationNumber, setQuotationNumber] = useState("");

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchNextQuotationNumber();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_URL}/customers`);
      setCustomers(res.data);
    } catch (error) {
      console.log("Customer error:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (error) {
      console.log("Product error:", error);
    }
  };

  const fetchNextQuotationNumber = async () => {
  try {
    const res = await axios.get(`${API_URL}/quotations/next-number`);
    setQuotationNumber(res.data.quotationNumber);
  } catch (error) {
    console.error("Quotation number fetch error:", error);
    setQuotationNumber("Unable to generate");
  }
};
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedCustomer = customers.find(
    (customer) => customer._id === customerId
  );

  // ADD PRODUCT
  // Quotations do not reserve or deduct stock.
  const addProduct = (productId, productQuantity) => {
    const product = products.find((p) => p._id === productId);
    const qty = Number(productQuantity);

    if (!product || !Number.isInteger(qty) || qty < 1) {
      return;
    }

    const price = Number(product.sellingPrice || 0);
    const tax = Number(product.tax || 0);

    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.productId === productId
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: qty,
                total: qty * item.price * (1 + item.tax / 100),
              }
            : item
        );
      }

      return [
        ...prevItems,
        {
          productId: product._id,
          productName: product.name,
          quantity: qty,
          price,
          tax,
          total: qty * price * (1 + tax / 100),
        },
      ];
    });
  };

  const removeItem = (productId) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId)
    );

    if (selectedProduct === productId) {
      setSelectedProduct("");
      setProductSearch("");
      setQuantity(1);
    }
  };

  // CALCULATIONS
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const taxAmount = items.reduce(
    (sum, item) =>
      sum + item.quantity * item.price * (item.tax / 100),
    0
  );

  const grandTotal = Math.max(
    0,
    subtotal + taxAmount - Number(discount || 0)
  );

  // SAVE QUOTATION
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Please add at least one product.");
      return;
    }

    if (grandTotal <= 0) {
      alert("Quotation total must be greater than zero.");
      return;
    }

    if (Number(discount || 0) > subtotal + taxAmount) {
      alert("Discount cannot be greater than the quotation amount.");
      return;
    }

    if (validUntil && validUntil < date) {
      alert("Validity date cannot be before the quotation date.");
      return;
    }

    const quotationData = {
      date,
      validUntil: validUntil || null,
      customerId: customerId || null,
      customerName: selectedCustomer?.name || "Walk-in Customer",
      customerPhone: selectedCustomer?.phone || "",
      customerAddress: selectedCustomer?.address || "",
      items,
      subtotal,
      taxAmount,
      discount: Number(discount || 0),
      grandTotal,
      notes,
    };

    try {
      setSaving(true);

      await axios.post(`${API_URL}/quotations`, quotationData);

      alert("Quotation created successfully!");
      navigate("/quotations");
    } catch (error) {
      console.log("Quotation save error:", error);

      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to create quotation."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{responsiveStyles}</style>

      <div style={pageStyle}>
        <div style={pageContainer}>

          {/* PAGE HEADER */}
          <div className="quotation-page-header" style={pageHeader}>
            <div>
              <div style={breadcrumb}>
                <span>Sales</span>
                <span style={breadcrumbSeparator}>/</span>
                <span style={breadcrumbCurrent}>Quotations</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                <h1 style={pageTitle}>Create Quotation</h1>
                <span style={quotationBadge}>New</span>
              </div>

              <p style={pageSubtitle}>
                Prepare a price quotation for your customer.
              </p>
            </div>

            <Link to="/quotations" style={backButton}>
              <BsArrowLeft size={14} />
              Back to Quotations
            </Link>
          </div>

          <Form onSubmit={handleSubmit}>
            <div className="quotation-main-layout" style={mainLayout}>

              {/* LEFT COLUMN */}
              <Card style={mainCard}>
                <div style={cardHeader}>
                  <div style={cardHeaderIcon}>
                    <BsReceipt size={17} />
                  </div>

                  <div>
                    <h2 style={cardTitle}>Quotation Information</h2>
                    <p style={cardSubtitle}>
                      Enter quotation, customer and product details.
                    </p>
                  </div>
                </div>

                <Card.Body style={cardBody}>

                  {/* QUOTATION DETAILS */}
                  <div style={sectionHeader}>
                    <div style={sectionTitle}>Quotation Details</div>
                    <div style={sectionDescription}>
                      Basic information about this quotation.
                    </div>
                  </div>

                  <div className="quotation-two-column" style={twoColumnRow}>
                    <Form.Group style={fieldStyle}>
                      <Form.Label style={labelStyle}>
                        Quotation Number
                      </Form.Label>

<Form.Control
  type="text"
  value={quotationNumber || "Loading..."}
  readOnly
  style={inputStyle}
/>

                      <div style={helpText}>
                        Your backend generates the quotation number when saved.
                      </div>
                    </Form.Group>

                    <Form.Group style={fieldStyle}>
                      <Form.Label style={labelStyle}>
                        Quotation Date
                      </Form.Label>

                      <Form.Control
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </Form.Group>
                  </div>

                  <div className="quotation-two-column" style={twoColumnRow}>
                    <Form.Group style={fieldStyle}>
                      <Form.Label style={labelStyle}>
                        Valid Until
                      </Form.Label>

                      <Form.Control
                        type="date"
                        value={validUntil}
                        min={date}
                        onChange={(e) => setValidUntil(e.target.value)}
                        style={inputStyle}
                      />

                      <div style={helpText}>
                        Default validity is 30 days.
                      </div>
                    </Form.Group>
                  </div>

                  <div style={sectionDivider} />

                  {/* CUSTOMER */}
                  <div style={sectionHeader}>
                    <div style={sectionTitle}>Customer Information</div>
                    <div style={sectionDescription}>
                      Select the customer for this quotation.
                    </div>
                  </div>

                  <Form.Group style={{ marginBottom: "16px" }}>
                    <Form.Label style={labelStyle}>Customer</Form.Label>

                    <Form.Select
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Walk-in Customer</option>

                      {customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name}
                          {customer.phone ? ` — ${customer.phone}` : ""}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

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
                          {selectedCustomer.phone || "No phone number"}
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

                  {/* PRODUCTS */}
                  <div style={sectionHeader}>
                    <div style={sectionTitle}>Products</div>
                    <div style={sectionDescription}>
                      Add products and quantities to this quotation.
                    </div>
                  </div>

                  <div
                    className="quotation-product-row"
                    style={productAddRow}
                  >
                    {/* PRODUCT SEARCH */}
                    <Form.Group
                      style={{
                        flex: 1,
                        minWidth: 0,
                        position: "relative",
                      }}
                    >
                      <Form.Label style={labelStyle}>Product</Form.Label>

                      <div style={{ position: "relative" }}>
                        <BsSearch
                          size={15}
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#7b8794",
                            zIndex: 1,
                            pointerEvents: "none",
                          }}
                        />

                        <Form.Control
                          type="text"
                          placeholder="Search products by name..."
                          value={productSearch}
                          onFocus={() => setShowProductOptions(true)}
                          onChange={(e) => {
                            setProductSearch(e.target.value);
                            setSelectedProduct("");
                            setShowProductOptions(true);
                          }}
                          style={{
                            ...inputStyle,
                            paddingLeft: "36px",
                            height: "42px",
                          }}
                        />
                      </div>

                      {showProductOptions && (
                        <>
                          <div
                            onClick={() => setShowProductOptions(false)}
                            style={{
                              position: "fixed",
                              inset: 0,
                              zIndex: 10,
                            }}
                          />

                          <div style={dropdownStyle}>
                            {filteredProducts.length > 0 ? (
                              filteredProducts.map((product) => (
                                <div
                                  key={product._id}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    setSelectedProduct(product._id);
                                    setProductSearch(product.name);
                                    setQuantity(1);
                                    setShowProductOptions(false);
                                    addProduct(product._id, 1);
                                  }}
                                  style={dropdownItem}
                                >
                                  <div style={dropdownProductName}>
                                    {product.name}
                                  </div>

                                  <div style={dropdownProductDetails}>
                                    Selling price: ₹
                                    {Number(product.sellingPrice || 0).toFixed(2)}
                                    {" • "}
                                    Stock: {Number(product.currentStock || 0)}
                                  </div>

                                  {Number(product.currentStock || 0) <= 0 && (
                                    <div style={outOfStockText}>
                                      Out of Stock — quotation is still allowed
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div style={noProducts}>
                                No matching products found
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </Form.Group>

                    {/* QUANTITY */}
                    <Form.Group style={{ width: "145px", flexShrink: 0 }}>
                      <Form.Label style={labelStyle}>Quantity</Form.Label>

                      <div style={quantityWrapper}>
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedProduct) return;

                            const next = Math.max(1, Number(quantity || 1) - 1);
                            setQuantity(next);
                            addProduct(selectedProduct, next);
                          }}
                          disabled={Number(quantity) <= 1}
                          style={quantityButton}
                        >
                          −
                        </button>

                        <Form.Control
                          type="number"
                          min="1"
                          step="1"
                          value={quantity}
                          onChange={(e) => {
                            const value = e.target.value;
                            setQuantity(value);

                            if (
                              selectedProduct &&
                              value !== "" &&
                              Number.isInteger(Number(value)) &&
                              Number(value) >= 1
                            ) {
                              addProduct(selectedProduct, Number(value));
                            }
                          }}
                          onBlur={() => {
                            if (!quantity || Number(quantity) < 1) {
                              setQuantity(1);

                              if (selectedProduct) {
                                addProduct(selectedProduct, 1);
                              }
                            }
                          }}
                          style={quantityInput}
                        />

                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedProduct) {
                              alert("Please select a product first.");
                              return;
                            }

                            const next = Number(quantity || 1) + 1;
                            setQuantity(next);
                            addProduct(selectedProduct, next);
                          }}
                          style={quantityButton}
                        >
                          +
                        </button>
                      </div>
                    </Form.Group>
                  </div>

                  <div style={stockInfo}>
                    <strong>Note:</strong> Adding products to a quotation does
                    not reserve or deduct stock. Stock changes only when a
                    quotation is converted into an invoice.
                  </div>

                  {/* ITEMS TABLE */}
                  {items.length > 0 ? (
                    <div style={itemsTableWrapper}>
                      <Table responsive hover style={{ marginBottom: 0 }}>
                        <thead>
                          <tr>
                            <th style={tableHeader}>Product</th>
                            <th style={{ ...tableHeader, textAlign: "center" }}>
                              Qty
                            </th>
                            <th style={{ ...tableHeader, textAlign: "right" }}>
                              Price
                            </th>
                            <th style={{ ...tableHeader, textAlign: "right" }}>
                              Tax
                            </th>
                            <th style={{ ...tableHeader, textAlign: "right" }}>
                              Total
                            </th>
                            <th style={{ ...tableHeader, textAlign: "center" }}>
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
                                  {item.productName}
                                </div>
                              </td>

                              <td style={{ ...tableCell, textAlign: "center" }}>
                                {item.quantity}
                              </td>

                              <td style={{ ...tableCell, textAlign: "right" }}>
                                ₹{Number(item.price).toFixed(2)}
                              </td>

                              <td style={{ ...tableCell, textAlign: "right" }}>
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
                                ₹{Number(item.total).toFixed(2)}
                              </td>

                              <td style={{ ...tableCell, textAlign: "center" }}>
                                <Button
                                  type="button"
                                  onClick={() => removeItem(item.productId)}
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

                      <div style={emptyTitle}>No products added</div>

                      <div style={emptyText}>
                        Select a product and quantity above to add it to the
                        quotation.
                      </div>
                    </div>
                  )}

                  <div style={sectionDivider} />

                  {/* NOTES */}
                  <Form.Group>
                    <Form.Label style={labelStyle}>Notes</Form.Label>

                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add optional quotation notes..."
                      style={textareaStyle}
                    />
                  </Form.Group>
                </Card.Body>

                {/* FOOTER */}
                <div className="quotation-footer" style={formFooter}>
                  <div>
                    <div style={footerTitle}>
                      Ready to create this quotation?
                    </div>
                    <div style={footerText}>
                      Review the details before saving.
                    </div>
                  </div>

                  <div
                    className="quotation-footer-actions"
                    style={footerActions}
                  >
                    <Button
                      type="button"
                      onClick={() => navigate("/quotations")}
                      style={cancelButton}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      disabled={saving}
                      style={saveButton}
                    >
                      <BsCheck2 size={15} />
                      {saving ? "Saving..." : "Save Quotation"}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* RIGHT COLUMN */}
              <div style={rightColumn}>
                <Card style={sideCard}>
                  <div style={sideCardHeader}>
                    <div style={sideHeaderIcon}>
                      <BsFileEarmarkText size={15} />
                    </div>

                    <div>
                      <h3 style={sideTitle}>Quotation Summary</h3>
                      <p style={sideSubtitle}>Review before saving.</p>
                    </div>
                  </div>

                  <div style={summaryBody}>
                    <div style={summaryInvoiceNumber}>New Quotation</div>
                    <div style={summaryDate}>
                      {new Date(`${date}T00:00:00`).toLocaleDateString("en-IN")}
                    </div>

                    <div style={summaryDivider} />

                    <div style={summaryRow}>
                      <span>Customer</span>
                      <strong>{selectedCustomer?.name || "Walk-in Customer"}</strong>
                    </div>

                    <div style={summaryRow}>
                      <span>Products</span>
                      <strong>{items.length}</strong>
                    </div>

                    <div style={summaryRow}>
                      <span>Validity</span>
                      <strong>
                        {validUntil
                          ? new Date(`${validUntil}T00:00:00`).toLocaleDateString(
                              "en-IN"
                            )
                          : "Not specified"}
                      </strong>
                    </div>

                    <div style={summaryRow}>
                      <span>Status</span>
                      <span style={draftBadge}>Draft</span>
                    </div>
                  </div>
                </Card>

                {/* AMOUNT SUMMARY */}
                <Card style={sideCard}>
                  <div style={sideCardHeader}>
                    <div style={sideHeaderIcon}>
                      <BsReceipt size={15} />
                    </div>

                    <div>
                      <h3 style={sideTitle}>Amount Summary</h3>
                      <p style={sideSubtitle}>Current quotation calculation.</p>
                    </div>
                  </div>

                  <div style={amountBody}>
                    <div style={amountRow}>
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>

                    <div style={amountRow}>
                      <span>Tax</span>
                      <span>₹{taxAmount.toFixed(2)}</span>
                    </div>

                    <div style={amountRow}>
                      <span>Discount</span>
                      <span>- ₹{Number(discount || 0).toFixed(2)}</span>
                    </div>

                    <div style={amountDivider} />

                    <div style={grandTotalRow}>
                      <span>Grand Total</span>
                      <strong>₹{grandTotal.toFixed(2)}</strong>
                    </div>
                  </div>
                </Card>

                {/* DISCOUNT */}
                <Card style={sideCard}>
                  <div style={sideCardHeader}>
                    <div>
                      <h3 style={sideTitle}>Discount</h3>
                      <p style={sideSubtitle}>Apply an optional discount.</p>
                    </div>
                  </div>

                  <div style={discountBody}>
                    <Form.Group>
                      <Form.Label style={labelStyle}>
                        Discount Amount
                      </Form.Label>

                      <div style={discountInputWrapper}>
                        <span style={currencyPrefix}>₹</span>

                        <Form.Control
                          type="number"
                          min="0"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          placeholder="0.00"
                          style={discountInput}
                        />
                      </div>
                    </Form.Group>
                  </div>
                </Card>

                {/* INFORMATION */}
                <Card style={sideCard}>
                  <div style={sideCardHeader}>
                    <div style={sideHeaderIcon}>
                      <BsReceipt size={15} />
                    </div>

                    <div>
                      <h3 style={sideTitle}>Important Information</h3>
                      <p style={sideSubtitle}>About this quotation.</p>
                    </div>
                  </div>

                  <div style={quickInfoBody}>
                    <div style={quickInfoRow}>
                      <span style={quickInfoLabel}>Stock</span>
                      <span style={quickInfoValue}>Not affected</span>
                    </div>

                    <div style={quickInfoRow}>
                      <span style={quickInfoLabel}>Payment</span>
                      <span style={quickInfoValue}>Not recorded</span>
                    </div>

                    <div style={quickInfoRow}>
                      <span style={quickInfoLabel}>Initial Status</span>
                      <span style={draftBadge}>Draft</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default AddQuotation;

/* PAGE */
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

/* HEADER */
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

const quotationBadge = {
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
};

/* LAYOUT */
const mainLayout = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 320px",
  gap: "22px",
  alignItems: "start",
};

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

/* SECTIONS */
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

/* FORM */
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
  minHeight: "95px",
  borderRadius: "6px",
  border: "1px solid #d6dce2",
  backgroundColor: "#ffffff",
  color: "#374151",
  fontSize: "10px",
  resize: "vertical",
  boxShadow: "none",
  width: "100%",
};

const helpText = {
  marginTop: "5px",
  fontSize: "10px",
  color: "#929ba6",
};

/* CUSTOMER */
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

/* PRODUCTS */
const productAddRow = {
  display: "flex",
  alignItems: "flex-end",
  gap: "12px",
  marginBottom: "13px",
};

const dropdownStyle = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  marginTop: "5px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  boxShadow: "0 8px 24px rgba(15,27,45,0.12)",
  maxHeight: "240px",
  overflowY: "auto",
  zIndex: 11,
};

const dropdownItem = {
  padding: "10px 12px",
  cursor: "pointer",
  borderBottom: "1px solid #f1f3f6",
};

const dropdownProductName = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#263548",
};

const dropdownProductDetails = {
  fontSize: "12px",
  color: "#64748b",
  marginTop: "3px",
};

const outOfStockText = {
  fontSize: "11px",
  color: "#c0392b",
  fontWeight: "600",
  marginTop: "3px",
};

const noProducts = {
  padding: "16px 12px",
  textAlign: "center",
  fontSize: "13px",
  color: "#64748b",
};

const quantityWrapper = {
  display: "flex",
  alignItems: "center",
  height: "42px",
  border: "1px solid #d7dee8",
  borderRadius: "8px",
  overflow: "hidden",
  background: "#ffffff",
};

const quantityButton = {
  width: "35px",
  height: "100%",
  border: "none",
  background: "#f8fafb",
  color: "#596574",
  fontSize: "18px",
  cursor: "pointer",
};

const quantityInput = {
  border: "none",
  borderRadius: 0,
  boxShadow: "none",
  textAlign: "center",
  padding: "0 2px",
  minWidth: 0,
  height: "100%",
  fontSize: "14px",
  fontWeight: 600,
};

const stockInfo = {
  marginBottom: "17px",
  padding: "10px 12px",
  border: "1px solid #d9e4ec",
  borderRadius: "6px",
  backgroundColor: "#f5f9fc",
  color: "#4b6985",
  fontSize: "11px",
  lineHeight: 1.6,
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

/* RIGHT COLUMN */
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

const draftBadge = {
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

/* FOOTER */
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

/* RESPONSIVE */
const responsiveStyles = `
  @media (max-width: 1050px) {
    .quotation-main-layout {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 700px) {
    .quotation-page-header {
      align-items: flex-start !important;
      flex-direction: column !important;
    }

    .quotation-two-column {
      grid-template-columns: 1fr !important;
    }

    .quotation-product-row {
      flex-direction: column !important;
      align-items: stretch !important;
    }

    .quotation-product-row > div {
      width: 100% !important;
    }

    .quotation-footer {
      align-items: flex-start !important;
      flex-direction: column !important;
    }

    .quotation-footer-actions {
      width: 100%;
    }

    .quotation-footer-actions button {
      flex: 1;
    }
  }
`;
