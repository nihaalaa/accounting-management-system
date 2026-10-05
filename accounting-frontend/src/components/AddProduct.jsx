import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Form } from "react-bootstrap";
import axios from "axios";
import {
  BsArrowLeft,
  BsBoxSeam,
  BsCloudUpload,
  BsCheck2,
  BsImage,
  BsX,
  BsCurrencyRupee,
  BsClipboardData,
  BsFileText,
  BsExclamationCircle,
} from "react-icons/bs";

/* =========================================================
   HELPERS
========================================================= */

const formatMoney = (value) =>
  "₹" +
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getStatus = (stock, min) => {
  if (stock === "" || stock === null || stock === undefined) {
    return "";
  }

  if (Number(stock) === 0) {
    return "Out of Stock";
  }

  if (Number(stock) <= Number(min || 0)) {
    return "Low Stock";
  }

  return "In Stock";
};

/* =========================================================
   SECTION COMPONENT
========================================================= */

const Section = ({ icon, title, children }) => (
  <Card style={styles.card}>
    <Card.Body style={styles.cardBody}>
      <div style={styles.sectionHeading}>
        <div style={styles.sectionIcon}>{icon}</div>

        <h2 style={styles.sectionTitle}>{title}</h2>
      </div>

      {children}
    </Card.Body>
  </Card>
);

/* =========================================================
   ADD PRODUCT
========================================================= */

export const AddProduct = () => {
  const preset_key = "testimage";
  const cloud_name = "kvti0onx";

  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [image, setImage] = useState("");

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [product, setProduct] = useState({
    name: "",
    code: "",
    category: "",
    purchasePrice: "",
    sellingPrice: "",
    tax: "",
    unit: "",
    openingStock: "",
    minimumStock: "",
    description: "",
    image: "",
  });

  /* =========================================================
     GET CATEGORIES
  ========================================================= */

  useEffect(() => {
    axios
      .get("http://localhost:5000/categories")
      .then((res) => {
        setCategories(res.data || []);
      })
      .catch((err) => {
        console.log("Error fetching categories:", err);

        setError("Unable to load product categories.");
      });
  }, []);

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const handleFile = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", preset_key);

    setError("");
    setUploading(true);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        formData
      );

      const imageUrl = res.data.secure_url;

      setImage(imageUrl);

      setProduct((prev) => ({
        ...prev,
        image: imageUrl,
      }));
    } catch (err) {
      console.log("Image upload error:", err);

      setError(
        "The image could not be uploaded. Please choose another image."
      );
    } finally {
      setUploading(false);
    }
  };

  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  const removeImage = () => {
    setImage("");

    setProduct((prev) => ({
      ...prev,
      image: "",
    }));
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    /* Basic validation */

    if (!product.name.trim()) {
      setError("Please enter a product name.");
      return;
    }

    if (!product.code.trim()) {
      setError("Please enter a product code / SKU.");
      return;
    }

    if (!product.category) {
      setError("Please select a category.");
      return;
    }

    if (!product.unit) {
      setError("Please select a unit.");
      return;
    }

    if (Number(product.purchasePrice) < 0) {
      setError("Purchase price cannot be negative.");
      return;
    }

    if (Number(product.sellingPrice) < 0) {
      setError("Selling price cannot be negative.");
      return;
    }

    if (Number(product.openingStock) < 0) {
      setError("Opening stock cannot be negative.");
      return;
    }

    if (Number(product.minimumStock) < 0) {
      setError("Minimum stock cannot be negative.");
      return;
    }

    setSaving(true);

    try {
      await axios.post("http://localhost:5000/products", product);

      alert("Product added successfully.");

      navigate("/products");
    } catch (err) {
      console.log("Error adding product:", err);

      setError(
        err.response?.data?.message ||
          "The product could not be saved. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const purchase = Number(product.purchasePrice || 0);

  const selling = Number(product.sellingPrice || 0);

  const profit = selling - purchase;

  const margin = selling > 0 ? (profit / selling) * 100 : 0;

  const sellingBelowCost =
    product.purchasePrice !== "" &&
    product.sellingPrice !== "" &&
    selling < purchase;

  const status = getStatus(
    product.openingStock,
    product.minimumStock
  );

  /* =========================================================
     STATUS STYLE
  ========================================================= */

  const getStatusStyle = () => {
    if (status === "In Stock") {
      return {
        ...styles.badge,
        ...styles.badgeSuccess,
      };
    }

    if (status === "Low Stock") {
      return {
        ...styles.badge,
        ...styles.badgeWarning,
      };
    }

    if (status === "Out of Stock") {
      return {
        ...styles.badge,
        ...styles.badgeDanger,
      };
    }

    return styles.badge;
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div style={styles.page}>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Add product</h1>

          <p style={styles.subtitle}>
            Create a product with its pricing, inventory, and details.
          </p>
        </div>

        <Link to="/products" style={styles.backButton}>
          <BsArrowLeft size={15} />
          Back to products
        </Link>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div style={styles.errorBanner}>
          <BsExclamationCircle size={15} />

          <span>{error}</span>
        </div>
      )}

      {/* =====================================================
          FORM
      ===================================================== */}

      <Form onSubmit={handleSubmit}>
        <div style={styles.mainGrid}>
          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div style={styles.leftColumn}>
            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <Section
              icon={<BsBoxSeam size={17} />}
              title="Basic information"
            >
              <div style={styles.formGrid}>
                {/* Product Name */}

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Product name
                    <span style={styles.required}>*</span>
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    placeholder="e.g. Basmati Rice 5 kg"
                    style={styles.input}
                    required
                  />
                </Form.Group>

                {/* Product Code */}

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Product code / SKU
                    <span style={styles.required}>*</span>
                  </Form.Label>

                  <Form.Control
                    type="text"
                    name="code"
                    value={product.code}
                    onChange={handleChange}
                    placeholder="e.g. PROD-001"
                    style={styles.input}
                    required
                  />
                </Form.Group>

                {/* Category */}

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Category
                    <span style={styles.required}>*</span>
                  </Form.Label>

                  <Form.Select
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  >
                    <option value="">Select category</option>

                    {categories.map((category) => (
                      <option
                        key={category._id}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Unit */}

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Unit
                    <span style={styles.required}>*</span>
                  </Form.Label>

                  <Form.Select
                    name="unit"
                    value={product.unit}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  >
                    <option value="">Select unit</option>
                    <option value="Piece">Piece</option>
                    <option value="Kg">Kg</option>
                    <option value="Gram">Gram</option>
                    <option value="Litre">Litre</option>
                    <option value="Meter">Meter</option>
                    <option value="Box">Box</option>
                    <option value="Pack">Pack</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </Section>

            {/* =================================================
                PRICING
            ================================================= */}

            <Section
              icon={<BsCurrencyRupee size={17} />}
              title="Pricing and tax"
            >
              <div style={styles.threeColumn}>
                {/* Purchase Price */}

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Purchase price
                    <span style={styles.required}>*</span>
                  </Form.Label>

                  <div style={styles.priceWrapper}>
                    <span style={styles.currencyPrefix}>₹</span>

                    <Form.Control
                      type="number"
                      name="purchasePrice"
                      value={product.purchasePrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      style={styles.priceInput}
                      required
                    />
                  </div>
                </Form.Group>

                {/* Selling Price */}

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Selling price
                    <span style={styles.required}>*</span>
                  </Form.Label>

                  <div style={styles.priceWrapper}>
                    <span style={styles.currencyPrefix}>₹</span>

                    <Form.Control
                      type="number"
                      name="sellingPrice"
                      value={product.sellingPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      style={styles.priceInput}
                      required
                    />
                  </div>
                </Form.Group>

                {/* Tax */}

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Tax / GST
                    <span style={styles.required}>*</span>
                  </Form.Label>

                  <Form.Select
                    name="tax"
                    value={product.tax}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  >
                    <option value="">Select tax</option>
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </Form.Select>
                </Form.Group>
              </div>

              {/* Loss Warning */}

              {sellingBelowCost && (
                <div style={styles.warning}>
                  <BsExclamationCircle size={14} />

                  <span>
                    The selling price is lower than the purchase
                    price. This product will be sold at a loss.
                  </span>
                </div>
              )}
            </Section>

            {/* =================================================
                INVENTORY
            ================================================= */}

            <Section
              icon={<BsClipboardData size={17} />}
              title="Inventory"
            >
              <div style={styles.formGrid}>
                {/* Opening Stock */}

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Opening stock
                    <span style={styles.required}>*</span>
                  </Form.Label>

                  <Form.Control
                    type="number"
                    name="openingStock"
                    value={product.openingStock}
                    onChange={handleChange}
                    placeholder="Enter stock quantity"
                    min="0"
                    style={styles.input}
                    required
                  />
                </Form.Group>

                {/* Minimum Stock */}

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Minimum stock level
                    <span style={styles.required}>*</span>
                  </Form.Label>

                  <Form.Control
                    type="number"
                    name="minimumStock"
                    value={product.minimumStock}
                    onChange={handleChange}
                    placeholder="e.g. 10"
                    min="0"
                    style={styles.input}
                    required
                  />

                  <div style={styles.helpText}>
                    Products at or below this level will show as
                    low stock.
                  </div>
                </Form.Group>
              </div>
            </Section>

            {/* =================================================
                ADDITIONAL INFORMATION
            ================================================= */}

            <Section
              icon={<BsFileText size={17} />}
              title="Additional information"
            >
              {/* Description */}

              <Form.Group style={{ marginBottom: "22px" }}>
                <Form.Label style={styles.label}>
                  Description
                </Form.Label>

                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  placeholder="Add notes about this product (optional)"
                  style={styles.textarea}
                />
              </Form.Group>

              {/* Product Image */}

              <Form.Group>
                <Form.Label style={styles.label}>
                  Product image
                </Form.Label>

                {!image ? (
                  <div style={styles.uploadBox}>
                    <div style={styles.uploadIcon}>
                      <BsCloudUpload size={21} />
                    </div>

                    <div style={styles.uploadTitle}>
                      {uploading
                        ? "Uploading image..."
                        : "Upload product image"}
                    </div>

                    <div style={styles.uploadText}>
                      JPG or PNG images are recommended.
                    </div>

                    <label
                      style={{
                        ...styles.secondaryButton,
                        opacity: uploading ? 0.6 : 1,
                        pointerEvents: uploading
                          ? "none"
                          : "auto",
                      }}
                    >
                      <BsCloudUpload size={14} />

                      {uploading
                        ? "Uploading..."
                        : "Choose image"}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFile}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                ) : (
                  <div style={styles.uploadedBox}>
                    <img
                      src={image}
                      alt="Product preview"
                      style={styles.uploadedImage}
                    />

                    <div style={styles.uploadedContent}>
                      <div style={styles.uploadTitle}>
                        Image uploaded
                      </div>

                      <div style={styles.uploadText}>
                        This image will be saved with the product.
                      </div>

                      <div style={styles.imageActions}>
                        <label style={styles.secondaryButton}>
                          Change image

                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFile}
                            style={{ display: "none" }}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={removeImage}
                          style={styles.removeButton}
                        >
                          <BsX size={15} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Form.Group>
            </Section>

            {/* =================================================
                BOTTOM ACTION BAR
            ================================================= */}

            <div style={styles.actionBar}>
              <div>
                <div style={styles.actionTitle}>
                  Ready to add this product?
                </div>

                <div style={styles.actionSubtitle}>
                  Review the information before saving.
                </div>
              </div>

              <div style={styles.actionButtons}>
                <Button
                  type="button"
                  variant="light"
                  onClick={() => navigate("/products")}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={saving || uploading}
                  style={styles.saveButton}
                >
                  <BsCheck2 size={16} />

                  {saving ? "Saving..." : "Save product"}
                </Button>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div style={styles.rightColumn}>
            {/* =================================================
                PRODUCT SUMMARY
            ================================================= */}

            <Card style={styles.summaryCard}>
              <Card.Body style={styles.summaryBody}>
                <h2 style={styles.summaryTitle}>
                  Product summary
                </h2>

                {/* Product Preview */}

                <div style={styles.productPreview}>
                  {image ? (
                    <img
                      src={image}
                      alt="Product"
                      style={styles.previewImage}
                    />
                  ) : (
                    <div style={styles.previewPlaceholder}>
                      <BsImage size={26} />
                    </div>
                  )}

                  <div style={styles.previewName}>
                    {product.name || "Product name"}
                  </div>

                  <div style={styles.previewCode}>
                    {product.code || "SKU"}
                  </div>

                  {status && (
                    <span style={getStatusStyle()}>
                      {status}
                    </span>
                  )}
                </div>

                {/* Product Details */}

                <div style={styles.summaryRows}>
                  <div style={styles.summaryRow}>
                    <span>Category</span>

                    <strong>
                      {product.category || "—"}
                    </strong>
                  </div>

                  <div style={styles.summaryRow}>
                    <span>Unit</span>

                    <strong>
                      {product.unit || "—"}
                    </strong>
                  </div>

                  <div style={styles.summaryRow}>
                    <span>Opening stock</span>

                    <strong>
                      {product.openingStock || "0"}

                      {product.unit
                        ? ` ${product.unit}`
                        : ""}
                    </strong>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* =================================================
                PRICING SUMMARY
            ================================================= */}

            <Card style={styles.summaryCard}>
              <Card.Body style={styles.summaryBody}>
                <h2 style={styles.summaryTitle}>
                  Pricing summary
                </h2>

                <div style={styles.summaryRows}>
                  <div style={styles.summaryRow}>
                    <span>Purchase price</span>

                    <strong>
                      {formatMoney(purchase)}
                    </strong>
                  </div>

                  <div style={styles.summaryRow}>
                    <span>Selling price</span>

                    <strong>
                      {formatMoney(selling)}
                    </strong>
                  </div>

                  <div style={styles.summaryRow}>
                    <span>Tax</span>

                    <strong>
                      {product.tax || "0"}%
                    </strong>
                  </div>

                  <div
                    style={{
                      ...styles.summaryRow,
                      borderBottom: "none",
                    }}
                  >
                    <span>Profit per unit</span>

                    <strong
                      style={{
                        color:
                          profit < 0
                            ? "#b91c1c"
                            : "#15803d",
                      }}
                    >
                      {formatMoney(profit)}

                      {selling > 0
                        ? ` (${margin.toFixed(1)}%)`
                        : ""}
                    </strong>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* =================================================
                STOCK STATUS
            ================================================= */}

            <Card style={styles.summaryCard}>
              <Card.Body style={styles.summaryBody}>
                <h2 style={styles.summaryTitle}>
                  Stock status
                </h2>

                <div style={styles.stockStatusBox}>
                  <div style={styles.stockIcon}>
                    <BsClipboardData size={17} />
                  </div>

                  <div>
                    <div style={styles.stockStatusTitle}>
                      {status || "Not available"}
                    </div>

                    <div style={styles.stockStatusText}>
                      {product.openingStock !== ""
                        ? `${product.openingStock} ${
                            product.unit || "units"
                          } currently available`
                        : "Enter opening stock to see status."}
                    </div>
                  </div>
                </div>

                {product.minimumStock !== "" && (
                  <div style={styles.minimumStock}>
                    <span>Minimum level</span>

                    <strong>
                      {product.minimumStock}{" "}
                      {product.unit || "units"}
                    </strong>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
};

/* =========================================================
   STYLES
========================================================= */

const FONT =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const styles = {
  /* =======================================================
     PAGE
  ======================================================= */

  page: {
    width: "100%",
    minHeight: "100vh",
    padding: "26px 32px 40px",
    backgroundColor: "#f3f4f8",
    boxSizing: "border-box",
    fontFamily: FONT,
    color: "#1e293b",
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "25px",
    lineHeight: "32px",
    fontWeight: "700",
    letterSpacing: "-0.4px",
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: "20px",
  },

  backButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    minHeight: "38px",
    padding: "0 15px",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    color: "#1e293b",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "600",
    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
    whiteSpace: "nowrap",
  },

  /* =======================================================
     ERROR
  ======================================================= */

  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "11px 14px",
    marginBottom: "18px",
    borderRadius: "8px",
    border: "1px solid #fecaca",
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    fontSize: "13px",
  },

  /* =======================================================
     MAIN GRID
  ======================================================= */

  mainGrid: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 330px",
    gap: "24px",
    alignItems: "start",
  },

  leftColumn: {
    minWidth: 0,
  },

  rightColumn: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    position: "sticky",
    top: "24px",
  },

  /* =======================================================
     CARDS
  ======================================================= */

  card: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
    marginBottom: "18px",
    overflow: "hidden",
  },

  cardBody: {
    padding: "22px 24px",
  },

  sectionHeading: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },

  sectionIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    backgroundColor: "#edf3f8",
    color: "#3b6b9d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  sectionTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: "22px",
  },

  /* =======================================================
     FORM GRID
  ======================================================= */

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px 20px",
  },

  threeColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "18px 20px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: "600",
  },

  required: {
    marginLeft: "3px",
    color: "#dc2626",
  },

  input: {
    width: "100%",
    height: "39px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#334155",
    fontSize: "13px",
    boxShadow: "none",
  },

  textarea: {
    width: "100%",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#334155",
    fontSize: "13px",
    resize: "vertical",
    boxShadow: "none",
  },

  helpText: {
    marginTop: "5px",
    color: "#94a3b8",
    fontSize: "11px",
    lineHeight: "16px",
  },

  /* =======================================================
     PRICE INPUT
  ======================================================= */

  priceWrapper: {
    display: "flex",
    height: "39px",
  },

  currencyPrefix: {
    width: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e2e8f0",
    borderRight: "none",
    borderRadius: "8px 0 0 8px",
    backgroundColor: "#f8fafc",
    color: "#64748b",
    fontSize: "13px",
    flexShrink: 0,
  },

  priceInput: {
    height: "39px",
    borderRadius: "0 8px 8px 0",
    border: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: "13px",
    boxShadow: "none",
  },

  /* =======================================================
     WARNING
  ======================================================= */

  warning: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "17px",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #fde68a",
    backgroundColor: "#fffbeb",
    color: "#b45309",
    fontSize: "12px",
    lineHeight: "18px",
  },

  /* =======================================================
     UPLOAD
  ======================================================= */

  uploadBox: {
    minHeight: "190px",
    padding: "24px",
    border: "1px dashed #cbd5e1",
    borderRadius: "10px",
    backgroundColor: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  uploadIcon: {
    width: "46px",
    height: "46px",
    marginBottom: "11px",
    borderRadius: "10px",
    backgroundColor: "#edf3f8",
    color: "#3b6b9d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  uploadTitle: {
    color: "#1e293b",
    fontSize: "13px",
    fontWeight: "600",
    lineHeight: "18px",
  },

  uploadText: {
    marginTop: "4px",
    marginBottom: "14px",
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: "17px",
  },

  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    height: "33px",
    padding: "0 13px",
    borderRadius: "7px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#334155",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
    boxShadow: "0 1px 2px rgba(15,23,42,0.03)",
  },

  uploadedBox: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },

  uploadedImage: {
    width: "105px",
    height: "105px",
    objectFit: "cover",
    borderRadius: "9px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    flexShrink: 0,
  },

  uploadedContent: {
    minWidth: 0,
    flex: 1,
  },

  imageActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "3px",
  },

  removeButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    height: "33px",
    padding: "0 11px",
    borderRadius: "7px",
    border: "1px solid #fecaca",
    backgroundColor: "#ffffff",
    color: "#b91c1c",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },

  /* =======================================================
     ACTION BAR
  ======================================================= */

  actionBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "17px 20px",
    marginBottom: "10px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
  },

  actionTitle: {
    color: "#0f172a",
    fontSize: "13px",
    fontWeight: "700",
  },

  actionSubtitle: {
    marginTop: "3px",
    color: "#94a3b8",
    fontSize: "11px",
  },

  actionButtons: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    flexShrink: 0,
  },

  cancelButton: {
    height: "39px",
    padding: "0 18px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    color: "#334155",
    fontSize: "13px",
    fontWeight: "600",
    boxShadow: "none",
  },

  saveButton: {
    height: "39px",
    padding: "0 18px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#3b6b9d",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    boxShadow: "0 1px 2px rgba(15,23,42,0.12)",
  },

  /* =======================================================
     RIGHT SUMMARY CARDS
  ======================================================= */

  summaryCard: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
    overflow: "hidden",
  },

  summaryBody: {
    padding: "20px",
  },

  summaryTitle: {
    margin: "0 0 17px",
    color: "#0f172a",
    fontSize: "15px",
    fontWeight: "700",
  },

  /* =======================================================
     PRODUCT PREVIEW
  ======================================================= */

  productPreview: {
    padding: "3px 0 18px",
    marginBottom: "5px",
    textAlign: "center",
    borderBottom: "1px solid #f1f5f9",
  },

  previewImage: {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "9px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
  },

  previewPlaceholder: {
    width: "100px",
    height: "100px",
    margin: "0 auto",
    borderRadius: "9px",
    backgroundColor: "#f1f5f9",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  previewName: {
    marginTop: "12px",
    color: "#0f172a",
    fontSize: "14px",
    lineHeight: "19px",
    fontWeight: "700",
    wordBreak: "break-word",
  },

  previewCode: {
    marginTop: "3px",
    marginBottom: "10px",
    color: "#94a3b8",
    fontSize: "12px",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "600",
  },

  badgeSuccess: {
    backgroundColor: "#ecfdf3",
    color: "#15803d",
  },

  badgeWarning: {
    backgroundColor: "#fffbeb",
    color: "#b45309",
  },

  badgeDanger: {
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
  },

  /* =======================================================
     SUMMARY ROWS
  ======================================================= */

  summaryRows: {
    width: "100%",
  },

  summaryRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    padding: "11px 0",
    borderBottom: "1px solid #f1f5f9",
    color: "#64748b",
    fontSize: "12px",
  },

  /* =======================================================
     STOCK STATUS
  ======================================================= */

  stockStatusBox: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "12px",
    borderRadius: "9px",
    backgroundColor: "#f8fafc",
    border: "1px solid #eef2f6",
  },

  stockIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    backgroundColor: "#edf3f8",
    color: "#3b6b9d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  stockStatusTitle: {
    color: "#1e293b",
    fontSize: "12px",
    fontWeight: "700",
  },

  stockStatusText: {
    marginTop: "2px",
    color: "#94a3b8",
    fontSize: "11px",
    lineHeight: "16px",
  },

  minimumStock: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "13px",
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9",
    color: "#64748b",
    fontSize: "12px",
  },
};