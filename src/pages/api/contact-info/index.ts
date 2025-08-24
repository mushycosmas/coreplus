import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const [rows] = await db.query("SELECT * FROM contact_info");
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { email, phone, address } = req.body;
      const [result] = await db.query(
        "INSERT INTO contact_info (email, phone, address) VALUES (?, ?, ?)",
        [email, phone, address]
      );
      return res.status(201).json({ id: (result as any).insertId, email, phone, address });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
