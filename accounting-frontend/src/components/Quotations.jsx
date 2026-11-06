
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Table } from "react-bootstrap";
import axios from "axios";
import {
  BsPlus,
  BsSearch,
  BsEye,
  BsReceipt,
  BsCurrencyRupee,
  BsDownload,
  BsPencil,
  BsTrash,
  BsCheckCircle,
  BsFileEarmarkText,
} from "react-icons/bs";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = import.meta.env.VITE_API_URL;

const Quotations = () => {
  const navigate = useNavigate();

  const [quotations, setQuotations] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 5;

  // FETCH QUOTATIONS
  const fetchQuotations = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/quotations`
      );

      setQuotations(response.data);
    } catch (error) {
      console.error("Error fetching quotations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  // SEARCH AND FILTER
  const filteredQuotations = quotations.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      (item.quotationNumber || "").toLowerCase().includes(searchText) ||
      (item.customerName || "").toLowerCase().includes(searchText) ||
      (item.customerPhone || "").toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // PAGINATION
  const totalPages = Math.ceil(
    filteredQuotations.length / itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentQuotations = filteredQuotations.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // VIEW
  const handleView = (id) => {
    navigate(`/quotations/view/${id}`);
  };

  // EDIT
  const handleEdit = (id) => {
    navigate(`/quotations/edit/${id}`);
  };

  // DELETE
  const handleDelete = async (id, quotationNumber) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete quotation ${quotationNumber}?`
    );

    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `${API_URL}/quotations/${id}`
      );

      alert(
        response.data.message ||
        "Quotation deleted successfully."
      );

      await fetchQuotations();

      if (
        currentQuotations.length === 1 &&
        currentPage > 1
      ) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error("Error deleting quotation:", error);

      alert(
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Could not delete quotation."
      );
    }
  };

  // DATE
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // CURRENCY
  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // STATUS STYLE
  const getStatusStyle = (status) => {
    const styles = {
      Draft: {
        backgroundColor: "#f1f5f9",
        color: "#64748b",
      },
      Sent: {
        backgroundColor: "#eff6ff",
        color: "#2563eb",
      },
      Accepted: {
        backgroundColor: "#ecfdf5",
        color: "#047857",
      },
      Rejected: {
        backgroundColor: "#fef2f2",
        color: "#dc2626",
      },
      Converted: {
        backgroundColor: "#ede9fe",
        color: "#6d28d9",
      },
      Expired: {
        backgroundColor: "#fff7ed",
        color: "#c2410c",
      },
    };

    return styles[status] || styles.Draft;
  };

  // SUMMARY
  const totalQuotationValue = quotations.reduce(
    (total, item) =>
      total + Number(item.grandTotal || 0),
    0
  );

  const acceptedCount = quotations.filter(
    (item) => item.status === "Accepted"
  ).length;

  const convertedCount = quotations.filter(
    (item) => item.status === "Converted"
  ).length;

  // DOWNLOAD PDF
  const handleDownloadPDF = () => {
    if (filteredQuotations.length === 0) {
      alert("No quotations available to download.");
      return;
    }

    const doc = new jsPDF("landscape");

    doc.setFontSize(18);
    doc.text("Quotations Report", 14, 18);

    doc.setFontSize(10);
    doc.text(
      `Total Quotations: ${filteredQuotations.length}`,
      14,
      26
    );

    doc.text(
      `Generated On: ${new Date().toLocaleDateString("en-IN")}`,
      14,
      32
    );

    const tableColumn = [
      "Quotation No.",
      "Date",
      "Valid Until",
      "Customer",
      "Items",
      "Total Amount",
      "Status",
    ];

    const tableRows = filteredQuotations.map((item) => [
      item.quotationNumber || "-",
      formatDate(item.date || item.createdAt),
      formatDate(item.validUntil),
      item.customerName || "Walk-in Customer",
      item.items?.length || 0,
      formatAmount(item.grandTotal),
      item.status || "Draft",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 38,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
      },
      headStyles: {
        fillColor: [59, 107, 157],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 248, 252],
      },
    });

    doc.save("Quotations_Report.pdf");
  };

  return (
    <div style={pageStyle}>

      {/* PAGE HEADER */}
      <div style={headerStyle}>
        <div>
          <div style={breadcrumbStyle}>
            Sales / Quotations
          </div>

          <h2 style={titleStyle}>Quotations</h2>

          <p style={subtitleStyle}>
            Create and manage price quotations for customers.
          </p>
        </div>

        <Link
          to="/quotations/add"
          style={{ textDecoration: "none" }}
        >
          <Button style={addButtonStyle}>
            <BsPlus size={18} />
            New Quotation
          </Button>
        </Link>
      </div>

      {/* SUMMARY CARDS */}
      <div style={summaryContainer}>

        <div style={summaryCard}>
          <div style={summaryIcon}>
            <BsReceipt />
          </div>

          <div>
            <div style={summaryLabel}>
              Total Quotations
            </div>

            <div style={summaryNumber}>
              {quotations.length}
            </div>

            <div style={summaryHint}>
              All recorded quotations
            </div>
          </div>
        </div>

        <div style={summaryCard}>
          <div style={summaryIcon}>
            <BsCurrencyRupee />
          </div>

          <div>
            <div style={summaryLabel}>
              Total Quotation Value
            </div>

            <div style={summaryNumber}>
              {formatAmount(totalQuotationValue)}
            </div>

            <div style={summaryHint}>
              Value of all quotations
            </div>
          </div>
        </div>

        <div style={summaryCard}>
          <div style={{
            ...summaryIcon,
            backgroundColor: "#ecfdf5",
            color: "#047857",
          }}>
            <BsCheckCircle />
          </div>

          <div>
            <div style={summaryLabel}>
              Accepted
            </div>

            <div style={summaryNumber}>
              {acceptedCount}
            </div>

            <div style={summaryHint}>
              Accepted by customers
            </div>
          </div>
        </div>

        <div style={summaryCard}>
          <div style={{
            ...summaryIcon,
            backgroundColor: "#ede9fe",
            color: "#6d28d9",
          }}>
            <BsFileEarmarkText />
          </div>

          <div>
            <div style={summaryLabel}>
              Converted
            </div>

            <div style={summaryNumber}>
              {convertedCount}
            </div>

            <div style={summaryHint}>
              Converted into invoices
            </div>
          </div>
        </div>

      </div>

      {/* MAIN TABLE */}
      <Card style={cardStyle}>

        <div style={cardHeaderStyle}>
          <div>
            <h5 style={cardTitle}>
              Quotation List
            </h5>

            <p style={cardSubtitle}>
              View and manage all customer quotations
            </p>
          </div>

          <div style={searchArea}>

            <Button
              onClick={handleDownloadPDF}
              variant="outline-primary"
              style={downloadButtonStyle}
            >
              <BsDownload size={14} />
              Download PDF
            </Button>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={filterSelect}
            >
              <option value="All">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Converted">Converted</option>
              <option value="Expired">Expired</option>
            </select>

            <div style={searchBox}>
              <BsSearch style={searchIconStyle} />

              <input
                type="text"
                placeholder="Search quotations..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={searchInput}
              />
            </div>

            <span style={countBadge}>
              {filteredQuotations.length}
            </span>

          </div>
        </div>

        <Card.Body style={{ padding: 0 }}>
          <Table hover responsive style={tableStyle}>

            <thead>
              <tr>
                <th style={thStyle}>QUOTATION</th>
                <th style={thStyle}>DATE</th>
                <th style={thStyle}>VALID UNTIL</th>
                <th style={thStyle}>CUSTOMER</th>
                <th style={thStyle}>ITEMS</th>
                <th style={thStyle}>TOTAL AMOUNT</th>
                <th style={thStyle}>STATUS</th>
                <th style={{
                  ...thStyle,
                  textAlign: "center",
                }}>
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="8" style={emptyStyle}>
                    Loading quotations...
                  </td>
                </tr>
              ) : currentQuotations.length > 0 ? (

                currentQuotations.map((item) => (
                  <tr key={item._id} style={rowStyle}>

                    {/* QUOTATION NUMBER */}
                    <td style={tdStyle}>
                      <div style={invoiceContainer}>
                        <div style={invoiceIcon}>
                          <BsReceipt />
                        </div>

                        <div>
                          <div style={invoiceNumber}>
                            {item.quotationNumber}
                          </div>

                          <div style={invoiceSubText}>
                            ID #{item._id?.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* DATE */}
                    <td style={tdStyle}>
                      {formatDate(item.date || item.createdAt)}
                    </td>

                    {/* VALID UNTIL */}
                    <td style={tdStyle}>
                      {formatDate(item.validUntil)}
                    </td>

                    {/* CUSTOMER */}
                    <td style={tdStyle}>
                      <div style={customerContainer}>
                        <div style={customerIcon}>
                          {(item.customerName || "W")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div style={customerName}>
                          {item.customerName || "Walk-in Customer"}
                        </div>
                      </div>
                    </td>

                    {/* ITEMS */}
                    <td style={tdStyle}>
                      <span style={itemsStyle}>
                        {item.items?.length || 0} items
                      </span>
                    </td>

                    {/* TOTAL */}
                    <td style={tdStyle}>
                      <span style={amountStyle}>
                        {formatAmount(item.grandTotal)}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td style={tdStyle}>
                      <span style={{
                        ...statusStyle,
                        ...getStatusStyle(item.status),
                      }}>
                        {item.status || "Draft"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td style={tdStyle}>
                      <div style={actionContainer}>

                        {/* VIEW */}
                        <Button
                          variant="light"
                          size="sm"
                          onClick={() => handleView(item._id)}
                          style={viewButtonStyle}
                          title="View Quotation"
                        >
                          <BsEye size={13} />
                        </Button>

                        {/* EDIT */}
                        {item.status !== "Converted" && (
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() => handleEdit(item._id)}
                            style={editButtonStyle}
                            title="Edit Quotation"
                          >
                            <BsPencil size={13} />
                          </Button>
                        )}

                        {/* DELETE */}
                        {item.status !== "Converted" && (
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() =>
                              handleDelete(
                                item._id,
                                item.quotationNumber
                              )
                            }
                            style={deleteButtonStyle}
                            title="Delete Quotation"
                          >
                            <BsTrash size={13} />
                          </Button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))

              ) : (

                <tr>
                  <td colSpan="8" style={emptyStyle}>

                    <div style={emptyIcon}>
                      <BsReceipt size={25} />
                    </div>

                    <div style={emptyTitle}>
                      {search || statusFilter !== "All"
                        ? "No quotations found"
                        : "No quotations available"}
                    </div>

                    <div style={emptyText}>
                      {search || statusFilter !== "All"
                        ? "No quotations match your search or filter."
                        : "Create your first quotation to get started."}
                    </div>

                    {!search && statusFilter === "All" && (
                      <Link
                        to="/quotations/add"
                        style={{ textDecoration: "none" }}
                      >
                        <Button style={{
                          ...addButtonStyle,
                          marginTop: "15px",
                        }}>
                          <BsPlus size={16} />
                          Add Quotation
                        </Button>
                      </Link>
                    )}

                  </td>
                </tr>

              )}

            </tbody>
          </Table>
        </Card.Body>

        {/* PAGINATION */}
        {filteredQuotations.length > 0 && totalPages > 1 && (
          <div style={paginationStyle}>

            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              style={paginationButtonStyle}
            >
              Previous
            </button>

            <div style={pageNumbersStyle}>
              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  style={{
                    ...pageNumberStyle,
                    backgroundColor:
                      currentPage === pageNumber
                        ? "#3f607d"
                        : "#fff",
                    color:
                      currentPage === pageNumber
                        ? "#fff"
                        : "#374151",
                    borderColor:
                      currentPage === pageNumber
                        ? "#3f607d"
                        : "#d1d5db",
                  }}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              style={paginationButtonStyle}
            >
              Next
            </button>

          </div>
        )}

      </Card>
    </div>
  );
};

// STYLES

const pageStyle = {
  padding: "28px 34px 40px",
  minHeight: "100vh",
  backgroundColor: "#f7f9fb",
  boxSizing: "border-box",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  flexWrap: "wrap",
  gap: "15px",
  marginBottom: "24px",
};

const breadcrumbStyle = {
  fontSize: "11px",
  color: "#94a3b8",
  marginBottom: "6px",
  fontWeight: "500",
};

const titleStyle = {
  margin: 0,
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "650",
};

const subtitleStyle = {
  margin: "5px 0 0",
  color: "#7b8794",
  fontSize: "12px",
};

const addButtonStyle = {
  border: "none",
  backgroundColor: "#3b6b9d",
  color: "#ffffff",
  borderRadius: "6px",
  padding: "9px 16px",
  minHeight: "38px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "7px",
  fontSize: "12px",
  fontWeight: "600",
};

const summaryContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "10px",
  marginBottom: "20px",
};

const summaryCard = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "14px 10px",
  minWidth: 0,
  minHeight: "85px",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.025)",
};

const summaryIcon = {
  width: "34px",
  height: "34px",
  flexShrink: 0,
  borderRadius: "7px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "15px",
};

const summaryLabel = {
  fontSize: "10px",
  color: "#7b8794",
  fontWeight: "500",
};

const summaryNumber = {
  fontSize: "15px",
  fontWeight: "650",
  color: "#1f2937",
  marginTop: "3px",
  overflowWrap: "anywhere",
};

const summaryHint = {
  fontSize: "9px",
  color: "#a0aab5",
  marginTop: "3px",
};

const cardStyle = {
  border: "1px solid #e2e7ec",
  borderRadius: "8px",
  overflow: "hidden",
  backgroundColor: "#ffffff",
  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.035)",
};

const cardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "12px",
  padding: "16px 19px",
  borderBottom: "1px solid #e6eaee",
};

const cardTitle = {
  margin: 0,
  fontSize: "14px",
  fontWeight: "600",
  color: "#273444",
};

const cardSubtitle = {
  margin: "4px 0 0",
  fontSize: "10px",
  color: "#9aa5b1",
};

const searchArea = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "9px",
};

const downloadButtonStyle = {
  fontSize: "11px",
  padding: "7px 10px",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  whiteSpace: "nowrap",
};

const filterSelect = {
  height: "34px",
  padding: "0 9px",
  border: "1px solid #d8dee5",
  borderRadius: "6px",
  outline: "none",
  fontSize: "11px",
  color: "#4b5563",
  backgroundColor: "#ffffff",
};

const searchBox = {
  position: "relative",
};

const searchIconStyle = {
  position: "absolute",
  left: "11px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#9aa5b1",
  fontSize: "12px",
};

const searchInput = {
  width: "225px",
  height: "34px",
  padding: "0 11px 0 32px",
  border: "1px solid #d8dee5",
  borderRadius: "6px",
  outline: "none",
  fontSize: "11px",
  color: "#374151",
  backgroundColor: "#ffffff",
};

const countBadge = {
  minWidth: "28px",
  height: "28px",
  padding: "0 8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f1f5f8",
  color: "#64748b",
  borderRadius: "5px",
  fontSize: "10px",
  fontWeight: "600",
};

const tableStyle = {
  margin: 0,
  minWidth: "1100px",
};

const thStyle = {
  padding: "11px 16px",
  backgroundColor: "#f8fafb",
  color: "#7a8694",
  fontSize: "9px",
  fontWeight: "650",
  letterSpacing: "0.35px",
  borderBottom: "1px solid #e4e8ec",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "13px 16px",
  verticalAlign: "middle",
  borderBottom: "1px solid #f0f2f4",
  fontSize: "11px",
  color: "#4b5563",
  whiteSpace: "nowrap",
};

const rowStyle = {
  height: "64px",
};

const invoiceContainer = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const invoiceIcon = {
  width: "36px",
  height: "36px",
  flexShrink: 0,
  borderRadius: "6px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
};

const invoiceNumber = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#344454",
};

const invoiceSubText = {
  fontSize: "9px",
  color: "#a0aab5",
  marginTop: "3px",
};

const customerContainer = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
};

const customerIcon = {
  width: "32px",
  height: "32px",
  flexShrink: 0,
  borderRadius: "50%",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "11px",
  fontWeight: "650",
};

const customerName = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#3f4d5b",
};

const itemsStyle = {
  display: "inline-block",
  backgroundColor: "#f2f5f7",
  color: "#64748b",
  padding: "4px 8px",
  borderRadius: "4px",
  fontSize: "9px",
  fontWeight: "500",
};

const amountStyle = {
  fontSize: "12px",
  fontWeight: "650",
  color: "#344454",
};

const statusStyle = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: "5px",
  fontSize: "9px",
  fontWeight: "600",
};

const actionContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "5px",
};

const viewButtonStyle = {
  width: "30px",
  height: "30px",
  padding: 0,
  border: "1px solid #d9e0e6",
  backgroundColor: "#ffffff",
  color: "#3b6b9d",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "5px",
};

const editButtonStyle = {
  width: "30px",
  height: "30px",
  padding: 0,
  border: "1px solid #d9e0e6",
  backgroundColor: "#ffffff",
  color: "#d97706",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "5px",
};

const deleteButtonStyle = {
  width: "30px",
  height: "30px",
  padding: 0,
  border: "1px solid #f3d5d5",
  backgroundColor: "#ffffff",
  color: "#dc5555",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "5px",
};

const emptyStyle = {
  textAlign: "center",
  padding: "65px 20px",
};

const emptyIcon = {
  width: "50px",
  height: "50px",
  margin: "0 auto 12px",
  borderRadius: "8px",
  backgroundColor: "#f1f4f6",
  color: "#94a3b8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const emptyTitle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#3f4d5b",
};

const emptyText = {
  fontSize: "10px",
  color: "#9ca6b1",
  marginTop: "5px",
};

const paginationStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
  padding: "13px 18px",
  borderTop: "1px solid #e6eaee",
  backgroundColor: "#ffffff",
};

const pageNumbersStyle = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
};

const paginationButtonStyle = {
  border: "1px solid #d8dee5",
  backgroundColor: "#ffffff",
  color: "#4b5563",
  borderRadius: "5px",
  padding: "6px 10px",
  fontSize: "10px",
  fontWeight: "500",
  cursor: "pointer",
};

const pageNumberStyle = {
  border: "1px solid #d8dee5",
  borderRadius: "5px",
  width: "29px",
  height: "29px",
  fontSize: "10px",
  cursor: "pointer",
};

export default Quotations;
