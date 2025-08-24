// pages/admin/manage-contact.tsx
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Table, Button } from "react-bootstrap";

interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
}

const ManageContact: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/contact"); // GET all contacts
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    }
  };

  const deleteContact = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await fetch(`/api/contact/${id}`, { method: "DELETE" }); // ✅ Use dynamic route
      fetchContacts(); // Refresh list after deletion
    } catch (err) {
      console.error("Failed to delete contact:", err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <AdminLayout>
      <h2>Manage Contact Messages</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Message</th>
            <th>Received At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.id}</td>
              <td>{contact.name}</td>
              <td>{contact.email}</td>
              <td>{contact.phone || "-"}</td>
              <td>{contact.message}</td>
              <td>{new Date(contact.created_at).toLocaleString()}</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteContact(contact.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </AdminLayout>
  );
};

export default ManageContact;
