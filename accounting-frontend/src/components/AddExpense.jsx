import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import axios from "axios";

export const AddExpense = () => {
  const navigate = useNavigate();

  const [expense, setExpense] = useState({
    name: "",
    category: "",
    amount: "",
    date: "",
    paymentMethod: "",
    description: "",
  });

  const handleChange = (e) => {
    setExpense({
      ...expense,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/expenses", expense);

      alert("Expense added successfully");

      navigate("/expenses");
    } catch (error) {
      console.log(error);
      alert("Failed to add expense");
    }
  };

  return (
    <div style={pageStyle}>

      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>Add Expense</h2>

          <p style={subtitleStyle}>
            Record a new business expense
          </p>
        </div>

        <button
          style={backButtonStyle}
          onClick={() => navigate("/expenses")}
        >
          <BsArrowLeft />
          Back
        </button>
      </div>

      <div style={cardStyle}>

        <form onSubmit={handleSubmit}>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Expense Name</label>

            <input
              type="text"
              name="name"
              value={expense.name}
              onChange={handleChange}
              placeholder="e.g. Electricity Bill"
              style={inputStyle}
              required
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Category</label>

            <select
              name="category"
              value={expense.category}
              onChange={handleChange}
              style={inputStyle}
              required
            >
              <option value="">Select Category</option>
              <option value="Rent">Rent</option>
              <option value="Electricity">Electricity</option>
              <option value="Salary">Salary</option>
              <option value="Transport">Transport</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Office Supplies">
                Office Supplies
              </option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={rowStyle}>

            <div style={halfStyle}>
              <label style={labelStyle}>Amount</label>

              <input
                type="number"
                name="amount"
                value={expense.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                style={inputStyle}
                required
              />
            </div>

            <div style={halfStyle}>
              <label style={labelStyle}>Date</label>

              <input
                type="date"
                name="date"
                value={expense.date}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Payment Method</label>

            <select
              name="paymentMethod"
              value={expense.paymentMethod}
              onChange={handleChange}
              style={inputStyle}
              required
            >
              <option value="">
                Select Payment Method
              </option>

              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">
                Bank Transfer
              </option>
            </select>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Description</label>

            <textarea
              name="description"
              value={expense.description}
              onChange={handleChange}
              placeholder="Add a short description..."
              rows="4"
              style={textareaStyle}
            />
          </div>

          <div style={buttonContainerStyle}>

            <button
              type="button"
              style={cancelButtonStyle}
              onClick={() => navigate("/expenses")}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={saveButtonStyle}
            >
              Save Expense
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};


/* STYLES */

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

const backButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  padding: "9px 15px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  backgroundColor: "#ffffff",
  color: "#374151",
  cursor: "pointer",
  fontSize: "13px",
};

const cardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "25px",
  maxWidth: "700px",
};

const formGroupStyle = {
  marginBottom: "18px",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "500",
  color: "#374151",
  marginBottom: "7px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "13px",
  outline: "none",
  backgroundColor: "#ffffff",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
};

const rowStyle = {
  display: "flex",
  gap: "18px",
  marginBottom: "18px",
};

const halfStyle = {
  flex: 1,
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "25px",
};

const cancelButtonStyle = {
  padding: "10px 18px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  backgroundColor: "#ffffff",
  color: "#374151",
  cursor: "pointer",
  fontSize: "13px",
};

const saveButtonStyle = {
  padding: "10px 18px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#3f607d",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "500",
};