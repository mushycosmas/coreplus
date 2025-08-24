"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import ReUseHeroSection from "../section/ReUseHeroSection";

interface FormData {
  email: string;
  phone: string;
  address: string;
  message: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    address: "",
    message: "",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.phone || !formData.address || !formData.message) {
      setErrorMessage("All fields are required.");
      setSuccessMessage(null);
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("Your message has been sent successfully!");
        setErrorMessage(null);
        setFormData({ email: "", phone: "", address: "", message: "" });
      } else {
        setErrorMessage(data.message || "Something went wrong.");
        setSuccessMessage(null);
      }
    } catch {
      setErrorMessage("An unexpected error occurred.");
      setSuccessMessage(null);
    }
  };

  return (
    <>
      <ReUseHeroSection title="Contact Us" tagline="We'd love to hear from you!" />

      <Container className="my-5">
        <h2 className="text-center mb-4">Contact Us</h2>
        <Row className="justify-content-center">
          {/* Contact Form */}
          <Col md={8} lg={6}>
            <Card className="p-4 shadow-sm" style={{ borderRadius: "15px" }}>
              <h4>Get in Touch</h4>

              {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
              {successMessage && <Alert variant="success">{successMessage}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Label>Email:</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formPhone" className="mb-3">
                  <Form.Label>Phone:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formAddress" className="mb-3">
                  <Form.Label>Address:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formMessage" className="mb-3">
                  <Form.Label>Message:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Your message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={!formData.email || !formData.phone || !formData.address || !formData.message}
                >
                  Submit
                </Button>
              </Form>
            </Card>
          </Col>

          {/* Contact Info */}
          <Col md={4} lg={3} className="mt-4 mt-md-0">
            <h4>Contact Information</h4>
            <div className="contact-item d-flex align-items-center mb-3">
              <FaEnvelope className="me-2" size={20} /> support@example.com
            </div>
            <div className="contact-item d-flex align-items-center mb-3">
              <FaPhoneAlt className="me-2" size={20} /> +123 456 7890
            </div>
            <div className="contact-item d-flex align-items-center mb-3">
              <FaMapMarkerAlt className="me-2" size={20} /> 123 Main Street, Dar es Salaam, Tanzania
            </div>

            {/* Google Map */}
            <div className="my-4">
              <h5>Our Location</h5>
              <iframe
                title="Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.001531973154!2d39.2083!3d-6.7924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x185c4c43f1bdb49f%3A0x51f93b5b0f36ebf2!2sDar%20es%20Salaam%2C%20Tanzania!5e0!3m2!1sen!2sus!4v1642650153424"
                width="100%"
                height="250"
                style={{ borderRadius: "15px", border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .contact-item {
          font-size: 16px;
          padding: 8px;
          border-radius: 5px;
          background-color: #f8f9fa;
          transition: background-color 0.3s;
        }
        .contact-item:hover {
          background-color: #e9ecef;
        }
      `}</style>
    </>
  );
};

export default Contact;
