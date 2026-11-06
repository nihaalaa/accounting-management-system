
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Button,
  Card,
  Row,
  Col,
  Table,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import {
  BsArrowLeft,
  BsReceipt,
  BsPerson,
  BsBoxSeam,
  BsCalendar,
  BsFileEarmarkText,
} from "react-icons/bs";

const API_URL = import.meta.env.VITE_API_URL;

function ViewQuotation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API_URL}/quotations/${id}`);

      setQuotation(res.data);
    } catch (err) {
      console.error("Fetch quotation error:", err);

      setError(
        err.response?.data?.message ||
        "Failed to load quotation details."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not specified";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      Draft: {
        color: "#475569",
        backgroundColor: "#f1f5f9",
      },
      Sent: {
        color: "#1d4ed8",
        backgroundColor: "#eff6ff",
      },
      Accepted: {
        color: "#047857",
        backgroundColor: "#ecfdf5",
      },
      Rejected: {
        color: "#b91c1c",
        backgroundColor: "#fef2f2",
      },
      Converted: {
        color: "#6d28d9",
        backgroundColor: "#f5f3ff",
      },
      Expired: {
        color: "#b45309",
        backgroundColor: "#fffbeb",
      },
    };

    return styles[status] || styles.Draft;
  };

  const pageStyle = {
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    padding: "28px 16px",
  };

  const containerStyle = {
    maxWidth: "1150px",
    margin: "0 auto",
  };

  const pageTitle = {
    fontSize: "25px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "5px",
  };

  const subtitle = {
    color: "#64748b",
    fontSize: "13px",
    marginBottom: 0,
  };

  const cardStyle = {
    border: "1px solid #e5eaf0",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
    marginBottom: "20px",
  };

  const cardHeaderStyle = {
    backgroundColor: "#fff",
    borderBottom: "1px solid #edf0f4",
    padding: "17px 20px",
    borderRadius: "12px 12px 0 0",
  };

  const cardTitle = {
    fontSize: "15px",
    fontWeight: "700",
    color: "#334155",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "9px",
  };

  const labelStyle = {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "5px",
  };

  const valueStyle = {
    color: "#1e293b",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: 0,
    overflowWrap: "anywhere",
  };

  const detailStyle = {
    padding: "18px 20px",
  };

  if (loading) {
    return (
      <div
        style={{
          ...pageStyle,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="text-center">
          <Spinner animation="border" style={{ color: "#3b6b9d" }} />
          <p className="mt-3" style={{ color: "#64748b" }}>
            Loading quotation details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <Alert variant="danger">
            {error || "Quotation not found."}
          </Alert>

          <Button
            variant="outline-secondary"
            onClick={() => navigate("/quotations")}
          >
            <BsArrowLeft className="me-2" />
            Back to Quotations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .quotation-view-table th {
          background: #f8fafc !important;
          color: #64748b !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          padding: 13px 12px !important;
          border-bottom: 1px solid #e5eaf0 !important;
          white-space: nowrap;
        }

        .quotation-view-table td {
          padding: 14px 12px !important;
          font-size: 13px;
          color: #334155;
          vertical-align: middle;
        }

        .quotation-view-table tbody tr:last-child td {
          border-bottom: none;
        }

        @media (max-width: 576px) {
          .quotation-view-page {
            padding: 18px 10px !important;
          }

          .quotation-view-header {
            align-items: flex-start !important;
            flex-direction: column;
          }

          .quotation-view-table {
            min-width: 650px;
          }
        }
      `}</style>

      <div
        className="quotation-view-page"
        style={pageStyle}
      >
        <div style={containerStyle}>

          {/* PAGE HEADER */}
          <div
            className="quotation-view-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              marginBottom: "25px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "9px",
                }}
              >
                Sales / Quotations / View
              </div>

              <h1 style={pageTitle}>
                Quotation Details
              </h1>

              <p style={subtitle}>
                View the complete information for this quotation.
              </p>
            </div>

            <Button
              variant="outline-secondary"
              onClick={() => navigate("/quotations")}
              style={{
                borderRadius: "7px",
                fontSize: "13px",
                fontWeight: "600",
                padding: "9px 15px",
                whiteSpace: "nowrap",
              }}
            >
              <BsArrowLeft className="me-2" />
              Back to Quotations
            </Button>
          </div>

          {/* QUOTATION SUMMARY */}
          <Card style={cardStyle}>
            <Card.Body style={detailStyle}>
              <Row className="g-4 align-items-center">
                <Col md={6}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "13px",
                    }}
                  >
                    <div
                      style={{
                        width: "45px",
                        height: "45px",
                        borderRadius: "10px",
                        backgroundColor: "#eff6ff",
                        color: "#3b6b9d",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <BsReceipt size={21} />
                    </div>

                    <div>
                      <div style={labelStyle}>
                        QUOTATION NUMBER
                      </div>

                      <h5
                        style={{
                          fontSize: "19px",
                          fontWeight: "700",
                          color: "#1e293b",
                          margin: 0,
                        }}
                      >
                        {quotation.quotationNumber}
                      </h5>
                    </div>
                  </div>
                </Col>

                <Col md={6} className="text-md-end">
                  <div style={labelStyle}>
                    QUOTATION STATUS
                  </div>

                  <Badge
                    pill
                    style={{
                      ...getStatusStyle(quotation.status),
                      padding: "7px 13px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {quotation.status || "Draft"}
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* QUOTATION INFORMATION */}
          <Card style={cardStyle}>
            <div style={cardHeaderStyle}>
              <h2 style={cardTitle}>
                <BsCalendar color="#3b6b9d" size={17} />
                Quotation Information
              </h2>
            </div>

            <Card.Body style={detailStyle}>
              <Row className="g-4">
                <Col md={4} sm={6}>
                  <div style={labelStyle}>Quotation Number</div>
                  <p style={valueStyle}>
                    {quotation.quotationNumber}
                  </p>
                </Col>

                <Col md={4} sm={6}>
                  <div style={labelStyle}>Quotation Date</div>
                  <p style={valueStyle}>
                    {formatDate(quotation.date)}
                  </p>
                </Col>

                <Col md={4} sm={6}>
                  <div style={labelStyle}>Valid Until</div>
                  <p style={valueStyle}>
                    {formatDate(quotation.validUntil)}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* CUSTOMER INFORMATION */}
          <Card style={cardStyle}>
            <div style={cardHeaderStyle}>
              <h2 style={cardTitle}>
                <BsPerson color="#3b6b9d" size={18} />
                Customer Information
              </h2>
            </div>

            <Card.Body style={detailStyle}>
              <Row className="g-4">
                <Col md={4} sm={6}>
                  <div style={labelStyle}>Customer Name</div>
                  <p style={valueStyle}>
                    {quotation.customerName || "Walk-in Customer"}
                  </p>
                </Col>

                <Col md={4} sm={6}>
                  <div style={labelStyle}>Phone Number</div>
                  <p style={valueStyle}>
                    {quotation.customerPhone || "Not provided"}
                  </p>
                </Col>

                <Col md={4} sm={6}>
                  <div style={labelStyle}>Customer Address</div>
                  <p style={valueStyle}>
                    {quotation.customerAddress || "Not provided"}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* PRODUCT INFORMATION */}
          <Card style={cardStyle}>
            <div style={cardHeaderStyle}>
              <h2 style={cardTitle}>
                <BsBoxSeam color="#3b6b9d" size={17} />
                Quotation Items
              </h2>
            </div>

            <div style={{ overflowX: "auto" }}>
              <Table
                responsive
                hover
                className="quotation-view-table mb-0"
              >
                <thead>
                  <tr>
                    <th style={{ paddingLeft: "20px" }}>#</th>
                    <th>Product Name</th>
                    <th className="text-center">Quantity</th>
                    <th className="text-end">Unit Price</th>
                    <th className="text-center">Tax</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {quotation.items?.length > 0 ? (
                    quotation.items.map((item, index) => (
                      <tr key={index}>
                        <td style={{ paddingLeft: "20px" }}>
                          {index + 1}
                        </td>

                        <td>
                          <span style={{ fontWeight: "600" }}>
                            {item.productName}
                          </span>
                        </td>

                        <td className="text-center">
                          {item.quantity}
                        </td>

                        <td className="text-end">
                          {formatCurrency(item.price)}
                        </td>

                        <td className="text-center">
                          {Number(item.tax || 0)}%
                        </td>

                        <td className="text-end">
                          <strong>
                            {formatCurrency(item.total)}
                          </strong>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center text-muted py-4"
                      >
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* TOTALS */}
            <Card.Body
              style={{
                padding: "20px",
                borderTop: "1px solid #edf0f4",
              }}
            >
              <Row className="justify-content-end">
                <Col md={5} lg={4}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      fontSize: "13px",
                    }}
                  >
                    <span style={{ color: "#64748b" }}>
                      Subtotal
                    </span>

                    <strong>
                      {formatCurrency(quotation.subtotal)}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      fontSize: "13px",
                    }}
                  >
                    <span style={{ color: "#64748b" }}>
                      Tax Amount
                    </span>

                    <strong>
                      {formatCurrency(quotation.taxAmount)}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      fontSize: "13px",
                    }}
                  >
                    <span style={{ color: "#64748b" }}>
                      Discount
                    </span>

                    <strong style={{ color: "#dc2626" }}>
                      - {formatCurrency(quotation.discount)}
                    </strong>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #e2e8f0",
                      marginTop: "9px",
                      paddingTop: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "#1e293b",
                      }}
                    >
                      Grand Total
                    </span>

                    <strong
                      style={{
                        fontSize: "20px",
                        color: "#3b6b9d",
                      }}
                    >
                      {formatCurrency(quotation.grandTotal)}
                    </strong>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* NOTES */}
          <Card style={cardStyle}>
            <div style={cardHeaderStyle}>
              <h2 style={cardTitle}>
                <BsFileEarmarkText color="#3b6b9d" size={17} />
                Additional Notes
              </h2>
            </div>

            <Card.Body style={detailStyle}>
              <p
                style={{
                  color: quotation.notes ? "#334155" : "#94a3b8",
                  fontSize: "13px",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {quotation.notes || "No additional notes."}
              </p>
            </Card.Body>
          </Card>

          {/* FOOTER BUTTON */}
          <div className="d-flex justify-content-end mb-4">
            <Link
              to="/quotations"
              style={{
                textDecoration: "none",
                backgroundColor: "#3b6b9d",
                color: "#fff",
                padding: "10px 18px",
                borderRadius: "7px",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              <BsArrowLeft className="me-2" />
              Back to Quotations
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}

export default ViewQuotation;
