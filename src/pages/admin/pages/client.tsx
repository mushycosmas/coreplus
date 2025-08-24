"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Table, Button, Modal, Form } from "react-bootstrap";
import Image from "next/image";

interface Client {
  id: number;
  name: string;
  logo?: string;
  created_at: string;
}

const ManageClients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openModal = (client?: Client) => {
    if (client) {
      setEditing(client);
      setName(client.name);
      setLogoFile(null);
    } else {
      setEditing(null);
      setName("");
      setLogoFile(null);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Client name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (logoFile) {
      formData.append("logo", logoFile);
    }

    const url = editing ? `/api/clients/${editing.id}` : "/api/clients";
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) throw new Error("Failed to save client");

      setShowModal(false);
      fetchClients();
    } catch (err) {
      console.error(err);
      alert("Error saving client");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      await fetch(`/api/clients/${id}`, { method: "DELETE" });
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <h2>Manage Clients</h2>
      <Button variant="primary" className="mb-3" onClick={() => openModal()}>
        Add Client
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Logo</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center">
                No clients found.
              </td>
            </tr>
          ) : (
            clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.name}</td>
                <td>
                  {client.logo ? (
                    <Image
                      src={client.logo}
                      alt={client.name}
                      width={100}
                      height={50}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{new Date(client.created_at).toLocaleString()}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => openModal(client)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(client.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? "Edit Client" : "Add Client"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="clientName">
              <Form.Label>Client Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter client name"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="clientLogo">
              <Form.Label>Client Logo</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.files?.[0]) setLogoFile(target.files[0]);
                  else setLogoFile(null);
                }}
              />
              <Form.Text className="text-muted">
                Upload an image file for the client logo.
              </Form.Text>
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

export default ManageClients;
