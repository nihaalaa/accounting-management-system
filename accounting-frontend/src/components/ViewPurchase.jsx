import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Spinner, Table } from "react-bootstrap";
import axios from "axios";
import {
  BsArrowLeft,
  BsPencil,
  BsBagCheck,
  BsBuilding,
  BsCalendar3,
  BsCreditCard,
  BsPerson,
  BsFileText,
  BsBoxSeam,
  BsCheckCircle,
  BsClock,
  BsExclamationCircle,
} from "react-icons/bs";

const API = import.meta.env.VITE_API_URL;

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "-";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ViewPurchase() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch all purchases and find the selected record.
        // This works with the existing GET /purchases endpoint.
        const response = await axios.get(`${API}/purchases`);

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.purchases || [];

        const selected = data.find(
          (item) => String(item._id) === String(id)
        );

        if (!selected) {
          setError("Purchase not found.");
          return;
        }

        setPurchase(selected);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load purchase details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPurchase();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <Spinner animation="border" style={styles.spinner} />
        <p style={styles.loadingText}>Loading purchase details...</p>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div style={styles.page}>
        <Button
          style={styles.backButton}
          onClick={() => navigate("/purchases")}
        >
          <BsArrowLeft /> Back to Purchases
        </Button>

        <Card style={styles.errorCard}>
          <BsExclamationCircle size={30} color="#dc2626" />
          <h5 style={styles.errorTitle}>
            {error || "Purchase not found."}
          </h5>
          <p style={styles.mutedText}>
            The purchase may have been deleted or may no longer be available.
          </p>
          <Button
            style={styles.primaryButton}
            onClick={() => navigate("/purchases")}
          >
            Return to Purchases
          </Button>
        </Card>
      </div>
    );
  }

  const items = Array.isArray(purchase.items) ? purchase.items : [];
  const grandTotal = Number(purchase.grandTotal || 0);
  const amountPaid = Number(purchase.amountPaid || 0);
  const balance = Math.max(0, grandTotal - amountPaid);
  const status = purchase.paymentStatus || "Unpaid";

  const statusStyle =
    status === "Paid"
      ? styles.paidBadge
      : status === "Partially Paid"
      ? styles.partialBadge
      : styles.unpaidBadge;

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.breadcrumb}>
            Inventory / Purchases / View Purchase
          </div>

          <h2 style={styles.title}>Purchase Details</h2>

          <p style={styles.subtitle}>
            View purchase, supplier, inventory and payment information.
          </p>
        </div>

        <div style={styles.headerActions}>
          <Button
            style={styles.backButton}
            onClick={() => navigate("/purchases")}
          >
            <BsArrowLeft /> Back
          </Button>

          {/* <Button
            style={styles.primaryButton}
            onClick={() =>
              navigate(`/purchases/edit/${purchase._id}`)
            }
          >
            <BsPencil /> Edit Purchase
          </Button> */}
        </div>
      </div>

      {/* PURCHASE IDENTIFICATION */}
      <Card style={styles.card}>
        <div style={styles.purchaseHeader}>
          <div style={styles.purchaseHeaderLeft}>
            <div style={styles.mainIcon}>
              <BsBagCheck size={22} />
            </div>

            <div>
              <div style={styles.purchaseLabel}>PURCHASE NUMBER</div>
              <h4 style={styles.purchaseNumber}>
                {purchase.purchaseNumber || "-"}
              </h4>
              <div style={styles.createdText}>
                Record ID: {purchase._id}
              </div>
            </div>
          </div>

          <span style={{ ...styles.statusBadge, ...statusStyle }}>
            {status === "Paid" ? (
              <BsCheckCircle />
            ) : (
              <BsClock />
            )}
            {status}
          </span>
        </div>
      </Card>

      {/* PURCHASE AND SUPPLIER DETAILS */}
      <div style={styles.detailsGrid}>
        <Card style={styles.card}>
          <div style={styles.sectionHeader}>
            <BsFileText style={styles.sectionIcon} />
            <h5 style={styles.sectionTitle}>Purchase Information</h5>
          </div>

          <div style={styles.infoList}>
            <InfoRow
              icon={<BsBagCheck />}
              label="Purchase Number"
              value={purchase.purchaseNumber || "-"}
            />

            <InfoRow
              icon={<BsCalendar3 />}
              label="Purchase Date"
              value={formatDate(
                purchase.purchaseDate || purchase.createdAt
              )}
            />

            <InfoRow
              icon={<BsCalendar3 />}
              label="Created On"
              value={formatDate(purchase.createdAt)}
            />

            <InfoRow
              icon={<BsCreditCard />}
              label="Payment Method"
              value={purchase.paymentMethod || "-"}
            />

            <InfoRow
              icon={<BsClock />}
              label="Payment Status"
              value={status}
            />
          </div>
        </Card>

        <Card style={styles.card}>
          <div style={styles.sectionHeader}>
            <BsBuilding style={styles.sectionIcon} />
            <h5 style={styles.sectionTitle}>Supplier Information</h5>
          </div>

          <div style={styles.infoList}>
            <InfoRow
              icon={<BsPerson />}
              label="Supplier Name"
              value={
                purchase.supplierName ||
                purchase.supplier?.supplierName ||
                "-"
              }
            />

            <InfoRow
              icon={<BsBuilding />}
              label="Company"
              value={
                purchase.companyName ||
                purchase.supplier?.companyName ||
                "-"
              }
            />

            <InfoRow
              icon={<BsCreditCard />}
              label="Supplier ID"
              value={
                typeof purchase.supplier === "object"
                  ? purchase.supplier?._id || "-"
                  : purchase.supplier || purchase.supplierId || "-"
              }
            />
          </div>
        </Card>
      </div>

      {/* PURCHASED ITEMS */}
      <Card style={styles.card}>
        <div style={styles.sectionHeader}>
          <BsBoxSeam style={styles.sectionIcon} />
          <div>
            <h5 style={styles.sectionTitle}>Purchased Items</h5>
            <p style={styles.sectionSubtitle}>
              {items.length} product{items.length !== 1 ? "s" : ""} in this purchase
            </p>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <Table hover style={styles.table}>
            <thead>
              <tr>
                {[
                  "PRODUCT",
                  "QUANTITY",
                  "UNIT PRICE",
                  "TAX",
                  "TOTAL",
                ].map((heading) => (
                  <th key={heading} style={styles.th}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={styles.empty}>
                    No product items found for this purchase.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const quantity = Number(item.quantity || 0);

                  const unitPrice = Number(
                    item.purchasePrice ??
                    item.unitPrice ??
                    item.price ??
                    0
                  );

                  const tax = Number(item.tax || 0);

                  const lineTotal = Number(
                    item.total ??
                    item.lineTotal ??
                    item.subtotal ??
                    quantity * unitPrice * (1 + tax / 100)
                  );

                  return (
                    <tr key={item._id || item.productId || index}>
                      <td style={styles.td}>
                        <div style={styles.productName}>
                          {item.productName ||
                            item.name ||
                            item.product?.name ||
                            "Product"}
                        </div>

                        {(item.productCode || item.code) && (
                          <div style={styles.productCode}>
                            Code: {item.productCode || item.code}
                          </div>
                        )}
                      </td>

                      <td style={styles.td}>
                        {quantity}
                        {item.unit ? ` ${item.unit}` : ""}
                      </td>

                      <td style={styles.td}>{money(unitPrice)}</td>

                      <td style={styles.td}>{tax}%</td>

                      <td style={styles.totalCell}>
                        {money(lineTotal)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        {/* TOTALS */}
        <div style={styles.totalsWrapper}>
          <div style={styles.totalsBox}>
            <div style={styles.totalRow}>
              <span>Subtotal</span>
              <span>{money(purchase.subtotal ?? grandTotal)}</span>
            </div>

            <div style={styles.totalRow}>
              <span>Tax</span>
              <span>{money(purchase.taxAmount ?? purchase.totalTax ?? 0)}</span>
            </div>

            <div style={styles.grandTotalRow}>
              <span>Grand Total</span>
              <span>{money(grandTotal)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* PAYMENT SUMMARY */}
      <Card style={styles.card}>
        <div style={styles.sectionHeader}>
          <BsCreditCard style={styles.sectionIcon} />
          <h5 style={styles.sectionTitle}>Payment Summary</h5>
        </div>

        <div style={styles.paymentGrid}>
          <div style={styles.paymentBox}>
            <div style={styles.paymentLabel}>Total Amount</div>
            <div style={styles.paymentTotal}>{money(grandTotal)}</div>
          </div>

          <div style={styles.paymentBox}>
            <div style={styles.paymentLabel}>Amount Paid</div>
            <div style={styles.paymentPaid}>{money(amountPaid)}</div>
          </div>

          <div style={styles.paymentBox}>
            <div style={styles.paymentLabel}>Outstanding Balance</div>
            <div style={styles.paymentBalance}>{money(balance)}</div>
          </div>
        </div>
      </Card>

      {/* NOTES */}
      {purchase.notes && (
        <Card style={styles.card}>
          <div style={styles.sectionHeader}>
            <BsFileText style={styles.sectionIcon} />
            <h5 style={styles.sectionTitle}>Notes</h5>
          </div>

          <p style={styles.notes}>{purchase.notes}</p>
        </Card>
      )}

      {/* FOOTER ACTIONS */}
      <div style={styles.footerActions}>
        <Button
          style={styles.backButton}
          onClick={() => navigate("/purchases")}
        >
          <BsArrowLeft /> Back to Purchases
        </Button>
{/* 
        <Button
          style={styles.primaryButton}
          onClick={() =>
            navigate(`/purchases/edit/${purchase._id}`)
          }
        >
          <BsPencil /> Edit Purchase
        </Button> */}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={styles.infoRow}>
      <div style={styles.infoIcon}>{icon}</div>

      <div style={styles.infoContent}>
        <div style={styles.infoLabel}>{label}</div>
        <div style={styles.infoValue}>{String(value ?? "-")}</div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "28px 34px 40px",
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    background: "#f7f9fb",
    fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif",
    color: "#344454",
  },

  loadingPage: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f7f9fb",
  },

  spinner: {
    color: "#3b6b9d",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 12,
    color: "#7b8794",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 22,
  },

  breadcrumb: {
    fontSize: 11,
    color: "#94a3b8",
    marginBottom: 6,
  },

  title: {
    fontSize: 24,
    fontWeight: 650,
    color: "#1f2937",
    margin: 0,
  },

  subtitle: {
    margin: "5px 0 0",
    fontSize: 12,
    color: "#7b8794",
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "9px 14px",
    border: 0,
    borderRadius: 6,
    background: "#3b6b9d",
    fontSize: 12,
    fontWeight: 600,
  },

  backButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "8px 12px",
    border: "1px solid #d8dee5",
    borderRadius: 6,
    background: "#fff",
    color: "#4b5563",
    fontSize: 12,
    fontWeight: 500,
  },

  card: {
    border: "1px solid #e2e7ec",
    borderRadius: 9,
    background: "#fff",
    marginBottom: 18,
    overflow: "hidden",
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.025)",
  },

  purchaseHeader: {
    padding: "20px 22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    flexWrap: "wrap",
  },

  purchaseHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    minWidth: 0,
  },

  mainIcon: {
    width: 48,
    height: 48,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    color: "#3b6b9d",
    background: "#edf3f7",
  },

  purchaseLabel: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: 650,
    letterSpacing: 0.6,
  },

  purchaseNumber: {
    color: "#263747",
    fontSize: 20,
    fontWeight: 700,
    margin: "3px 0",
    overflowWrap: "anywhere",
  },

  createdText: {
    color: "#94a3b8",
    fontSize: 10,
    overflowWrap: "anywhere",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 5,
    fontSize: 10,
    fontWeight: 650,
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

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 18,
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "16px 20px",
    borderBottom: "1px solid #edf0f3",
  },

  sectionIcon: {
    color: "#4b6985",
    fontSize: 17,
    flexShrink: 0,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: 650,
    color: "#273444",
    margin: 0,
  },

  sectionSubtitle: {
    margin: "4px 0 0",
    fontSize: 10,
    color: "#94a3b8",
  },

  infoList: {
    padding: "4px 20px 10px",
  },

  infoRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 11,
    padding: "13px 0",
    borderBottom: "1px solid #f1f3f5",
  },

  infoIcon: {
    color: "#94a3b8",
    fontSize: 15,
    paddingTop: 2,
    flexShrink: 0,
  },

  infoContent: {
    minWidth: 0,
    flex: 1,
  },

  infoLabel: {
    fontSize: 10,
    color: "#94a3b8",
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 12,
    color: "#344454",
    fontWeight: 550,
    overflowWrap: "anywhere",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    margin: 0,
    minWidth: 620,
  },

  th: {
    background: "#f8fafb",
    color: "#7a8694",
    fontSize: 9,
    fontWeight: 650,
    padding: "12px 16px",
    whiteSpace: "nowrap",
    borderBottom: "1px solid #e4e8ec",
  },

  td: {
    padding: "14px 16px",
    verticalAlign: "middle",
    fontSize: 11,
    color: "#4b5563",
    borderBottom: "1px solid #f0f2f4",
    whiteSpace: "nowrap",
  },

  productName: {
    color: "#344454",
    fontSize: 11,
    fontWeight: 600,
  },

  productCode: {
    marginTop: 4,
    color: "#94a3b8",
    fontSize: 9,
  },

  totalCell: {
    padding: "14px 16px",
    verticalAlign: "middle",
    fontSize: 11,
    fontWeight: 650,
    color: "#344454",
    whiteSpace: "nowrap",
  },

  empty: {
    padding: 35,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 11,
  },

  totalsWrapper: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "16px 20px 20px",
    borderTop: "1px solid #edf0f3",
  },

  totalsBox: {
    width: "100%",
    maxWidth: 320,
  },

  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 15,
    padding: "8px 0",
    fontSize: 11,
    color: "#7b8794",
  },

  grandTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 15,
    padding: "13px 0 0",
    marginTop: 5,
    borderTop: "1px solid #e6eaee",
    fontSize: 13,
    fontWeight: 700,
    color: "#263747",
  },

  paymentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
    padding: 20,
  },

  paymentBox: {
    padding: "17px 15px",
    border: "1px solid #e8edf1",
    borderRadius: 7,
    background: "#fafcfd",
    minWidth: 0,
  },

  paymentLabel: {
    fontSize: 10,
    color: "#7b8794",
  },

  paymentTotal: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 700,
    color: "#263747",
    overflowWrap: "anywhere",
  },

  paymentPaid: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 700,
    color: "#047857",
    overflowWrap: "anywhere",
  },

  paymentBalance: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 700,
    color: "#c2410c",
    overflowWrap: "anywhere",
  },

  notes: {
    padding: "17px 20px",
    margin: 0,
    fontSize: 12,
    lineHeight: 1.7,
    color: "#4b5563",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },

  footerActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 6,
  },

  errorCard: {
    marginTop: 25,
    padding: 35,
    alignItems: "center",
    textAlign: "center",
    border: "1px solid #e2e7ec",
    borderRadius: 9,
  },

  errorTitle: {
    marginTop: 15,
    color: "#344454",
    fontSize: 15,
  },

  mutedText: {
    marginTop: 5,
    marginBottom: 18,
    color: "#94a3b8",
    fontSize: 11,
  },
};