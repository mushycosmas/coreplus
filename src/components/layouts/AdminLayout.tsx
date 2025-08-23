"use client";

import React, { ReactNode } from "react";
import { Container, Navbar, Nav, Button } from "react-bootstrap";
import { FaUserCircle, FaHome, FaInfoCircle, FaServicestack,FaBullseye, FaEnvelope, FaBriefcase, FaStar } from "react-icons/fa";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="admin-layout d-flex">
      {/* Sidebar */}
      <aside className="sidebar bg-dark text-white d-flex flex-column">
        <div className="sidebar-header text-center py-4">
          <FaUserCircle size={50} className="mb-2" />
          <h5>Admin Name</h5>
          <span className="text-muted">Administrator</span>
        </div>

        <Nav className="flex-column sidebar-nav">
          <Nav.Link href="/admin/pages/home" className="text-white"><FaHome className="me-2" /> Home</Nav.Link>
          <Nav.Link href="/admin/pages/about" className="text-white"><FaInfoCircle className="me-2" /> About</Nav.Link>
          <Nav.Link href="/admin/pages/services" className="text-white"><FaServicestack className="me-2" /> Services</Nav.Link>
          <Nav.Link href="/admin/pages/contact" className="text-white"><FaEnvelope className="me-2" /> Contact</Nav.Link>
          {/* <Nav.Link href="/admin/pages/jobs" className="text-white"><FaBriefcase className="me-2" /> Jobs</Nav.Link> */}
          <Nav.Link href="/admin/pages/values" className="text-white"><FaStar className="me-2" /> Core Values</Nav.Link>
        <Nav.Link href="/admin/pages/manage-mission-vision" className="text-white">
    <FaBullseye className="me-2" /> Mission & Vision
  </Nav.Link>

         
        </Nav>

        <div className="mt-auto p-3">
          <Button variant="danger" className="w-100">Logout</Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content flex-grow-1">
        <Navbar bg="light" expand="lg" className="shadow-sm">
          <Container fluid>
            <Navbar.Brand>Admin Dashboard</Navbar.Brand>
          </Container>
        </Navbar>

        <div className="p-4">{children}</div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .admin-layout {
          min-height: 100vh;
        }
        .sidebar {
          width: 250px;
          min-height: 100vh;
        }
        .sidebar a {
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          text-decoration: none;
        }
        .sidebar a:hover {
          background-color: #495057;
          border-radius: 5px;
        }
        .main-content {
          background-color: #f8f9fa;
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
