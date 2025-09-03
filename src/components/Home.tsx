"use client";

import React, { useState, useEffect } from "react";
import HeroSection from "./section/heroSection";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import Image from "next/image";
import * as FaIcons from "react-icons/fa";

// Types
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
  icon: string;
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

interface MissionVision {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const Home: React.FC = () => {
  const [aboutUs, setAboutUs] = useState<AboutUs | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUs[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [missionVision, setMissionVision] = useState<MissionVision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const aboutRes = await fetch("/api/about/about");
        if (!aboutRes.ok) throw new Error("Failed to fetch About Us.");
        const aboutData = await aboutRes.json();
        setAboutUs(aboutData);

        const servicesRes = await fetch("/api/services/services?limit=6");
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

        const mvRes = await fetch("/api/mission-vision/mission-vision");
        if (!mvRes.ok) throw new Error("Failed to fetch Mission & Vision");
        const mvData = await mvRes.json();
        setMissionVision(mvData.items);

      } catch {
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <Container className="text-center my-5">
      <Spinner animation="border" variant="primary" />
      <p>Loading...</p>
    </Container>
  );

  if (error) return (
    <Container className="text-center my-5">
      <p>{error}</p>
    </Container>
  );

  // Normalize & get icons
  const getIcon = (iconName: string) => {
    if (!iconName) return null;

    // Convert db value into PascalCase for react-icons
    const formattedName = iconName
      .replace(/[-_](.)/g, (_, c) => c.toUpperCase()) // fa-rocket -> faRocket
      .replace(/^(fa)([a-z])/, (_, p1, p2) => p1.toUpperCase() + p2.toUpperCase()); // faRocket -> FaRocket

    const IconComponent = (FaIcons as any)[formattedName];
    return IconComponent ? (
      <IconComponent size={40} className="text-warning mb-3 feature-icon" />
    ) : (
      <FaIcons.FaRegQuestionCircle size={40} className="text-muted mb-3 feature-icon" />
    );
  };

  return (
    <>
      <HeroSection />

      {/* About Us */}
      <Container className="my-5 text-center section about-section p-5">
        <h2 className="section-title">About Us</h2>
        <Row className="justify-content-center align-items-center">
          <Col md={6} className="mb-4 mb-md-0">
            <p className="about-text">{aboutUs?.description || ""}</p>
            <Button variant="primary" href="/about">Learn More</Button>
          </Col>
          <Col md={6}>
            {aboutUs?.image && (
              <Image src={aboutUs.image} alt="About Us" width={600} height={400} className="about-img" />
            )}
          </Col>
        </Row>
      </Container>

      {/* Mission & Vision */}
      <Container className="my-5 text-center section mission-vision-section p-5">
        <h2 className="section-title">Our Mission & Vision</h2>
        <Row className="justify-content-center">
          {missionVision.map(item => {
            const IconComponent = (FaIcons as any)[item.icon] || FaIcons.FaBullseye;
            return (
              <Col md={5} className="mb-4" key={item.id}>
                <Card className="p-4 shadow-sm mission-vision-card h-100 text-center">
                  <IconComponent size={40} className="mb-3 text-primary" />
                  <h4>{item.title.charAt(0).toUpperCase() + item.title.slice(1)}</h4>
                  <p>{item.description}</p>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>

      {/* Services */}
      <Container className="my-5 text-center section services-section p-5">
        <h2 className="section-title">Our Services</h2>
       <Row className="justify-content-center">
  {services.length > 0 ? (
    services.map((service) => (
      <Col md={4} className="mb-4" key={service.id}>
        <Card className="p-4 shadow-sm service-card h-100 text-center">
          {service.image && (
            <Card.Img
              variant="top"
              src={service.image}
              alt={service.title}
              style={{ height: "200px", objectFit: "cover" }}
              className="card-img-top"
            />
          )}
          <Card.Body>
            <Card.Title>{service.title}</Card.Title>
            <Card.Text>{service.description?.replace(/'/g, "&apos;")}</Card.Text>
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
      <Container className="my-5 text-center section why-choose-section p-5">
        <h2 className="section-title">Why Choose Us?</h2>
        <Row className="justify-content-center">
          {whyChooseUs.length > 0 ? (
            whyChooseUs.map((item) => (
              <Col md={4} className="mb-4" key={item.id}>
                <Card className="p-4 shadow-sm feature-card h-100 text-center">
                  <div className="mb-3">{getIcon(item.icon)}</div>
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
    <Container className="my-5 text-center section clients-section p-5">
  <h2 className="section-title">Our Clients</h2>
  <div className="clients-scroll">
    {clients.length > 0 ? (
      clients.map((client) => (
        <div className="client-item" key={client.id}>
          <div className="client-circle mb-2">
            <Card.Img
              variant="top"
              src={client.logo || "/images/default-client.png"}
              alt={`Client ${client.name}`}
              style={{
                height: "80px",
                width: "80px",
                objectFit: "cover",
                borderRadius: "50%",
              }}
              className="client-logo"
            />
          </div>
        </div>
      ))
    ) : (
      <p>No clients available</p>
    )}
  </div>
</Container>


      <style jsx>{`
        /* Section colors */
        .about-section { background-color: #f0f4f8; }
        .mission-vision-section { background-color: #e8f0fe; }
        .services-section { background-color: #fff3e0; }
        .why-choose-section { background-color: #f9fbe7; }
        .clients-section { background-color: #e0f7fa; }

        .section-title {
          font-weight: 700;
          margin-bottom: 2rem;
          color: #343a40;
        }

        .service-card, .feature-card, .mission-vision-card {
          border-radius: 15px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .service-card:hover, .feature-card:hover, .mission-vision-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        /* Clients horizontal scroll */
        .clients-scroll {
          display: flex;
          overflow-x: auto;
          gap: 2rem;
          padding: 1rem 0;
          scroll-behavior: smooth;
        }
        .clients-scroll::-webkit-scrollbar { height: 8px; }
        .clients-scroll::-webkit-scrollbar-thumb { background-color: #888; border-radius: 4px; }

        .client-item { flex: 0 0 auto; }
        .client-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background-color: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s;
        }
        .client-circle:hover { transform: scale(1.1); }
        .client-logo { max-width: 70%; max-height: 70%; }
      `}</style>
    </>
  );
};

export default Home;
