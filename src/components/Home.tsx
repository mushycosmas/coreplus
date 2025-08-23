"use client";

import React from "react";
import HeroSection from "./section/heroSection";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaCogs, FaUsers, FaHandshake, FaRocket, FaLightbulb } from "react-icons/fa";
import ReUseHeroSection from "../section/ReUseHeroSection";
const Home: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* About Us Section */}
      <Container className="my-5 text-center">
        <h2 className="section-title">About Us</h2>
        <Row className="justify-content-center align-items-center">
          <Col md={6} className="mb-4 mb-md-0">
            <p className="about-text">
              At <strong>CorePlus Consulting Limited</strong>, we specialize in delivering cutting-edge HR consulting solutions. 
              Our mission is to empower businesses with workforce strategies that drive growth and efficiency.
            </p>
            <Button variant="primary">Learn More</Button>
          </Col>
          <Col md={6}>
            <img src="/images/about-us.svg" alt="About Us" className="img-fluid about-img" />
          </Col>
        </Row>
      </Container>

      {/* Our Services */}
      <Container className="my-5 text-center">
        <h2 className="section-title">Our Services</h2>
        <Row className="justify-content-center">
          <Col md={4} className="mb-4">
            <Card className="p-4 shadow-sm service-card h-100 text-center">
              <FaCogs size={40} className="service-icon text-primary mb-3" />
              <h4>Talent Acquisition</h4>
              <p>We provide top-tier recruitment solutions to meet your hiring needs.</p>
              <Button variant="link" href="/services">View More Services</Button>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="p-4 shadow-sm service-card h-100 text-center">
              <FaUsers size={40} className="service-icon text-success mb-3" />
              <h4>HR Outsourcing</h4>
              <p>Optimize HR operations by outsourcing administrative functions.</p>
              <Button variant="link" href="/services">View More Services</Button>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="p-4 shadow-sm service-card h-100 text-center">
              <FaHandshake size={40} className="service-icon text-warning mb-3" />
              <h4>Training & Development</h4>
              <p>Enhance workforce skills with our tailored training programs.</p>
              <Button variant="link" href="/services">View More Services</Button>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Why Choose Us */}
      <Container className="my-5 text-center">
        <h2 className="section-title">Why Choose Us?</h2>
        <Row className="justify-content-center">
          <Col md={4} className="mb-4">
            <Card className="p-4 shadow-sm feature-card h-100 text-center">
              <FaRocket size={40} className="feature-icon text-danger mb-3" />
              <h4>Innovation</h4>
              <p>We use modern strategies to provide effective HR solutions.</p>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="p-4 shadow-sm feature-card h-100 text-center">
              <FaLightbulb size={40} className="feature-icon text-info mb-3" />
              <h4>Expertise</h4>
              <p>Our team consists of highly skilled HR professionals.</p>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Our Clients */}
      <Container className="my-5 text-center">
        <h2 className="section-title">Our Clients</h2>
        <Row className="justify-content-center">
          {[1, 2, 3, 4, 5, 6].map((client) => (
            <Col md={4} sm={6} xs={12} key={client} className="mb-4 text-center">
              <div className="client-circle mx-auto mb-2">
                <img src={`/images/client${client}.png`} alt={`Client ${client}`} className="client-logo img-fluid" />
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Styles */}
      <style jsx>{`
        .section-title {
          font-weight: 700;
          margin-bottom: 2rem;
          color: #343a40;
        }
        .service-card, .feature-card {
          border-radius: 15px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .service-card:hover, .feature-card:hover {
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
