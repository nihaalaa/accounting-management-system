import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  Table,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

import {
  BsArrowLeft,
  BsDownload,
  BsPrinter,
  BsPencil,
  BsReceipt,
  BsPerson,
  BsCreditCard,
  BsCalendar3,
  BsTelephone,
  BsGeoAlt,
  BsFileText,
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
   SHOPLEDGER PDF STYLES
========================================================= */

const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 42,
    paddingHorizontal: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#303844",
    backgroundColor: "#ffffff",
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 18,
    borderBottom: "1 solid #dfe5ea",
    marginBottom: 20,
  },

  companySection: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: "#edf3f7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  logoText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4b6985",
  },

  companyName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#303844",
    marginBottom: 3,
  },

  companySubtitle: {
    fontSize: 7.5,
    color: "#8a94a3",
    marginBottom: 5,
  },

  companyDetails: {
    fontSize: 7.5,
    color: "#737d89",
    lineHeight: 1.4,
  },

  invoiceHeader: {
    alignItems: "flex-end",
  },

  invoiceLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#8a94a3",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },

  invoiceNumber: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#303844",
    marginBottom: 7,
  },

  invoiceMeta: {
    fontSize: 7.5,
    color: "#687483",
    marginBottom: 3,
  },

  /* =======================================================
     STATUS
  ======================================================= */

  statusPaid: {
    marginTop: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "#e8f5ed",
    color: "#287a45",
    border: "1 solid #cfe9d8",
    fontSize: 7.5,
    fontWeight: "bold",
  },

  statusPending: {
    marginTop: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "#fff6df",
    color: "#9a6b16",
    border: "1 solid #f0dfb3",
    fontSize: 7.5,
    fontWeight: "bold",
  },

  statusPartial: {
    marginTop: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "#edf3f7",
    color: "#4b6985",
    border: "1 solid #d5e1e9",
    fontSize: 7.5,
    fontWeight: "bold",
  },

  statusDefault: {
    marginTop: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "#f1f3f5",
    color: "#66707c",
    border: "1 solid #dfe3e7",
    fontSize: 7.5,
    fontWeight: "bold",
  },

  /* =======================================================
     INFORMATION BOXES
  ======================================================= */

  informationRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },

  informationBox: {
    flex: 1,
    border: "1 solid #e1e6eb",
    borderRadius: 6,
    padding: 12,
    backgroundColor: "#ffffff",
  },

  informationTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#687483",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },

  informationMain: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#303844",
    marginBottom: 5,
  },

  informationText: {
    fontSize: 7.5,
    color: "#737d89",
    lineHeight: 1.5,
    marginBottom: 2,
  },

  informationLabel: {
    fontSize: 7,
    color: "#8a94a3",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 2,
  },

  /* =======================================================
     SECTION TITLE
  ======================================================= */

  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#687483",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },

  /* =======================================================
     ITEMS TABLE
  ======================================================= */

  table: {
    width: "100%",
    border: "1 solid #e1e6eb",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 20,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafb",
    borderBottom: "1 solid #dfe5ea",
    paddingVertical: 8,
    paddingHorizontal: 7,
  },

  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #edf0f2",
    paddingVertical: 8,
    paddingHorizontal: 7,
  },

  lastTableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 7,
  },

  itemColumn: {
    width: "42%",
  },

  quantityColumn: {
    width: "12%",
    textAlign: "center",
  },

  priceColumn: {
    width: "15%",
    textAlign: "right",
  },

  taxColumn: {
    width: "12%",
    textAlign: "right",
  },

  amountColumn: {
    width: "19%",
    textAlign: "right",
  },

  tableHeaderText: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#697586",
    textTransform: "uppercase",
    letterSpacing: 0.35,
  },

  itemName: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#343d49",
    marginBottom: 2,
  },

  itemCode: {
    fontSize: 6.8,
    color: "#939ca7",
  },

  tableText: {
    fontSize: 7.8,
    color: "#424b57",
  },

  amountText: {
    fontSize: 7.8,
    fontWeight: "bold",
    color: "#303844",
  },

  /* =======================================================
     TOTALS
  ======================================================= */

  totalsSection: {
    alignItems: "flex-end",
    marginTop: 2,
  },

  totalsBox: {
    width: 220,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
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

  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 7,
    paddingTop: 9,
    borderTop: "1 solid #dfe5ea",
  },

  grandTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#303844",
  },

  grandTotalValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#4b6985",
  },

  /* =======================================================
     NOTES
  ======================================================= */

  notesBox: {
    marginTop: 22,
    padding: 11,
    border: "1 solid #e2e7eb",
    borderRadius: 5,
    backgroundColor: "#f8fafb",
  },

  notesTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#687483",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 5,
  },

  notesText: {
    fontSize: 7.5,
    color: "#737d89",
    lineHeight: 1.5,
  },

  /* =======================================================
     FOOTER
  ======================================================= */

  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    paddingTop: 8,
    borderTop: "1 solid #edf0f2",
    textAlign: "center",
    fontSize: 7,
    color: "#9aa3ad",
  },
});


/* =========================================================
   SHOPLEDGER PDF COMPONENT
========================================================= */

const InvoicePDF = ({ invoice }) => {

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


  /* =======================================================
     CUSTOMER DATA
  ======================================================= */

  const customer = invoice.customer || {};

  const customerName =
    customer.name ||
    invoice.customerName ||
    "Walk-in Customer";

  const customerPhone =
    customer.phone ||
    invoice.customerPhone ||
    "";

  const customerEmail =
    customer.email ||
    invoice.customerEmail ||
    "";

  const customerAddress =
    customer.address ||
    invoice.customerAddress ||
    "";



  /* =======================================================
     PAYMENT DATA
  ======================================================= */

  const paymentStatus = String(invoice.paymentStatus || "Unpaid");
  const paymentStatusLower = paymentStatus.toLowerCase();
  const grandTotal = Number(invoice.grandTotal || 0);

  const amountReceived =
    invoice.amountReceived != null
      ? Number(invoice.amountReceived)
      : paymentStatusLower === "paid"
        ? grandTotal
        : 0;

  const balanceDue =
    invoice.balanceDue != null
      ? Number(invoice.balanceDue)
      : Math.max(0, grandTotal - amountReceived);

  const dueDate = invoice.dueDate;

  let statusStyle = pdfStyles.statusDefault;

  if (paymentStatusLower === "paid") {
    statusStyle = pdfStyles.statusPaid;
  } else if (
    paymentStatusLower === "partial" ||
    paymentStatusLower === "partially paid"
  ) {
    statusStyle = pdfStyles.statusPartial;
  } else if (
    paymentStatusLower === "pending" ||
    paymentStatusLower === "unpaid"
  ) {
    statusStyle = pdfStyles.statusPending;
  }

  /* =======================================================
     ITEMS
  ======================================================= */

  const items = invoice.items || [];


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Document>

      <Page
        size="A4"
        style={pdfStyles.page}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <View style={pdfStyles.header}>

          {/* COMPANY */}
          <View style={pdfStyles.companySection}>

            <View style={pdfStyles.logoBox}>
              <Text style={pdfStyles.logoText}>
                SL
              </Text>
            </View>

            <View>

              <Text style={pdfStyles.companyName}>
                ShopLedger
              </Text>

              <Text style={pdfStyles.companySubtitle}>
                Accounting & Shop Management
              </Text>

              <Text style={pdfStyles.companyDetails}>
                Kozhikode, Kerala, India
              </Text>

            </View>

          </View>


          {/* INVOICE DETAILS */}
          <View style={pdfStyles.invoiceHeader}>

            <Text style={pdfStyles.invoiceLabel}>
              Invoice
            </Text>

            <Text style={pdfStyles.invoiceNumber}>
              #{invoice.invoiceNumber}
            </Text>

            <Text style={pdfStyles.invoiceMeta}>
              Date:{" "}
              {formatDate(
                invoice.invoiceDate ||
                invoice.date ||
                invoice.createdAt
              )}
            </Text>

            <Text style={pdfStyles.invoiceMeta}>
              Payment:{" "}
              {invoice.paymentMethod ||
                "Not specified"}
            </Text>

            <Text style={statusStyle}>
              {paymentStatus}
            </Text>

          </View>

        </View>


        {/* =================================================
            CUSTOMER + PAYMENT
        ================================================= */}

        <View style={pdfStyles.informationRow}>

          {/* CUSTOMER */}
          <View style={pdfStyles.informationBox}>

            <Text style={pdfStyles.informationTitle}>
              Customer Information
            </Text>

            <Text style={pdfStyles.informationMain}>
              {customerName}
            </Text>

            {customerPhone && (
              <Text style={pdfStyles.informationText}>
                Phone: {customerPhone}
              </Text>
            )}

            {customerEmail && (
              <Text style={pdfStyles.informationText}>
                Email: {customerEmail}
              </Text>
            )}

            {customerAddress && (
              <Text style={pdfStyles.informationText}>
                Address: {customerAddress}
              </Text>
            )}

          </View>


  {/* PAYMENT */}
  <View style={pdfStyles.informationBox}>
    <Text style={pdfStyles.informationTitle}>
      Payment Details
    </Text>

    <Text style={pdfStyles.informationLabel}>
      Payment Method
    </Text>
    <Text style={pdfStyles.informationMain}>
      {invoice.paymentMethod || "Not specified"}
    </Text>

    <Text style={pdfStyles.informationLabel}>
      Payment Status
    </Text>
    <Text style={statusStyle}>
      {paymentStatus}
    </Text>

    <Text style={pdfStyles.informationLabel}>
      Invoice Total
    </Text>
    <Text style={pdfStyles.informationMain}>
      {formatCurrency(grandTotal)}
    </Text>

    <Text style={pdfStyles.informationLabel}>
      Amount Received
    </Text>
    <Text style={pdfStyles.informationMain}>
      {formatCurrency(amountReceived)}
    </Text>

    <Text style={pdfStyles.informationLabel}>
      Balance Due
    </Text>
    <Text style={pdfStyles.informationMain}>
      {formatCurrency(balanceDue)}
    </Text>

    {dueDate && (
      <>
        <Text style={pdfStyles.informationLabel}>
          Payment Due Date
        </Text>
        <Text style={pdfStyles.informationMain}>
          {formatDate(dueDate)}
        </Text>
      </>
    )}
  </View>


        </View>


        {/* =================================================
            ITEMS TITLE
        ================================================= */}

        <Text style={pdfStyles.sectionTitle}>
          Invoice Items
        </Text>


        {/* =================================================
            ITEMS TABLE
        ================================================= */}

        <View style={pdfStyles.table}>

          {/* TABLE HEADER */}
          <View style={pdfStyles.tableHeader}>

            <Text
              style={[
                pdfStyles.itemColumn,
                pdfStyles.tableHeaderText,
              ]}
            >
              Item
            </Text>

            <Text
              style={[
                pdfStyles.quantityColumn,
                pdfStyles.tableHeaderText,
              ]}
            >
              Qty
            </Text>

            <Text
              style={[
                pdfStyles.priceColumn,
                pdfStyles.tableHeaderText,
              ]}
            >
              Unit Price
            </Text>

            <Text
              style={[
                pdfStyles.taxColumn,
                pdfStyles.tableHeaderText,
              ]}
            >
              Tax
            </Text>

            <Text
              style={[
                pdfStyles.amountColumn,
                pdfStyles.tableHeaderText,
              ]}
            >
              Amount
            </Text>

          </View>


          {/* TABLE ROWS */}
          {items.map((item, index) => {

            const quantity =
              Number(item.quantity || 0);

            const price =
              Number(
                item.price ||
                item.sellingPrice ||
                0
              );

            const tax =
              Number(item.tax || 0);

            const amount =
              item.total !== undefined
                ? Number(item.total)
                : quantity * price + tax;

            const itemName =
              item.productName ||
              item.name ||
              item.product?.name ||
              "-";

            const productCode =
              item.product?.code ||
              item.code ||
              "";

            const isLast =
              index === items.length - 1;


            return (
              <View
                key={index}
                style={
                  isLast
                    ? pdfStyles.lastTableRow
                    : pdfStyles.tableRow
                }
              >

                {/* ITEM */}
                <View style={pdfStyles.itemColumn}>

                  <Text style={pdfStyles.itemName}>
                    {itemName}
                  </Text>

                  {productCode && (
                    <Text style={pdfStyles.itemCode}>
                      Code: {productCode}
                    </Text>
                  )}

                </View>


                {/* QTY */}
                <Text
                  style={[
                    pdfStyles.quantityColumn,
                    pdfStyles.tableText,
                  ]}
                >
                  {quantity}
                </Text>


                {/* PRICE */}
                <Text
                  style={[
                    pdfStyles.priceColumn,
                    pdfStyles.tableText,
                  ]}
                >
                  {formatCurrency(price)}
                </Text>


                {/* TAX */}
                <Text
                  style={[
                    pdfStyles.taxColumn,
                    pdfStyles.tableText,
                  ]}
                >
                  {formatCurrency(tax)}
                </Text>


                {/* AMOUNT */}
                <Text
                  style={[
                    pdfStyles.amountColumn,
                    pdfStyles.amountText,
                  ]}
                >
                  {formatCurrency(amount)}
                </Text>

              </View>
            );
          })}


          {/* EMPTY STATE */}
          {items.length === 0 && (
            <View style={pdfStyles.lastTableRow}>

              <Text
                style={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: 8,
                  color: "#8a94a3",
                  paddingVertical: 10,
                }}
              >
                No invoice items found.
              </Text>

            </View>
          )}

        </View>


        {/* =================================================
            TOTALS
        ================================================= */}

        <View style={pdfStyles.totalsSection}>

          <View style={pdfStyles.totalsBox}>

            <View style={pdfStyles.totalRow}>

              <Text style={pdfStyles.totalLabel}>
                Subtotal
              </Text>

              <Text style={pdfStyles.totalValue}>
                {formatCurrency(invoice.subtotal)}
              </Text>

            </View>


            <View style={pdfStyles.totalRow}>

              <Text style={pdfStyles.totalLabel}>
                Tax
              </Text>

              <Text style={pdfStyles.totalValue}>
formatCurrency(invoice.taxAmount ?? invoice.tax ?? 0)              </Text>

            </View>


            <View style={pdfStyles.totalRow}>

              <Text style={pdfStyles.totalLabel}>
                Discount
              </Text>

              <Text style={pdfStyles.totalValue}>
                -{formatCurrency(invoice.discount)}
              </Text>

            </View>


            <View style={pdfStyles.grandTotalRow}>

              <Text style={pdfStyles.grandTotalLabel}>
                Grand Total
              </Text>

              <Text style={pdfStyles.grandTotalValue}>
                {formatCurrency(invoice.grandTotal)}
              </Text>

            </View>

          </View>

        </View>


        {/* =================================================
            NOTES
        ================================================= */}

        {invoice.notes && (
          <View style={pdfStyles.notesBox}>

            <Text style={pdfStyles.notesTitle}>
              Notes
            </Text>

            <Text style={pdfStyles.notesText}>
              {invoice.notes}
            </Text>

          </View>
        )}


        {/* =================================================
            FOOTER
        ================================================= */}

        <Text style={pdfStyles.footer}>
          Thank you for your business. • ShopLedger
        </Text>

      </Page>

    </Document>
  );
};


/* =========================================================
   VIEW INVOICE
========================================================= */

export const ViewInvoice = () => {

  const navigate = useNavigate();
  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);


  /* =======================================================
     FETCH INVOICE
  ======================================================= */

  useEffect(() => {

    const fetchInvoice = async () => {

      try {

        setLoading(true);

        const response = await axios.get(
          `http://localhost:5000/invoices/${id}`
        );

        setInvoice(response.data);

      } catch (error) {

        console.error(
          "Error fetching invoice:",
          error
        );

        alert(
          error.response?.data?.message ||
          "Failed to load invoice."
        );

        navigate("/invoices");

      } finally {

        setLoading(false);

      }
    };


    if (id) {
      fetchInvoice();
    }

  }, [id, navigate]);


  /* =======================================================
     HELPERS
  ======================================================= */

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


  const formatCurrency = (amount) => {

    return `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };


  const getPaymentBadge = (status) => {

    const value =
      String(status || "Pending").toLowerCase();


    if (value === "paid") {

      return {
        backgroundColor: "#e8f5ed",
        color: "#287a45",
        border: "1px solid #cfe9d8",
      };

    }

if (
  value === "partial" ||
  value === "partially paid"
) {

      return {
        backgroundColor: "#edf3f7",
        color: "#4b6985",
        border: "1px solid #d5e1e9",
      };

    }


if (
  value === "pending" ||
  value === "unpaid"
) {
      return {
        backgroundColor: "#fff6df",
        color: "#9a6b16",
        border: "1px solid #f0dfb3",
      };

    }


    return {
      backgroundColor: "#f1f3f5",
      color: "#66707c",
      border: "1px solid #dfe3e7",
    };
  };


  /* =======================================================
     PRINT
  ======================================================= */

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
        }}
      >
        Loading invoice...
      </div>
    );

  }


  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!invoice) {

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

        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "8px",
            backgroundColor: "#edf3f7",
            color: "#4b6985",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BsReceipt size={24} />
        </div>


        <div
          style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "#303844",
          }}
        >
          Invoice not found
        </div>


        <Button
          onClick={() => navigate("/invoices")}
          style={{
            height: "36px",
            padding: "0 13px",
            borderRadius: "6px",
            border: "1px solid #d9e0e6",
            backgroundColor: "#ffffff",
            color: "#4b6985",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          <BsArrowLeft
            size={14}
            style={{
              marginRight: "6px",
            }}
          />

          Back to Invoices
        </Button>

      </div>
    );
  }


  /* =======================================================
     CUSTOMER DATA
  ======================================================= */

  const customer =
    invoice.customer || {};


  const customerName =
    customer.name ||
    invoice.customerName ||
    "Walk-in Customer";


  const customerPhone =
    customer.phone ||
    invoice.customerPhone ||
    "-";


  const customerEmail =
    customer.email ||
    invoice.customerEmail ||
    "-";


  const customerAddress =
    customer.address ||
    invoice.customerAddress ||
    "-";


  /* =======================================================
     PAYMENT
  ======================================================= */

  const paymentStatus =
    invoice.paymentStatus || "Unpaid";

  const grandTotal =
    Number(invoice.grandTotal || 0);

  const amountReceived =
    invoice.amountReceived != null
      ? Number(invoice.amountReceived)
      : paymentStatus.toLowerCase() === "paid"
        ? grandTotal
        : 0;

  const balanceDue =
    invoice.balanceDue != null
      ? Number(invoice.balanceDue)
      : Math.max(0, grandTotal - amountReceived);

  const dueDate = invoice.dueDate;

  const paymentBadgeStyle =
    getPaymentBadge(paymentStatus);

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


  const invoiceNumberBadgeStyle = {
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
    boxShadow:
      "0 1px 2px rgba(15,23,42,0.03)",
  };


  const editButtonStyle = {
    height: "38px",
    padding: "0 14px",
    borderRadius: "6px",
    border: "1px solid #4b6985",
    backgroundColor: "#4b6985",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    boxShadow:
      "0 2px 5px rgba(75,105,133,0.18)",
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
    boxShadow:
      "0 1px 2px rgba(15,23,42,0.03)",
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
    boxShadow:
      "0 1px 2px rgba(15,23,42,0.03)",
  };


  const invoiceCardStyle = {
    border: "1px solid #e1e6eb",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    boxShadow:
      "0 2px 8px rgba(15,23,42,0.035)",
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

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div
            className="d-flex justify-content-between align-items-end flex-wrap"
            style={{
              gap: "18px",
              marginBottom: "22px",
            }}
          >

            <div>

              <div
                style={{
                  marginBottom: "5px",
                }}
              >

                <span style={breadcrumbStyle}>
                  Sales
                </span>

                <span
                  style={breadcrumbSeparator}
                >
                  /
                </span>

                <span
                  style={breadcrumbCurrentStyle}
                >
                  Invoices
                </span>

              </div>


              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  flexWrap: "wrap",
                }}
              >

                <h2 style={pageTitleStyle}>
                  Invoice
                </h2>

                <span
                  style={invoiceNumberBadgeStyle}
                >
                  #{invoice.invoiceNumber}
                </span>

              </div>


              <p style={pageSubtitleStyle}>
                Invoice details and payment information
              </p>

            </div>


            {/* =================================================
                ACTIONS
            ================================================= */}

            <div
              className="invoice-actions"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >

              {/* BACK */}

              <Button
                onClick={() =>
                  navigate("/invoices")
                }
                style={backButtonStyle}
              >

                <BsArrowLeft size={14} />

                Back to Invoices

              </Button>


              {/* EDIT */}

              <Button
                onClick={() =>
                  navigate(
                    `/invoices/edit/${invoice._id}`
                  )
                }
                style={editButtonStyle}
              >

                <BsPencil size={14} />

                Edit

              </Button>


              {/* DOWNLOAD */}

              <PDFDownloadLink
                document={
                  <InvoicePDF
                    invoice={invoice}
                  />
                }
                fileName={`${invoice.invoiceNumber}.pdf`}
                style={{
                  textDecoration: "none",
                }}
              >

                {({ loading }) => (

                  <Button
                    style={downloadButtonStyle}
                    disabled={loading}
                  >

                    <BsDownload size={14} />

                    {loading
                      ? "Generating..."
                      : "Download PDF"}

                  </Button>

                )}

              </PDFDownloadLink>


              {/* PRINT */}

              <Button
                onClick={handlePrint}
                style={printButtonStyle}
                title="Print invoice"
              >

                <BsPrinter size={15} />

              </Button>

            </div>

          </div>


          {/* =================================================
              INVOICE WORKSPACE
          ================================================= */}

          <Card
            id="invoice-print"
            style={invoiceCardStyle}
          >

            <Card.Body
              style={{
                padding: "30px",
              }}
            >

              {/* =================================================
                  INVOICE TOP HEADER
              ================================================= */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "25px",
                  paddingBottom: "22px",
                  borderBottom:
                    "1px solid #e2e7eb",
                  marginBottom: "22px",
                }}
              >

                {/* COMPANY */}

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


                {/* INVOICE META */}

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
                    Invoice
                  </div>


                  <div
                    style={{
                      fontSize: "19px",
                      fontWeight: "700",
                      color: "#303844",
                      marginBottom: "9px",
                    }}
                  >
                    #{invoice.invoiceNumber}
                  </div>


                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: "7px",
                      marginBottom: "5px",
                    }}
                  >

                    <BsCalendar3
                      size={12}
                      color="#8a94a3"
                    />

                    <span
                      style={{
                        fontSize: "11px",
                        color: "#687483",
                      }}
                    >
                      {formatDate(
                        invoice.invoiceDate ||
                        invoice.date ||
                        invoice.createdAt
                      )}
                    </span>

                  </div>


                  <Badge
                    pill
                    style={{
                      ...paymentBadgeStyle,
                      borderRadius: "5px",
                      padding: "5px 9px",
                      fontSize: "10px",
                      fontWeight: "650",
                    }}
                  >
                    {paymentStatus}
                  </Badge>

                </div>

              </div>


              {/* =================================================
                  CUSTOMER + PAYMENT
              ================================================= */}

              <Row
                className="g-3"
                style={{
                  marginBottom: "25px",
                }}
              >

                {/* CUSTOMER */}

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


                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >

                        <p style={infoMainTextStyle}>
                          {customerName}
                        </p>


                        {customerPhone !== "-" && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginTop: "7px",
                            }}
                          >

                            <BsTelephone
                              size={11}
                              color="#8a94a3"
                            />

                            <span
                              style={
                                infoSecondaryTextStyle
                              }
                            >
                              {customerPhone}
                            </span>

                          </div>
                        )}


                        {customerEmail !== "-" && (
                          <div
                            style={{
                              marginTop: "3px",
                              fontSize: "11px",
                              color: "#7b8592",
                            }}
                          >
                            {customerEmail}
                          </div>
                        )}


                        {customerAddress !== "-" && (
                          <div
                            style={{
                              display: "flex",
                              alignItems:
                                "flex-start",
                              gap: "6px",
                              marginTop: "5px",
                            }}
                          >

                            <BsGeoAlt
                              size={11}
                              color="#8a94a3"
                              style={{
                                marginTop: "2px",
                                flexShrink: 0,
                              }}
                            />

                            <span
                              style={
                                infoSecondaryTextStyle
                              }
                            >
                              {customerAddress}
                            </span>

                          </div>
                        )}

                      </div>

                    </div>

                  </div>

                </Col>



{/* PAYMENT */}

<Col md={6}>
  <div style={sectionLabelStyle}>
    Payment Information
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
        {/* Payment method */}
        <p style={infoMainTextStyle}>
          {invoice.paymentMethod || "Not specified"}
        </p>

        {/* Payment status */}
        <div
          style={{
            marginTop: "6px",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            gap: "7px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "#8a94a3",
              textTransform: "uppercase",
              fontWeight: "650",
              letterSpacing: "0.35px",
            }}
          >
            Payment Status
          </span>

          <Badge
            style={{
              ...paymentBadgeStyle,
              borderRadius: "4px",
              padding: "4px 7px",
              fontSize: "9px",
              fontWeight: "650",
            }}
          >
            {paymentStatus}
          </Badge>
        </div>

        {/* Payment amounts and due date */}
        {[
          {
            label: "Invoice Total",
            value: formatCurrency(grandTotal),
          },
          {
            label: "Amount Received",
            value: formatCurrency(amountReceived),
          },
          {
            label: "Balance Due",
            value: formatCurrency(balanceDue),
            highlight: balanceDue > 0,
          },
          {
            label: "Payment Due Date",
            value: dueDate ? formatDate(dueDate) : "-",
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              padding: "8px 0",
              borderTop: "1px solid #edf0f2",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "#737d89",
              }}
            >
              {item.label}
            </span>

            <span
              style={{
                fontSize: "11px",
                fontWeight: "650",
                color: item.highlight
                  ? "#9a6b16"
                  : "#303844",
                textAlign: "right",
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
</Col>
              </Row>


              {/* =================================================
                  ITEMS
              ================================================= */}

              <div style={sectionLabelStyle}>
                Invoice Items
              </div>


              <div
                style={{
                  border:
                    "1px solid #e1e6eb",
                  borderRadius: "7px",
                  overflow: "hidden",
                  marginBottom: "24px",
                }}
              >

                <Table
                  responsive
                  hover
                  style={{
                    marginBottom: 0,
                  }}
                >

                  <thead>

                    <tr>

                      <th
                        style={{
                          ...tableHeaderStyle,
                          width: "42%",
                        }}
                      >
                        Item
                      </th>


                      <th
                        style={{
                          ...tableHeaderStyle,
                          width: "12%",
                          textAlign: "center",
                        }}
                      >
                        Qty
                      </th>


                      <th
                        style={{
                          ...tableHeaderStyle,
                          width: "15%",
                          textAlign: "right",
                        }}
                      >
                        Unit Price
                      </th>


                      <th
                        style={{
                          ...tableHeaderStyle,
                          width: "12%",
                          textAlign: "right",
                        }}
                      >
                        Tax
                      </th>


                      <th
                        style={{
                          ...tableHeaderStyle,
                          width: "19%",
                          textAlign: "right",
                        }}
                      >
                        Amount
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {(invoice.items || []).map(
                      (item, index) => {

                        const quantity =
                          Number(
                            item.quantity || 0
                          );

                        const price =
                          Number(
                            item.price ||
                            item.sellingPrice ||
                            0
                          );

                        const tax =
                          Number(item.tax || 0);

                        const amount =
                          item.total !== undefined
                            ? Number(item.total)
                            : quantity *
                                price +
                              tax;


                        return (

                          <tr key={index}>

                            <td
                              style={{
                                ...tableCellStyle,
                                fontWeight:
                                  "600",
                                color:
                                  "#343d49",
                              }}
                            >

                              <div>
                                {item.productName ||
                                  item.name ||
                                  item.product
                                    ?.name ||
                                  "-"}
                              </div>


                              {(
                                item.product
                                  ?.code ||
                                item.code
                              ) && (

                                <div
                                  style={{
                                    fontSize:
                                      "10px",
                                    color:
                                      "#939ca7",
                                    marginTop:
                                      "3px",
                                    fontWeight:
                                      "400",
                                  }}
                                >
                                  Code:{" "}
                                  {item.product
                                    ?.code ||
                                    item.code}
                                </div>

                              )}

                            </td>


                            <td
                              style={{
                                ...tableCellStyle,
                                textAlign:
                                  "center",
                              }}
                            >
                              {quantity}
                            </td>


                            <td
                              style={{
                                ...tableCellStyle,
                                textAlign:
                                  "right",
                              }}
                            >
                              {formatCurrency(
                                price
                              )}
                            </td>


                            <td
                              style={{
                                ...tableCellStyle,
                                textAlign:
                                  "right",
                              }}
                            >
                              {formatCurrency(
                                tax
                              )}
                            </td>


                            <td
                              style={{
                                ...tableCellStyle,
                                textAlign:
                                  "right",
                                fontWeight:
                                  "650",
                                color:
                                  "#303844",
                              }}
                            >
                              {formatCurrency(
                                amount
                              )}
                            </td>

                          </tr>

                        );

                      }
                    )}


                    {(!invoice.items ||
                      invoice.items.length ===
                        0) && (

                      <tr>

                        <td
                          colSpan={5}
                          style={{
                            padding: "28px",
                            textAlign:
                              "center",
                            color:
                              "#8a94a3",
                            fontSize: "12px",
                          }}
                        >
                          No invoice items found.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </Table>

              </div>


              {/* =================================================
                  TOTALS
              ================================================= */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                }}
              >

                <div
                  style={{
                    width: "300px",
                    maxWidth: "100%",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      padding: "6px 0",
                    }}
                  >

                    <span
                      style={totalLabelStyle}
                    >
                      Subtotal
                    </span>

                    <span
                      style={totalValueStyle}
                    >
                      {formatCurrency(
                        invoice.subtotal
                      )}
                    </span>

                  </div>


                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      padding: "6px 0",
                    }}
                  >

                    <span
                      style={totalLabelStyle}
                    >
                      Tax
                    </span>

                    <span
                      style={totalValueStyle}
                    >
                      {formatCurrency(
                        invoice.tax
                      )}
                    </span>

                  </div>


                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      padding: "6px 0",
                    }}
                  >

                    <span
                      style={totalLabelStyle}
                    >
                      Discount
                    </span>

                    <span
                      style={totalValueStyle}
                    >
                      -{" "}
                      {formatCurrency(
                        invoice.discount
                      )}
                    </span>

                  </div>


                  <div
                    style={{
                      marginTop: "7px",
                      paddingTop: "12px",
                      borderTop:
                        "1px solid #dfe5ea",
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                    }}
                  >

                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#303844",
                      }}
                    >
                      Grand Total
                    </span>


                    <span
                      style={{
                        fontSize: "17px",
                        fontWeight: "700",
                        color: "#4b6985",
                      }}
                    >
                      {formatCurrency(
                        invoice.grandTotal
                      )}
                    </span>

                  </div>

                </div>

              </div>


              {/* =================================================
                  NOTES
              ================================================= */}

              {invoice.notes && (

                <div
                  style={{
                    marginTop: "26px",
                    padding:
                      "14px 16px",
                    border:
                      "1px solid #e2e7eb",
                    borderRadius: "7px",
                    backgroundColor:
                      "#f8fafb",
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "7px",
                      marginBottom: "6px",
                    }}
                  >

                    <BsFileText
                      size={13}
                      color="#4b6985"
                    />

                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        color: "#687483",
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.4px",
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
                    {invoice.notes}
                  </div>

                </div>

              )}


              {/* =================================================
                  FOOTER
              ================================================= */}

              <div
                style={{
                  marginTop: "28px",
                  paddingTop: "16px",
                  borderTop:
                    "1px solid #edf0f2",
                  textAlign: "center",
                  fontSize: "10px",
                  color: "#9aa3ad",
                }}
              >
                Thank you for your business.
              </div>

            </Card.Body>

          </Card>

        </div>

      </div>


      {/* =======================================================
          PRINT STYLES
      ======================================================= */}

      <style>
        {`
          @media print {

            body {
              background: #ffffff !important;
            }

            body * {
              visibility: hidden;
            }

            #invoice-print,
            #invoice-print * {
              visibility: visible;
            }

            #invoice-print {
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

            .invoice-actions {
              display: none !important;
            }

            @page {
              size: A4;
              margin: 12mm;
            }
          }


          @media (max-width: 768px) {

            .invoice-actions {
              width: 100%;
            }

            .invoice-actions button {
              flex: 0 0 auto;
            }

          }
        `}
      </style>

    </>
  );
};


export default ViewInvoice;