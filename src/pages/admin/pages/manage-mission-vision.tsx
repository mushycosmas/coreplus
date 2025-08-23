import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Table, Button, Modal, Form } from "react-bootstrap";

interface MissionVision {
  id: number;
  title: string;
  description: string;
  icon?: string;
  created_at: string;
}

const ManageMissionVision: React.FC = () => {
  const [items, setItems] = useState<MissionVision[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MissionVision | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", icon: "" });

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/mission-vision");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch items:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await fetch(`/api/mission-vision/${id}`, { method: "DELETE" });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (item?: MissionVision) => {
    if (item) {
      setEditing(item);
      setFormData({ title: item.title, description: item.description, icon: item.icon || "" });
    } else {
      setEditing(null);
      setFormData({ title: "", description: "", icon: "" });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await fetch(`/api/mission-vision/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/mission-vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <h2>Manage Mission & Vision</h2>
      <Button variant="primary" className="mb-3" onClick={() => openModal()}>
        Add New Item
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
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.title}</td>
              <td>{item.description}</td>
              <td>{item.icon || "-"}</td>
              <td>{new Date(item.created_at).toLocaleString()}</td>
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
          <Modal.Title>{editing ? "Edit Item" : "Add Item"}</Modal.Title>
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

export default ManageMissionVision;
