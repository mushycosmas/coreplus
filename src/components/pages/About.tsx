"use client";

import React from "react";
import ReUseHeroSection from "../section/ReUseHeroSection";
import { Container, Row, Col, Card, Image } from "react-bootstrap";

const About: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <ReUseHeroSection
        title="About Us"
        tagline="Your Trusted HR Solutions Partner"
      />

      {/* About Content */}
      <Container className="my-5">
        <Row className="align-items-center">
          <Col md={6}>
            <h2>Who We Are</h2>
            <p>
              CorePlus Consulting Limited is a leading HR solutions provider, offering 
              comprehensive human resource services to businesses of all sizes. Our 
              expertise helps companies build strong, productive, and efficient teams.
            </p>
          </Col>
          <Col md={6}>
            <Image
              src="https://emphires-demo.pbminfotech.com/html-demo/images/service/service-01.jpg"
              alt="About Us"
              fluid
              rounded
            />
          </Col>
        </Row>

        {/* Services Section */}
        <Row className="mt-5">
          <Col>
            <h2>Our Services</h2>
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <Card className="mb-4 h-100">
              <Card.Img
                variant="top"
                src="https://emphires-demo.pbminfotech.com/html-demo/images/service/service-01.jpg"
                alt="Recruitment & Staffing"
              />
              <Card.Body>
                <Card.Title>Recruitment & Staffing</Card.Title>
                <Card.Text>
                  We connect businesses with top talent to ensure the right fit for success.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4 h-100">
              <Card.Img
                variant="top"
                src="https://emphires-demo.pbminfotech.com/html-demo/images/service/service-02.jpg"
                alt="Employee Training & Development"
              />
              <Card.Body>
                <Card.Title>Employee Training & Development</Card.Title>
                <Card.Text>
                  We provide customized training programs to enhance workforce skills and productivity.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4 h-100">
              <Card.Img
                variant="top"
                src="https://emphires-demo.pbminfotech.com/html-demo/images/service/service-03.jpg"
                alt="HR Consulting"
              />
              <Card.Body>
                <Card.Title>HR Consulting</Card.Title>
                <Card.Text>
                  Our strategic HR solutions help businesses improve their workforce management.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Why Choose Us */}
        <Row className="mt-5">
          <Col>
            <h2>Why Choose Us?</h2>
            <p>
              With a deep understanding of human resource management, we offer tailored HR solutions 
              that drive business growth, improve efficiency, and create a thriving workplace.
            </p>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default About;
