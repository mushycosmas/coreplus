"use client";

import React from "react";
import ReUseHeroSection from "../section/ReUseHeroSection";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FaBalanceScale, FaStar, FaLightbulb, FaUsers, FaUserTie } from "react-icons/fa";

interface CoreValue {
  title: string;
  description: string;
  icon: JSX.Element;
}

const Values: React.FC = () => {
  const coreValues: CoreValue[] = [
    { 
      title: "Integrity", 
      description: "We uphold honesty and strong moral principles.", 
      icon: <FaBalanceScale className="text-primary" size={40} /> 
    },
    { 
      title: "Excellence", 
      description: "We strive for the highest quality in everything we do.", 
      icon: <FaStar className="text-warning" size={40} /> 
    },
    { 
      title: "Innovation", 
      description: "We embrace creativity and new ideas to drive progress.", 
      icon: <FaLightbulb className="text-success" size={40} /> 
    },
    { 
      title: "Collaboration", 
      description: "We work together to achieve common goals.", 
      icon: <FaUsers className="text-info" size={40} /> 
    },
    { 
      title: "Customer-Centric Approach", 
      description: "We put our customers at the heart of our decisions.", 
      icon: <FaUserTie className="text-danger" size={40} /> 
    },
  ];

  return (
    <>
      <ReUseHeroSection 
        title="Our Core Values" 
        tagline="Inspiring Change Through Shared Values!" 
      />

      <Container className="my-5">
        <h2 className="text-center mb-4">Our Core Values</h2>
        <Row className="justify-content-center">
          {coreValues.map((value, index) => (
            <Col md={6} lg={4} key={index} className="mb-4">
              <Card className="shadow-sm border-0 hover-card text-center p-3 h-100">
                <Card.Body>
                  <div className="mb-3">{value.icon}</div>
                  <Card.Title>{value.title}</Card.Title>
                  <Card.Text className="text-muted">{value.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <style jsx>{`
        .hover-card:hover {
          transform: translateY(-5px);
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default Values;
