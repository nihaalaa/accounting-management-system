
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Card, Row, Col, Badge, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import {
  BsArrowLeft,
  BsBoxSeam,
  BsPencilSquare,
  BsCalendarDate,
  BsClipboardData,
  BsCurrencyRupee,
  BsFileText,
} from "react-icons/bs";

const formatMoney = (value) =>
  "₹" +
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not set";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatus = (stock, minimum) => {
  const current = Number(stock || 0);

  if (current <= 0) return "Out of Stock";
  if (current <= Number(minimum || 0)) return "Low Stock";

  return "In Stock";
};

const Detail = ({ label, value }) => (
  <Col xs={12} md={6} className="mb-3">
    <div style={styles.detail}>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>
        {value === "" || value === null || value === undefined
          ? "—"
          : value}
      </div>
    </div>
  </Col>
);

export const ViewProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/products/${id}`
        );

        setProduct(response.data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Unable to load this product. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.center}>
          <Spinner animation="border" />
          <p style={{ marginTop: 12 }}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={styles.page}>
        <Link to="/products" style={styles.backLink}>
          <BsArrowLeft /> Back to Products
        </Link>

        <Alert variant="danger" className="mt-3">
          {error || "Product not found."}
        </Alert>
      </div>
    );
  }

  const stock = Number(product.currentStock || 0);
  const minimum = Number(product.minimumStock || 0);
  const status = getStatus(stock, minimum);

  const badgeVariant =
    status === "In Stock"
      ? "success"
      : status === "Low Stock"
      ? "warning"
      : "danger";

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <Link to="/products" style={styles.backLink}>
            <BsArrowLeft /> Back to Products
          </Link>

          <h2 style={styles.title}>Product Details</h2>
          <p style={styles.subtitle}>
            View product information, pricing and inventory.
          </p>
        </div>
{/* 
        <Button
          variant="primary"
          onClick={() => navigate(`/products/edit/${id}`)}
        >
          <BsPencilSquare className="me-2" />
          Edit Product
        </Button> */}
      </div>

      <Card style={styles.card}>
        <Card.Body>
          <div style={styles.productHeader}>
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                style={styles.image}
              />
            ) : (
              <div style={styles.imagePlaceholder}>
                <BsBoxSeam size={32} />
              </div>
            )}

            <div style={{ flex: 1 }}>
              <h4 style={styles.productName}>{product.name}</h4>
              <div style={styles.muted}>
                Product code: {product.code || "—"}
              </div>

              <div style={{ marginTop: 10 }}>
                <Badge bg={badgeVariant}>{status}</Badge>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card style={styles.card}>
        <Card.Header style={styles.sectionHeader}>
          <BsClipboardData className="me-2" />
          General Information
        </Card.Header>

        <Card.Body>
          <Row>
            <Detail label="Product name" value={product.name} />
            <Detail label="Product code" value={product.code} />
            <Detail label="Category" value={product.category} />
            <Detail label="Unit" value={product.unit} />
            <Detail label="Description" value={product.description} />
          </Row>
        </Card.Body>
      </Card>

      <Card style={styles.card}>
        <Card.Header style={styles.sectionHeader}>
          <BsCurrencyRupee className="me-2" />
          Pricing and GST
        </Card.Header>

        <Card.Body>
          <Row>
            <Detail
              label="Purchase price"
              value={formatMoney(product.purchasePrice)}
            />
            <Detail
              label="Selling price"
              value={formatMoney(product.sellingPrice)}
            />
            <Detail
              label="HSN code"
              value={product.hsnCode || "—"}
            />
            <Detail
              label="HSN description"
              value={product.hsnDescription || "—"}
            />
            <Detail
              label="GST rate"
              value={`${Number(product.tax || 0)}%`}
            />
          </Row>
        </Card.Body>
      </Card>

      <Card style={styles.card}>
        <Card.Header style={styles.sectionHeader}>
          <BsBoxSeam className="me-2" />
          Inventory Information
        </Card.Header>

        <Card.Body>
          <Row>
            <Detail
              label="Opening stock"
              value={product.openingStock}
            />
            <Detail label="Current stock" value={stock} />
            <Detail label="Minimum stock level" value={minimum} />
            <Detail
              label="Expiry date"
              value={formatDate(product.expiryDate)}
            />
          </Row>
        </Card.Body>
      </Card>

      <Card style={styles.card}>
        <Card.Header style={styles.sectionHeader}>
          <BsCalendarDate className="me-2" />
          Record Information
        </Card.Header>

        <Card.Body>
          <Row>
            <Detail
              label="Created on"
              value={formatDate(product.createdAt)}
            />
            <Detail
              label="Last updated"
              value={formatDate(product.updatedAt)}
            />
          </Row>
        </Card.Body>
      </Card>

      <div style={styles.footer}>
                    <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              style={backButtonStyle}
            >
              Close
            </Button>
      </div>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "24px",
    color: "#1e293b",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    marginTop: 14,
    marginBottom: 6,
  },
  subtitle: {
    color: "#64748b",
    marginBottom: 0,
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "#3b6b9d",
    textDecoration: "none",
    fontSize: 14,
  },
  card: {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    marginBottom: 20,
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
  },
  productHeader: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
  },
  image: {
    width: 100,
    height: 100,
    objectFit: "cover",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    background: "#f1f5f9",
    color: "#64748b",
  },
  productName: {
    fontWeight: 700,
    marginBottom: 6,
  },
  muted: {
    color: "#64748b",
    fontSize: 14,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#f8fafc",
    fontWeight: 600,
    padding: "14px 18px",
    borderBottom: "1px solid #e2e8f0",
  },
  detail: {
    padding: "10px 12px",
    borderRadius: 8,
    background: "#f8fafc",
    height: "100%",
    overflowWrap: "anywhere",
  },
  label: {
    color: "#64748b",
    fontSize: 13,
    marginBottom: 6,
  },
  value: {
    color: "#1e293b",
    fontWeight: 600,
    fontSize: 15,
    whiteSpace: "pre-wrap",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    color: "#64748b",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 24,
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
  
};
  const backButtonStyle = {
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
    whiteSpace: "nowrap",
    boxShadow:
      "0 1px 2px rgba(15,23,42,0.03)",
  };
