
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BsPlus,
  BsPencil,
  BsTrash,
} from "react-icons/bs";
import axios from "axios";

export const Expenses = () => {

  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
const [fromDate, setFromDate] = useState("")
const [toDate, setToDate] = useState("")
  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const expensesPerPage = 3;


  const fetchExpenses = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/expenses"
      );

      setExpenses(response.data);

    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    fetchExpenses();
  }, []);


  const deleteExpense = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) return;

    try {

      await axios.delete(
        `http://localhost:5000/expenses/${id}`
      );

      fetchExpenses();

    } catch (error) {
      console.log(error);
      alert("Failed to delete expense");
    }
  };


  // SEARCH
const filteredExpenses = expenses.filter((expense) => {

  const matchSearch = expense.name
    .toLowerCase()
    .includes(search.toLowerCase());

  const expenseDate = new Date(expense.date);

  const matchesFromDate =
    !fromDate ||
    expenseDate >= new Date(fromDate);

  const matchesToDate =
    !toDate ||
    expenseDate <= new Date(toDate + "T23:59:59");

  return (
    matchSearch &&
    matchesFromDate &&
    matchesToDate
  );
});



  // PAGINATION
  const indexOfLastExpense =
    currentPage * expensesPerPage;

  const indexOfFirstExpense =
    indexOfLastExpense - expensesPerPage;

  const currentExpenses =
    filteredExpenses.slice(
      indexOfFirstExpense,
      indexOfLastExpense
    );

  const totalPages =
    Math.ceil(
      filteredExpenses.length / expensesPerPage
    );


  // TOTAL EXPENSES
  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount),
    0
  );


  return (
    <div style={pageStyle}>

      {/* HEADER */}

      <div style={headerStyle}>

        <div>

          <h2 style={titleStyle}>
            Expenses
          </h2>

          <p style={subtitleStyle}>
            Track and manage your business expenses
          </p>

        </div>


        <Link
          to="/expenses/add"
          style={addButtonStyle}
        >
          <BsPlus size={19} />
          Add Expense
        </Link>

      </div>


      {/* SUMMARY */}

      <div style={summaryContainerStyle}>

        <div style={summaryCardStyle}>

          <div style={summaryLabelStyle}>
            Total Expenses
          </div>

          <div style={summaryValueStyle}>
            ₹{totalExpenses.toFixed(2)}
          </div>

        </div>


        <div style={summaryCardStyle}>

          <div style={summaryLabelStyle}>
            Total Records
          </div>

          <div style={summaryValueStyle}>
            {expenses.length}
          </div>

        </div>


        <div style={summaryCardStyle}>

          <div style={summaryLabelStyle}>
            This Month
          </div>

          <div style={summaryValueStyle}>
            ₹{totalExpenses.toFixed(2)}
          </div>

        </div>
      <div style={dateFilterContainer}>
  <span style={dateLabel}>From</span>
<input
  type="date"
  value={fromDate}
  onChange={(e) => {
    setFromDate(e.target.value);
    setCurrentPage(1);
  }}
  style={dateInput}
/>
  <span style={dateLabel}>To</span>

<input
  type="date"
  value={toDate}
  onChange={(e) => {
    setToDate(e.target.value);
    setCurrentPage(1);
  }}
  style={dateInput}
/></div>
      </div>


      {/* TABLE CARD */}

      <div style={tableCardStyle}>


        {/* TABLE HEADER */}

        <div style={tableHeaderStyle}>

          <div>

            <h3 style={tableTitleStyle}>
              Expense List
            </h3>

            <p style={tableSubtitleStyle}>
              View and manage your business expenses
            </p>

          </div>


          {/* SEARCH */}

          <div style={searchContainerStyle}>

            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={searchInputStyle}
            />

            <span style={countBadgeStyle}>
              {filteredExpenses.length} Expenses
            </span>

          </div>

        </div>


        {/* TABLE */}

        <div style={{ overflowX: "auto" }}>

          <table style={tableStyle}>

            <thead>

              <tr>

                <th style={thStyle}>
                  Expense
                </th>

                <th style={thStyle}>
                  Category
                </th>

                <th style={thStyle}>
                  Amount
                </th>

                <th style={thStyle}>
                  Date
                </th>

                <th style={thStyle}>
                  Payment Method
                </th>

                <th style={thStyle}>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredExpenses.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    style={emptyStyle}
                  >

                    <div style={emptyTitleStyle}>
                      {search
                        ? "No expenses found"
                        : "No expenses available"}
                    </div>

                    <div style={emptyTextStyle}>
                      {search
                        ? `No expenses match "${search}".`
                        : "Add your first expense to get started."}
                    </div>

                  </td>

                </tr>

              ) : (

                currentExpenses.map((expense) => (

                  <tr key={expense._id}>

                    {/* EXPENSE */}

                    <td style={tdStyle}>
                      {expense.name}
                    </td>


                    {/* CATEGORY */}

                    <td style={tdStyle}>
                      {expense.category}
                    </td>


                    {/* AMOUNT */}

                    <td style={tdStyle}>
                      ₹
                      {Number(
                        expense.amount
                      ).toFixed(2)}
                    </td>


                    {/* DATE */}

                    <td style={tdStyle}>

                      {new Date(
                        expense.date
                      ).toLocaleDateString("en-IN")}

                    </td>


                    {/* PAYMENT METHOD */}

                    <td style={tdStyle}>
                      {expense.paymentMethod}
                    </td>


                    {/* ACTION */}

                    <td style={tdStyle}>

                      <Link
                        to={`/expenses/edit/${expense._id}`}
                        style={editButtonStyle}
                        title="Edit"
                      >
                        <BsPencil />
                      </Link>


                      <button
                        style={deleteButtonStyle}
                        title="Delete"
                        onClick={() =>
                          deleteExpense(
                            expense._id
                          )
                        }
                      >
                        <BsTrash />
                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>


        {/* PAGINATION */}

        {filteredExpenses.length > 0 && (

          <div style={paginationStyle}>

            <button
              style={{
                ...paginationButtonStyle,
                opacity:
                  currentPage === 1 ? 0.5 : 1,
                cursor:
                  currentPage === 1
                    ? "not-allowed"
                    : "pointer",
              }}
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage(currentPage - 1)
              }
            >
              Previous
            </button>


            <div style={pageNumbersStyle}>

              {[...Array(totalPages)].map(
                (_, index) => {

                  const pageNumber =
                    index + 1;

                  return (

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
                      }}
                    >
                      {pageNumber}
                    </button>

                  );

                }
              )}

            </div>


            <button
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
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage(
                  currentPage + 1
                )
              }
            >
              Next
            </button>

          </div>

        )}

      </div>

    </div>
  );
};
const dateInput = {
  height: "36px",
  padding: "0 10px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  outline: "none",
  fontSize: "12px",
  fontWeight: "500",
  color: "#475569",
  backgroundColor: "#f8fafc",
  cursor: "pointer",
  transition: "all 0.2s ease",
};
const dateFilterContainer = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 12px",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
};

const dateLabel = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#64748b",
};

/* =========================
   PAGE
========================= */

const pageStyle = {
  padding: "30px",
  backgroundColor: "#f8fafc",
  minHeight: "100vh",
};


/* =========================
   HEADER
========================= */

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "25px",
};

const titleStyle = {
  margin: 0,
  fontSize: "22px",
  fontWeight: "600",
  color: "#1f2937",
};

const subtitleStyle = {
  margin: "5px 0 0",
  fontSize: "13px",
  color: "#6b7280",
};

const addButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  textDecoration: "none",
  border: "none",
  backgroundColor: "#3f607d",
  color: "#ffffff",
  borderRadius: "6px",
  padding: "10px 17px",
  fontSize: "13px",
  fontWeight: "500",
};


/* =========================
   SUMMARY
========================= */

const summaryContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "18px",
  marginBottom: "25px",
};

const summaryCardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "18px 20px",
};

const summaryLabelStyle = {
  fontSize: "12px",
  color: "#6b7280",
  marginBottom: "8px",
};

const summaryValueStyle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#1f2937",
};


/* =========================
   TABLE CARD
========================= */

const tableCardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  overflow: "hidden",
};


/* =========================
   TABLE HEADER
========================= */

const tableHeaderStyle = {
  padding: "18px 20px",
  borderBottom: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const tableTitleStyle = {
  margin: 0,
  fontSize: "15px",
  fontWeight: "600",
  color: "#1f2937",
};

const tableSubtitleStyle = {
  margin: "4px 0 0",
  fontSize: "11px",
  color: "#9ca3af",
};


/* =========================
   SEARCH
========================= */

const searchContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const searchInputStyle = {
  width: "220px",
  height: "34px",
  padding: "0 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  outline: "none",
  fontSize: "12px",
  color: "#374151",
  backgroundColor: "#ffffff",
};

const countBadgeStyle = {
  backgroundColor: "#f1f5f9",
  color: "#64748b",
  padding: "5px 9px",
  borderRadius: "5px",
  fontSize: "11px",
  fontWeight: "500",
};


/* =========================
   TABLE
========================= */

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle = {
  textAlign: "left",
  padding: "12px 20px",
  fontSize: "11px",
  fontWeight: "600",
  color: "#6b7280",
  backgroundColor: "#f9fafb",
  borderBottom: "1px solid #e5e7eb",
};

const tdStyle = {
  padding: "13px 20px",
  fontSize: "13px",
  color: "#374151",
  borderBottom: "1px solid #f1f5f9",
};


/* =========================
   EMPTY STATE
========================= */

const emptyStyle = {
  textAlign: "center",
  padding: "45px 20px",
};

const emptyTitleStyle = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#374151",
};

const emptyTextStyle = {
  marginTop: "5px",
  fontSize: "12px",
  color: "#9ca3af",
};


/* =========================
   ACTIONS
========================= */

const editButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#4b6985",
  cursor: "pointer",
  marginRight: "10px",
  fontSize: "15px",
  textDecoration: "none",
};

const deleteButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#dc2626",
  cursor: "pointer",
  fontSize: "15px",
};


/* =========================
   PAGINATION
========================= */

const paginationStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
  padding: "16px 20px",
  borderTop: "1px solid #e5e7eb",
};

const pageNumbersStyle = {
  display: "flex",
  gap: "5px",
};

const paginationButtonStyle = {
  border: "1px solid #d1d5db",
  backgroundColor: "#ffffff",
  color: "#374151",
  borderRadius: "5px",
  padding: "6px 11px",
  fontSize: "11px",
};

const pageNumberStyle = {
  border: "1px solid #d1d5db",
  borderRadius: "5px",
  width: "30px",
  height: "30px",
  fontSize: "11px",
  cursor: "pointer",
};
