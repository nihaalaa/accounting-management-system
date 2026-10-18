
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Table,
  Offcanvas,
  Form,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import {
  BsPlus,
  BsPencil,
  BsTrash,
  BsBuilding,
  BsSearch,
  BsEye,
  BsX,
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const emptyForm = {
  supplierName: "",
  phone: "",
  email: "",
  address: "",
  companyName: "",
  gstNumber: "",
  openingBalance: "0",
  notes: "",
};

export const Suppliers = () => {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Edit drawer state
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showViewDrawer, setShowViewDrawer] = useState(false);
  // FETCH SUPPLIERS
  const fetchSuppliers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/suppliers`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.suppliers;

      if (!Array.isArray(data)) {
        throw new Error("Invalid supplier data returned by the server.");
      }

      setSuppliers(data);
    } catch (err) {
      setSuppliers([]);

      setError(
        err.response?.status === 404
          ? "Supplier API route not found. Check your backend routes and Render deployment."
          : err.response?.data?.message ||
              err.message ||
              "Failed to fetch suppliers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

// VIEW SUPPLIER: OPEN RIGHT-SIDE DRAWER
const openViewDrawer = (supplier) => {
  if (!supplier?._id) return;

  setSelectedSupplier(supplier);
  setShowViewDrawer(true);
};

  // EDIT SUPPLIER: OPEN RIGHT-SIDE DRAWER
  const openEditDrawer = (supplier) => {
    if (!supplier?._id) return;

    setSelectedSupplier(supplier);

    setForm({
      supplierName: supplier.supplierName || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      companyName: supplier.companyName || "",
      gstNumber: supplier.gstNumber || "",
      openingBalance: String(supplier.openingBalance ?? 0),
      notes: supplier.notes || "",
    });

    setError("");
    setSuccess("");
    setShowEditDrawer(true);
  };

  // CLOSE EDIT DRAWER
  const closeEditDrawer = () => {
    if (saving) return;

    setShowEditDrawer(false);
    setSelectedSupplier(null);
    setForm({ ...emptyForm });
    setError("");
  };

  // HANDLE FORM INPUTS
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // UPDATE SUPPLIER
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedSupplier?._id) {
      setError("Please select a supplier to edit.");
      return;
    }

    if (
      !form.supplierName.trim() ||
      !form.phone.trim() ||
      !form.address.trim()
    ) {
      setError(
        "Supplier name, phone number and address are required."
      );
      return;
    }

    const balance = Number(form.openingBalance);

    if (!Number.isFinite(balance) || balance < 0) {
      setError("Opening balance must be zero or greater.");
      return;
    }

    const payload = {
      supplierName: form.supplierName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      companyName: form.companyName.trim(),
      gstNumber: form.gstNumber.trim().toUpperCase(),
      openingBalance: balance,
      notes: form.notes.trim(),
    };

    setSaving(true);

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/suppliers/${selectedSupplier._id}`,
        payload
      );

      setShowEditDrawer(false);
      setSelectedSupplier(null);
      setForm({ ...emptyForm });

      setSuccess("Supplier updated successfully.");

      await fetchSuppliers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          (err.response?.status === 404
            ? "Supplier update route not found. Check your backend."
            : "Failed to update supplier.")
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE / DEACTIVATE SUPPLIER
  const handleDelete = async (supplier) => {
    const confirmed = window.confirm(
      `Deactivate supplier "${supplier.supplierName}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/suppliers/${supplier._id}`
      );

      setSuccess("Supplier deactivated successfully.");
      await fetchSuppliers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.response?.status === 404
            ? "Supplier delete route not found. Check your backend."
            : "Failed to deactivate supplier.")
      );
    }
  };

// SEARCH SUPPLIERS
const filteredSuppliers = suppliers.filter((supplier) => {
  const term = search.toLowerCase().trim();

  return (
    supplier.supplierName?.toLowerCase().includes(term) ||
    supplier.companyName?.toLowerCase().includes(term) ||
    supplier.phone?.toLowerCase().includes(term) ||
    supplier.email?.toLowerCase().includes(term)
  );
});

// SORT SUPPLIERS: OLDEST FIRST, NEWEST LAST
const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
  return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
});

// PAGINATION
const totalPages = Math.ceil(
  sortedSuppliers.length / itemsPerPage
);

const startIndex = (currentPage - 1) * itemsPerPage;

const currentSuppliers = sortedSuppliers.slice(
  startIndex,
  startIndex + itemsPerPage
);
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // EDIT FORM FIELDS
  const inputFields = [
    {
      name: "supplierName",
      label: "Supplier Name",
      required: true,
      placeholder: "Enter supplier name",
    },
    {
      name: "phone",
      label: "Phone Number",
      required: true,
      placeholder: "Enter phone number",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter email address",
    },
    {
      name: "companyName",
      label: "Company Name",
      placeholder: "Enter company name",
    },
    {
      name: "gstNumber",
      label: "GST Number",
      placeholder: "Enter GST number",
    },
    {
      name: "openingBalance",
      label: "Opening Balance (Rs.)",
      type: "number",
      placeholder: "0",
    },
  ];

  return (
    <div style={pageStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>Suppliers</h2>
          <p style={subtitleStyle}>
            Manage your suppliers and their information.
          </p>
        </div>

        <Button
          style={addButtonStyle}
          onClick={() => navigate("/suppliers/add")}
        >
          <BsPlus size={19} />
          Add Supplier
        </Button>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div style={successStyle}>
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            style={dismissStyle}
            aria-label="Dismiss message"
          >
            <BsX size={18} />
          </button>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && !showEditDrawer && (
        <div style={errorStyle}>
          {error}

          {error.includes("API route not found") && (
            <div style={{ marginTop: 6 }}>
              Make sure the supplier routes exist in your backend
              and have been deployed to Render.
            </div>
          )}
        </div>
      )}

      {/* SUPPLIER TABLE */}
      <Card style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div>
            <h5 style={cardTitle}>Supplier List</h5>
            <p style={cardSubtitle}>
              View and manage your suppliers
            </p>
          </div>

          <div style={searchContainer}>
            <div style={searchBox}>
              <BsSearch size={15} color="#7b8794" />

              <input
                type="text"
                placeholder="Search suppliers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={searchInput}
              />
            </div>

            <span style={countBadge}>
              {filteredSuppliers.length}{" "}
              {filteredSuppliers.length === 1
                ? "Supplier"
                : "Suppliers"}
            </span>
          </div>
        </div>

        <Card.Body style={{ padding: 0 }}>
          <Table hover responsive style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...headerCell, width: "5%" }}>#</th>

                <th style={{ ...headerCell, width: "22%" }}>
                  SUPPLIER
                </th>

                <th style={{ ...headerCell, width: "15%" }}>
                  PHONE
                </th>

                <th style={{ ...headerCell, width: "22%" }}>
                  EMAIL
                </th>

                <th style={{ ...headerCell, width: "20%" }}>
                  ADDRESS
                </th>

                <th
                  style={{
                    ...headerCell,
                    width: "16%",
                    textAlign: "center",
                  }}
                >
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={emptyStyle}>
                    <Spinner
                      animation="border"
                      size="sm"
                      variant="secondary"
                    />

                    <div style={{ marginTop: 10 }}>
                      Loading suppliers...
                    </div>
                  </td>
                </tr>
              ) : currentSuppliers.length > 0 ? (
                currentSuppliers.map((supplier, index) => (
                  <tr key={supplier._id}>
                    <td style={numberCell}>
                      {startIndex + index + 1}
                    </td>

                    <td style={normalCell}>
                      <div style={supplierContainer}>
                        <div style={supplierIcon}>
                          <BsBuilding size={17} />
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div style={supplierNameText}>
                            {supplier.supplierName}
                          </div>

                          <div style={supplierSubText}>
                            {supplier.companyName || "Supplier"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={normalCell}>
                      {supplier.phone || "-"}
                    </td>

                    <td style={normalCell}>
                      {supplier.email || "-"}
                    </td>

                    <td style={normalCell}>
                      {supplier.address || "-"}
                    </td>

                    <td
                      style={{
                        ...normalCell,
                        textAlign: "center",
                      }}
                    >
                      <div style={actionContainer}>
                        {/* VIEW PAGE */}
                        <Button
                          type="button"
                          title="View supplier"
                          aria-label="View supplier"
                          size="sm"
onClick={() => openViewDrawer(supplier)}
                          style={viewButtonStyle}
                        >
                          <BsEye size={13} />
                        </Button>

                        {/* EDIT DRAWER */}
                        <Button
                          type="button"
                          title="Edit supplier"
                          aria-label="Edit supplier"
                          size="sm"
                          onClick={() => openEditDrawer(supplier)}
                          style={editButtonStyle}
                        >
                          <BsPencil size={13} />
                        </Button>

                        {/* DEACTIVATE */}
                        <Button
                          type="button"
                          title="Deactivate supplier"
                          aria-label="Deactivate supplier"
                          size="sm"
                          onClick={() => handleDelete(supplier)}
                          style={deleteButtonStyle}
                        >
                          <BsTrash size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={emptyStyle}>
                    <div style={emptyIcon}>
                      <BsBuilding size={25} />
                    </div>

                    <div style={emptyTitle}>
                      {search
                        ? "No suppliers found"
                        : error
                        ? "Unable to load suppliers"
                        : "No suppliers available"}
                    </div>

                    <div style={emptyText}>
                      {search
                        ? `No suppliers match "${search}".`
                        : error
                        ? "Check the backend API and try again."
                        : "Add your first supplier to get started."}
                    </div>

                    {error && (
                      <Button
                        type="button"
                        variant="light"
                        style={{
                          ...cancelButtonStyle,
                          marginTop: 12,
                        }}
                        onClick={fetchSuppliers}
                      >
                        Retry
                      </Button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div style={paginationStyle}>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              style={{
                ...paginationButtonStyle,
                opacity: currentPage === 1 ? 0.5 : 1,
                cursor:
                  currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>

            <div style={pageNumbersStyle}>
              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  type="button"
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    ...pageNumberStyle,
                    backgroundColor:
                      currentPage === page ? "#3f607d" : "#ffffff",
                    color:
                      currentPage === page ? "#ffffff" : "#374151",
                  }}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              style={{
                ...paginationButtonStyle,
                opacity:
                  currentPage === totalPages ? 0.5 : 1,
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

      {/* EDIT SUPPLIER — RIGHT-SIDE OFFCANVAS */}
<Offcanvas
  show={showEditDrawer}
  onHide={() => {
    if (!saving) closeEditDrawer();
  }}
  placement="end"
  backdrop="static"
  keyboard={!saving}
  scroll={false}
style={{
  width: "calc(100% - 250px)",
  height: "100dvh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  borderLeft: "1px solid #e2e8f0",
  boxShadow: "-8px 0 30px rgba(15, 27, 45, 0.10)",
  marginLeft: "250px",
  boxSizing: "border-box",
}}
      >
        {/* HEADER */}
        <Offcanvas.Header style={drawerHeaderStyle}>
          <div style={drawerHeadingContainer}>
            <div style={drawerHeadingIcon }>
              <BsPencil size={18} />
            </div>

            <div>
              <Offcanvas.Title style={modalTitleStyle}>
                Edit Supplier
              </Offcanvas.Title>

              <div style={modalSubtitleStyle}>
                Update supplier details and account information
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={closeEditDrawer}
            disabled={saving}
            aria-label="Close edit supplier"
            style={drawerCloseButton}
          >
            <BsX size={22} />
          </button>
        </Offcanvas.Header>

        {/* FORM */}
        <Form onSubmit={handleSubmit} style={drawerFormStyle}>
          <Offcanvas.Body style={drawerBodyStyle}>
            {error && (
              <div style={errorStyle}>
                {error}
              </div>
            )}

            {/* SUPPLIER INFORMATION */}
            <div style={formSectionStyle}>
              <div style={sectionHeadingStyle}>
                <div style={sectionTitleStyle}>
                  Supplier Information
                </div>

                <div style={sectionDescriptionStyle}>
                  Basic contact and business details
                </div>
              </div>

              <Row className="g-3">
                {inputFields
                  .filter((field) =>
                    ["supplierName", "phone", "email", "companyName"].includes(
                      field.name
                    )
                  )
                  .map((field) => (
                    <Col xs={12} key={field.name}>
                      <Form.Group controlId={`supplier-${field.name}`}>
                        <Form.Label style={formLabelStyle}>
                          {field.label}
                          {/* {field.required && (
                            <span style={{ color: "#dc2626" }}> *</span>
                          )} */}
                        </Form.Label>

                        <Form.Control
                          type={field.type || "text"}
                          name={field.name}
                          value={form[field.name] ?? ""}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          required={Boolean(field.required)}
                          style={formInputStyle}
                          autoComplete={
                            field.name === "email"
                              ? "email"
                              : field.name === "phone"
                              ? "tel"
                              : "off"
                          }
                        />
                      </Form.Group>
                    </Col>
                  ))}
              </Row>
            </div>

            {/* ADDRESS AND TAX DETAILS */}
            <div style={formSectionStyle}>
              <div style={sectionHeadingStyle}>
                <div style={sectionTitleStyle}>
                  Address & Tax Details
                </div>

                <div style={sectionDescriptionStyle}>
                  Business address and GST registration
                </div>
              </div>

              <Row className="g-3">
                <Col xs={12}>
                  <Form.Group controlId="supplier-address">
                    <Form.Label style={formLabelStyle}>
                      Address 
                      {/* <span style={{ color: "#dc2626" }}>*</span> */}
                    </Form.Label>

                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="address"
                      value={form.address ?? ""}
                      onChange={handleChange}
                      placeholder="Enter complete business address"
                      required
                      style={{
                        ...formInputStyle,
                        resize: "vertical",
                        minHeight: 90,
                      }}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group controlId="supplier-gstNumber">
                    <Form.Label style={formLabelStyle}>
                      GST Number
                    </Form.Label>

                    <Form.Control
                      type="text"
                      name="gstNumber"
                      value={form.gstNumber ?? ""}
                      onChange={handleChange}
                      placeholder="Enter GST identification number"
                      style={{
                        ...formInputStyle,
                        textTransform: "uppercase",
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* ACCOUNT DETAILS */}
            <div style={formSectionStyle}>
              <div style={sectionHeadingStyle}>
                <div style={sectionTitleStyle}>
                  Account Details
                </div>

                <div style={sectionDescriptionStyle}>
                  Opening balance and additional notes
                </div>
              </div>

              <Row className="g-3">
                <Col xs={12}>
                  <Form.Group controlId="supplier-openingBalance">
                    <Form.Label style={formLabelStyle}>
                      Opening Balance (Rs.)
                    </Form.Label>

                    <Form.Control
                      type="number"
                      name="openingBalance"
                      value={form.openingBalance ?? "0"}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      style={formInputStyle}
                    />

                    <Form.Text style={helperTextStyle}>
                      Enter the existing amount payable to this supplier, if any.
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group controlId="supplier-notes">
                    <Form.Label style={formLabelStyle}>
                      Notes <span style={optionalLabelStyle}>(Optional)</span>
                    </Form.Label>

                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="notes"
                      value={form.notes ?? ""}
                      onChange={handleChange}
                      placeholder="Add any additional supplier information..."
                      style={{
                        ...formInputStyle,
                        resize: "vertical",
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Offcanvas.Body>

          {/* FIXED FOOTER */}
          <div style={drawerFooterStyle}>
            <div style={footerHintStyle}>
              {/* <span style={{ color: "#dc2626" }}>*</span> Required fields */}
            </div>

            <div style={footerActionsStyle}>
              <Button
                type="button"
                onClick={closeEditDrawer}
                disabled={saving}
                style={cancelButtonStyle}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
                style={saveButtonStyle}
              >
                {saving ? (
                  <>
                    <Spinner size="sm" animation="border" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <BsPencil size={14} />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Form>
      </Offcanvas>
      
{/* VIEW SUPPLIER — RIGHT-SIDE OFFCANVAS */}
<Offcanvas
  show={showViewDrawer}
  onHide={() => setShowViewDrawer(false)}
  placement="end"
  scroll={false}
  style={{
    width: "calc(100% - 250px)",
    height: "100dvh",
    marginLeft: "250px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxSizing: "border-box",
    borderLeft: "1px solid #e2e8f0",
    boxShadow: "-8px 0 30px rgba(15, 27, 45, 0.10)",
  }}
>
  {/* HEADER */}
  <Offcanvas.Header style={drawerHeaderStyle}>
    <div style={drawerHeadingContainer}>
      <div style={drawerHeadingIcon}>
        <BsBuilding size={18} />
      </div>

      <div>
        <Offcanvas.Title style={modalTitleStyle}>
          Supplier Details
        </Offcanvas.Title>

        <div style={modalSubtitleStyle}>
          View supplier contact and account information
        </div>
      </div>
    </div>

    <button
      type="button"
      onClick={() => setShowViewDrawer(false)}
      aria-label="Close supplier details"
      style={drawerCloseButton}
    >
      <BsX size={22} />
    </button>
  </Offcanvas.Header>

  {/* DETAILS BODY */}
  <Offcanvas.Body style={drawerBodyStyle}>
    {selectedSupplier && (
      <>
        {/* SUPPLIER PROFILE */}
        <div style={viewProfileStyle}>
          <div style={viewProfileIconStyle}>
            <BsBuilding size={25} />
          </div>

          <div style={{ minWidth: 0 }}>
            <h5 style={viewSupplierNameStyle}>
              {selectedSupplier.supplierName || "Unnamed Supplier"}
            </h5>

            <p style={viewCompanyNameStyle}>
              {selectedSupplier.companyName || "Independent Supplier"}
            </p>
          </div>
        </div>

        {/* SUPPLIER INFORMATION */}
        <div style={formSectionStyle}>
          <div style={sectionHeadingStyle}>
            <div style={sectionTitleStyle}>
              Supplier Information
            </div>
            <div style={sectionDescriptionStyle}>
              Basic contact and business details
            </div>
          </div>

          <Row className="g-3">
            <Col xs={12} md={6}>
              <ViewDetail
                label="Supplier Name"
                value={selectedSupplier.supplierName}
              />
            </Col>

            <Col xs={12} md={6}>
              <ViewDetail
                label="Phone Number"
                value={selectedSupplier.phone}
              />
            </Col>

            <Col xs={12} md={6}>
              <ViewDetail
                label="Email Address"
                value={selectedSupplier.email}
              />
            </Col>

            <Col xs={12} md={6}>
              <ViewDetail
                label="Company Name"
                value={selectedSupplier.companyName}
              />
            </Col>
          </Row>
        </div>

        {/* ADDRESS AND TAX */}
        <div style={formSectionStyle}>
          <div style={sectionHeadingStyle}>
            <div style={sectionTitleStyle}>
              Address & Tax Details
            </div>
            <div style={sectionDescriptionStyle}>
              Business address and GST registration
            </div>
          </div>

          <Row className="g-3">
            <Col xs={12}>
              <ViewDetail
                label="Business Address"
                value={selectedSupplier.address}
              />
            </Col>

            <Col xs={12}>
              <ViewDetail
                label="GST Number"
                value={selectedSupplier.gstNumber}
              />
            </Col>
          </Row>
        </div>

        {/* ACCOUNT DETAILS */}
        <div style={formSectionStyle}>
          <div style={sectionHeadingStyle}>
            <div style={sectionTitleStyle}>
              Account Details
            </div>
            <div style={sectionDescriptionStyle}>
              Opening balance and additional notes
            </div>
          </div>

          <Row className="g-3">
            <Col xs={12} md={6}>
              <ViewDetail
                label="Opening Balance"
                value={`Rs. ${Number(
                  selectedSupplier.openingBalance ?? 0
                ).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
              />
            </Col>

            <Col xs={12}>
              <ViewDetail
                label="Notes"
                value={selectedSupplier.notes}
              />
            </Col>
          </Row>
        </div>
      </>
    )}
  </Offcanvas.Body>

  {/* FOOTER */}
  <div style={drawerFooterStyle}>
    <div style={footerActionsStyle}>
      <Button
        type="button"
        onClick={() => setShowViewDrawer(false)}
        style={cancelButtonStyle}
      >
        Close
      </Button>
    </div>
  </div>
</Offcanvas>

    </div>
    
  );
};

const ViewDetail = ({ label, value }) => (
  <div style={viewDetailBoxStyle}>
    <div style={viewDetailLabelStyle}>{label}</div>
    <div style={viewDetailValueStyle}>
      {value !== undefined && value !== null && String(value).trim() !== ""
        ? value
        : "—"}
    </div>
  </div>
);

export default Suppliers;

// =========================
// INLINE STYLES
// =========================

const pageStyle = {
  padding: "30px 35px",
  minHeight: "100vh",
  width: "100%",
  boxSizing: "border-box",
  backgroundColor: "#f8fafc",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 15,
  flexWrap: "wrap",
  marginBottom: 24,
};

const titleStyle = {
  margin: 0,
  fontSize: 23,
  fontWeight: 600,
  color: "#1f2937",
};

const subtitleStyle = {
  margin: "5px 0 0",
  fontSize: 12,
  color: "#7b8794",
};

const addButtonStyle = {
  border: "none",
  backgroundColor: "#3f607d",
  color: "#ffffff",
  borderRadius: 6,
  padding: "10px 17px",
  minHeight: 40,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  fontSize: 13,
  fontWeight: 500,
};

const cardStyle = {
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: 9,
  overflow: "hidden",
  backgroundColor: "#ffffff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

const cardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 14,
  padding: "17px 20px",
  borderBottom: "1px solid #e5e7eb",
};

const cardTitle = {
  margin: 0,
  fontSize: 15,
  fontWeight: 600,
  color: "#111827",
};

const cardSubtitle = {
  margin: "4px 0 0",
  fontSize: 11,
  color: "#9ca3af",
};

const searchContainer = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const searchBox = {
  width: 220,
  maxWidth: "100%",
  height: 34,
  padding: "0 12px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  display: "flex",
  alignItems: "center",
  gap: 8,
  backgroundColor: "#ffffff",
};

const searchInput = {
  border: "none",
  outline: "none",
  width: "100%",
  minWidth: 0,
  fontSize: 12,
  color: "#374151",
  backgroundColor: "transparent",
};

const countBadge = {
  backgroundColor: "#f1f5f9",
  color: "#64748b",
  padding: "5px 9px",
  borderRadius: 5,
  fontSize: 11,
  fontWeight: 500,
};

const tableStyle = {
  width: "100%",
  marginBottom: 0,
  verticalAlign: "middle",
  tableLayout: "fixed",
};

const headerCell = {
  backgroundColor: "#f9fafb",
  color: "#6b7280",
  fontSize: 10,
  fontWeight: 600,
  padding: "12px 14px",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
};

const normalCell = {
  padding: "12px 14px",
  verticalAlign: "middle",
  borderBottom: "1px solid #f1f5f9",
  fontSize: 12,
  color: "#4b5563",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const numberCell = {
  ...normalCell,
  color: "#9ca3af",
};

const supplierContainer = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minWidth: 0,
};

const supplierIcon = {
  width: 35,
  height: 35,
  minWidth: 35,
  borderRadius: 8,
  backgroundColor: "#edf3f7",
  color: "#3f607d",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const supplierNameText = {
  fontSize: 13,
  fontWeight: 600,
  color: "#2f4050",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const supplierSubText = {
  fontSize: 10,
  color: "#9aa4ad",
  marginTop: 2,
};

const actionContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 5,
};

const baseActionButton = {
  width: 30,
  height: 30,
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 5,
};

const viewButtonStyle = {
  ...baseActionButton,
  border: "1px solid #d9e0e6",
  backgroundColor: "#ffffff",
  color: "#4b6985",
};

const editButtonStyle = {
  ...baseActionButton,
  border: "1px solid #d9e0e6",
  backgroundColor: "#ffffff",
  color: "#596675",
};

const deleteButtonStyle = {
  ...baseActionButton,
  border: "1px solid #f1caca",
  backgroundColor: "#ffffff",
  color: "#dc2626",
};

const emptyStyle = {
  textAlign: "center",
  padding: "45px 20px",
  borderBottom: "none",
  color: "#98a2ab",
  fontSize: 12,
};

const emptyIcon = {
  width: 48,
  height: 48,
  borderRadius: 12,
  backgroundColor: "#edf2f6",
  color: "#7890a3",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 12px",
};

const emptyTitle = {
  color: "#4b5966",
  fontSize: 14,
  fontWeight: 600,
};

const emptyText = {
  color: "#98a2ab",
  fontSize: 12,
  marginTop: 4,
};

const paginationStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
  padding: "15px 20px",
  borderTop: "1px solid #e6e9ed",
  backgroundColor: "#ffffff",
};

const paginationButtonStyle = {
  border: "1px solid #d1d5db",
  backgroundColor: "#ffffff",
  color: "#374151",
  borderRadius: 5,
  padding: "6px 11px",
  fontSize: 11,
  fontWeight: 500,
};

const pageNumbersStyle = {
  display: "flex",
  alignItems: "center",
  gap: 5,
};

const pageNumberStyle = {
  border: "1px solid #d1d5db",
  borderRadius: 5,
  width: 30,
  height: 30,
  fontSize: 11,
  cursor: "pointer",
};

const drawerHeaderStyle = {
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "20px 24px",
  borderBottom: "1px solid #e5eaf0",
  backgroundColor: "#ffffff",
};

const drawerHeadingContainer = {
  display: "flex",
  alignItems: "center",
  gap: 13,
  minWidth: 0,
};

const drawerHeadingIcon = {
  width: 42,
  height: 42,
  minWidth: 42,
  borderRadius: 10,
  backgroundColor: "#edf3f8",
  color: "#3f607d",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const drawerCloseButton = {
  width: 34,
  height: 34,
  minWidth: 34,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #e2e8f0",
  borderRadius: 7,
  backgroundColor: "#ffffff",
  color: "#64748b",
  cursor: "pointer",
};

const modalTitleStyle = {
  margin: 0,
  fontSize: 18,
  lineHeight: 1.4,
  fontWeight: 650,
  color: "#1e293b",
};

const modalSubtitleStyle = {
  marginTop: 4,
  fontSize: 11,
  lineHeight: 1.5,
  color: "#8793a2",
};
const drawerFormStyle = {
  display: "flex",
  flexDirection: "column",
  flex: "1 1 auto",
  minHeight: 0,
  overflow: "hidden",
  backgroundColor: "#ffffff",
};

const drawerBodyStyle = {
  flex: "1 1 auto",
  minHeight: 0,
  minWidth: 0,
  overflowY: "auto",
  overflowX: "hidden",
  padding: "22px 24px 28px",
  backgroundColor: "#ffffff",
  boxSizing: "border-box",
};

const formSectionStyle = {
  marginBottom: 27,
};

const sectionHeadingStyle = {
  marginBottom: 17,
  paddingBottom: 11,
  borderBottom: "1px solid #edf0f4",
};

const sectionTitleStyle = {
  fontSize: 13,
  fontWeight: 650,
  color: "#27384a",
  marginBottom: 4,
};

const sectionDescriptionStyle = {
  fontSize: 11,
  color: "#94a0ad",
  lineHeight: 1.5,
};

const formLabelStyle = {
  display: "block",
  color: "#465466",
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 7,
};

const formInputStyle = {
  width: "100%",
  minHeight: 42,
  border: "1px solid #dce3eb",
  borderRadius: 7,
  fontSize: 12,
  padding: "10px 12px",
  color: "#334155",
  backgroundColor: "#ffffff",
  boxShadow: "none",
  transition: "border-color 0.15s ease",
};

const helperTextStyle = {
  display: "block",
  marginTop: 7,
  fontSize: 10,
  lineHeight: 1.6,
  color: "#8995a4",
};

const optionalLabelStyle = {
  fontSize: 10,
  fontWeight: 400,
  color: "#94a3b8",
};

const drawerFooterStyle = {
  flexShrink: 0,
  position: "relative",
  zIndex: 2,
  padding: "15px 24px",
  borderTop: "1px solid #e5eaf0",
  backgroundColor: "#ffffff",
  boxShadow: "0 -4px 12px rgba(15, 27, 45, 0.025)",
};
const footerHintStyle = {
  fontSize: 10,
  color: "#94a3b8",
  marginBottom: 12,
};

const footerActionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 10,
};

const cancelButtonStyle = {
  border: "1px solid #d8e0e8",
  backgroundColor: "#ffffff",
  color: "#475569",
  borderRadius: 7,
  padding: "10px 17px",
  minHeight: 39,
  fontSize: 12,
  fontWeight: 500,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const saveButtonStyle = {
  border: "1px solid #3f607d",
  backgroundColor: "#3f607d",
  color: "#ffffff",
  borderRadius: 7,
  padding: "10px 17px",
  minHeight: 39,
  fontSize: 12,
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};
const successStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  backgroundColor: "#edf7f0",
  color: "#276749",
  border: "1px solid #cce8d5",
  borderRadius: 6,
  padding: "10px 14px",
  fontSize: 12,
  marginBottom: 16,
};

const dismissStyle = {
  border: "none",
  background: "transparent",
  color: "inherit",
  display: "flex",
  cursor: "pointer",
};

const errorStyle = {
  backgroundColor: "#fff1f1",
  color: "#b42318",
  border: "1px solid #f3c7c7",
  borderRadius: 6,
  padding: "10px 12px",
  fontSize: 12,
  marginBottom: 14,
};

const viewProfileStyle = {
  display: "flex",
  alignItems: "center",
  gap: 15,
  padding: "20px",
  marginBottom: 28,
  border: "1px solid #e5eaf0",
  borderRadius: 10,
  backgroundColor: "#f8fafc",
};

const viewProfileIconStyle = {
  width: 54,
  height: 54,
  minWidth: 54,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 12,
  backgroundColor: "#edf3f8",
  color: "#3f607d",
};

const viewSupplierNameStyle = {
  margin: 0,
  fontSize: 17,
  fontWeight: 650,
  color: "#1e293b",
  overflowWrap: "anywhere",
};

const viewCompanyNameStyle = {
  margin: "5px 0 0",
  fontSize: 12,
  color: "#8793a2",
};

const viewDetailBoxStyle = {
  height: "100%",
  minHeight: 70,
  padding: "13px 15px",
  border: "1px solid #e5eaf0",
  borderRadius: 8,
  backgroundColor: "#ffffff",
  overflowWrap: "anywhere",
};

const viewDetailLabelStyle = {
  marginBottom: 7,
  fontSize: 11,
  fontWeight: 600,
  color: "#8793a2",
};

const viewDetailValueStyle = {
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.6,
  color: "#334155",
  whiteSpace: "pre-wrap",
};
