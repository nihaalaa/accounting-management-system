import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Row, Col } from "react-bootstrap";
import { BsArrowLeft, BsFolder, BsPencil } from "react-icons/bs";

export const ViewCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // GET CATEGORY
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/categories/${id}`
        );

        setCategory(response.data);
      } catch (error) {
        console.log(error);
        alert("Failed to fetch category.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  if (loading) {
    return <div style={pageStyle}>Loading category...</div>;
  }

  if (!category) {
    return <div style={pageStyle}>Category not found.</div>;
  }

  return (
    <div style={pageStyle}>

      {/* HEADER */}

      <div style={headerStyle}>
        <div>
          <div style={breadcrumbStyle}>
            Products / Categories / View
          </div>

          <h2 style={titleStyle}>Category Details</h2>

          <p style={subtitleStyle}>
            View category information
          </p>
        </div>

        <Button
          style={backButton}
          onClick={() => navigate("/categories")}
        >
          <BsArrowLeft /> Back
        </Button>
      </div>

      {/* CATEGORY CARD */}

      <Card style={cardStyle}>
        <Card.Body style={{ padding: "28px" }}>

          <div style={categoryHeader}>
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                style={imageStyle}
              />
            ) : (
              <div style={noImage}>
                <BsFolder size={30} />
              </div>
            )}

            <div>
              <h3 style={categoryName}>
                {category.name}
              </h3>

              <p style={categorySubtitle}>
                Product Category
              </p>
            </div>
          </div>

          <hr style={dividerStyle} />

          <h5 style={sectionTitle}>
            Category Information
          </h5>

          <Row>
            <Col md={6} className="mb-4">
              <div style={labelStyle}>Category Name</div>
              <div style={valueStyle}>
                {category.name || "N/A"}
              </div>
            </Col>

            <Col md={6} className="mb-4">
              <div style={labelStyle}>Category ID</div>
              <div style={valueStyle}>
                {category._id}
              </div>
            </Col>
          </Row>

          <div style={{ marginBottom: "25px" }}>
            <div style={labelStyle}>Description</div>

            <div style={valueStyle}>
              {category.description || "No description available"}
            </div>
          </div>

          <hr style={dividerStyle} />

          <div style={footerStyle}>
                    <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              style={backButtonStyle}
            >
              Close
            </Button>

            <Button
              style={editButton}
              onClick={() =>
                navigate(`/categories/edit/${category._id}`)
              }
            >
              <BsPencil /> Edit Category
            </Button>
          </div>

        </Card.Body>
      </Card>

    </div>
  );
};


// STYLES

const pageStyle = {
  minHeight: "100vh",
  padding: "28px 32px 40px",
  backgroundColor: "#f3f4f8",
  fontFamily: "Inter, sans-serif",
  color: "#1e293b",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "22px",
};

const breadcrumbStyle = {
  fontSize: "11px",
  color: "#94a3b8",
  marginBottom: "7px",
};

const titleStyle = {
  fontSize: "25px",
  fontWeight: "650",
  margin: 0,
};

const subtitleStyle = {
  fontSize: "12px",
  color: "#7b8490",
  marginTop: "6px",
};

const cardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
};

const categoryHeader = {
  display: "flex",
  alignItems: "center",
  gap: "18px",
};

const imageStyle = {
  width: "85px",
  height: "85px",
  objectFit: "cover",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
};

const noImage = {
  width: "85px",
  height: "85px",
  borderRadius: "10px",
  backgroundColor: "#f1f5f9",
  color: "#94a3b8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const categoryName = {
  fontSize: "20px",
  fontWeight: "650",
  margin: 0,
};

const categorySubtitle = {
  fontSize: "12px",
  color: "#94a3b8",
  marginTop: "5px",
};

const dividerStyle = {
  borderColor: "#e2e8f0",
  margin: "25px 0",
};

const sectionTitle = {
  fontSize: "15px",
  fontWeight: "650",
  marginBottom: "22px",
};

const labelStyle = {
  fontSize: "11px",
  color: "#94a3b8",
  marginBottom: "7px",
};

const valueStyle = {
  fontSize: "13px",
  color: "#334155",
  fontWeight: "500",
  wordBreak: "break-word",
};

const footerStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
};

const backButton = {
  backgroundColor: "#ffffff",
  border: "1px solid #dbe2ea",
  color: "#475569",
  borderRadius: "7px",
  fontSize: "12px",
  padding: "8px 13px",
};

const editButton = {
  backgroundColor: "#3b6b9d",
  border: "1px solid #3b6b9d",
  color: "#ffffff",
  borderRadius: "7px",
  fontSize: "12px",
  padding: "8px 13px",
};

  const backButtonStyle = {
    height: "38px",
    padding: "0 13px",
    borderRadius: "6px",
    border: "1px solid #d9e0e6",
    backgroundColor: "#ffffff",
    color: "#4b5563",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    boxShadow:
      "0 1px 2px rgba(15,23,42,0.03)",
  };