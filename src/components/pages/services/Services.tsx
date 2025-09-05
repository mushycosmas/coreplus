"use client";

import React, { useEffect, useState } from "react";
import ReUseHeroSection from "@/components/section/ReUseHeroSection";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import Image from "next/image";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, whyChooseRes] = await Promise.all([
          fetch("/api/services/services"),
          fetch("/api/why-choose-us/why_choose_us?limit=1"),
        ]);

        if (!servicesRes.ok || !whyChooseRes.ok) {
          throw new Error("Failed to fetch data.");
        }

        const servicesData = await servicesRes.json();
        const whyChooseData = await whyChooseRes.json();

        if (Array.isArray(servicesData.services)) {
          setServices(servicesData.services);
        } else {
          throw new Error("Unexpected format for services.");
        }

        if (Array.isArray(whyChooseData.items)) {
          setWhyChooseUs(whyChooseData.items);
        } else {
          throw new Error("Unexpected format for Why Choose Us.");
        }
      } catch {
        setError("Unable to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <ReUseHeroSection
        title="Our Services"
        tagline="Tailored Solutions for Your Unique Needs!"
      />

      <Container className="my-5">
        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold">Our Services</h2>
          </Col>
        </Row>

        {/* Loading */}
        {loading && (
          <Row>
            <Col className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading services...</p>
            </Col>
          </Row>
        )}

        {/* Error */}
        {error && (
          <Row>
            <Col className="text-center">
              <Alert variant="danger">{error}</Alert>
            </Col>
          </Row>
        )}

        {/* Services */}
        {!loading && !error && (
          <Row>
            {services.map((service) => (
              <Col key={service.id} md={4} sm={6} xs={12} className="mb-4 px-2">
                <Card className="shadow-sm h-100 text-center">
                  <div style={{ width: "100%", height: "250px", position: "relative", background: "#f9f9f9" }}>
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      style={{
                        objectFit: "contain",
                        padding: "10px",
                      }}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <Card.Body>
                    <Card.Title>{service.title}</Card.Title>
                    <Card.Text>
                      {service.description?.replace(/'/g, "&apos;")}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Why Choose Us */}
        {!loading && !error && whyChooseUs.length > 0 && (
          <Row className="mt-5">
            <Col>
              <h2 className="fw-bold">Why Choose Us?</h2>
              <h4 className="mt-3">
                {whyChooseUs[0].title.replace(/'/g, "&apos;")}
              </h4>
              <p>{whyChooseUs[0].description.replace(/'/g, "&apos;")}</p>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
};

export default Services;
