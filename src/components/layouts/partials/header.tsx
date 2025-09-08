'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar, Nav, Container } from 'react-bootstrap';
import Image from 'next/image';

const Header: React.FC = () => {
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Values', path: '/values' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Contact Us', path: '/contact-us' },
  ];

  // Adjusted navbar style for contrast and visibility of logo text
  const navbarStyle = {
    backgroundColor: "#ffffff", // Light background for better contrast with blue logo
    padding: "15px 0",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    position: 'fixed',  // Fix the navbar position
    top: 0,  // Make sure it's fixed to the top of the screen
    width: '100%',  // Ensure it spans the full width of the viewport
    zIndex: 999,  // Ensure it stays on top of other content
  };

  const navItemStyle = {
    backgroundColor: "#f05a28", // Orange color from logo
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
    backgroundColor: "#003d6d", // Darker blue for hover effect
    color: "#ffffff",
  };

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <Navbar expand="lg" style={navbarStyle}>
      <Container fluid>
        {/* Logo Only (No Text) */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/logo/logo1.png" alt="Logo" width={160} height={50} />
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
