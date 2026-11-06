
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button, Card, Form, Table } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BsArrowLeft,
  BsTrash,
  BsCheck2,
  BsReceipt,
  BsPerson,
  BsCart3,
  BsCalendar3,
  BsFileEarmarkText,
  BsSearch,
} from "react-icons/bs";

const API_URL = import.meta.env.VITE_API_URL;

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const EditQuotation = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [quotationNumber, setQuotationNumber] = useState("");
  const [status, setStatus] = useState("Draft");

  const [date, setDate] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [customerId, setCustomerId] = useState("");

  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [showProductOptions, setShowProductOptions] = useState(false);

  // =====================================================
  // FETCH DATA
  // =====================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          customersResponse,
          productsResponse,
          quotationResponse,
        ] = await Promise.all([
          axios.get(`${API_URL}/customers`),
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/quotations/${id}`),
        ]);

        const quotation = quotationResponse.data;

        if (quotation.status === "Converted") {
          alert("Converted quotations cannot be edited.");
          navigate("/quotations");
          return;
        }

        setCustomers(customersResponse.data || []);
        setProducts(productsResponse.data || []);

        setQuotationNumber(quotation.quotationNumber || "");
        setStatus(quotation.status || "Draft");

        setDate(formatDate(quotation.date));
        setValidUntil(formatDate(quotation.validUntil));

        setCustomerId(
          quotation.customerId?._id ||
          quotation.customerId ||
          ""
        );

        setItems(
          (quotation.items || []).map((item) => ({
            productId: item.productId?._id || item.productId,
            productName: item.productName,
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
            tax: Number(item.tax) || 0,
            total:
              Number(item.quantity) *
              Number(item.price) *
              (1 + Number(item.tax) / 100),
          }))
        );

        setDiscount(Number(quotation.discount) || 0);
        setNotes(quotation.notes || "");
      } catch (error) {
        console.error("Error loading quotation:", error);

        alert(
          error.response?.data?.message ||
            "Failed to load quotation"
        );

        navigate("/quotations");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // =====================================================
  // SELECTED CUSTOMER
  // =====================================================

  const selectedCustomer = customers.find(
    (customer) => customer._id === customerId
  );

  // =====================================================
  // PRODUCTS
  // =====================================================

  const selectedProductData = products.find(
    (product) => product._id === selectedProduct
  );

  const filteredProducts = products.filter((product) =>
    (product.name || "")
      .toLowerCase()
      .includes(productSearch.toLowerCase())
  );

  // =====================================================
  // ADD / UPDATE PRODUCT
  // =====================================================

  const updateProductQuantity = (productId, productQuantity) => {
    const product = products.find(
      (item) => item._id === productId
    );

    const qty = Number(productQuantity);

    if (!product || !Number.isInteger(qty) || qty < 1) {
      return;
    }

    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.productId === productId
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: qty,
                total:
                  qty *
                  item.price *
                  (1 + item.tax / 100),
              }
            : item
        );
      }

      const price = Number(product.sellingPrice) || 0;
      const tax = Number(product.tax) || 0;

      return [
        ...prevItems,
        {
          productId: product._id,
          productName: product.name,
          quantity: qty,
          price,
          tax,
          total: qty * price * (1 + tax / 100),
        },
      ];
    });
  };

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  const handleRemoveItem = (index) => {
    setItems((prevItems) =>
      prevItems.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  // =====================================================
  // CHANGE QUANTITY
  // =====================================================

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity === "") return;

    const qty = Number(newQuantity);

    if (!Number.isInteger(qty) || qty < 1) return;

    setItems((prevItems) =>
      prevItems.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const baseTotal = qty * Number(item.price || 0);
        const tax = Number(item.tax || 0);

        return {
          ...item,
          quantity: qty,
          total: baseTotal + (baseTotal * tax) / 100,
        };
      })
    );
  };

  // =====================================================
  // CALCULATIONS
  // =====================================================

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          Number(item.price || 0) *
            Number(item.quantity || 0),
        0
      ),
    [items]
  );

  const taxAmount = useMemo(
    () =>
      items.reduce((total, item) => {
        const itemSubtotal =
          Number(item.price || 0) *
          Number(item.quantity || 0);

        return (
          total +
          (itemSubtotal * Number(item.tax || 0)) / 100
        );
      }, 0),
    [items]
  );

  const grandTotal = Math.max(
    0,
    subtotal + taxAmount - Number(discount || 0)
  );

  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Please add at least one product");
      return;
    }

    if (Number(discount) < 0) {
      alert("Discount cannot be negative");
      return;
    }

    if (Number(discount) > subtotal + taxAmount) {
      alert("Discount cannot be greater than the quotation total");
      return;
    }

    if (grandTotal <= 0) {
      alert("Quotation total must be greater than zero");
      return;
    }

    if (validUntil && date && validUntil < date) {
      alert("Valid until date cannot be before the quotation date.");
      return;
    }

    try {
      setSaving(true);

      const quotationData = {
        date,
        validUntil: validUntil || null,
        customerId: customerId || null,

        customerName:
          selectedCustomer?.name || "Walk-in Customer",
        customerPhone: selectedCustomer?.phone || "",
        customerAddress: selectedCustomer?.address || "",

        items,

        subtotal: Number(subtotal.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        discount: Number(discount || 0),
        grandTotal: Number(grandTotal.toFixed(2)),

        notes,
      };

      await axios.put(
        `${API_URL}/quotations/${id}`,
        quotationData
      );

      alert("Quotation updated successfully");

      navigate("/quotations");
    } catch (error) {
      console.error(
        "Error updating quotation:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to update quotation"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={loadingContainer}>
          <div style={loadingSpinner}>
            <BsReceipt size={20} />
          </div>

          <div style={loadingTitle}>
            Loading quotation...
          </div>

          <div style={loadingText}>
            Please wait while the quotation is being loaded.
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div style={pageStyle}>
      {/* PAGE HEADER */}

      <div style={pageHeader}>
        <div>
          <button
            type="button"
            onClick={() => navigate("/quotations")}
            style={backButton}
          >
            <BsArrowLeft size={14} />
            Back to Quotations
          </button>

          <h1 style={pageTitle}>Edit Quotation</h1>

          <p style={pageSubtitle}>
            Update quotation details and products.
          </p>
        </div>

        <div style={invoiceBadge}>
          <BsReceipt size={17} />

          <div>
            <div style={invoiceBadgeLabel}>QUOTATION</div>
            <div style={invoiceBadgeNumber}>
              {quotationNumber}
            </div>
          </div>
        </div>
      </div>

      {/* FORM */}

      <Form onSubmit={handleSubmit}>
        <div style={mainLayout}>
          {/* LEFT CONTENT */}

          <div>
            {/* QUOTATION DETAILS */}

            <Card style={cardStyle}>
              <div style={sectionHeader}>
                <div style={sectionIcon}>
                  <BsReceipt size={16} />
                </div>

                <div>
                  <div style={sectionTitle}>
                    Quotation Details
                  </div>

                  <div style={sectionSubtitle}>
                    Basic information for this quotation.
                  </div>
                </div>
              </div>

              <Card.Body style={cardBody}>
                <div style={twoColumn}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>
                      Quotation Number
                    </Form.Label>

                    <Form.Control
                      value={quotationNumber}
                      disabled
                      style={{
                        ...inputStyle,
                        backgroundColor: "#f5f7f9",
                        color: "#7b8490",
                      }}
                    />

                    <div style={helpText}>
                      Quotation number cannot be changed.
                    </div>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label style={labelStyle}>
                      Quotation Status
                    </Form.Label>

                    <Form.Control
                      value={status}
                      disabled
                      style={{
                        ...inputStyle,
                        backgroundColor: "#f5f7f9",
                        color: "#7b8490",
                      }}
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label style={labelStyle}>
                      Quotation Date
                      <span style={required}>*</span>
                    </Form.Label>

                    <div style={inputWithIcon}>
                      <BsCalendar3 style={inputIcon} />

                      <Form.Control
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        style={{
                          ...inputStyle,
                          paddingLeft: "36px",
                        }}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label style={labelStyle}>
                      Valid Until
                    </Form.Label>

                    <div style={inputWithIcon}>
                      <BsCalendar3 style={inputIcon} />

                      <Form.Control
                        type="date"
                        value={validUntil}
                        min={date || undefined}
                        onChange={(e) =>
                          setValidUntil(e.target.value)
                        }
                        style={{
                          ...inputStyle,
                          paddingLeft: "36px",
                        }}
                      />
                    </div>
                  </Form.Group>
                </div>
              </Card.Body>
            </Card>

            {/* CUSTOMER */}

            <Card style={cardStyle}>
              <div style={sectionHeader}>
                <div style={sectionIcon}>
                  <BsPerson size={16} />
                </div>

                <div>
                  <div style={sectionTitle}>
                    Customer Details
                  </div>

                  <div style={sectionSubtitle}>
                    Select the customer for this quotation.
                  </div>
                </div>
              </div>

              <Card.Body style={cardBody}>
                <Form.Group className="mb-3">
                  <Form.Label style={labelStyle}>
                    Select Customer
                  </Form.Label>

                  <Form.Select
                    value={customerId}
                    onChange={(e) =>
                      setCustomerId(e.target.value)
                    }
                    style={inputStyle}
                  >
                    <option value="">Walk-in Customer</option>

                    {customers.map((customer) => (
                      <option
                        key={customer._id}
                        value={customer._id}
                      >
                        {customer.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {selectedCustomer && (
                  <div style={customerPreview}>
                    <div style={customerAvatar}>
                      <BsPerson size={16} />
                    </div>

                    <div style={customerInfo}>
                      <div style={customerName}>
                        {selectedCustomer.name}
                      </div>

                      <div style={customerMeta}>
                        {selectedCustomer.phone && (
                          <span>{selectedCustomer.phone}</span>
                        )}

                        {selectedCustomer.email && (
                          <span>{selectedCustomer.email}</span>
                        )}
                      </div>

                      {selectedCustomer.address && (
                        <div style={customerAddress}>
                          {selectedCustomer.address}
                        </div>
                      )}
                    </div>

                    <span style={selectedBadge}>Selected</span>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* PRODUCTS */}

            <Card style={cardStyle}>
              <div style={sectionHeader}>
                <div style={sectionIcon}>
                  <BsCart3 size={17} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={sectionTitle}>Products</div>

                  <div style={sectionSubtitle}>
                    Add or update products included in this quotation.
                  </div>
                </div>

                <span style={itemsBadge}>
                  {items.length} {items.length === 1 ? "Item" : "Items"}
                </span>
              </div>

              <Card.Body style={cardBody}>
                {/* ADD PRODUCT */}

                <div style={addProductBox}>
                  <div style={addProductTitle}>Add Product</div>

                  <div style={productAddRow}>
                    <Form.Group
                      style={{
                        flex: 1,
                        minWidth: 0,
                        position: "relative",
                      }}
                    >
                      <Form.Label style={labelStyle}>
                        Product
                      </Form.Label>

                      <div style={{ position: "relative" }}>
                        <BsSearch
                          size={15}
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#7b8794",
                            zIndex: 1,
                            pointerEvents: "none",
                          }}
                        />

                        <Form.Control
                          type="text"
                          placeholder="Search products by name..."
                          value={productSearch}
                          onFocus={() =>
                            setShowProductOptions(true)
                          }
                          onChange={(e) => {
                            setProductSearch(e.target.value);
                            setSelectedProduct("");
                            setQuantity(1);
                            setShowProductOptions(true);
                          }}
                          style={{
                            ...inputStyle,
                            paddingLeft: "36px",
                            paddingRight: "12px",
                            height: "42px",
                          }}
                        />
                      </div>

                      {showProductOptions && (
                        <>
                          <div
                            onClick={() =>
                              setShowProductOptions(false)
                            }
                            style={dropdownOverlay}
                          />

                          <div style={productDropdown}>
                            {filteredProducts.length > 0 ? (
                              filteredProducts.map((product) => (
                                <div
                                  key={product._id}
                                  onMouseDown={(e) =>
                                    e.preventDefault()
                                  }
                                  onClick={() => {
                                    const existingItem = items.find(
                                      (item) =>
                                        item.productId === product._id
                                    );

                                    const initialQuantity =
                                      existingItem
                                        ? existingItem.quantity
                                        : 1;

                                    setSelectedProduct(product._id);
                                    setProductSearch(product.name);
                                    setQuantity(initialQuantity);
                                    setShowProductOptions(false);

                                    updateProductQuantity(
                                      product._id,
                                      initialQuantity
                                    );
                                  }}
                                  style={{
                                    ...productOption,
                                    background:
                                      selectedProduct === product._id
                                        ? "#eef4fb"
                                        : "#ffffff",
                                  }}
                                >
                                  <div style={dropdownProductName}>
                                    {product.name}
                                  </div>

                                  <div style={dropdownProductPrice}>
                                    Selling price: ₹
                                    {Number(
                                      product.sellingPrice || 0
                                    ).toFixed(2)}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div style={noProducts}>
                                No matching products found
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </Form.Group>

                    {/* QUANTITY STEPPER */}

                    <Form.Group style={quantityGroup}>
                      <Form.Label style={labelStyle}>
                        Quantity
                      </Form.Label>

                      <div style={quantityStepper}>
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedProduct) return;

                            const nextQuantity = Math.max(
                              1,
                              Number(quantity || 1) - 1
                            );

                            setQuantity(nextQuantity);

                            updateProductQuantity(
                              selectedProduct,
                              nextQuantity
                            );
                          }}
                          disabled={Number(quantity) <= 1}
                          style={stepperButton}
                        >
                          −
                        </button>

                        <Form.Control
                          type="number"
                          min="1"
                          step="1"
                          value={quantity}
                          onChange={(e) => {
                            const value = e.target.value;
                            setQuantity(value);

                            if (
                              selectedProduct &&
                              value !== "" &&
                              Number.isInteger(Number(value)) &&
                              Number(value) >= 1
                            ) {
                              updateProductQuantity(
                                selectedProduct,
                                Number(value)
                              );
                            }
                          }}
                          style={stepperInput}
                        />

                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedProduct) {
                              alert("Please select a product first.");
                              return;
                            }

                            const nextQuantity =
                              Number(quantity || 1) + 1;

                            setQuantity(nextQuantity);

                            updateProductQuantity(
                              selectedProduct,
                              nextQuantity
                            );
                          }}
                          style={stepperButton}
                        >
                          +
                        </button>
                      </div>
                    </Form.Group>
                  </div>

                  {selectedProductData && (
                    <div style={selectedProductPreview}>
                      <div style={selectedProductIcon}>
                        <BsCart3 size={13} />
                      </div>

                      <div>
                        <div style={selectedProductName}>
                          {selectedProductData.name}
                        </div>

                        <div style={selectedProductDetails}>
                          Selling Price: ₹
                          {Number(
                            selectedProductData.sellingPrice || 0
                          ).toFixed(2)}

                          <span style={dot}>•</span>

                          Tax: {selectedProductData.tax || 0}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* STOCK NOTE */}

                <div style={stockNote}>
                  <strong>Note:</strong> Editing a quotation does not
                  reserve or deduct product stock. Stock is adjusted
                  when the quotation is converted into an invoice.
                </div>

                {/* PRODUCT TABLE */}

                {items.length > 0 ? (
                  <div style={tableWrapper}>
                    <Table
                      responsive
                      hover
                      style={tableStyle}
                    >
                      <thead>
                        <tr>
                          <th style={tableHeader}>Product</th>

                          <th
                            style={{
                              ...tableHeader,
                              width: "100px",
                            }}
                          >
                            Quantity
                          </th>

                          <th
                            style={{
                              ...tableHeader,
                              textAlign: "right",
                            }}
                          >
                            Price
                          </th>

                          <th
                            style={{
                              ...tableHeader,
                              textAlign: "center",
                            }}
                          >
                            Tax
                          </th>

                          <th
                            style={{
                              ...tableHeader,
                              textAlign: "right",
                            }}
                          >
                            Total
                          </th>

                          <th
                            style={{
                              ...tableHeader,
                              width: "55px",
                              textAlign: "center",
                            }}
                          >
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {items.map((item, index) => (
                          <tr key={`${item.productId}-${index}`}>
                            <td style={tableCell}>
                              <div style={productCell}>
                                <div style={productIcon}>
                                  <BsCart3 size={12} />
                                </div>

                                <div>
                                  <div style={productName}>
                                    {item.productName}
                                  </div>

                                  <div style={productSub}>
                                    Product
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td style={tableCell}>
                              <Form.Control
                                type="number"
                                min="1"
                                step="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    index,
                                    e.target.value
                                  )
                                }
                                onBlur={(e) => {
                                  const qty = Number(e.target.value);

                                  if (
                                    !Number.isInteger(qty) ||
                                    qty < 1
                                  ) {
                                    handleQuantityChange(index, 1);
                                  }
                                }}
                                style={quantityInput}
                              />
                            </td>

                            <td
                              style={{
                                ...tableCell,
                                textAlign: "right",
                              }}
                            >
                              ₹{Number(item.price || 0).toFixed(2)}
                            </td>

                            <td
                              style={{
                                ...tableCell,
                                textAlign: "center",
                              }}
                            >
                              <span style={taxBadge}>
                                {item.tax || 0}%
                              </span>
                            </td>

                            <td
                              style={{
                                ...tableCell,
                                textAlign: "right",
                              }}
                            >
                              <strong style={itemTotal}>
                                ₹
                                {(
                                  Number(item.quantity) *
                                  Number(item.price) *
                                  (1 + Number(item.tax) / 100)
                                ).toFixed(2)}
                              </strong>
                            </td>

                            <td
                              style={{
                                ...tableCell,
                                textAlign: "center",
                              }}
                            >
                              <Button
                                type="button"
                                onClick={() =>
                                  handleRemoveItem(index)
                                }
                                style={deleteButton}
                              >
                                <BsTrash size={13} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div style={emptyProducts}>
                    <div style={emptyIcon}>
                      <BsCart3 size={19} />
                    </div>

                    <div style={emptyTitle}>
                      No products added
                    </div>

                    <div style={emptyText}>
                      Select a product above to add it to this quotation.
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* NOTES */}

            <Card style={cardStyle}>
              <div style={sectionHeader}>
                <div style={sectionIcon}>
                  <BsFileEarmarkText size={16} />
                </div>

                <div>
                  <div style={sectionTitle}>Notes</div>

                  <div style={sectionSubtitle}>
                    Add additional information if required.
                  </div>
                </div>
              </div>

              <Card.Body style={cardBody}>
                <Form.Group>
                  <Form.Label style={labelStyle}>
                    Additional Notes
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes for this quotation..."
                    style={textareaStyle}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </div>

          {/* RIGHT SUMMARY */}

          <div style={sideColumn}>
            {/* QUOTATION SUMMARY */}

            <Card style={sideCard}>
              <div style={sideHeader}>
                <div>
                  <div style={sideTitle}>
                    Quotation Summary
                  </div>

                  <div style={sideSubtitle}>
                    Updated automatically
                  </div>
                </div>

                <div style={sideIcon}>
                  <BsReceipt size={14} />
                </div>
              </div>

              <div style={summaryBody}>
                <div style={invoiceSummaryTop}>
                  <div style={summaryInvoiceIcon}>
                    <BsReceipt size={20} />
                  </div>

                  <div>
                    <div style={summaryInvoiceNumber}>
                      {quotationNumber}
                    </div>

                    <div style={summaryInvoiceDate}>
                      {date || "No date selected"}
                    </div>
                  </div>
                </div>

                <div style={summaryCustomer}>
                  <div style={summarySmallLabel}>
                    CUSTOMER
                  </div>

                  <div style={summaryCustomerName}>
                    {selectedCustomer?.name || "Walk-in Customer"}
                  </div>
                </div>

                <div style={summaryRow}>
                  <span>Subtotal</span>
                  <strong>₹{subtotal.toFixed(2)}</strong>
                </div>

                <div style={summaryRow}>
                  <span>Tax</span>
                  <strong>₹{taxAmount.toFixed(2)}</strong>
                </div>

                <div style={summaryRow}>
                  <span>Discount</span>

                  <span style={discountValue}>
                    - ₹{Number(discount || 0).toFixed(2)}
                  </span>
                </div>

                <div style={summaryDivider}></div>

                <div style={grandTotalRow}>
                  <span>Grand Total</span>
                  <strong>₹{grandTotal.toFixed(2)}</strong>
                </div>
              </div>
            </Card>

            {/* DISCOUNT */}

            <Card style={sideCard}>
              <div style={sideHeader}>
                <div>
                  <div style={sideTitle}>Discount</div>

                  <div style={sideSubtitle}>
                    Adjust quotation discount
                  </div>
                </div>
              </div>

              <div style={paymentSummaryBody}>
                <Form.Group>
                  <Form.Label style={labelStyle}>
                    Discount Amount (₹)
                  </Form.Label>

                  <div style={discountInputWrapper}>
                    <span style={currencySymbol}>₹</span>

                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(e.target.value)
                      }
                      style={discountInput}
                    />
                  </div>
                </Form.Group>
              </div>
            </Card>

            {/* CUSTOMER */}

            <Card style={sideCard}>
              <div style={sideHeader}>
                <div>
                  <div style={sideTitle}>Customer</div>

                  <div style={sideSubtitle}>
                    Selected customer
                  </div>
                </div>

                <div style={sideIcon}>
                  <BsPerson size={14} />
                </div>
              </div>

              <div style={sideCustomerBody}>
                <div style={sideCustomerAvatar}>
                  <BsPerson size={16} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={sideCustomerName}>
                    {selectedCustomer?.name || "Walk-in Customer"}
                  </div>

                  <div style={sideCustomerPhone}>
                    {selectedCustomer?.phone || "No phone number"}
                  </div>
                </div>
              </div>
            </Card>

            {/* CHECKLIST */}

            <Card style={sideCard}>
              <div style={sideHeader}>
                <div>
                  <div style={sideTitle}>
                    Before Updating
                  </div>

                  <div style={sideSubtitle}>
                    Quick checklist
                  </div>
                </div>
              </div>

              <div style={checklistBody}>
                <div style={checkItem}>
                  <span style={checkCircle}>
                    <BsCheck2 size={10} />
                  </span>
                  Check customer information
                </div>

                <div style={checkItem}>
                  <span style={checkCircle}>
                    <BsCheck2 size={10} />
                  </span>
                  Verify product quantities
                </div>

                <div style={checkItem}>
                  <span style={checkCircle}>
                    <BsCheck2 size={10} />
                  </span>
                  Review discount and tax
                </div>

                <div
                  style={{
                    ...checkItem,
                    marginBottom: 0,
                  }}
                >
                  <span style={checkCircle}>
                    <BsCheck2 size={10} />
                  </span>
                  Confirm quotation validity
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}

        <div style={bottomBar}>
          <div>
            <div style={bottomTitle}>Edit Quotation</div>

            <div style={bottomText}>
              Save your changes to update this quotation.
            </div>
          </div>

          <div style={actionButtons}>
            <Button
              type="button"
              onClick={() => navigate("/quotations")}
              style={cancelButton}
            >
              <BsArrowLeft size={14} />
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving}
              style={{
                ...updateButton,
                opacity: saving ? 0.7 : 1,
              }}
            >
              <BsCheck2 size={15} />

              {saving ? "Updating..." : "Update Quotation"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

// =========================================================
// PAGE
// =========================================================

const pageStyle = {
  width: "100%",
  minHeight: "100vh",
  padding: "24px 30px 35px",
  backgroundColor: "#f8fafb",
  boxSizing: "border-box",
};

// HEADER

const pageHeader = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "20px",
  marginBottom: "22px",
};

const backButton = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  border: "none",
  backgroundColor: "transparent",
  padding: 0,
  marginBottom: "9px",
  color: "#6b7280",
  fontSize: "11px",
  cursor: "pointer",
};

const pageTitle = {
  margin: 0,
  fontSize: "23px",
  fontWeight: "600",
  color: "#26313d",
  letterSpacing: "-0.2px",
};

const pageSubtitle = {
  margin: "5px 0 0",
  fontSize: "10px",
  color: "#929aa3",
};

const invoiceBadge = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  padding: "9px 12px",
  backgroundColor: "#ffffff",
  border: "1px solid #e0e5e9",
  borderRadius: "7px",
  color: "#4b6985",
};

const invoiceBadgeLabel = {
  fontSize: "7px",
  fontWeight: "700",
  color: "#9aa1aa",
  letterSpacing: "0.8px",
};

const invoiceBadgeNumber = {
  marginTop: "2px",
  fontSize: "11px",
  fontWeight: "600",
  color: "#374151",
};

// LAYOUT

const mainLayout = {
  width: "100%",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 300px",
  gap: "20px",
  alignItems: "start",
};

// CARDS

const cardStyle = {
  width: "100%",
  marginBottom: "18px",
  border: "1px solid #e1e5e9",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.025)",
};

const sectionHeader = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "14px 18px",
  borderBottom: "1px solid #e8ebee",
};

const sectionIcon = {
  width: "32px",
  height: "32px",
  borderRadius: "6px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const sectionTitle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#303b47",
};

const sectionSubtitle = {
  marginTop: "2px",
  fontSize: "9px",
  color: "#9aa1aa",
};

const cardBody = {
  padding: "19px",
};

// FORM

const twoColumn = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "17px",
};

const labelStyle = {
  display: "block",
  fontSize: "9px",
  fontWeight: "600",
  color: "#4b5563",
  marginBottom: "6px",
};

const required = {
  color: "#dc3545",
  marginLeft: "3px",
};

const inputStyle = {
  height: "38px",
  border: "1px solid #d5dbe1",
  borderRadius: "5px",
  fontSize: "10px",
  color: "#374151",
  boxShadow: "none",
};

const helpText = {
  marginTop: "4px",
  fontSize: "8px",
  color: "#a0a7af",
};

const inputWithIcon = {
  position: "relative",
};

const inputIcon = {
  position: "absolute",
  left: "12px",
  top: "12px",
  color: "#8d98a3",
  zIndex: 2,
};

// CUSTOMER

const customerPreview = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "11px 13px",
  border: "1px solid #dfe5ea",
  borderRadius: "6px",
  backgroundColor: "#f8fafb",
};

const customerAvatar = {
  width: "33px",
  height: "33px",
  borderRadius: "6px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const customerInfo = {
  flex: 1,
  minWidth: 0,
};

const customerName = {
  fontSize: "10px",
  fontWeight: "600",
  color: "#374151",
};

const customerMeta = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "2px",
  fontSize: "8px",
  color: "#7b8490",
};

const customerAddress = {
  marginTop: "2px",
  fontSize: "8px",
  color: "#9aa1aa",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const selectedBadge = {
  padding: "3px 6px",
  borderRadius: "4px",
  backgroundColor: "#ecfdf5",
  color: "#047857",
  fontSize: "7px",
  fontWeight: "600",
};

// PRODUCTS

const itemsBadge = {
  padding: "4px 7px",
  borderRadius: "4px",
  backgroundColor: "#f1f4f6",
  color: "#6b7280",
  fontSize: "8px",
  fontWeight: "600",
};

const addProductBox = {
  padding: "13px",
  border: "1px solid #e1e6ea",
  borderRadius: "6px",
  backgroundColor: "#fafbfc",
  marginBottom: "16px",
};

const addProductTitle = {
  fontSize: "9px",
  fontWeight: "600",
  color: "#4b5563",
  marginBottom: "10px",
};

const productAddRow = {
  display: "flex",
  alignItems: "flex-end",
  gap: "10px",
};

const quantityGroup = {
  width: "145px",
  flexShrink: 0,
};

const quantityStepper = {
  display: "flex",
  alignItems: "center",
  height: "42px",
  border: "1px solid #d7dee8",
  borderRadius: "8px",
  overflow: "hidden",
  background: "#ffffff",
};

const stepperButton = {
  width: "38px",
  height: "100%",
  flexShrink: 0,
  border: "none",
  background: "#f5f7fa",
  color: "#344256",
  fontSize: "20px",
  cursor: "pointer",
};

const stepperInput = {
  border: "none",
  borderRadius: 0,
  boxShadow: "none",
  textAlign: "center",
  padding: "0 2px",
  minWidth: 0,
  height: "100%",
  fontSize: "13px",
  fontWeight: 600,
};

const dropdownOverlay = {
  position: "fixed",
  inset: 0,
  zIndex: 10,
};

const productDropdown = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  marginTop: "5px",
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  boxShadow: "0 8px 24px rgba(15, 27, 45, 0.12)",
  maxHeight: "240px",
  overflowY: "auto",
  zIndex: 11,
};

const productOption = {
  padding: "10px 12px",
  cursor: "pointer",
  borderBottom: "1px solid #f1f3f6",
};

const dropdownProductName = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#263548",
};

const dropdownProductPrice = {
  fontSize: "11px",
  color: "#64748b",
  marginTop: "3px",
};

const noProducts = {
  padding: "16px 12px",
  textAlign: "center",
  fontSize: "12px",
  color: "#64748b",
};

const selectedProductPreview = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "10px",
  padding: "8px 10px",
  borderRadius: "5px",
  backgroundColor: "#f1f5f8",
};

const selectedProductIcon = {
  width: "27px",
  height: "27px",
  borderRadius: "5px",
  backgroundColor: "#e5edf3",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const selectedProductName = {
  fontSize: "9px",
  fontWeight: "600",
  color: "#374151",
};

const selectedProductDetails = {
  marginTop: "2px",
  fontSize: "8px",
  color: "#8a97a6",
};

const dot = {
  margin: "0 5px",
  color: "#c2c8ce",
};

const stockNote = {
  marginBottom: "15px",
  padding: "10px 12px",
  border: "1px solid #dbe7f0",
  borderRadius: "5px",
  backgroundColor: "#f3f8fc",
  color: "#64748b",
  fontSize: "9px",
  lineHeight: 1.6,
};

const tableWrapper = {
  width: "100%",
  border: "1px solid #e1e5e9",
  borderRadius: "6px",
  overflow: "hidden",
};

const tableStyle = {
  marginBottom: 0,
  verticalAlign: "middle",
};

const tableHeader = {
  padding: "9px 10px",
  backgroundColor: "#f7f9fa",
  color: "#6b7280",
  fontSize: "8px",
  fontWeight: "600",
  borderBottom: "1px solid #e3e7ea",
  whiteSpace: "nowrap",
};

const tableCell = {
  padding: "9px 10px",
  fontSize: "9px",
  color: "#4b5563",
  borderColor: "#edf0f2",
};

const productCell = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
};

const productIcon = {
  width: "28px",
  height: "28px",
  borderRadius: "5px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const productName = {
  fontSize: "9px",
  fontWeight: "600",
  color: "#374151",
};

const productSub = {
  marginTop: "1px",
  fontSize: "7px",
  color: "#a0a7af",
};

const quantityInput = {
  width: "65px",
  height: "30px",
  borderRadius: "4px",
  border: "1px solid #d5dbe1",
  fontSize: "9px",
  boxShadow: "none",
};

const taxBadge = {
  display: "inline-block",
  padding: "3px 6px",
  borderRadius: "4px",
  backgroundColor: "#f1f4f6",
  color: "#64748b",
  fontSize: "7px",
  fontWeight: "600",
};

const itemTotal = {
  color: "#374151",
  fontSize: "9px",
};

const deleteButton = {
  width: "27px",
  height: "27px",
  padding: 0,
  border: "1px solid #f0d2d2",
  borderRadius: "5px",
  backgroundColor: "#fff8f8",
  color: "#dc3545",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const emptyProducts = {
  minHeight: "125px",
  border: "1px dashed #d5dce2",
  borderRadius: "6px",
  backgroundColor: "#fafbfc",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
};

const emptyIcon = {
  width: "38px",
  height: "38px",
  borderRadius: "7px",
  backgroundColor: "#edf3f7",
  color: "#8a9aaa",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "7px",
};

const emptyTitle = {
  fontSize: "10px",
  fontWeight: "600",
  color: "#6b7280",
};

const emptyText = {
  marginTop: "3px",
  fontSize: "8px",
  color: "#9ca3af",
};

// SIDEBAR

const sideColumn = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const sideCard = {
  backgroundColor: "#ffffff",
  border: "1px solid #e1e5e9",
  borderRadius: "7px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.025)",
};

const sideHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 14px",
  borderBottom: "1px solid #e7eaed",
};

const sideTitle = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#303b47",
};

const sideSubtitle = {
  marginTop: "2px",
  fontSize: "8px",
  color: "#9aa1aa",
};

const sideIcon = {
  width: "27px",
  height: "27px",
  borderRadius: "5px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

// SUMMARY

const summaryBody = {
  padding: "14px",
};

const invoiceSummaryTop = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  paddingBottom: "12px",
  borderBottom: "1px solid #eef1f3",
};

const summaryInvoiceIcon = {
  width: "35px",
  height: "35px",
  borderRadius: "6px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const summaryInvoiceNumber = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#374151",
};

const summaryInvoiceDate = {
  marginTop: "2px",
  fontSize: "8px",
  color: "#9aa1aa",
};

const summaryCustomer = {
  padding: "11px 0",
  borderBottom: "1px solid #eef1f3",
};

const summarySmallLabel = {
  fontSize: "7px",
  fontWeight: "700",
  letterSpacing: "0.7px",
  color: "#9aa1aa",
};

const summaryCustomerName = {
  marginTop: "3px",
  fontSize: "9px",
  fontWeight: "600",
  color: "#374151",
};

const summaryRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "6px 0",
  fontSize: "9px",
  color: "#7b8490",
};

const discountValue = {
  color: "#dc3545",
};

const summaryDivider = {
  height: "1px",
  backgroundColor: "#e9edf0",
  margin: "8px 0",
};

const grandTotalRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: "12px",
  fontWeight: "600",
  color: "#374151",
};

// DISCOUNT

const paymentSummaryBody = {
  padding: "11px 14px 13px",
};

const discountInputWrapper = {
  display: "flex",
  height: "38px",
};

const currencySymbol = {
  width: "31px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f7f9fa",
  border: "1px solid #d5dbe1",
  borderRight: "none",
  borderRadius: "5px 0 0 5px",
  color: "#64748b",
  fontSize: "10px",
};

const discountInput = {
  height: "38px",
  borderRadius: "0 5px 5px 0",
  border: "1px solid #d5dbe1",
  fontSize: "10px",
  boxShadow: "none",
};

// SIDE CUSTOMER

const sideCustomerBody = {
  display: "flex",
  alignItems: "center",
  gap: "9px",
  padding: "13px 14px",
};

const sideCustomerAvatar = {
  width: "34px",
  height: "34px",
  borderRadius: "6px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const sideCustomerName = {
  fontSize: "9px",
  fontWeight: "600",
  color: "#374151",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const sideCustomerPhone = {
  marginTop: "2px",
  fontSize: "8px",
  color: "#9aa1aa",
};

// CHECKLIST

const checklistBody = {
  padding: "13px 14px",
};

const checkItem = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  marginBottom: "9px",
  fontSize: "8px",
  color: "#6b7280",
};

const checkCircle = {
  width: "18px",
  height: "18px",
  borderRadius: "50%",
  backgroundColor: "#ecfdf5",
  color: "#047857",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

// NOTES

const textareaStyle = {
  width: "100%",
  minHeight: "95px",
  border: "1px solid #d5dbe1",
  borderRadius: "5px",
  padding: "9px 11px",
  fontSize: "10px",
  color: "#374151",
  resize: "vertical",
  boxShadow: "none",
};

// BOTTOM ACTION BAR

const bottomBar = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "20px",
  padding: "13px 17px",
  marginBottom: "18px",
  border: "1px solid #e1e5e9",
  borderRadius: "7px",
  backgroundColor: "#ffffff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.025)",
};

const bottomTitle = {
  fontSize: "10px",
  fontWeight: "600",
  color: "#374151",
};

const bottomText = {
  marginTop: "2px",
  fontSize: "8px",
  color: "#9aa1aa",
};

const actionButtons = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
};

const cancelButton = {
  height: "34px",
  padding: "6px 13px",
  border: "1px solid #d2d8de",
  borderRadius: "5px",
  backgroundColor: "#ffffff",
  color: "#59636e",
  fontSize: "9px",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
  gap: "5px",
};

const updateButton = {
  height: "34px",
  padding: "6px 15px",
  border: "none",
  borderRadius: "5px",
  backgroundColor: "#4b6985",
  color: "#ffffff",
  fontSize: "9px",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  boxShadow: "0 2px 5px rgba(75,105,133,0.18)",
};

// LOADING

const loadingContainer = {
  minHeight: "70vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const loadingSpinner = {
  width: "44px",
  height: "44px",
  borderRadius: "7px",
  backgroundColor: "#edf3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "10px",
};

const loadingTitle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#374151",
};

const loadingText = {
  marginTop: "4px",
  fontSize: "9px",
  color: "#9aa1aa",
};

export default EditQuotation;
