import React, { useState } from "react";
import axios from "axios";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  BsArrowLeft,
  BsBuilding,
  BsTelephone,
  BsEnvelope,
  BsGeoAlt,
  BsCheck2,
  BsCreditCard,
  BsFileText,
} from "react-icons/bs";

export const AddSupplier = () => {
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    companyName: "",
    gstNumber: "",
    openingBalance: "0",
    notes: "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSupplier((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    try {
      setSaving(true);


const payload = {
  supplierName: supplier.name.trim(),
  phone: supplier.phone.trim(),
  email: supplier.email.trim(),
  address: supplier.address.trim(),
  companyName: supplier.companyName.trim(),
  gstNumber: supplier.gstNumber.trim(),
  openingBalance: Number(supplier.openingBalance || 0),
  notes: supplier.notes.trim(),
};


      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/suppliers`,
        payload
      );

      alert(response.data.message || "Supplier added successfully");
      navigate("/suppliers");

} catch (error) {
  console.error("Failed to add supplier:", error);
  console.log("Backend error response:", error.response?.data);
  console.log("Status code:", error.response?.status);

  alert(
    error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to add supplier. Check the browser console."
  );
} finally {
  setSaving(false);
}

  };

  return (
    <div style={pageStyle}>
      {/* TOP BAR */}
      <div style={topBarStyle}>
        <button
          type="button"
          onClick={() => navigate("/suppliers")}
          style={backButtonStyle}
        >
          <BsArrowLeft size={16} />
          Back to Suppliers
        </button>
      </div>

      {/* PAGE HEADER */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Add Supplier</h1>
        <p style={subtitleStyle}>
          Add a new supplier to your shop management system.
        </p>
      </div>

      <Form onSubmit={handleSubmit}>
        <div style={formLayout}>
          {/* LEFT CARD */}
          <div style={mainCardStyle}>
            <div style={cardHeaderStyle}>
              <div style={sectionIconStyle}>
                <BsBuilding size={18} />
              </div>

              <div>
                <h3 style={cardTitle}>Supplier Information</h3>
                <p style={cardSubtitle}>
                  Enter the basic details of your supplier.
                </p>
              </div>
            </div>

            <div style={cardBodyStyle}>
              {/* SUPPLIER NAME */}
              <Form.Group>
                <Form.Label style={labelStyle}>
                  Supplier Name
                  <span style={requiredStyle}>*</span>
                </Form.Label>

                <Form.Control
                  type="text"
                  name="name"
                  placeholder="e.g. ABC Suppliers"
                  value={supplier.name}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />

                <div style={fieldHelp}>
                  Enter the full name of the supplier.
                </div>
              </Form.Group>

              {/* PHONE */}
              <div style={fieldSpacing}>
                <Form.Label style={labelStyle}>
                  Phone Number
                  <span style={requiredStyle}>*</span>
                </Form.Label>

                <div style={inputWithIcon}>
                  <BsTelephone size={15} color="#8b95a1" />

                  <Form.Control
                    type="tel"
                    name="phone"
                    placeholder="e.g. 9876543210"
                    value={supplier.phone}
                    onChange={handleChange}
                    required
                    style={iconInputStyle}
                  />
                </div>

                <div style={fieldHelp}>
                  Enter a contact number for supplier communication.
                </div>
              </div>

              {/* EMAIL */}
              <div style={fieldSpacing}>
                <Form.Label style={labelStyle}>Email Address</Form.Label>

                <div style={inputWithIcon}>
                  <BsEnvelope size={15} color="#8b95a1" />

                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="e.g. supplier@example.com"
                    value={supplier.email}
                    onChange={handleChange}
                    style={iconInputStyle}
                  />
                </div>

                <div style={fieldHelp}>
                  Optional. Useful for orders and business communication.
                </div>
              </div>

              {/* COMPANY NAME */}
              <div style={fieldSpacing}>
                <Form.Label style={labelStyle}>Company Name</Form.Label>

                <div style={inputWithIcon}>
                  <BsBuilding size={15} color="#8b95a1" />

                  <Form.Control
                    type="text"
                    name="companyName"
                    placeholder="e.g. ABC Trading Company"
                    value={supplier.companyName}
                    onChange={handleChange}
                    style={iconInputStyle}
                  />
                </div>

                <div style={fieldHelp}>
                  Enter the supplier's business or company name.
                </div>
              </div>

              {/* GST NUMBER */}
              <div style={fieldSpacing}>
                <Form.Label style={labelStyle}>GST Number</Form.Label>

                <Form.Control
                  type="text"
                  name="gstNumber"
                  placeholder="Enter GST identification number"
                  value={supplier.gstNumber}
                  onChange={handleChange}
                  style={inputStyle}
                />

                <div style={fieldHelp}>
                  Optional. Add the supplier's GSTIN if applicable.
                </div>
              </div>

              {/* OPENING BALANCE */}
              <div style={fieldSpacing}>
                <Form.Label style={labelStyle}>Opening Balance (₹)</Form.Label>

                <div style={inputWithIcon}>
                  <BsCreditCard size={15} color="#8b95a1" />

                  <Form.Control
                    type="number"
                    name="openingBalance"
                    placeholder="0.00"
                    value={supplier.openingBalance}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    style={iconInputStyle}
                  />
                </div>

                <div style={fieldHelp}>
                  Enter any existing opening amount, or leave it as zero.
                </div>
              </div>

              {/* ADDRESS */}
              <div style={fieldSpacing}>
                <Form.Label style={labelStyle}>
                  Address
                  <span style={requiredStyle}>*</span>
                </Form.Label>

                <div style={textareaWrapper}>
                  <BsGeoAlt
                    size={15}
                    color="#8b95a1"
                    style={{ marginTop: "3px", flexShrink: 0 }}
                  />

                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="address"
                    placeholder="Enter supplier address"
                    value={supplier.address}
                    onChange={handleChange}
                    required
                    style={textareaStyle}
                  />
                </div>

                <div style={fieldHelp}>
                  Enter the supplier's business or registered address.
                </div>
              </div>

              {/* NOTES */}
              <div style={fieldSpacing}>
                <Form.Label style={labelStyle}>Notes</Form.Label>

                <div style={textareaWrapper}>
                  <BsFileText
                    size={15}
                    color="#8b95a1"
                    style={{ marginTop: "3px", flexShrink: 0 }}
                  />

                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    placeholder="Add any additional information"
                    value={supplier.notes}
                    onChange={handleChange}
                    style={textareaStyle}
                  />
                </div>

                <div style={fieldHelp}>
                  Optional notes about the supplier or business relationship.
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={rightColumn}>
            {/* SUPPLIER PREVIEW */}
            <div style={sideCard}>
              <div style={sideCardHeader}>
                <h3 style={sideTitle}>Supplier Preview</h3>
                <p style={sideSubtitle}>
                  Preview the supplier details before saving.
                </p>
              </div>

              <div style={customerPreview}>
                <div style={previewAvatar}>
                  <BsBuilding size={32} />
                </div>

                <div style={previewName}>
                  {supplier.name || "Supplier Name"}
                </div>

                {supplier.companyName && (
                  <div style={previewDetail}>
                    <BsBuilding size={12} />
                    {supplier.companyName}
                  </div>
                )}

                <div style={previewPhone}>
                  <BsTelephone size={12} />
                  {supplier.phone || "Phone Number"}
                </div>

                {supplier.email ? (
                  <div style={previewDetail}>
                    <BsEnvelope size={12} />
                    <span style={breakWord}>{supplier.email}</span>
                  </div>
                ) : (
                  <div style={previewPlaceholder}>Email address</div>
                )}

                {supplier.address ? (
                  <div style={previewAddress}>
                    <BsGeoAlt size={12} />
                    <span style={breakWord}>{supplier.address}</span>
                  </div>
                ) : (
                  <div style={previewPlaceholder}>Supplier address</div>
                )}

                {supplier.gstNumber && (
                  <div style={previewDetail}>
                    GSTIN: {supplier.gstNumber}
                  </div>
                )}

                <div style={balancePreview}>
                  Opening Balance: ₹
                  {Number(supplier.openingBalance || 0).toLocaleString(
                    "en-IN",
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  )}
                </div>
              </div>
            </div>

            {/* GUIDELINES */}
            <div style={sideCard}>
              <div style={sideCardHeader}>
                <h3 style={sideTitle}>Supplier Guidelines</h3>
              </div>

              <div style={guidelines}>
                <div style={guidelineItem}>
                  <span style={bullet}>✓</span>
                  Supplier name is mandatory
                </div>

                <div style={guidelineItem}>
                  <span style={bullet}>✓</span>
                  Provide a valid phone number
                </div>

                <div style={guidelineItem}>
                  <span style={bullet}>✓</span>
                  Address is mandatory
                </div>

                <div style={guidelineItem}>
                  <span style={bullet}>✓</span>
                  Email and GST number are optional
                </div>

                <div style={guidelineItem}>
                  <span style={bullet}>✓</span>
                  Verify details before saving
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div style={bottomBar}>
          <div style={bottomInfo}>
            <strong style={{ color: "#374151" }}>Ready to add?</strong>
            <span>Review the supplier details before saving.</span>
          </div>

          <div style={buttonGroup}>
            <Button
              type="button"
              onClick={() => navigate("/suppliers")}
              style={cancelButton}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              style={{
                ...saveButton,
                opacity: saving ? 0.7 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
              disabled={saving}
            >
              <BsCheck2 size={17} />
              {saving ? "Saving..." : "Save Supplier"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

/* PAGE */
const pageStyle = {
  width: "100%",
  minHeight: "100vh",
  padding: "24px 30px 30px",
  backgroundColor: "#f5f7fa",
  boxSizing: "border-box",
};

/* TOP BAR */
const topBarStyle = { marginBottom: "18px" };

const backButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#64748b",
  padding: 0,
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "12px",
  cursor: "pointer",
};

/* HEADER */
const headerStyle = { marginBottom: "26px" };

const titleStyle = {
  margin: 0,
  fontSize: "27px",
  fontWeight: "600",
  color: "#17202a",
};

const subtitleStyle = {
  margin: "6px 0 0",
  fontSize: "13px",
  color: "#7b8490",
};

/* FORM LAYOUT */
const formLayout = {
  width: "100%",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 360px",
  gap: "24px",
  alignItems: "stretch",
};

/* MAIN CARD */
const mainCardStyle = {
  height: "100%",
  backgroundColor: "#ffffff",
  border: "1px solid #e1e5ea",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
};

const cardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "21px 26px",
  borderBottom: "1px solid #e6e9ed",
};

const sectionIconStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "8px",
  backgroundColor: "#edf2f6",
  color: "#3f607d",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const cardTitle = {
  margin: 0,
  fontSize: "15px",
  fontWeight: "600",
  color: "#17202a",
};

const cardSubtitle = {
  margin: "4px 0 0",
  fontSize: "11px",
  color: "#9aa1aa",
};

const cardBodyStyle = {
  padding: "30px 28px 35px",
};

/* FORM FIELDS */
const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "12px",
  fontWeight: "600",
  color: "#374151",
};

const requiredStyle = {
  color: "#dc2626",
  marginLeft: "3px",
};

const inputStyle = {
  height: "43px",
  border: "1px solid #d5dbe1",
  borderRadius: "6px",
  fontSize: "13px",
  padding: "0 13px",
  boxShadow: "none",
};

const fieldHelp = {
  marginTop: "7px",
  fontSize: "10px",
  color: "#9ca3af",
};

const fieldSpacing = { marginTop: "28px" };

/* INPUT WITH ICON */
const inputWithIcon = {
  height: "43px",
  display: "flex",
  alignItems: "center",
  gap: "9px",
  padding: "0 12px",
  border: "1px solid #d5dbe1",
  borderRadius: "6px",
  backgroundColor: "#ffffff",
};

const iconInputStyle = {
  border: "none",
  boxShadow: "none",
  padding: 0,
  height: "40px",
  minWidth: 0,
  fontSize: "13px",
};

/* TEXTAREA */
const textareaWrapper = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  border: "1px solid #dce3eb",
  borderRadius: "7px",
  padding: "10px 12px",
  backgroundColor: "#ffffff",
};

const textareaStyle = {
  flex: 1,
  width: "100%",
  minWidth: 0,
  border: "none",
  outline: "none",
  boxShadow: "none",
  resize: "vertical",
  fontSize: "12px",
  color: "#334155",
  padding: 0,
  backgroundColor: "transparent",
};

/* RIGHT COLUMN */
const rightColumn = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  minWidth: 0,
  height: "100%",
};

const sideCard = {
  backgroundColor: "#ffffff",
  border: "1px solid #e1e5ea",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
};

const sideCardHeader = {
  padding: "19px 21px",
  borderBottom: "1px solid #e6e9ed",
};

const sideTitle = {
  margin: 0,
  fontSize: "14px",
  fontWeight: "600",
  color: "#17202a",
};

const sideSubtitle = {
  margin: "5px 0 0",
  fontSize: "10px",
  lineHeight: "1.5",
  color: "#9aa1aa",
};

/* SUPPLIER PREVIEW */
const customerPreview = {
  padding: "30px 20px",
  textAlign: "center",
};

const previewAvatar = {
  width: "75px",
  height: "75px",
  margin: "0 auto",
  borderRadius: "50%",
  backgroundColor: "#edf2f6",
  color: "#3f607d",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const previewName = {
  marginTop: "16px",
  fontSize: "16px",
  fontWeight: "600",
  color: "#374151",
  overflowWrap: "anywhere",
};

const previewPhone = {
  marginTop: "8px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "5px",
  fontSize: "11px",
  color: "#64748b",
};

const previewDetail = {
  marginTop: "8px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "5px",
  fontSize: "10px",
  color: "#7b8490",
  overflowWrap: "anywhere",
};

const previewPlaceholder = {
  marginTop: "8px",
  fontSize: "10px",
  color: "#b0b6bd",
};

const previewAddress = {
  marginTop: "14px",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  gap: "5px",
  fontSize: "10px",
  lineHeight: "1.5",
  color: "#7b8490",
  textAlign: "left",
};

const breakWord = {
  minWidth: 0,
  overflowWrap: "anywhere",
};

const balancePreview = {
  marginTop: "20px",
  padding: "12px 8px",
  backgroundColor: "#f5f7fa",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: "600",
  color: "#3f607d",
};

/* GUIDELINES */
const guidelines = { padding: "20px 21px" };

const guidelineItem = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  marginBottom: "13px",
  fontSize: "11px",
  color: "#6b7280",
};

const bullet = {
  width: "19px",
  height: "19px",
  borderRadius: "50%",
  backgroundColor: "#ecfdf5",
  color: "#047857",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "9px",
  fontWeight: "600",
  flexShrink: 0,
};

/* BOTTOM ACTION BAR */
const bottomBar = {
  width: "100%",
  marginTop: "24px",
  padding: "18px 22px",
  backgroundColor: "#ffffff",
  border: "1px solid #e1e5ea",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "14px",
  boxSizing: "border-box",
};

const bottomInfo = {
  display: "flex",
  flexDirection: "column",
  gap: "3px",
  fontSize: "11px",
  color: "#9ca3af",
};

const buttonGroup = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const cancelButton = {
  backgroundColor: "#ffffff",
  border: "1px solid #d1d5db",
  color: "#374151",
  borderRadius: "6px",
  padding: "9px 18px",
  fontSize: "12px",
};

const saveButton = {
  backgroundColor: "#3f607d",
  border: "none",
  borderRadius: "6px",
  padding: "9px 18px",
  fontSize: "12px",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

export default AddSupplier