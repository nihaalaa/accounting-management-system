import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, Form, Row, Spinner, Alert } from "react-bootstrap";
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
  BsClockHistory,
  BsWallet2,
} from "react-icons/bs";

const API = import.meta.env.VITE_API_URL;
const today = new Date().toLocaleDateString("en-CA");

const initialItem = {
  productId: "",
  quantity: "1",
    productSearch: "",
  purchasePrice: "",
};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function AddPurchase() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(today);
  const [items, setItems] = useState([{ ...initialItem }]);
  const [amountPaid, setAmountPaid] = useState("0");
  const [notes, setNotes] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDueDate, setPaymentDueDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState("");
  const [supplierInvoiceFile, setSupplierInvoiceFile] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [supplierResponse, productResponse] = await Promise.all([
          axios.get(`${API}/suppliers`),
          axios.get(`${API}/products`),
        ]);

        const supplierData = Array.isArray(supplierResponse.data)
          ? supplierResponse.data
          : supplierResponse.data?.suppliers || [];

        const productData = Array.isArray(productResponse.data)
          ? productResponse.data
          : productResponse.data?.products || [];

        setSuppliers(supplierData);
        setProducts(productData);
      } catch (err) {
        console.error("Failed to load purchase form data:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load suppliers and products. Please check your backend connection."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const preparedItems = useMemo(
    () =>
      items.map((item) => {
        const product = products.find((p) => p._id === item.productId);
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

  const grandTotal = Number(
    preparedItems
      .reduce((sum, item) => sum + item.total, 0)
      .toFixed(2)
  );

  const paid = amountPaid.trim() === "" ? 0 : Number(amountPaid);
  const balance = Math.max(
    0,
    grandTotal - (Number.isFinite(paid) ? paid : 0)
  );

  const paymentStatus =
    paid >= grandTotal && grandTotal > 0
      ? "Paid"
      : paid > 0
        ? "Partially Paid"
        : "Unpaid";

  const updateItem = (index, field, value) => {
    setItems((previous) =>
      previous.map((item, i) => {
        if (i !== index) return item;

        const updated = { ...item, [field]: value };

if (field === "productId") {
  const product = products.find((p) => p._id === value);

  updated.purchasePrice = product
    ? String(product.purchasePrice ?? 0)
    : "";

  updated.productSearch = product
    ? `${product.name} (${product.code})`
    : "";
}

        return updated;
      })
    );
  };

  const addItem = () => {
    setItems((previous) => [...previous, { ...initialItem }]);
  };

  const removeItem = (index) => {
    setItems((previous) =>
      previous.length === 1
        ? [{ ...initialItem }]
        : previous.filter((_, i) => i !== index)
    );
  };
const uploadSupplierInvoiceToCloudinary = async (file) => {
  const cloudinaryFormData = new FormData();

  cloudinaryFormData.append("file", file);
  cloudinaryFormData.append("upload_preset", "testimage");

  const response = await axios.post(
    "https://api.cloudinary.com/v1_1/kvti0onx/auto/upload",
    cloudinaryFormData
  );

  return {
    url: response.data.secure_url,
    publicId: response.data.public_id,
    originalName: file.name,
    resourceType: response.data.resource_type,
  };
};
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!supplierId) {
      setError("Please select a supplier.");
      return;
    }

    if (!purchaseDate) {
      setError("Please select a purchase date.");
      return;
    }

    if (items.some((item) => !item.productId)) {
      setError("Please select a product for every item row.");
      return;
    }

    if (
      items.some(
        (item) =>
          !Number.isInteger(Number(item.quantity)) ||
          Number(item.quantity) < 1
      )
    ) {
      setError("Every product quantity must be a positive whole number.");
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

    if (
      new Set(items.map((item) => item.productId)).size !== items.length
    ) {
      setError(
        "A product is selected more than once. Combine its quantity into one row."
      );
      return;
    }

    if (
      !Number.isFinite(paid) ||
      paid < 0 ||
      paid > grandTotal
    ) {
      setError("Amount paid must be between zero and the purchase total.");
      return;
    }


const formData = new FormData();

formData.append("supplierId", supplierId);
formData.append("purchaseDate", purchaseDate);

formData.append(
  "items",
  JSON.stringify(
    items.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity),
      purchasePrice: Number(item.purchasePrice),
    }))
  )
);

formData.append("amountPaid", String(paid));
formData.append("paymentMethod", paymentMethod);
formData.append("paymentDueDate", paymentDueDate);
formData.append("notes", notes.trim());

formData.append(
  "supplierInvoiceNumber",
  supplierInvoiceNumber.trim()
);

if (supplierInvoiceFile) {
  formData.append("supplierInvoiceFile", supplierInvoiceFile);
}


try {
  setSaving(true);

  // Upload the supplier invoice first, if one was selected.
  let uploadedInvoice = null;

  if (supplierInvoiceFile) {
    uploadedInvoice = await uploadSupplierInvoiceToCloudinary(
      supplierInvoiceFile
      
    );
    // console.log("Cloudinary upload result:", uploadedInvoice);
  }

  const formData = new FormData();

  formData.append("supplierId", supplierId);
  formData.append("purchaseDate", purchaseDate);

  formData.append(
    "items",
    JSON.stringify(
      items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        purchasePrice: Number(item.purchasePrice),
      }))
    )
  );

  formData.append("amountPaid", String(paid));
  formData.append("paymentMethod", paymentMethod);
formData.append("paymentDueDate", paymentDueDate);
  formData.append("notes", notes.trim());
  formData.append(
    "supplierInvoiceNumber",
    supplierInvoiceNumber.trim()
  );

  if (uploadedInvoice) {
    formData.append("supplierInvoiceUrl", uploadedInvoice.url);
    formData.append(
      "supplierInvoicePublicId",
      uploadedInvoice.publicId
    );
    formData.append(
      "supplierInvoiceOriginalName",
      uploadedInvoice.originalName
    );
    formData.append(
      "supplierInvoiceResourceType",
      uploadedInvoice.resourceType
    );
  }

  await axios.post(`${API}/purchases`, formData);
// console.log(
//   "Invoice URL being sent:",
//   formData.get("supplierInvoiceUrl")
// );
  navigate("/purchases", {
    state: { message: "Purchase created successfully." },
  });
} catch (err) {
  console.error("Create purchase error:", err);
  console.log("Status:", err.response?.status);
  console.log(
    "Backend response:",
    JSON.stringify(err.response?.data, null, 2)
  );

  setError(
    err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      "Failed to save purchase. Please try again."
  );
} finally {
  setSaving(false);
}

  };

  return (
    <div className="add-purchase-page">
      <style>{`
        .add-purchase-page {
          min-height: 100vh;
          padding: 26px;
          background: #f3f4f8;
          color: #243449;
          font-family: Inter, system-ui, sans-serif;
          overflow-x: hidden;
        }

        .purchase-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .purchase-loading {
          display: flex;
          min-height: 70vh;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          background: #f3f4f8;
          color: #64748b;
          font-size: 12px;
        }

        .purchase-loading p { margin: 0; }

        .purchase-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 24px;
        }

        .purchase-page-header h1 {
          margin: 8px 0 6px;
          color: #172b45;
          font-size: 25px;
          font-weight: 750;
          letter-spacing: -0.6px;
        }

        .purchase-page-header p {
          margin: 0;
          color: #7b8798;
          font-size: 13px;
        }

        .purchase-back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .purchase-back-link:hover { color: #315a85; }

        .purchase-header-tag {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px 16px;
          border: 1px solid #dce7f3;
          border-radius: 11px;
          background: #fff;
        }

        .purchase-header-icon {
          display: flex;
          width: 39px;
          height: 39px;
          flex: 0 0 39px;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #eaf1f9;
          color: #3b6b9d;
          font-size: 18px;
        }

        .purchase-header-tag strong,
        .purchase-header-tag small { display: block; }

        .purchase-header-tag strong {
          color: #263c56;
          font-size: 12px;
          font-weight: 700;
        }

        .purchase-header-tag small {
          margin-top: 4px;
          color: #8793a3;
          font-size: 10px;
        }

        .purchase-card {
          margin-bottom: 19px;
          overflow: hidden;
          border: 1px solid #e1e7ef !important;
          border-radius: 12px !important;
          background: #fff;
          box-shadow: 0 3px 12px rgba(15, 27, 45, 0.035);
        }

        .purchase-card > .card-body { padding: 23px; }

        .purchase-section-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
        }

        .purchase-section-icon {
          display: flex;
          width: 39px;
          height: 39px;
          flex: 0 0 39px;
          align-items: center;
          justify-content: center;
          border: 1px solid #dce8f5;
          border-radius: 10px;
          background: #eef4fb;
          color: #3b6b9d;
          font-size: 17px;
        }

        .purchase-section-heading h2 {
          margin: 0;
          color: #26394f;
          font-size: 14px;
          font-weight: 750;
        }

        .purchase-section-heading p {
          margin: 5px 0 0;
          color: #8490a0;
          font-size: 11px;
        }

        .purchase-section-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 22px;
        }

        .purchase-section-top .purchase-section-heading {
          margin-bottom: 0;
        }

        .purchase-label {
          display: block;
          margin-bottom: 8px;
          color: #46566b;
          font-size: 12px;
          font-weight: 650;
        }

        .purchase-label span,
        .purchase-footer-note span { color: #d94848; }

        .purchase-input {
          width: 100%;
          min-height: 42px;
          border: 1px solid #dce3eb !important;
          border-radius: 8px !important;
          background-color: #fff;
          color: #26394f;
          font-size: 12px !important;
          box-shadow: none !important;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .purchase-input:focus {
          border-color: #7299c2 !important;
          box-shadow: 0 0 0 3px rgba(59, 107, 157, 0.1) !important;
        }

        .purchase-input::placeholder { color: #a1aab7; }

        .purchase-date-wrapper { position: relative; }

        .purchase-date-icon {
          position: absolute;
          z-index: 2;
          top: 14px;
          left: 13px;
          color: #8391a3;
          pointer-events: none;
          font-size: 13px;
        }

        .purchase-date-input { padding-left: 37px; }

        .purchase-field-hint {
          display: block;
          margin-top: 8px;
          color: #8793a3;
          font-size: 11px;
          line-height: 1.5;
        }

        .purchase-field-hint.warning { color: #b7791f; }

        .purchase-add-button,
        .purchase-save-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border: 1px solid #3b6b9d !important;
          border-radius: 8px !important;
          background: #3b6b9d !important;
          color: #fff !important;
          font-size: 12px;
          font-weight: 650;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .purchase-add-button {
          min-height: 38px;
          padding: 8px 13px;
          background: #fff !important;
          color: #3b6b9d !important;
        }

        .purchase-add-button:hover { background: #edf4fb !important; }

        .purchase-save-button { min-height: 42px; padding: 10px 18px; }

        .purchase-save-button:hover:not(:disabled) {
          border-color: #315a85 !important;
          background: #315a85 !important;
          transform: translateY(-1px);
        }

        .purchase-save-button:disabled { opacity: 0.65; }

        .purchase-items-list {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .purchase-item-row {
          padding: 17px;
          border: 1px solid #e3e9f0;
          border-radius: 10px;
          background: #fcfdff;
          transition: border-color 0.2s ease;
        }

        .purchase-item-row:focus-within { border-color: #b7cbe1; }

        .purchase-item-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 17px;
        }

        .purchase-item-number {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .purchase-item-number > span {
          display: flex;
          width: 29px;
          height: 29px;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: #eaf1f9;
          color: #3b6b9d;
          font-size: 10px;
          font-weight: 750;
        }

        .purchase-item-number strong {
          color: #35485f;
          font-size: 12px;
          font-weight: 700;
        }

        .purchase-remove-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: #b65b5b;
          font-size: 11px;
          cursor: pointer;
        }

        .purchase-remove-button:hover {
          background: #fff0f0;
          color: #a63131;
        }

        .purchase-stock-hint {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 9px;
          color: #7d8a9b;
          font-size: 10px;
        }

        .purchase-stock-hint strong { color: #435b75; }

        .purchase-stock-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6b9a83;
        }

        .purchase-item-total {
          display: flex;
          min-height: 42px;
          align-items: center;
          padding: 0 12px;
          border: 1px solid #dce7f2;
          border-radius: 8px;
          background: #edf3fa;
          color: #284e75;
          font-size: 13px;
          font-weight: 750;
          white-space: nowrap;
        }

        .purchase-total-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 20px;
          padding: 18px 4px 0;
          border-top: 1px solid #e8edf3;
        }

        .purchase-total-bar > div:first-child {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .purchase-total-caption {
          color: #8995a5;
          font-size: 9px;
          font-weight: 750;
          letter-spacing: 1px;
        }

        .purchase-total-bar > div:first-child strong {
          color: #64748b;
          font-size: 12px;
        }

        .purchase-grand-total { text-align: right; }

        .purchase-grand-total span {
          display: block;
          margin-bottom: 4px;
          color: #64748b;
          font-size: 11px;
        }

        .purchase-grand-total strong {
          color: #1e4268;
          font-size: 23px;
          font-weight: 800;
          overflow-wrap: anywhere;
        }

        .purchase-summary-tile {
          height: 100%;
          padding: 15px;
          border: 1px solid #e5eaf0;
          border-radius: 9px;
        }

        .balance-tile { background: #f4f7fb; }

        .status-paid {
          border-color: #d4eadc;
          background: #edf8f1;
        }

        .status-partial {
          border-color: #f2e2bc;
          background: #fff7e8;
        }

        .status-unpaid {
          border-color: #f2d9d9;
          background: #fef2f2;
        }

        .purchase-tile-label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #68778a;
          font-size: 11px;
        }

        .purchase-summary-tile > strong {
          display: block;
          margin-top: 10px;
          color: #243449;
          font-size: 18px;
          font-weight: 750;
          overflow-wrap: anywhere;
        }

        .status-paid > strong {
          color: #21834a;
          font-size: 14px;
        }

        .status-partial > strong {
          color: #a16207;
          font-size: 14px;
        }

        .status-unpaid > strong {
          color: #b42318;
          font-size: 14px;
        }

        .purchase-notes-input {
          min-height: 145px;
          padding: 12px;
          line-height: 1.6;
          resize: vertical;
        }

        .purchase-form-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin: 3px 0 25px;
          padding: 17px 0 0;
          border-top: 1px solid #e1e7ef;
        }

        .purchase-footer-note {
          color: #7b8798;
          font-size: 11px;
        }

        .purchase-footer-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 10px;
        }

        .purchase-cancel-button {
          min-height: 42px;
          padding: 9px 17px;
          border: 1px solid #d6dee8 !important;
          border-radius: 8px !important;
          background: #fff !important;
          color: #526176 !important;
          font-size: 12px;
          font-weight: 650;
        }

        .purchase-cancel-button:hover:not(:disabled) {
          background: #f5f7fa !important;
        }

        .purchase-error {
          border-radius: 9px;
          font-size: 12px;
        }

        @media (max-width: 767px) {
          .add-purchase-page { padding: 18px 12px; }

          .purchase-page-header {
            align-items: flex-start;
            margin-bottom: 20px;
          }

          .purchase-page-header h1 { font-size: 22px; }

          .purchase-header-tag { width: 100%; }

          .purchase-card > .card-body { padding: 17px; }

          .purchase-section-heading { gap: 10px; margin-bottom: 18px; }

          .purchase-section-icon {
            width: 35px;
            height: 35px;
            flex-basis: 35px;
          }

          .purchase-item-row { padding: 13px; }

          .purchase-item-heading { margin-bottom: 15px; }

          .purchase-section-top { align-items: flex-start; }

          .purchase-add-button { width: 100%; }

          .purchase-total-bar { align-items: flex-start; }

          .purchase-grand-total {
            width: 100%;
            text-align: left;
          }

          .purchase-grand-total strong { font-size: 22px; }

          .purchase-form-footer {
            align-items: stretch;
            flex-direction: column;
          }

          .purchase-footer-actions { width: 100%; }

          .purchase-cancel-button,
          .purchase-save-button { flex: 1; }

          .purchase-remove-button span { display: none; }
        }

        @media (max-width: 400px) {
          .add-purchase-page { padding: 14px 9px; }

          .purchase-card > .card-body { padding: 13px; }

          .purchase-page-header h1 { font-size: 20px; }

          .purchase-item-row { padding: 11px; }

          .purchase-summary-tile { padding: 12px; }

          .purchase-footer-actions { flex-direction: column-reverse; }

          .purchase-cancel-button,
          .purchase-save-button {
            width: 100%;
            flex: auto;
          }
        }
      `}</style>

      {loading ? (
        <div className="purchase-loading">
          <Spinner animation="border" variant="primary" />
          <p>Loading purchase form...</p>
        </div>
      ) : (
        <div className="purchase-container">
          <div className="purchase-page-header">
            <div>
              <button
                type="button"
                className="purchase-back-link"
                onClick={() => navigate("/purchases")}
              >
                <BsArrowLeft />
                Back to Purchases
              </button>

              <h1>Add New Purchase</h1>
              <p>Record stock purchased from your suppliers.</p>
            </div>

            <div className="purchase-header-tag">
              <span className="purchase-header-icon">
                <BsBagCheck />
              </span>
              <div>
                <strong>New Purchase</strong>
                <small>Inventory &amp; payments</small>
              </div>
            </div>
          </div>

          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError("")}
              className="purchase-error"
            >
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Card className="purchase-card">
              <Card.Body>
                <div className="purchase-section-heading">
                  <div className="purchase-section-icon">
                    <BsBuilding />
                  </div>
                  <div>
                    <h2>Purchase Information</h2>
                    <p>Choose the supplier and purchase date.</p>
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
                      className="purchase-input"
                      required
                    >
                      <option value="">Select a supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.supplierName}
                          {supplier.companyName
                            ? ` — ${supplier.companyName}`
                            : ""}
                        </option>
                      ))}
                    </Form.Select>

                    {suppliers.length === 0 && (
                      <small className="purchase-field-hint warning">
                        No active suppliers found. Add a supplier first.
                      </small>
                    )}
                  </Col>

                  <Col md={6}>
                    <Form.Label className="purchase-label">
                      Purchase Date <span>*</span>
                    </Form.Label>

                    <div className="purchase-date-wrapper">
                      <BsCalendar3 className="purchase-date-icon" />
                      <Form.Control
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="purchase-input purchase-date-input"
                        required
                      />
                    </div>
                  </Col>
                  
<Col md={6}>
  <Form.Label className="purchase-label">
    Supplier Invoice Number
  </Form.Label>

  <Form.Control
    type="text"
    value={supplierInvoiceNumber}
    onChange={(e) => setSupplierInvoiceNumber(e.target.value)}
    placeholder="Enter supplier invoice number (optional)"
    className="purchase-input"
  />
</Col>

<Col md={6}>
  <Form.Label className="purchase-label">
    Upload Supplier Invoice
  </Form.Label>

  <Form.Control
    type="file"
    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
    onChange={(e) =>
      setSupplierInvoiceFile(e.target.files?.[0] || null)
    }
    className="purchase-input"
  />

  <small className="purchase-field-hint">
    Optional. PDF, JPG, or PNG; maximum 10 MB.
  </small>

  {supplierInvoiceFile && (
    <small className="purchase-field-hint">
      Selected: {supplierInvoiceFile.name}
    </small>
  )}
</Col>

                </Row>
              </Card.Body>
            </Card>

            <Card className="purchase-card">
              <Card.Body>
                <div className="purchase-section-top">
                  <div className="purchase-section-heading">
                    <div className="purchase-section-icon">
                      <BsBoxSeam />
                    </div>
                    <div>
                      <h2>Purchase Items</h2>
                      <p>Add the products received from the supplier.</p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="purchase-add-button"
                    onClick={addItem}
                  >
                    <BsPlusLg />
                    Add Product
                  </Button>
                </div>

                {products.length === 0 && (
                  <Alert variant="warning">
                    No products found. Add products before recording a purchase.
                  </Alert>
                )}

                <div className="purchase-items-list">
                  {preparedItems.map((item, index) => (
                    <div className="purchase-item-row" key={index}>
                      <div className="purchase-item-heading">
                        <div className="purchase-item-number">
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <strong>Item {index + 1}</strong>
                        </div>

                        <button
                          type="button"
                          className="purchase-remove-button"
                          title="Remove item"
                          onClick={() => removeItem(index)}
                        >
                          <BsTrash3 />
                          <span>Remove</span>
                        </button>
                      </div>

                      <Row className="g-3 align-items-end">
                        <Col lg={5} md={12}>

<Form.Label className="purchase-label">
  Product <span>*</span>
</Form.Label>

<Form.Control
  type="text"
  placeholder="Search by product name or code..."
  value={item.productSearch}
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
/>

{item.productSearch.trim() !== "" && !item.productId && (
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
      .filter((product) => {
        const search = item.productSearch.toLowerCase().trim();

        return (
          `${product.name || ""} ${product.code || ""}`
            .toLowerCase()
            .includes(search)
        );
      })
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
            updateItem(index, "productId", product._id)
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
            Code: {product.code || "N/A"} · Stock:{" "}
            {product.currentStock ?? 0} {product.unit || "units"}
          </div>
        </button>
      ))}

    {products.filter((product) => {
      const search = item.productSearch.toLowerCase().trim();

      return (
        `${product.name || ""} ${product.code || ""}`
          .toLowerCase()
          .includes(search) &&
        !items.some(
          (existing, existingIndex) =>
            existing.productId === product._id &&
            existingIndex !== index
        )
      );
    }).length === 0 && (
      <div style={{ padding: "12px", color: "#8793a3", fontSize: "12px" }}>
        No matching products found.
      </div>
    )}
  </div>
)}



                          {item.product && (
                            <div className="purchase-stock-hint">
                              <span className="purchase-stock-dot" />
                              Current stock:{" "}
                              <strong>{item.product.currentStock ?? 0}</strong>{" "}
                              {item.product.unit || "units"}
                            </div>
                          )}
                        </Col>

                        <Col lg={2} md={4} sm={4}>
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

                        <Col lg={2} md={4} sm={4}>
                          <Form.Label className="purchase-label">
                            Unit Price (₹) <span>*</span>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.purchasePrice}
                            onChange={(e) =>
                              updateItem(index, "purchasePrice", e.target.value)
                            }
                            className="purchase-input"
                            required
                          />
                        </Col>

                        <Col lg={3} md={4} sm={4}>
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

                <div className="purchase-total-bar">
                  <div>
                    <span className="purchase-total-caption">ITEMS ADDED</span>
                    <strong>{items.length} product row(s)</strong>
                  </div>

                  <div className="purchase-grand-total">
                    <span>Purchase Total</span>
                    <strong>{formatCurrency(grandTotal)}</strong>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Row className="g-3">
              <Col lg={7}>
                <Card className="purchase-card">
                  <Card.Body>
                    <div className="purchase-section-heading">
                      <div className="purchase-section-icon">
                        <BsWallet2 />
                      </div>
                      <div>
                        <h2>Payment Details</h2>
                        <p>Enter the amount paid to the supplier.</p>
                      </div>
                    </div>

                    <Form.Label className="purchase-label">
                      Amount Paid (₹)
                    </Form.Label>

                    <Form.Control
                      type="number"
                      min="0"
                      max={grandTotal}
                      step="0.01"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="purchase-input"
                      required
                    />

                    <small className="purchase-field-hint">
                      The remaining amount will be recorded as outstanding.
                    </small>


<Row className="g-3 mt-2">
  <Col sm={6}>
    <Form.Label className="purchase-label">
      Payment Method <span>*</span>
    </Form.Label>

    <Form.Select
      value={paymentMethod}
      onChange={(e) => setPaymentMethod(e.target.value)}
      className="purchase-input"
      required
    >
      <option value="Cash">Cash</option>
      <option value="Bank Transfer">Bank Transfer</option>
      <option value="UPI">UPI</option>
      <option value="Card">Card</option>
      <option value="Cheque">Cheque</option>
      <option value="Credit">Credit</option>
    </Form.Select>
  </Col>

{paymentStatus !== "Paid" && (
  <Col sm={6}>
    <Form.Label className="purchase-label">
      Payment Due Date <span>*</span>
    </Form.Label>

    <Form.Control
      type="date"
      value={paymentDueDate}
      onChange={(e) => setPaymentDueDate(e.target.value)}
      className="purchase-input"
      required
    />

    <small className="purchase-field-hint">
      Enter the date by which the remaining balance must be paid.
    </small>
  </Col>
)}
</Row>

                    <Row className="g-3 mt-2">
                      <Col sm={6}>
                        <div className="purchase-summary-tile balance-tile">
                          <div className="purchase-tile-label">
                            <BsClockHistory />
                            Balance Due
                          </div>
                          <strong>{formatCurrency(balance)}</strong>
                        </div>
                      </Col>

                      <Col sm={6}>
                        <div
                          className={`purchase-summary-tile status-tile ${
                            paymentStatus === "Paid"
                              ? "status-paid"
                              : paymentStatus === "Partially Paid"
                                ? "status-partial"
                                : "status-unpaid"
                          }`}
                        >
                          <div className="purchase-tile-label">
                            {paymentStatus === "Paid" ? (
                              <BsCheckCircle />
                            ) : (
                              <BsCurrencyRupee />
                            )}
                            Payment Status
                          </div>
                          <strong>{paymentStatus}</strong>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={5}>
                <Card className="purchase-card">
                  <Card.Body>
                    <div className="purchase-section-heading">
                      <div className="purchase-section-icon">
                        <BsCalendar3 />
                      </div>
                      <div>
                        <h2>Additional Notes</h2>
                        <p>Optional purchase information.</p>
                      </div>
                    </div>

                    <Form.Control
                      as="textarea"
                      rows={5}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Invoice reference, delivery details, or other notes..."
                      className="purchase-input purchase-notes-input"
                    />
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="purchase-form-footer">
              <div className="purchase-footer-note">
                <span>*</span> Required fields
              </div>

              <div className="purchase-footer-actions">
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
                  disabled={
                    saving ||
                    suppliers.length === 0 ||
                    products.length === 0
                  }
                >
                  {saving ? (
                    <>
                      <Spinner size="sm" animation="border" />
                      Saving Purchase...
                    </>
                  ) : (
                    <>
                      <BsBagCheck />
                      Save Purchase
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      )}
    </div>
  );
}
