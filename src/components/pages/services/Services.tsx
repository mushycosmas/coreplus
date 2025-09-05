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
          throw new Error("One or more requests failed.");
        }

        const servicesData = await servicesRes.json();
        const whyChooseData = await whyChooseRes.json();

        if (Array.isArray(servicesData.services)) {
          setServices(servicesData.services);
        } else {
          throw new Error("Unexpected format in services response.");
        }

        if (Array.isArray(whyChooseData.items)) {
          setWhyChooseUs(whyChooseData.items);
        } else {
          throw new Error("Unexpected format in Why Choose Us response.");
        }
      } catch (err) {
        setError("Failed to load data. Please try again later.");
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
            <h2>Our Services</h2>
          </Col>
        </Row>

        {loading && (
          <Row>
            <Col className="text-center">
              <Spinner animation="border" variant="primary" />
              <p>Loading data...</p>
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

        {!loading && !error && (
          <>
            {/* Services Section */}
            <Row>
              {services.map((service) => (
                <Col md={4} key={service.id}>
                  <Card className="mb-4 shadow-sm h-100">
                    <div style={{ position: "relative", width: "100%", height: "200px" }}>
                      <Image
                        src={service.image}
                        alt={service.title}
                        layout="fill"
                        objectFit="cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <Card.Body>
                      <Card.Title>{service.title}</Card.Title>
                      <Card.Text>{service.description?.replace(/'/g, "&apos;")}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Why Choose Us Section */}
            {whyChooseUs.length > 0 && (
              <Row className="mt-5">
                <Col>
                  <h2>Why Choose Us?</h2>
                  <h4>{whyChooseUs[0].title?.replace(/'/g, "&apos;")}</h4>
                  <p>{whyChooseUs[0].description?.replace(/'/g, "&apos;")}</p>
                </Col>
              </Row>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default Services;
