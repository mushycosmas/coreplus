"use client";

import React, { useEffect, useState } from "react";
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
        const aboutData = await aboutRes.json();
        setAboutUs(aboutData);

        const servicesRes = await fetch("/api/services/services?limit=6");
        const servicesData = await servicesRes.json();
        setServices(servicesData.services);

        const whyRes = await fetch("/api/why-choose-us/why_choose_us?limit=4");
        const whyData = await whyRes.json();
        setWhyChooseUs(whyData.items);

        const clientsRes = await fetch("/api/clients/clients?limit=12");
        const clientsData = await clientsRes.json();
        setClients(clientsData.clients);

        const mvRes = await fetch("/api/mission-vision/mission-vision");
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

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
        <p>Loading...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center my-5">
        <p>{error}</p>
      </Container>
    );
  }

  // Icon helper
  const getIcon = (iconName: string) => {
    if (!iconName) return null;
    const formattedName = iconName
      .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
      .replace(/^(fa)([a-z])/, (_, p1, p2) => p1.toUpperCase() + p2.toUpperCase());

    const IconComponent = (FaIcons as any)[formattedName];
    return IconComponent ? (
      <IconComponent size={40} className="text-warning mb-3" />
    ) : (
      <FaIcons.FaRegQuestionCircle size={40} className="text-muted mb-3" />
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
            <p>{aboutUs?.description || ""}</p>
            <Button variant="primary" href="/about">Learn More</Button>
          </Col>
          <Col md={6}>
            {aboutUs?.image && (
              <Image
                src={aboutUs.image}
                alt="About Us"
                width={600}
                height={400}
              />
            )}
          </Col>
        </Row>
      </Container>

      {/* Mission & Vision */}
      <Container className="my-5 text-center section mission-vision-section p-5">
        <h2 className="section-title">Our Mission & Vision</h2>
        <Row className="justify-content-center">
          {missionVision.map((item) => {
            const IconComponent = (FaIcons as any)[item.icon] || FaIcons.FaBullseye;
            return (
              <Col md={5} className="mb-4" key={item.id}>
                <Card className="p-4 shadow-sm h-100 text-center">
                  <IconComponent size={40} className="mb-3 text-primary" />
                  <h4>{item.title}</h4>
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
          {services.map((service) => (
            <Col md={4} className="mb-4" key={service.id}>
              <Card className="p-4 shadow-sm h-100 text-center">
                {service.image && (
                  <div style={{ position: "relative", width: "100%", height: "200px" }}>
                    <Image
                      src={service.image}
                      alt={service.title}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
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
          ))}
        </Row>
      </Container>

      {/* Why Choose Us */}
      <Container className="my-5 text-center section why-choose-section p-5">
        <h2 className="section-title">Why Choose Us?</h2>
        <Row className="justify-content-center">
          {whyChooseUs.map((item) => (
            <Col md={4} className="mb-4" key={item.id}>
              <Card className="p-4 shadow-sm h-100 text-center">
                <div className="mb-3">{getIcon(item.icon)}</div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Clients */}
      <Container className="my-5 text-center section clients-section p-5">
        <h2 className="section-title">Our Clients</h2>
        <div className="clients-scroll">
          {clients.map((client) => (
            <div className="client-item" key={client.id}>
              <div className="client-circle">
                <Image
                  src={client.logo || "/images/default-client.png"}
                  alt={client.name}
                  width={70}
                  height={70}
                  style={{
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Container>

      <style jsx>{`
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

        .clients-scroll {
          display: flex;
          overflow-x: auto;
          gap: 2rem;
          padding: 1rem 0;
          scroll-behavior: smooth;
        }

        .clients-scroll::-webkit-scrollbar {
          height: 8px;
        }
        .clients-scroll::-webkit-scrollbar-thumb {
          background-color: #ccc;
          border-radius: 4px;
        }

        .client-item {
          flex: 0 0 auto;
        }

        .client-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background-color: #fff;
          border: 1px solid #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .client-circle:hover {
          transform: scale(1.1);
        }
      `}</style>
    </>
  );
};

export default Home;
