import React, { useEffect, useState } from "react";
import { Button, Card, Spinner, Table, Badge } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  BsArrowLeft,
  BsPerson,
  BsReceipt,
  BsPencil,
  BsTelephone,
  BsEnvelope,
  BsGeoAlt,
  BsPeople,
  BsEye,
} from "react-icons/bs";

const API_URL = import.meta.env.VITE_API_URL;

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime())
    ? "-"
    : parsedDate.toLocaleDateString("en-IN");
};
const getInvoicePaymentAmounts = (invoice) => {
  const total = Number(invoice.grandTotal || 0);

  const status = String(
    invoice.paymentStatus || "Unpaid"
  ).trim().toLowerCase();

  const paid =
    status === "paid"
      ? total
      : Math.min(
          total,
          Math.max(0, Number(invoice.amountReceived ?? 0))
        );

  const outstanding =
    status === "paid"
      ? 0
      : invoice.balanceDue != null
        ? Math.max(0, Number(invoice.balanceDue))
        : Math.max(0, total - paid);

  return { paid, outstanding };
};
const ViewCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [customerResponse, invoiceResponse] =
          await Promise.all([
            axios.get(`${API_URL}/customers/${id}`),
            axios.get(`${API_URL}/invoices`),
          ]);

        const customerData = customerResponse.data;

        const allInvoices = Array.isArray(invoiceResponse.data)
          ? invoiceResponse.data
          : invoiceResponse.data.invoices || [];

        setCustomer(customerData);

        const customerInvoices = allInvoices
          .filter((invoice) => {
            const invoiceCustomerId =
              invoice.customerId?._id ||
              invoice.customerId ||
              invoice.customer?._id ||
              invoice.customer;

            return String(invoiceCustomerId) === String(id);
          })
          .sort(
            (a, b) =>
              new Date(b.date || b.createdAt || 0) -
              new Date(a.date || a.createdAt || 0)
          );

        setInvoices(customerInvoices);
      } catch (err) {
        console.error("Error loading customer details:", err);
        setError("Unable to load customer details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const totalPurchases = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.grandTotal || 0),
    0
  );

const totalPaid = invoices.reduce(
  (sum, invoice) =>
    sum + getInvoicePaymentAmounts(invoice).paid,
  0
);

const outstandingBalance = invoices.reduce(
  (sum, invoice) =>
    sum + getInvoicePaymentAmounts(invoice).outstanding,
  0
);

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>
          <Spinner animation="border" style={{ color: "#3b6b9d" }} />
          <span>Loading customer details...</span>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div style={pageStyle}>
        <Button
          variant="light"
          className="shopledger-back-btn mb-4"
          onClick={() => navigate("/customers")}
        >
          <BsArrowLeft /> Back to Customers
        </Button>

        <Card style={cardStyle}>
          <Card.Body style={{ padding: 28 }}>
            <p style={{ color: "#dc3545", margin: 0 }}>
              {error || "Customer not found."}
            </p>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <style>{`
        .shopledger-back-btn {
          background: #ffffff;
          color: #475569;
          border: 1px solid #dbe2ea;
          border-radius: 7px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .shopledger-back-btn:hover {
          background: #edf3f8;
          color: #315a85;
          border-color: #b9c9d9;
        }

        .shopledger-primary-btn {
          background: #3b6b9d !important;
          border: 1px solid #3b6b9d !important;
          color: #ffffff !important;
          border-radius: 7px !important;
          padding: 8px 15px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
        }

        .shopledger-primary-btn:hover {
          background: #315a85 !important;
          border-color: #315a85 !important;
        }

        .shopledger-outline-btn {
          background: #ffffff !important;
          color: #3b6b9d !important;
          border: 1px solid #b9c9d9 !important;
          border-radius: 6px !important;
          font-size: 11px !important;
          font-weight: 500 !important;
          padding: 6px 10px !important;
          white-space: nowrap;
          transition: all 0.2s ease !important;
        }

        .shopledger-outline-btn:hover {
          background: #edf3f8 !important;
          border-color: #3b6b9d !important;
        }

        .shopledger-table thead th {
          background: #f8fafc;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.35px;
          padding: 14px 16px;
          white-space: nowrap;
        }

        .shopledger-table tbody td {
          padding: 14px 16px;
          font-size: 12px;
          color: #374151;
          border-bottom: 1px solid #edf0f4;
          vertical-align: middle;
          white-space: nowrap;
        }

        .shopledger-table tbody tr:last-child td {
          border-bottom: none;
        }

        .shopledger-table tbody tr:hover td {
          background: #f8fafc;
        }

        @media (max-width: 768px) {
          .shopledger-page {
            padding: 20px 14px !important;
          }

          .shopledger-customer-header {
            align-items: flex-start !important;
          }

          .shopledger-edit-btn {
            width: 100%;
          }

          .shopledger-customer-heading {
            flex: 1;
            min-width: 150px;
          }

          .shopledger-card-body {
            padding: 18px !important;
          }
        }
      `}</style>

      {/* PAGE HEADER */}
      <div style={pageHeaderStyle}>
        <div>
          <div style={breadcrumbStyle}>
            Customers <span style={{ margin: "0 7px" }}>/</span> Customer Details
          </div>

          <h4 style={pageTitleStyle}>Customer Details</h4>

          <p style={pageSubtitleStyle}>
            View customer information and purchase history.
          </p>
        </div>

        <Button
          className="shopledger-back-btn"
          onClick={() => navigate("/customers")}
        >
          <BsArrowLeft style={{ marginRight: 6 }} />
          Back to Customers
        </Button>
      </div>

      {/* CUSTOMER DETAILS */}
      <Card style={cardStyle} className="mb-4">
        <Card.Body
          className="shopledger-card-body"
          style={{ padding: 24 }}
        >
          <div
            className="shopledger-customer-header"
            style={customerHeaderStyle}
          >
            <div style={customerIconStyle}>
              <BsPerson size={26} />
            </div>

            <div className="shopledger-customer-heading">
              <h5 style={customerNameStyle}>{customer.name}</h5>

              <div style={customerSubtitleStyle}>
                Customer profile
              </div>
            </div>

            <div style={{ marginLeft: "auto" }}>
              <Button
                className="shopledger-primary-btn shopledger-edit-btn"
                onClick={() =>
                  navigate(`/customers/edit/${customer._id}`)
                }
              >
                <BsPencil style={{ marginRight: 7 }} />
                Edit Customer
              </Button>
            </div>
          </div>

          <div style={sectionDividerStyle} />

          <div style={detailsGridStyle}>
            <Detail
              icon={<BsTelephone />}
              label="Phone Number"
              value={customer.phone}
            />

            <Detail
              icon={<BsEnvelope />}
              label="Email Address"
              value={customer.email}
            />

            <Detail
              icon={<BsPeople />}
              label="Customer Type"
              value={customer.customerType}
            />

            <Detail
              icon={<BsGeoAlt />}
              label="Address"
              value={customer.address}
            />
          </div>
        </Card.Body>
      </Card>

      {/* PURCHASE SUMMARY */}
      <div style={summaryGridStyle}>
        <SummaryCard
          label="Total Invoices"
          value={invoices.length}
          icon={<BsReceipt size={20} />}
          accent="#3b6b9d"
        />

        <SummaryCard
          label="Total Purchases"
          value={formatCurrency(totalPurchases)}
          icon={<BsReceipt size={20} />}
          accent="#3b6b9d"
        />

        <SummaryCard
          label="Total Paid"
          value={formatCurrency(totalPaid)}
          icon={<BsPerson size={20} />}
          accent="#198754"
        />

        <SummaryCard
          label="Outstanding Balance"
          value={formatCurrency(outstandingBalance)}
          icon={<BsReceipt size={20} />}
          accent="#c17b22"
        />
      </div>

      {/* PURCHASE HISTORY */}
      <Card style={cardStyle}>
        <div style={historyHeaderStyle}>
          <div style={historyTitleRowStyle}>
            <div style={historyIconStyle}>
              <BsReceipt size={19} />
            </div>

            <div>
              <h5 style={sectionTitleStyle}>Purchase History</h5>
              <p style={subtitleStyle}>
                All invoices associated with this customer.
              </p>
            </div>
          </div>

          <Badge bg="light" text="dark" style={invoiceCountStyle}>
            {invoices.length} {invoices.length === 1 ? "Invoice" : "Invoices"}
          </Badge>
        </div>

        <div style={{ overflowX: "auto" }}>
          <Table
            hover
            responsive={false}
            className="shopledger-table"
            style={tableStyle}
          >
            <thead>
              <tr>
                <th>INVOICE NO.</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>BALANCE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {invoices.length > 0 ? (
                invoices.map((invoice) => {

                    const { paid, outstanding: balance } =
                    getInvoicePaymentAmounts(invoice);

                    const status = invoice.paymentStatus || "Unknown";

                  const badgeStyle =
                    status === "Paid"
                      ? statusStyles.paid
                      : ["Pending", "Unpaid"].includes(status)
                      ? statusStyles.pending
                      : status === "Partially Paid"
                      ? statusStyles.partial
                      : status === "Unknown"
                      ? statusStyles.unknown
                      : statusStyles.other;
                
                  return (
                    <tr key={invoice._id}>
                      <td>
                        <span style={invoiceNumberStyle}>
                          {invoice.invoiceNumber || "-"}
                        </span>
                      </td>

                      <td>{formatDate(invoice.date || invoice.createdAt)}</td>

                      <td style={amountStyle}>
                        {formatCurrency(invoice.grandTotal)}
                      </td>

                    <td style={{ ...amountStyle, color: "#198754" }}>
                    {formatCurrency(paid)}
                    </td>

                      <td
                        style={{
                          ...amountStyle,
                          color: balance > 0 ? "#b7791f" : "#64748b",
                        }}
                      >
                        {formatCurrency(balance)}
                      </td>

                      <td>
                        <Badge pill style={badgeStyle}>
                          {status}
                        </Badge>
                      </td>

                      <td>
                        <Button
                          className="shopledger-outline-btn"
                          onClick={() =>
                            navigate(`/invoices/view/${invoice._id}`)
                          }
                        >
                          <BsEye style={{ marginRight: 5 }} />
                          View Invoice
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={emptyStateStyle}>
                    <div style={emptyIconStyle}>
                      <BsReceipt size={25} />
                    </div>

                    <div style={emptyTitleStyle}>
                      No purchase history
                    </div>

                    <p style={emptyDescriptionStyle}>
                      Invoices for this customer will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

const Detail = ({ icon, label, value }) => (
  <div style={detailItemStyle}>
    <div style={detailLabelRowStyle}>
      <span style={detailIconStyle}>{icon}</span>
      <span style={detailLabelStyle}>{label}</span>
    </div>

    <div style={detailValueStyle}>{value || "-"}</div>
  </div>
);

const SummaryCard = ({ icon, label, value, accent }) => (
  <Card style={summaryCardStyle}>
    <Card.Body style={{ padding: 18 }}>
      <div style={summaryTopStyle}>
        <div style={{ ...summaryIconStyle, color: accent }}>
          {icon}
        </div>
      </div>

      <div style={summaryLabelStyle}>{label}</div>
      <div style={summaryValueStyle}>{value}</div>
    </Card.Body>
  </Card>
);

const pageStyle = {
  padding: "28px 32px",
  minHeight: "100vh",
  backgroundColor: "#f3f4f8",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
};

const pageHeaderStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 16,
  marginBottom: 24,
};

const breadcrumbStyle = {
  fontSize: 12,
  color: "#64748b",
  marginBottom: 8,
};

const pageTitleStyle = {
  fontSize: 23,
  fontWeight: 650,
  color: "#1f2937",
  margin: 0,
};

const pageSubtitleStyle = {
  fontSize: 13,
  color: "#64748b",
  margin: "7px 0 0",
};

const cardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  backgroundColor: "#ffffff",
  boxShadow: "0 2px 5px rgba(15, 23, 42, 0.025)",
  overflow: "hidden",
};

const customerHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
};

const customerIconStyle = {
  width: 52,
  height: 52,
  flexShrink: 0,
  borderRadius: 10,
  backgroundColor: "#edf3f8",
  color: "#3b6b9d",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const customerNameStyle = {
  margin: 0,
  color: "#1f2937",
  fontSize: 18,
  fontWeight: 650,
};

const customerSubtitleStyle = {
  color: "#64748b",
  fontSize: 12,
  marginTop: 4,
};

const sectionDividerStyle = {
  borderTop: "1px solid #edf0f4",
  margin: "22px 0",
};

const detailsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
  gap: "24px 28px",
};

const detailItemStyle = {
  minWidth: 0,
};

const detailLabelRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  marginBottom: 8,
};

const detailIconStyle = {
  color: "#3b6b9d",
  display: "flex",
  alignItems: "center",
  fontSize: 13,
};

const detailLabelStyle = {
  color: "#64748b",
  fontSize: 11,
  fontWeight: 500,
};

const detailValueStyle = {
  color: "#374151",
  fontSize: 13,
  fontWeight: 500,
  overflowWrap: "anywhere",
  lineHeight: 1.6,
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
  gap: 16,
  marginBottom: 24,
};

const summaryCardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  backgroundColor: "#ffffff",
  boxShadow: "0 2px 5px rgba(15, 23, 42, 0.025)",
};

const summaryTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 14,
};

const summaryIconStyle = {
  width: 38,
  height: 38,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f1f5f9",
  borderRadius: 9,
};

const summaryLabelStyle = {
  fontSize: 11,
  color: "#64748b",
  marginBottom: 7,
};

const summaryValueStyle = {
  fontSize: 18,
  fontWeight: 650,
  color: "#1f2937",
  overflowWrap: "anywhere",
};

const historyHeaderStyle = {
  padding: "20px 22px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 12,
};

const historyTitleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const historyIconStyle = {
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 9,
  backgroundColor: "#edf3f8",
  color: "#3b6b9d",
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: 15,
  fontWeight: 650,
  color: "#1f2937",
};

const subtitleStyle = {
  fontSize: 12,
  color: "#64748b",
  margin: "5px 0 0",
};

const invoiceCountStyle = {
  border: "1px solid #e2e8f0",
  fontSize: 11,
  fontWeight: 500,
  padding: "7px 10px",
};

const tableStyle = {
  marginBottom: 0,
  minWidth: 850,
  verticalAlign: "middle",
};

const invoiceNumberStyle = {
  color: "#3b6b9d",
  fontWeight: 600,
};

const amountStyle = {
  fontWeight: 500,
  fontVariantNumeric: "tabular-nums",
};

const statusStyles = {
  paid: {
    backgroundColor: "#e6f5ec",
    color: "#187344",
    fontSize: 10,
    fontWeight: 600,
    padding: "6px 10px",
  },
  pending: {
    backgroundColor: "#fff3d6",
    color: "#946200",
    fontSize: 10,
    fontWeight: 600,
    padding: "6px 10px",
  },
  partial: {
    backgroundColor: "#e7efff",
    color: "#315a9b",
    fontSize: 10,
    fontWeight: 600,
    padding: "6px 10px",
  },
  unknown: {
    backgroundColor: "#f1f5f9",
    color: "#64748b",
    fontSize: 10,
    fontWeight: 600,
    padding: "6px 10px",
  },
  other: {
    backgroundColor: "#fce8e8",
    color: "#a83232",
    fontSize: 10,
    fontWeight: 600,
    padding: "6px 10px",
  },
};

const emptyStateStyle = {
  textAlign: "center",
  padding: "40px 20px",
  whiteSpace: "normal",
};

const emptyIconStyle = {
  color: "#94a3b8",
  marginBottom: 10,
};

const emptyTitleStyle = {
  color: "#374151",
  fontSize: 14,
  fontWeight: 600,
};

const emptyDescriptionStyle = {
  color: "#94a3b8",
  fontSize: 12,
  margin: "6px 0 0",
};

const loadingStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  minHeight: "60vh",
  color: "#64748b",
  fontSize: 13,
};

export default ViewCustomer;