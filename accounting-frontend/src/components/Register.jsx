
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Register = () => {
  const navigate = useNavigate();
  const { registerBusiness } = useAuth();

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...businessData } = formData;

      await registerBusiness(businessData);

      setSuccess(
        "Registration successful! Your account is pending Super Admin approval."
      );
      navigate("/login");
      setFormData({
        businessName: "",
        ownerName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 13px",
    border: "1px solid #dce3eb",
    borderRadius: "7px",
    fontSize: "14px",
    boxSizing: "border-box",
    marginTop: "6px",
  };

  const labelStyle = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#344054",
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <div style={logoStyle}>SL</div>

          <h2 style={{ color: "#0f1b2d", margin: "12px 0 5px" }}>
            ShopLedger
          </h2>

          <p style={{ color: "#8492a6", fontSize: "13px" }}>
            Register your business
          </p>
        </div>

        <h3 style={{ fontSize: "19px", color: "#26374a" }}>
          Create an Account
        </h3>

        <p style={{ color: "#8492a6", fontSize: "13px" }}>
          Enter your business details to get started.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Business Name</label>
            <input
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="Enter business name"
              style={inputStyle}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Owner Name</label>
            <input
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="Enter owner's name"
              style={inputStyle}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              style={inputStyle}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              style={inputStyle}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              style={inputStyle}
              minLength={8}
              autoComplete="new-password"
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              style={inputStyle}
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          {success && (
            <div style={successStyle}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!success}
            style={{
              ...submitStyle,
              opacity: loading || success ? 0.7 : 1,
            }}
          >
            {loading ? "Registering..." : "Register Business"}
          </button>
        </form>

        <p style={footerStyle}>
          Already registered?{" "}
          <Link to="/login" style={{ color: "#2b6cb0", fontWeight: "600" }}>
            Sign In
          </Link>
        </p>

        <p style={noteStyle}>
          Your account will be available after Super Admin approval.
        </p>
      </div>
    </div>
  );
};

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#f4f7fb",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "25px 15px",
  boxSizing: "border-box",
};

const cardStyle = {
  width: "100%",
  maxWidth: "470px",
  backgroundColor: "#ffffff",
  padding: "32px",
  borderRadius: "12px",
  boxShadow: "0 5px 25px rgba(15, 27, 45, 0.08)",
  boxSizing: "border-box",
};

const logoStyle = {
  width: "48px",
  height: "48px",
  backgroundColor: "#2b6cb0",
  color: "#ffffff",
  borderRadius: "10px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "0 auto",
  fontWeight: "700",
  fontSize: "18px",
};

const fieldStyle = {
  marginBottom: "15px",
};

const submitStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#3b6b9d",
  color: "#ffffff",
  border: "none",
  borderRadius: "7px",
  fontWeight: "600",
  fontSize: "14px",
  marginTop: "8px",
  cursor: "pointer",
};

const errorStyle = {
  backgroundColor: "#fff0f0",
  color: "#c0392b",
  padding: "10px",
  borderRadius: "6px",
  fontSize: "13px",
  marginBottom: "12px",
};

const successStyle = {
  backgroundColor: "#eaf8ef",
  color: "#207443",
  padding: "10px",
  borderRadius: "6px",
  fontSize: "13px",
  marginBottom: "12px",
};

const footerStyle = {
  textAlign: "center",
  fontSize: "13px",
  color: "#8492a6",
  marginTop: "20px",
};

const noteStyle = {
  textAlign: "center",
  fontSize: "12px",
  color: "#8492a6",
  marginBottom: 0,
};
