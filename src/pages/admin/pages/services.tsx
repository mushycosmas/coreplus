"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Table, Button, Spinner, Modal, Form } from "react-bootstrap";
import * as Icons from "react-icons/fa"; // Import all icons

interface Service {
  id?: number;
  title: string;
  description?: string;
  icon?: string;
}

const ManageServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Service>({ title: "", description: "", icon: "FaCogs" });

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleShowModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({ ...service });
    } else {
      setEditingService(null);
      setFormData({ title: "", description: "", icon: "FaCogs" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.title) return alert("Title is required!");

    try {
      if (editingService) {
        await fetch(`/api/services/${editingService.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      fetchServices();
      handleCloseModal();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteService = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await fetch(`/api/services/${id}`, { method: "DELETE" });
      setServices(services.filter(s => s.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AdminLayout>
      <h2 className="mb-4">Manage Services</h2>
      <Button variant="primary" className="mb-3" onClick={() => handleShowModal()}>
        Add New Service
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
              <th>Service Title</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => {
              const IconComponent = service.icon && (Icons as any)[service.icon];
              return (
                <tr key={service.id}>
                  <td>{service.id}</td>
                  <td>{IconComponent ? <IconComponent size={24} /> : "-"}</td>
                  <td>{service.title}</td>
                  <td>{service.description}</td>
                  <td>
                    <Button variant="info" size="sm" className="me-2" onClick={() => handleShowModal(service)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => deleteService(service.id!)}>
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
          <Modal.Title>{editingService ? "Edit Service" : "Add Service"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Icon</Form.Label>
              <Form.Select name="icon" value={formData.icon} onChange={handleChange}>
                {Object.keys(Icons).map((iconName) => (
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
          <Button variant="primary" onClick={handleSubmit}>{editingService ? "Update" : "Add"}</Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default ManageServices;
