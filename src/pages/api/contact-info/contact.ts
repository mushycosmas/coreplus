// pages/api/contact-info.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db"; // adjust path to your db connection
import { RowDataPacket } from "mysql2";

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContactInfo | { message: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Typed query result using RowDataPacket[]
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT email, phone, address FROM contact_info LIMIT 1"
    );

    if (!rows.length) {
      return res.status(404).json({ message: "No contact info found" });
    }

    const contact: ContactInfo = {
      email: rows[0].email,
      phone: rows[0].phone,
      address: rows[0].address,
    };

    return res.status(200).json(contact);
  } catch (err: unknown) {
    console.error("Error fetching contact info:", err);
    return res.status(500).json({
      message: err instanceof Error ? err.message : "Internal server error",
    });
  }
}
