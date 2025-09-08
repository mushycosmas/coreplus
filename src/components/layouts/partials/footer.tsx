'use client';

import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Link from "next/link";

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

interface About {
  description: string;
}

const navItems = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Values", path: "/values" },
  { name: "Jobs", path: "/jobs" },
  { name: "Contact Us", path: "/contact-us" },
];

const Footer = () => {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [abouts, setAbouts] = useState<About[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Contact Info
  const fetchContact = async () => {
    try {
      const res = await fetch("/api/contact-info/contact");
      const data: ContactInfo = await res.json();
      setContact(data);
    } catch (err) {
      console.error("Failed to fetch contact info:", err);
    }
  };

  // Fetch About Info
  const fetchAbouts = async () => {
    try {
      const res = await fetch("/api/about");
      const data: About[] = await res.json();
      setAbouts(data);
    } catch (err) {
      console.error("Failed to fetch abouts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
    fetchAbouts();
  }, []);

  // Styles
  const footerStyle: React.CSSProperties = {
    backgroundColor: "#004b87", // Blue color from logo
    color: "#ffffff",
    padding: "20px 0",
    textAlign: "center",
  };

  return (
    <footer style={footerStyle} className="mt-auto">
      <Container fluid>
        <Row>
          {/* About Section */}
          <Col md={4}>
            <h5>About CorePlus</h5>
            {loading ? (
              <p>Loading about info...</p>
            ) : abouts.length > 0 ? (
              <>
                <p>
                  {abouts[0].description.length > 120
                    ? `${abouts[0].description.substring(0, 120)}...`
                    : abouts[0].description}
                </p>
                <Link href="/about" className="learn-more">
                  Learn More →
                </Link>
              </>
            ) : (
              <p>No about info available</p>
            )}
          </Col>

          {/* Quick Links */}
          <Col md={4}>
            <h5>Quick Links</h5>
            <Row className="mt-2">
              {navItems.map((item) => (
                <Col xs="auto" key={item.path}>
                  <Link href={item.path} className="footer-link">
                    {item.name}
                  </Link>
                </Col>
              ))}
            </Row>
          </Col>

          {/* Contact Section */}
          <Col md={4}>
            <h5>Contact Us</h5>
            {contact ? (
              <>
                <p>Email: {contact.email}</p>
                <p>Phone: {contact.phone}</p>
                <p>Location: {contact.address}</p>
              </>
            ) : (
              <p>Loading contact info...</p>
            )}
          </Col>
        </Row>

        <hr style={{ backgroundColor: "#ffffff" }} />
        <p>
          &copy; {new Date().getFullYear()} CorePlus Consulting Limited. All
          Rights Reserved.
        </p>
      </Container>

      {/* CSS Adjustments */}
      <style jsx>{`
        .footer-link {
          display: inline-block;
          padding: 6px 12px;
          margin: 4px;
          border-radius: 5px;
          background-color: rgba(255, 255, 255, 0.1);
          color: #f05a28; /* Orange color from logo */
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          font-weight: 500;
        }

        .footer-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 0;
          height: 2px;
          background-color: #ffc107; /* Yellow accent for hover */
          transition: width 0.3s ease;
        }

        .footer-link:hover {
          color: #ffffff;
          background-color: rgba(255, 255, 255, 0.2);
        }

        .footer-link:hover::after {
          width: 100%;
        }

        .learn-more {
          color: #ffc107; /* Yellow for Learn More link */
          text-decoration: none;
          margin-top: 10px;
          display: inline-block;
          transition: color 0.3s ease;
        }

        .learn-more:hover {
          color: #ffffff;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
