"use client";

import React, { useState, useEffect } from "react";
import ReUseHeroSection from "@/components/section/ReUseHeroSection";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";

interface Service {
  id: number;
  title: string;
  description: string;
  image: string;
}

interface WhyChooseUsItem {
  id: number;
  title: string;
  description: string;
}

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingWhyChooseUs, setLoadingWhyChooseUs] = useState<boolean>(true);
  const [errorWhyChooseUs, setErrorWhyChooseUs] = useState<string | null>(null);

  // Fetch services data
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services/services");
        if (!response.ok) {
          throw new Error("Failed to fetch services.");
        }
        const data = await response.json();
        if (data.services && Array.isArray(data.services)) {
          setServices(data.services);
        } else {
          setError("Unexpected data format for services.");
        }
      } catch (err) {
        setError("Error loading services.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Fetch Why Choose Us data
  useEffect(() => {
    const fetchWhyChooseUs = async () => {
      try {
        const response = await fetch("/api/why-choose-us/why_choose_us?limit=1");
        if (!response.ok) {
          throw new Error("Failed to fetch 'Why Choose Us' data.");
        }
        const data = await response.json();
        if (data.items && Array.isArray(data.items)) {
          setWhyChooseUs(data.items);
        } else {
          setErrorWhyChooseUs("Unexpected data format for 'Why Choose Us'.");
        }
      } catch (err) {
        setErrorWhyChooseUs("Error loading 'Why Choose Us' data.");
      } finally {
        setLoadingWhyChooseUs(false);
      }
    };

    fetchWhyChooseUs();
  }, []);

  return (
    <>
      <ReUseHeroSection
        title="Our Services"
        tagline="Tailored Solutions for Your Unique Needs!"
      />

      <Container className="my-5">
        {/* Services Section */}
        <Row className="mt-5">
          <Col>
            <h2>Our Services</h2>
          </Col>
        </Row>

        {loading && (
          <Row>
            <Col className="text-center">
              <Spinner animation="border" variant="primary" />
              <p>Loading services...</p>
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

        <Row>
          {services.map((service) => (
            <Col md={4} key={service.id}>
              <Card className="mb-4">
                <Card.Img
                  variant="top"
                  src={service.image}
                  alt={service.title}
                />
                <Card.Body>
                  <Card.Title>{service.title}</Card.Title>
                  <Card.Text>{service.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Why Choose Us Section */}
        {loadingWhyChooseUs ? (
          <Row>
            <Col className="text-center">
              <Spinner animation="border" variant="primary" />
              <p>Loading 'Why Choose Us'...</p>
            </Col>
          </Row>
        ) : errorWhyChooseUs ? (
          <Row>
            <Col className="text-center">
              <Alert variant="danger">{errorWhyChooseUs}</Alert>
            </Col>
          </Row>
        ) : (
          whyChooseUs.length > 0 && (
            <Row className="mt-5">
              <Col>
                <h2>Why Choose Us?</h2>
                <h3>{whyChooseUs[0].title}</h3>
                <p>{whyChooseUs[0].description}</p>
              </Col>
            </Row>
          )
        )}
      </Container>
    </>
  );
};

export default Services;
