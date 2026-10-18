
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Table, Spinner } from "react-bootstrap";
import axios from "axios";
import {
  BsPlus,
  BsBagCheck,
  BsCurrencyRupee,
  BsCheckCircle,
  BsClock,
  BsSearch,
  BsEye,
  BsPencil,
  BsTrash,
} from "react-icons/bs";

const API = import.meta.env.VITE_API_URL;

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

export default function Purchases() {
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = 5;

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/purchases`);

      const data = response.data;

      setPurchases(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.purchases)
          ? data.purchases
          : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load purchases. Please check your backend API."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return purchases.filter((purchase) =>
      [
        purchase.purchaseNumber,
        purchase.supplierName,
        purchase.paymentStatus,
        purchase.notes,
      ].some((value) =>
        String(value || "").toLowerCase().includes(term)
      )
    );
  }, [purchases, search]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const currentPage = Math.min(page, Math.max(totalPages, 1));

  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalAmount = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.grandTotal || 0),
    0
  );

  const paidAmount = purchases.reduce(
    (sum, purchase) => sum + Number(purchase.amountPaid || 0),
    0
  );

  const outstanding = purchases.reduce(
    (sum, purchase) =>
      sum +
      Math.max(
        0,
        Number(purchase.grandTotal || 0) -
          Number(purchase.amountPaid || 0)
      ),
    0
  );

  const paidCount = purchases.filter(
    (purchase) => purchase.paymentStatus === "Paid"
  ).length;

  const pendingCount = purchases.filter(
    (purchase) => purchase.paymentStatus !== "Paid"
  ).length;

  const handleDelete = async (purchase) => {
    const confirmed = window.confirm(
      `Delete ${purchase.purchaseNumber || "this purchase"}? This may also reverse its stock changes.`
    );

    if (!confirmed) return;

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/purchases/${purchase._id}`
      );

      setPurchases((previous) =>
        previous.filter((item) => item._id !== purchase._id)
      );

      alert(response.data?.message || "Purchase deleted successfully.");
    } catch (err) {
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to delete purchase."
      );
    }
  };

  const summary = [
    {
      label: "Total Purchases",
      value: purchases.length,
      hint: "All purchase records",
      icon: <BsBagCheck />,
    },
    {
      label: "Total Amount",
      value: money(totalAmount),
      hint: "Total purchase value",
      icon: <BsCurrencyRupee />,
    },
    {
      label: "Amount Paid",
      value: money(paidAmount),
      hint: "Payments recorded",
      icon: <BsCheckCircle />,
      color: "#047857",
      bg: "#ecfdf5",
    },
    {
      label: "Pending",
      value: pendingCount,
      hint: "Awaiting full payment",
      icon: <BsClock />,
      color: "#b45309",
      bg: "#fffbeb",
    },
    {
      label: "Outstanding",
      value: money(outstanding),
      hint: "Remaining supplier balance",
      icon: <BsCurrencyRupee />,
      color: "#c2410c",
      bg: "#fff7ed",
    },
    {
      label: "Fully Paid",
      value: paidCount,
      hint: "Completed payments",
      icon: <BsCheckCircle />,
      color: "#047857",
      bg: "#ecfdf5",
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.breadcrumb}>Inventory / Purchases</div>
          <h2 style={styles.title}>Purchases</h2>
          <p style={styles.subtitle}>
            Manage supplier purchases and incoming stock.
          </p>
        </div>

        <Link to="/purchases/add" style={styles.link}>
          <Button style={styles.primaryButton}>
            <BsPlus size={18} />
            New Purchase
          </Button>
        </Link>
      </div>

      {/* SUMMARY CARDS */}
      <div style={styles.summaryGrid}>
        {summary.map((item) => (
          <div key={item.label} style={styles.summaryCard}>
            <div
              style={{
                ...styles.summaryIcon,
                color: item.color || "#4b6985",
                backgroundColor: item.bg || "#edf3f7",
              }}
            >
              {item.icon}
            </div>

            <div style={styles.summaryContent}>
              <div style={styles.summaryLabel}>{item.label}</div>
              <div style={styles.summaryValue}>{item.value}</div>
              <div style={styles.summaryHint}>{item.hint}</div>
            </div>
          </div>
        ))}
      </div>

      {/* PURCHASE TABLE */}
      <Card style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h5 style={styles.cardTitle}>Purchase List</h5>
            <p style={styles.cardSubtitle}>
              View and manage supplier purchases.
            </p>
          </div>

          <div style={styles.searchBox}>
            <BsSearch
              size={14}
              style={{ color: "#9aa5b1", flexShrink: 0 }}
            />

            <input
              type="text"
              placeholder="Search purchases..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              style={styles.searchInput}
            />

            <span style={styles.countBadge}>{filtered.length}</span>
          </div>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span>{error}</span>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={fetchPurchases}
            >
              Retry
            </Button>
          </div>
        )}

        <div style={styles.tableWrapper}>
          <Table hover style={styles.table}>
            <thead>
              <tr>
                {[
                  "PURCHASE",
                  "DATE",
                  "SUPPLIER",
                  "ITEMS",
                  "TOTAL",
                  "PAID",
                  "BALANCE",
                  "STATUS",
                  "ACTIONS",
                ].map((heading) => (
                  <th key={heading} style={styles.th}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={styles.empty}>
                    <Spinner
                      animation="border"
                      size="sm"
                      style={{ marginRight: 8 }}
                    />
                    Loading purchases...
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={9} style={styles.empty}>
                    <BsBagCheck size={28} />

                    <div style={styles.emptyTitle}>
                      {search
                        ? "No purchases found"
                        : "No purchases available"}
                    </div>

                    <div style={styles.emptyText}>
                      {search
                        ? "Try another search."
                        : "Create your first purchase to get started."}
                    </div>

                    {!search && (
                      <Link to="/purchases/add" style={styles.link}>
                        <Button
                          style={{
                            ...styles.primaryButton,
                            marginTop: 14,
                          }}
                        >
                          Add Purchase
                        </Button>
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                visible.map((purchase) => {
                  const grandTotal = Number(purchase.grandTotal || 0);
                  const amountPaid = Number(purchase.amountPaid || 0);

                  const balance = Math.max(
                    0,
                    grandTotal - amountPaid
                  );

                  const status = purchase.paymentStatus || "Unpaid";

                  const statusStyle =
                    status === "Paid"
                      ? styles.paidBadge
                      : status === "Partially Paid"
                      ? styles.partialBadge
                      : styles.unpaidBadge;

                  return (
                    <tr key={purchase._id}>
                      <td style={styles.td}>
                        <div style={styles.purchaseNumber}>
                          {purchase.purchaseNumber || "-"}
                        </div>
                        <div style={styles.purchaseId}>
                          ID #{purchase._id?.slice(-6)}
                        </div>
                      </td>

                      <td style={styles.td}>
                        {formatDate(
                          purchase.purchaseDate || purchase.createdAt
                        )}
                      </td>

                      <td style={styles.td}>
                        <div style={styles.supplierName}>
                          {purchase.supplierName || "-"}
                        </div>
                      </td>

                      <td style={styles.td}>
                        <span style={styles.itemsBadge}>
                          {purchase.items?.length || 0} items
                        </span>
                      </td>

                      <td style={styles.amountCell}>
                        {money(grandTotal)}
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          color: "#047857",
                          fontWeight: 600,
                        }}
                      >
                        {money(amountPaid)}
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          color: "#c2410c",
                          fontWeight: 600,
                        }}
                      >
                        {money(balance)}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...statusStyle,
                          }}
                        >
                          {status}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <Button
                            title="View Purchase"
                            aria-label="View Purchase"
                            onClick={() =>
                              navigate(`/purchases/view/${purchase._id}`)
                            }
                            style={styles.actionButton}
                          >
                            <BsEye />
                          </Button>

                          <Button
                            title="Edit Purchase"
                            aria-label="Edit Purchase"
                            onClick={() =>
                              navigate(`/purchases/edit/${purchase._id}`)
                            }
                            style={styles.actionButton}
                          >
                            <BsPencil />
                          </Button>

                          <Button
                            title="Delete Purchase"
                            aria-label="Delete Purchase"
                            onClick={() => handleDelete(purchase)}
                            style={{
                              ...styles.actionButton,
                              color: "#dc2626",
                              borderColor: "#f1caca",
                            }}
                          >
                            <BsTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        {!loading && filtered.length > 0 && (
          <div style={styles.pagination}>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              style={{
                ...styles.pageButton,
                ...(currentPage === 1 ? styles.disabledButton : {}),
              }}
            >
              Previous
            </button>

            <span style={styles.pageText}>
              Page {currentPage} of {Math.max(totalPages, 1)}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              style={{
                ...styles.pageButton,
                ...(currentPage >= totalPages
                  ? styles.disabledButton
                  : {}),
              }}
            >
              Next
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

const styles = {
  page: {
    padding: "28px 34px 40px",
    minHeight: "100vh",
    background: "#f7f9fb",
    boxSizing: "border-box",
    fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif",
    width: "100%",
    maxWidth: "100%",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
    marginBottom: 24,
    flexWrap: "wrap",
  },

  breadcrumb: {
    fontSize: 11,
    color: "#94a3b8",
    marginBottom: 6,
    fontWeight: 500,
  },

  title: {
    margin: 0,
    color: "#1f2937",
    fontSize: 24,
    fontWeight: 650,
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#7b8794",
    fontSize: 12,
  },

  link: {
    textDecoration: "none",
  },

  primaryButton: {
    border: 0,
    background: "#3b6b9d",
    borderRadius: 6,
    padding: "9px 15px",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
    marginBottom: 20,
  },

  summaryCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 14,
    minWidth: 0,
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    boxSizing: "border-box",
  },

  summaryIcon: {
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: 7,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryContent: {
    minWidth: 0,
  },

  summaryLabel: {
    fontSize: 10,
    color: "#7b8794",
  },

  summaryValue: {
    fontSize: 15,
    fontWeight: 650,
    color: "#1f2937",
    marginTop: 3,
    overflowWrap: "anywhere",
  },

  summaryHint: {
    fontSize: 9,
    color: "#a0aab5",
    marginTop: 3,
  },

  card: {
    border: "1px solid #e2e7ec",
    borderRadius: 8,
    overflow: "hidden",
    background: "#fff",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
    flexWrap: "wrap",
    padding: "16px 19px",
    borderBottom: "1px solid #e6eaee",
  },

  cardTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    color: "#273444",
  },

  cardSubtitle: {
    margin: "4px 0 0",
    fontSize: 10,
    color: "#9aa5b1",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    border: "1px solid #d8dee5",
    borderRadius: 6,
    padding: "0 9px",
    height: 34,
    boxSizing: "border-box",
  },

  searchInput: {
    border: 0,
    outline: 0,
    width: 180,
    minWidth: 0,
    fontSize: 11,
    background: "transparent",
  },

  countBadge: {
    background: "#f1f5f8",
    color: "#64748b",
    borderRadius: 5,
    padding: "4px 7px",
    fontSize: 10,
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    margin: 0,
    minWidth: 900,
  },

  th: {
    padding: "11px 13px",
    background: "#f8fafb",
    color: "#7a8694",
    fontSize: 9,
    fontWeight: 650,
    whiteSpace: "nowrap",
    borderBottom: "1px solid #e4e8ec",
  },

  td: {
    padding: 13,
    verticalAlign: "middle",
    borderBottom: "1px solid #f0f2f4",
    fontSize: 11,
    color: "#4b5563",
    whiteSpace: "nowrap",
  },

  purchaseNumber: {
    fontWeight: 600,
    color: "#344454",
  },

  purchaseId: {
    fontSize: 9,
    color: "#9aa5b1",
  },

  supplierName: {
    fontWeight: 600,
  },

  amountCell: {
    padding: 13,
    verticalAlign: "middle",
    borderBottom: "1px solid #f0f2f4",
    fontSize: 11,
    fontWeight: 650,
    color: "#4b5563",
    whiteSpace: "nowrap",
  },

  itemsBadge: {
    background: "#f2f5f7",
    color: "#64748b",
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: 9,
  },

  statusBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  paidBadge: {
    background: "#ecfdf5",
    color: "#047857",
  },

  partialBadge: {
    background: "#edf3f7",
    color: "#4b6985",
  },

  unpaidBadge: {
    background: "#fffbeb",
    color: "#b45309",
  },

  actions: {
    display: "flex",
    justifyContent: "center",
    gap: 5,
  },

  actionButton: {
    width: 30,
    height: 30,
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #d9e0e6",
    background: "#fff",
    color: "#4b6985",
    borderRadius: 5,
  },

  empty: {
    textAlign: "center",
    padding: "55px 20px",
    color: "#94a3b8",
    fontSize: 11,
  },

  emptyTitle: {
    fontWeight: 600,
    marginTop: 10,
  },

  emptyText: {
    color: "#9aa5b1",
    marginTop: 4,
  },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderTop: "1px solid #e6eaee",
  },

  pageText: {
    fontSize: 11,
    color: "#64748b",
  },

  pageButton: {
    border: "1px solid #d8dee5",
    background: "#fff",
    color: "#4b5563",
    borderRadius: 5,
    padding: "6px 10px",
    fontSize: 10,
    cursor: "pointer",
  },

  disabledButton: {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  errorBox: {
    padding: 12,
    color: "#b91c1c",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
};