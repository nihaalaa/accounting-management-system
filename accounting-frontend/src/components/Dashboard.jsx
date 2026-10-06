import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Table } from "react-bootstrap";
import axios from "axios";

import {
  BsArrowUpRight,
  BsBarChart,
  BsCalendar3,
  BsCashStack,
  BsCheckCircle,
  BsClockHistory,
  BsCreditCard,
  BsExclamationCircle,
  BsGraphUpArrow,
  BsPlus,
  BsReceipt,
  BsWallet2,
} from "react-icons/bs";

export const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // FETCH DATA
  // --------------------------------------------------

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [invoiceResponse, expenseResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/invoices`),
        axios.get(`${import.meta.env.VITE_API_URL}/expenses`),
      ]);

      setInvoices(
        Array.isArray(invoiceResponse.data)
          ? invoiceResponse.data
          : invoiceResponse.data.invoices || []
      );

      setExpenses(
        Array.isArray(expenseResponse.data)
          ? expenseResponse.data
          : expenseResponse.data.expenses || []
      );
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --------------------------------------------------
  // DATE HELPERS
  // --------------------------------------------------

  const parseDate = (value) => {
    if (!value) return null;

    // Prevent YYYY-MM-DD from being interpreted as UTC.
    if (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      const [year, month, day] = value.split("-").map(Number);

      return new Date(year, month - 1, day);
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  };

  const getDateKey = (value) => {
    const date = parseDate(value);

    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const today = new Date();

  const todayKey = getDateKey(today);

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const isCurrentMonth = (value) => {
    const date = parseDate(value);

    if (!date) return false;

    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  };

  // --------------------------------------------------
  // FORMATTERS
  // --------------------------------------------------

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (value) => {
    const date = parseDate(value);

    if (!date) return "-";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatShortDate = (value) => {
    const date = parseDate(value);

    if (!date) return "-";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  // --------------------------------------------------
  // DASHBOARD CALCULATIONS
  // --------------------------------------------------

  const dashboardData = useMemo(() => {
    const validInvoices = invoices.filter((invoice) => invoice);

    const validExpenses = expenses.filter((expense) => expense);

    // Sales this month
    const salesThisMonth = validInvoices
      .filter((invoice) =>
        isCurrentMonth(invoice.date || invoice.createdAt)
      )
      .reduce(
        (total, invoice) =>
          total + Number(invoice.grandTotal || 0),
        0
      );

    // Sales today
    const salesToday = validInvoices
      .filter(
        (invoice) =>
          getDateKey(invoice.date || invoice.createdAt) === todayKey
      )
      .reduce(
        (total, invoice) =>
          total + Number(invoice.grandTotal || 0),
        0
      );

    // Expenses this month
    const expensesThisMonth = validExpenses
      .filter((expense) =>
        isCurrentMonth(expense.date || expense.createdAt)
      )
      .reduce(
        (total, expense) =>
          total + Number(expense.amount || 0),
        0
      );

    // Pending invoices
    const pendingInvoices = validInvoices.filter(
      (invoice) => invoice.paymentStatus === "Pending"
    );

    // Partially paid invoices
    const partiallyPaidInvoices = validInvoices.filter(
      (invoice) =>
        invoice.paymentStatus === "Partially Paid"
    );

    // Paid invoices
    const paidInvoices = validInvoices.filter(
      (invoice) => invoice.paymentStatus === "Paid"
    );

    // Since your current invoice model doesn't contain paidAmount,
    // exact balance for partially paid invoices cannot be calculated.
    const toCollect = pendingInvoices.reduce(
      (total, invoice) =>
        total + Number(invoice.grandTotal || 0),
      0
    );

    // Recent invoices
    const recentSales = [...validInvoices]
      .sort((a, b) => {
        const dateA = parseDate(a.date || a.createdAt);
        const dateB = parseDate(b.date || b.createdAt);

        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
      })
      .slice(0, 5);

    // Recent expenses
    const recentExpenses = [...validExpenses]
      .sort((a, b) => {
        const dateA = parseDate(a.date || a.createdAt);
        const dateB = parseDate(b.date || b.createdAt);

        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
      })
      .slice(0, 5);

    return {
      salesThisMonth,
      salesToday,
      expensesThisMonth,
      toCollect,
      pendingInvoices,
      partiallyPaidInvoices,
      paidInvoices,
      recentSales,
      recentExpenses,
    };
  }, [invoices, expenses, todayKey]);

  // --------------------------------------------------
  // 7 DAY SALES CHART
  // --------------------------------------------------

  const salesLast7Days = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const key = getDateKey(date);

      const sales = invoices
        .filter(
          (invoice) =>
            getDateKey(invoice.date || invoice.createdAt) === key
        )
        .reduce(
          (total, invoice) =>
            total + Number(invoice.grandTotal || 0),
          0
        );

      days.push({
        key,
        date,
        sales,
        day: date.toLocaleDateString("en-IN", {
          weekday: "short",
        }),
        shortDate: date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
      });
    }

    return days;
  }, [invoices]);

  const maxSales = Math.max(
    ...salesLast7Days.map((day) => day.sales),
    1
  );

  // --------------------------------------------------
  // PAYMENT SUMMARY
  // --------------------------------------------------

  const totalInvoices = invoices.length;

  const paidPercentage =
    totalInvoices > 0
      ? Math.round(
          (dashboardData.paidInvoices.length / totalInvoices) * 100
        )
      : 0;

  const pendingPercentage =
    totalInvoices > 0
      ? Math.round(
          (dashboardData.pendingInvoices.length / totalInvoices) * 100
        )
      : 0;

  const partiallyPaidPercentage =
    totalInvoices > 0
      ? Math.round(
          (dashboardData.partiallyPaidInvoices.length /
            totalInvoices) *
            100
        )
      : 0;

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorContainer}>
          <BsExclamationCircle size={28} />

          <h5 style={{ marginTop: 12 }}>
            Something went wrong
          </h5>

          <p>{error}</p>

          <button
            onClick={fetchDashboardData}
            style={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={styles.pageTitleRow}>
            <div style={styles.titleIcon}>
              <BsGraphUpArrow size={20} />
            </div>

            <div>
              <h2 style={styles.pageTitle}>
                Dashboard
              </h2>

              <p style={styles.pageSubtitle}>
                Overview of your business performance
              </p>
            </div>
          </div>
        </div>

        <div style={styles.headerDate}>
          <BsCalendar3 size={15} />

          <span>
            {today.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div style={styles.quickActions}>
        <Link
          to="/invoices/add"
          style={styles.primaryAction}
        >
          <BsPlus size={18} />
          New Invoice
        </Link>

        <Link
          to="/products/add"
          style={styles.secondaryAction}
        >
          <BsPlus size={17} />
          Add Product
        </Link>

        <Link
          to="/customers/add"
          style={styles.secondaryAction}
        >
          <BsPlus size={17} />
          Add Customer
        </Link>

        <Link
          to="/expenses/add"
          style={styles.secondaryAction}
        >
          <BsPlus size={17} />
          Add Expense
        </Link>
      </div>

      {/* STAT CARDS */}
      <div style={styles.statsGrid}>
        {/* SALES THIS MONTH */}
        <Card style={styles.statCard}>
          <Card.Body style={styles.statCardBody}>
            <div style={styles.statTop}>
              <div
                style={{
                  ...styles.statIcon,
                  background: "#edf5f0",
                  color: "#347a55",
                }}
              >
                <BsCashStack size={20} />
              </div>

              <span style={styles.statLabel}>
                THIS MONTH
              </span>
            </div>

            <div style={styles.statValue}>
              {formatCurrency(
                dashboardData.salesThisMonth
              )}
            </div>

            <div style={styles.statBottom}>
              <BsArrowUpRight size={14} />

              <span>
                Total invoice sales
              </span>
            </div>
          </Card.Body>
        </Card>

        {/* SALES TODAY */}
        <Card style={styles.statCard}>
          <Card.Body style={styles.statCardBody}>
            <div style={styles.statTop}>
              <div
                style={{
                  ...styles.statIcon,
                  background: "#edf3f8",
                  color: "#3f607d",
                }}
              >
                <BsGraphUpArrow size={20} />
              </div>

              <span style={styles.statLabel}>
                TODAY
              </span>
            </div>

            <div style={styles.statValue}>
              {formatCurrency(
                dashboardData.salesToday
              )}
            </div>

            <div style={styles.statBottom}>
              <BsReceipt size={14} />

              <span>
                Today's sales
              </span>
            </div>
          </Card.Body>
        </Card>

        {/* EXPENSES */}
        <Card style={styles.statCard}>
          <Card.Body style={styles.statCardBody}>
            <div style={styles.statTop}>
              <div
                style={{
                  ...styles.statIcon,
                  background: "#faf1ee",
                  color: "#a85a43",
                }}
              >
                <BsWallet2 size={20} />
              </div>

              <span style={styles.statLabel}>
                THIS MONTH
              </span>
            </div>

            <div style={styles.statValue}>
              {formatCurrency(
                dashboardData.expensesThisMonth
              )}
            </div>

            <div style={styles.statBottom}>
              <BsCreditCard size={14} />

              <span>
                Business expenses
              </span>
            </div>
          </Card.Body>
        </Card>

        {/* TO COLLECT */}
        <Card style={styles.statCard}>
          <Card.Body style={styles.statCardBody}>
            <div style={styles.statTop}>
              <div
                style={{
                  ...styles.statIcon,
                  background: "#fff7e8",
                  color: "#b77a20",
                }}
              >
                <BsClockHistory size={20} />
              </div>

              <span style={styles.statLabel}>
                PENDING
              </span>
            </div>

            <div style={styles.statValue}>
              {formatCurrency(
                dashboardData.toCollect
              )}
            </div>

            <div style={styles.statBottom}>
              <BsExclamationCircle size={14} />

              <span>
                {dashboardData.pendingInvoices.length} pending
                invoice
                {dashboardData.pendingInvoices.length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* MAIN GRID */}
      <div style={styles.mainGrid}>
        {/* SALES OVERVIEW */}
        <Card style={styles.largeCard}>
          <Card.Body style={{ padding: 0 }}>
            <div style={styles.cardHeader}>
              <div>
                <h5 style={styles.cardTitle}>
                  Sales Overview
                </h5>

                <p style={styles.cardSubtitle}>
                  Sales performance for the last 7 days
                </p>
              </div>

              <div style={styles.cardHeaderIcon}>
                <BsBarChart size={18} />
              </div>
            </div>

            <div style={styles.chartContainer}>
              <div style={styles.chartAmount}>
                {formatCurrency(
                  salesLast7Days.reduce(
                    (total, day) => total + day.sales,
                    0
                  )
                )}

                <span>
                  &nbsp; total
                </span>
              </div>

              <div style={styles.chart}>
                {salesLast7Days.map((day) => {
                  const height =
                    day.sales > 0
                      ? Math.max(
                          (day.sales / maxSales) * 150,
                          10
                        )
                      : 5;

                  const isToday =
                    day.key === todayKey;

                  return (
                    <div
                      key={day.key}
                      style={styles.barWrapper}
                    >
                      <div
                        style={{
                          ...styles.barValue,
                          opacity:
                            day.sales > 0 ? 1 : 0,
                        }}
                      >
                        {day.sales > 0
                          ? formatCurrency(day.sales)
                          : ""}
                      </div>

                      <div
                        style={{
                          ...styles.bar,
                          height: `${height}px`,
                          background: isToday
                            ? "#3f607d"
                            : "#d8e3ec",
                        }}
                        title={`${day.shortDate}: ${formatCurrency(
                          day.sales
                        )}`}
                      ></div>

                      <div
                        style={{
                          ...styles.dayLabel,
                          fontWeight: isToday
                            ? 700
                            : 500,
                          color: isToday
                            ? "#3f607d"
                            : "#7b8794",
                        }}
                      >
                        {day.day}
                      </div>

                      <div style={styles.dateLabel}>
                        {day.shortDate}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* PAYMENT SUMMARY */}
        <Card style={styles.sideCard}>
          <Card.Body style={{ padding: 0 }}>
            <div style={styles.cardHeader}>
              <div>
                <h5 style={styles.cardTitle}>
                  Invoice Status
                </h5>

                <p style={styles.cardSubtitle}>
                  Payment status overview
                </p>
              </div>

              <div style={styles.cardHeaderIcon}>
                <BsReceipt size={18} />
              </div>
            </div>

            <div style={styles.paymentBody}>
              {/* PAID */}
              <div style={styles.paymentRow}>
                <div style={styles.paymentLeft}>
                  <span
                    style={{
                      ...styles.statusDot,
                      background: "#4d9468",
                    }}
                  ></span>

                  <span style={styles.paymentName}>
                    Paid
                  </span>
                </div>

                <div style={styles.paymentRight}>
                  <strong>
                    {dashboardData.paidInvoices.length}
                  </strong>

                  <span>
                    {paidPercentage}%
                  </span>
                </div>
              </div>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressBar,
                    width: `${paidPercentage}%`,
                    background: "#4d9468",
                  }}
                ></div>
              </div>

              {/* PENDING */}
              <div
                style={{
                  ...styles.paymentRow,
                  marginTop: 22,
                }}
              >
                <div style={styles.paymentLeft}>
                  <span
                    style={{
                      ...styles.statusDot,
                      background: "#d69a32",
                    }}
                  ></span>

                  <span style={styles.paymentName}>
                    Pending
                  </span>
                </div>

                <div style={styles.paymentRight}>
                  <strong>
                    {dashboardData.pendingInvoices.length}
                  </strong>

                  <span>
                    {pendingPercentage}%
                  </span>
                </div>
              </div>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressBar,
                    width: `${pendingPercentage}%`,
                    background: "#d69a32",
                  }}
                ></div>
              </div>

              {/* PARTIALLY PAID */}
              <div
                style={{
                  ...styles.paymentRow,
                  marginTop: 22,
                }}
              >
                <div style={styles.paymentLeft}>
                  <span
                    style={{
                      ...styles.statusDot,
                      background: "#6388a5",
                    }}
                  ></span>

                  <span style={styles.paymentName}>
                    Partially Paid
                  </span>
                </div>

                <div style={styles.paymentRight}>
                  <strong>
                    {
                      dashboardData
                        .partiallyPaidInvoices.length
                    }
                  </strong>

                  <span>
                    {partiallyPaidPercentage}%
                  </span>
                </div>
              </div>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressBar,
                    width: `${partiallyPaidPercentage}%`,
                    background: "#6388a5",
                  }}
                ></div>
              </div>

              {/* TOTAL */}
              <div style={styles.invoiceTotalBox}>
                <div>
                  <span style={styles.invoiceTotalLabel}>
                    Total Invoices
                  </span>

                  <strong style={styles.invoiceTotalValue}>
                    {totalInvoices}
                  </strong>
                </div>

                <Link
                  to="/invoices"
                  style={styles.viewAllLink}
                >
                  View all
                  <BsArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* LOWER GRID */}
      <div style={styles.lowerGrid}>
        {/* RECENT SALES */}
        <Card style={styles.tableCard}>
          <Card.Body style={{ padding: 0 }}>
            <div style={styles.cardHeader}>
              <div>
                <h5 style={styles.cardTitle}>
                  Recent Sales
                </h5>

                <p style={styles.cardSubtitle}>
                  Latest invoices generated
                </p>
              </div>

              <Link
                to="/invoices"
                style={styles.viewAllButton}
              >
                View All
                <BsArrowUpRight size={13} />
              </Link>
            </div>

            {dashboardData.recentSales.length === 0 ? (
              <div style={styles.emptyState}>
                <BsReceipt size={28} />

                <p>
                  No invoices found
                </p>

                <Link
                  to="/invoices/add"
                  style={styles.emptyAction}
                >
                  Create your first invoice
                </Link>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <Table
                  hover
                  responsive
                  style={styles.table}
                >
                  <thead>
                    <tr>
                      <th>INVOICE</th>
                      <th>CUSTOMER</th>
                      <th>DATE</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {dashboardData.recentSales.map(
                      (invoice) => (
                        <tr key={invoice._id}>
                          <td>
                            <Link
                              to={`/invoices/view/${invoice._id}`}
                              style={styles.invoiceLink}
                            >
                              {invoice.invoiceNumber ||
                                "INV"}
                            </Link>
                          </td>

                          <td>
                            <div style={styles.customerCell}>
                              <div
                                style={styles.customerAvatar}
                              >
                                {(
                                  invoice.customerName ||
                                  "C"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <div
                                  style={
                                    styles.customerName
                                  }
                                >
                                  {invoice.customerName ||
                                    "Walk-in Customer"}
                                </div>

                                {invoice.customerPhone && (
                                  <div
                                    style={
                                      styles.customerPhone
                                    }
                                  >
                                    {invoice.customerPhone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td style={styles.dateCell}>
                            {formatDate(
                              invoice.date ||
                                invoice.createdAt
                            )}
                          </td>

                          <td style={styles.amountCell}>
                            {formatCurrency(
                              invoice.grandTotal
                            )}
                          </td>

                          <td>
                            <span
                              style={getStatusStyle(
                                invoice.paymentStatus
                              )}
                            >
                              {invoice.paymentStatus ||
                                "Unknown"}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* RECENT EXPENSES */}
        <Card style={styles.tableCard}>
          <Card.Body style={{ padding: 0 }}>
            <div style={styles.cardHeader}>
              <div>
                <h5 style={styles.cardTitle}>
                  Recent Expenses
                </h5>

                <p style={styles.cardSubtitle}>
                  Latest business expenses
                </p>
              </div>

              <Link
                to="/expenses"
                style={styles.viewAllButton}
              >
                View All
                <BsArrowUpRight size={13} />
              </Link>
            </div>

            {dashboardData.recentExpenses.length ===
            0 ? (
              <div style={styles.emptyState}>
                <BsWallet2 size={28} />

                <p>
                  No expenses found
                </p>

                <Link
                  to="/expenses/add"
                  style={styles.emptyAction}
                >
                  Add your first expense
                </Link>
              </div>
            ) : (
              <div style={styles.expenseList}>
                {dashboardData.recentExpenses.map(
                  (expense) => (
                    <div
                      key={expense._id}
                      style={styles.expenseItem}
                    >
                      <div style={styles.expenseLeft}>
                        <div
                          style={styles.expenseIcon}
                        >
                          <BsWallet2 size={17} />
                        </div>

                        <div>
                          <div
                            style={
                              styles.expenseName
                            }
                          >
                            {expense.name ||
                              "Expense"}
                          </div>

                          <div
                            style={
                              styles.expenseCategory
                            }
                          >
                            {expense.category ||
                              "General"}{" "}
                            •{" "}
                            {formatShortDate(
                              expense.date ||
                                expense.createdAt
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        style={styles.expenseAmount}
                      >
                        -{" "}
                        {formatCurrency(
                          expense.amount
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* BOTTOM INFORMATION */}
      <div style={styles.bottomGrid}>
        {/* BUSINESS SUMMARY */}
        <Card style={styles.infoCard}>
          <Card.Body>
            <div style={styles.infoHeader}>
              <div style={styles.infoIcon}>
                <BsCheckCircle size={18} />
              </div>

              <div>
                <h6 style={styles.infoTitle}>
                  Business Summary
                </h6>

                <p style={styles.infoSubtitle}>
                  Current month overview
                </p>
              </div>
            </div>

            <div style={styles.summaryGrid}>
              <div>
                <span style={styles.summaryLabel}>
                  Invoices
                </span>

                <strong style={styles.summaryValue}>
                  {
                    invoices.filter((invoice) =>
                      isCurrentMonth(
                        invoice.date ||
                          invoice.createdAt
                      )
                    ).length
                  }
                </strong>
              </div>

              <div>
                <span style={styles.summaryLabel}>
                  Sales
                </span>

                <strong style={styles.summaryValue}>
                  {formatCurrency(
                    dashboardData.salesThisMonth
                  )}
                </strong>
              </div>

              <div>
                <span style={styles.summaryLabel}>
                  Expenses
                </span>

                <strong style={styles.summaryValue}>
                  {formatCurrency(
                    dashboardData.expensesThisMonth
                  )}
                </strong>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* QUICK LINKS */}
        <Card style={styles.infoCard}>
          <Card.Body>
            <div style={styles.infoHeader}>
              <div
                style={{
                  ...styles.infoIcon,
                  background: "#f1f4f7",
                  color: "#3f607d",
                }}
              >
                <BsArrowUpRight size={18} />
              </div>

              <div>
                <h6 style={styles.infoTitle}>
                  Quick Access
                </h6>

                <p style={styles.infoSubtitle}>
                  Manage your business
                </p>
              </div>
            </div>

            <div style={styles.quickLinks}>
              <Link
                to="/invoices"
                style={styles.quickLink}
              >
                <BsReceipt />
                Invoices
              </Link>

              <Link
                to="/products"
                style={styles.quickLink}
              >
                <BsCashStack />
                Products
              </Link>

              <Link
                to="/customers"
                style={styles.quickLink}
              >
                <BsCreditCard />
                Customers
              </Link>

              <Link
                to="/expenses"
                style={styles.quickLink}
              >
                <BsWallet2 />
                Expenses
              </Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

// --------------------------------------------------
// STATUS STYLE
// --------------------------------------------------

const getStatusStyle = (status) => {
  if (status === "Paid") {
    return {
      ...styles.statusBadge,
      background: "#edf7f0",
      color: "#3c8054",
    };
  }

  if (status === "Pending") {
    return {
      ...styles.statusBadge,
      background: "#fff6e5",
      color: "#a56c18",
    };
  }

  if (status === "Partially Paid") {
    return {
      ...styles.statusBadge,
      background: "#edf3f8",
      color: "#4e718f",
    };
  }

  return {
    ...styles.statusBadge,
    background: "#f1f3f5",
    color: "#68737d",
  };
};

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = {
  page: {
    width: "100%",
    minHeight: "100vh",
    background: "#f6f8fa",
    padding: "28px 32px 45px",
    boxSizing: "border-box",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: "#263746",
  },

  // HEADER

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    gap: 20,
  },

  pageTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 13,
  },

  titleIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    background: "#3f607d",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(63,96,125,0.18)",
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
    color: "#263746",
    letterSpacing: "-0.3px",
  },

  pageSubtitle: {
    fontSize: 13,
    color: "#7b8794",
    margin: "4px 0 0",
  },

  headerDate: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#ffffff",
    border: "1px solid #e4e9ee",
    padding: "9px 13px",
    borderRadius: 9,
    color: "#687783",
    fontSize: 12.5,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },

  // QUICK ACTIONS

  quickActions: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 20,
  },

  primaryAction: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "9px 15px",
    background: "#3f607d",
    color: "#ffffff",
    borderRadius: 7,
    fontSize: 12.5,
    fontWeight: 600,
    textDecoration: "none",
    border: "1px solid #3f607d",
  },

  secondaryAction: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "9px 14px",
    background: "#ffffff",
    color: "#536575",
    borderRadius: 7,
    fontSize: 12.5,
    fontWeight: 600,
    textDecoration: "none",
    border: "1px solid #dfe5ea",
  },

  // STATS

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: 15,
    marginBottom: 18,
  },

  statCard: {
    border: "1px solid #e3e8ed",
    borderRadius: 11,
    boxShadow:
      "0 2px 7px rgba(31,45,61,0.035)",
    background: "#ffffff",
  },

  statCardBody: {
    padding: "17px 18px",
  },

  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statIcon: {
    width: 39,
    height: 39,
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  statLabel: {
    fontSize: 9.5,
    fontWeight: 700,
    color: "#8a96a1",
    letterSpacing: "0.6px",
  },

  statValue: {
    fontSize: 22,
    fontWeight: 700,
    color: "#263746",
    marginTop: 17,
    letterSpacing: "-0.4px",
  },

  statBottom: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    color: "#7b8794",
    fontSize: 11.5,
    marginTop: 7,
  },

  // MAIN GRID

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.7fr) minmax(300px, 0.9fr)",
    gap: 18,
    marginBottom: 18,
  },

  largeCard: {
    border: "1px solid #e3e8ed",
    borderRadius: 11,
    boxShadow:
      "0 2px 7px rgba(31,45,61,0.035)",
    background: "#ffffff",
    minHeight: 330,
  },

  sideCard: {
    border: "1px solid #e3e8ed",
    borderRadius: 11,
    boxShadow:
      "0 2px 7px rgba(31,45,61,0.035)",
    background: "#ffffff",
    minHeight: 330,
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "17px 19px",
    borderBottom: "1px solid #edf0f2",
  },

  cardTitle: {
    fontSize: 14.5,
    fontWeight: 700,
    color: "#2d3e4d",
    margin: 0,
  },

  cardSubtitle: {
    fontSize: 11.5,
    color: "#89949e",
    margin: "4px 0 0",
  },

  cardHeaderIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: "#f1f4f7",
    color: "#536d84",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // CHART

  chartContainer: {
    padding: "19px 22px 17px",
  },

  chartAmount: {
    fontSize: 19,
    fontWeight: 700,
    color: "#2f4353",
  },

  chartAmountSpan: {
    fontSize: 11,
    fontWeight: 400,
    color: "#8a959e",
  },

  chart: {
    height: 205,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-around",
    gap: 10,
    padding: "12px 2px 0",
    borderBottom: "1px solid #e7ebee",
    marginTop: 8,
  },

  barWrapper: {
    height: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    minWidth: 45,
  },

  barValue: {
    minHeight: 18,
    fontSize: 8.5,
    color: "#6f7d88",
    whiteSpace: "nowrap",
    marginBottom: 4,
  },

  bar: {
    width: "35px",
    minHeight: 4,
    borderRadius: "5px 5px 2px 2px",
    transition: "height 0.3s ease",
  },

  dayLabel: {
    fontSize: 10.5,
    marginTop: 8,
  },

  dateLabel: {
    fontSize: 8.5,
    color: "#9aa4ad",
    marginTop: 2,
  },

  // PAYMENT SUMMARY

  paymentBody: {
    padding: "20px 20px 18px",
  },

  paymentRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  paymentLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    display: "inline-block",
  },

  paymentName: {
    fontSize: 12.5,
    color: "#566673",
    fontWeight: 500,
  },

  paymentRight: {
    display: "flex",
    alignItems: "center",
    gap: 9,
  },

  progressTrack: {
    width: "100%",
    height: 5,
    background: "#edf0f2",
    borderRadius: 10,
    marginTop: 8,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: 10,
    transition: "width 0.3s ease",
  },

  invoiceTotalBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid #edf0f2",
    marginTop: 23,
    paddingTop: 17,
  },

  invoiceTotalLabel: {
    display: "block",
    fontSize: 10.5,
    color: "#8a959e",
  },

  invoiceTotalValue: {
    display: "block",
    fontSize: 19,
    color: "#2f4353",
    marginTop: 3,
  },

  viewAllLink: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    color: "#3f607d",
    textDecoration: "none",
    fontSize: 11.5,
    fontWeight: 600,
  },

  // LOWER GRID

  lowerGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.55fr) minmax(330px, 1fr)",
    gap: 18,
    marginBottom: 18,
  },

  tableCard: {
    border: "1px solid #e3e8ed",
    borderRadius: 11,
    boxShadow:
      "0 2px 7px rgba(31,45,61,0.035)",
    background: "#ffffff",
    minHeight: 300,
    overflow: "hidden",
  },

  viewAllButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    color: "#3f607d",
    fontSize: 11.5,
    fontWeight: 600,
    textDecoration: "none",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    margin: 0,
    fontSize: 11.5,
    verticalAlign: "middle",
  },

  invoiceLink: {
    color: "#3f607d",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 11.5,
  },

  customerCell: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    minWidth: 150,
  },

  customerAvatar: {
    width: 30,
    height: 30,
    minWidth: 30,
    borderRadius: 8,
    background: "#edf3f8",
    color: "#3f607d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
  },

  customerName: {
    fontSize: 11.5,
    fontWeight: 600,
    color: "#394b5a",
  },

  customerPhone: {
    fontSize: 9.5,
    color: "#939da5",
    marginTop: 2,
  },

  dateCell: {
    color: "#788590",
    whiteSpace: "nowrap",
  },

  amountCell: {
    color: "#354957",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    borderRadius: 20,
    fontSize: 9.5,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  // EXPENSES

  expenseList: {
    padding: "5px 18px 10px",
  },

  expenseItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
    padding: "12px 2px",
    borderBottom: "1px solid #f0f2f4",
  },

  expenseLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },

  expenseIcon: {
    width: 34,
    height: 34,
    minWidth: 34,
    borderRadius: 8,
    background: "#faf1ee",
    color: "#a85a43",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  expenseName: {
    fontSize: 11.5,
    fontWeight: 600,
    color: "#435563",
    maxWidth: 160,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  expenseCategory: {
    fontSize: 9.5,
    color: "#929ca4",
    marginTop: 3,
  },

  expenseAmount: {
    fontSize: 11.5,
    fontWeight: 700,
    color: "#a85a43",
    whiteSpace: "nowrap",
  },

  // BOTTOM

  bottomGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) minmax(0, 1fr)",
    gap: 18,
  },

  infoCard: {
    border: "1px solid #e3e8ed",
    borderRadius: 11,
    boxShadow:
      "0 2px 7px rgba(31,45,61,0.035)",
    background: "#ffffff",
  },

  infoHeader: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    marginBottom: 19,
  },

  infoIcon: {
    width: 35,
    height: 35,
    borderRadius: 8,
    background: "#edf7f0",
    color: "#4d9468",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#3a4c5a",
    margin: 0,
  },

  infoSubtitle: {
    fontSize: 10.5,
    color: "#8b969f",
    margin: "3px 0 0",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: 15,
  },

  summaryLabel: {
    display: "block",
    fontSize: 9.5,
    color: "#8b969f",
    marginBottom: 4,
  },

  summaryValue: {
    display: "block",
    fontSize: 15,
    color: "#364a59",
  },

  quickLinks: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: 8,
  },

  quickLink: {
    minHeight: 58,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: "1px solid #e6eaee",
    borderRadius: 8,
    color: "#61717e",
    textDecoration: "none",
    fontSize: 9.5,
    fontWeight: 600,
    background: "#fafbfc",
  },

  // EMPTY STATE

  emptyState: {
    minHeight: 210,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#9aa4ac",
    gap: 7,
    fontSize: 11.5,
  },

  emptyAction: {
    color: "#3f607d",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 11,
  },

  // LOADING

  loadingContainer: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#7d8993",
  },

  loadingSpinner: {
    width: 32,
    height: 32,
    border: "3px solid #e4e9ed",
    borderTop: "3px solid #3f607d",
    borderRadius: "50%",
    animation: "dashboardSpin 0.8s linear infinite",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 12,
  },

  // ERROR

  errorContainer: {
    minHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#7b8790",
    textAlign: "center",
  },

  retryButton: {
    border: "none",
    background: "#3f607d",
    color: "#ffffff",
    padding: "9px 18px",
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
};
export default Dashboard