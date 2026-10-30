
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BsArrowLeft, BsPencil } from "react-icons/bs";
import { Button } from "react-bootstrap";

export const ViewExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchExpense = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/expenses/${id}`
      );

      setExpense(response.data);
    } catch (error) {
      console.log(error);
      alert("Failed to fetch expense");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpense();
  }, [id]);

  if (loading) return <p>Loading expense...</p>;

  if (!expense) return <p>Expense not found.</p>;

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h2>Expense Details</h2>
          <p>View your business expense information</p>
        </div>

        <button
          style={backButtonStyle}
          onClick={() => navigate("/expenses")}
        >
          <BsArrowLeft /> Back
        </button>
      </div>

      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h3>{expense.name}</h3>

          <button
            style={editButtonStyle}
            onClick={() => navigate(`/expenses/edit/${id}`)}
          >
            <BsPencil /> Edit Expense
          </button>
        </div>

        <div style={detailsGridStyle}>
          <Detail label="Expense Name" value={expense.name} />
          <Detail label="Category" value={expense.category} />
          <Detail
            label="Amount"
            value={`₹${Number(expense.amount).toFixed(2)}`}
          />
          <Detail
            label="Date"
            value={
              expense.date
                ? new Date(expense.date).toLocaleDateString("en-IN")
                : "-"
            }
          />
          <Detail
            label="Payment Method"
            value={expense.paymentMethod}
          />
        </div>

        <div style={descriptionStyle}>
          <h4>Description</h4>
          <p>{expense.description || "No description provided."}</p>
        </div>
                    <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              style={backButtonStyle}
            >
              Close
            </Button>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <p style={labelStyle}>{label}</p>
    <p style={valueStyle}>{value || "-"}</p>
  </div>
);

const pageStyle = {
  padding: "30px",
  backgroundColor: "#f8fafc",
  minHeight: "100vh",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "25px",
};

const cardStyle = {
  backgroundColor: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "25px",
};

const cardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #e5e7eb",
  paddingBottom: "15px",
  marginBottom: "25px",
};

const detailsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "25px",
};

const labelStyle = {
  fontSize: "12px",
  color: "#9ca3af",
  marginBottom: "5px",
};

const valueStyle = {
  fontSize: "14px",
  color: "#374151",
  fontWeight: "500",
};

const descriptionStyle = {
  marginTop: "25px",
  paddingTop: "15px",
  borderTop: "1px solid #e5e7eb",
};

const backButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  padding: "9px 15px",
  backgroundColor: "#fff",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  cursor: "pointer",
};

const editButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  padding: "9px 14px",
  backgroundColor: "#3f607d",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

