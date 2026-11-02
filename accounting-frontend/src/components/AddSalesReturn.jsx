
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Form, Table, Spinner } from "react-bootstrap";
import axios from "axios";
import {
  BsArrowLeft,
  BsReceipt,
  BsCheck2,
  BsCart3,
  BsPerson,
  BsCreditCard,
  BsFileEarmarkText,
} from "react-icons/bs";

export const AddSalesReturn = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [invoices, setInvoices] = useState([]);
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [returnNumber, setReturnNumber] = useState("");
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [items, setItems] = useState([]);
  const [refundMethod, setRefundMethod] = useState("Cash");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const reasons = [
    "Damaged Product",
    "Defective Product",
    "Wrong Product",
    "Customer Changed Mind",
    "Expired Product",
    "Other",
  ];

  useEffect(() => {
    fetchInvoices();
    generateReturnNumber();
  }, []);

  // FETCH INVOICES
  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API_URL}/invoices`);

      setInvoices(
        Array.isArray(res.data)
          ? res.data
          : res.data.invoices || []
      );
    } catch (error) {
      console.log("Invoice fetching error:", error);
      alert("Failed to load invoices.");
    }
  };

  // GENERATE RETURN NUMBER
  const generateReturnNumber = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/sales-returns/next-number`
      );

      setReturnNumber(res.data.returnNumber);
    } catch (error) {
      console.log("Return number error:", error);
    }
  };

  // FETCH RETURNABLE ITEMS
  const handleInvoiceChange = async (id) => {
    setInvoiceId(id);
    setInvoiceDetails(null);
    setItems([]);

    if (!id) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/invoices/${id}/returnable-items`
      );

      setInvoiceDetails(res.data);

      const availableItems = res.data.items
        .filter((item) => item.remainingQuantity > 0)
        .map((item) => ({
          ...item,
          returnQuantity: 0,
          condition: "Good",
          reason: "Customer Changed Mind",
        }));

      setItems(availableItems);
    } catch (error) {
      console.log("Returnable items error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to load returnable products."
      );
    } finally {
      setLoading(false);
    }
  };

  // UPDATE RETURN ITEM
  const updateItem = (productId, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  // ESTIMATED RETURN VALUE BEFORE INVOICE DISCOUNT
  const estimatedReturnValue = items.reduce((sum, item) => {
    const quantity = Number(item.returnQuantity || 0);

    return (
      sum +
      quantity *
        Number(item.price) *
        (1 + Number(item.tax || 0) / 100)
    );
  }, 0);

  const selectedItems = items.filter(
    (item) => Number(item.returnQuantity) > 0
  );

  const selectedInvoice = invoices.find(
    (invoice) => invoice._id === invoiceId
  );

  // SAVE SALES RETURN
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!invoiceId) {
      alert("Please select an invoice.");
      return;
    }

    if (selectedItems.length === 0) {
      alert("Please select at least one product to return.");
      return;
    }

    for (const item of selectedItems) {
      const quantity = Number(item.returnQuantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > item.remainingQuantity
      ) {
        alert(
          `Please enter a valid return quantity for ${item.productName}.`
        );
        return;
      }

      if (!item.condition || !item.reason) {
        alert("Please select the condition and reason for every returned product.");
        return;
      }
    }

    if (
      refundMethod === "Customer Credit" &&
      !invoiceDetails?.customerId
    ) {
      alert(
        "Customer Credit is only available for registered customers. Please select Cash for a Walk-in Customer."
      );
      return;
    }

    const returnData = {
      invoiceId,
      returnDate,
      items: selectedItems.map((item) => ({
        productId: item.productId,
        returnQuantity: Number(item.returnQuantity),
        condition: item.condition,
        reason: item.reason,
      })),
      refundMethod,
      notes,
    };

    try {
      setSaving(true);

      await axios.post(
        `${API_URL}/sales-returns`,
        returnData
      );

      alert("Sales return created successfully!");
      navigate("/sales-returns");
    } catch (error) {
      console.log("Sales return save error:", error);

      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to create sales return."
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

          <div className="return-page-header" style={pageHeader}>
            <div>
              <div style={breadcrumb}>
                <span>Sales</span>
                <span style={breadcrumbSeparator}>/</span>
                <span>Sales Returns</span>
                <span style={breadcrumbSeparator}>/</span>
                <span style={breadcrumbCurrent}>New Return</span>
              </div>

              <div style={titleWrapper}>
                <h1 style={pageTitle}>Create Sales Return</h1>
                <span style={returnBadge}>New</span>
              </div>

              <p style={pageSubtitle}>
                Record products returned against an existing sales invoice.
              </p>
            </div>

            <Link to="/sales-returns" style={backButton}>
              <BsArrowLeft size={14} />
              Back to Sales Returns
            </Link>
          </div>

          <Form onSubmit={handleSubmit}>
            <div className="return-main-layout" style={mainLayout}>

              {/* LEFT COLUMN */}

              <Card style={mainCard}>
                <div style={cardHeader}>
                  <div style={cardHeaderIcon}>
                    <BsReceipt size={17} />
                  </div>

                  <div>
                    <h2 style={cardTitle}>Return Information</h2>
                    <p style={cardSubtitle}>
                      Select an invoice and enter the returned products.
                    </p>
                  </div>
                </div>

                <Card.Body style={cardBody}>

                  {/* RETURN DETAILS */}

                  <div style={sectionHeader}>
                    <div style={sectionTitle}>Return Details</div>
                    <div style={sectionDescription}>
                      Basic information about this sales return.
                    </div>
                  </div>

                  <div className="return-two-column" style={twoColumnRow}>
                    <Form.Group style={fieldStyle}>
                      <Form.Label style={labelStyle}>
                        Return Number
                      </Form.Label>

                      <Form.Control
                        value={returnNumber}
                        readOnly
                        style={{
                          ...inputStyle,
                          backgroundColor: "#f8fafb",
                        }}
                      />
                      <div style={helpText}>
                        Automatically generated return number.
                      </div>
                    </Form.Group>

                    <Form.Group style={fieldStyle}>
                      <Form.Label style={labelStyle}>
                        Return Date
                      </Form.Label>

                      <Form.Control
                        type="date"
                        value={returnDate}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setReturnDate(e.target.value)}
                        style={inputStyle}
                        required
                      />
                    </Form.Group>
                  </div>

                  <div style={sectionDivider} />

                  {/* INVOICE SELECTION */}

                  <div style={sectionHeader}>
                    <div style={sectionTitle}>Original Invoice</div>
                    <div style={sectionDescription}>
                      Select the invoice against which products are being returned.
                    </div>
                  </div>

                  <Form.Group style={fieldStyle}>
                    <Form.Label style={labelStyle}>
                      Select Invoice <span style={required}>*</span>
                    </Form.Label>

                    <Form.Select
                      value={invoiceId}
                      onChange={(e) => handleInvoiceChange(e.target.value)}
                      style={inputStyle}
                      required
                    >
                      <option value="">Select an invoice</option>

                      {invoices.map((invoice) => (
                        <option key={invoice._id} value={invoice._id}>
                          {invoice.invoiceNumber} — {invoice.customerName}
                        </option>
                      ))}
                    </Form.Select>

                    <div style={helpText}>
                      Only products from the selected invoice can be returned.
                    </div>
                  </Form.Group>

                  {/* CUSTOMER PREVIEW */}

                  {invoiceDetails && (
                    <div style={customerPreview}>
                      <div style={customerIcon}>
                        <BsPerson size={16} />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={customerName}>
                          {invoiceDetails.customerName}
                        </div>

                        <div style={customerDetails}>
                          {invoiceDetails.customerId
                            ? "Registered Customer"
                            : "Walk-in Customer"}
                        </div>
                      </div>

                      <div style={invoicePreview}>
                        {invoiceDetails.invoiceNumber}
                      </div>
                    </div>
                  )}

                  <div style={sectionDivider} />

                  {/* PRODUCTS */}

                  <div style={sectionHeader}>
                    <div style={sectionTitle}>Returned Products</div>
                    <div style={sectionDescription}>
                      Enter the quantity, condition and reason for each returned product.
                    </div>
                  </div>

                  {loading ? (
                    <div style={loadingBox}>
                      <Spinner animation="border" size="sm" />
                      <span>Loading returnable products...</span>
                    </div>
                  ) : invoiceId && items.length === 0 ? (
                    <div style={emptyProducts}>
                      <div style={emptyIcon}>
                        <BsCart3 size={19} />
                      </div>
                      <div style={emptyTitle}>
                        No returnable products
                      </div>
                      <div style={emptyText}>
                        All products on this invoice have already been returned.
                      </div>
                    </div>
                  ) : !invoiceId ? (
                    <div style={emptyProducts}>
                      <div style={emptyIcon}>
                        <BsReceipt size={19} />
                      </div>
                      <div style={emptyTitle}>
                        No invoice selected
                      </div>
                      <div style={emptyText}>
                        Select an invoice to see its returnable products.
                      </div>
                    </div>
                  ) : (
                    <div style={itemsTableWrapper}>
                      <Table responsive hover style={{ marginBottom: 0 }}>
                        <thead>
                          <tr>
                            <th style={tableHeader}>Product</th>
                            <th style={tableHeaderCenter}>Available</th>
                            <th style={tableHeaderCenter}>Return Qty</th>
                            <th style={tableHeader}>Condition</th>
                            <th style={tableHeader}>Reason</th>
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
                                  <div>
                                    <div style={productName}>
                                      {item.productName}
                                    </div>
                                    <div style={productPrice}>
                                      ₹{Number(item.price).toFixed(2)} · {item.tax}% GST
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td style={tableCellCenter}>
                                {item.remainingQuantity}
                              </td>

                              <td style={tableCellCenter}>
                                <Form.Control
                                  type="number"
                                  min="0"
                                  max={item.remainingQuantity}
                                  step="1"
                                  value={item.returnQuantity}
                                  onChange={(e) => {
                                    const value = e.target.value;

                                    if (
                                      value === "" ||
                                      (Number.isInteger(Number(value)) &&
                                        Number(value) >= 0 &&
                                        Number(value) <= item.remainingQuantity)
                                    ) {
                                      updateItem(
                                        item.productId,
                                        "returnQuantity",
                                        value
                                      );
                                    }
                                  }}
                                  style={quantityInput}
                                />
                              </td>

                              <td style={tableCell}>
                                <Form.Select
                                  value={item.condition}
                                  onChange={(e) =>
                                    updateItem(
                                      item.productId,
                                      "condition",
                                      e.target.value
                                    )
                                  }
                                  style={smallSelect}
                                >
                                  <option value="Good">Good</option>
                                  <option value="Damaged">Damaged</option>
                                  <option value="Defective">Defective</option>
                                </Form.Select>
                              </td>

                              <td style={tableCell}>
                                <Form.Select
                                  value={item.reason}
                                  onChange={(e) =>
                                    updateItem(
                                      item.productId,
                                      "reason",
                                      e.target.value
                                    )
                                  }
                                  style={smallSelect}
                                >
                                  {reasons.map((reason) => (
                                    <option key={reason} value={reason}>
                                      {reason}
                                    </option>
                                  ))}
                                </Form.Select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}

                  <div style={sectionDivider} />

                  {/* REFUND INFORMATION */}

                  <div style={sectionHeader}>
                    <div style={sectionTitle}>Refund Information</div>
                    <div style={sectionDescription}>
                      Select how the customer's refund should be handled.
                    </div>
                  </div>

                  <div className="return-two-column" style={twoColumnRow}>
                    <Form.Group style={fieldStyle}>
                      <Form.Label style={labelStyle}>
                        Refund Method <span style={required}>*</span>
                      </Form.Label>

                      <Form.Select
                        value={refundMethod}
                        onChange={(e) => setRefundMethod(e.target.value)}
                        style={inputStyle}
                      >
                        <option value="Cash">Cash</option>
                        <option
                          value="Customer Credit"
                          disabled={!invoiceDetails?.customerId}
                        >
                          Customer Credit
                        </option>
                      </Form.Select>

                      <div style={helpText}>
                        {invoiceDetails?.customerId
                          ? "Cash or credit can be selected."
                          : "Walk-in customers can receive cash refunds only."}
                      </div>
                    </Form.Group>
                  </div>

                  <Form.Group style={{ marginTop: "5px" }}>
                    <Form.Label style={labelStyle}>Notes</Form.Label>

                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add optional return notes..."
                      style={textareaStyle}
                    />
                  </Form.Group>

                </Card.Body>

                {/* FOOTER */}

                <div className="return-footer" style={formFooter}>
                  <div>
                    <div style={footerTitle}>
                      Ready to create this return?
                    </div>
                    <div style={footerText}>
                      Review the returned quantities before saving.
                    </div>
                  </div>

                  <div className="return-footer-actions" style={footerActions}>
                    <Button
                      type="button"
                      onClick={() => navigate("/sales-returns")}
                      style={cancelButton}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      disabled={saving || loading || selectedItems.length === 0}
                      style={saveButton}
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <BsCheck2 size={15} />
                          Save Return
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* RIGHT COLUMN */}

              <div style={rightColumn}>

                {/* RETURN SUMMARY */}

                <Card style={sideCard}>
                  <div style={sideCardHeader}>
                    <div style={sideHeaderIcon}>
                      <BsFileEarmarkText size={15} />
                    </div>

                    <div>
                      <h3 style={sideTitle}>Return Summary</h3>
                      <p style={sideSubtitle}>
                        Review the return details.
                      </p>
                    </div>
                  </div>

                  <div style={summaryBody}>
                    <div style={summaryInvoiceNumber}>
                      {returnNumber || "SR-01"}
                    </div>

                    <div style={summaryDate}>{returnDate}</div>

                    <div style={summaryDivider} />

                    <div style={summaryRow}>
                      <span>Invoice</span>
                      <strong>
                        {invoiceDetails?.invoiceNumber || "Not selected"}
                      </strong>
                    </div>

                    <div style={summaryRow}>
                      <span>Customer</span>
                      <strong>
                        {invoiceDetails?.customerName || "Not selected"}
                      </strong>
                    </div>

                    <div style={summaryRow}>
                      <span>Products</span>
                      <strong>{selectedItems.length}</strong>
                    </div>

                    <div style={summaryRow}>
                      <span>Refund Method</span>
                      <strong>{refundMethod}</strong>
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
                      <p style={sideSubtitle}>
                        Estimated returned product value.
                      </p>
                    </div>
                  </div>

                  <div style={amountBody}>
                    <div style={amountRow}>
                      <span>Selected Products</span>
                      <span>{selectedItems.length}</span>
                    </div>

                    <div style={amountRow}>
                      <span>Return Quantity</span>
                      <span>
                        {selectedItems.reduce(
                          (sum, item) => sum + Number(item.returnQuantity),
                          0
                        )}
                      </span>
                    </div>

                    <div style={amountDivider} />

                    <div style={grandTotalRow}>
                      <span>Estimated Value</span>
                      <strong>
                        ₹{estimatedReturnValue.toFixed(2)}
                      </strong>
                    </div>

                    <div style={helpText}>
                      Final refund is calculated by the backend after allocating the original invoice discount and outstanding balance.
                    </div>
                  </div>
                </Card>

                {/* STOCK INFORMATION */}

                <Card style={sideCard}>
                  <div style={sideCardHeader}>
                    <div style={sideHeaderIcon}>
                      <BsCart3 size={15} />
                    </div>

                    <div>
                      <h3 style={sideTitle}>Stock Information</h3>
                      <p style={sideSubtitle}>
                        How returned products affect inventory.
                      </p>
                    </div>
                  </div>

                  <div style={quickInfoBody}>
                    <div style={stockInfo}>
                      <strong>Good</strong>
                      <span>Added back to stock</span>
                    </div>

                    <div style={stockInfo}>
                      <strong>Damaged</strong>
                      <span>Not added to stock</span>
                    </div>

                    <div style={stockInfo}>
                      <strong>Defective</strong>
                      <span>Not added to stock</span>
                    </div>
                  </div>
                </Card>

                {/* REFUND INFORMATION */}

                <Card style={sideCard}>
                  <div style={sideCardHeader}>
                    <div style={sideHeaderIcon}>
                      <BsCreditCard size={15} />
                    </div>

                    <div>
                      <h3 style={sideTitle}>Refund Information</h3>
                      <p style={sideSubtitle}>
                        Important refund rules.
                      </p>
                    </div>
                  </div>

                  <div style={quickInfoBody}>
                    <p style={infoText}>
                      Any outstanding invoice balance is settled first using the return value.
                    </p>
                    <p style={infoText}>
                      Only the remaining amount is refunded through Cash or Customer Credit.
                    </p>
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

const titleWrapper = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
};

const pageTitle = {
  margin: 0,
  fontSize: "22px",
  fontWeight: "650",
  color: "#29323d",
};

const returnBadge = {
  padding: "4px 8px",
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
  padding: "24px",
};

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

const helpText = {
  marginTop: "5px",
  fontSize: "10px",
  color: "#929ba6",
  lineHeight: 1.6,
};

const textareaStyle = {
  minHeight: "95px",
  borderRadius: "6px",
  border: "1px solid #d6dce2",
  fontSize: "11px",
  resize: "vertical",
  boxShadow: "none",
};

const customerPreview = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "11px 13px",
  border: "1px solid #dfe5ea",
  borderRadius: "6px",
  backgroundColor: "#f8fafb",
  marginTop: "14px",
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

const invoicePreview = {
  marginLeft: "auto",
  fontSize: "11px",
  fontWeight: "650",
  color: "#4b6985",
};

const itemsTableWrapper = {
  border: "1px solid #e1e6eb",
  borderRadius: "7px",
  overflow: "hidden",
};

const tableHeader = {
  padding: "10px",
  backgroundColor: "#f8fafb",
  borderBottom: "1px solid #dfe5ea",
  color: "#687483",
  fontSize: "9px",
  fontWeight: "700",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const tableHeaderCenter = {
  ...tableHeader,
  textAlign: "center",
};

const tableCell = {
  padding: "10px",
  borderBottom: "1px solid #edf0f2",
  verticalAlign: "middle",
  fontSize: "11px",
  color: "#596574",
};

const tableCellCenter = {
  ...tableCell,
  textAlign: "center",
};

const productCell = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  minWidth: "140px",
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
  fontSize: "11px",
  fontWeight: "600",
  color: "#374151",
};

const productPrice = {
  marginTop: "3px",
  fontSize: "9px",
  color: "#929ba6",
};

const quantityInput = {
  width: "75px",
  height: "34px",
  margin: "auto",
  borderRadius: "5px",
  fontSize: "11px",
  textAlign: "center",
  padding: "4px",
};

const smallSelect = {
  minWidth: "125px",
  height: "34px",
  borderRadius: "5px",
  fontSize: "10px",
  padding: "4px 23px 4px 7px",
};

const loadingBox = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "10px",
  padding: "35px",
  color: "#687483",
  fontSize: "12px",
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
  fontSize: "12px",
  color: "#303844",
};

const quickInfoBody = {
  padding: "13px 17px",
};

const stockInfo = {
  display: "flex",
  flexDirection: "column",
  gap: "3px",
  padding: "8px 0",
  borderBottom: "1px solid #f0f2f4",
  fontSize: "10px",
  color: "#7d8792",
};

const infoText = {
  fontSize: "10px",
  color: "#7d8792",
  lineHeight: 1.7,
  marginBottom: "8px",
};

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
};

const responsiveStyles = `
  @media (max-width: 1050px) {
    .return-main-layout {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 700px) {
    .return-page-header {
      align-items: flex-start !important;
      flex-direction: column !important;
    }

    .return-two-column {
      grid-template-columns: 1fr !important;
    }

    .return-footer {
      align-items: flex-start !important;
      flex-direction: column !important;
    }

    .return-footer-actions {
      width: 100%;
    }

    .return-footer-actions button {
      flex: 1;
    }
  }
`;

export default AddSalesReturn;
