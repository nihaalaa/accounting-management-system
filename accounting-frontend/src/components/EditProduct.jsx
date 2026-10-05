import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  BsPencilSquare,
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
   REUSABLE SECTION
========================================================= */

const Section = ({ icon, title, description, children }) => (
  <Card style={styles.card}>
    <div style={styles.sectionHeader}>
      <div style={styles.sectionIcon}>{icon}</div>

      <div>
        <h5 style={styles.sectionTitle}>{title}</h5>
        <p style={styles.sectionText}>{description}</p>
      </div>
    </div>

    <Card.Body style={styles.cardBody}>{children}</Card.Body>
  </Card>
);

/* =========================================================
   EDIT PRODUCT
========================================================= */

export const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /* Cloudinary */
  const preset_key = "testimage";
  const cloud_name = "kvti0onx";

  /* States */
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState("");

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
     FETCH PRODUCT
  ========================================================= */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `http://localhost:5000/products/${id}`
        );

        const data = response.data;

        setProduct({
          name: data.name || "",
          code: data.code || "",
          category: data.category || "",
          purchasePrice:
            data.purchasePrice !== undefined
              ? data.purchasePrice
              : "",
          sellingPrice:
            data.sellingPrice !== undefined
              ? data.sellingPrice
              : "",
          tax: data.tax !== undefined ? data.tax : "",
          unit: data.unit || "",
          openingStock:
            data.openingStock !== undefined
              ? data.openingStock
              : "",
          minimumStock:
            data.minimumStock !== undefined
              ? data.minimumStock
              : "",
          description: data.description || "",
          image: data.image || "",
        });

        setImage(data.image || "");
      } catch (err) {
        console.log("Error fetching product:", err);

        setError(
          "The product could not be loaded. Please go back and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  /* =========================================================
     FETCH CATEGORIES
  ========================================================= */

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/categories"
        );

        setCategories(response.data || []);
      } catch (err) {
        console.log("Error fetching categories:", err);
      }
    };

    fetchCategories();
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
     UPDATE PRODUCT
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

    if (
      product.purchasePrice === "" ||
      Number(product.purchasePrice) < 0
    ) {
      setError("Please enter a valid purchase price.");
      return;
    }

    if (
      product.sellingPrice === "" ||
      Number(product.sellingPrice) < 0
    ) {
      setError("Please enter a valid selling price.");
      return;
    }

    if (!product.tax && product.tax !== 0) {
      setError("Please select a tax / GST rate.");
      return;
    }

    if (
      product.openingStock === "" ||
      Number(product.openingStock) < 0
    ) {
      setError("Please enter a valid opening stock.");
      return;
    }

    if (
      product.minimumStock === "" ||
      Number(product.minimumStock) < 0
    ) {
      setError("Please enter a valid minimum stock level.");
      return;
    }

    try {
      setSaving(true);

      await axios.put(
        `http://localhost:5000/products/${id}`,
        product
      );

      alert("Product updated successfully.");

      navigate("/products");
    } catch (err) {
      console.log("Error updating product:", err);

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error;

      setError(
        backendMessage ||
          "The product could not be updated. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const handleFile = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    /* Basic image validation */

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5 MB.");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", preset_key);

    setError("");
    setUploading(true);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        formData
      );

      const imageUrl = response.data.secure_url;

      setImage(imageUrl);

      setProduct((prev) => ({
        ...prev,
        image: imageUrl,
      }));
    } catch (err) {
      console.log("Image upload error:", err);

      setError(
        "The image could not be uploaded. Please try again."
      );
    } finally {
      setUploading(false);

      /* Allow selecting same image again */
      event.target.value = "";
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
     DERIVED VALUES
  ========================================================= */

  const purchase = Number(product.purchasePrice || 0);
  const selling = Number(product.sellingPrice || 0);

  const profit = selling - purchase;

  const margin =
    selling > 0
      ? (profit / selling) * 100
      : 0;

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
      return styles.badgeSuccess;
    }

    if (status === "Low Stock") {
      return styles.badgeWarning;
    }

    if (status === "Out of Stock") {
      return styles.badgeDanger;
    }

    return styles.badgeNeutral;
  };

  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div>
            <Link
              to="/products"
              style={styles.backLink}
            >
              <BsArrowLeft size={14} />
              Back to Products
            </Link>

            <h2 style={styles.title}>
              Edit Product
            </h2>

            <p style={styles.subtitle}>
              Update product details, pricing and inventory.
            </p>
          </div>
        </div>

        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>
            <BsBoxSeam size={22} />
          </div>

          <div>
            <div style={styles.loadingTitle}>
              Loading product
            </div>

            <div style={styles.loadingText}>
              Please wait while the product details are loaded.
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div style={styles.page}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div style={styles.header}>
        <div>
          <Link
            to="/products"
            style={styles.backLink}
          >
            <BsArrowLeft size={14} />
            Back to Products
          </Link>

          <div style={styles.titleRow}>
            <div style={styles.titleIcon}>
              <BsPencilSquare size={19} />
            </div>

            <div>
              <h2 style={styles.title}>
                Edit Product
              </h2>

              <p style={styles.subtitle}>
                Update product details, pricing and inventory.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          style={styles.errorBanner}
          role="alert"
        >
          <BsExclamationCircle size={16} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            style={styles.errorClose}
          >
            <BsX size={18} />
          </button>
        </div>
      )}

      {/* =====================================================
          FORM
      ===================================================== */}

      <Form onSubmit={handleSubmit}>
        <div style={styles.mainLayout}>

          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div>

            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <Section
              icon={<BsBoxSeam size={17} />}
              title="Basic information"
              description="Name, code, category and unit of measure."
            >
              <div style={styles.twoColumn}>

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Product name
                    <span style={styles.required}>
                      *
                    </span>
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

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Product code / SKU
                    <span style={styles.required}>
                      *
                    </span>
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

                  <div style={styles.help}>
                    A unique code used to identify the product.
                  </div>
                </Form.Group>

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Category
                    <span style={styles.required}>
                      *
                    </span>
                  </Form.Label>

                  <Form.Select
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  >
                    <option value="">
                      Select category
                    </option>

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

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Unit
                    <span style={styles.required}>
                      *
                    </span>
                  </Form.Label>

                  <Form.Select
                    name="unit"
                    value={product.unit}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  >
                    <option value="">
                      Select unit
                    </option>

                    <option value="Piece">
                      Piece
                    </option>

                    <option value="Kg">
                      Kg
                    </option>

                    <option value="Gram">
                      Gram
                    </option>

                    <option value="Litre">
                      Litre
                    </option>

                    <option value="Meter">
                      Meter
                    </option>

                    <option value="Box">
                      Box
                    </option>

                    <option value="Pack">
                      Pack
                    </option>
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
              description="Purchase price, selling price and GST rate."
            >
              <div style={styles.threeColumn}>

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Purchase price
                    <span style={styles.required}>
                      *
                    </span>
                  </Form.Label>

                  <div style={styles.prefixWrap}>
                    <span style={styles.prefix}>
                      ₹
                    </span>

                    <Form.Control
                      type="number"
                      name="purchasePrice"
                      value={product.purchasePrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      style={styles.prefixInput}
                      required
                    />
                  </div>
                </Form.Group>

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Selling price
                    <span style={styles.required}>
                      *
                    </span>
                  </Form.Label>

                  <div style={styles.prefixWrap}>
                    <span style={styles.prefix}>
                      ₹
                    </span>

                    <Form.Control
                      type="number"
                      name="sellingPrice"
                      value={product.sellingPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      style={styles.prefixInput}
                      required
                    />
                  </div>
                </Form.Group>

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Tax / GST
                    <span style={styles.required}>
                      *
                    </span>
                  </Form.Label>

                  <Form.Select
                    name="tax"
                    value={product.tax}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  >
                    <option value="">
                      Select tax
                    </option>

                    <option value="0">
                      0%
                    </option>

                    <option value="5">
                      5%
                    </option>

                    <option value="12">
                      12%
                    </option>

                    <option value="18">
                      18%
                    </option>

                    <option value="28">
                      28%
                    </option>
                  </Form.Select>
                </Form.Group>

              </div>

              {/* LIVE PRICING INDICATORS */}

              <div style={styles.pricingIndicators}>

                <div style={styles.pricingIndicator}>
                  <span style={styles.indicatorLabel}>
                    Profit / unit
                  </span>

                  <strong
                    style={{
                      color:
                        profit < 0
                          ? "#b91c1c"
                          : "#15803d",
                    }}
                  >
                    {formatMoney(profit)}
                  </strong>
                </div>

                <div style={styles.pricingIndicator}>
                  <span style={styles.indicatorLabel}>
                    Margin
                  </span>

                  <strong
                    style={{
                      color:
                        margin < 0
                          ? "#b91c1c"
                          : "#15803d",
                    }}
                  >
                    {selling > 0
                      ? `${margin.toFixed(1)}%`
                      : "0.0%"}
                  </strong>
                </div>

                <div style={styles.pricingIndicator}>
                  <span style={styles.indicatorLabel}>
                    Selling price
                  </span>

                  <strong style={styles.indicatorValue}>
                    {formatMoney(selling)}
                  </strong>
                </div>

              </div>

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
              description="Opening stock and the low-stock threshold."
            >
              <div style={styles.twoColumn}>

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Opening stock
                    <span style={styles.required}>
                      *
                    </span>
                  </Form.Label>

                  <Form.Control
                    type="number"
                    name="openingStock"
                    value={product.openingStock}
                    onChange={handleChange}
                    placeholder="Enter stock quantity"
                    min="0"
                    step="1"
                    style={styles.input}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label style={styles.label}>
                    Minimum stock level
                    <span style={styles.required}>
                      *
                    </span>
                  </Form.Label>

                  <Form.Control
                    type="number"
                    name="minimumStock"
                    value={product.minimumStock}
                    onChange={handleChange}
                    placeholder="e.g. 10"
                    min="0"
                    step="1"
                    style={styles.input}
                    required
                  />

                  <div style={styles.help}>
                    Products at or below this level show as low stock.
                  </div>
                </Form.Group>

              </div>

              {/* STOCK STATUS */}

              {status && (
                <div style={styles.stockStatusBox}>
                  <div style={styles.stockStatusLeft}>
                    <div style={styles.stockStatusIcon}>
                      <BsClipboardData size={16} />
                    </div>

                    <div>
                      <div style={styles.stockStatusTitle}>
                        Current stock status
                      </div>

                      <div style={styles.stockStatusText}>
                        Based on the opening stock and minimum level.
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      ...styles.badge,
                      ...getStatusStyle(),
                    }}
                  >
                    {status}
                  </span>
                </div>
              )}
            </Section>

            {/* =================================================
                ADDITIONAL INFORMATION
            ================================================= */}

            <Section
              icon={<BsFileText size={17} />}
              title="Additional information"
              description="Optional description and product image."
            >

              <Form.Group
                style={{
                  marginBottom: "24px",
                }}
              >
                <Form.Label style={styles.label}>
                  Description
                </Form.Label>

                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={product.description || ""}
                  onChange={handleChange}
                  placeholder="Add notes about this product (optional)"
                  style={styles.textarea}
                />
              </Form.Group>

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
                      JPG, PNG or WEBP · Maximum 5 MB
                    </div>

                    <label
                      style={{
                        ...styles.secondaryLabelButton,
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
                        disabled={uploading}
                        style={{
                          display: "none",
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <div style={styles.uploadedBox}>

                    <img
                      src={image}
                      alt="Product preview"
                      style={styles.previewImage}
                    />

                    <div style={styles.uploadedContent}>

                      <div style={styles.uploadTitle}>
                        Product image
                      </div>

                      <div style={styles.uploadText}>
                        This image will be displayed with the product.
                      </div>

                      <div style={styles.imageActions}>

                        <label
                          style={{
                            ...styles.secondaryLabelButton,
                            opacity: uploading ? 0.6 : 1,
                            pointerEvents: uploading
                              ? "none"
                              : "auto",
                          }}
                        >
                          <BsCloudUpload size={13} />

                          {uploading
                            ? "Uploading..."
                            : "Change image"}

                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFile}
                            disabled={uploading}
                            style={{
                              display: "none",
                            }}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={removeImage}
                          disabled={uploading}
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
                ACTION BAR
            ================================================= */}

            <div style={styles.footer}>

              <div>
                <div style={styles.footerTitle}>
                  Ready to save your changes?
                </div>

                <div style={styles.footerText}>
                  Review the information before updating the product.
                </div>
              </div>

              <div style={styles.footerButtons}>

                <Button
                  type="button"
                  variant="light"
                  onClick={() => navigate("/products")}
                  disabled={saving}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={
                    saving ||
                    uploading ||
                    loading
                  }
                  style={styles.saveButton}
                >
                  <BsCheck2 size={16} />

                  {saving
                    ? "Updating..."
                    : "Update Product"}
                </Button>

              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div style={styles.sideColumn}>

            {/* =================================================
                PRODUCT PREVIEW
            ================================================= */}

            <Card style={styles.sideCard}>
              <Card.Body style={styles.sideBody}>

                <div style={styles.sideHeader}>
                  <div>
                    <h5 style={styles.sideTitle}>
                      Product preview
                    </h5>

                    <p style={styles.sideSubtitle}>
                      Live product information
                    </p>
                  </div>

                  <div style={styles.sideHeaderIcon}>
                    <BsBoxSeam size={16} />
                  </div>
                </div>

                <div style={styles.preview}>

                  {image ? (
                    <img
                      src={image}
                      alt="Product"
                      style={styles.sideImage}
                    />
                  ) : (
                    <div
                      style={styles.sideImagePlaceholder}
                    >
                      <BsImage size={28} />
                    </div>
                  )}

                  <div style={styles.previewName}>
                    {product.name || "Product name"}
                  </div>

                  <div style={styles.previewCode}>
                    {product.code || "SKU"}
                  </div>

                  <span
                    style={{
                      ...styles.badge,
                      ...getStatusStyle(),
                    }}
                  >
                    {status || "Status"}
                  </span>
                </div>

                <div style={styles.row}>
                  <span>Category</span>

                  <strong style={styles.rowValue}>
                    {product.category || "—"}
                  </strong>
                </div>

                <div style={styles.row}>
                  <span>Unit</span>

                  <strong style={styles.rowValue}>
                    {product.unit || "—"}
                  </strong>
                </div>

                <div style={styles.row}>
                  <span>Opening stock</span>

                  <strong style={styles.rowValue}>
                    {product.openingStock || "0"}

                    {product.unit
                      ? ` ${product.unit}`
                      : ""}
                  </strong>
                </div>

                <div
                  style={{
                    ...styles.row,
                    borderBottom: "none",
                  }}
                >
                  <span>Minimum stock</span>

                  <strong style={styles.rowValue}>
                    {product.minimumStock || "0"}

                    {product.unit
                      ? ` ${product.unit}`
                      : ""}
                  </strong>
                </div>

              </Card.Body>
            </Card>

            {/* =================================================
                PRICING SUMMARY
            ================================================= */}

            <Card style={styles.sideCard}>
              <Card.Body style={styles.sideBody}>

                <div style={styles.sideHeader}>
                  <div>
                    <h5 style={styles.sideTitle}>
                      Pricing summary
                    </h5>

                    <p style={styles.sideSubtitle}>
                      Current product pricing
                    </p>
                  </div>

                  <div style={styles.sideHeaderIcon}>
                    <BsCurrencyRupee size={16} />
                  </div>
                </div>

                <div style={styles.row}>
                  <span>Purchase price</span>

                  <strong style={styles.rowValue}>
                    {formatMoney(purchase)}
                  </strong>
                </div>

                <div style={styles.row}>
                  <span>Selling price</span>

                  <strong style={styles.rowValue}>
                    {formatMoney(selling)}
                  </strong>
                </div>

                <div style={styles.row}>
                  <span>Tax / GST</span>

                  <strong style={styles.rowValue}>
                    {product.tax !== ""
                      ? `${product.tax}%`
                      : "0%"}
                  </strong>
                </div>

                <div style={styles.profitBox}>

                  <div>
                    <div style={styles.profitLabel}>
                      Profit per unit
                    </div>

                    <div
                      style={{
                        ...styles.profitValue,
                        color:
                          profit < 0
                            ? "#b91c1c"
                            : "#15803d",
                      }}
                    >
                      {formatMoney(profit)}
                    </div>
                  </div>

                  <div style={styles.marginBox}>
                    <div style={styles.marginLabel}>
                      Margin
                    </div>

                    <strong
                      style={{
                        color:
                          margin < 0
                            ? "#b91c1c"
                            : "#15803d",
                        fontSize: "13px",
                      }}
                    >
                      {selling > 0
                        ? `${margin.toFixed(1)}%`
                        : "0.0%"}
                    </strong>
                  </div>

                </div>

              </Card.Body>
            </Card>

            {/* =================================================
                EDIT NOTE
            ================================================= */}

            <div style={styles.editNote}>

              <div style={styles.editNoteIcon}>
                <BsPencilSquare size={15} />
              </div>

              <div>
                <div style={styles.editNoteTitle}>
                  Editing product
                </div>

                <div style={styles.editNoteText}>
                  Changes will update this product in your inventory
                  after you save.
                </div>
              </div>

            </div>

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
    padding: "28px 32px 42px",
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
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "22px",
  },

  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#3b6b9d",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "12px",
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  titleIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: "#e8f0f8",
    color: "#3b6b9d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  title: {
    margin: 0,
    color: "#172033",
    fontSize: "23px",
    fontWeight: "700",
    letterSpacing: "-0.3px",
  },

  subtitle: {
    margin: "4px 0 0",
    color: "#718096",
    fontSize: "13px",
  },

  /* =======================================================
     ERROR
  ======================================================= */

  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "12px 14px",
    marginBottom: "18px",
    backgroundColor: "#fff5f5",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    color: "#b91c1c",
    fontSize: "13px",
  },

  errorClose: {
    marginLeft: "auto",
    border: "none",
    background: "transparent",
    color: "#b91c1c",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "2px",
  },

  infoBanner: {
    display: "flex",
    alignItems: "center",
    padding: "11px 14px",
    marginBottom: "18px",
    backgroundColor: "#edf4fb",
    border: "1px solid #d5e4f2",
    borderRadius: "10px",
    color: "#3b6b9d",
    fontSize: "13px",
  },

  /* =======================================================
     LOADING
  ======================================================= */

  loadingCard: {
    width: "100%",
    minHeight: "140px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
  },

  loadingIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    backgroundColor: "#e8f0f8",
    color: "#3b6b9d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
  },

  loadingText: {
    marginTop: "3px",
    fontSize: "12px",
    color: "#94a3b8",
  },

  /* =======================================================
     MAIN LAYOUT
  ======================================================= */

  mainLayout: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 330px",
    gap: "24px",
    alignItems: "start",
  },

  /* =======================================================
     CARDS
  ======================================================= */

  card: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    marginBottom: "18px",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.035)",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "17px 22px",
    borderBottom: "1px solid #edf0f4",
  },

  sectionIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    backgroundColor: "#edf4fb",
    color: "#3b6b9d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  sectionTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
  },

  sectionText: {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#94a3b8",
  },

  cardBody: {
    padding: "23px",
  },

  /* =======================================================
     FORM
  ======================================================= */

  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  threeColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "20px",
  },

  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "7px",
  },

  required: {
    color: "#dc2626",
    marginLeft: "3px",
  },

  input: {
    height: "40px",
    borderRadius: "8px",
    border: "1px solid #dce2e9",
    fontSize: "13px",
    color: "#1e293b",
    boxShadow: "none",
    backgroundColor: "#ffffff",
  },

  textarea: {
    borderRadius: "8px",
    border: "1px solid #dce2e9",
    fontSize: "13px",
    color: "#1e293b",
    resize: "vertical",
    boxShadow: "none",
    backgroundColor: "#ffffff",
  },

  help: {
    marginTop: "6px",
    fontSize: "11px",
    color: "#94a3b8",
  },

  /* =======================================================
     PRICE PREFIX
  ======================================================= */

  prefixWrap: {
    display: "flex",
    height: "40px",
  },

  prefix: {
    width: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    border: "1px solid #dce2e9",
    borderRight: "none",
    borderRadius: "8px 0 0 8px",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "600",
  },

  prefixInput: {
    height: "40px",
    borderRadius: "0 8px 8px 0",
    border: "1px solid #dce2e9",
    fontSize: "13px",
    color: "#1e293b",
    boxShadow: "none",
  },

  /* =======================================================
     PRICING INDICATORS
  ======================================================= */

  pricingIndicators: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
    marginTop: "20px",
    paddingTop: "18px",
    borderTop: "1px solid #edf0f4",
  },

  pricingIndicator: {
    minHeight: "62px",
    padding: "10px 12px",
    border: "1px solid #e5eaf0",
    borderRadius: "9px",
    backgroundColor: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "4px",
  },

  indicatorLabel: {
    fontSize: "10px",
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },

  indicatorValue: {
    fontSize: "14px",
    color: "#1e293b",
  },

  /* =======================================================
     WARNING
  ======================================================= */

  warning: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginTop: "16px",
    padding: "11px 13px",
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "9px",
    color: "#a16207",
    fontSize: "12px",
    lineHeight: "1.5",
  },

  /* =======================================================
     STOCK STATUS
  ======================================================= */

  stockStatusBox: {
    marginTop: "20px",
    padding: "13px 14px",
    border: "1px solid #e5eaf0",
    borderRadius: "9px",
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  stockStatusLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  stockStatusIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#eaf2f9",
    color: "#3b6b9d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  stockStatusTitle: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#334155",
  },

  stockStatusText: {
    marginTop: "2px",
    fontSize: "10px",
    color: "#94a3b8",
  },

  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  uploadBox: {
    minHeight: "190px",
    border: "1px dashed #cbd5e1",
    borderRadius: "10px",
    backgroundColor: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "24px",
    boxSizing: "border-box",
  },

  uploadIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    backgroundColor: "#eaf2f9",
    color: "#3b6b9d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "11px",
  },

  uploadTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
  },

  uploadText: {
    marginTop: "4px",
    marginBottom: "14px",
    fontSize: "11px",
    color: "#94a3b8",
  },

  secondaryLabelButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    height: "34px",
    padding: "0 14px",
    backgroundColor: "#ffffff",
    border: "1px solid #d8dee7",
    borderRadius: "8px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    margin: 0,
  },

  uploadedBox: {
    padding: "16px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  previewImage: {
    width: "112px",
    height: "112px",
    objectFit: "cover",
    borderRadius: "9px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    flexShrink: 0,
  },

  uploadedContent: {
    flex: 1,
    minWidth: 0,
  },

  imageActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  removeButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    height: "34px",
    padding: "0 12px",
    borderRadius: "8px",
    border: "1px solid #fecaca",
    backgroundColor: "#ffffff",
    color: "#b91c1c",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },

  /* =======================================================
     FOOTER
  ======================================================= */

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "16px 20px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.035)",
  },

  footerTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1e293b",
  },

  footerText: {
    marginTop: "3px",
    fontSize: "11px",
    color: "#94a3b8",
  },

  footerButtons: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  cancelButton: {
    height: "40px",
    padding: "0 18px",
    border: "1px solid #d8dee7",
    backgroundColor: "#ffffff",
    color: "#475569",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
  },

  saveButton: {
    height: "40px",
    padding: "0 18px",
    border: "none",
    backgroundColor: "#3b6b9d",
    color: "#ffffff",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    boxShadow: "0 2px 4px rgba(59, 107, 157, 0.2)",
  },

  /* =======================================================
     RIGHT SIDEBAR
  ======================================================= */

  sideColumn: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    position: "sticky",
    top: "24px",
  },

  sideCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.035)",
    overflow: "hidden",
  },

  sideBody: {
    padding: "19px 20px",
  },

  sideHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "16px",
  },

  sideTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
  },

  sideSubtitle: {
    margin: "3px 0 0",
    fontSize: "10px",
    color: "#94a3b8",
  },

  sideHeaderIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    backgroundColor: "#edf4fb",
    color: "#3b6b9d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  /* =======================================================
     PREVIEW
  ======================================================= */

  preview: {
    textAlign: "center",
    padding: "4px 0 17px",
    marginBottom: "5px",
    borderBottom: "1px solid #edf0f4",
  },

  sideImage: {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
  },

  sideImagePlaceholder: {
    width: "100px",
    height: "100px",
    margin: "0 auto",
    borderRadius: "10px",
    backgroundColor: "#f1f5f9",
    color: "#a0aab8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e2e8f0",
  },

  previewName: {
    marginTop: "12px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
    wordBreak: "break-word",
  },

  previewCode: {
    margin: "3px 0 10px",
    fontSize: "11px",
    color: "#94a3b8",
  },

  /* =======================================================
     BADGES
  ======================================================= */

  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: "700",
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

  badgeNeutral: {
    backgroundColor: "#f1f5f9",
    color: "#64748b",
  },

  /* =======================================================
     SIDE ROWS
  ======================================================= */

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "10px 0",
    borderBottom: "1px solid #edf0f4",
    fontSize: "11px",
    color: "#64748b",
  },

  rowValue: {
    color: "#334155",
    fontWeight: "700",
    textAlign: "right",
    maxWidth: "58%",
    wordBreak: "break-word",
  },

  /* =======================================================
     PROFIT BOX
  ======================================================= */

  profitBox: {
    marginTop: "14px",
    padding: "13px",
    borderRadius: "9px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e5eaf0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  profitLabel: {
    fontSize: "10px",
    color: "#94a3b8",
    marginBottom: "3px",
  },

  profitValue: {
    fontSize: "16px",
    fontWeight: "700",
  },

  marginBox: {
    textAlign: "right",
    paddingLeft: "12px",
    borderLeft: "1px solid #dfe5eb",
  },

  marginLabel: {
    fontSize: "10px",
    color: "#94a3b8",
    marginBottom: "3px",
  },

  /* =======================================================
     EDIT NOTE
  ======================================================= */

  editNote: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "13px",
    borderRadius: "10px",
    backgroundColor: "#edf4fb",
    border: "1px solid #d7e5f2",
  },

  editNoteIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#3b6b9d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  editNoteTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#315a85",
  },

  editNoteText: {
    marginTop: "3px",
    fontSize: "10px",
    lineHeight: "1.5",
    color: "#6b8298",
  },
};