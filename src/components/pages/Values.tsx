"use client";

import React, { useState, useEffect } from "react";
import ReUseHeroSection from "../section/ReUseHeroSection";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import * as FaIcons from "react-icons/fa"; // Import all icons

interface CoreValue {
  title: string;
  description: string;
  icon: string; // Store the icon name as a string
}

const Values: React.FC = () => {
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the core values data from the API
    const fetchCoreValues = async () => {
      try {
        const response = await fetch("/api/values/core_values");
        if (!response.ok) {
          throw new Error("Failed to fetch core values.");
        }
        const data = await response.json();
        // Ensure data is in the expected format
        if (Array.isArray(data.coreValues)) {
          setCoreValues(data.coreValues);
        } else {
          setError("Unexpected data format for core values.");
        }
      } catch (err) {
        setError("Error loading core values.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoreValues();
  }, []);

  // Function to get the icon component dynamically
  const getIcon = (iconName: string) => {
    const IconComponent = FaIcons[iconName as keyof typeof FaIcons];
    return IconComponent ? <IconComponent size={40} /> : null;
  };

  return (
    <>
      <ReUseHeroSection
        title="Our Core Values"
        tagline="Inspiring Change Through Shared Values!"
      />

      <Container className="my-5">
        <h2 className="text-center mb-4">Our Core Values</h2>

        {loading && (
          <Row>
            <Col className="text-center">
              <Spinner animation="border" variant="primary" />
              <p>Loading core values...</p>
            </Col>
          </Row>
        )}

        {error && (
          <Row>
            <Col className="text-center">
              <Alert variant="danger">{error}</Alert>
            </Col>
          </Row>
        )}

        <Row className="justify-content-center">
          {/* Render core values dynamically */}
          {coreValues.map((value, index) => (
            <Col md={6} lg={4} key={index} className="mb-4">
              <Card className="shadow-sm border-0 hover-card text-center p-3 h-100">
                <Card.Body>
                  <div className="mb-3">{getIcon(value.icon)}</div>
                  <Card.Title>{value.title}</Card.Title>
                  <Card.Text className="text-muted">{value.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <style jsx>{`
        .hover-card:hover {
          transform: translateY(-5px);
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default Values;
