import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  BsGrid,
  BsTags,
  BsBoxSeam,
  BsBagCheck,
  BsPeople,
  BsTruck,
  BsCashStack,
  BsGear,
  BsBoxArrowRight,
  BsReceipt,
  BsArrowReturnLeft,
  BsFileEarmarkText,
  BsBuilding,
} from "react-icons/bs";


export const Sidebar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const businessMenuItems = [
    { name: "Dashboard", path: "/", icon: <BsGrid /> },
    { name: "Products", path: "/products", icon: <BsBoxSeam /> },
    { name: "Categories", path: "/categories", icon: <BsTags /> },
    { name: "Customers", path: "/customers", icon: <BsPeople /> },
    { name: "Sales", path: "/invoices", icon: <BsReceipt /> },
    { name: "Quotations", path: "/quotations", icon: <BsFileEarmarkText /> },
    { name: "Sales Returns", path: "/sales-returns", icon: <BsArrowReturnLeft /> },
    { name: "Expenses", path: "/expenses", icon: <BsCashStack /> },
    { name: "Purchases", path: "/purchases", icon: <BsBagCheck /> },
    { name: "Purchase Returns", path: "/purchase-returns", icon: <BsArrowReturnLeft /> },
    { name: "Suppliers", path: "/suppliers", icon: <BsTruck /> },
  ];

  const adminMenuItems = [
    {
      name: "Manage Businesses",
      path: "/admin/businesses",
      icon: <BsBuilding />,
    },
  ];
const menuItems =
  role === "admin"
    ? [...businessMenuItems, ...adminMenuItems]
    : businessMenuItems;
    
  const displayName =
    role === "admin"
      ? user?.username || "Super Admin"
      : user?.businessName || "Business";

  const displayRole =
    role === "admin"
      ? "Super Admin"
      : user?.ownerName || "Business Account";

  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside style={sidebarStyle}>
      <style>{`
        .sb-link:not(.active):hover {
          background-color: rgba(255, 255, 255, 0.06) !important;
          color: #ffffff !important;
        }

        .sb-settings:not(.active):hover {
          background-color: rgba(255, 255, 255, 0.06) !important;
          color: #ffffff !important;
        }

        .sb-logout:hover {
          color: #ffffff !important;
          background-color: rgba(255,255,255,0.08) !important;
        }

        .sb-nav::-webkit-scrollbar {
          width: 6px;
        }

        .sb-nav::-webkit-scrollbar-thumb {
          background: #243449;
          border-radius: 3px;
        }
      `}</style>

      {/* Brand */}
      <div style={brandStyle}>
        <div>
          <div style={brandName}>ShopLedger</div>
          <div style={brandSubtitle}>Business Management</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sb-nav" style={navStyle}>
        <div style={menuContainer}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className="sb-link"
              style={({ isActive }) => ({
                ...linkStyle,
                ...(isActive ? activeLinkStyle : {}),
              })}
            >
              <span style={iconStyle}>{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div style={bottomSection}>
        {role === "business" && (
          <NavLink
            to="/settings"
            className="sb-settings"
            style={({ isActive }) => ({
              ...linkStyle,
              ...(isActive ? activeLinkStyle : {}),
            })}
          >
            <span style={iconStyle}>
              <BsGear />
            </span>
            <span>Settings</span>
          </NavLink>
        )}

        {/* Profile */}
        <div style={profileStyle}>
          <div style={avatarStyle}>{avatarLetter}</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={profileName}>{displayName}</div>
            <div style={profileRole}>{displayRole}</div>
          </div>

          <button
            type="button"
            className="sb-logout"
            title="Logout"
            onClick={handleLogout}
            style={{
              ...logoutStyle,
              background: "transparent",
              border: "none",
            }}
          >
            <BsBoxArrowRight size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

/* ---------------- STYLES ---------------- */

const FONT =
  "Inter, 'Segoe UI', system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif";

/* Sidebar */

const sidebarStyle = {
  width: "250px",
  height: "100vh",
  backgroundColor: "#0f1b2d",
  color: "#ffffff",
  padding: "18px 12px 12px",
  position: "fixed",
  left: 0,
  top: 0,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  borderRight: "1px solid #1c2b40",
  fontFamily: FONT,
  zIndex: 100,
};

/* Brand */

const brandStyle = {
  display: "flex",
  alignItems: "center",
  gap: "11px",
  padding: "4px 10px 18px",
  borderBottom: "1px solid #1c2b40",
};

const logoStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "8px",
  backgroundColor: "#2b6cb0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "17px",
  fontWeight: "700",
};

const brandName = {
  fontSize: "15px",
  fontWeight: "600",
  lineHeight: "18px",
  letterSpacing: "0.1px",
};

const brandSubtitle = {
  fontSize: "11px",
  color: "#8fa0b5",
  marginTop: "2px",
};

/* Navigation */

const navStyle = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  paddingBottom: "8px",
};

const menuContainer = {
  paddingTop: "16px",
};

const linkStyle = {
  display: "flex",
  alignItems: "center",
  gap: "11px",
  width: "100%",
  boxSizing: "border-box",
  color: "#aab6c6",
  textDecoration: "none",
  padding: "9px 12px",
  marginBottom: "2px",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: "500",
  transition:
    "background-color 0.15s ease, color 0.15s ease",
};

const activeLinkStyle = {
  backgroundColor: "#1b2f4a",
  color: "#ffffff",
  fontWeight: "600",
  boxShadow: "inset 3px 0 0 #5aa0e6",
};

const iconStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "20px",
  fontSize: "16px",
};

/* Bottom */

const bottomSection = {
  borderTop: "1px solid #1c2b40",
  paddingTop: "10px",
};

const profileStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 8px 4px",
  marginTop: "4px",
};

const avatarStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  backgroundColor: "#2b6cb0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "13px",
  fontWeight: "600",
};

const profileName = {
  fontSize: "13px",
  color: "#e5e7eb",
  fontWeight: "600",
};

const profileRole = {
  fontSize: "11px",
  color: "#8fa0b5",
  marginTop: "1px",
};

const logoutStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "30px",
  height: "30px",
  borderRadius: "6px",
  color: "#8fa0b5",
  cursor: "pointer",
  transition:
    "background-color 0.15s ease, color 0.15s ease",
};