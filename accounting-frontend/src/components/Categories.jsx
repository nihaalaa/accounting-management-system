import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Table } from "react-bootstrap";
import {
  BsPlus,
  BsPencil,
  BsTrash,
  BsFolder,
  BsSearch,
  BsGrid,
} from "react-icons/bs";

export const Categories = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ============================
  // GET CATEGORIES
  // ============================

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
  `${import.meta.env.VITE_API_URL}/categories`
      );

      setCategories(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ============================
  // DELETE CATEGORY
  // ============================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
  `${import.meta.env.VITE_API_URL}/categories/${id}`
      );

      alert(response.data);

      const updatedCategories = categories.filter(
        (category) => category._id !== id
      );

      setCategories(updatedCategories);

      // Check pagination after deletion
      const updatedFilteredCategories = updatedCategories.filter(
        (category) =>
          category.name
            ?.toLowerCase()
            .includes(search.toLowerCase())
      );

      const updatedTotalPages = Math.ceil(
        updatedFilteredCategories.length / itemsPerPage
      );

      if (
        currentPage > updatedTotalPages &&
        updatedTotalPages > 0
      ) {
        setCurrentPage(updatedTotalPages);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to delete category.");
    }
  };

  // ============================
  // SEARCH
  // ============================

  const filteredCategories = categories.filter((category) =>
    category.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  // ============================
  // PAGINATION
  // ============================

  const totalPages = Math.ceil(
    filteredCategories.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const currentCategories = filteredCategories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ============================
  // PAGE CHANGE
  // ============================

  const changePage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div style={pageStyle}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div style={headerStyle}>

        <div>
          <div style={breadcrumbStyle}>
            Products <span style={breadcrumbArrow}>/</span> Categories
          </div>

          <h1 style={titleStyle}>
            Categories
          </h1>

          <p style={subtitleStyle}>
            Manage and organize your product categories
          </p>
        </div>

        <Link
          to="/categories/add"
          style={{
            textDecoration: "none",
          }}
        >
          <Button style={addButtonStyle}>
            <BsPlus size={18} />
            <span>New Category</span>
          </Button>
        </Link>

      </div>


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div style={summaryGrid}>

        <div style={summaryCard}>

          <div style={summaryIcon}>
            <BsFolder size={19} />
          </div>

          <div style={summaryContent}>
            <div style={summaryTitle}>
              Total Categories
            </div>

            <div style={summaryValue}>
              {categories.length}
            </div>
          </div>

        </div>


        <div style={summaryCard}>

          <div style={summaryIconBlue}>
            <BsGrid size={18} />
          </div>

          <div style={summaryContent}>
            <div style={summaryTitle}>
              Showing
            </div>

            <div style={summaryValue}>
              {filteredCategories.length}
            </div>
          </div>

        </div>

      </div>


      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div style={contentCard}>

        {/* ================= CARD HEADER ================= */}

        <div style={contentHeader}>

          <div>
            <h3 style={contentTitle}>
              Category List
            </h3>

            <p style={contentSubtitle}>
              All categories created for your products
            </p>
          </div>


          {/* ================= SEARCH ================= */}

          <div style={searchBox}>

            <BsSearch
              size={14}
              color="#94a3b8"
            />

            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={searchInput}
            />

          </div>

        </div>


        {/* =====================================================
            TABLE
        ===================================================== */}

        <div style={tableWrapper}>

          <Table
            hover
            responsive={false}
            style={tableStyle}
          >

            <thead>

              <tr>

                {/* <th style={numberHeader}>
                  #
                </th> */}

                <th style={thStyle}>
                  CATEGORY
                </th>

                <th style={thStyle}>
                  DESCRIPTION
                </th>

                <th
                  style={{
                    ...thStyle,
                    textAlign: "right",
                  }}
                >
                  ACTIONS
                </th>

              </tr>

            </thead>


            <tbody>

              {currentCategories.length > 0 ? (

                currentCategories.map(
                  (category, index) => (

                    <tr
                      key={category._id}
                      style={rowStyle}
                    >

                      {/* ================= NUMBER ================= */}
{/* 
                      <td style={numberStyle}>
                        {startIndex + index + 1}
                      </td> */}


                      {/* ================= CATEGORY ================= */}

                      <td style={tdStyle}>

                        <div style={categoryCell}>

                          {category.image ? (

                            <img
                              src={category.image}
                              alt={category.name}
                              style={imageStyle}
                            />

                          ) : (

                            <div style={noImage}>
                              <BsFolder size={19} />
                            </div>

                          )}

                          <div>

                            <div style={categoryName}>
                              {category.name}
                            </div>

                            <div style={categorySub}>
                              Product category
                            </div>

                          </div>

                        </div>

                      </td>


                      {/* ================= DESCRIPTION ================= */}

                      <td style={tdStyle}>

                        <span style={descriptionText}>
                          Used to organize products
                        </span>

                      </td>


                      {/* ================= ACTIONS ================= */}

                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "right",
                        }}
                      >

                        <div style={actions}>

                          <Button
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/categories/edit/${category._id}`
                              )
                            }
                            style={editButton}
                          >
                            <BsPencil size={13} />
                            Edit
                          </Button>


                          <Button
                            size="sm"
                            onClick={() =>
                              handleDelete(category._id)
                            }
                            style={deleteButton}
                          >
                            <BsTrash size={13} />
                            Delete
                          </Button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="4"
                    style={emptyState}
                  >

                    <div style={emptyIcon}>
                      <BsFolder size={24} />
                    </div>

                    <div style={emptyTitle}>
                      No categories found
                    </div>

                    <div style={emptyText}>
                      {search
                        ? "Try another search term."
                        : "Create your first category using the Add Category button."}
                    </div>

                    {search && (
                      <button
                        onClick={() => {
                          setSearch("");
                          setCurrentPage(1);
                        }}
                        style={clearSearchButton}
                      >
                        Clear search
                      </button>
                    )}

                  </td>

                </tr>

              )}

            </tbody>

          </Table>

        </div>


        {/* =====================================================
            PAGINATION
        ===================================================== */}

        {filteredCategories.length > 0 &&
          totalPages > 1 && (

            <div style={paginationStyle}>

              <div style={paginationInfo}>
                Showing{" "}
                <strong>
                  {startIndex + 1}
                </strong>
                {" "}to{" "}
                <strong>
                  {Math.min(
                    startIndex + itemsPerPage,
                    filteredCategories.length
                  )}
                </strong>
                {" "}of{" "}
                <strong>
                  {filteredCategories.length}
                </strong>
              </div>


              <div style={paginationControls}>

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    changePage(currentPage - 1)
                  }
                  style={{
                    ...paginationButtonStyle,
                    opacity:
                      currentPage === 1 ? 0.5 : 1,
                    cursor:
                      currentPage === 1
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Previous
                </button>


                <div style={pageNumbersStyle}>

                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) => index + 1
                  ).map((pageNumber) => (

                    <button
                      key={pageNumber}
                      onClick={() =>
                        changePage(pageNumber)
                      }
                      style={{
                        ...pageNumberStyle,

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
                            : "#dbe2ea",
                      }}
                    >
                      {pageNumber}
                    </button>

                  ))}

                </div>


                <button
                  disabled={
                    currentPage === totalPages
                  }
                  onClick={() =>
                    changePage(currentPage + 1)
                  }
                  style={{
                    ...paginationButtonStyle,
                    opacity:
                      currentPage === totalPages
                        ? 0.5
                        : 1,
                    cursor:
                      currentPage === totalPages
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Next
                </button>

              </div>

            </div>

          )}


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div style={footer}>

          <span>
            {search
              ? `Filtered from ${categories.length} categories`
              : `Showing all ${categories.length} categories`}
          </span>

          <span>
            Page{" "}
            <strong>
              {totalPages === 0 ? 0 : currentPage}
            </strong>
            {" "}of{" "}
            <strong>
              {totalPages || 1}
            </strong>
          </span>

        </div>

      </div>

    </div>
  );
};


/* ============================================================
   PAGE
============================================================ */

const pageStyle = {
  width: "100%",
  minHeight: "100vh",
  padding: "28px 32px 40px",
  backgroundColor: "#f3f4f8",
  boxSizing: "border-box",
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  color: "#1e293b",
};


/* ============================================================
   HEADER
============================================================ */

const headerStyle = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: "20px",
  marginBottom: "22px",
};

const breadcrumbStyle = {
  fontSize: "11px",
  color: "#94a3b8",
  fontWeight: "500",
  marginBottom: "7px",
};

const breadcrumbArrow = {
  margin: "0 6px",
  color: "#cbd5e1",
};

const titleStyle = {
  margin: 0,
  fontSize: "25px",
  lineHeight: 1.2,
  fontWeight: "650",
  color: "#17202a",
  letterSpacing: "-0.3px",
};

const subtitleStyle = {
  margin: "6px 0 0",
  fontSize: "12px",
  color: "#7b8490",
};


/* ============================================================
   ADD BUTTON
============================================================ */

const addButtonStyle = {
  border: "1px solid #3b6b9d",
  backgroundColor:  "#3b6b9d",
  color: "#ffffff",
  borderRadius: "7px",
  padding: "9px 15px",
  minHeight: "39px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "7px",
  fontSize: "12px",
  fontWeight: "600",
  boxShadow:
    "0 2px 5px rgba(59,107,157,0.16)",
};


/* ============================================================
   SUMMARY
============================================================ */

const summaryGrid = {
  display: "flex",
  gap: "14px",
  marginBottom: "20px",
  flexWrap: "wrap",
};

const summaryCard = {
  minWidth: "210px",
  height: "76px",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "14px",
  boxSizing: "border-box",
  boxShadow:
    "0 1px 3px rgba(15,23,42,0.04)",
};

const summaryIcon = {
  width: "40px",
  height: "40px",
  flexShrink: 0,
  borderRadius: "8px",
  backgroundColor: "#eef3f8",
  color: "#3b6b9d",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const summaryIconBlue = {
  width: "40px",
  height: "40px",
  flexShrink: 0,
  borderRadius: "8px",
  backgroundColor: "#edf4fb",
  color: "#3b6b9d",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const summaryContent = {
  minWidth: 0,
};

const summaryTitle = {
  fontSize: "10px",
  color: "#94a3b8",
  fontWeight: "500",
  textTransform: "uppercase",
  letterSpacing: "0.35px",
};

const summaryValue = {
  marginTop: "2px",
  fontSize: "21px",
  lineHeight: 1.2,
  fontWeight: "650",
  color: "#17202a",
};


/* ============================================================
   CONTENT CARD
============================================================ */

const contentCard = {
  width: "100%",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow:
    "0 1px 3px rgba(15,23,42,0.04)",
};


/* ============================================================
   CONTENT HEADER
============================================================ */

const contentHeader = {
  minHeight: "78px",
  padding: "17px 22px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  borderBottom: "1px solid #e8edf2",
  boxSizing: "border-box",
};

const contentTitle = {
  margin: 0,
  fontSize: "15px",
  fontWeight: "650",
  color: "#1e293b",
};

const contentSubtitle = {
  margin: "4px 0 0",
  fontSize: "11px",
  color: "#94a3b8",
};


/* ============================================================
   SEARCH
============================================================ */

const searchBox = {
  width: "245px",
  height: "36px",
  border: "1px solid #dbe2ea",
  borderRadius: "7px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "0 11px",
  backgroundColor: "#ffffff",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease",
};

const searchInput = {
  width: "100%",
  border: "none",
  outline: "none",
  backgroundColor: "transparent",
  fontSize: "12px",
  color: "#334155",
};


/* ============================================================
   TABLE
============================================================ */

const tableWrapper = {
  width: "100%",
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  minWidth: "900px",
  margin: 0,
  borderCollapse: "collapse",
};

const thStyle = {
  padding: "13px 22px",
  backgroundColor: "#f8fafc",
  color: "#64748b",
  fontSize: "10px",
  fontWeight: "650",
  letterSpacing: "0.45px",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap",
};

const numberHeader = {
  ...thStyle,
  width: "55px",
};

const tdStyle = {
  padding: "15px 22px",
  verticalAlign: "middle",
  borderBottom: "1px solid #edf1f5",
};

const numberStyle = {
  ...tdStyle,
  color: "#94a3b8",
  fontSize: "11px",
  width: "55px",
};

const rowStyle = {
  transition: "background-color 0.15s ease",
};


/* ============================================================
   CATEGORY
============================================================ */

const categoryCell = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const imageStyle = {
  width: "46px",
  height: "46px",
  objectFit: "cover",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
  flexShrink: 0,
};

const noImage = {
  width: "46px",
  height: "46px",
  flexShrink: 0,
  borderRadius: "8px",
  backgroundColor: "#f1f5f9",
  color: "#94a3b8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const categoryName = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#263746",
};

const categorySub = {
  marginTop: "4px",
  fontSize: "10px",
  color: "#94a3b8",
};

const descriptionText = {
  fontSize: "11px",
  color: "#64748b",
};


/* ============================================================
   ACTIONS
============================================================ */

const actions = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: "7px",
};

const editButton = {
  border: "1px solid #dbe2ea",
  backgroundColor: "#ffffff",
  color: "#475569",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "5px",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: "500",
  padding: "6px 10px",
};

const deleteButton = {
  border: "1px solid #fecaca",
  backgroundColor: "#fffafa",
  color: "#dc2626",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "5px",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: "500",
  padding: "6px 10px",
};


/* ============================================================
   EMPTY STATE
============================================================ */

const emptyState = {
  textAlign: "center",
  padding: "78px 20px",
  borderBottom: "none",
};

const emptyIcon = {
  width: "54px",
  height: "54px",
  margin: "0 auto 13px",
  borderRadius: "50%",
  backgroundColor: "#f1f5f9",
  color: "#94a3b8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const emptyTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#334155",
};

const emptyText = {
  marginTop: "5px",
  fontSize: "11px",
  color: "#94a3b8",
};

const clearSearchButton = {
  marginTop: "14px",
  border: "none",
  backgroundColor: "transparent",
  color: "#3b6b9d",
  fontSize: "11px",
  fontWeight: "600",
  cursor: "pointer",
};


/* ============================================================
   PAGINATION
============================================================ */

const paginationStyle = {
  minHeight: "62px",
  padding: "12px 22px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  borderTop: "1px solid #e8edf2",
  backgroundColor: "#ffffff",
  boxSizing: "border-box",
};

const paginationInfo = {
  fontSize: "11px",
  color: "#94a3b8",
};

const paginationControls = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const pageNumbersStyle = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
};

const paginationButtonStyle = {
  border: "1px solid #dbe2ea",
  backgroundColor: "#ffffff",
  color: "#475569",
  borderRadius: "6px",
  padding: "6px 10px",
  fontSize: "11px",
  fontWeight: "500",
};

const pageNumberStyle = {
  border: "1px solid #dbe2ea",
  backgroundColor: "#ffffff",
  borderRadius: "6px",
  width: "29px",
  height: "29px",
  fontSize: "11px",
  fontWeight: "500",
  cursor: "pointer",
};


/* ============================================================
   FOOTER
============================================================ */

const footer = {
  minHeight: "45px",
  padding: "0 22px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderTop: "1px solid #e8edf2",
  color: "#94a3b8",
  fontSize: "10px",
  boxSizing: "border-box",
};