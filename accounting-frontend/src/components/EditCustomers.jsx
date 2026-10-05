import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  BsArrowLeft,
  BsPerson,
  BsTelephone,
  BsEnvelope,
  BsGeoAlt,
  BsCheck2,
} from "react-icons/bs";

export const EditCustomers = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    customerType:""
  });

  const [loading, setLoading] = useState(true);

  // GET CUSTOMER
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/customers/${id}`
        );

        setCustomer(response.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        alert("Failed to load customer");
        navigate("/customers");
      }
    };

    fetchCustomer();
  }, [id, navigate]);

  // HANDLE INPUT
  const handleChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  // UPDATE CUSTOMER
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:5000/customers/${id}`,
        customer
      );

      alert("Customer updated successfully");

      navigate("/customers");
    } catch (error) {
      console.log(error);
      alert("Failed to update customer");
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <p style={{ color: "#64748b" }}>
          Loading customer...
        </p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>

      {/* TOP BAR */}
      <div style={topBarStyle}>
        <button
          onClick={() => navigate("/customers")}
          style={backButtonStyle}
        >
          <BsArrowLeft size={16} />
          Back to Customers
        </button>
      </div>

      {/* PAGE HEADER */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Edit Customer</h1>

          <p style={subtitleStyle}>
            Update the customer's information and details.
          </p>
        </div>
      </div>

      {/* FORM */}
      <Form onSubmit={handleSubmit}>

        <div style={formLayout}>

          {/* LEFT CARD */}
          <div style={mainCardStyle}>

            <div style={cardHeaderStyle}>

              <div style={sectionIconStyle}>
                <BsPerson size={18} />
              </div>

              <div>
                <h3 style={cardTitle}>
                  Customer Information
                </h3>

                <p style={cardSubtitle}>
                  Update the basic details of your customer.
                </p>
              </div>

            </div>

            <div style={cardBodyStyle}>

              {/* CUSTOMER NAME */}
              <Form.Group>

                <Form.Label style={labelStyle}>
                  Customer Name
                  <span style={requiredStyle}>*</span>
                </Form.Label>

                <Form.Control
                  type="text"
                  name="name"
                  placeholder="e.g. Mohammed Ali"
                  value={customer.name}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />

                <div style={fieldHelp}>
                  Enter the full name of the customer.
                </div>

              </Form.Group>


              {/* PHONE */}
              <div style={{ marginTop: "28px" }}>

                <Form.Label style={labelStyle}>
                  Phone Number
                  <span style={requiredStyle}>*</span>
                </Form.Label>

                <div style={inputWithIcon}>

                  <BsTelephone
                    size={15}
                    color="#8b95a1"
                  />

                  <Form.Control
                    type="tel"
                    name="phone"
                    placeholder="e.g. 9876543210"
                    value={customer.phone}
                    onChange={handleChange}
                    required
                    style={iconInputStyle}
                  />

                </div>

                <div style={fieldHelp}>
                  Enter a valid phone number for customer communication.
                </div>

              </div>


              {/* EMAIL */}
              <div style={{ marginTop: "28px" }}>

                <Form.Label style={labelStyle}>
                  Email Address
                </Form.Label>

                <div style={inputWithIcon}>

                  <BsEnvelope
                    size={15}
                    color="#8b95a1"
                  />

                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="e.g. customer@example.com"
                    value={customer.email}
                    onChange={handleChange}
                    style={iconInputStyle}
                  />

                </div>

                <div style={fieldHelp}>
                  Email is optional but useful for invoices and communication.
                </div>

              </div>

<Form.Group>
  <Form.Label style={labelStyle}>
    Customer Type
  </Form.Label>

  <Form.Select
    name="customerType"
    value={customer.customerType}
    onChange={handleChange}
    style={inputStyle}
  >
    {/* <option value=""> Select Type</option> */}
    <option value="Regular Customer">Regular Customer</option>
    <option value="Wholesale Customer">Wholesale Customer</option>
    <option value="Business Customer">Business Customer</option>
    {/* <option value="VIP Customer">VIP Customer</option> */}
    <option value="Credit Customer">Credit Customer</option>
  </Form.Select>
</Form.Group>
              {/* ADDRESS */}
              <div style={{ marginTop: "28px" }}>

                <Form.Label style={labelStyle}>
                  Address
                </Form.Label>

                <div style={textareaWrapper}>

                  <BsGeoAlt
                    size={15}
                    color="#8b95a1"
                    style={{
                      marginTop: "3px",
                      flexShrink: 0,
                    }}
                  />

                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="address"
                    placeholder="Enter customer address"
                    value={customer.address}
                    onChange={handleChange}
                    style={textareaStyle}
                  />

                </div>

                <div style={fieldHelp}>
                  Update the customer's residential or business address.
                </div>

              </div>

            </div>
          </div>


          {/* RIGHT COLUMN */}
          <div style={rightColumn}>

            {/* PREVIEW */}
            <div style={sideCard}>

              <div style={sideCardHeader}>

                <h3 style={sideTitle}>
                  Customer Preview
                </h3>

                <p style={sideSubtitle}>
                  Preview the updated customer information.
                </p>

              </div>

              <div style={customerPreview}>

                {/* AVATAR */}
                <div style={previewAvatar}>
                  <BsPerson size={32} />
                </div>

                {/* NAME */}
                <div style={previewName}>
                  {customer.name || "Customer Name"}
                </div>

                {/* PHONE */}
                <div style={previewPhone}>
                  <BsTelephone size={12} />
                  {customer.phone || "Phone Number"}
                </div>

                {/* EMAIL */}
                {customer.email ? (
                  <div style={previewDetail}>
                    <BsEnvelope size={12} />
                    {customer.email}
                  </div>
                ) : (
                  <div style={previewPlaceholder}>
                    Email address
                  </div>
                )}

                {/* ADDRESS */}
                {customer.address ? (
                  <div style={previewAddress}>
                    <BsGeoAlt size={12} />
                    <span>{customer.address}</span>
                  </div>
                ) : (
                  <div style={previewPlaceholder}>
                    Customer address
                  </div>
                )}

              </div>

            </div>


            {/* GUIDELINES */}
            <div style={sideCard}>

              <div style={sideCardHeader}>
                <h3 style={sideTitle}>
                  Customer Guidelines
                </h3>
              </div>

              <div style={guidelines}>

                <div style={guidelineItem}>
                  <span style={bullet}>✓</span>
                  Keep customer information accurate
                </div>

                <div style={guidelineItem}>
                  <span style={bullet}>✓</span>
                  Verify the phone number
                </div>

                <div style={guidelineItem}>
                  <span style={bullet}>✓</span>
                  Keep email information updated
                </div>

                <div style={guidelineItem}>
                  <span style={bullet}>✓</span>
                  Update the address when necessary
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* BOTTOM ACTION BAR */}
        <div style={bottomBar}>

          <div style={bottomInfo}>

            <strong style={{ color: "#374151" }}>
              Ready to update?
            </strong>

            <span>
              Review the customer details before saving.
            </span>

          </div>

          <div style={buttonGroup}>

            <Button
              type="button"
              onClick={() => navigate("/customers")}
              style={cancelButton}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              style={saveButton}
            >
              <BsCheck2 size={17} />
              Update Customer
            </Button>

          </div>

        </div>

      </Form>

    </div>
  );
};


/* =========================================================
   PAGE
========================================================= */

const pageStyle = {
  width: "100%",
  minHeight: "100vh",
  padding: "24px 30px 30px",
  backgroundColor: "#f5f7fa",
  boxSizing: "border-box",
};


/* =========================================================
   TOP BAR
========================================================= */

const topBarStyle = {
  marginBottom: "18px",
};

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


/* =========================================================
   HEADER
========================================================= */

const headerStyle = {
  marginBottom: "26px",
};

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


/* =========================================================
   FORM LAYOUT
========================================================= */

const formLayout = {
  width: "100%",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 360px",
  gap: "24px",
  alignItems: "stretch",
};


/* =========================================================
   MAIN CARD
========================================================= */

const mainCardStyle = {
  height: "100%",
  minHeight: "560px",
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


/* =========================================================
   FORM FIELDS
========================================================= */

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


/* =========================================================
   INPUT WITH ICON
========================================================= */

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
  fontSize: "13px",
};


/* =========================================================
   TEXTAREA
========================================================= */

const textareaWrapper = {
  display: "flex",
  alignItems: "flex-start",
  gap: "9px",
  padding: "11px 12px",
  border: "1px solid #d5dbe1",
  borderRadius: "6px",
  backgroundColor: "#ffffff",
};

const textareaStyle = {
  border: "none",
  boxShadow: "none",
  padding: 0,
  fontSize: "13px",
  resize: "none",
};


/* =========================================================
   RIGHT COLUMN
========================================================= */

const rightColumn = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
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


/* =========================================================
   CUSTOMER PREVIEW
========================================================= */

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
  wordBreak: "break-word",
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


/* =========================================================
   GUIDELINES
========================================================= */

const guidelines = {
  padding: "20px 21px",
};

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


/* =========================================================
   BOTTOM ACTION BAR
========================================================= */

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
