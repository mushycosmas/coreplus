"use client";

import React, { useState } from "react";
import { Container, Row, Col, Card, Pagination, Form, Button, Badge } from "react-bootstrap";
import ReUseHeroSection from "../Section/ReUseHeroSection";
import { FaBuilding, FaClock, FaMapMarkerAlt, FaBriefcase, FaCalendarAlt, FaSearch } from "react-icons/fa";

interface Job {
  title: string;
  company: string;
  location: string;
  posted: string;
  jobType: string;
  expireDate: string;
  logo: string;
}

const Jobs: React.FC = () => {
  const jobsPerPage = 10;

  const allJobs: Job[] = Array.from({ length: 50 }, (_, i) => ({
    title: `Job Title ${i + 1}`,
    company: `Company ${i + 1}`,
    location: "Remote",
    posted: "2 days ago",
    jobType: i % 2 === 0 ? "Full-Time" : "Part-Time",
    expireDate: "2025-03-01",
    logo: `https://via.placeholder.com/60?text=Logo`
  }));

  const [currentPage, setCurrentPage] = useState<number>(1);
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = allJobs.slice(indexOfFirstJob, indexOfLastJob);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <>
      <ReUseHeroSection
        title="Open Jobs"
        tagline="Find your dream job with ease!"
      />

      <Container className="my-5">
        <Row>
          {/* Sidebar */}
          <Col md={4} className="mb-4">
            <Card className="p-4 shadow-sm border-0 rounded-4">
              <h5 className="mb-3">Search Jobs</h5>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Keyword</Form.Label>
                  <Form.Control type="text" placeholder="Job title or keyword" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control type="text" placeholder="City or remote" />
                </Form.Group>
                <Button variant="success" className="w-100">
                  <FaSearch className="me-2" /> Search
                </Button>
              </Form>
            </Card>
          </Col>

          {/* Job Listings */}
          <Col md={8}>
            <h2 className="mb-4 text-center">Latest Job Listings</h2>
            <Row>
              {currentJobs.map((job, index) => (
                <Col md={12} key={index} className="mb-4">
                  <Card className="shadow-sm border-0 rounded-4 hover-card p-3 transition-hover">
                    <Card.Body className="d-flex flex-column flex-md-row align-items-md-center">
                      <div className="me-md-3 mb-3 mb-md-0 text-center">
                        <img
                          src={job.logo}
                          alt="Company Logo"
                          width={60}
                          height={60}
                          className="rounded-circle"
                        />
                      </div>

                      <div className="flex-grow-1">
                        <Card.Title className="mb-1">{job.title}</Card.Title>
                        <Card.Text className="text-muted mb-1">
                          <FaBuilding className="me-1" /> {job.company}
                        </Card.Text>
                        <Card.Text className="text-muted mb-1">
                          <FaMapMarkerAlt className="me-1" /> {job.location}
                        </Card.Text>
                      </div>

                      <div className="text-md-end mt-3 mt-md-0">
                        <Badge bg={job.jobType === "Full-Time" ? "success" : "warning"} className="mb-2">
                          <FaBriefcase className="me-1" /> {job.jobType}
                        </Badge>
                        <div className="text-muted">
                          <FaClock className="me-1" /> {job.posted}
                        </div>
                        <div className="text-muted">
                          <FaCalendarAlt className="me-1" /> {job.expireDate}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            <Pagination className="justify-content-center mt-4">
              {Array.from({ length: Math.ceil(allJobs.length / jobsPerPage) }, (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
                  onClick={() => paginate(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </Col>
        </Row>
      </Container>

      {/* Extra CSS */}
      <style jsx>{`
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }
        .transition-hover {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Jobs;
