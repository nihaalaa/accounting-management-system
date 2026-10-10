 import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Table } from "react-bootstrap";
import axios from "axios";
import {
  BsPlus,
  BsPencil,
  BsTrash,
  BsReceipt,
  BsSearch,
  BsEye,
  BsCheckCircle,
  BsClock,
  BsCurrencyRupee,
    BsPrinter,
} from "react-icons/bs";
import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "./ViewInvoice";

export const Invoices = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // =========================
  // FETCH INVOICES
  // =========================

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/invoices`
      );

      setInvoices(response.data);
    } catch (error) {
      console.log("Error fetching invoices:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // =========================
  // DELETE INVOICE
  // =========================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/invoices/${id}`
      );

      alert(
        response.data.message ||
          "Invoice deleted successfully"
      );

      const updatedInvoices = invoices.filter(
        (invoice) => invoice._id !== id
      );

      setInvoices(updatedInvoices);

      const updatedFilteredInvoices =
        updatedInvoices.filter((invoice) => {
          const invoiceNumber =
            invoice.invoiceNumber || "";

          const customerName =
            invoice.customerName || "";

          return (
            invoiceNumber
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            customerName
              .toLowerCase()
              .includes(search.toLowerCase())
          );
        });

      const updatedTotalPages = Math.ceil(
        updatedFilteredInvoices.length /
          itemsPerPage
      );

      if (
        currentPage > updatedTotalPages &&
        updatedTotalPages > 0
      ) {
        setCurrentPage(updatedTotalPages);
      }
    } catch (error) {
      console.log("Error deleting invoice:", error);
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredInvoices = invoices.filter(
    (invoice) => {
      const searchText =
        search.toLowerCase();

      const invoiceNumber =
        invoice.invoiceNumber || "";

      const customerName =
        invoice.customerName || "";

      const paymentMethod =
        invoice.paymentMethod || "";

      const paymentStatus =
        invoice.paymentStatus || "";

      return (
        invoiceNumber
          .toLowerCase()
          .includes(searchText) ||
        customerName
          .toLowerCase()
          .includes(searchText) ||
        paymentMethod
          .toLowerCase()
          .includes(searchText) ||
        paymentStatus
          .toLowerCase()
          .includes(searchText)
      );
    }
  );

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.ceil(
    filteredInvoices.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const currentInvoices =
    filteredInvoices.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  // =========================
  // EDIT
  // =========================

  const handleEdit = (id) => {
    navigate(`/invoices/edit/${id}`);
  };

  // =========================
  // VIEW
  // =========================

  const handleView = (id) => {
    navigate(`/invoices/view/${id}`);
  };

  // =========================
  // DATE
  // =========================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================
  // CURRENCY
  // =========================

  const formatAmount = (amount) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================
  // SUMMARY
  // =========================

  const totalAmount = invoices.reduce(
    (total, invoice) =>
      total +
      Number(invoice.grandTotal || 0),
    0
  );

  const paidInvoices = invoices.filter(
    (invoice) =>
      invoice.paymentStatus === "Paid"
  );

  const pendingInvoices = invoices.filter(
    (invoice) =>
      invoice.paymentStatus === "Pending"
  );

// =========================
// PRINT & AUTO-DOWNLOAD PDF
// =========================


const handlePrintInvoice = async (invoice) => {
  try {
    const blob = await pdf(
      <InvoicePDF invoice={invoice} />
    ).toBlob();

    // Automatically download the PDF
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `Invoice_${invoice.invoiceNumber || invoice._id}.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Open the browser print dialog for the current invoice page
    navigate(`/invoices/view/${invoice._id}?print=1`);

    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    alert("Failed to generate invoice PDF.");
  }
};

  return (
    <div style={pageStyle}>

      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div style={headerStyle}>

        <div>
          <div style={breadcrumbStyle}>
            Sales / Invoices
          </div>

          <h2 style={titleStyle}>
            Invoices
          </h2>

          <p style={subtitleStyle}>
            Create, manage and track customer
            invoices.
          </p>
        </div>

        <Link
          to="/invoices/add"
          style={{
            textDecoration: "none",
          }}
        >
          <Button style={addButtonStyle}>
            <BsPlus size={18} />
             New Invoice
          </Button>
        </Link>

      </div>


      {/* =====================================
          SUMMARY CARDS
      ===================================== */}

      <div style={summaryContainer}>

        {/* TOTAL */}

        <div style={summaryCard}>

          <div style={summaryIcon}>
            <BsReceipt />
          </div>

          <div>
            <div style={summaryLabel}>
              Total Invoices
            </div>

            <div style={summaryNumber}>
              {invoices.length}
            </div>

            <div style={summaryHint}>
              All invoices
            </div>
          </div>

        </div>


        {/* TOTAL AMOUNT */}

        <div style={summaryCard}>

          <div style={summaryIcon}>
            <BsCurrencyRupee />
          </div>

          <div>
            <div style={summaryLabel}>
              Total Amount
            </div>

            <div style={summaryNumber}>
              {formatAmount(totalAmount)}
            </div>

            <div style={summaryHint}>
              Invoice value
            </div>
          </div>

        </div>


        {/* PAID */}

        <div style={summaryCard}>

          <div
            style={{
              ...summaryIcon,
              backgroundColor: "#ecfdf5",
              color: "#047857",
            }}
          >
            <BsCheckCircle />
          </div>

          <div>
            <div style={summaryLabel}>
              Paid
            </div>

            <div style={summaryNumber}>
              {paidInvoices.length}
            </div>

            <div style={summaryHint}>
              Completed payments
            </div>
          </div>

        </div>


        {/* PENDING */}

        <div style={summaryCard}>

          <div
            style={{
              ...summaryIcon,
              backgroundColor: "#fffbeb",
              color: "#b45309",
            }}
          >
            <BsClock />
          </div>

          <div>
            <div style={summaryLabel}>
              Pending
            </div>

            <div style={summaryNumber}>
              {pendingInvoices.length}
            </div>

            <div style={summaryHint}>
              Awaiting payment
            </div>
          </div>

        </div>

      </div>


      {/* =====================================
          MAIN TABLE CARD
      ===================================== */}

      <Card style={cardStyle}>

        {/* CARD HEADER */}

        <div style={cardHeaderStyle}>

          <div>
            <h5 style={cardTitle}>
              Invoice List
            </h5>

            <p style={cardSubtitle}>
              View and manage all customer invoices
            </p>
          </div>


          {/* SEARCH */}

          <div style={searchArea}>

            <div style={searchBox}>

              <BsSearch
                style={searchIconStyle}
              />

              <input
                type="text"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={searchInput}
              />

            </div>

            <span style={countBadge}>
              {filteredInvoices.length}
            </span>

          </div>

        </div>


        {/* =====================================
            TABLE
        ===================================== */}

        <Card.Body
          style={{
            padding: 0,
          }}
        >

          <Table
            hover
            responsive
            style={tableStyle}
          >

            <thead>
              <tr>

                <th style={thStyle}>
                  INVOICE
                </th>

                <th style={thStyle}>
                  DATE
                </th>

                <th style={thStyle}>
                  CUSTOMER
                </th>

                <th style={thStyle}>
                  ITEMS
                </th>

                <th style={thStyle}>
                  AMOUNT
                </th>

                <th style={thStyle}>
                  PAYMENT
                </th>

                <th style={thStyle}>
                  STATUS
                </th>

                <th
                  style={{
                    ...thStyle,
                    textAlign: "center",
                  }}
                >
                  ACTIONS
                </th>

              </tr>
            </thead>


            <tbody>

              {filteredInvoices.length > 0 ? (

                currentInvoices.map(
                  (invoice) => (

                    <tr
                      key={invoice._id}
                      style={rowStyle}
                    >

                      {/* INVOICE */}

                      <td style={tdStyle}>

                        <div style={invoiceContainer}>

                          <div style={invoiceIcon}>
                            <BsReceipt />
                          </div>

                          <div>

                            <div style={invoiceNumber}>
                              {invoice.invoiceNumber}
                            </div>

                            <div style={invoiceSubText}>
                              ID #
                              {invoice._id?.slice(-6)}
                            </div>

                          </div>

                        </div>

                      </td>


                      {/* DATE */}

                      <td style={tdStyle}>
                        <span style={dateStyle}>
                          {formatDate(
                            invoice.date ||
                              invoice.createdAt
                          )}
                        </span>
                      </td>


                      {/* CUSTOMER */}

                      <td style={tdStyle}>

                        <div style={customerContainer}>

                          <div style={customerIcon}>
                            {invoice.customerName
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <div style={customerName}>
                              {invoice.customerName ||
                                "Walk-in Customer"}
                            </div>

                            {invoice.customerPhone && (
                              <div
                                style={
                                  customerSubText
                                }
                              >
                                {
                                  invoice.customerPhone
                                }
                              </div>
                            )}

                          </div>

                        </div>

                      </td>


                      {/* ITEMS */}

                      <td style={tdStyle}>

                        <span style={itemsStyle}>
                          {invoice.items?.length || 0}
                          {" "}
                          items
                        </span>

                      </td>


                      {/* AMOUNT */}

                      <td style={tdStyle}>

                        <span style={amountStyle}>
                          {formatAmount(
                            invoice.grandTotal
                          )}
                        </span>

                      </td>


                      {/* PAYMENT */}

                      <td style={tdStyle}>

                        <span style={paymentStyle}>
                          {invoice.paymentMethod ||
                            "-"}
                        </span>

                      </td>


                      {/* STATUS */}

                      <td style={tdStyle}>

                        <span
                          style={{
                            ...statusStyle,

                            ...(invoice.paymentStatus ===
                            "Paid"
                              ? paidStyle
                              : invoice.paymentStatus ===
                                "Pending"
                              ? pendingStyle
                              : partialStyle),
                          }}
                        >

                          {invoice.paymentStatus ||
                            "Unknown"}

                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td style={tdStyle}>

                        <div
                          style={
                            actionContainer
                          }
                        >

                          {/* VIEW */}

                          <Button
                            variant="light"
                            size="sm"
                            onClick={() =>
                              handleView(
                                invoice._id
                              )
                            }
                            style={
                              viewButtonStyle
                            }
                            title="View Invoice"
                          >
                            <BsEye size={13} />
                          </Button>


                          {/* EDIT */}

                          <Button
                            variant="light"
                            size="sm"
                            onClick={() =>
                              handleEdit(
                                invoice._id
                              )
                            }
                            style={
                              editButtonStyle
                            }
                            title="Edit Invoice"
                          >
                            <BsPencil size={13} />
                        </Button>

            {/* PRINT & DOWNLOAD */}

            <Button
              variant="light"
              size="sm"
              onClick={() => handlePrintInvoice(invoice)}
              style={printButtonStyle}
              title="Print & Download Invoice"
              aria-label="Print and download invoice"
            >
              <BsPrinter size={13} />
            </Button>

                          {/* DELETE */}

                          <Button
                            variant="light"
                            size="sm"
                            onClick={() =>
                              handleDelete(
                                invoice._id
                              )
                            }
                            style={
                              deleteButtonStyle
                            }
                            title="Delete Invoice"
                          >
                            <BsTrash size={13} />
                          </Button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="8"
                    style={emptyStyle}
                  >

                    <div style={emptyIcon}>
                      <BsReceipt size={25} />
                    </div>

                    <div style={emptyTitle}>
                      {search
                        ? "No invoices found"
                        : "No invoices available"}
                    </div>

                    <div style={emptyText}>
                      {search
                        ? `No invoices match "${search}".`
                        : "Create your first invoice to get started."}
                    </div>

                    {!search && (
                      <Link
                        to="/invoices/add"
                        style={{
                          textDecoration: "none",
                        }}
                      >
                        <Button
                          style={{
                            ...addButtonStyle,
                            marginTop: "15px",
                            padding:
                              "8px 14px",
                          }}
                        >
                          <BsPlus size={16} />
                          Add Invoice
                        </Button>
                      </Link>
                    )}

                  </td>

                </tr>

              )}

            </tbody>

          </Table>

        </Card.Body>


        {/* =====================================
            PAGINATION
        ===================================== */}

        {filteredInvoices.length > 0 &&
          totalPages > 1 && (

            <div style={paginationStyle}>

              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage(
                    currentPage - 1
                  )
                }
                style={{
                  ...paginationButtonStyle,

                  opacity:
                    currentPage === 1
                      ? 0.45
                      : 1,

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
                  (_, index) =>
                    index + 1
                ).map((pageNumber) => (

                  <button
                    key={pageNumber}
                    onClick={() =>
                      setCurrentPage(
                        pageNumber
                      )
                    }
                    style={{
                      ...pageNumberStyle,

                      backgroundColor:
                        currentPage ===
                        pageNumber
                          ? "#3f607d"
                          : "#ffffff",

                      color:
                        currentPage ===
                        pageNumber
                          ? "#ffffff"
                          : "#374151",

                      borderColor:
                        currentPage ===
                        pageNumber
                          ? "#3f607d"
                          : "#d1d5db",
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
                  setCurrentPage(
                    currentPage + 1
                  )
                }
                style={{
                  ...paginationButtonStyle,

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
              </button>

            </div>

          )}

      </Card>

    </div>
  );
};


/* =====================================================
   PAGE
===================================================== */

const pageStyle = {
  padding: "28px 34px 40px",
  minHeight: "100vh",
  backgroundColor: "#f7f9fb",
  boxSizing: "border-box",
};


/* =====================================================
   HEADER
===================================================== */

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
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
  letterSpacing: "-0.3px",
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
  letterSpacing: "0.1px",
  boxShadow: "0 2px 5px rgba(75, 105, 133, 0.18)",
  transition: "all 0.15s ease",
};
 


/* =====================================================
   SUMMARY
===================================================== */

const summaryContainer = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: "14px",
  marginBottom: "20px",
};

const summaryCard = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "16px",
  backgroundColor: "#ffffff",
  border: "1px solid #e4e9ee",
  borderRadius: "8px",
  boxShadow:
    "0 1px 2px rgba(15, 23, 42, 0.025)",
};

const summaryIcon = {
  width: "39px",
  height: "39px",
  flexShrink: 0,
  borderRadius: "7px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "17px",
};

const summaryLabel = {
  fontSize: "11px",
  color: "#7b8794",
  fontWeight: "500",
};

const summaryNumber = {
  fontSize: "19px",
  fontWeight: "650",
  color: "#1f2937",
  marginTop: "2px",
};

const summaryHint = {
  fontSize: "9px",
  color: "#a0aab5",
  marginTop: "2px",
};


/* =====================================================
   CARD
===================================================== */

const cardStyle = {
  border: "1px solid #e2e7ec",
  borderRadius: "8px",
  overflow: "hidden",
  backgroundColor: "#ffffff",
  boxShadow:
    "0 1px 3px rgba(15, 23, 42, 0.035)",
};

const cardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
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


/* =====================================================
   SEARCH
===================================================== */

const searchArea = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
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


/* =====================================================
   TABLE
===================================================== */

const tableStyle = {
  margin: 0,
  minWidth: "1050px",
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


/* =====================================================
   INVOICE
===================================================== */

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


/* =====================================================
   DATE
===================================================== */

const dateStyle = {
  color: "#596675",
  fontSize: "11px",
};


/* =====================================================
   CUSTOMER
===================================================== */

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

const customerSubText = {
  fontSize: "9px",
  color: "#9ca6b1",
  marginTop: "3px",
};


/* =====================================================
   ITEMS / AMOUNT / PAYMENT
===================================================== */

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

const paymentStyle = {
  display: "inline-block",
  backgroundColor: "#f2f5f7",
  color: "#596675",
  padding: "4px 8px",
  borderRadius: "4px",
  fontSize: "9px",
  fontWeight: "500",
};


/* =====================================================
   STATUS
===================================================== */

const statusStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 9px",
  borderRadius: "4px",
  fontSize: "9px",
  fontWeight: "600",
};

const paidStyle = {
  backgroundColor: "#ecfdf5",
  color: "#047857",
};

const pendingStyle = {
  backgroundColor: "#fffbeb",
  color: "#b45309",
};

const partialStyle = {
  backgroundColor: "#edf3f7",
  color: "#4b6985",
};


/* =====================================================
   ACTIONS
===================================================== */

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
  color: "#4b6985",
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
  color: "#596675",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "5px",
};

const deleteButtonStyle = {
  width: "30px",
  height: "30px",
  padding: 0,
  border: "1px solid #f1caca",
  backgroundColor: "#ffffff",
  color: "#dc2626",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "5px",
};


/* =====================================================
   EMPTY STATE
===================================================== */

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


/* =====================================================
   PAGINATION
===================================================== */

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
};

const pageNumberStyle = {
  border: "1px solid #d8dee5",
  borderRadius: "5px",
  width: "29px",
  height: "29px",
  fontSize: "10px",
  cursor: "pointer",
};
const printButtonStyle = {
  width: "30px",
  height: "30px",
  padding: 0,
  border: "1px solid #d9e0e6",
  backgroundColor: "#ffffff",
  color: "#2563a6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "5px",
};