"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Table, Button, Modal, Form } from "react-bootstrap";
import Image from "next/image";

interface HeroSection {
  id: number;
  title: string;
  subtitle: string;
  background_image?: string;
  cta_text?: string;
  cta_link?: string;
}

const ManageHeroSection: React.FC = () => {
  const [items, setItems] = useState<HeroSection[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<HeroSection | null>(null);
  const [formData, setFormData] = useState<HeroSection>({
    id: 0,
    title: "",
    subtitle: "",
    background_image: "",
    cta_text: "",
    cta_link: "",
  });

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/hero-section");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch hero sections:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await fetch(`/api/hero-section/${id}`, { method: "DELETE" });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (item?: HeroSection) => {
    if (item) {
      setEditing(item);
      setFormData({ ...item });
    } else {
      setEditing(null);
      setFormData({
        id: 0,
        title: "",
        subtitle: "",
        background_image: "",
        cta_text: "",
        cta_link: "",
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/hero-section/${editing.id}` : "/api/hero-section";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <h2>Manage Hero Section</h2>
      <Button variant="primary" className="mb-3" onClick={() => openModal()}>
        Add Hero Item
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Subtitle</th>
            <th>Image</th>
            <th>CTA</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.title}</td>
              <td>{item.subtitle}</td>
              <td>
                {item.background_image ? (
                  <div style={{ width: 100, height: 60, position: "relative" }}>
                    <Image
                      src={item.background_image}
                      alt={item.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  "-"
                )}
              </td>
              <td>
                {item.cta_text ? (
                  <a href={item.cta_link || "#"} target="_blank" rel="noopener noreferrer">
                    {item.cta_text}
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td>
                <Button variant="info" size="sm" className="me-2" onClick={() => openModal(item)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Edit Hero Item" : "Add Hero Item"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Subtitle</Form.Label>
              <Form.Control
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Background Image URL</Form.Label>
              <Form.Control
                type="text"
                value={formData.background_image}
                onChange={(e) => setFormData({ ...formData, background_image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>CTA Text</Form.Label>
              <Form.Control
                type="text"
                value={formData.cta_text}
                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                placeholder="Call to Action"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>CTA Link</Form.Label>
              <Form.Control
                type="text"
                value={formData.cta_link}
                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                placeholder="https://example.com"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default ManageHeroSection;
