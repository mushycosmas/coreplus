// File: pages/api/contact-info/[id].ts

import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid or missing ID" });
  }

  try {
    if (req.method === "GET") {
      const [rows] = await db.query("SELECT * FROM contact_info WHERE id = ?", [id]);
      return res.status(200).json((rows as any)[0] || null);
    }

    if (req.method === "PUT") {
      const { email, phone, address } = req.body;
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
