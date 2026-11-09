
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export const BusinessDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/admin/businesses/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setBusiness(response.data.business);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Failed to load business details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id, token]);

  const detailRow = (label, value) => (
    <div style={rowStyle}>
      <strong style={{ color: "#495057" }}>{label}</strong>
      <span>{value || "Not provided"}</span>
    </div>
  );

  if (loading) {
    return <div style={pageStyle}>Loading business details...</div>;
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => navigate("/admin/businesses")}>
          Back to Businesses
        </button>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div style={pageStyle}>
      <button
        onClick={() => navigate("/admin/businesses")}
        style={backButton}
      >
        ← Back to Businesses
      </button>

      <div style={cardStyle}>
        <h2 style={{ color: "#3b6b9d", marginBottom: 25 }}>
          Business Details
        </h2>

        {detailRow("Business Name", business.businessName)}
        {detailRow("Owner Name", business.ownerName)}
        {detailRow("Email Address", business.email)}
        {detailRow("Phone Number", business.phone)}

        {detailRow("Account Status", business.status)}

        {detailRow(
          "Registered On",
          business.createdAt
            ? new Date(business.createdAt).toLocaleDateString()
            : "Not available"
        )}

        {detailRow(
          "Last Updated",
          business.updatedAt
            ? new Date(business.updatedAt).toLocaleDateString()
            : "Not available"
        )}
      </div>
    </div>
  );
};

const pageStyle = {
  padding: 25,
  background: "#f7f9fb",
  minHeight: "100vh",
};

const cardStyle = {
  background: "white",
  padding: 25,
  borderRadius: 8,
  marginTop: 20,
  maxWidth: 750,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  padding: "16px 0",
  borderBottom: "1px solid #eee",
};

const backButton = {
  background: "#3b6b9d",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: 6,
  cursor: "pointer",
};
