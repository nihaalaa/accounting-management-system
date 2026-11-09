import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export const ManageBusinesses = () => {
  const { token } = useAuth();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBusinesses = async () => {
    const navigate = useNavigate();
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/admin/businesses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBusinesses(response.data.businesses || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load businesses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      setError("");

      await axios.patch(
        `${API_URL}/admin/businesses/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchBusinesses();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to update business status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getActions = (business) => {
    switch (business.status) {
      case "Pending":
        return (
          <>
            <button
              onClick={() => updateStatus(business._id, "Approved")}
              disabled={updatingId === business._id}
              style={buttonStyle("#198754")}
            >
              Approve
            </button>

            <button
              onClick={() => updateStatus(business._id, "Rejected")}
              disabled={updatingId === business._id}
              style={buttonStyle("#dc3545")}
            >
              Reject
            </button>
          </>
        );

      case "Approved":
        return (
          <>
            <button
              onClick={() => updateStatus(business._id, "Blocked")}
              disabled={updatingId === business._id}
              style={buttonStyle("#dc3545")}
            >
              Block
            </button>

            <button
              onClick={() => updateStatus(business._id, "Rejected")}
              disabled={updatingId === business._id}
              style={buttonStyle("#6c757d")}
            >
              Reject
            </button>
          </>
        );

      case "Blocked":
      case "Rejected":
        return (
          <button
            onClick={() => updateStatus(business._id, "Approved")}
            disabled={updatingId === business._id}
            style={buttonStyle("#198754")}
          >
            Approve
          </button>
        );

      default:
        return null;
    }
  };

  const filteredBusinesses = businesses.filter((business) => {
    const searchText = search.toLowerCase();

    return (
      business.businessName?.toLowerCase().includes(searchText) ||
      business.ownerName?.toLowerCase().includes(searchText) ||
      business.email?.toLowerCase().includes(searchText) ||
      business.phone?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0 }}>Manage Businesses</h2>
          <p style={{ color: "#6c757d", marginTop: 6 }}>
            View and manage registered businesses
          </p>
        </div>

        <button onClick={fetchBusinesses} style={refreshStyle}>
          Refresh
        </button>
      </div>

      <div style={summaryStyle}>
        <div style={cardStyle}>
          <h3>{businesses.length}</h3>
          <p>Total Businesses</p>
        </div>

        <div style={cardStyle}>
          <h3>
            {businesses.filter((b) => b.status === "Pending").length}
          </h3>
          <p>Pending</p>
        </div>

        <div style={cardStyle}>
          <h3>
            {businesses.filter((b) => b.status === "Approved").length}
          </h3>
          <p>Approved</p>
        </div>

        <div style={cardStyle}>
          <h3>
            {businesses.filter((b) => b.status === "Blocked").length}
          </h3>
          <p>Blocked</p>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search business, owner, email or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={searchStyle}
      />

      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}

      <div style={tableContainerStyle}>
        {loading ? (
          <p style={{ padding: 20 }}>Loading businesses...</p>
        ) : filteredBusinesses.length === 0 ? (
          <p style={{ padding: 20 }}>No businesses found.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Business</th>
                <th style={thStyle}>Owner</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBusinesses.map((business) => (
                <tr key={business._id}>
                  <td style={tdStyle}>
                    {business.businessName}
                  </td>

                  <td style={tdStyle}>
                    {business.ownerName}
                  </td>

                  <td style={tdStyle}>
                    {business.email}
                  </td>

                  <td style={tdStyle}>
                    {business.phone}
                  </td>

                  <td style={tdStyle}>
                    <span style={statusStyle(business.status)}>
                      {business.status}
                    </span>
                  </td>

                  <td style={tdStyle}>
<div style={actionsStyle}>
  <button
    onClick={() =>
      navigate(`/admin/businesses/${business._id}`)
    }
    style={buttonStyle("#3b6b9d")}
  >
    View
  </button>

  {updatingId === business._id
    ? "Updating..."
    : getActions(business)}
</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const buttonStyle = (background) => ({
  background,
  color: "white",
  border: "none",
  padding: "7px 12px",
  borderRadius: 5,
  cursor: "pointer",
});

const pageStyle = {
  padding: 25,
  background: "#f7f9fb",
  minHeight: "100vh",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 25,
};

const refreshStyle = {
  background: "#3b6b9d",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: 6,
  cursor: "pointer",
};

const summaryStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 15,
  marginBottom: 25,
};

const cardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const searchStyle = {
  width: "100%",
  padding: 12,
  border: "1px solid #ddd",
  borderRadius: 6,
  marginBottom: 20,
  boxSizing: "border-box",
};

const tableContainerStyle = {
  background: "white",
  borderRadius: 8,
  overflowX: "auto",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 850,
};

const thStyle = {
  padding: 14,
  textAlign: "left",
  background: "#eef2f6",
  borderBottom: "1px solid #ddd",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: 14,
  borderBottom: "1px solid #eee",
};

const actionsStyle = {
  display: "flex",
  gap: 7,
  flexWrap: "wrap",
};

const errorStyle = {
  background: "#f8d7da",
  color: "#842029",
  padding: 12,
  borderRadius: 6,
  marginBottom: 15,
};

const statusStyle = (status) => ({
  padding: "5px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  background:
    status === "Approved" ? "#d1e7dd" :
    status === "Pending" ? "#fff3cd" :
    status === "Blocked" ? "#f8d7da" :
    "#e2e3e5",
  color:
    status === "Approved" ? "#0f5132" :
    status === "Pending" ? "#664d03" :
    status === "Blocked" ? "#842029" :
    "#41464b",
});
