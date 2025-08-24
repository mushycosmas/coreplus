"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Table, Button, Spinner, Modal, Form, Image } from "react-bootstrap";
import * as Icons from "react-icons/fa";

interface Service {
  id?: number;
  title: string;
  description?: string;
  icon?: string;
  image?: string; // new field
}

const ManageServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formData, setFormData] = useState<Partial<Service>>({
    title: "",
    description: "",
    icon: "FaCogs",
  });
  const [imageFile, setImageFile] = useState<File | null>(null); // new

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleShowModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        title: service.title,
        description: service.description,
        icon: service.icon || "FaCogs",
      });
    } else {
      setEditingService(null);
      setFormData({ title: "", description: "", icon: "FaCogs" });
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title) return alert("Title is required!");

    const data = new FormData();
    data.append("title", formData.title!);
    if (formData.description) data.append("description", formData.description);
    if (formData.icon) data.append("icon", formData.icon);
    if (imageFile) data.append("image", imageFile); // append image

    try {
      if (editingService) {
        await fetch(`/api/services/${editingService.id}`, {
          method: "PUT",
          body: data,
        });
      } else {
        await fetch("/api/services", {
          method: "POST",
          body: data,
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
      setServices(services.filter((s) => s.id !== id));
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
              <th>Image</th>
              <th>Service Title</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => {
              const IconComponent = service.icon && (Icons as any)[service.icon];
              return (
                <tr key={service.id}>
                  <td>{service.id}</td>
                  <td>{IconComponent ? <IconComponent size={24} /> : "-"}</td>
                  <td>
                    {service.image ? (
                      <Image
                        src={service.image}
                        alt={service.title}
                        height={40}
                        rounded
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{service.title}</td>
                  <td>{service.description}</td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowModal(service)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteService(service.id!)}
                    >
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
                {formData.icon &&
                  (Icons as any)[formData.icon] &&
                  React.createElement((Icons as any)[formData.icon], { size: 24 })}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
              {editingService?.image && (
                <div className="mt-2">
                  <Image
                    src={editingService.image}
                    alt="Current"
                    height={40}
                    rounded
                  />
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {editingService ? "Update" : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default ManageServices;
