import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import {
  BsArrowLeft,
  BsPlusLg,
  BsTrash3,
  BsBagCheck,
  BsBuilding,
  BsBoxSeam,
  BsCurrencyRupee,
  BsCalendar3,
  BsCheckCircle,
  BsWallet2,
} from "react-icons/bs";

const API = import.meta.env.VITE_API_URL;

const initialItem = {
  productId: "",
  quantity: "1",
  purchasePrice: "",
  productSearch:"",
};

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") {
    return value._id || value.id || "";
  }
  return value;
};

const getToday = () =>
  new Date(
    Date.now() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);

const EditPurchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [supplierId, setSupplierId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [items, setItems] = useState([{ ...initialItem }]);
  const [amountPaid, setAmountPaid] = useState("0");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [supplierResponse, productResponse, purchaseResponse] =
          await Promise.all([
            axios.get(`${API}/suppliers`),
            axios.get(`${API}/products`),
            axios.get(`${API}/purchases/${id}`),
          ]);

        const supplierData = Array.isArray(supplierResponse.data)
          ? supplierResponse.data
          : supplierResponse.data?.suppliers || [];

        const productData = Array.isArray(productResponse.data)
          ? productResponse.data
          : productResponse.data?.products || [];

        const purchaseData =
          purchaseResponse.data?.purchase || purchaseResponse.data;

        setSuppliers(supplierData);
        setProducts(productData);

        setSupplierId(getId(purchaseData.supplierId));

        const savedDate = purchaseData.purchaseDate
          ? new Date(purchaseData.purchaseDate)
          : new Date();

        setPurchaseDate(
          Number.isNaN(savedDate.getTime())
            ? getToday()
            : new Date(
                savedDate.getTime() -
                  savedDate.getTimezoneOffset() * 60000
              )
                .toISOString()
                .slice(0, 10)
        );

        const savedItems = Array.isArray(purchaseData.items)
          ? purchaseData.items.map((item) => ({
              productId: getId(item.productId),
              quantity: String(item.quantity ?? 1),
              purchasePrice: String(item.purchasePrice ?? 0),
            }))
          : [];

        setItems(
          savedItems.length ? savedItems : [{ ...initialItem }]
        );

        setAmountPaid(String(purchaseData.amountPaid ?? 0));
        setNotes(purchaseData.notes || "");
      } catch (err) {
        console.error("Failed to load purchase:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load this purchase. Please check the purchase ID and API."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id]);

  const calculatedItems = useMemo(
    () =>
      items.map((item) => {
        const product = products.find(
          (p) => p._id === item.productId
        );

        const quantity = Number(item.quantity) || 0;
        const purchasePrice = Number(item.purchasePrice) || 0;

        return {
          ...item,
          product,
          quantity,
          purchasePrice,
          total: quantity * purchasePrice,
        };
      }),
    [items, products]
  );

  const grandTotal = useMemo(
    () =>
      calculatedItems.reduce((sum, item) => sum + item.total, 0),
    [calculatedItems]
  );

  const paidAmount = Number(amountPaid) || 0;
  const balance = Math.max(grandTotal - paidAmount, 0);

  const paymentStatus =
    paidAmount <= 0
      ? "Unpaid"
      : paidAmount >= grandTotal
        ? "Paid"
        : "Partially Paid";

  const updateItem = (index, field, value) => {
    setItems((previous) =>
      previous.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };
const handleProductChange = (index, productId) => {
  const selectedProduct = products.find(
    (product) => product._id === productId
  );

  setItems((previous) =>
    previous.map((item, i) =>
      i === index
        ? {
            ...item,
            productId,
            productSearch: selectedProduct
              ? `${selectedProduct.name} (${selectedProduct.code || "N/A"})`
              : "",
            purchasePrice:
              selectedProduct?.purchasePrice != null
                ? String(selectedProduct.purchasePrice)
                : "",
          }
        : item
    )
  );
};

  const addItem = () => {
    setItems((previous) => [
      ...previous,
      { ...initialItem },
    ]);
  };

  const removeItem = (index) => {
    setItems((previous) => {
      if (previous.length === 1) return previous;
      return previous.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!supplierId) {
      setError("Please select a supplier.");
      return;
    }

    if (!purchaseDate) {
      setError("Please select a purchase date.");
      return;
    }

    if (!items.length || items.some((item) => !item.productId)) {
      setError("Please select a product for every item row.");
      return;
    }

    if (
      items.some(
        (item) =>
          !Number.isInteger(Number(item.quantity)) ||
          Number(item.quantity) <= 0
      )
    ) {
      setError("Each product quantity must be a positive whole number.");
      return;
    }

    if (
      items.some(
        (item) =>
          item.purchasePrice === "" ||
          !Number.isFinite(Number(item.purchasePrice)) ||
          Number(item.purchasePrice) < 0
      )
    ) {
      setError("Please enter a valid purchase price for every product.");
      return;
    }

    const productIds = items.map((item) => item.productId);

    if (new Set(productIds).size !== productIds.length) {
      setError(
        "A product has been selected more than once. Please combine its quantity into one row."
      );
      return;
    }

    if (
      amountPaid === "" ||
      !Number.isFinite(Number(amountPaid)) ||
      Number(amountPaid) < 0 ||
      Number(amountPaid) > grandTotal
    ) {
      setError(
        "Amount paid must be between zero and the purchase total."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        supplierId,
        purchaseDate,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          purchasePrice: Number(item.purchasePrice),
        })),
        amountPaid: Number(amountPaid),
        notes: notes.trim(),
      };

      await axios.put(`${API}/purchases/${id}`, payload);

      navigate("/purchases", {
        state: {
          success: "Purchase updated successfully.",
        },
      });
    } catch (err) {
      console.error("Failed to update purchase:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update purchase. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-purchase-page purchase-loading">
        <style>{styles}</style>
        <Spinner animation="border" />
        <p>Loading purchase details...</p>
      </div>
    );
  }

  return (
    <div className="edit-purchase-page">
      <style>{styles}</style>

      <div className="purchase-page-header">
        <div className="purchase-heading">
          <button
            type="button"
            className="purchase-back-button"
            onClick={() => navigate("/purchases")}
            aria-label="Back to purchases"
          >
            <BsArrowLeft />
          </button>

          <div>
            <h2>Edit Purchase</h2>
            <p>Update supplier, products and payment details.</p>
          </div>
        </div>

        <span className="purchase-edit-label">
          <BsBagCheck />
          Edit Mode
        </span>
      </div>

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success">{success}</Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* PURCHASE INFORMATION */}
        <Card className="purchase-section-card">
          <Card.Body>
            <div className="purchase-section-heading">
              <span className="purchase-section-icon">
                <BsBuilding />
              </span>
              <div>
                <h5>Purchase Information</h5>
                <p>Supplier and purchase date</p>
              </div>
            </div>

            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="purchase-label">
                  Supplier <span>*</span>
                </Form.Label>

                <Form.Select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  required
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option
                      key={supplier._id}
                      value={supplier._id}
                    >
                      {supplier.supplierName ||
                        supplier.companyName ||
                        "Unnamed supplier"}
                      {supplier.companyName &&
                      supplier.supplierName
                        ? ` — ${supplier.companyName}`
                        : ""}
                    </option>
                  ))}
                </Form.Select>

                {suppliers.length === 0 && (
                  <small className="purchase-help">
                    No suppliers found. Add a supplier first.
                  </small>
                )}
              </Col>

              <Col md={6}>
                <Form.Label className="purchase-label">
                  Purchase Date <span>*</span>
                </Form.Label>

                <div className="purchase-input-icon">
                  <BsCalendar3 />
                  <Form.Control
                    type="date"
                    value={purchaseDate}
                    onChange={(e) =>
                      setPurchaseDate(e.target.value)
                    }
                    required
                  />
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* PURCHASE ITEMS */}
        <Card className="purchase-section-card">
          <Card.Body>
            <div className="purchase-section-heading purchase-items-heading">
              <div className="purchase-heading-left">
                <span className="purchase-section-icon">
                  <BsBoxSeam />
                </span>
                <div>
                  <h5>Purchase Items</h5>
                  <p>Modify products, quantities and purchase prices.</p>
                </div>
              </div>

              <Button
                type="button"
                className="purchase-add-button"
                onClick={addItem}
              >
                <BsPlusLg /> Add Item
              </Button>
            </div>

            {products.length === 0 && (
              <Alert variant="warning">
                No products found. Add products before editing this purchase.
              </Alert>
            )}

            <div className="purchase-items-list">
              {calculatedItems.map((item, index) => (
                <div className="purchase-item-row" key={index}>
                  <div className="purchase-item-top">
                    <span className="purchase-item-number">
                      Item {index + 1}
                    </span>

                    <button
                      type="button"
                      className="purchase-remove-button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      title="Remove item"
                      aria-label={`Remove item ${index + 1}`}
                    >
                      <BsTrash3 />
                    </button>
                  </div>

                  <Row className="g-3">
                    <Col lg={5} md={12}>
                      <Form.Label className="purchase-label">
                        Product <span>*</span>
                      </Form.Label>


<Form.Control
  type="text"
  placeholder="Search by product name or code..."
  value={item.productSearch || ""}
  onChange={(e) => {
    const value = e.target.value;

    setItems((previous) =>
      previous.map((existing, i) =>
        i === index
          ? {
              ...existing,
              productSearch: value,
              productId: "",
              purchasePrice: "",
            }
          : existing
      )
    );
  }}
  className="purchase-input"
  autoComplete="off"
  required
/>

{item.productSearch?.trim() && !item.productId && (
  <div
    style={{
      marginTop: "6px",
      border: "1px solid #dce3eb",
      borderRadius: "8px",
      background: "#fff",
      maxHeight: "200px",
      overflowY: "auto",
    }}
  >
    {products
      .filter((product) =>
        `${product.name || ""} ${product.code || ""}`
          .toLowerCase()
          .includes(item.productSearch.toLowerCase().trim())
      )
      .filter(
        (product) =>
          !items.some(
            (existing, existingIndex) =>
              existing.productId === product._id &&
              existingIndex !== index
          )
      )
      .map((product) => (
        <button
          key={product._id}
          type="button"
          onClick={() =>
            handleProductChange(index, product._id)
          }
          style={{
            display: "block",
            width: "100%",
            padding: "10px 12px",
            border: "none",
            borderBottom: "1px solid #edf0f4",
            background: "#fff",
            textAlign: "left",
            cursor: "pointer",
            color: "#26394f",
            fontSize: "12px",
          }}
        >
          <strong>{product.name}</strong>
          <div style={{ color: "#8793a3", marginTop: "3px" }}>
            Code: {product.code || "N/A"}
          </div>
        </button>
      ))}

    {products.filter((product) =>
      `${product.name || ""} ${product.code || ""}`
        .toLowerCase()
        .includes(item.productSearch.toLowerCase().trim())
    ).length === 0 && (
      <div style={{ padding: "12px", color: "#8793a3" }}>
        No matching products found.
      </div>
    )}
  </div>
)}

                    </Col>

                    <Col lg={2} sm={4}>
                      <Form.Label className="purchase-label">
                        Quantity <span>*</span>
                      </Form.Label>
<Form.Control
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  value={item.quantity}
  onChange={(e) => {
    const value = e.target.value;

    if (/^\d*$/.test(value)) {
      updateItem(index, "quantity", value);
    }
  }}
  required
/>
                    </Col>

                    <Col lg={2} sm={4}>
                      <Form.Label className="purchase-label">
                        Unit Price (₹) <span>*</span>
                      </Form.Label>

                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.purchasePrice}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "purchasePrice",
                            e.target.value
                          )
                        }
                        required
                      />
                    </Col>

                    <Col lg={3} sm={4}>
                      <Form.Label className="purchase-label">
                        Item Total
                      </Form.Label>

                      <div className="purchase-item-total">
                        {formatCurrency(item.total)}
                      </div>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>

            <div className="purchase-grand-total">
              <span>Purchase Total</span>
              <strong>{formatCurrency(grandTotal)}</strong>
            </div>
          </Card.Body>
        </Card>

        {/* PAYMENT DETAILS */}
        <Card className="purchase-section-card">
          <Card.Body>
            <div className="purchase-section-heading">
              <span className="purchase-section-icon">
                <BsWallet2 />
              </span>
              <div>
                <h5>Payment Details</h5>
                <p>Update the amount paid to the supplier.</p>
              </div>
            </div>

            <Row className="g-3">
              <Col md={4}>
                <Form.Label className="purchase-label">
                  Purchase Total
                </Form.Label>
                <div className="purchase-summary-value">
                  {formatCurrency(grandTotal)}
                </div>
              </Col>

              <Col md={4}>
                <Form.Label className="purchase-label">
                  Amount Paid (₹)
                </Form.Label>
                <div className="purchase-input-icon">
                  <BsCurrencyRupee />
                  <Form.Control
                    type="number"
                    min="0"
                    max={grandTotal}
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) =>
                      setAmountPaid(e.target.value)
                    }
                    required
                  />
                </div>
              </Col>

              <Col md={4}>
                <Form.Label className="purchase-label">
                  Balance Due
                </Form.Label>
                <div className="purchase-summary-value purchase-balance">
                  {formatCurrency(balance)}
                </div>
              </Col>
            </Row>

            <div className="purchase-payment-status">
              <span>Payment Status</span>
              <span
                className={`purchase-status-badge ${
                  paymentStatus === "Paid"
                    ? "status-paid"
                    : paymentStatus === "Partially Paid"
                      ? "status-partial"
                      : "status-unpaid"
                }`}
              >
                {paymentStatus}
              </span>
            </div>
          </Card.Body>
        </Card>

        {/* NOTES */}
        <Card className="purchase-section-card">
          <Card.Body>
            <div className="purchase-section-heading">
              <span className="purchase-section-icon">
                <BsCheckCircle />
              </span>
              <div>
                <h5>Additional Notes</h5>
                <p>Optional information about this purchase.</p>
              </div>
            </div>

            <Form.Control
              as="textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any notes about this purchase..."
              maxLength={1000}
            />
          </Card.Body>
        </Card>

        {/* ACTIONS */}
        <div className="purchase-form-actions">
          <Button
            type="button"
            className="purchase-cancel-button"
            onClick={() => navigate("/purchases")}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="purchase-save-button"
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner size="sm" animation="border" />
                Saving Changes...
              </>
            ) : (
              <>
                <BsCheckCircle />
                Update Purchase
              </>
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
};

const styles = `
.edit-purchase-page {
  width: 100%;
  min-width: 0;
  padding: 24px;
  color: #25364b;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #f3f4f8;
  box-sizing: border-box;
  min-height: 100%;
}

.edit-purchase-page * {
  box-sizing: border-box;
}

.purchase-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.purchase-heading,
.purchase-heading-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.purchase-heading h2 {
  margin: 0;
  font-size: 25px;
  font-weight: 700;
  color: #1f3046;
  letter-spacing: -0.5px;
}

.purchase-heading p,
.purchase-section-heading p {
  margin: 5px 0 0;
  font-size: 13px;
  color: #8490a0;
}

.purchase-back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border: 1px solid #e0e6ef;
  border-radius: 11px;
  background: #fff;
  color: #3b6b9d;
  font-size: 19px;
  cursor: pointer;
  transition: background .2s, border-color .2s;
}

.purchase-back-button:hover {
  background: #edf4fb;
  border-color: #b9cee4;
}

.purchase-edit-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 13px;
  border-radius: 8px;
  background: #e7eef8;
  color: #3b6b9d;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.purchase-section-card {
  margin-bottom: 18px;
  border: 1px solid #e3e8f0 !important;
  border-radius: 13px !important;
  background: #fff;
  box-shadow: 0 3px 12px rgba(31, 48, 70, .035);
  overflow: hidden;
}

.purchase-section-card .card-body {
  padding: 23px;
}

.purchase-section-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
}

.purchase-section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 41px;
  height: 41px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #edf3fa;
  color: #3b6b9d;
  font-size: 18px;
}

.purchase-section-heading h5 {
  margin: 0;
  color: #26374d;
  font-size: 16px;
  font-weight: 700;
}

.purchase-label {
  display: block;
  margin-bottom: 8px;
  color: #4b5b70;
  font-size: 12px;
  font-weight: 650;
}

.purchase-label span {
  color: #d64b52;
}

.edit-purchase-page .form-control,
.edit-purchase-page .form-select {
  min-height: 43px;
  width: 100%;
  border: 1px solid #dce3ec;
  border-radius: 8px;
  background-color: #fff;
  color: #34465b;
  font-size: 13px;
  box-shadow: none;
}

.edit-purchase-page .form-control:focus,
.edit-purchase-page .form-select:focus {
  border-color: #7ba3cc;
  box-shadow: 0 0 0 3px rgba(59, 107, 157, .10);
}

.edit-purchase-page textarea.form-control {
  min-height: 90px;
  resize: vertical;
  padding: 12px;
}

.purchase-input-icon {
  display: flex;
  align-items: center;
  gap: 9px;
  padding-left: 12px;
  border: 1px solid #dce3ec;
  border-radius: 8px;
  color: #8b98a9;
}

.purchase-input-icon .form-control {
  border: 0;
  min-width: 0;
}

.purchase-input-icon:focus-within {
  border-color: #7ba3cc;
  box-shadow: 0 0 0 3px rgba(59, 107, 157, .10);
}

.purchase-input-icon .form-control:focus {
  box-shadow: none;
}

.purchase-items-heading {
  justify-content: space-between;
  flex-wrap: wrap;
}

.purchase-add-button,
.purchase-save-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0 !important;
  border-radius: 8px !important;
  background: #3b6b9d !important;
  color: #fff !important;
  font-size: 12px !important;
  font-weight: 650 !important;
  padding: 11px 16px !important;
}

.purchase-add-button:hover,
.purchase-save-button:hover {
  background: #315a85 !important;
}

.purchase-item-row {
  padding: 18px;
  margin-bottom: 14px;
  border: 1px solid #e5eaf1;
  border-radius: 10px;
  background: #fbfcfe;
}

.purchase-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.purchase-item-number {
  color: #52647a;
  font-size: 12px;
  font-weight: 700;
}

.purchase-remove-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 33px;
  height: 33px;
  border: 1px solid #f0dadd;
  border-radius: 7px;
  background: #fff;
  color: #c44f58;
  cursor: pointer;
}

.purchase-remove-button:hover:not(:disabled) {
  background: #fff0f1;
}

.purchase-remove-button:disabled {
  opacity: .35;
  cursor: not-allowed;
}

.purchase-item-total {
  display: flex;
  align-items: center;
  min-height: 43px;
  padding: 0 12px;
  border: 1px solid #e3e8f0;
  border-radius: 8px;
  background: #f1f5fa;
  color: #26374d;
  font-size: 13px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.purchase-grand-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 18px 4px 0;
  margin-top: 8px;
  border-top: 1px solid #e8edf3;
}

.purchase-grand-total span {
  color: #58687b;
  font-size: 13px;
  font-weight: 650;
}

.purchase-grand-total strong {
  color: #26374d;
  font-size: 22px;
  font-weight: 750;
  overflow-wrap: anywhere;
}

.purchase-summary-value {
  display: flex;
  align-items: center;
  min-height: 43px;
  padding: 0 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f6f8fb;
  color: #2d4057;
  font-size: 14px;
  font-weight: 700;
}

.purchase-balance {
  color: #bf6b30;
}

.purchase-payment-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 18px;
  margin-top: 20px;
  border-top: 1px solid #e8edf3;
}

.purchase-payment-status > span:first-child {
  color: #58687b;
  font-size: 12px;
  font-weight: 650;
}

.purchase-status-badge {
  padding: 6px 11px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.status-paid {
  color: #23825b;
  background: #e7f6ee;
}

.status-partial {
  color: #a76c14;
  background: #fff4dc;
}

.status-unpaid {
  color: #bd4751;
  background: #fdebed;
}

.purchase-help {
  display: block;
  margin-top: 6px;
  color: #a76c14;
  font-size: 11px;
}

.purchase-form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 5px 0 20px;
}

.purchase-cancel-button {
  min-height: 42px;
  padding: 10px 18px !important;
  border: 1px solid #dce3ec !important;
  border-radius: 8px !important;
  background: #fff !important;
  color: #52647a !important;
  font-size: 12px !important;
  font-weight: 650 !important;
}

.purchase-save-button {
  min-height: 42px;
}

.purchase-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 300px;
  color: #3b6b9d;
}

.purchase-loading p {
  margin: 0;
  color: #718096;
  font-size: 13px;
}

@media (max-width: 767px) {
  .edit-purchase-page {
    padding: 15px;
  }

  .purchase-page-header {
    align-items: flex-start;
  }

  .purchase-heading {
    gap: 10px;
  }

  .purchase-heading h2 {
    font-size: 21px;
  }

  .purchase-heading p {
    font-size: 12px;
    line-height: 1.5;
  }

  .purchase-edit-label {
    padding: 8px;
    font-size: 11px;
  }

  .purchase-section-card .card-body {
    padding: 16px;
  }

  .purchase-section-heading {
    margin-bottom: 18px;
  }

  .purchase-item-row {
    padding: 13px;
  }

  .purchase-items-heading {
    align-items: flex-start;
  }

  .purchase-add-button {
    padding: 9px 11px !important;
  }

  .purchase-form-actions {
    position: static;
  }
}

@media (max-width: 400px) {
  .edit-purchase-page {
    padding: 10px;
  }

  .purchase-heading h2 {
    font-size: 18px;
  }

  .purchase-back-button {
    width: 36px;
    height: 36px;
  }

  .purchase-edit-label {
    gap: 5px;
    font-size: 10px;
  }

  .purchase-section-card .card-body {
    padding: 12px;
  }

  .purchase-form-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .purchase-form-actions .btn {
    width: 100%;
  }
}
`;

export default EditPurchase;
