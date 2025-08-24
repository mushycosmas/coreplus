import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

// Define the shape of the contact_info data
interface ContactInfoData {
  email: string;
  phone: string;
  address: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Ensure that the ID is provided and is a valid string
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid or missing ID" });
  }

  try {
    if (req.method === "GET") {
      // Fetch contact info for the given ID
      const [rows] = await db.query<ContactInfoData[]>("SELECT * FROM contact_info WHERE id = ?", [id]);
      const contactInfo = rows[0] || null;
      
      if (!contactInfo) {
        return res.status(404).json({ message: "Contact info not found" });
      }

      return res.status(200).json(contactInfo); // Return the found contact info
    }

    if (req.method === "PUT") {
      // Update contact info for the given ID
      const { email, phone, address } = req.body;
      
      // Validate the request body
      if (!email || !phone || !address) {
        return res.status(400).json({ message: "All fields (email, phone, address) are required" });
      }

      await db.query(
        "UPDATE contact_info SET email = ?, phone = ?, address = ? WHERE id = ?",
        [email, phone, address, id]
      );

      return res.status(200).json({ id, email, phone, address });
    }

    if (req.method === "DELETE") {
      // Delete contact info for the given ID
      await db.query("DELETE FROM contact_info WHERE id = ?", [id]);
      return res.status(200).json({ message: "Deleted successfully" });
    }

    // If the method is neither GET, PUT, nor DELETE
    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: unknown) {
    console.error(err);

    // Handle unexpected errors
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
}
