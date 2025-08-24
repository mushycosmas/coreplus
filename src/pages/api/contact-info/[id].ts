import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

// Define the shape of the contact_info data
interface ContactInfoData extends RowDataPacket {
  id: number;
  email: string;
  phone: string;
  address: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid or missing ID" });
  }

  try {
    if (req.method === "GET") {
      // Use RowDataPacket[] and cast to ContactInfoData[]
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM contact_info WHERE id = ?",
        [id]
      );
      const contactInfo = (rows as ContactInfoData[])[0] || null;

      if (!contactInfo) {
        return res.status(404).json({ message: "Contact info not found" });
      }

      return res.status(200).json(contactInfo);
    }

    if (req.method === "PUT") {
      const { email, phone, address } = req.body;

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
      await db.query("DELETE FROM contact_info WHERE id = ?", [id]);
      return res.status(200).json({ message: "Deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return res.status(500).json({ message });
  }
}
