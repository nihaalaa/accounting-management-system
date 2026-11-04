
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
  Alert,
  Table,
} from "react-bootstrap";
import axios from "axios";
import {
  BsArrowLeft,
  BsArrowCounterclockwise,
  BsTrash3,
  BsBagCheck,
  BsBuilding,
  BsBoxSeam,
  BsCurrencyRupee,
  BsCalendar3,
  BsWallet2,
  BsCheckCircle,
} from "react-icons/bs";

const API = import.meta.env.VITE_API_URL;
const today = new Date().toLocaleDateString("en-CA");

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function AddPurchaseReturn() {
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState([]);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const [returnItems, setReturnItems] = useState([]);
  const [returnDate, setReturnDate] = useState(today);
  const [refundMethod, setRefundMethod] = useState("Credit Note");
  const [refundAmount, setRefundAmount] = useState("0");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch purchases
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API}/purchases`);

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.purchases || [];

        setPurchases(data);
      } catch (err) {
        console.error("Fetch purchases error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load purchases. Please check your backend connection."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  // Select purchase
  const handlePurchaseChange = (purchaseId) => {
    const purchase = purchases.find(
      (item) => item._id === purchaseId
    );

    setSelectedPurchaseId(purchaseId);
    setSelectedPurchase(purchase || null);
    setReturnItems([]);
    setRefundAmount("0");
    setError("");
  };

  // Calculate available return quantity
  const getAvailableQuantity = (item) =>
    Math.max(
      0,
      Number(item.quantity || 0) -
        Number(item.returnedQuantity || 0)
    );

  // Check whether an item is already selected
  const isItemAdded = (purchaseItemId) =>
    returnItems.some(
      (item) => item.purchaseItemId === purchaseItemId
    );

  // Add product
  const addItem = (purchaseItem) => {
    if (!purchaseItem._id) {
      setError(
        "This purchase item does not have an item ID. Please use a purchase created with the updated purchase system."
      );
      return;
    }

    const available = getAvailableQuantity(purchaseItem);

    if (available <= 0 || isItemAdded(purchaseItem._id)) {
      return;
    }

    setReturnItems((previous) => [
      ...previous,
      {
        purchaseItemId: purchaseItem._id,
        productId:
          purchaseItem.productId?._id ||
          purchaseItem.productId,
        productName: purchaseItem.productName,
        productCode: purchaseItem.productCode || "",
        purchasePrice: Number(purchaseItem.purchasePrice || 0),
        availableQuantity: available,
        quantity: "1",
        reason: "",
      },
    ]);
  };

  // Update return item
  const updateItem = (purchaseItemId, field, value) => {
    setReturnItems((previous) =>
      previous.map((item) => {
        if (item.purchaseItemId !== purchaseItemId) {
          return item;
        }

        if (field === "quantity") {
          if (value !== "" && !/^\d+$/.test(value)) {
            return item;
          }

          const quantity = Number(value);

          if (
            value !== "" &&
            (quantity < 1 || quantity > item.availableQuantity)
          ) {
            return item;
          }
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  // Remove return item
  const removeItem = (purchaseItemId) => {
    setReturnItems((previous) =>
      previous.filter(
        (item) => item.purchaseItemId !== purchaseItemId
      )
    );
  };

  // Calculate return total
  const grandTotal = useMemo(() => {
    return Number(
      returnItems
        .reduce(
          (sum, item) =>
            sum +
            (Number(item.quantity) || 0) *
              Number(item.purchasePrice || 0),
          0
        )
        .toFixed(2)
    );
  }, [returnItems]);

  const refund = refundAmount.trim() === ""
    ? 0
    : Number(refundAmount);

  // Submit purchase return
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!selectedPurchaseId || !selectedPurchase) {
      setError("Please select a purchase.");
      return;
    }

    if (!returnDate) {
      setError("Please select a return date.");
      return;
    }

    if (returnItems.length === 0) {
      setError("Please add at least one product to return.");
      return;
    }

    if (
      returnItems.some(
        (item) =>
          !Number.isInteger(Number(item.quantity)) ||
          Number(item.quantity) < 1 ||
          Number(item.quantity) > item.availableQuantity
      )
    ) {
      setError(
        "Please enter a valid return quantity for every product."
      );
      return;
    }

    if (
      !Number.isFinite(refund) ||
      refund < 0 ||
      refund > grandTotal
    ) {
      setError(
        "Refund amount must be between zero and the return value."
      );
      return;
    }

    const payload = {
      purchaseId: selectedPurchaseId,
      returnDate,
      items: returnItems.map((item) => ({
        purchaseItemId: item.purchaseItemId,
        quantity: Number(item.quantity),
        reason: item.reason.trim(),
      })),
      refundMethod,
      refundAmount: refund,
      notes: notes.trim(),
    };

    try {
      setSaving(true);

      await axios.post(`${API}/purchase-returns`, payload);

      navigate("/purchase-returns", {
        state: {
          message: "Purchase return created successfully.",
        },
      });
    } catch (err) {
console.error("Create purchase return error:", err);
console.log("Backend error message:", err.response?.data);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to create purchase return. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-purchase-return-page">
      <style>{`
        .add-purchase-return-page {
          min-height: 100vh;
          padding: 26px;
          background: #f3f4f8;
          color: #243449;
          font-family: Inter, system-ui, sans-serif;
          overflow-x: hidden;
        }

        .purchase-return-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .purchase-return-loading {
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

        .purchase-return-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 24px;
        }

        .purchase-return-page-header h1 {
          margin: 8px 0 6px;
          color: #172b45;
          font-size: 25px;
          font-weight: 750;
          letter-spacing: -0.6px;
        }

        .purchase-return-page-header p {
          margin: 0;
          color: #7b8798;
          font-size: 13px;
        }

        .purchase-return-back-link {
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

        .purchase-return-back-link:hover {
          color: #315a85;
        }

        .purchase-return-header-tag {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px 16px;
          border: 1px solid #dce7f3;
          border-radius: 11px;
          background: #fff;
        }

        .purchase-return-header-icon {
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

        .purchase-return-header-tag strong,
        .purchase-return-header-tag small {
          display: block;
        }

        .purchase-return-header-tag strong {
          color: #263c56;
          font-size: 12px;
          font-weight: 700;
        }

        .purchase-return-header-tag small {
          margin-top: 4px;
          color: #8793a3;
          font-size: 10px;
        }

        .purchase-return-card {
          margin-bottom: 19px;
          overflow: hidden;
          border: 1px solid #e1e7ef !important;
          border-radius: 12px !important;
          background: #fff;
          box-shadow: 0 3px 12px rgba(15, 27, 45, 0.035);
        }

        .purchase-return-card > .card-body {
          padding: 23px;
        }

        .purchase-return-section-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
        }

        .purchase-return-section-icon {
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

        .purchase-return-section-heading h2 {
          margin: 0;
          color: #26394f;
          font-size: 14px;
          font-weight: 750;
        }

        .purchase-return-section-heading p {
          margin: 5px 0 0;
          color: #8490a0;
          font-size: 11px;
        }

        .purchase-return-label {
          display: block;
          margin-bottom: 8px;
          color: #46566b;
          font-size: 12px;
          font-weight: 650;
        }

        .purchase-return-label span,
        .purchase-return-footer-note span {
          color: #d94848;
        }

        .purchase-return-input {
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

        .purchase-return-input:focus {
          border-color: #7299c2 !important;
          box-shadow: 0 0 0 3px rgba(59, 107, 157, 0.1) !important;
        }

        .purchase-return-input::placeholder {
          color: #a1aab7;
        }

        .purchase-return-date-wrapper {
          position: relative;
        }

        .purchase-return-date-icon {
          position: absolute;
          z-index: 2;
          top: 14px;
          left: 13px;
          color: #8391a3;
          pointer-events: none;
          font-size: 13px;
        }

        .purchase-return-date-input {
          padding-left: 37px;
        }

        .purchase-return-hint {
          display: block;
          margin-top: 8px;
          color: #8793a3;
          font-size: 11px;
          line-height: 1.5;
        }

        .purchase-return-hint.warning {
          color: #b7791f;
        }

        .purchase-return-table {
          margin-bottom: 0;
          font-size: 12px;
          vertical-align: middle;
        }

        .purchase-return-table thead th {
          padding: 12px;
          border-bottom: 1px solid #e1e7ef;
          background: #f7f9fc;
          color: #64748b;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        .purchase-return-table tbody td {
          padding: 13px 12px;
          border-color: #edf0f4;
          color: #405168;
        }

        .purchase-return-table tbody tr:hover {
          background: #fafcff;
        }

        .purchase-return-product-name {
          color: #35485f;
          font-size: 12px;
          font-weight: 700;
        }

        .purchase-return-product-code {
          margin-top: 4px;
          color: #8793a3;
          font-size: 10px;
        }

        .purchase-return-add-button,
        .purchase-return-save-button {
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

        .purchase-return-add-button {
          min-height: 34px;
          padding: 7px 12px;
        }

        .purchase-return-add-button:hover:not(:disabled) {
          background: #315a85 !important;
        }

        .purchase-return-add-button:disabled {
          opacity: 0.55;
        }

        .purchase-return-save-button {
          min-height: 42px;
          padding: 10px 18px;
        }

        .purchase-return-save-button:hover:not(:disabled) {
          border-color: #315a85 !important;
          background: #315a85 !important;
          transform: translateY(-1px);
        }

        .purchase-return-save-button:disabled {
          opacity: 0.65;
        }

        .purchase-return-items-list {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .purchase-return-item-row {
          padding: 17px;
          border: 1px solid #e3e9f0;
          border-radius: 10px;
          background: #fcfdff;
        }

        .purchase-return-item-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 17px;
        }

        .purchase-return-item-number {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .purchase-return-item-number > span {
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

        .purchase-return-item-number strong {
          color: #35485f;
          font-size: 12px;
          font-weight: 700;
        }

        .purchase-return-remove-button {
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

        .purchase-return-remove-button:hover {
          background: #fff0f0;
          color: #a63131;
        }

        .purchase-return-item-total {
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

        .purchase-return-total-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 20px;
          padding: 18px 4px 0;
          border-top: 1px solid #e8edf3;
        }

        .purchase-return-total-caption {
          color: #8995a5;
          font-size: 9px;
          font-weight: 750;
          letter-spacing: 1px;
        }

        .purchase-return-grand-total {
          text-align: right;
        }

        .purchase-return-grand-total span {
          display: block;
          margin-bottom: 4px;
          color: #64748b;
          font-size: 11px;
        }

        .purchase-return-grand-total strong {
          color: #1e4268;
          font-size: 23px;
          font-weight: 800;
          overflow-wrap: anywhere;
        }

        .purchase-return-summary-tile {
          height: 100%;
          padding: 15px;
          border: 1px solid #e5eaf0;
          border-radius: 9px;
          background: #f4f7fb;
        }

        .purchase-return-tile-label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #68778a;
          font-size: 11px;
        }

        .purchase-return-summary-tile > strong {
          display: block;
          margin-top: 10px;
          color: #243449;
          font-size: 18px;
          font-weight: 750;
          overflow-wrap: anywhere;
        }

        .purchase-return-notes-input {
          min-height: 145px;
          padding: 12px;
          line-height: 1.6;
          resize: vertical;
        }

        .purchase-return-form-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin: 3px 0 25px;
          padding: 17px 0 0;
          border-top: 1px solid #e1e7ef;
        }

        .purchase-return-footer-note {
          color: #7b8798;
          font-size: 11px;
        }

        .purchase-return-footer-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 10px;
        }

        .purchase-return-cancel-button {
          min-height: 42px;
          padding: 9px 17px;
          border: 1px solid #d6dee8 !important;
          border-radius: 8px !important;
          background: #fff !important;
          color: #526176 !important;
          font-size: 12px;
          font-weight: 650;
        }

        .purchase-return-cancel-button:hover:not(:disabled) {
          background: #f5f7fa !important;
        }

        .purchase-return-error {
          border-radius: 9px;
          font-size: 12px;
        }

        @media (max-width: 767px) {
          .add-purchase-return-page {
            padding: 18px 12px;
          }

          .purchase-return-page-header {
            align-items: flex-start;
            margin-bottom: 20px;
          }

          .purchase-return-page-header h1 {
            font-size: 22px;
          }

          .purchase-return-header-tag {
            width: 100%;
          }

          .purchase-return-card > .card-body {
            padding: 17px;
          }

          .purchase-return-section-heading {
            gap: 10px;
            margin-bottom: 18px;
          }

          .purchase-return-section-icon {
            width: 35px;
            height: 35px;
            flex-basis: 35px;
          }

          .purchase-return-item-row {
            padding: 13px;
          }

          .purchase-return-item-heading {
            margin-bottom: 15px;
          }

          .purchase-return-total-bar {
            align-items: flex-start;
          }

          .purchase-return-grand-total {
            width: 100%;
            text-align: left;
          }

          .purchase-return-grand-total strong {
            font-size: 22px;
          }

          .purchase-return-form-footer {
            align-items: stretch;
            flex-direction: column;
          }

          .purchase-return-footer-actions {
            width: 100%;
          }

          .purchase-return-cancel-button,
          .purchase-return-save-button {
            flex: 1;
          }

          .purchase-return-remove-button span {
            display: none;
          }
        }

        @media (max-width: 400px) {
          .add-purchase-return-page {
            padding: 14px 9px;
          }

          .purchase-return-card > .card-body {
            padding: 13px;
          }

          .purchase-return-page-header h1 {
            font-size: 20px;
          }

          .purchase-return-item-row {
            padding: 11px;
          }

          .purchase-return-summary-tile {
            padding: 12px;
          }

          .purchase-return-footer-actions {
            flex-direction: column-reverse;
          }

          .purchase-return-cancel-button,
          .purchase-return-save-button {
            width: 100%;
            flex: auto;
          }
        }
      `}</style>

      {loading ? (
        <div className="purchase-return-loading">
          <Spinner animation="border" variant="primary" />
          <p>Loading purchase return form...</p>
        </div>
      ) : (
        <div className="purchase-return-container">
          {/* Page Header */}
          <div className="purchase-return-page-header">
            <div>
              <button
                type="button"
                className="purchase-return-back-link"
                onClick={() => navigate("/purchase-returns")}
              >
                <BsArrowLeft />
                Back to Purchase Returns
              </button>

              <h1>Create Purchase Return</h1>
              <p>
                Return products from an existing supplier purchase.
              </p>
            </div>

            <div className="purchase-return-header-tag">
              <span className="purchase-return-header-icon">
                <BsArrowCounterclockwise />
              </span>

              <div>
                <strong>Purchase Return</strong>
                <small>Inventory &amp; refunds</small>
              </div>
            </div>
          </div>

          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError("")}
              className="purchase-return-error"
            >
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* Purchase Information */}
            <Card className="purchase-return-card">
              <Card.Body>
                <div className="purchase-return-section-heading">
                  <div className="purchase-return-section-icon">
                    <BsBuilding />
                  </div>

                  <div>
                    <h2>Purchase Information</h2>
                    <p>
                      Select the original purchase and return date.
                    </p>
                  </div>
                </div>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label className="purchase-return-label">
                      Select Purchase <span>*</span>
                    </Form.Label>

                    <Form.Select
                      value={selectedPurchaseId}
                      onChange={(e) =>
                        handlePurchaseChange(e.target.value)
                      }
                      className="purchase-return-input"
                      required
                    >
                      <option value="">Select a purchase</option>

                      {purchases.map((purchase) => (
                        <option
                          key={purchase._id}
                          value={purchase._id}
                        >
                          {purchase.purchaseNumber} —{" "}
                          {purchase.supplierName}
                        </option>
                      ))}
                    </Form.Select>

                    {purchases.length === 0 && (
                      <small className="purchase-return-hint warning">
                        No purchases found. Record a purchase first.
                      </small>
                    )}
                  </Col>

                  <Col md={6}>
                    <Form.Label className="purchase-return-label">
                      Return Date <span>*</span>
                    </Form.Label>

                    <div className="purchase-return-date-wrapper">
                      <BsCalendar3 className="purchase-return-date-icon" />

                      <Form.Control
                        type="date"
                        value={returnDate}
                        onChange={(e) =>
                          setReturnDate(e.target.value)
                        }
                        className="purchase-return-input purchase-return-date-input"
                        required
                      />
                    </div>
                  </Col>

                  {selectedPurchase && (
                    <>
                      <Col md={6}>
                        <Form.Label className="purchase-return-label">
                          Supplier
                        </Form.Label>

                        <Form.Control
                          value={selectedPurchase.supplierName || ""}
                          readOnly
                          className="purchase-return-input"
                        />
                      </Col>

                      <Col md={6}>
                        <Form.Label className="purchase-return-label">
                          Purchase Number
                        </Form.Label>

                        <Form.Control
                          value={selectedPurchase.purchaseNumber || ""}
                          readOnly
                          className="purchase-return-input"
                        />
                      </Col>
                    </>
                  )}
                </Row>
              </Card.Body>
            </Card>

            {/* Original Purchase Items */}
            {selectedPurchase && (
              <Card className="purchase-return-card">
                <Card.Body>
                  <div className="purchase-return-section-heading">
                    <div className="purchase-return-section-icon">
                      <BsBoxSeam />
                    </div>

                    <div>
                      <h2>Original Purchase Items</h2>
                      <p>
                        Select the products you want to return.
                      </p>
                    </div>
                  </div>

                  {selectedPurchase.items?.length > 0 ? (
                    <div className="table-responsive">
                      <Table className="purchase-return-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Purchased Qty</th>
                            <th>Returned Qty</th>
                            <th>Available Qty</th>
                            <th>Unit Price</th>
                            <th>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {selectedPurchase.items.map((item, index) => {
                            const available =
                              getAvailableQuantity(item);

                            const added = isItemAdded(item._id);

                            return (
                              <tr key={item._id || index}>
                                <td>
                                  <div className="purchase-return-product-name">
                                    {item.productName}
                                  </div>

                                  <div className="purchase-return-product-code">
                                    Code: {item.productCode || "N/A"}
                                  </div>
                                </td>

                                <td>{item.quantity}</td>

                                <td>
                                  {item.returnedQuantity || 0}
                                </td>

                                <td>
                                  <strong>{available}</strong>
                                </td>

                                <td>
                                  {formatCurrency(item.purchasePrice)}
                                </td>

                                <td>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="purchase-return-add-button"
                                    disabled={added || available <= 0}
                                    onClick={() => addItem(item)}
                                  >
                                    {added ? "Added" : "Add"}
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <Alert variant="warning">
                      This purchase does not contain any products.
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* Products to Return */}
            {selectedPurchase && (
              <Card className="purchase-return-card">
                <Card.Body>
                  <div className="purchase-return-section-heading">
                    <div className="purchase-return-section-icon">
                      <BsArrowCounterclockwise />
                    </div>

                    <div>
                      <h2>Products to Return</h2>
                      <p>
                        Enter the quantity and reason for each return.
                      </p>
                    </div>
                  </div>

                  {returnItems.length === 0 ? (
                    <p className="purchase-return-hint">
                      No products selected yet. Add products from the
                      original purchase above.
                    </p>
                  ) : (
                    <div className="purchase-return-items-list">
                      {returnItems.map((item, index) => (
                        <div
                          className="purchase-return-item-row"
                          key={item.purchaseItemId}
                        >
                          <div className="purchase-return-item-heading">
                            <div className="purchase-return-item-number">
                              <span>
                                {String(index + 1).padStart(2, "0")}
                              </span>

                              <strong>{item.productName}</strong>
                            </div>

                            <button
                              type="button"
                              className="purchase-return-remove-button"
                              title="Remove item"
                              onClick={() =>
                                removeItem(item.purchaseItemId)
                              }
                            >
                              <BsTrash3 />
                              <span>Remove</span>
                            </button>
                          </div>

                          <Row className="g-3 align-items-end">
                            <Col lg={2} md={4} sm={6}>
                              <Form.Label className="purchase-return-label">
                                Return Qty <span>*</span>
                              </Form.Label>

                              <Form.Control
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(
                                    item.purchaseItemId,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                className="purchase-return-input"
                                required
                              />
                            </Col>

                            <Col lg={2} md={4} sm={6}>
                              <Form.Label className="purchase-return-label">
                                Available Qty
                              </Form.Label>

                              <div className="purchase-return-item-total">
                                {item.availableQuantity}
                              </div>
                            </Col>

                            <Col lg={2} md={4} sm={6}>
                              <Form.Label className="purchase-return-label">
                                Unit Price
                              </Form.Label>

                              <div className="purchase-return-item-total">
                                {formatCurrency(item.purchasePrice)}
                              </div>
                            </Col>

                            <Col lg={2} md={4} sm={6}>
                              <Form.Label className="purchase-return-label">
                                Item Total
                              </Form.Label>

                              <div className="purchase-return-item-total">
                                {formatCurrency(
                                  Number(item.quantity || 0) *
                                    item.purchasePrice
                                )}
                              </div>
                            </Col>

                            <Col lg={4} md={8} sm={12}>
                              <Form.Label className="purchase-return-label">
                                Return Reason
                              </Form.Label>

                              <Form.Control
                                type="text"
                                value={item.reason}
                                onChange={(e) =>
                                  updateItem(
                                    item.purchaseItemId,
                                    "reason",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter reason (optional)"
                                className="purchase-return-input"
                              />
                            </Col>
                          </Row>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="purchase-return-total-bar">
                    <div>
                      <span className="purchase-return-total-caption">
                        ITEMS SELECTED
                      </span>

                      <strong>
                        {returnItems.length} product row(s)
                      </strong>
                    </div>

                    <div className="purchase-return-grand-total">
                      <span>Return Total</span>
                      <strong>{formatCurrency(grandTotal)}</strong>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Refund Details */}
            {selectedPurchase && (
              <Row className="g-3">
                <Col lg={7}>
                  <Card className="purchase-return-card">
                    <Card.Body>
                      <div className="purchase-return-section-heading">
                        <div className="purchase-return-section-icon">
                          <BsWallet2 />
                        </div>

                        <div>
                          <h2>Refund Details</h2>
                          <p>
                            Enter the refund amount and payment method.
                          </p>
                        </div>
                      </div>

                      <Row className="g-3">
                        <Col sm={6}>
                          <Form.Label className="purchase-return-label">
                            Refund Method <span>*</span>
                          </Form.Label>

                          <Form.Select
                            value={refundMethod}
                            onChange={(e) =>
                              setRefundMethod(e.target.value)
                            }
                            className="purchase-return-input"
                            required
                          >
                            <option value="Credit Note">
                              Credit Note
                            </option>
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">
                              Bank Transfer
                            </option>
                            <option value="UPI">UPI</option>
                            <option value="Card">Card</option>
                            <option value="Cheque">Cheque</option>
                          </Form.Select>
                        </Col>

                        <Col sm={6}>
                          <Form.Label className="purchase-return-label">
                            Refund Amount (₹)
                          </Form.Label>

                          <Form.Control
                            type="number"
                            min="0"
                            max={grandTotal}
                            step="0.01"
                            value={refundAmount}
                            onChange={(e) =>
                              setRefundAmount(e.target.value)
                            }
                            className="purchase-return-input"
                          />

                          <small className="purchase-return-hint">
                            Maximum: {formatCurrency(grandTotal)}
                          </small>
                        </Col>
                      </Row>

                      <Row className="g-3 mt-2">
                        <Col sm={6}>
                          <div className="purchase-return-summary-tile">
                            <div className="purchase-return-tile-label">
                              <BsCurrencyRupee />
                              Return Value
                            </div>

                            <strong>{formatCurrency(grandTotal)}</strong>
                          </div>
                        </Col>

                        <Col sm={6}>
                          <div className="purchase-return-summary-tile">
                            <div className="purchase-return-tile-label">
                              <BsCheckCircle />
                              Refund Amount
                            </div>

                            <strong>{formatCurrency(refund)}</strong>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={5}>
                  <Card className="purchase-return-card">
                    <Card.Body>
                      <div className="purchase-return-section-heading">
                        <div className="purchase-return-section-icon">
                          <BsCalendar3 />
                        </div>

                        <div>
                          <h2>Additional Notes</h2>
                          <p>
                            Optional purchase return information.
                          </p>
                        </div>
                      </div>

                      <Form.Control
                        as="textarea"
                        rows={5}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter return details or additional notes..."
                        className="purchase-return-input purchase-return-notes-input"
                      />
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Footer */}
            {selectedPurchase && (
              <div className="purchase-return-form-footer">
                <div className="purchase-return-footer-note">
                  <span>*</span> Required fields
                </div>

                <div className="purchase-return-footer-actions">
                  <Button
                    type="button"
                    className="purchase-return-cancel-button"
                    onClick={() => navigate("/purchase-returns")}
                    disabled={saving}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="purchase-return-save-button"
                    disabled={
                      saving ||
                      returnItems.length === 0
                    }
                  >
                    {saving ? (
                      <>
                        <Spinner size="sm" animation="border" />
                        Saving Return...
                      </>
                    ) : (
                      <>
                        <BsBagCheck />
                        Save Purchase Return
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Form>
        </div>
      )}
    </div>
  );
}
