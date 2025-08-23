import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Table, Button, Modal, Form } from "react-bootstrap";

interface ContactInfo {
  id: number;
  email: string;
  phone?: string;
  address: string;
}

const ManageContactInfo: React.FC = () => {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [showModal, setShowModal] = useState(false);

  const CONTACT_ID = 1; // 👈 Replace with dynamic logic if needed

  // Fetch contact info
  const fetchContact = async () => {
    try {
      const res = await fetch(`/api/contact-info/${CONTACT_ID}`);
      if (!res.ok) throw new Error("Failed to fetch contact info");
      const data = await res.json();
      if (data) setContact(data);
    } catch (err) {
      console.error("Failed to fetch contact info:", err);
    }
  };

  // Update contact info
  const updateContact = async () => {
    if (!contact) return;
    try {
      const res = await fetch(`/api/contact-info/${contact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: contact.email,
          phone: contact.phone,
          address: contact.address,
        }),
      });
      if (!res.ok) throw new Error("Failed to update contact info");
      alert("Contact information updated successfully!");
      setShowModal(false);
      fetchContact();
    } catch (err) {
      console.error("Failed to update contact info:", err);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  return (
    <AdminLayout>
      <h2>Manage Contact Information</h2>

      {contact ? (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{contact.email}</td>
                <td>{contact.phone || "-"}</td>
                <td>{contact.address}</td>
                <td>
                  <Button variant="info" size="sm" onClick={() => setShowModal(true)}>
                    Edit
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>

          {/* Modal Form */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Contact Information</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={contact.email}
                    onChange={(e) =>
                      setContact({ ...contact, email: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    value={contact.phone || ""}
                    onChange={(e) =>
                      setContact({ ...contact, phone: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={contact.address}
                    onChange={(e) =>
                      setContact({ ...contact, address: e.target.value })
                    }
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={updateContact}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      ) : (
        <p>Loading contact information...</p>
      )}
    </AdminLayout>
  );
};

export default ManageContactInfo;
