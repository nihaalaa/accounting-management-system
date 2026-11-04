
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Col,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import axios from "axios";
import {
  BsArrowLeft,
  BsPencil,
  BsBoxSeam,
  BsCalendar3,
  BsBuilding,
  BsFileText,
  BsCashStack,
  BsReceipt,
} from "react-icons/bs";

const API = import.meta.env.VITE_API_URL;

const ViewPurchaseReturn = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [purchaseReturn, setPurchaseReturn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPurchaseReturn = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API}/purchase-returns/${id}`
        );

        setPurchaseReturn(response.data);
      } catch (err) {
        console.error("Error fetching purchase return:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load purchase return details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseReturn();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  if (loading) {
    return (
      <div className="view-purchase-return-page">
        <div className="view-purchase-return-loading">
          <Spinner animation="border" variant="primary" />
          <p>Loading purchase return details...</p>
        </div>
      </div>
    );
  }

  if (error || !purchaseReturn) {
    return (
      <div className="view-purchase-return-page">
        <div className="view-purchase-return-container">
          <Alert variant="danger">
            {error || "Purchase return not found."}
          </Alert>

          <Button
            variant="outline-secondary"
            onClick={() => navigate("/purchase-returns")}
          >
            <BsArrowLeft className="me-2" />
            Back to Purchase Returns
          </Button>
        </div>
      </div>
    );
  }

  const items = purchaseReturn.items || [];

  return (
    <div className="view-purchase-return-page">
      <div className="view-purchase-return-container">

        {/* Header */}
        <div className="view-purchase-return-header">
          <div>
            <button
              className="view-purchase-return-back-link"
              onClick={() => navigate("/purchase-returns")}
            >
              <BsArrowLeft /> Back to Purchase Returns
            </button>

            <h2>Purchase Return Details</h2>
            <p>View the complete details of this purchase return</p>
          </div>

          <div className="view-purchase-return-header-actions">
            <span className="view-purchase-return-tag">
              <BsReceipt className="me-2" />
              {purchaseReturn.returnNumber || "Purchase Return"}
            </span>

            <Button
              className="view-purchase-return-edit-button"
              onClick={() =>
                navigate(`/purchase-returns/edit/${purchaseReturn._id}`)
              }
            >
              <BsPencil className="me-2" />
              Edit Return
            </Button>
          </div>
        </div>

        {/* Return Information */}
        <Card className="view-purchase-return-card">
          <Card.Body>
            <div className="view-purchase-return-section-heading">
              <BsFileText />
              <h5>Return Information</h5>
            </div>

            <Row className="g-4">
              <Col md={4}>
                <div className="view-purchase-return-info">
                  <span>Return Number</span>
                  <strong>{purchaseReturn.returnNumber || "-"}</strong>
                </div>
              </Col>

              <Col md={4}>
                <div className="view-purchase-return-info">
                  <span>Return Date</span>
                  <strong>
                    <BsCalendar3 className="me-2" />
                    {formatDate(purchaseReturn.returnDate)}
                  </strong>
                </div>
              </Col>

              <Col md={4}>
                <div className="view-purchase-return-info">
                  <span>Purchase Number</span>
                  <strong>
                    {purchaseReturn.purchaseNumber || "-"}
                  </strong>
                </div>
              </Col>

              <Col md={6}>
                <div className="view-purchase-return-info">
                  <span>Supplier</span>
                  <strong>
                    <BsBuilding className="me-2" />
                    {purchaseReturn.supplierName || "-"}
                  </strong>
                </div>
              </Col>

              <Col md={6}>
                <div className="view-purchase-return-info">
                  <span>Refund Method</span>
                  <strong>
                    {purchaseReturn.refundMethod || "-"}
                  </strong>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Returned Products */}
        <Card className="view-purchase-return-card">
          <Card.Body>
            <div className="view-purchase-return-section-heading">
              <BsBoxSeam />
              <h5>Returned Products</h5>
            </div>

            <div className="table-responsive">
              <Table className="view-purchase-return-table" hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Product Code</th>
                    <th>Quantity</th>
                    <th>Purchase Price</th>
                    <th>Reason</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <tr key={item._id || index}>
                        <td>{index + 1}</td>

                        <td>
                          <strong>{item.productName || "-"}</strong>
                        </td>

                        <td>{item.productCode || "-"}</td>

                        <td>{item.quantity}</td>

                        <td>{formatCurrency(item.purchasePrice)}</td>

                        <td>{item.reason || "-"}</td>

                        <td className="text-end fw-semibold">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No returned products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            <div className="view-purchase-return-total">
              <div>
                <span>Total Return Amount</span>
                <h3>{formatCurrency(purchaseReturn.grandTotal)}</h3>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Refund Information */}
        <Card className="view-purchase-return-card">
          <Card.Body>
            <div className="view-purchase-return-section-heading">
              <BsCashStack />
              <h5>Refund Information</h5>
            </div>

            <Row className="g-4">
              <Col md={6}>
                <div className="view-purchase-return-info">
                  <span>Refund Method</span>
                  <strong>{purchaseReturn.refundMethod || "-"}</strong>
                </div>
              </Col>

              <Col md={6}>
                <div className="view-purchase-return-info">
                  <span>Refund Amount</span>
                  <strong className="view-purchase-return-refund">
                    {formatCurrency(purchaseReturn.refundAmount)}
                  </strong>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Notes */}
        <Card className="view-purchase-return-card">
          <Card.Body>
            <div className="view-purchase-return-section-heading">
              <BsFileText />
              <h5>Additional Notes</h5>
            </div>

            <div className="view-purchase-return-notes">
              {purchaseReturn.notes || "No additional notes."}
            </div>
          </Card.Body>
        </Card>

        {/* Footer */}
        <div className="view-purchase-return-footer">
          <Button
            className="view-purchase-return-back-button"
            onClick={() => navigate("/purchase-returns")}
          >
            <BsArrowLeft className="me-2" />
            Back
          </Button>

          <Button
            className="view-purchase-return-edit-button"
            onClick={() =>
              navigate(`/purchase-returns/edit/${purchaseReturn._id}`)
            }
          >
            <BsPencil className="me-2" />
            Edit Return
          </Button>
        </div>
      </div>

      <style>{`
        .view-purchase-return-page {
          min-height: 100vh;
          padding: 26px;
          background: #f3f4f8;
          color: #243449;
          font-family: Inter, system-ui, sans-serif;
          overflow-x: hidden;
        }

        .view-purchase-return-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .view-purchase-return-loading {
          min-height: 70vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: #64748b;
        }

        .view-purchase-return-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }

        .view-purchase-return-header h2 {
          font-size: 25px;
          font-weight: 700;
          margin: 12px 0 5px;
          color: #243449;
        }

        .view-purchase-return-header p {
          color: #718096;
          margin: 0;
          font-size: 14px;
        }

        .view-purchase-return-back-link {
          border: none;
          background: none;
          color: #3b6b9d;
          padding: 0;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .view-purchase-return-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .view-purchase-return-tag {
          display: inline-flex;
          align-items: center;
          padding: 10px 14px;
          border-radius: 8px;
          background: #e6eff8;
          color: #3b6b9d;
          font-weight: 700;
          font-size: 13px;
        }

        .view-purchase-return-card {
          border: none;
          border-radius: 12px;
          margin-bottom: 20px;
          box-shadow: 0 3px 14px rgba(30, 50, 80, 0.05);
        }

        .view-purchase-return-card .card-body {
          padding: 24px;
        }

        .view-purchase-return-section-heading {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          color: #3b6b9d;
        }

        .view-purchase-return-section-heading svg {
          font-size: 19px;
        }

        .view-purchase-return-section-heading h5 {
          font-size: 17px;
          font-weight: 700;
          margin: 0;
          color: #243449;
        }

        .view-purchase-return-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .view-purchase-return-info span {
          color: #8290a3;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .view-purchase-return-info strong {
          color: #243449;
          font-size: 14px;
          font-weight: 600;
          overflow-wrap: anywhere;
        }

        .view-purchase-return-table {
          vertical-align: middle;
          min-width: 850px;
          margin-bottom: 0;
        }

        .view-purchase-return-table thead th {
          background: #f5f7fa;
          color: #65758b;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 14px 12px;
          border-bottom: 1px solid #e7ebf1;
          white-space: nowrap;
        }

        .view-purchase-return-table tbody td {
          padding: 15px 12px;
          font-size: 13px;
          color: #526176;
          border-bottom: 1px solid #edf0f4;
        }

        .view-purchase-return-table tbody tr:last-child td {
          border-bottom: none;
        }

        .view-purchase-return-total {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .view-purchase-return-total > div {
          min-width: 240px;
          padding: 18px 22px;
          border-radius: 10px;
          background: #edf3f9;
          text-align: right;
        }

        .view-purchase-return-total span {
          color: #718096;
          font-size: 13px;
          font-weight: 600;
        }

        .view-purchase-return-total h3 {
          color: #3b6b9d;
          font-size: 23px;
          font-weight: 800;
          margin: 7px 0 0;
        }

        .view-purchase-return-refund {
          color: #26845b !important;
        }

        .view-purchase-return-notes {
          padding: 15px;
          background: #f7f9fc;
          border: 1px solid #e9edf3;
          border-radius: 8px;
          color: #526176;
          font-size: 14px;
          min-height: 55px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .view-purchase-return-footer {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 25px;
        }

        .view-purchase-return-edit-button {
          background: #3b6b9d;
          border: 1px solid #3b6b9d;
          border-radius: 7px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
        }

        .view-purchase-return-edit-button:hover {
          background: #2e587f;
          border-color: #2e587f;
        }

        .view-purchase-return-back-button {
          background: #fff;
          color: #526176;
          border: 1px solid #dce2e9;
          border-radius: 7px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
        }

        .view-purchase-return-back-button:hover {
          background: #f1f4f8;
          color: #243449;
          border-color: #cbd5e1;
        }

        @media (max-width: 768px) {
          .view-purchase-return-page {
            padding: 16px;
          }

          .view-purchase-return-card .card-body {
            padding: 18px;
          }

          .view-purchase-return-header {
            align-items: flex-start;
          }

          .view-purchase-return-header h2 {
            font-size: 21px;
          }

          .view-purchase-return-header-actions {
            width: 100%;
          }

          .view-purchase-return-footer {
            flex-direction: column;
          }

          .view-purchase-return-footer button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewPurchaseReturn;
