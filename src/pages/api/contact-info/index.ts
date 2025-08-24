import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

// Define the shape of the contact_info table
interface ContactInfoData extends RowDataPacket {
  id: number;
  email: string;
  phone: string;
  address: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // GET: Fetch all contact info
    if (req.method === "GET") {
      const [rows] = await db.query<ContactInfoData[]>(
        "SELECT * FROM contact_info"
      );
      return res.status(200).json(rows);
    }

    // POST: Insert new contact info
    if (req.method === "POST") {
      const { email, phone, address }: Partial<ContactInfoData> = req.body;

      if (!email || !phone || !address) {
        return res.status(400).json({
          message: "All fields (email, phone, address) are required",
        });
      }

      const [result] = await db.query<ResultSetHeader>(
        "INSERT INTO contact_info (email, phone, address) VALUES (?, ?, ?)",
        [email, phone, address]
      );

      return res.status(201).json({
        id: result.insertId,
        email,
        phone,
        address,
      });
    }

    // Fallback for unsupported methods
    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: unknown) {
    console.error("Contact Info API Error:", err);

    return res.status(500).json({
      message: err instanceof Error ? err.message : "Internal server error",
    });
  }
}
