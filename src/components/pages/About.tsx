"use client";

import React, { useState, useEffect } from "react";
import ReUseHeroSection from "../section/ReUseHeroSection";
import { Container, Row, Col, Card, Image, Spinner, Alert } from "react-bootstrap";

const About: React.FC = () => {
  const [aboutData, setAboutData] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [whyChooseUs, setWhyChooseUs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data for About, Services, and Why Choose Us
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch About data
        const aboutResponse = await fetch("/api/about/about");
        if (!aboutResponse.ok) {
          throw new Error("Failed to fetch About data.");
        }
        const aboutData = await aboutResponse.json();

        // Fetch Services data
        const servicesResponse = await fetch("/api/services/services");
        if (!servicesResponse.ok) {
          throw new Error("Failed to fetch Services.");
        }
        const servicesData = await servicesResponse.json();

        // Fetch Why Choose Us data with a limit of 4
        const whyChooseUsResponse = await fetch("/api/why-choose-us/why_choose_us?limit=4");
        if (!whyChooseUsResponse.ok) {
          throw new Error("Failed to fetch 'Why Choose Us' data.");
        }
        const whyChooseUsData = await whyChooseUsResponse.json();

        // Set the fetched data to state
        setAboutData(aboutData);
        setServices(servicesData.services);
        setWhyChooseUs(whyChooseUsData.items || []);
      } catch (err) {
        setError("Error loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle case when data is still loading or if there is an error
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-5">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  // Ensure aboutData exists before trying to access its properties
  if (!aboutData || !aboutData.title) {
    return (
      <div className="text-center mt-5">
        <Alert variant="danger">About data is missing or invalid.</Alert>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <ReUseHeroSection title="About Us" tagline="Your Trusted HR Solutions Partner" />

      {/* About Content */}
      <Container className="my-5">
        <Row className="align-items-center">
          <Col md={6}>
            <h2>{aboutData.title}</h2>
            <p>{aboutData.description}</p>
          </Col>
          <Col md={6}>
            {aboutData.image ? (
              <Image src={aboutData.image} alt="About Us" fluid rounded />
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
            services.map((service: any, index: number) => (
              <Col md={4} key={index}>
                <Card className="mb-4 h-100">
                  <Card.Img variant="top" src={service.image} alt={service.title} />
                  <Card.Body>
                    <Card.Title>{service.title}</Card.Title>
                    <Card.Text>{service.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <div>No services available</div>
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

        {/* Display Why Choose Us data */}
        <Row>
          {whyChooseUs.length > 0 ? (
            whyChooseUs.map((item: any, index: number) => (
              <Col md={6} lg={3} key={index}>
                <Card className="mb-4 h-100">
                  <Card.Body>
                    <Card.Title>{item.title}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <div>No information available for Why Choose Us.</div>
          )}
        </Row>
      </Container>
    </>
  );
};

export default About;
