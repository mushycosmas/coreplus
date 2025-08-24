import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Table, Button, Modal, Form } from "react-bootstrap";

interface CoreValue {
  id: number;
  title: string;
  description: string;
  icon?: string;
  created_at: string;
}

const ManageValues: React.FC = () => {
  const [values, setValues] = useState<CoreValue[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CoreValue | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", icon: "" });

  const fetchValues = async () => {
    try {
      const res = await fetch("/api/values");
      const data = await res.json();
      setValues(data);
    } catch (err) {
      console.error("Failed to fetch core values:", err);
    }
  };

  useEffect(() => {
    fetchValues();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this core value?")) return;
    try {
      await fetch(`/api/values/${id}`, { method: "DELETE" });
      fetchValues();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (value?: CoreValue) => {
    if (value) {
      setEditing(value);
      setFormData({ title: value.title, description: value.description, icon: value.icon || "" });
    } else {
      setEditing(null);
      setFormData({ title: "", description: "", icon: "" });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await fetch(`/api/values/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/values", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      setShowModal(false);
      fetchValues();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <h2>Manage Core Values</h2>
      <Button variant="primary" className="mb-3" onClick={() => openModal()}>
        Add New Core Value
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Description</th>
            <th>Icon</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {values.map((val) => (
            <tr key={val.id}>
              <td>{val.id}</td>
              <td>{val.title}</td>
              <td>{val.description}</td>
              <td>{val.icon || "-"}</td>
              <td>{new Date(val.created_at).toLocaleString()}</td>
              <td>
                <Button variant="info" size="sm" className="me-2" onClick={() => openModal(val)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(val.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Edit Core Value" : "Add Core Value"}</Modal.Title>
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
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Icon Class</Form.Label>
              <Form.Control
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g. FaStar"
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

export default ManageValues;
