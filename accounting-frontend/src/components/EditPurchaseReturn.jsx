
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
  Alert,
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

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function EditPurchaseReturn() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [purchaseReturn, setPurchaseReturn] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [returnItems, setReturnItems] = useState([]);

  const [returnDate, setReturnDate] = useState("");
  const [refundMethod, setRefundMethod] = useState("Credit Note");
  const [refundAmount, setRefundAmount] = useState("0");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch purchase return and original purchase
  useEffect(() => {
    const fetchReturn = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API}/purchase-returns/${id}`
        );

        const data = response.data;
        setPurchaseReturn(data);

        const purchaseId =
          data.purchaseId?._id || data.purchaseId;

        const purchaseResponse = await axios.get(
          `${API}/purchases/${purchaseId}`
        );

        const purchase = purchaseResponse.data;
        setSelectedPurchase(purchase);

        setReturnDate(
          data.returnDate
            ? new Date(data.returnDate).toLocaleDateString("en-CA")
            : ""
        );

        setRefundMethod(data.refundMethod || "Credit Note");
        setRefundAmount(String(data.refundAmount ?? 0));
        setNotes(data.notes || "");

        const mappedItems = (data.items || []).map((returnedItem) => {
          const originalItem = purchase.items.find(
            (item) =>
              String(item._id) === String(returnedItem.purchaseItemId)
          );

          const available = originalItem
            ? Math.max(
                0,
                Number(originalItem.quantity || 0) -
                  Number(originalItem.returnedQuantity || 0) +
                  Number(returnedItem.quantity || 0)
              )
            : Number(returnedItem.quantity || 0);

          return {
            purchaseItemId: returnedItem.purchaseItemId,
            productId:
              returnedItem.productId?._id ||
              returnedItem.productId,
            productName: returnedItem.productName,
            productCode: returnedItem.productCode || "",
            purchasePrice: Number(returnedItem.purchasePrice || 0),
            availableQuantity: available,
            quantity: String(returnedItem.quantity || 1),
            reason: returnedItem.reason || "",
          };
        });

        setReturnItems(mappedItems);
      } catch (err) {
        console.error("Fetch purchase return error:", err);
        console.log("Backend error:", err.response?.data);

        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Unable to load purchase return."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReturn();
  }, [id]);

  // Update item
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

        return { ...item, [field]: value };
      })
    );
  };

  // Remove item
  const removeItem = (purchaseItemId) => {
    setReturnItems((previous) =>
      previous.filter(
        (item) => item.purchaseItemId !== purchaseItemId
      )
    );
  };

  // Calculate total
  const grandTotal = useMemo(
    () =>
      Number(
        returnItems
          .reduce(
            (sum, item) =>
              sum +
              (Number(item.quantity) || 0) *
                Number(item.purchasePrice || 0),
            0
          )
          .toFixed(2)
      ),
    [returnItems]
  );

  const refund =
    refundAmount.trim() === "" ? 0 : Number(refundAmount);

  // Submit changes
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!returnDate) {
      setError("Please select a return date.");
      return;
    }

    if (returnItems.length === 0) {
      setError("Please keep at least one product in the return.");
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
      setError("Please enter a valid return quantity.");
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
      purchaseId: String(
        purchaseReturn.purchaseId?._id ||
          purchaseReturn.purchaseId
      ),
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

      await axios.put(
        `${API}/purchase-returns/${id}`,
        payload
      );

      navigate("/purchase-returns", {
        state: {
          message: "Purchase return updated successfully.",
        },
      });
    } catch (err) {
      console.error("Update purchase return error:", err);
      console.log("Backend error:", err.response?.data);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to update purchase return."
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
          display: block;
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

        .purchase-return-save-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 42px;
          padding: 10px 18px;
          border: 1px solid #3b6b9d !important;
          border-radius: 8px !important;
          background: #3b6b9d !important;
          color: #fff !important;
          font-size: 12px;
          font-weight: 650;
        }

        .purchase-return-save-button:hover:not(:disabled) {
          background: #315a85 !important;
          transform: translateY(-1px);
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

        .purchase-return-error {
          border-radius: 9px;
          font-size: 12px;
        }

        @media (max-width: 767px) {
          .add-purchase-return-page {
            padding: 18px 12px;
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

          .purchase-return-item-row {
            padding: 13px;
          }

          .purchase-return-total-bar {
            align-items: flex-start;
          }

          .purchase-return-grand-total {
            width: 100%;
            text-align: left;
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
          <p>Loading purchase return...</p>
        </div>
      ) : !purchaseReturn || !selectedPurchase ? (
        <div className="purchase-return-container">
          <Alert variant="danger">{error || "Purchase return not found."}</Alert>
          <Button
            className="purchase-return-cancel-button"
            onClick={() => navigate("/purchase-returns")}
          >
            Back to Purchase Returns
          </Button>
        </div>
      ) : (
        <div className="purchase-return-container">
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

              <h1>Edit Purchase Return</h1>
              <p>Update the returned products and refund details.</p>
            </div>

            <div className="purchase-return-header-tag">
              <span className="purchase-return-header-icon">
                <BsArrowCounterclockwise />
              </span>
              <div>
                <strong>{purchaseReturn.returnNumber}</strong>
                <small>Purchase Return</small>
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
            <Card className="purchase-return-card">
              <Card.Body>
                <div className="purchase-return-section-heading">
                  <div className="purchase-return-section-icon">
                    <BsBuilding />
                  </div>
                  <div>
                    <h2>Purchase Information</h2>
                    <p>Original purchase details.</p>
                  </div>
                </div>

                <Row className="g-3">
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

                  <Col md={6}>
                    <Form.Label className="purchase-return-label">
                      Return Number
                    </Form.Label>
                    <Form.Control
                      value={purchaseReturn.returnNumber || ""}
                      readOnly
                      className="purchase-return-input"
                    />
                  </Col>

                  <Col md={6}>
                    <Form.Label className="purchase-return-label">
                      Return Date *
                    </Form.Label>
                    <div className="purchase-return-date-wrapper">
                      <BsCalendar3 className="purchase-return-date-icon" />
                      <Form.Control
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="purchase-return-input purchase-return-date-input"
                        required
                      />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="purchase-return-card">
              <Card.Body>
                <div className="purchase-return-section-heading">
                  <div className="purchase-return-section-icon">
                    <BsBoxSeam />
                  </div>
                  <div>
                    <h2>Products to Return</h2>
                    <p>Edit the return quantities and reasons.</p>
                  </div>
                </div>

                {returnItems.length === 0 ? (
                  <p className="purchase-return-hint">
                    No products selected.
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
                              Return Qty *
                            </Form.Label>
                            <Form.Control
                              type="text"
                              inputMode="numeric"
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
                              value={item.reason}
                              onChange={(e) =>
                                updateItem(
                                  item.purchaseItemId,
                                  "reason",
                                  e.target.value
                                )
                              }
                              className="purchase-return-input"
                              placeholder="Enter reason (optional)"
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
                    <strong>{returnItems.length} product row(s)</strong>
                  </div>

                  <div className="purchase-return-grand-total">
                    <span>Return Total</span>
                    <strong>{formatCurrency(grandTotal)}</strong>
                  </div>
                </div>
              </Card.Body>
            </Card>

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
                        <p>Update refund information.</p>
                      </div>
                    </div>

                    <Row className="g-3">
                      <Col sm={6}>
                        <Form.Label className="purchase-return-label">
                          Refund Method *
                        </Form.Label>
                        <Form.Select
                          value={refundMethod}
                          onChange={(e) =>
                            setRefundMethod(e.target.value)
                          }
                          className="purchase-return-input"
                          required
                        >
                          <option value="Credit Note">Credit Note</option>
                          <option value="Cash">Cash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
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
                        <p>Optional return information.</p>
                      </div>
                    </div>

                    <Form.Control
                      as="textarea"
                      rows={5}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="purchase-return-input purchase-return-notes-input"
                      placeholder="Enter additional notes..."
                    />
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="purchase-return-form-footer">
              <div className="purchase-return-footer-note">
                * Required fields
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
                  disabled={saving || returnItems.length === 0}
                >
                  {saving ? (
                    <>
                      <Spinner size="sm" animation="border" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <BsBagCheck />
                      Update Purchase Return
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
