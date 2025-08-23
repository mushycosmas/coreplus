"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Table, Button, Spinner, Modal, Form } from "react-bootstrap";
import * as Icons from "react-icons/fa";

interface About {
  id?: number;
  title: string;
  description: string;
  image?: string;
  icon?: string;
}

const ManageAbout: React.FC = () => {
  const [abouts, setAbouts] = useState<About[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingAbout, setEditingAbout] = useState<About | null>(null);
  const [formData, setFormData] = useState<About>({
    title: "",
    description: "",
    image: "",
    icon: "FaInfoCircle",
  });

  const fetchAbouts = async () => {
    try {
      const res = await fetch("/api/about");
      const data = await res.json();
      setAbouts(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbouts();
  }, []);

  const handleShowModal = (about?: About) => {
    if (about) {
      setEditingAbout(about);
      setFormData({ ...about });
    } else {
      setEditingAbout(null);
      setFormData({ title: "", description: "", image: "", icon: "FaInfoCircle" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) return alert("Title and description are required!");

    try {
      if (editingAbout) {
        await fetch(`/api/about/${editingAbout.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/about", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      fetchAbouts();
      handleCloseModal();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteAbout = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await fetch(`/api/about/${id}`, { method: "DELETE" });
      setAbouts(abouts.filter(a => a.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AdminLayout>
      <h2 className="mb-4">Manage About</h2>
      <Button variant="primary" className="mb-3" onClick={() => handleShowModal()}>
        Add New About
      </Button>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Icon</th>
              <th>Title</th>
              <th>Description</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {abouts.map((about) => {
              const IconComponent = about.icon && (Icons as any)[about.icon];
              return (
                <tr key={about.id}>
                  <td>{about.id}</td>
                  <td>{IconComponent ? <IconComponent size={24} /> : "-"}</td>
                  <td>{about.title}</td>
                  <td>{about.description}</td>
                  <td>
                    {about.image && <img src={about.image} alt={about.title} width={50} />}
                  </td>
                  <td>
                    <Button variant="info" size="sm" className="me-2" onClick={() => handleShowModal(about)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => deleteAbout(about.id!)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      {/* Modal Form */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingAbout ? "Edit About" : "Add About"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control type="text" name="image" value={formData.image} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Icon</Form.Label>
              <Form.Select name="icon" value={formData.icon} onChange={handleChange}>
                {Object.keys(Icons).map(iconName => (
                  <option key={iconName} value={iconName}>
                    {iconName}
                  </option>
                ))}
              </Form.Select>
              <div className="mt-2">
                {formData.icon && (Icons as any)[formData.icon] && React.createElement((Icons as any)[formData.icon], { size: 24 })}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>{editingAbout ? "Update" : "Add"}</Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default ManageAbout;
