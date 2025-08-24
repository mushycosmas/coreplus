"use client";

import React, { useState, useEffect } from "react";
import ReUseHeroSection from "../section/ReUseHeroSection";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import Image from "next/image";

// Define types for API data
interface AboutData {
  title: string;
  description: string;
  image?: string;
}

interface Service {
  id: number;
  title: string;
  description: string;
  image?: string;
}

interface WhyChooseUs {
  id: number;
  title: string;
  description: string;
}

const About: React.FC = () => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch About data
        const aboutRes = await fetch("/api/about/about");
        if (!aboutRes.ok) throw new Error("Failed to fetch About data.");
        const aboutJson = await aboutRes.json();
        setAboutData(aboutJson);

        // Fetch Services data
        const servicesRes = await fetch("/api/services/services");
        if (!servicesRes.ok) throw new Error("Failed to fetch Services.");
        const servicesJson = await servicesRes.json();
        setServices(servicesJson.services || []);

        // Fetch Why Choose Us data
        const whyRes = await fetch("/api/why-choose-us/why_choose_us?limit=4");
        if (!whyRes.ok) throw new Error("Failed to fetch 'Why Choose Us'.");
        const whyJson = await whyRes.json();
        setWhyChooseUs(whyJson.items || []);
      } catch {
        setError("Error loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center mt-5">
        <Alert variant="danger">{error}</Alert>
      </div>
    );

  if (!aboutData)
    return (
      <div className="text-center mt-5">
        <Alert variant="danger">About data is missing or invalid.</Alert>
      </div>
    );

  return (
    <>
      <ReUseHeroSection title="About Us" tagline="Your Trusted HR Solutions Partner" />

      <Container className="my-5">
        <Row className="align-items-center">
          <Col md={6}>
            <h2 className="section-title">{aboutData.title}</h2>
            <p>{aboutData.description}</p>
          </Col>
          <Col md={6}>
            {aboutData.image ? (
              <div className="position-relative" style={{ width: "100%", height: "300px" }}>
                <Image
                  src={aboutData.image}
                  alt="About Us"
                  fill
                  style={{ objectFit: "cover", borderRadius: "10px" }}
                />
              </div>
            ) : (
              <div>No image available</div>
            )}
          </Col>
        </Row>

        {/* Services Section */}
        <Row className="mt-5">
          <Col>
            <h2>Our Services</h2>
          </Col>
        </Row>
        <Row>
          {services.length > 0 ? (
            services.map((service) => (
              <Col md={4} key={service.id}>
                <Card className="mb-4 h-100">
                  {service.image && (
                    <div className="position-relative" style={{ width: "100%", height: "200px" }}>
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <Card.Body>
                    <Card.Title>{service.title}</Card.Title>
                    <Card.Text>{service.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p>No services available</p>
          )}
        </Row>

        {/* Why Choose Us Section */}
        <Row className="mt-5">
          <Col>
            <h2>Why Choose Us?</h2>
            <p>
              With a deep understanding of human resource management, we offer tailored HR solutions
              that drive business growth, improve efficiency, and create a thriving workplace.
            </p>
          </Col>
        </Row>
        <Row>
          {whyChooseUs.length > 0 ? (
            whyChooseUs.map((item) => (
              <Col md={6} lg={3} key={item.id}>
                <Card className="mb-4 h-100">
                  <Card.Body>
                    <Card.Title>{item.title}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p>No information available for Why Choose Us.</p>
          )}
        </Row>
      </Container>
    </>
  );
};

export default About;
