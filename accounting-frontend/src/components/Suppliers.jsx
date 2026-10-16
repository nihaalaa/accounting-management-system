
import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Table,
  Modal,
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

// Same API URL pattern as the Customers page
const API = `${import.meta.env.VITE_API_URL}/suppliers`;

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
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch suppliers from the backend
  const fetchSuppliers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API);

      // Accept either an array or { suppliers: [...] }
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.suppliers;

      if (!Array.isArray(data)) {
        throw new Error("Invalid supplier data returned by the server.");
      }

      setSuppliers(data);
    } catch (err) {
      setSuppliers([]);

      if (err.response?.status === 404) {
        setError(
          "Supplier API route not found. Add the /suppliers routes to your backend and redeploy it on Render."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch suppliers."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Open Add modal
  const openAddModal = () => {
    setForm({ ...emptyForm });
    setSelectedSupplier(null);
    setModalType("add");
    setError("");
    setShowModal(true);
  };

  // Open View modal
  const openViewModal = (supplier) => {
    setSelectedSupplier(supplier);
    setModalType("view");
    setError("");
    setShowModal(true);
  };

  // Open Edit modal
  const openEditModal = (supplier) => {
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

    setModalType("edit");
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setSelectedSupplier(null);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Add or update supplier
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.supplierName.trim() ||
      !form.phone.trim() ||
      !form.address.trim()
    ) {
      setError("Supplier name, phone number and address are required.");
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
      if (modalType === "edit") {
        await axios.put(`${API}/${selectedSupplier._id}`, payload);
      } else {
        await axios.post(API, payload);
      }

      setShowModal(false);
      setSelectedSupplier(null);
      setForm({ ...emptyForm });

      setSuccess(
        modalType === "edit"
          ? "Supplier updated successfully."
          : "Supplier added successfully."
      );

      await fetchSuppliers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          (err.response?.status === 404
            ? "Supplier API route not found. Check your backend routes and Render deployment."
            : "Failed to save supplier.")
      );
    } finally {
      setSaving(false);
    }
  };

  // Deactivate supplier rather than permanently removing history
  const handleDelete = async (supplier) => {
    const confirmed = window.confirm(
      `Deactivate supplier "${supplier.supplierName}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await axios.delete(`${API}/${supplier._id}`);
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

  // Search suppliers
  const filteredSuppliers = suppliers.filter((supplier) => {
    const term = search.toLowerCase().trim();

    return (
      supplier.supplierName?.toLowerCase().includes(term) ||
      supplier.companyName?.toLowerCase().includes(term) ||
      supplier.phone?.toLowerCase().includes(term) ||
      supplier.email?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(
    filteredSuppliers.length / itemsPerPage
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentSuppliers = filteredSuppliers.slice(
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

  const formatMoney = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>Suppliers</h2>
          <p style={subtitleStyle}>
            Manage your suppliers and their information.
          </p>
        </div>

        <Button style={addButtonStyle} onClick={openAddModal}>
          <BsPlus size={19} />
          Add Supplier
        </Button>
      </div>

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

      {error && !showModal && (
        <div style={errorStyle}>
          {error}
          {error.includes("API route not found") && (
            <div style={{ marginTop: 6 }}>
              Your frontend URL is already pointing to the suppliers
              endpoint. The backend route must also exist and be deployed.
            </div>
          )}
        </div>
      )}

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
                <th style={{ ...headerCell, width: "22%" }}>SUPPLIER</th>
                <th style={{ ...headerCell, width: "15%" }}>PHONE</th>
                <th style={{ ...headerCell, width: "22%" }}>EMAIL</th>
                <th style={{ ...headerCell, width: "20%" }}>ADDRESS</th>
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

                    <td style={normalCell}>{supplier.phone || "-"}</td>
                    <td style={normalCell}>{supplier.email || "-"}</td>
                    <td style={normalCell}>{supplier.address || "-"}</td>

                    <td
                      style={{
                        ...normalCell,
                        textAlign: "center",
                      }}
                    >
                      <div style={actionContainer}>
                        <Button
                          type="button"
                          title="View supplier"
                          size="sm"
                          onClick={() => openViewModal(supplier)}
                          style={viewButtonStyle}
                        >
                          <BsEye size={13} />
                        </Button>

                        <Button
                          type="button"
                          title="Edit supplier"
                          size="sm"
                          onClick={() => openEditModal(supplier)}
                          style={editButtonStyle}
                        >
                          <BsPencil size={13} />
                        </Button>

                        <Button
                          type="button"
                          title="Deactivate supplier"
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
                        style={{ ...cancelButtonStyle, marginTop: 12 }}
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

        {totalPages > 1 && (
          <div style={paginationStyle}>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              style={{
                ...paginationButtonStyle,
                opacity: currentPage === 1 ? 0.5 : 1,
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
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        )}
      </Card>

      {/* ADD / EDIT / VIEW MODAL */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        size="lg"
        backdrop={saving ? "static" : true}
        keyboard={!saving}
      >
        <Form onSubmit={handleSubmit}>
          <Modal.Header
            closeButton={!saving}
            style={modalHeaderStyle}
          >
            <div>
              <Modal.Title style={modalTitleStyle}>
                {modalType === "add"
                  ? "Add New Supplier"
                  : modalType === "edit"
                  ? "Edit Supplier"
                  : "Supplier Details"}
              </Modal.Title>
              <div style={modalSubtitleStyle}>
                {modalType === "view"
                  ? "Supplier contact and account information"
                  : "Fields marked with * are required"}
              </div>
            </div>
          </Modal.Header>

          <Modal.Body style={{ padding: 24 }}>
            {error && <div style={errorStyle}>{error}</div>}

            {modalType === "view" && selectedSupplier ? (
              <>
                <div style={detailBanner}>
                  <div style={detailIcon}>
                    <BsBuilding size={24} />
                  </div>
                  <div>
                    <div style={detailName}>
                      {selectedSupplier.supplierName}
                    </div>
                    <div style={supplierSubText}>
                      {selectedSupplier.companyName || "Supplier"}
                    </div>
                  </div>
                </div>

                <Row className="g-3 mt-1">
                  {[
                    ["Phone Number", selectedSupplier.phone],
                    ["Email Address", selectedSupplier.email],
                    ["Company Name", selectedSupplier.companyName],
                    ["GST Number", selectedSupplier.gstNumber],
                    ["Address", selectedSupplier.address],
                    [
                      "Opening Balance",
                      formatMoney(selectedSupplier.openingBalance),
                    ],
                    ["Notes", selectedSupplier.notes],
                  ].map(([label, value]) => (
                    <Col md={6} key={label}>
                      <div style={detailBox}>
                        <div style={detailLabel}>{label}</div>
                        <div style={detailValue}>{value || "-"}</div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </>
            ) : (
              <Row className="g-3">
                {inputFields.map((field) => (
                  <Col md={6} key={field.name}>
                    <Form.Group controlId={`supplier-${field.name}`}>
                      <Form.Label style={formLabelStyle}>
                        {field.label}
                        {field.required && (
                          <span style={{ color: "#dc2626" }}> *</span>
                        )}
                      </Form.Label>

                      <Form.Control
                        type={field.type || "text"}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required={field.required || false}
                        min={
                          field.name === "openingBalance" ? "0" : undefined
                        }
                        step={
                          field.name === "openingBalance" ? "0.01" : undefined
                        }
                        style={formInputStyle}
                      />
                    </Form.Group>
                  </Col>
                ))}

                <Col md={12}>
                  <Form.Group controlId="supplier-address">
                    <Form.Label style={formLabelStyle}>
                      Address <span style={{ color: "#dc2626" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter complete address"
                      required
                      style={formInputStyle}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group controlId="supplier-notes">
                    <Form.Label style={formLabelStyle}>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Additional information (optional)"
                      style={formInputStyle}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Modal.Body>

          <Modal.Footer style={modalFooterStyle}>
            <Button
              type="button"
              variant="light"
              onClick={closeModal}
              disabled={saving}
              style={cancelButtonStyle}
            >
              {modalType === "view" ? "Close" : "Cancel"}
            </Button>

            {modalType === "view" ? (
              <Button
                type="button"
                style={addButtonStyle}
                onClick={() => openEditModal(selectedSupplier)}
              >
                <BsPencil size={14} /> Edit Supplier
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={saving}
                style={addButtonStyle}
              >
                {saving ? (
                  <>
                    <Spinner size="sm" animation="border" /> Saving...
                  </>
                ) : (
                  <>
                    <BsPlus size={18} />
                    {modalType === "edit"
                      ? "Save Changes"
                      : "Add Supplier"}
                  </>
                )}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Suppliers;

/* PAGE STYLES */

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

const numberCell = { ...normalCell, color: "#9ca3af" };

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

const modalHeaderStyle = {
  padding: "20px 24px",
  borderBottom: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
};

const modalTitleStyle = {
  fontSize: 18,
  fontWeight: 600,
  color: "#26384a",
};

const modalSubtitleStyle = {
  marginTop: 5,
  fontSize: 12,
  color: "#89939e",
};

const modalFooterStyle = {
  padding: "15px 24px",
  borderTop: "1px solid #e5e7eb",
  backgroundColor: "#fafbfc",
};

const formLabelStyle = {
  color: "#4b5563",
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 7,
};

const formInputStyle = {
  border: "1px solid #d7dde4",
  borderRadius: 6,
  fontSize: 13,
  padding: "10px 12px",
  boxShadow: "none",
};

const cancelButtonStyle = {
  border: "1px solid #d1d5db",
  backgroundColor: "#ffffff",
  color: "#4b5563",
  borderRadius: 6,
  padding: "9px 16px",
  fontSize: 12,
};

const detailBanner = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: 18,
  backgroundColor: "#f4f7fa",
  border: "1px solid #e5eaf0",
  borderRadius: 9,
};

const detailIcon = {
  width: 48,
  height: 48,
  borderRadius: 10,
  backgroundColor: "#e4edf5",
  color: "#3f607d",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const detailName = {
  fontSize: 16,
  fontWeight: 600,
  color: "#26384a",
};

const detailBox = {
  padding: "12px 14px",
  border: "1px solid #e5eaf0",
  borderRadius: 7,
  minHeight: 66,
  overflowWrap: "anywhere",
};

const detailLabel = {
  fontSize: 10,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.4px",
  color: "#89939e",
  marginBottom: 7,
};

const detailValue = {
  fontSize: 13,
  color: "#374151",
  whiteSpace: "pre-wrap",
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
