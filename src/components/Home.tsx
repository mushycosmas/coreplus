"use client";

import React, { useState, useEffect } from "react";
import HeroSection from "./section/heroSection";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { FaRocket } from "react-icons/fa";
import Image from "next/image";

// Types for fetched data
interface Service {
  id: number;
  title: string;
  description: string;
  image: string;
}

interface WhyChooseUs {
  id: number;
  title: string;
  description: string;
}

interface AboutUs {
  title: string;
  description: string;
  image: string;
}

interface Client {
  id: number;
  name: string;
  logo: string;
}

const Home: React.FC = () => {
  const [aboutUs, setAboutUs] = useState<AboutUs | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUs[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const aboutRes = await fetch("/api/about/about");
        if (!aboutRes.ok) throw new Error("Failed to fetch About Us.");
        const aboutData = await aboutRes.json();
        setAboutUs(aboutData);

        const servicesRes = await fetch("/api/services/services");
        if (!servicesRes.ok) throw new Error("Failed to fetch Services.");
        const servicesData = await servicesRes.json();
        setServices(servicesData.services);

        const whyRes = await fetch("/api/why-choose-us/why_choose_us?limit=4");
        if (!whyRes.ok) throw new Error("Failed to fetch Why Choose Us.");
        const whyData = await whyRes.json();
        setWhyChooseUs(whyData.items);

        const clientsRes = await fetch("/api/clients/clients?limit=12");
        if (!clientsRes.ok) throw new Error("Failed to fetch Clients.");
        const clientsData = await clientsRes.json();
        setClients(clientsData.clients);
      } catch {
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading...</p>
      </Container>
    );

  if (error)
    return (
      <Container className="text-center my-5">
        <p>{error}</p>
      </Container>
    );

  return (
    <>
      <HeroSection />

      {/* About Us */}
      <Container className="my-5 text-center">
        <h2 className="section-title">About Us</h2>
        <Row className="justify-content-center align-items-center">
          <Col md={6} className="mb-4 mb-md-0">
            <p className="about-text">{aboutUs?.description || ""}</p>
            <Button variant="primary">Learn More</Button>
          </Col>
          <Col md={6}>
            {aboutUs?.image && (
              <Image
                src={aboutUs.image}
                alt="About Us"
                width={600}
                height={400}
                className="about-img"
              />
            )}
          </Col>
        </Row>
      </Container>

      {/* Services */}
      <Container className="my-5 text-center">
        <h2 className="section-title">Our Services</h2>
        <Row className="justify-content-center">
          {services.length > 0 ? (
            services.map((service) => (
              <Col md={4} className="mb-4" key={service.id}>
                <Card className="p-4 shadow-sm service-card h-100 text-center">
                  {service.image && (
                    <Image
                      src={service.image}
                      alt={service.title}
                      width={400}
                      height={250}
                      className="card-img-top"
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{service.title}</Card.Title>
                    <Card.Text>{service.description}</Card.Text>
                    <Button variant="link" href="/services">
                      View More Services
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p>No services available</p>
          )}
        </Row>
      </Container>

      {/* Why Choose Us */}
      <Container className="my-5 text-center">
        <h2 className="section-title">Why Choose Us?</h2>
        <Row className="justify-content-center">
          {whyChooseUs.length > 0 ? (
            whyChooseUs.map((item) => (
              <Col md={4} className="mb-4" key={item.id}>
                <Card className="p-4 shadow-sm feature-card h-100 text-center">
                  <FaRocket size={40} className="feature-icon text-danger mb-3" />
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </Card>
              </Col>
            ))
          ) : (
            <p>No data available</p>
          )}
        </Row>
      </Container>

      {/* Clients */}
      <Container className="my-5 text-center">
        <h2 className="section-title">Our Clients</h2>
        <Row className="justify-content-center">
          {clients.length > 0 ? (
            clients.map((client) => (
              <Col md={4} sm={6} xs={12} key={client.id} className="mb-4 text-center">
                <div className="client-circle mx-auto mb-2">
                  <Image
                    src={client.logo || "/images/default-client.png"}
                    alt={`Client ${client.name}`}
                    width={80}
                    height={80}
                    className="client-logo"
                  />
                </div>
              </Col>
            ))
          ) : (
            <p>No clients available</p>
          )}
        </Row>
      </Container>

      <style jsx>{`
        .section-title {
          font-weight: 700;
          margin-bottom: 2rem;
          color: #343a40;
        }
        .service-card,
        .feature-card {
          border-radius: 15px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .service-card:hover,
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        .client-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background-color: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .client-logo {
          max-width: 70%;
          max-height: 70%;
        }
      `}</style>
    </>
  );
};

export default Home;
