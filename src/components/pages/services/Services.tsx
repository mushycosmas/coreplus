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
  const [loadingServices, setLoadingServices] = useState<boolean>(true);
  const [errorServices, setErrorServices] = useState<string | null>(null);
  const [loadingWhyChooseUs, setLoadingWhyChooseUs] = useState<boolean>(true);
  const [errorWhyChooseUs, setErrorWhyChooseUs] = useState<string | null>(null);

  // Fetch services data
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services/services");
        if (!response.ok) throw new Error("Failed to fetch services.");

        const data = await response.json();
        if (Array.isArray(data.services)) {
          setServices(data.services);
        } else {
          setErrorServices("Unexpected data format for services.");
        }
      } catch {
        setErrorServices("Error loading services.");
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  // Fetch 'Why Choose Us' data
  useEffect(() => {
    const fetchWhyChooseUs = async () => {
      try {
        const response = await fetch("/api/why-choose-us/why_choose_us?limit=1");
        if (!response.ok) throw new Error("Failed to fetch Why Choose Us data.");

        const data = await response.json();
        if (Array.isArray(data.items)) {
          setWhyChooseUs(data.items);
        } else {
          setErrorWhyChooseUs("Unexpected data format for Why Choose Us.");
        }
      } catch {
        setErrorWhyChooseUs("Error loading Why Choose Us data.");
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

        {loadingServices && (
          <Row>
            <Col className="text-center">
              <Spinner animation="border" variant="primary" />
              <p>Loading services...</p>
            </Col>
          </Row>
        )}

        {errorServices && (
          <Row>
            <Col className="text-center">
              <Alert variant="danger">{errorServices}</Alert>
            </Col>
          </Row>
        )}

        {!loadingServices && !errorServices && (
          <Row>
            {services.map((service) => (
              <Col md={4} key={service.id}>
                <Card className="mb-4 shadow-sm">
                  <Card.Img
                    variant="top"
                    src={service.image}
                    alt={service.title}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <Card.Body>
                    <Card.Title>{service.title}</Card.Title>
                    <Card.Text>{service.description.replace(/'/g, "&apos;")}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Why Choose Us Section */}
        {loadingWhyChooseUs ? (
          <Row>
            <Col className="text-center">
              <Spinner animation="border" variant="primary" />
              <p>Loading Why Choose Us...</p>
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
                <h3>{whyChooseUs[0].title.replace(/'/g, "&apos;")}</h3>
                <p>{whyChooseUs[0].description.replace(/'/g, "&apos;")}</p>
              </Col>
            </Row>
          )
        )}
      </Container>
    </>
  );
};

export default Services;
