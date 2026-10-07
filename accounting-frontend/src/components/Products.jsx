import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Table, Offcanvas  } from "react-bootstrap";
import axios from "axios";
import {
  BsPlus,
  BsPencil,
  BsTrash,
  BsBoxSeam,
  BsSearch,
  BsArrowCounterclockwise,
  BsCheckCircle,
  BsExclamationTriangle,
  BsXCircle,
  BsCurrencyRupee,
  BsFunnel,
  BsChevronLeft,
  BsChevronRight,

  BsArrowLeft,
  BsPlusCircle,
} from "react-icons/bs";

/* =========================================================
   HELPERS
========================================================= */

const formatMoney = (value) =>
  "₹" +
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

const getStatus = (product) => {
  const stock = Number(product.currentStock || 0);
  const min = Number(product.minimumStock || 0);

  if (stock === 0) return "Out of Stock";
  if (stock <= min) return "Low Stock";
  return "In Stock";
};

const getPageList = (total, current) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [1];

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) {
    pages.push("…");
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < total - 1) {
    pages.push("…");
  }

  pages.push(total);

  return pages;
};

/* =========================================================
   PRODUCTS
========================================================= */

export const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
const [selectedProduct, setSelectedProduct] = useState(null);
const [showOffcanvas, setShowOffcanvas] = useState(false);
const [showAdjustForm, setShowAdjustForm] = useState(false);

const [stockType, setStockType] = useState("increase");
const [stockQuantity, setStockQuantity] = useState("");
const [stockNotes, setStockNotes] = useState("");
const [savingStock, setSavingStock] = useState(false);
  const itemsPerPage = 8;

  /* =======================================================
     FETCH PRODUCTS
  ======================================================= */

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
  `${import.meta.env.VITE_API_URL}/products`
      );

      setProducts(response.data || []);
    } catch (error) {
      console.log("Error fetching products:", error);
    }
  };

  /* =======================================================
     FILTER LOGIC
  ======================================================= */

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productName = (product.name || "").toLowerCase();
      const productCode = (product.code || "").toLowerCase();
      const searchText = search.toLowerCase();

      const matchesSearch =
        productName.includes(searchText) ||
        productCode.includes(searchText);

      const matchesCategory =
        !categoryFilter ||
        product.category === categoryFilter;

      const matchesStatus =
        !statusFilter ||
        getStatus(product) === statusFilter;

      const productDate = product.createdAt
        ? new Date(product.createdAt)
        : null;

      const matchesFromDate =
        !fromDate ||
        (productDate &&
          productDate >= new Date(`${fromDate}T00:00:00`));

      const matchesToDate =
        !toDate ||
        (productDate &&
          productDate <= new Date(`${toDate}T23:59:59`));

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [
    products,
    search,
    categoryFilter,
    statusFilter,
    fromDate,
    toDate,
  ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.ceil(
    filteredProducts.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const showingFrom =
    filteredProducts.length === 0
      ? 0
      : startIndex + 1;

  const showingTo = Math.min(
    startIndex + itemsPerPage,
    filteredProducts.length
  );

  /* =======================================================
     SUMMARY
  ======================================================= */

  const inStockCount = products.filter(
    (product) => getStatus(product) === "In Stock"
  ).length;

  const lowStockCount = products.filter(
    (product) => getStatus(product) === "Low Stock"
  ).length;

  const outStockCount = products.filter(
    (product) => getStatus(product) === "Out of Stock"
  ).length;

  const inventoryValue = products.reduce(
    (sum, product) =>
      sum +
      Number(product.purchasePrice || 0) *
        Number(product.currentStock || 0),
    0
  );

  const categoryOptions = [
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  const hasActiveFilters =
    search ||
    categoryFilter ||
    statusFilter ||
    fromDate ||
    toDate;
/* =======================================================
   PRODUCT DETAILS / STOCK ADJUSTMENT
======================================================= */

const resetStockForm = () => {
  setStockType("increase");
  setStockQuantity("");
  setStockNotes("");
};

const handleProductClick = (product) => {
  setSelectedProduct(product);
  setShowOffcanvas(true);
  setShowAdjustForm(false);
  resetStockForm();
};

const handleCloseOffcanvas = () => {
  setShowOffcanvas(false);
  setShowAdjustForm(false);
  setSelectedProduct(null);
  resetStockForm();
};

const handleOpenAdjustForm = () => {
  resetStockForm();
  setShowAdjustForm(true);
};

const handleSaveStockAdjustment = async () => {
  const quantity = Number(stockQuantity);

  if (!quantity || quantity <= 0) {
    alert("Please enter a valid quantity.");
    return;
  }

  if (!selectedProduct) {
    return;
  }

  const currentStock = Number(
    selectedProduct.currentStock || 0
  );

  if (
    stockType === "decrease" &&
    quantity > currentStock
  ) {
    alert(
      `Cannot decrease stock by ${quantity}. Current stock is ${currentStock}.`
    );
    return;
  }

  try {
    setSavingStock(true);

    const response = await axios.patch(
      `${import.meta.env.VITE_API_URL}/products/${selectedProduct._id}/adjust-stock`,
      {
        type: stockType,
        quantity,
        notes: stockNotes,
      }
    );

    const updatedProduct = response.data.product;

    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === updatedProduct._id
          ? updatedProduct
          : product
      )
    );

    setSelectedProduct(updatedProduct);

    setShowAdjustForm(false);
    resetStockForm();

 } catch (error) {
  console.log("Stock adjustment error:", error);
  console.log("Status:", error.response?.status);
  console.log("Response:", error.response?.data);

  alert(
    error.response?.data?.message ||
    error.response?.data ||
    error.message ||
    "Unable to adjust stock."
  );
} finally {
  setSavingStock(false);
}}
  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(
  `${import.meta.env.VITE_API_URL}/products/${id}`
      );

      const updatedProducts = products.filter(
        (product) => product._id !== id
      );

      setProducts(updatedProducts);

      const updatedFilteredProducts =
        updatedProducts.filter((product) => {
          const productName = (
            product.name || ""
          ).toLowerCase();

          const productCode = (
            product.code || ""
          ).toLowerCase();

          const searchText = search.toLowerCase();

          const matchesSearch =
            productName.includes(searchText) ||
            productCode.includes(searchText);

          const matchesCategory =
            !categoryFilter ||
            product.category === categoryFilter;

          const matchesStatus =
            !statusFilter ||
            getStatus(product) === statusFilter;

          const productDate = product.createdAt
            ? new Date(product.createdAt)
            : null;

          const matchesFromDate =
            !fromDate ||
            (productDate &&
              productDate >=
                new Date(`${fromDate}T00:00:00`));

          const matchesToDate =
            !toDate ||
            (productDate &&
              productDate <=
                new Date(`${toDate}T23:59:59`));

          return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus &&
            matchesFromDate &&
            matchesToDate
          );
        });

      const updatedTotalPages = Math.ceil(
        updatedFilteredProducts.length / itemsPerPage
      );

      if (
        updatedTotalPages > 0 &&
        currentPage > updatedTotalPages
      ) {
        setCurrentPage(updatedTotalPages);
      }
    } catch (error) {
      console.log("Error deleting product:", error);
      alert("Unable to delete product.");
    }
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = (id) => {
    navigate(`/products/edit/${id}`);
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setStatusFilter("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div style={styles.page}>
<style>{`
.product-offcanvas {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  left: auto !important;

  width: 360px !important;
  max-width: 100% !important;

  height: 100vh !important;
  max-height: 100vh !important;

  z-index: 1100 !important;

  display: flex !important;
  flex-direction: column !important;
}

.product-offcanvas .offcanvas-header {
  flex-shrink: 0 !important;
}

.product-offcanvas .offcanvas-body {
  flex: 1 1 auto !important;
  min-height: 0 !important;

  overflow: hidden !important;

  display: flex !important;
  flex-direction: column !important;
}

  .product-offcanvas.show {
    visibility: visible !important;
  }

  .offcanvas-backdrop {
    position: fixed !important;
    inset: 0 !important;
    z-index: 1090 !important;
  }
`}</style>
      {/* ===================================================
          HEADER
      =================================================== */}

      <div style={styles.header}>

        <div>
          <div style={styles.breadcrumb}>
            Inventory
            <span style={styles.breadcrumbSlash}>/</span>
            Products
          </div>

          <h1 style={styles.title}>
            Products
          </h1>

          <p style={styles.subtitle}>
            Manage your products, pricing and inventory levels.
          </p>
        </div>

        <Link
          to="/products/add"
          style={{ textDecoration: "none" }}
        >
          <Button style={styles.primaryButton}>
            <BsPlus size={17} />
             New Product
          </Button>
        </Link>

      </div>

      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}

      <div style={styles.summaryGrid}>

        {/* Total Products */}

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              backgroundColor: "#eaf1f8",
              color: "#2b5f8f",
            }}
          >
            <BsBoxSeam size={18} />
          </div>

          <div>
            <div style={styles.summaryLabel}>
              Total Products
            </div>

            <div style={styles.summaryNumber}>
              {products.length}
            </div>
          </div>
        </div>

        {/* In Stock */}

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              backgroundColor: "#e6f4ea",
              color: "#15803d",
            }}
          >
            <BsCheckCircle size={18} />
          </div>

          <div>
            <div style={styles.summaryLabel}>
              In Stock
            </div>

            <div
              style={{
                ...styles.summaryNumber,
                color: "#15803d",
              }}
            >
              {inStockCount}
            </div>
          </div>
        </div>

        {/* Low Stock */}

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              backgroundColor: "#fef3d6",
              color: "#b45309",
            }}
          >
            <BsExclamationTriangle size={18} />
          </div>

          <div>
            <div style={styles.summaryLabel}>
              Low Stock
            </div>

            <div
              style={{
                ...styles.summaryNumber,
                color: "#b45309",
              }}
            >
              {lowStockCount}
            </div>
          </div>
        </div>

        {/* Out of Stock */}

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              backgroundColor: "#fde8e8",
              color: "#b91c1c",
            }}
          >
            <BsXCircle size={18} />
          </div>

          <div>
            <div style={styles.summaryLabel}>
              Out of Stock
            </div>

            <div
              style={{
                ...styles.summaryNumber,
                color: "#b91c1c",
              }}
            >
              {outStockCount}
            </div>
          </div>
        </div>

        {/* Inventory Value */}

        <div style={styles.summaryCard}>
          <div
            style={{
              ...styles.summaryIcon,
              backgroundColor: "#eef2ff",
              color: "#405a80",
            }}
          >
            <BsCurrencyRupee size={18} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={styles.summaryLabel}>
              Inventory Value
            </div>

            <div
              style={{
                ...styles.summaryNumber,
                fontSize: "18px",
              }}
            >
              {formatMoney(inventoryValue)}
            </div>
          </div>
        </div>

      </div>

      {/* ===================================================
          MAIN TABLE CARD
      =================================================== */}

      <Card style={styles.card}>

        {/* CARD HEADER */}

        <div style={styles.cardHeader}>

          <div>
            <div style={styles.cardTitle}>
              Product Inventory
            </div>

            <div style={styles.cardSubtitle}>
              View and manage all products in your inventory.
            </div>
          </div>

          <div style={styles.recordBadge}>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "record"
              : "records"}
          </div>

        </div>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div style={styles.filterSection}>

          <div style={styles.filterRow}>

            {/* Search */}

            <div style={styles.searchWrap}>

              <BsSearch
                size={14}
                style={styles.searchIcon}
              />

              <input
                type="text"
                value={search}
                placeholder="Search product or SKU"
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={styles.searchInput}
              />

            </div>

            {/* Category */}

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={styles.select}
            >
              <option value="">
                All categories
              </option>

              {categoryOptions.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

            {/* Status */}

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={styles.select}
            >
              <option value="">
                All statuses
              </option>

              <option value="In Stock">
                In Stock
              </option>

              <option value="Low Stock">
                Low Stock
              </option>

              <option value="Out of Stock">
                Out of Stock
              </option>
            </select>

            {/* From */}

            <div style={styles.dateField}>
              <span style={styles.dateLabel}>
                From
              </span>

              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                style={styles.dateInput}
              />
            </div>

            {/* To */}

            <div style={styles.dateField}>
              <span style={styles.dateLabel}>
                To
              </span>

              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                style={styles.dateInput}
              />
            </div>

            {/* Reset */}

            {hasActiveFilters && (
              <Button
                onClick={resetFilters}
                style={styles.resetButton}
              >
                <BsArrowCounterclockwise size={13} />
                Reset
              </Button>
            )}

          </div>

          <div style={styles.filterBottom}>

            <div style={styles.filterInfo}>
              <BsFunnel size={12} />
              {hasActiveFilters
                ? "Filters applied"
                : "All products"}
            </div>

            <div style={styles.filterCount}>
              Showing {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}
            </div>

          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div style={styles.tableWrapper}>

          <Table
            hover
            style={styles.table}
          >

            <thead>

              <tr>

                <th
                  style={{
                    ...styles.th,
                    width: "25%",
                  }}
                >
                  Product
                </th>

                <th style={styles.th}>
                  Category
                </th>

                <th
                  style={{
                    ...styles.th,
                    textAlign: "right",
                  }}
                >
                  Purchase Price
                </th>

                <th
                  style={{
                    ...styles.th,
                    textAlign: "right",
                  }}
                >
                  Selling Price
                </th>

                <th
                  style={{
                    ...styles.th,
                    textAlign: "right",
                  }}
                >
                  Stock
                </th>

                <th
                  style={{
                    ...styles.th,
                    textAlign: "right",
                  }}
                >
                  Min. Stock
                </th>

                <th style={styles.th}>
                  Unit
                </th>

                <th
                  style={{
                    ...styles.th,
                    textAlign: "center",
                  }}
                >
                  Status
                </th>

                <th
                  style={{
                    ...styles.th,
                    textAlign: "right",
                  }}
                >
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {currentProducts.length > 0 ? (

                currentProducts.map((product) => {

                  const status =
                    getStatus(product);

                  const stock =
                    Number(product.currentStock || 0);

                  const minimum =
                    Number(product.minimumStock || 0);

                  return (
                    <tr key={product._id}>

                      {/* PRODUCT */}

                      <td style={styles.td}>

                        <div
  style={{
    ...styles.productCell,
    cursor: "pointer",
  }}
  onClick={() => handleProductClick(product)}
>

                          {product.image ? (

                            <img
                              src={product.image}
                              alt={product.name}
                              style={styles.productImage}
                            />

                          ) : (

                            <div style={styles.productIcon}>
                              <BsBoxSeam size={17} />
                            </div>

                          )}

                          <div style={styles.productInfo}>

                            <div style={styles.productName}>
                              {product.name}
                            </div>

                            <div style={styles.productSub}>
                              {product.code
                                ? `SKU ${product.code}`
                                : `ID ${String(
                                    product._id
                                  ).slice(-6)}`}
                            </div>

                          </div>

                        </div>

                      </td>

                      {/* CATEGORY */}

                      <td style={styles.td}>
                        <span
                          style={styles.categoryBadge}
                        >
                          {product.category ||
                            "Uncategorized"}
                        </span>
                      </td>

                      {/* PURCHASE */}

                      <td
                        style={{
                          ...styles.td,
                          textAlign: "right",
                        }}
                      >
                        <span style={styles.money}>
                          {formatMoney(
                            product.purchasePrice
                          )}
                        </span>
                      </td>

                      {/* SELLING */}

                      <td
                        style={{
                          ...styles.td,
                          textAlign: "right",
                        }}
                      >
                        <span style={styles.sellingPrice}>
                          {formatMoney(
                            product.sellingPrice
                          )}
                        </span>
                      </td>

                      {/* STOCK */}

                      <td
                        style={{
                          ...styles.td,
                          textAlign: "right",
                        }}
                      >
                        <span
                          style={{
                            ...styles.stockNumber,
                            color:
                              status === "Out of Stock"
                                ? "#b91c1c"
                                : status === "Low Stock"
                                ? "#b45309"
                                : "#334155",
                          }}
                        >
                          {stock}
                        </span>
                      </td>

                      {/* MIN STOCK */}

                      <td
                        style={{
                          ...styles.td,
                          textAlign: "right",
                        }}
                      >
                        <span style={styles.minimumStock}>
                          {minimum}
                        </span>
                      </td>

                      {/* UNIT */}

                      <td style={styles.td}>
                        {product.unit || "—"}
                      </td>

                      {/* STATUS */}

                      <td
                        style={{
                          ...styles.td,
                          textAlign: "center",
                        }}
                      >

                        <span
                          style={{
                            ...styles.badge,
                            ...(status === "In Stock"
                              ? styles.badgeSuccess
                              : status === "Low Stock"
                              ? styles.badgeWarning
                              : styles.badgeDanger),
                          }}
                        >
                          <span style={styles.badgeDot} />
                          {status}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td
                        style={{
                          ...styles.td,
                          textAlign: "right",
                        }}
                      >

                        <div style={styles.actions}>

                          <button
                            onClick={() =>
                              handleEdit(product._id)
                            }
                            style={styles.editAction}
                            title="Edit product"
                          >
                            <BsPencil size={12} />
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(product._id)
                            }
                            style={styles.deleteAction}
                            title="Delete product"
                          >
                            <BsTrash size={13} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })

              ) : (

                <tr>

                  <td
                    colSpan="9"
                    style={styles.empty}
                  >

                    <div style={styles.emptyIcon}>
                      <BsBoxSeam size={22} />
                    </div>

                    <div style={styles.emptyTitle}>
                      {hasActiveFilters
                        ? "No products found"
                        : "No products yet"}
                    </div>

                    <div style={styles.emptyText}>
                      {hasActiveFilters
                        ? "Try adjusting your search or filters."
                        : "Add your first product to start managing your inventory."}
                    </div>

                    {hasActiveFilters ? (

                      <button
                        onClick={resetFilters}
                        style={styles.emptyReset}
                      >
                        <BsArrowCounterclockwise
                          size={13}
                        />
                        Reset Filters
                      </button>

                    ) : (

                      <Link
                        to="/products/add"
                        style={{
                          textDecoration: "none",
                        }}
                      >
                        <button
                          style={styles.emptyAdd}
                        >
                          <BsPlus size={16} />
                          Add Product
                        </button>
                      </Link>

                    )}

                  </td>

                </tr>

              )}

            </tbody>

          </Table>

        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        {filteredProducts.length > 0 && (

          <div style={styles.pagination}>

            <div style={styles.paginationInfo}>
              Showing{" "}
              <strong>{showingFrom}</strong>
              {" – "}
              <strong>{showingTo}</strong>
              {" of "}
              <strong>{filteredProducts.length}</strong>
            </div>

            {totalPages > 1 && (

              <div style={styles.paginationControls}>

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      currentPage - 1
                    )
                  }
                  style={{
                    ...styles.pageButton,
                    opacity:
                      currentPage === 1 ? 0.45 : 1,
                    cursor:
                      currentPage === 1
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  <BsChevronLeft size={12} />
                  Previous
                </button>

                {getPageList(
                  totalPages,
                  currentPage
                ).map((pageNumber, index) =>

                  pageNumber === "…" ? (

                    <span
                      key={`dots-${index}`}
                      style={styles.dots}
                    >
                      …
                    </span>

                  ) : (

                    <button
                      key={pageNumber}
                      onClick={() =>
                        setCurrentPage(pageNumber)
                      }
                      style={{
                        ...styles.pageNumber,
                        backgroundColor:
                          currentPage === pageNumber
                            ? "#3b6b9d"
                            : "#ffffff",
                        color:
                          currentPage === pageNumber
                            ? "#ffffff"
                            : "#475569",
                        borderColor:
                          currentPage === pageNumber
                            ? "#3b6b9d"
                            : "#d5dce5",
                      }}
                    >
                      {pageNumber}
                    </button>

                  )
                )}

                <button
                  disabled={
                    currentPage === totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      currentPage + 1
                    )
                  }
                  style={{
                    ...styles.pageButton,
                    opacity:
                      currentPage === totalPages
                        ? 0.45
                        : 1,
                    cursor:
                      currentPage === totalPages
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Next
                  <BsChevronRight size={12} />
                </button>

              </div>

            )}

          </div>

        )}

       </Card>

      {/* =================================================
          PRODUCT DETAILS / STOCK ADJUSTMENT OFFCANVAS
      ================================================= */}

      <Offcanvas
  show={showOffcanvas}
  onHide={handleCloseOffcanvas}
  placement="end"
  className="product-offcanvas"
  style={{
    height: "100vh",
  }}
      >
        <Offcanvas.Header
          closeButton
          style={styles.offcanvasHeader}
        >
          <Offcanvas.Title style={styles.offcanvasTitle}>
            {showAdjustForm
              ? "Adjust Stock"
              : "Product Details"}
          </Offcanvas.Title>
        </Offcanvas.Header>

<Offcanvas.Body
  style={{
    ...styles.offcanvasBody,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
  }}
>
  {/* ================= PRODUCT DETAILS ================= */}

  {selectedProduct && !showAdjustForm && (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        paddingBottom: "10px",
      }}
    >
      {/* PRODUCT HEADER */}

      <div style={styles.detailProductHeader}>
        {selectedProduct.image ? (
          <img
            src={selectedProduct.image}
            alt={selectedProduct.name}
            style={styles.detailProductImage}
          />
        ) : (
          <div style={styles.detailProductIcon}>
            <BsBoxSeam size={24} />
          </div>
        )}

        <div style={styles.detailProductInfo}>
          <div style={styles.detailProductName}>
            {selectedProduct.name}
          </div>

          <div style={styles.detailProductCode}>
            {selectedProduct.code
              ? `SKU ${selectedProduct.code}`
              : `ID ${String(selectedProduct._id).slice(-6)}`}
          </div>
        </div>
      </div>

      {/* STOCK SUMMARY */}

      <div style={styles.stockSummaryCard}>
        <div>
          <div style={styles.stockSummaryLabel}>
            Current Stock
          </div>

          <div style={styles.stockSummaryNumber}>
            {Number(selectedProduct.currentStock || 0)}

            <span style={styles.stockSummaryUnit}>
              {" "}
              {selectedProduct.unit || "units"}
            </span>
          </div>
        </div>

        <span
          style={{
            ...styles.badge,
            ...(getStatus(selectedProduct) === "In Stock"
              ? styles.badgeSuccess
              : getStatus(selectedProduct) === "Low Stock"
              ? styles.badgeWarning
              : styles.badgeDanger),
          }}
        >
          <span style={styles.badgeDot} />
          {getStatus(selectedProduct)}
        </span>
      </div>

      {/* PRODUCT INFORMATION */}

      <div style={styles.detailSection}>
        <div style={styles.detailSectionTitle}>
          Product Information
        </div>

        <div style={styles.detailGrid}>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>
              Category
            </span>

            <span style={styles.detailValue}>
              {selectedProduct.category || "Uncategorized"}
            </span>
          </div>

          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>
              Unit
            </span>

            <span style={styles.detailValue}>
              {selectedProduct.unit || "—"}
            </span>
          </div>

          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>
              Purchase Price
            </span>

            <span style={styles.detailValue}>
              {formatMoney(selectedProduct.purchasePrice)}
            </span>
          </div>

          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>
              Selling Price
            </span>

            <span
              style={{
                ...styles.detailValue,
                fontWeight: "600",
                color: "#1e293b",
              }}
            >
              {formatMoney(selectedProduct.sellingPrice)}
            </span>
          </div>

          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>
              Minimum Stock
            </span>

            <span style={styles.detailValue}>
              {Number(selectedProduct.minimumStock || 0)}
            </span>
          </div>

          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>
              Opening Stock
            </span>

            <span style={styles.detailValue}>
              {Number(selectedProduct.openingStock || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}

      {selectedProduct.description && (
        <div style={styles.detailSection}>
          <div style={styles.detailSectionTitle}>
            Description
          </div>

          <div style={styles.descriptionText}>
            {selectedProduct.description}
          </div>
        </div>
      )}

      {/* ACTION BUTTONS */}

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "18px",
        }}
      >
        <Button
          onClick={handleOpenAdjustForm}
          style={{
            flex: 1,
            border: "none",
            backgroundColor: "#3b6b9d",
            fontSize: "12px",
            fontWeight: "600",
            padding: "9px 12px",
            borderRadius: "6px",
          }}
        >
          <BsArrowCounterclockwise
            size={14}
            style={{ marginRight: "6px" }}
          />
          Adjust Stock
        </Button>

        <Button
          onClick={handleCloseOffcanvas}
          variant="light"
          style={{
            padding: "9px 16px",
            border: "1px solid #d9dee7",
            color: "#475569",
            backgroundColor: "#ffffff",
            fontSize: "12px",
            fontWeight: "600",
            borderRadius: "6px",
          }}
        >
          Close
        </Button>
      </div>
    </div>
  )}

  {/* ================= ADJUST STOCK ================= */}

  {selectedProduct && showAdjustForm && (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      {/* SCROLLABLE CONTENT */}

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          paddingBottom: "15px",
          paddingRight: "3px",
        }}
      >
        {/* BACK */}

        <button
          type="button"
          onClick={() => {
            setShowAdjustForm(false);
            resetStockForm();
          }}
          style={styles.backButton}
        >
          <BsArrowLeft size={14} />
          Back to Product
        </button>

        {/* PRODUCT */}

        <div style={styles.adjustProductCard}>
          <div style={styles.adjustProductIcon}>
            <BsBoxSeam size={18} />
          </div>

          <div>
            <div style={styles.adjustProductName}>
              {selectedProduct.name}
            </div>

            <div style={styles.adjustProductCode}>
              {selectedProduct.code
                ? `SKU ${selectedProduct.code}`
                : ""}
            </div>
          </div>
        </div>

        {/* CURRENT STOCK */}

        <div style={styles.currentStockBox}>
          <span style={styles.currentStockLabel}>
            Current Stock
          </span>

          <strong style={styles.currentStockValue}>
            {Number(selectedProduct.currentStock || 0)}{" "}
            <span>
              {selectedProduct.unit || "units"}
            </span>
          </strong>
        </div>

        {/* ADJUSTMENT TYPE */}

        <div style={styles.formSection}>
          <label style={styles.formLabel}>
            Stock Adjustment
          </label>

          <select
            value={stockType}
            onChange={(e) =>
              setStockType(e.target.value)
            }
            style={styles.formInput}
          >
            <option value="increase">
              Increased Stock
            </option>

            <option value="decrease">
              Decreased Stock
            </option>
          </select>
        </div>

        {/* QUANTITY */}

        <div style={styles.formSection}>
          <label style={styles.formLabel}>
            Quantity
          </label>

          <input
            type="number"
            min="1"
            value={stockQuantity}
            onChange={(e) =>
              setStockQuantity(e.target.value)
            }
            placeholder="Enter quantity"
            style={styles.formInput}
          />
        </div>

        {/* NOTES */}

        <div style={styles.formSection}>
          <label style={styles.formLabel}>
            Notes
            <span style={styles.optionalLabel}>
              Optional
            </span>
          </label>

          <textarea
            value={stockNotes}
            onChange={(e) =>
              setStockNotes(e.target.value)
            }
            placeholder="Reason for stock adjustment..."
            rows={4}
            style={styles.formTextarea}
          />
        </div>

        {/* PREVIEW */}

        {stockQuantity &&
          Number(stockQuantity) > 0 && (
            <div style={styles.previewCard}>
              <div style={styles.previewTitle}>
                Stock Preview
              </div>

              <div style={styles.previewRow}>
                <span>Current Stock</span>

                <strong>
                  {Number(
                    selectedProduct.currentStock || 0
                  )}
                </strong>
              </div>

              <div style={styles.previewRow}>
                <span>Adjustment</span>

                <strong
                  style={{
                    color:
                      stockType === "increase"
                        ? "#15803d"
                        : "#b91c1c",
                  }}
                >
                  {stockType === "increase" ? "+" : "-"}
                  {Number(stockQuantity)}
                </strong>
              </div>

              <div style={styles.previewDivider} />

              <div style={styles.previewRow}>
                <span>New Stock</span>

                <strong style={styles.previewNewStock}>
                  {Math.max(
                    0,
                    Number(
                      selectedProduct.currentStock || 0
                    ) +
                      (stockType === "increase"
                        ? Number(stockQuantity)
                        : -Number(stockQuantity))
                  )}
                </strong>
              </div>
            </div>
          )}
      </div>

      {/* FIXED BOTTOM BUTTONS */}

      <div
        style={{
          flexShrink: 0,
          borderTop: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          paddingTop: "12px",
          paddingBottom: "4px",
          display: "flex",
          gap: "8px",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setShowAdjustForm(false);
            resetStockForm();
          }}
          style={styles.cancelAdjustButton}
          disabled={savingStock}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSaveStockAdjustment}
          style={styles.saveAdjustButton}
          disabled={savingStock}
        >
          {savingStock
            ? "Saving..."
            : "Save Adjustment"}
        </button>
      </div>
    </div>
  )}
</Offcanvas.Body>
      </Offcanvas>

    </div>
   );
};

/* =========================================================
   STYLES
========================================================= */

const FONT =
  "Inter, 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif";

const styles = {
  /* =======================================================
     PAGE
  ======================================================= */

  page: {
    width: "100%",
    minHeight: "100vh",
    padding: "28px 30px 40px",
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
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "22px",
  },

  breadcrumb: {
    fontSize: "11px",
    color: "#8b96a5",
    fontWeight: "500",
    marginBottom: "5px",
  },

  breadcrumbSlash: {
    margin: "0 6px",
    color: "#c3c9d1",
  },

  title: {
    margin: 0,
    fontSize: "24px",
    lineHeight: "29px",
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: "-0.4px",
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#718096",
    fontSize: "13px",
  },

  primaryButton: {
    border: "none",
    backgroundColor: "#3b6b9d",
    color: "#ffffff",
    borderRadius: "7px",
    height: "39px",
    padding: "0 17px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontSize: "13px",
    fontWeight: "600",
    boxShadow:
      "0 1px 2px rgba(15, 23, 42, 0.12)",
  },

  /* =======================================================
     SUMMARY
  ======================================================= */

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(5, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },

  summaryCard: {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "17px 18px",
    backgroundColor: "#ffffff",
    border: "1px solid #e4e8ee",
    borderRadius: "10px",
    boxShadow:
      "0 1px 3px rgba(15, 23, 42, 0.035)",
  },

  summaryIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  summaryLabel: {
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "500",
    marginBottom: "3px",
    whiteSpace: "nowrap",
  },

  summaryNumber: {
    color: "#0f172a",
    fontSize: "21px",
    lineHeight: "24px",
    fontWeight: "700",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },

  /* =======================================================
     MAIN CARD
  ======================================================= */

  card: {
    width: "100%",
    border: "1px solid #dfe5ec",
    borderRadius: "10px",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    boxShadow:
      "0 1px 3px rgba(15, 23, 42, 0.04)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    padding: "17px 20px",
    borderBottom: "1px solid #e7ebf0",
    backgroundColor: "#ffffff",
  },

  cardTitle: {
    color: "#172033",
    fontSize: "14px",
    fontWeight: "600",
  },

  cardSubtitle: {
    color: "#8a97a8",
    fontSize: "11px",
    marginTop: "3px",
  },

  recordBadge: {
    backgroundColor: "#f4f6f8",
    color: "#64748b",
    border: "1px solid #e3e8ee",
    borderRadius: "6px",
    padding: "5px 9px",
    fontSize: "11px",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },

  /* =======================================================
     FILTERS
  ======================================================= */

  filterSection: {
    padding: "14px 20px 12px",
    borderBottom: "1px solid #e7ebf0",
    backgroundColor: "#ffffff",
  },

  filterRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "9px",
    width: "100%",
  },

  searchWrap: {
    position: "relative",
    flex: "1 1 280px",
    minWidth: "250px",
  },

  searchIcon: {
    position: "absolute",
    left: "11px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    pointerEvents: "none",
  },

  searchInput: {
    width: "100%",
    height: "36px",
    padding: "0 11px 0 31px",
    border: "1px solid #d5dce5",
    borderRadius: "7px",
    outline: "none",
    fontSize: "12px",
    color: "#334155",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
  },

  select: {
    height: "36px",
    minWidth: "150px",
    padding: "0 28px 0 10px",
    border: "1px solid #d5dce5",
    borderRadius: "7px",
    outline: "none",
    fontSize: "12px",
    color: "#475569",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },

  dateField: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  dateLabel: {
    color: "#7b8797",
    fontSize: "11px",
    fontWeight: "500",
  },

  dateInput: {
    height: "36px",
    padding: "0 9px",
    border: "1px solid #d5dce5",
    borderRadius: "7px",
    outline: "none",
    fontSize: "12px",
    color: "#475569",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },

  resetButton: {
    height: "36px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "0 11px",
    border: "1px solid #d5dce5",
    backgroundColor: "#ffffff",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "500",
    borderRadius: "7px",
  },

  filterBottom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    marginTop: "11px",
  },

  filterInfo: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#8a97a8",
    fontSize: "10px",
    fontWeight: "500",
  },

  filterCount: {
    color: "#94a3b8",
    fontSize: "10px",
  },

  /* =======================================================
     TABLE
  ======================================================= */

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "1120px",
    margin: 0,
    borderCollapse: "collapse",
  },

  th: {
    padding: "13px 18px",
    backgroundColor: "#f8fafc",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.3px",
    textTransform: "uppercase",
    borderBottom: "1px solid #e1e7ed",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  },

  td: {
    padding: "14px 18px",
    verticalAlign: "middle",
    borderBottom: "1px solid #edf1f5",
    fontSize: "12px",
    color: "#526173",
    whiteSpace: "nowrap",
    height: "65px",
    boxSizing: "border-box",
  },

  /* =======================================================
     PRODUCT
  ======================================================= */

  productCell: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    minWidth: "210px",
  },

  productImage: {
    width: "40px",
    height: "40px",
    borderRadius: "7px",
    objectFit: "cover",
    border: "1px solid #e1e7ed",
    flexShrink: 0,
  },

  productIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "7px",
    backgroundColor: "#eaf1f8",
    color: "#3b6b9d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  productInfo: {
    minWidth: 0,
  },

  productName: {
    color: "#1e293b",
    fontSize: "12px",
    fontWeight: "600",
    maxWidth: "240px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  productSub: {
    color: "#9aa5b3",
    fontSize: "10px",
    marginTop: "3px",
  },

  categoryBadge: {
    display: "inline-block",
    backgroundColor: "#f3f6f9",
    color: "#566476",
    border: "1px solid #e6ebf0",
    padding: "5px 8px",
    borderRadius: "5px",
    fontSize: "10px",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },

  money: {
    color: "#526173",
    fontWeight: "500",
    fontVariantNumeric: "tabular-nums",
  },

  sellingPrice: {
    color: "#1e293b",
    fontWeight: "600",
    fontVariantNumeric: "tabular-nums",
  },

  stockNumber: {
    fontWeight: "600",
    fontVariantNumeric: "tabular-nums",
  },

  minimumStock: {
    color: "#7b8797",
    fontVariantNumeric: "tabular-nums",
  },

  /* =======================================================
     STATUS
  ======================================================= */

  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    padding: "5px 9px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },

  badgeDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    backgroundColor: "currentColor",
  },

  badgeSuccess: {
    backgroundColor: "#e6f4ea",
    color: "#1e7e34",
  },

  badgeWarning: {
    backgroundColor: "#fef3d6",
    color: "#b45309",
  },

  badgeDanger: {
    backgroundColor: "#fde8e8",
    color: "#9b1c1c",
  },

  /* =======================================================
     ACTIONS
  ======================================================= */

  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "6px",
  },

  editAction: {
    height: "30px",
    padding: "0 10px",
    border: "1px solid #d8dfe7",
    backgroundColor: "#ffffff",
    color: "#3b6b9d",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: "600",
    borderRadius: "6px",
    cursor: "pointer",
  },

  deleteAction: {
    width: "30px",
    height: "30px",
    padding: 0,
    border: "1px solid #efcccc",
    backgroundColor: "#ffffff",
    color: "#b91c1c",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    cursor: "pointer",
  },

  /* =======================================================
     EMPTY
  ======================================================= */

  empty: {
    textAlign: "center",
    padding: "70px 20px",
    borderBottom: "none",
  },

  emptyIcon: {
    width: "52px",
    height: "52px",
    margin: "0 auto 13px",
    borderRadius: "10px",
    backgroundColor: "#f1f5f9",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: "#334155",
    fontSize: "14px",
    fontWeight: "600",
  },

  emptyText: {
    color: "#94a3b8",
    fontSize: "12px",
    marginTop: "5px",
  },

  emptyReset: {
    marginTop: "16px",
    height: "34px",
    padding: "0 12px",
    border: "1px solid #d5dce5",
    backgroundColor: "#ffffff",
    color: "#475569",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "500",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  },

  emptyAdd: {
    marginTop: "16px",
    height: "36px",
    padding: "0 14px",
    border: "none",
    backgroundColor: "#3b6b9d",
    color: "#ffffff",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  },
  /* =======================================================
     PRODUCT DETAILS OFFCANVAS
  ======================================================= */

 

  offcanvasHeader: {
    padding: "14px 16px",
    borderBottom: "1px solid #e7ebf0",
    backgroundColor: "#ffffff",
  },

  offcanvasTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#172033",
  },

  offcanvasBody: {
    padding: "20px",
    backgroundColor: "#ffffff",
      overflow: "hidden",

  },

  detailProductHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    paddingBottom: "14px",
    borderBottom: "1px solid #edf1f5",
  },

  detailProductImage: {
    width: "58px",
    height: "58px",
    borderRadius: "9px",
    objectFit: "cover",
    border: "1px solid #e1e7ed",
    flexShrink: 0,
  },

  detailProductIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "9px",
    backgroundColor: "#eaf1f8",
    color: "#3b6b9d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  detailProductInfo: {
    minWidth: 0,
  },

  detailProductName: {
    fontSize: "15px",
    fontWeight: "650",
    color: "#172033",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  detailProductCode: {
    marginTop: "4px",
    fontSize: "10px",
    color: "#94a3b8",
  },

  stockSummaryCard: {
    marginTop: "18px",
    padding: "16px",
    border: "1px solid #e1e7ed",
    borderRadius: "9px",
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  stockSummaryLabel: {
    fontSize: "10px",
    color: "#7b8797",
    fontWeight: "500",
  },

  stockSummaryNumber: {
    marginTop: "4px",
    fontSize: "25px",
    lineHeight: "28px",
    fontWeight: "700",
    color: "#172033",
    fontVariantNumeric: "tabular-nums",
  },

  stockSummaryUnit: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "500",
  },

  detailSection: {
    marginTop: "22px",
  },

  detailSectionTitle: {
    marginBottom: "12px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#526173",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    border: "1px solid #e7ebf0",
    borderRadius: "8px",
    overflow: "hidden",
  },

  detailItem: {
    padding: "12px",
    borderBottom: "1px solid #edf1f5",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  detailLabel: {
    fontSize: "10px",
    color: "#94a3b8",
  },

  detailValue: {
    fontSize: "11px",
    color: "#526173",
    fontWeight: "500",
  },

  descriptionText: {
    padding: "12px",
    border: "1px solid #e7ebf0",
    borderRadius: "8px",
    fontSize: "11px",
    lineHeight: "18px",
    color: "#64748b",
    backgroundColor: "#fafbfc",
  },

  detailActionSection: {
    marginTop: "25px",
  },

  adjustStockButton: {
    width: "100%",
    height: "40px",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#3b6b9d",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontSize: "12px",
    fontWeight: "600",
  },

  /* =======================================================
     STOCK ADJUSTMENT FORM
  ======================================================= */

  backButton: {
    border: "none",
    backgroundColor: "transparent",
    padding: 0,
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "500",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  },

  adjustProductCard: {
    marginTop: "18px",
    padding: "13px",
    border: "1px solid #e1e7ed",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  adjustProductIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "7px",
    backgroundColor: "#eaf1f8",
    color: "#3b6b9d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  adjustProductName: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#1e293b",
  },

  adjustProductCode: {
    marginTop: "3px",
    fontSize: "10px",
    color: "#94a3b8",
  },

  currentStockBox: {
    marginTop: "14px",
    padding: "13px 14px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e7ebf0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  currentStockLabel: {
    fontSize: "11px",
    color: "#64748b",
  },

  currentStockValue: {
    fontSize: "15px",
    color: "#172033",
    fontVariantNumeric: "tabular-nums",
  },

  formSection: {
    marginTop: "18px",
  },

  formLabel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "7px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#475569",
  },

  optionalLabel: {
    color: "#a0aab7",
    fontSize: "9px",
    fontWeight: "400",
  },

  formInput: {
    width: "100%",
    height: "38px",
    padding: "0 10px",
    border: "1px solid #d5dce5",
    borderRadius: "7px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#475569",
    fontSize: "12px",
    boxSizing: "border-box",
  },

  formTextarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d5dce5",
    borderRadius: "7px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#475569",
    fontSize: "12px",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: FONT,
  },

  previewCard: {
    marginTop: "20px",
    padding: "14px",
    border: "1px solid #e1e7ed",
    borderRadius: "8px",
    backgroundColor: "#f8fafc",
  },

  previewTitle: {
    marginBottom: "11px",
    fontSize: "10px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },

  previewRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "5px 0",
    fontSize: "11px",
    color: "#7b8797",
  },

  previewDivider: {
    height: "1px",
    backgroundColor: "#e1e7ed",
    margin: "6px 0",
  },

  previewNewStock: {
    fontSize: "14px",
    color: "#172033",
  },

  adjustActions: {
    display: "flex",
    gap: "8px",
    marginTop: "25px",
  },

  cancelAdjustButton: {
    flex: 1,
    height: "39px",
    border: "1px solid #d5dce5",
    backgroundColor: "#ffffff",
    color: "#475569",
    borderRadius: "7px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
  },

  saveAdjustButton: {
    flex: 1.5,
    height: "39px",
    border: "none",
    backgroundColor: "#3b6b9d",
    color: "#ffffff",
    borderRadius: "7px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  /* =======================================================
     PAGINATION
  ======================================================= */

  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    padding: "13px 20px",
    backgroundColor: "#ffffff",
    borderTop: "1px solid #e5eaf0",
  },

  paginationInfo: {
    color: "#7b8797",
    fontSize: "11px",
  },

  paginationControls: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  pageButton: {
    height: "30px",
    padding: "0 10px",
    border: "1px solid #d5dce5",
    backgroundColor: "#ffffff",
    color: "#475569",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "500",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
  },

  pageNumber: {
    minWidth: "30px",
    height: "30px",
    padding: 0,
    borderRadius: "6px",
    border: "1px solid",
    fontSize: "11px",
    fontWeight: "500",
    cursor: "pointer",
  },

  dots: {
    padding: "0 4px",
    color: "#94a3b8",
    fontSize: "11px",
  },
};