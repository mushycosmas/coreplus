import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Define the type for a contact record
interface ContactData extends RowDataPacket {
  id: number;
  email: string;
  phone: string;
  address: string;
  message: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM contact");
      const contacts = rows as ContactData[];
      return res.status(200).json(contacts);
    }

    if (req.method === "POST") {
      const { email, phone, address, message } = req.body;

      if (!email || !phone || !address || !message) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const [result] = await db.query<ResultSetHeader>(
        "INSERT INTO contact (email, phone, address, message) VALUES (?, ?, ?, ?)",
        [email, phone, address, message]
      );

      return res.status(201).json({
        id: result.insertId,
        email,
        phone,
        address,
        message,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return res.status(500).json({ message });
  }
}
