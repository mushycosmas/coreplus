import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const [rows] = await db.query("SELECT * FROM why_choose_us ORDER BY display_order ASC, id ASC");
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { icon, title, description, display_order } = req.body;

      const [result] = await db.query(
        `INSERT INTO why_choose_us (icon, title, description, display_order)
         VALUES (?, ?, ?, ?)`,
        [icon || null, title, description, display_order || 0]
      );

      return res.status(201).json({
        id: (result as any).insertId,
        icon,
        title,
        description,
        display_order: display_order || 0,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Why Choose Us API Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
