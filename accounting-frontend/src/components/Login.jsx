
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Login = () => {
  const navigate = useNavigate();
  const { loginAdmin, loginBusiness } = useAuth();

  const [loginType, setLoginType] = useState("business");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (loginType === "admin") {
        await loginAdmin(username, password);
        navigate("/admin/businesses");
      } else {
        await loginBusiness(email, password);
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #dce3eb",
    borderRadius: "7px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    marginTop: "7px",
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

          <h2 style={{ margin: "12px 0 5px", color: "#0f1b2d" }}>
            ShopLedger
          </h2>

          <p style={{ color: "#8492a6", fontSize: "13px", margin: 0 }}>
            Business Management System
          </p>
        </div>

        <div style={tabContainer}>
          <button
            type="button"
            onClick={() => {
              setLoginType("business");
              setError("");
            }}
            style={tabStyle(loginType === "business")}
          >
            Business Login
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginType("admin");
              setError("");
            }}
            style={tabStyle(loginType === "admin")}
          >
            Super Admin
          </button>
        </div>

        <h3 style={{ color: "#26374a", fontSize: "19px", marginTop: "25px" }}>
          {loginType === "admin" ? "Admin Login" : "Welcome Back"}
        </h3>

        <p style={{ color: "#8492a6", fontSize: "13px" }}>
          {loginType === "admin"
            ? "Sign in to manage registered businesses."
            : "Sign in to access your business account."}
        </p>

        <form onSubmit={handleSubmit}>
          {loginType === "admin" ? (
            <div style={{ marginBottom: "17px" }}>
              <label style={labelStyle}>Admin Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                autoComplete="username"
                required
                style={inputStyle}
              />
            </div>
          ) : (
            <div style={{ marginBottom: "17px" }}>
              <label style={labelStyle}>Business Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your business email"
                autoComplete="email"
                required
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...submitStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {loginType === "business" && (
          <p style={footerStyle}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#2b6cb0", fontWeight: "600" }}>
              Register your business
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

const pageStyle = {
  minHeight: "100vh",
  width: "100%",
  backgroundColor: "#f4f7fb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  boxSizing: "border-box",
};

const cardStyle = {
  width: "100%",
  maxWidth: "420px",
  backgroundColor: "#ffffff",
  padding: "35px",
  borderRadius: "12px",
  boxShadow: "0 5px 25px rgba(15, 27, 45, 0.08)",
  boxSizing: "border-box",
};

const logoStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "10px",
  backgroundColor: "#2b6cb0",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
  fontWeight: "700",
  fontSize: "18px",
};

const tabContainer = {
  display: "flex",
  backgroundColor: "#f0f3f7",
  padding: "4px",
  borderRadius: "8px",
  gap: "4px",
};

const tabStyle = (active) => ({
  flex: 1,
  padding: "11px 5px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: active ? "#3b6b9d" : "transparent",
  color: active ? "#ffffff" : "#667085",
  fontSize: "13px",
  fontWeight: "600",
  cursor: "pointer",
});

const submitStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#3b6b9d",
  color: "#ffffff",
  border: "none",
  borderRadius: "7px",
  fontSize: "14px",
  fontWeight: "600",
  marginTop: "5px",
};

const errorStyle = {
  backgroundColor: "#fff0f0",
  color: "#c0392b",
  padding: "10px",
  borderRadius: "6px",
  fontSize: "13px",
  marginBottom: "15px",
};

const footerStyle = {
  textAlign: "center",
  fontSize: "13px",
  color: "#8492a6",
  marginTop: "22px",
  marginBottom: 0,
};
