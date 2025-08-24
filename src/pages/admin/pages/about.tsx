"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Table, Button, Spinner, Modal, Form } from "react-bootstrap";
import * as Icons from "react-icons/fa";
import Image from "next/image";

interface About {
  id?: number;
  title: string;
  description: string;
  image?: string;
  icon?: keyof typeof Icons;
}

const ManageAbout: React.FC = () => {
  const [abouts, setAbouts] = useState<About[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingAbout, setEditingAbout] = useState<About | null>(null);
  const [formData, setFormData] = useState<Partial<About>>({
    title: "",
    description: "",
    icon: "FaInfoCircle",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchAbouts = async () => {
    try {
      const res = await fetch("/api/about");
      const data: About[] = await res.json();
      setAbouts(data);
    } catch (error) {
      console.error(error);
    } finally {
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
      setImageFile(null);
    } else {
      setEditingAbout(null);
      setFormData({ title: "", description: "", icon: "FaInfoCircle" });
      setImageFile(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      alert("Title and description are required!");
      return;
    }

    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("icon", formData.icon || "");
    if (imageFile) form.append("image", imageFile);

    try {
      if (editingAbout) {
        await fetch(`/api/about/${editingAbout.id}`, { method: "PUT", body: form });
      } else {
        await fetch("/api/about", { method: "POST", body: form });
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
      setAbouts(abouts.filter((a) => a.id !== id));
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
              const IconComponent = about.icon ? Icons[about.icon] : null;
              return (
                <tr key={about.id}>
                  <td>{about.id}</td>
                  <td>{IconComponent ? <IconComponent size={24} /> : "-"}</td>
                  <td>{about.title}</td>
                  <td>{about.description}</td>
                  <td>
                    {about.image && (
                      <Image
                        src={about.image}
                        alt={about.title}
                        width={50}
                        height={50}
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowModal(about)}
                    >
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
              <Form.Control type="text" name="title" value={formData.title || ""} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={formData.description || ""} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
              {formData.image && (
                <div className="mt-2">
                  <Image src={formData.image} alt="Preview" width={80} height={80} style={{ objectFit: "cover" }} />
                </div>
              )}
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
                {formData.icon && Icons[formData.icon] && React.createElement(Icons[formData.icon], { size: 24 })}
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
