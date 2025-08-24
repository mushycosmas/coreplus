"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar, Nav, Container } from 'react-bootstrap';

const Header: React.FC = () => {
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Values', path: '/values' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Contact Us', path: '/contact-us' },
  ];

  // Internal Styles
  const navbarStyle = {
    backgroundColor: "#343a40",
    padding: "15px 0",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  };

  const logoStyle = {
    color: "#17a2b8",
    fontSize: "24px",
    fontWeight: "bold",
    textDecoration: "none",
  };

  const navItemStyle = {
    backgroundColor: "#17a2b8",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "500",
    padding: "10px 20px",
    borderRadius: "8px",
    margin: "0 8px",
    transition: "background 0.3s ease-in-out, color 0.3s ease-in-out",
    textDecoration: "none",
    display: "inline-block",
  };

  const hoverEffect = {
    backgroundColor: "#138496",
    color: "#ffffff",
  };

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <Navbar expand="lg" sticky="top" style={navbarStyle}>
      <Container fluid>
        {/* Logo */}
        <Link href="/" style={logoStyle}>
          CorePlus
        </Link>

        <Navbar.Toggle aria-controls="navbarNav" />
        <Navbar.Collapse id="navbarNav">
          <Nav className="w-100 justify-content-center">
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.path}
                style={
                  hoveredIndex === idx
                    ? { ...navItemStyle, ...hoverEffect }
                    : navItemStyle
                }
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {item.name}
              </Link>
            ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
