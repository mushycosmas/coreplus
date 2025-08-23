"use client";

import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Link from "next/link";

const Footer = () => {
  // Styles
  const footerStyle: React.CSSProperties = {
    backgroundColor: "#276795",
    color: "#ffffff",
    padding: "20px 0",
    textAlign: "center",
  };

  const linkStyle: React.CSSProperties = {
    color: "#f8f9fa",
    textDecoration: "none",
    margin: "0 10px",
    transition: "all 0.3s ease-in-out",
    padding: "5px 10px",
    borderRadius: "5px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    display: "inline-block",
  };

  return (
    <footer style={footerStyle} className="mt-auto">
      <Container fluid>
        <Row>
          <Col md={4}>
            <h5>About CorePlus</h5>
            <p>
              CorePlus Consulting Limited provides expert consulting solutions,
              helping businesses thrive with innovative strategies.
            </p>
          </Col>

          <Col md={4}>
            <h5>Quick Links</h5>
            <div>
              <Link href="/" style={linkStyle} className="footer-link">
                Home
              </Link>
              <Link href="/service" style={linkStyle} className="footer-link">
                Services
              </Link>
              <Link href="/contact" style={linkStyle} className="footer-link">
                Contact Us
              </Link>
            </div>
          </Col>

          <Col md={4}>
            <h5>Contact Us</h5>
            <p>Email: contact@coreplus.co.tz</p>
            <p>Phone: +255 123 456 789</p>
            <p>Location: Dar es Salaam, Tanzania</p>
          </Col>
        </Row>

        <hr style={{ backgroundColor: "#ffffff" }} />
        <p>
          &copy; {new Date().getFullYear()} CorePlus Consulting Limited. All
          Rights Reserved.
        </p>
      </Container>

      <style jsx>{`
        .footer-link:hover {
          color: #17a2b8 !important;
          background-color: rgba(255, 255, 255, 0.2) !important;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
