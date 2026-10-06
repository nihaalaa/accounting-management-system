
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Button, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  BsArrowLeft,
  BsCloudUpload,
  BsCheck2,
} from "react-icons/bs";

export const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const preset_key = "testimage";
  const cloud_name = "kvti0onx";

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);

  // =========================
  // GET CATEGORY
  // =========================

  useEffect(() => {
    const getCategory = async () => {
      try {
        const response = await axios.get(
  `${import.meta.env.VITE_API_URL}/categories/${id}`
        );

        setName(response.data.name);
        setImage(response.data.image);
        setLoading(false);

      } catch (error) {
        console.log(error);
        alert("Failed to load category");
        navigate("/categories");
      }
    };

    getCategory();
  }, [id, navigate]);


  // =========================
  // IMAGE UPLOAD
  // =========================

  const handleFile = (event) => {
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
        setImage(res.data.secure_url);
      })
      .catch((err) => {
        console.log(err);
        alert("Image upload failed");
      });
  };


  // =========================
  // UPDATE CATEGORY
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
  `${import.meta.env.VITE_API_URL}/categories/${id}`,
        {
          name: name,
          image: image,
        }
      );

alert("Category updated successfully");
      navigate("/categories");

    } catch (error) {
      console.log(error);
      alert("Failed to update category");
    }
  };


  if (loading) {
    return (
      <div style={loadingStyle}>
        Loading category...
      </div>
    );
  }


  return (
    <div style={pageStyle}>

      {/* Back */}
      <button
        onClick={() => navigate("/categories")}
        style={backButtonStyle}
      >
        <BsArrowLeft size={15} />
        Back to Categories
      </button>


      {/* Header */}
      <div style={headerStyle}>

        <h2 style={titleStyle}>
          Edit Category
        </h2>

        <p style={subtitleStyle}>
          Update the category information and image.
        </p>

      </div>


      {/* Form Card */}
      <Card style={cardStyle}>

        {/* Card Header */}
        <div style={cardHeaderStyle}>

          <h5 style={cardTitle}>
            Category Information
          </h5>

          <p style={cardSubtitle}>
            Modify the details of this category
          </p>

        </div>


        <Card.Body style={bodyStyle}>

          <Form onSubmit={handleSubmit}>

            {/* Category Name */}
            <Form.Group className="mb-4">

              <Form.Label style={labelStyle}>
                Category Name
                <span style={requiredStyle}>*</span>
              </Form.Label>

              <Form.Control
                type="text"
                placeholder="e.g. Electronics"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
              />

              <Form.Text style={helpTextStyle}>
                Update the name of the category.
              </Form.Text>

            </Form.Group>


            {/* Image */}
            <Form.Group className="mb-4">

              <Form.Label style={labelStyle}>
                Category Image
              </Form.Label>


              <div style={uploadBoxStyle}>

                {image ? (

                  <div style={previewContainerStyle}>

                    <img
                      src={image}
                      width="110"
                      height="110"
                      alt="Category"
                      style={previewImageStyle}
                    />

                    <div style={previewInfoStyle}>

                      <div style={previewTitleStyle}>
                        Current category image
                      </div>

                      <div style={previewTextStyle}>
                        Choose a new image if you want to replace it.
                      </div>

                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleFile}
                        style={{
                          marginTop: "10px",
                          fontSize: "12px",
                        }}
                      />

                    </div>

                  </div>

                ) : (

                  <>
                    <div style={uploadIconStyle}>
                      <BsCloudUpload size={24} />
                    </div>

                    <div style={uploadTitleStyle}>
                      Upload category image
                    </div>

                    <div style={uploadTextStyle}>
                      Choose an image from your computer
                    </div>

                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                      style={fileInputStyle}
                    />
                  </>

                )}

              </div>


              <Form.Text style={helpTextStyle}>
                Recommended: JPG or PNG image.
              </Form.Text>

            </Form.Group>


            {/* Divider */}
            <div style={dividerStyle}></div>


            {/* Buttons */}
            <div style={buttonContainerStyle}>

              <Button
                type="button"
                onClick={() => navigate("/categories")}
                style={cancelButtonStyle}
              >
                Cancel
              </Button>


              <Button
                type="submit"
                style={submitButtonStyle}
              >
                <BsCheck2 size={17} />
                Update Category
              </Button>

            </div>

          </Form>

        </Card.Body>

      </Card>

    </div>
  );
};


/* =========================
   PAGE
========================= */

const pageStyle = {
  padding: "30px 35px",
  minHeight: "100vh",
  backgroundColor: "#f8fafc",
  boxSizing: "border-box",
};


/* =========================
   LOADING
========================= */

const loadingStyle = {
  padding: "40px",
  color: "#64748b",
  fontSize: "13px",
};


/* =========================
   BACK BUTTON
========================= */

const backButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#64748b",
  padding: 0,
  marginBottom: "18px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "12px",
  cursor: "pointer",
};


/* =========================
   HEADER
========================= */

const headerStyle = {
  marginBottom: "25px",
};

const titleStyle = {
  margin: 0,
  color: "#111827",
  fontSize: "24px",
  fontWeight: "600",
};

const subtitleStyle = {
  margin: "6px 0 0",
  color: "#6b7280",
  fontSize: "13px",
};


/* =========================
   CARD
========================= */

const cardStyle = {
  maxWidth: "720px",
  border: "1px solid #e5e7eb",
  borderRadius: "9px",
  overflow: "hidden",
  backgroundColor: "#ffffff",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

const cardHeaderStyle = {
  padding: "18px 22px",
  borderBottom: "1px solid #e5e7eb",
};

const cardTitle = {
  margin: 0,
  fontSize: "15px",
  fontWeight: "600",
  color: "#111827",
};

const cardSubtitle = {
  margin: "4px 0 0",
  fontSize: "11px",
  color: "#9ca3af",
};

const bodyStyle = {
  padding: "25px 22px",
};


/* =========================
   FORM
========================= */

const labelStyle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "7px",
};

const requiredStyle = {
  color: "#dc2626",
  marginLeft: "3px",
};

const inputStyle = {
  height: "40px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "13px",
  boxShadow: "none",
};

const helpTextStyle = {
  color: "#9ca3af",
  fontSize: "10px",
};


/* =========================
   IMAGE UPLOAD
========================= */

const uploadBoxStyle = {
  border: "1px dashed #cbd5e1",
  borderRadius: "8px",
  backgroundColor: "#f8fafc",
  padding: "25px",
  textAlign: "center",
};

const uploadIconStyle = {
  width: "45px",
  height: "45px",
  borderRadius: "8px",
  backgroundColor: "#eef3f7",
  color: "#4b6985",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 10px",
};

const uploadTitleStyle = {
  fontSize: "13px",
  fontWeight: "500",
  color: "#374151",
};

const uploadTextStyle = {
  fontSize: "11px",
  color: "#9ca3af",
  margin: "4px 0 15px",
};

const fileInputStyle = {
  maxWidth: "280px",
  margin: "0 auto",
  fontSize: "12px",
  backgroundColor: "#ffffff",
};

const previewContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "18px",
  textAlign: "left",
};

const previewImageStyle = {
  objectFit: "cover",
  borderRadius: "7px",
  border: "1px solid #d1d5db",
};

const previewInfoStyle = {
  flex: 1,
};

const previewTitleStyle = {
  fontSize: "13px",
  fontWeight: "500",
  color: "#374151",
};

const previewTextStyle = {
  fontSize: "11px",
  color: "#9ca3af",
  marginTop: "3px",
};


/* =========================
   BUTTONS
========================= */

const dividerStyle = {
  height: "1px",
  backgroundColor: "#e5e7eb",
  margin: "5px 0 20px",
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
};

const cancelButtonStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #d1d5db",
  color: "#374151",
  borderRadius: "6px",
  padding: "8px 16px",
  fontSize: "12px",
};

const submitButtonStyle = {
  backgroundColor: "#4b6985",
  border: "none",
  borderRadius: "6px",
  padding: "8px 16px",
  fontSize: "12px",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
  gap: "5px",
};
