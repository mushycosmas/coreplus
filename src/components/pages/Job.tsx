"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Container, Row, Col, Card, Pagination, Form, Button, Badge } from "react-bootstrap";
import ReUseHeroSection from "../section/ReUseHeroSection";
import { FaBuilding, FaClock, FaMapMarkerAlt, FaBriefcase, FaCalendarAlt, FaSearch } from "react-icons/fa";

// Define types for the jobs
interface Job {
  id: number;
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

  const allJobs: Job[] = [
    {
      id: 1,
      title: "Software Engineer",
      company: "Google",
      location: "Mountain View, CA",
      posted: "2 days ago",
      jobType: "Full-Time",
      expireDate: "2025-03-01",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/27/Google_logo.png",
    },
    {
      id: 2,
      title: "Data Scientist",
      company: "Facebook",
      location: "Remote",
      posted: "1 week ago",
      jobType: "Full-Time",
      expireDate: "2025-05-15",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
    },
    {
      id: 3,
      title: "Product Manager",
      company: "Amazon",
      location: "Seattle, WA",
      posted: "3 days ago",
      jobType: "Full-Time",
      expireDate: "2025-04-25",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    },
    {
      id: 4,
      title: "UX Designer",
      company: "Apple",
      location: "Cupertino, CA",
      posted: "5 days ago",
      jobType: "Full-Time",
      expireDate: "2025-06-10",
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    },
    {
      id: 5,
      title: "DevOps Engineer",
      company: "Netflix",
      location: "Remote",
      posted: "2 days ago",
      jobType: "Full-Time",
      expireDate: "2025-07-20",
      logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Netflix_logo.svg",
    },
    {
      id: 6,
      title: "Backend Developer",
      company: "Spotify",
      location: "Stockholm, Sweden",
      posted: "1 week ago",
      jobType: "Part-Time",
      expireDate: "2025-08-15",
      logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Spotify_logo_with_text.svg",
    },
    {
      id: 7,
      title: "Marketing Specialist",
      company: "Microsoft",
      location: "Redmond, WA",
      posted: "4 days ago",
      jobType: "Full-Time",
      expireDate: "2025-09-01",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    },
    {
      id: 8,
      title: "Customer Support Engineer",
      company: "Slack",
      location: "San Francisco, CA",
      posted: "2 weeks ago",
      jobType: "Full-Time",
      expireDate: "2025-09-30",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Slack_Icon.png",
    },
    {
      id: 9,
      title: "Cloud Architect",
      company: "IBM",
      location: "Austin, TX",
      posted: "6 days ago",
      jobType: "Full-Time",
      expireDate: "2025-08-10",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/IBM_logo.svg",
    },
    {
      id: 10,
      title: "AI Researcher",
      company: "Nvidia",
      location: "Santa Clara, CA",
      posted: "2 days ago",
      jobType: "Full-Time",
      expireDate: "2025-10-15",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/NVIDIA_logo.svg",
    },
  ];

  const [currentPage, setCurrentPage] = useState<number>(1);

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = allJobs.slice(indexOfFirstJob, indexOfLastJob);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <>
      <ReUseHeroSection title="Open Jobs" tagline="Find your dream job with ease!" />

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
              {currentJobs.length > 0 ? (
                currentJobs.map((job) => (
                  <Col md={12} key={job.id} className="mb-4">
                    <Card className="shadow-sm border-0 rounded-4 hover-card p-3 transition-hover">
                      <Card.Body className="d-flex flex-column flex-md-row align-items-md-center">
                        <div className="me-md-3 mb-3 mb-md-0 text-center">
                          <Image
                            src={job.logo}
                            alt={`${job.company} Logo`}
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
                          <Badge
                            bg={job.jobType === "Full-Time" ? "success" : "warning"}
                            className="mb-2"
                          >
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
                ))
              ) : (
                <p>No jobs available</p>
              )}
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
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }
        .transition-hover {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Jobs;
