
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Table,
  Row,
  Col,
  Badge,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

import {
  BsArrowLeft,
  BsDownload,
  BsPrinter,
  BsReceipt,
  BsPerson,
  BsCreditCard,
  BsCalendar3,
  BsTelephone,
  BsGeoAlt,
  BsFileText,
  BsBoxSeam,
} from "react-icons/bs";

import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

/* =========================================================
   SALES RETURN PDF STYLES
========================================================= */

const pdfStyles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#303844",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 18,
    borderBottom: "1 solid #dfe5ea",
    marginBottom: 20,
  },

  companyName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#303844",
    marginBottom: 4,
  },

  companySubtitle: {
    fontSize: 8,
    color: "#8a94a3",
    marginBottom: 5,
  },

  companyDetails: {
    fontSize: 8,
    color: "#737d89",
  },

  returnHeader: {
    alignItems: "flex-end",
  },

  returnLabel: {
    fontSize: 8,
    color: "#8a94a3",
    marginBottom: 4,
  },

  returnNumber: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#303844",
    marginBottom: 6,
  },

  meta: {
    fontSize: 8,
    color: "#687483",
    marginBottom: 4,
  },

  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },

  infoBox: {
    flex: 1,
    border: "1 solid #e1e6eb",
    borderRadius: 6,
    padding: 12,
  },

  infoTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#687483",
    marginBottom: 8,
    textTransform: "uppercase",
  },

  infoMain: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#303844",
    marginBottom: 5,
  },

  infoText: {
    fontSize: 8,
    color: "#737d89",
    marginBottom: 4,
    lineHeight: 1.4,
  },

  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#687483",
    marginBottom: 8,
    textTransform: "uppercase",
  },

  table: {
    border: "1 solid #e1e6eb",
    borderRadius: 5,
    marginBottom: 20,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafb",
    borderBottom: "1 solid #dfe5ea",
    padding: 8,
  },

  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #edf0f2",
    padding: 8,
  },

  lastRow: {
    flexDirection: "row",
    padding: 8,
  },

  productColumn: { width: "28%" },
  qtyColumn: { width: "10%", textAlign: "center" },
  priceColumn: { width: "15%", textAlign: "right" },
  taxColumn: { width: "10%", textAlign: "right" },
  conditionColumn: { width: "15%", textAlign: "center" },
  amountColumn: { width: "22%", textAlign: "right" },

  tableHeaderText: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#697586",
  },

  tableText: {
    fontSize: 7.5,
    color: "#424b57",
  },

  totalSection: {
    alignItems: "flex-end",
  },

  totalBox: {
    width: 230,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  totalLabel: {
    fontSize: 8,
    color: "#737d89",
  },

  totalValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#3c4652",
  },

  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1 solid #dfe5ea",
    marginTop: 7,
    paddingTop: 10,
  },

  grandTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },

  grandTotalValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4b6985",
  },

  notes: {
    marginTop: 22,
    padding: 11,
    border: "1 solid #e2e7eb",
    borderRadius: 5,
    backgroundColor: "#f8fafb",
  },

  notesTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#687483",
    marginBottom: 5,
  },

  notesText: {
    fontSize: 8,
    color: "#737d89",
    lineHeight: 1.5,
  },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 35,
    right: 35,
    borderTop: "1 solid #edf0f2",
    paddingTop: 8,
    textAlign: "center",
    fontSize: 7,
    color: "#9aa3ad",
  },
});


/* =========================================================
   SALES RETURN PDF
========================================================= */

export const SalesReturnPDF = ({ salesReturn }) => {
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const items = salesReturn.items || [];

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>

        <View style={pdfStyles.header}>
          <View>
            <Text style={pdfStyles.companyName}>ShopLedger</Text>
            <Text style={pdfStyles.companySubtitle}>
              Accounting & Shop Management
            </Text>
            <Text style={pdfStyles.companyDetails}>
              Kozhikode, Kerala, India
            </Text>
          </View>

          <View style={pdfStyles.returnHeader}>
            <Text style={pdfStyles.returnLabel}>SALES RETURN</Text>
            <Text style={pdfStyles.returnNumber}>
              #{salesReturn.returnNumber}
            </Text>
            <Text style={pdfStyles.meta}>
              Date: {formatDate(salesReturn.returnDate)}
            </Text>
            <Text style={pdfStyles.meta}>
              Invoice: {salesReturn.invoiceNumber || "-"}
            </Text>
            <Text style={pdfStyles.meta}>
              Status: {salesReturn.status || "-"}
            </Text>
          </View>
        </View>

        <View style={pdfStyles.infoRow}>
          <View style={pdfStyles.infoBox}>
            <Text style={pdfStyles.infoTitle}>Customer Information</Text>
            <Text style={pdfStyles.infoMain}>
              {salesReturn.customerName || "Walk-in Customer"}
            </Text>
            {salesReturn.customerId?.phone && (
              <Text style={pdfStyles.infoText}>
                Phone: {salesReturn.customerId.phone}
              </Text>
            )}
            <Text style={pdfStyles.infoText}>
              Original Invoice: {salesReturn.invoiceNumber || "-"}
            </Text>
          </View>

          <View style={pdfStyles.infoBox}>
            <Text style={pdfStyles.infoTitle}>Refund Information</Text>
            <Text style={pdfStyles.infoMain}>
              {salesReturn.refundMethod || "-"}
            </Text>
            <Text style={pdfStyles.infoText}>
              Applied to Balance: {formatCurrency(salesReturn.appliedToBalance)}
            </Text>
            <Text style={pdfStyles.infoText}>
              Cash Refund: {formatCurrency(salesReturn.cashRefund)}
            </Text>
            <Text style={pdfStyles.infoText}>
              Customer Credit: {formatCurrency(salesReturn.creditRefund)}
            </Text>
          </View>
        </View>

        <Text style={pdfStyles.sectionTitle}>Returned Products</Text>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.productColumn, pdfStyles.tableHeaderText]}>
              Product
            </Text>
            <Text style={[pdfStyles.qtyColumn, pdfStyles.tableHeaderText]}>
              Qty
            </Text>
            <Text style={[pdfStyles.priceColumn, pdfStyles.tableHeaderText]}>
              Price
            </Text>
            <Text style={[pdfStyles.taxColumn, pdfStyles.tableHeaderText]}>
              GST
            </Text>
            <Text style={[pdfStyles.conditionColumn, pdfStyles.tableHeaderText]}>
              Condition
            </Text>
            <Text style={[pdfStyles.amountColumn, pdfStyles.tableHeaderText]}>
              Amount
            </Text>
          </View>

          {items.map((item, index) => (
            <View
              key={index}
              style={index === items.length - 1
                ? pdfStyles.lastRow
                : pdfStyles.tableRow}
            >
              <Text style={[pdfStyles.productColumn, pdfStyles.tableText]}>
                {item.productName || item.productId?.name || "-"}
              </Text>
              <Text style={[pdfStyles.qtyColumn, pdfStyles.tableText]}>
                {item.returnQuantity || 0}
              </Text>
              <Text style={[pdfStyles.priceColumn, pdfStyles.tableText]}>
                {formatCurrency(item.price)}
              </Text>
              <Text style={[pdfStyles.taxColumn, pdfStyles.tableText]}>
                {Number(item.tax || 0)}%
              </Text>
              <Text style={[pdfStyles.conditionColumn, pdfStyles.tableText]}>
                {item.condition || "-"}
              </Text>
              <Text style={[pdfStyles.amountColumn, pdfStyles.tableText]}>
                {formatCurrency(item.refundAmount)}
              </Text>
            </View>
          ))}
        </View>

        <View style={pdfStyles.totalSection}>
          <View style={pdfStyles.totalBox}>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Subtotal</Text>
              <Text style={pdfStyles.totalValue}>
                {formatCurrency(salesReturn.subtotal)}
              </Text>
            </View>

            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>GST</Text>
              <Text style={pdfStyles.totalValue}>
                {formatCurrency(salesReturn.totalTax)}
              </Text>
            </View>

            <View style={pdfStyles.grandTotal}>
              <Text style={pdfStyles.grandTotalLabel}>Total Return Value</Text>
              <Text style={pdfStyles.grandTotalValue}>
                {formatCurrency(salesReturn.totalRefund)}
              </Text>
            </View>
          </View>
        </View>

        {salesReturn.notes && (
          <View style={pdfStyles.notes}>
            <Text style={pdfStyles.notesTitle}>NOTES</Text>
            <Text style={pdfStyles.notesText}>{salesReturn.notes}</Text>
          </View>
        )}

        <Text style={pdfStyles.footer}>
          Sales Return • ShopLedger
        </Text>

      </Page>
    </Document>
  );
};


/* =========================================================
   VIEW SALES RETURN
========================================================= */

export const ViewSalesReturn = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [salesReturn, setSalesReturn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesReturn = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/sales-returns/${id}`
        );

        setSalesReturn(
          response.data.salesReturn ?? response.data
        );
      } catch (error) {
        console.error("Error fetching sales return:", error);

        alert(
          error.response?.data?.message ||
          "Failed to load sales return."
        );

        navigate("/sales-returns");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSalesReturn();
    }
  }, [id, navigate]);


  /* =======================================================
     HELPERS
  ======================================================= */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusBadge = (status) => {
    if (String(status).toLowerCase() === "completed") {
      return {
        backgroundColor: "#e8f5ed",
        color: "#287a45",
        border: "1px solid #cfe9d8",
      };
    }

    return {
      backgroundColor: "#f1f3f5",
      color: "#66707c",
      border: "1px solid #dfe3e7",
    };
  };

  const handlePrint = () => {
    window.print();
  };


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8fafb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
          fontSize: "13px",
          gap: "10px",
        }}
      >
        <Spinner animation="border" size="sm" />
        Loading sales return...
      </div>
    );
  }


  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!salesReturn) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8fafb",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        <BsReceipt size={30} color="#4b6985" />

        <div style={{ fontSize: "15px", fontWeight: "600", color: "#303844" }}>
          Sales return not found
        </div>

        <Button
          onClick={() => navigate("/sales-returns")}
          style={{
            backgroundColor: "#ffffff",
            color: "#4b6985",
            border: "1px solid #d9e0e6",
            fontSize: "12px",
          }}
        >
          <BsArrowLeft className="me-2" />
          Back to Sales Returns
        </Button>
      </div>
    );
  }


  /* =======================================================
     DATA
  ======================================================= */

  const items = salesReturn.items || [];
  const customer = salesReturn.customerId || {};

  const customerName =
    customer.name ||
    salesReturn.customerName ||
    "Walk-in Customer";

  const customerPhone =
    customer.phone ||
    "-";

  const customerEmail =
    customer.email ||
    "-";

  const customerAddress =
    customer.address ||
    "-";

  const statusBadgeStyle = getStatusBadge(salesReturn.status);

  const allocatedDiscount = items.reduce(
    (total, item) => total + Number(item.discountAmount || 0),
    0
  );


  /* =======================================================
     PAGE STYLES
  ======================================================= */

  const pageStyle = {
    minHeight: "100vh",
    backgroundColor: "#f8fafb",
    padding: "26px 28px 40px",
  };

  const contentStyle = {
    width: "100%",
    maxWidth: "1280px",
    margin: "0 auto",
  };

  const breadcrumbStyle = {
    fontSize: "11px",
    color: "#8a94a3",
    fontWeight: "500",
  };

  const breadcrumbSeparator = {
    margin: "0 7px",
    color: "#b3bac3",
    fontSize: "11px",
  };

  const breadcrumbCurrentStyle = {
    fontSize: "11px",
    color: "#596574",
    fontWeight: "600",
  };

  const pageTitleStyle = {
    margin: 0,
    fontSize: "22px",
    fontWeight: "650",
    color: "#29323d",
    letterSpacing: "-0.3px",
  };

  const numberBadgeStyle = {
    display: "inline-flex",
    alignItems: "center",
    height: "25px",
    padding: "0 9px",
    borderRadius: "5px",
    backgroundColor: "#edf3f7",
    color: "#4b6985",
    border: "1px solid #dbe5ec",
    fontSize: "11px",
    fontWeight: "600",
  };

  const pageSubtitleStyle = {
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#7b8592",
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
    boxShadow: "0 1px 2px rgba(15,23,42,0.03)",
  };

  const downloadButtonStyle = {
    height: "38px",
    padding: "0 14px",
    borderRadius: "6px",
    border: "1px solid #cfd8e1",
    backgroundColor: "#ffffff",
    color: "#4b6985",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  };

  const printButtonStyle = {
    height: "38px",
    width: "38px",
    padding: 0,
    borderRadius: "6px",
    border: "1px solid #d9e0e6",
    backgroundColor: "#ffffff",
    color: "#4b5563",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
  };

  const workspaceStyle = {
    border: "1px solid #e1e6eb",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 8px rgba(15,23,42,0.035)",
    overflow: "hidden",
  };

  const sectionLabelStyle = {
    fontSize: "10px",
    fontWeight: "700",
    color: "#687483",
    textTransform: "uppercase",
    letterSpacing: "0.45px",
    marginBottom: "9px",
  };

  const infoBoxStyle = {
    border: "1px solid #e3e7eb",
    borderRadius: "7px",
    padding: "15px 16px",
    height: "100%",
    backgroundColor: "#ffffff",
  };

  const infoIconStyle = {
    width: "30px",
    height: "30px",
    borderRadius: "6px",
    backgroundColor: "#edf3f7",
    color: "#4b6985",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const infoMainTextStyle = {
    margin: 0,
    fontSize: "13px",
    fontWeight: "650",
    color: "#303844",
  };

  const infoSecondaryTextStyle = {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#7b8592",
    lineHeight: "1.5",
  };

  const tableHeaderStyle = {
    backgroundColor: "#f8fafb",
    borderBottom: "1px solid #dfe5ea",
    color: "#697586",
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.35px",
    padding: "11px 13px",
    whiteSpace: "nowrap",
  };

  const tableCellStyle = {
    padding: "12px 13px",
    verticalAlign: "middle",
    borderBottom: "1px solid #edf0f2",
    fontSize: "12px",
    color: "#424b57",
  };

  const totalLabelStyle = {
    fontSize: "12px",
    color: "#737d89",
  };

  const totalValueStyle = {
    fontSize: "12px",
    fontWeight: "600",
    color: "#3c4652",
  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <div style={pageStyle}>
        <div style={contentStyle}>

          {/* PAGE HEADER */}

          <div
            className="d-flex justify-content-between align-items-end flex-wrap"
            style={{ gap: "18px", marginBottom: "22px" }}
          >
            <div>
              <div style={{ marginBottom: "5px" }}>
                <span style={breadcrumbStyle}>Sales</span>
                <span style={breadcrumbSeparator}>/</span>
                <span style={breadcrumbCurrentStyle}>Sales Returns</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  flexWrap: "wrap",
                }}
              >
                <h2 style={pageTitleStyle}>Sales Return</h2>
                <span style={numberBadgeStyle}>
                  #{salesReturn.returnNumber}
                </span>
              </div>

              <p style={pageSubtitleStyle}>
                Sales return details and refund information
              </p>
            </div>

            {/* ACTIONS */}

            <div
              className="sales-return-actions"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <Button
                onClick={() => navigate("/sales-returns")}
                style={backButtonStyle}
              >
                <BsArrowLeft size={14} />
                Back to Returns
              </Button>

              <PDFDownloadLink
                document={<SalesReturnPDF salesReturn={salesReturn} />}
                fileName={`${salesReturn.returnNumber || "sales-return"}.pdf`}
                style={{ textDecoration: "none" }}
              >
                {({ loading }) => (
                  <Button
                    style={downloadButtonStyle}
                    disabled={loading}
                  >
                    <BsDownload size={14} />
                    {loading ? "Generating..." : "Download PDF"}
                  </Button>
                )}
              </PDFDownloadLink>

              <Button
                onClick={handlePrint}
                style={printButtonStyle}
                title="Print sales return"
              >
                <BsPrinter size={15} />
              </Button>
            </div>
          </div>


          {/* RETURN WORKSPACE */}

          <Card id="sales-return-print" style={workspaceStyle}>
            <Card.Body style={{ padding: "30px" }}>

              {/* TOP HEADER */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "25px",
                  flexWrap: "wrap",
                  paddingBottom: "22px",
                  borderBottom: "1px solid #e2e7eb",
                  marginBottom: "22px",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "7px",
                        backgroundColor: "#edf3f7",
                        color: "#4b6985",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <BsReceipt size={20} />
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "700",
                          color: "#303844",
                          lineHeight: "1.2",
                        }}
                      >
                        ShopLedger
                      </div>

                      <div
                        style={{
                          fontSize: "10px",
                          color: "#8a94a3",
                          marginTop: "2px",
                        }}
                      >
                        Accounting & Shop Management
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      color: "#737d89",
                      lineHeight: "1.6",
                    }}
                  >
                    Kozhikode, Kerala, India
                  </div>
                </div>

                <div
                  style={{
                    textAlign: "right",
                    minWidth: "190px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#8a94a3",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.7px",
                      marginBottom: "4px",
                    }}
                  >
                    Sales Return
                  </div>

                  <div
                    style={{
                      fontSize: "19px",
                      fontWeight: "700",
                      color: "#303844",
                      marginBottom: "9px",
                    }}
                  >
                    #{salesReturn.returnNumber}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: "7px",
                      marginBottom: "8px",
                    }}
                  >
                    <BsCalendar3 size={12} color="#8a94a3" />
                    <span style={{ fontSize: "11px", color: "#687483" }}>
                      {formatDate(salesReturn.returnDate)}
                    </span>
                  </div>

                  <Badge
                    style={{
                      ...statusBadgeStyle,
                      borderRadius: "5px",
                      padding: "5px 9px",
                      fontSize: "10px",
                      fontWeight: "650",
                    }}
                  >
                    {salesReturn.status || "Unknown"}
                  </Badge>
                </div>
              </div>


              {/* CUSTOMER + REFUND INFORMATION */}

              <Row style={{ marginBottom: "25px" }} className="g-3">

                <Col md={6}>
                  <div style={sectionLabelStyle}>
                    Customer Information
                  </div>

                  <div style={infoBoxStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "11px",
                      }}
                    >
                      <div style={infoIconStyle}>
                        <BsPerson size={16} />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <p style={infoMainTextStyle}>
                          {customerName}
                        </p>

                        <div style={infoSecondaryTextStyle}>
                          {salesReturn.customerId
                            ? "Registered Customer"
                            : "Walk-in Customer"}
                        </div>

                        {customerPhone !== "-" && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginTop: "7px",
                            }}
                          >
                            <BsTelephone size={11} color="#8a94a3" />
                            <span style={infoSecondaryTextStyle}>
                              {customerPhone}
                            </span>
                          </div>
                        )}

                        {customerEmail !== "-" && (
                          <div style={infoSecondaryTextStyle}>
                            {customerEmail}
                          </div>
                        )}

                        {customerAddress !== "-" && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "6px",
                              marginTop: "5px",
                            }}
                          >
                            <BsGeoAlt
                              size={11}
                              color="#8a94a3"
                              style={{ marginTop: "2px", flexShrink: 0 }}
                            />
                            <span style={infoSecondaryTextStyle}>
                              {customerAddress}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>


                <Col md={6}>
                  <div style={sectionLabelStyle}>
                    Refund Information
                  </div>

                  <div style={infoBoxStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "11px",
                      }}
                    >
                      <div style={infoIconStyle}>
                        <BsCreditCard size={16} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={infoMainTextStyle}>
                          {salesReturn.refundMethod || "Not specified"}
                        </p>

                        <div
                          style={{
                            marginTop: "12px",
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "12px",
                            padding: "8px 0",
                            borderTop: "1px solid #edf0f2",
                          }}
                        >
                          <span style={infoSecondaryTextStyle}>
                            Original Invoice
                          </span>
                          <strong style={{ fontSize: "11px", color: "#303844" }}>
                            {salesReturn.invoiceNumber || "-"}
                          </strong>
                        </div>

                        {[
                          {
                            label: "Applied to Balance",
                            value: formatCurrency(salesReturn.appliedToBalance),
                          },
                          {
                            label: "Cash Refund",
                            value: formatCurrency(salesReturn.cashRefund),
                          },
                          {
                            label: "Customer Credit",
                            value: formatCurrency(salesReturn.creditRefund),
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "12px",
                              padding: "8px 0",
                              borderTop: "1px solid #edf0f2",
                            }}
                          >
                            <span style={infoSecondaryTextStyle}>
                              {item.label}
                            </span>

                            <strong style={{ fontSize: "11px", color: "#303844" }}>
                              {item.value}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>


              {/* RETURNED PRODUCTS */}

              <div style={sectionLabelStyle}>
                Returned Products
              </div>

              <div
                style={{
                  border: "1px solid #e1e6eb",
                  borderRadius: "7px",
                  overflow: "hidden",
                  marginBottom: "24px",
                }}
              >
                <Table responsive hover style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ ...tableHeaderStyle, width: "25%" }}>
                        Product
                      </th>

                      <th style={{ ...tableHeaderStyle, textAlign: "center" }}>
                        Qty Sold
                      </th>

                      <th style={{ ...tableHeaderStyle, textAlign: "center" }}>
                        Previously Returned
                      </th>

                      <th style={{ ...tableHeaderStyle, textAlign: "center" }}>
                        Return Qty
                      </th>

                      <th style={{ ...tableHeaderStyle, textAlign: "right" }}>
                        Unit Price
                      </th>

                      <th style={{ ...tableHeaderStyle, textAlign: "right" }}>
                        GST
                      </th>

                      <th style={{ ...tableHeaderStyle, textAlign: "center" }}>
                        Condition
                      </th>

                      <th style={{ ...tableHeaderStyle, textAlign: "right" }}>
                        Return Value
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.length > 0 ? (
                      items.map((item, index) => (
                        <tr key={item._id || index}>
                          <td
                            style={{
                              ...tableCellStyle,
                              fontWeight: "600",
                              color: "#343d49",
                            }}
                          >
                            {item.productName || item.productId?.name || "-"}
                          </td>

                          <td style={{ ...tableCellStyle, textAlign: "center" }}>
                            {item.quantitySold ?? "-"}
                          </td>

                          <td style={{ ...tableCellStyle, textAlign: "center" }}>
                            {item.previouslyReturned ?? 0}
                          </td>

                          <td style={{ ...tableCellStyle, textAlign: "center" }}>
                            {item.returnQuantity ?? 0}
                          </td>

                          <td style={{ ...tableCellStyle, textAlign: "right" }}>
                            {formatCurrency(item.price)}
                          </td>

                          <td style={{ ...tableCellStyle, textAlign: "right" }}>
                            {Number(item.tax || 0)}%
                          </td>

                          <td style={{ ...tableCellStyle, textAlign: "center" }}>
                            <Badge
                              style={{
                                backgroundColor:
                                  item.condition === "Good"
                                    ? "#e8f5ed"
                                    : "#fff6df",
                                color:
                                  item.condition === "Good"
                                    ? "#287a45"
                                    : "#9a6b16",
                                border: "1px solid #e1e6eb",
                                fontSize: "10px",
                                padding: "5px 8px",
                              }}
                            >
                              {item.condition || "-"}
                            </Badge>
                          </td>

                          <td
                            style={{
                              ...tableCellStyle,
                              textAlign: "right",
                              fontWeight: "650",
                              color: "#303844",
                            }}
                          >
                            {formatCurrency(item.refundAmount)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          style={{
                            padding: "28px",
                            textAlign: "center",
                            color: "#8a94a3",
                            fontSize: "12px",
                          }}
                        >
                          No returned products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>


              {/* TOTALS */}

              <Row className="g-4">
                <Col md={6}>
                  <div style={sectionLabelStyle}>
                    Return Information
                  </div>

                  <div style={infoBoxStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                        marginBottom: "12px",
                      }}
                    >
                      <div style={infoIconStyle}>
                        <BsBoxSeam size={15} />
                      </div>

                      <p style={infoMainTextStyle}>
                        Stock Adjustment
                      </p>
                    </div>

                    <p style={infoSecondaryTextStyle}>
                      Good condition products are added back to available inventory.
                    </p>

                    <p style={infoSecondaryTextStyle}>
                      Damaged and defective products are not added back to available inventory.
                    </p>

                    <div
                      style={{
                        borderTop: "1px solid #edf0f2",
                        marginTop: "12px",
                        paddingTop: "10px",
                      }}
                    >
                      <span style={infoSecondaryTextStyle}>
                        Original invoice:{" "}
                        <strong style={{ color: "#303844" }}>
                          {salesReturn.invoiceNumber || "-"}
                        </strong>
                      </span>
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div style={sectionLabelStyle}>
                    Return Amount Summary
                  </div>

                  <div style={{ padding: "5px 2px" }}>
                    {[
                      {
                        label: "Subtotal",
                        value: formatCurrency(salesReturn.subtotal),
                      },
                      {
                        label: "GST",
                        value: formatCurrency(salesReturn.totalTax),
                      },
                      {
                        label: "Allocated Discount",
                        value: `-${formatCurrency(allocatedDiscount)}`,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "7px 0",
                        }}
                      >
                        <span style={totalLabelStyle}>{item.label}</span>
                        <span style={totalValueStyle}>{item.value}</span>
                      </div>
                    ))}

                    <div
                      style={{
                        marginTop: "7px",
                        paddingTop: "12px",
                        borderTop: "1px solid #dfe5ea",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#303844",
                        }}
                      >
                        Total Return Value
                      </span>

                      <span
                        style={{
                          fontSize: "17px",
                          fontWeight: "700",
                          color: "#4b6985",
                        }}
                      >
                        {formatCurrency(salesReturn.totalRefund)}
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>


              {/* NOTES */}

              {salesReturn.notes && (
                <div
                  style={{
                    marginTop: "26px",
                    padding: "14px 16px",
                    border: "1px solid #e2e7eb",
                    borderRadius: "7px",
                    backgroundColor: "#f8fafb",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      marginBottom: "6px",
                    }}
                  >
                    <BsFileText size={13} color="#4b6985" />

                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        color: "#687483",
                        textTransform: "uppercase",
                        letterSpacing: "0.4px",
                      }}
                    >
                      Notes
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "11px",
                      color: "#737d89",
                      lineHeight: "1.6",
                    }}
                  >
                    {salesReturn.notes}
                  </div>
                </div>
              )}


              {/* FOOTER */}

              <div
                style={{
                  marginTop: "28px",
                  paddingTop: "16px",
                  borderTop: "1px solid #edf0f2",
                  textAlign: "center",
                  fontSize: "10px",
                  color: "#9aa3ad",
                }}
              >
                Sales Return • ShopLedger
              </div>

            </Card.Body>
          </Card>
        </div>
      </div>


      {/* PRINT STYLES */}

      <style>
        {`
          @media print {
            body {
              background: #ffffff !important;
            }

            body * {
              visibility: hidden;
            }

            #sales-return-print,
            #sales-return-print * {
              visibility: visible;
            }

            #sales-return-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              background: #ffffff !important;
            }

            .sales-return-actions {
              display: none !important;
            }

            @page {
              size: A4;
              margin: 12mm;
            }
          }

          @media (max-width: 768px) {
            .sales-return-actions {
              width: 100%;
            }

            .sales-return-actions button {
              flex: 0 0 auto;
            }
          }
        `}
      </style>
    </>
  );
};

export default ViewSalesReturn;
