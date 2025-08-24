import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    if (req.method === "GET") {
      const [rows] = await db.query("SELECT * FROM why_choose_us WHERE id = ?", [id]);
      return res.status(200).json((rows as any)[0] || null);
    }

    if (req.method === "PUT") {
      const { icon, title, description, display_order } = req.body;

      await db.query(
        `UPDATE why_choose_us
         SET icon = ?, title = ?, description = ?, display_order = ?
         WHERE id = ?`,
        [icon, title, description, display_order, id]
      );

      return res.status(200).json({ id, icon, title, description, display_order });
    }

    if (req.method === "DELETE") {
      await db.query("DELETE FROM why_choose_us WHERE id = ?", [id]);
      return res.status(200).json({ message: "Item deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Why Choose Us [id] API Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
