import React from "react";
import axios from "axios";
import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  BsArrowLeft,
  BsCloudUpload,
  BsCheck2,
  BsImage,
  BsX,
} from "react-icons/bs";

export const AddCategory = () => {
  const preset_key = "testimage";
  const cloud_name = "kvti0onx";

  const navigate = useNavigate();

  const [name, setname] = useState("");
  const [image, setimage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/categories",
        {
          name: name,
          image: image,
        }
      );

      alert(response.data);

      setname("");
      setimage("");

      navigate("/categories");
    } catch (error) {
      console.log(error);
    }
  };

  function handleFile(event) {
    const file = event.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", preset_key);

    axios
      .post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        formData
      )
      .then((res) => {
        setimage(res.data.secure_url);
      })
      .catch((err) => console.log(err));
  }

  const removeImage = () => {
    setimage("");
  };

  return (
    <div style={pageStyle}>

      {/* TOP BAR */}
      <div style={topBarStyle}>
        <button
          onClick={() => navigate("/categories")}
          style={backButtonStyle}
        >
          <BsArrowLeft size={16} />
          Back to Categories
        </button>
      </div>

      {/* PAGE HEADER */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Add Category</h1>

          <p style={subtitleStyle}>
            Create a new product category for your shop.
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
                <BsImage size={18} />
              </div>

              <div>
                <h3 style={cardTitle}>
                  Category Information
                </h3>

                <p style={cardSubtitle}>
                  Enter the basic details of your category.
                </p>
              </div>

            </div>

            <div style={cardBodyStyle}>

              {/* CATEGORY NAME */}
              <Form.Group>

                <Form.Label style={labelStyle}>
                  Category Name
                  <span style={requiredStyle}>*</span>
                </Form.Label>

                <Form.Control
                  type="text"
                  placeholder="e.g. Electronics"
                  value={name}
                  onChange={(e) => setname(e.target.value)}
                  required
                  style={inputStyle}
                />

                <div style={fieldHelp}>
                  Use a short and clear name that describes the
                  products in this category.
                </div>

              </Form.Group>

              {/* IMAGE */}
              <div style={{ marginTop: "32px" }}>

                <Form.Label style={labelStyle}>
                  Category Image
                </Form.Label>

                {!image ? (

                  <div style={uploadArea}>

                    <div style={uploadIcon}>
                      <BsCloudUpload size={25} />
                    </div>

                    <div style={uploadTitle}>
                      Upload category image
                    </div>

                    <div style={uploadDescription}>
                      Choose a JPG or PNG image from your computer.
                    </div>

                    <label style={browseButton}>
                      <BsCloudUpload size={14} />
                      Choose Image

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFile}
                        style={{ display: "none" }}
                      />
                    </label>

                  </div>

                ) : (

                  <div style={uploadedBox}>

                    <div style={imagePreviewWrapper}>

                      <img
                        src={image}
                        alt="Category Preview"
                        style={previewImage}
                      />

                    </div>

                    <div style={uploadedDetails}>

                      <div style={uploadedTitle}>
                        Image uploaded successfully
                      </div>

                      <div style={uploadedDescription}>
                        This image will be used for the category.
                      </div>

                      <div style={imageActions}>

                        <label style={changeButton}>
                          Change Image

                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFile}
                            style={{ display: "none" }}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={removeImage}
                          style={removeButton}
                        >
                          <BsX size={15} />
                          Remove
                        </button>

                      </div>

                    </div>

                  </div>

                )}

              </div>

            </div>
          </div>


          {/* RIGHT COLUMN */}
          <div style={rightColumn}>

            {/* PREVIEW CARD */}
            <div style={sideCard}>

              <div style={sideCardHeader}>

                <h3 style={sideTitle}>
                  Category Preview
                </h3>

                <p style={sideSubtitle}>
                  This is how your category information will
                  appear in the system.
                </p>

              </div>

              <div style={previewCard}>

                {image ? (

                  <img
                    src={image}
                    alt="Preview"
                    style={previewCardImage}
                  />

                ) : (

                  <div style={previewPlaceholder}>
                    <BsImage size={25} />
                  </div>

                )}

                <div style={previewCardName}>
                  {name || "Category Name"}
                </div>

                <div style={previewCardSub}>
                  Product Category
                </div>

              </div>

            </div>


            {/* GUIDELINES */}
            <div style={sideCard}>

              <div style={sideCardHeader}>
                <h3 style={sideTitle}>
                  Category Guidelines
                </h3>
              </div>

              <div style={guidelines}>

                <div style={guidelineItem}>
                  <span style={bullet}>✓</span>
                  Use a clear category name
                </div>

                <div style={guidelineItem}>
                  <span style={bullet}>✓</span>
                  Avoid duplicate categories
                </div>

                <div style={guidelineItem}>
                  <span style={bullet}>✓</span>
                  Use a relevant category image
                </div>

                <div style={guidelineItem}>
                  <span style={bullet}>✓</span>
                  Keep category names short
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* BOTTOM ACTION BAR */}
        <div style={bottomBar}>

          <div style={bottomInfo}>

            <strong style={{ color: "#374151" }}>
              Ready to create?
            </strong>

            <span>
              Review the category details before saving.
            </span>

          </div>

          <div style={buttonGroup}>

            <Button
              type="button"
              onClick={() => navigate("/categories")}
              style={cancelButton}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              style={saveButton}
            >
              <BsCheck2 size={17} />
              Save Category
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
   UPLOAD
========================================================= */

const uploadArea = {
  minHeight: "280px",
  border: "1px dashed #cbd5e1",
  borderRadius: "8px",
  backgroundColor: "#f8fafc",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "30px",
  boxSizing: "border-box",
};

const uploadIcon = {
  width: "54px",
  height: "54px",
  borderRadius: "10px",
  backgroundColor: "#edf2f6",
  color: "#3f607d",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "14px",
};

const uploadTitle = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#374151",
};

const uploadDescription = {
  marginTop: "6px",
  marginBottom: "17px",
  fontSize: "11px",
  color: "#9ca3af",
};

const browseButton = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "9px 15px",
  backgroundColor: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  color: "#374151",
  fontSize: "11px",
  cursor: "pointer",
};


/* =========================================================
   UPLOADED IMAGE
========================================================= */

const uploadedBox = {
  minHeight: "200px",
  padding: "22px",
  border: "1px solid #dce2e7",
  borderRadius: "8px",
  backgroundColor: "#f8fafc",
  display: "flex",
  alignItems: "center",
  gap: "24px",
  boxSizing: "border-box",
};

const imagePreviewWrapper = {
  width: "140px",
  height: "140px",
  flexShrink: 0,
};

const previewImage = {
  width: "140px",
  height: "140px",
  objectFit: "cover",
  borderRadius: "8px",
  border: "1px solid #d5dbe1",
};

const uploadedDetails = {
  flex: 1,
};

const uploadedTitle = {
  fontSize: "13px",
  fontWeight: "500",
  color: "#374151",
};

const uploadedDescription = {
  marginTop: "5px",
  fontSize: "11px",
  color: "#9ca3af",
};

const imageActions = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "16px",
};

const changeButton = {
  padding: "7px 12px",
  borderRadius: "5px",
  border: "1px solid #d1d5db",
  backgroundColor: "#ffffff",
  color: "#374151",
  fontSize: "11px",
  cursor: "pointer",
};

const removeButton = {
  display: "flex",
  alignItems: "center",
  gap: "3px",
  padding: "7px 11px",
  borderRadius: "5px",
  border: "1px solid #fecaca",
  backgroundColor: "#fffafa",
  color: "#dc2626",
  fontSize: "11px",
  cursor: "pointer",
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
   PREVIEW
========================================================= */

const previewCard = {
  padding: "35px 20px",
  textAlign: "center",
};

const previewCardImage = {
  width: "115px",
  height: "115px",
  objectFit: "cover",
  borderRadius: "9px",
  border: "1px solid #dce1e6",
};

const previewPlaceholder = {
  width: "115px",
  height: "115px",
  margin: "0 auto",
  borderRadius: "9px",
  backgroundColor: "#f1f4f7",
  color: "#a0a7b0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const previewCardName = {
  marginTop: "16px",
  fontSize: "15px",
  fontWeight: "600",
  color: "#374151",
};

const previewCardSub = {
  marginTop: "5px",
  fontSize: "10px",
  color: "#9ca3af",
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