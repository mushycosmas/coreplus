"use client";

import React from "react";
import ReUseHeroSection from "@/components/section/ReUseHeroSection";
import { Container, Row, Col, Card } from "react-bootstrap";

const Services: React.FC = () => {
  return (
    <>
      <ReUseHeroSection
        title="Our Services"
        tagline="Tailored Solutions for Your Unique Needs!"
      />

      <Container className="my-5">
        <Row className="mt-5">
          <Col>
            <h2>Our Services</h2>
          </Col>
        </Row>

        <Row>
          <Col md={4}>
            <Card className="mb-4">
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
            <Card className="mb-4">
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
            <Card className="mb-4">
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

export default Services;
