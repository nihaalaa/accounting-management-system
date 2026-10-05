import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Table } from "react-bootstrap";
import axios from "axios";
import {
  BsPlus,
  BsPencil,
  BsTrash,
  BsPerson,
  BsSearch,
  BsPeople,
} from "react-icons/bs";

export const Customers = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  // =========================
  // CUSTOMER TYPE FILTER
  // =========================

  const [customerType, setCustomerType] = useState("All");

  // =========================
  // PAGINATION
  // =========================

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // =========================
  // FETCH CUSTOMERS
  // =========================

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/customers"
      );

      setCustomers(response.data);
    } catch (error) {
      console.log("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // =========================
  // DELETE CUSTOMER
  // =========================

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this customer?"
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/customers/${id}`
      );

      fetchCustomers();
    } catch (error) {
      console.log("Error deleting customer:", error);
    }
  };

  // =========================
  // EDIT CUSTOMER
  // =========================

  const handleEdit = (id) => {
    navigate(`/customers/edit/${id}`);
  };

  // =========================
  // SEARCH + CUSTOMER TYPE FILTER
  // =========================

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesType =
      customerType === "All" ||
      customer.customerType === customerType;

    return matchesSearch && matchesType;
  });

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.ceil(
    filteredCustomers.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const currentCustomers = filteredCustomers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div style={pageStyle}>

      {/* =========================
          HEADER
      ========================= */}

      <div style={headerStyle}>

        <div>
          <h2 style={titleStyle}>
            Customers
          </h2>

          <p style={subtitleStyle}>
            Manage your customers and their information.
          </p>
        </div>

        <Link
          to="/customers/add"
          style={{ textDecoration: "none" }}
        >
          <Button style={addButtonStyle}>
            <BsPlus size={18} />
            Add Customer
          </Button>
        </Link>

      </div>


      {/* =========================
          TABLE CARD
      ========================= */}

      <Card style={cardStyle}>

        {/* Card Header */}

        <div style={cardHeaderStyle}>

          <div>
            <h5 style={cardTitle}>
              Customer List
            </h5>

            <p style={cardSubtitle}>
              View and manage your customers
            </p>
          </div>


          {/* =========================
              SEARCH + TYPE FILTER
          ========================= */}

          <div style={searchContainer}>

            {/* Customer Type Filter */}

            <select
              value={customerType}
              onChange={(e) => {
                setCustomerType(e.target.value);
                setCurrentPage(1);
              }}
              style={typeFilterStyle}
            >
              <option value="All">
                All Types
              </option>

              <option value="Regular Customer">
                Regular Customer
              </option>

              <option value="Wholesale Customer">
                Wholesale Customer
              </option>

              <option value="Business Customer">
                Business Customer
              </option>

              <option value="Credit Customer">
                Credit Customer
              </option>
            </select>


            {/* Search */}

            <div style={searchBox}>

              <BsSearch
                size={15}
                color="#7b8794"
              />

              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={searchInput}
              />

            </div>


            {/* Count */}

            <span style={countBadge}>
              {filteredCustomers.length}{" "}
              {filteredCustomers.length === 1
                ? "Customer"
                : "Customers"}
            </span>

          </div>

        </div>


        {/* =========================
            TABLE
        ========================= */}

        <Card.Body style={{ padding: 0 }}>

          <Table
            hover
            style={tableStyle}
          >

            <thead>

              <tr>

                <th
                  style={{
                    ...headerCell,
                    width: "5%",
                  }}
                >
                  #
                </th>

                <th
                  style={{
                    ...headerCell,
                    width: "19%",
                  }}
                >
                  CUSTOMER
                </th>

                <th
                  style={{
                    ...headerCell,
                    width: "15%",
                  }}
                >
                  PHONE
                </th>

                <th
                  style={{
                    ...headerCell,
                    width: "19%",
                  }}
                >
                  EMAIL
                </th>

                <th
                  style={{
                    ...headerCell,
                    width: "14%",
                  }}
                >
                  CUSTOMER TYPE
                </th>

                <th
                  style={{
                    ...headerCell,
                    width: "18%",
                  }}
                >
                  ADDRESS
                </th>

                <th
                  style={{
                    ...headerCell,
                    width: "10%",
                    textAlign: "center",
                  }}
                >
                  ACTION
                </th>

              </tr>

            </thead>


            <tbody>

              {currentCustomers.length > 0 ? (

                currentCustomers.map(
                  (customer, index) => (

                    <tr key={customer._id}>

                      {/* Number */}

                      <td style={numberCell}>
                        {startIndex + index + 1}
                      </td>


                      {/* Customer */}

                      <td style={normalCell}>

                        <div style={customerContainer}>

                          <div style={customerIcon}>
                            <BsPerson size={17} />
                          </div>

                          <div>

                            <div style={customerNameText}>
                              {customer.name}
                            </div>

                            <div style={customerSubText}>
                              Customer
                            </div>

                          </div>

                        </div>

                      </td>


                      {/* Phone */}

                      <td style={normalCell}>
                        {customer.phone || "-"}
                      </td>


                      {/* Email */}

                      <td style={normalCell}>
                        {customer.email || "-"}
                      </td>


                      {/* Customer Type */}

                      <td style={normalCell}>

                        <span style={customerTypeBadge}>
                          {customer.customerType || "-"}
                        </span>

                      </td>


                      {/* Address */}

                      <td style={addressCell}>
                        {customer.address || "-"}
                      </td>


                      {/* Actions */}

                      <td
                        style={{
                          ...normalCell,
                          textAlign: "center",
                        }}
                      >

                        <div style={actionContainer}>

                          <Button
                            variant="light"
                            size="sm"
                            onClick={() =>
                              handleEdit(
                                customer._id
                              )
                            }
                            style={editButtonStyle}
                          >
                            <BsPencil size={13} />
                            Edit
                          </Button>


                          <Button
                            variant="light"
                            size="sm"
                            onClick={() =>
                              handleDelete(
                                customer._id
                              )
                            }
                            style={deleteButtonStyle}
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
                    colSpan="7"
                    style={emptyStyle}
                  >

                    <div style={emptyIcon}>
                      <BsPeople size={25} />
                    </div>

                    <div style={emptyTitle}>

                      {search || customerType !== "All"
                        ? "No customers found"
                        : "No customers available"}

                    </div>

                    <div style={emptyText}>

                      {search
                        ? `No customers match "${search}".`
                        : customerType !== "All"
                        ? `No ${customerType} found.`
                        : "Add your first customer to get started."}

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </Table>

        </Card.Body>


        {/* =========================
            PAGINATION
        ========================= */}

        {totalPages > 1 && (

          <div style={paginationStyle}>

            {/* Previous */}

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
                    ? 0.5
                    : 1,

                cursor:
                  currentPage === 1
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              Previous
            </button>


            {/* Page Numbers */}

            <div style={pageNumbersStyle}>

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) => index + 1
              ).map((page) => (

                <button
                  key={page}
                  onClick={() =>
                    setCurrentPage(page)
                  }
                  style={{
                    ...pageNumberStyle,

                    backgroundColor:
                      currentPage === page
                        ? "#3f607d"
                        : "#ffffff",

                    color:
                      currentPage === page
                        ? "#ffffff"
                        : "#374151",
                  }}
                >
                  {page}
                </button>

              ))}

            </div>


            {/* Next */}

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

        )}

      </Card>

    </div>
  );
};

export default Customers;


/* =====================================================
   PAGE
===================================================== */

const pageStyle = {
  padding: "30px 35px",
  minHeight: "100vh",
  width: "100%",
  boxSizing: "border-box",
  backgroundColor: "#f8fafc",
};


/* =====================================================
   HEADER
===================================================== */

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
};

const titleStyle = {
  margin: 0,
  fontSize: "23px",
  fontWeight: "600",
  color: "#1f2937",
};

const subtitleStyle = {
  margin: "5px 0 0",
  fontSize: "12px",
  color: "#7b8794",
};


/* =====================================================
   ADD BUTTON
===================================================== */

const addButtonStyle = {
  border: "none",
  backgroundColor: "#3f607d",
  color: "#ffffff",
  borderRadius: "6px",
  padding: "10px 17px",
  minHeight: "40px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "7px",
  fontSize: "13px",
  fontWeight: "500",
};


/* =====================================================
   TABLE CARD
===================================================== */

const cardStyle = {
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: "9px",
  overflow: "hidden",
  backgroundColor: "#ffffff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

const cardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "17px 20px",
  borderBottom: "1px solid #e5e7eb",
};

const cardTitle = {
  margin: 0,
  fontSize: "15px",
  fontWeight: "600",
  color: "#111827",
};

const cardSubtitle = {
  margin: "4px 0 0",
  fontSize: "11px",
  color: "#9ca3af",
};


/* =====================================================
   SEARCH + FILTER
===================================================== */

const searchContainer = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const typeFilterStyle = {
  height: "34px",
  minWidth: "150px",
  padding: "0 10px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  outline: "none",
  backgroundColor: "#ffffff",
  color: "#374151",
  fontSize: "12px",
  cursor: "pointer",
};

const searchBox = {
  width: "220px",
  height: "34px",
  padding: "0 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  backgroundColor: "#ffffff",
};

const searchInput = {
  border: "none",
  outline: "none",
  width: "100%",
  fontSize: "12px",
  color: "#374151",
  backgroundColor: "transparent",
};

const countBadge = {
  backgroundColor: "#f1f5f9",
  color: "#64748b",
  padding: "5px 9px",
  borderRadius: "5px",
  fontSize: "11px",
  fontWeight: "500",
};


/* =====================================================
   TABLE
===================================================== */

const tableStyle = {
  width: "100%",
  marginBottom: 0,
  verticalAlign: "middle",
  tableLayout: "fixed",
};

const headerCell = {
  backgroundColor: "#f9fafb",
  color: "#6b7280",
  fontSize: "10px",
  fontWeight: "600",
  padding: "12px 18px",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
};

const normalCell = {
  padding: "12px 18px",
  verticalAlign: "middle",
  borderBottom: "1px solid #f1f5f9",
  fontSize: "12px",
  color: "#4b5563",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const addressCell = {
  ...normalCell,
};

const numberCell = {
  ...normalCell,
  color: "#9ca3af",
};


/* =====================================================
   CUSTOMER
===================================================== */

const customerContainer = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  minWidth: 0,
};

const customerIcon = {
  width: "35px",
  height: "35px",
  minWidth: "35px",
  borderRadius: "8px",
  backgroundColor: "#edf3f7",
  color: "#3f607d",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const customerNameText = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#2f4050",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const customerSubText = {
  fontSize: "10px",
  color: "#9aa4ad",
  marginTop: "2px",
};


/* =====================================================
   CUSTOMER TYPE BADGE
===================================================== */

const customerTypeBadge = {
  display: "inline-block",
  padding: "4px 8px",
  borderRadius: "5px",
  backgroundColor: "#edf3f7",
  color: "#3f607d",
  fontSize: "10px",
  fontWeight: "500",
};


/* =====================================================
   ACTION BUTTONS
===================================================== */

const actionContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "6px",
};

const editButtonStyle = {
  border: "1px solid #d1d5db",
  color: "#374151",
  backgroundColor: "#ffffff",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  fontSize: "11px",
};

const deleteButtonStyle = {
  border: "1px solid #fecaca",
  color: "#dc2626",
  backgroundColor: "#ffffff",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  fontSize: "11px",
};


/* =====================================================
   EMPTY STATE
===================================================== */

const emptyStyle = {
  textAlign: "center",
  padding: "55px 20px",
  borderBottom: "none",
};

const emptyIcon = {
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  backgroundColor: "#edf2f6",
  color: "#7890a3",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 12px",
};

const emptyTitle = {
  color: "#4b5966",
  fontSize: "14px",
  fontWeight: "600",
};

const emptyText = {
  color: "#98a2ab",
  fontSize: "12px",
  marginTop: "4px",
};


/* =====================================================
   PAGINATION
===================================================== */

const paginationStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
  padding: "15px 20px",
  borderTop: "1px solid #e6e9ed",
  backgroundColor: "#ffffff",
};

const paginationButtonStyle = {
  border: "1px solid #d1d5db",
  backgroundColor: "#ffffff",
  color: "#374151",
  borderRadius: "5px",
  padding: "6px 11px",
  fontSize: "11px",
  fontWeight: "500",
};

const pageNumbersStyle = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
};

const pageNumberStyle = {
  border: "1px solid #d1d5db",
  borderRadius: "5px",
  width: "30px",
  height: "30px",
  fontSize: "11px",
  cursor: "pointer",
};