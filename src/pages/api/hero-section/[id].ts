import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    if (req.method === "GET") {
      const [rows] = await db.query("SELECT * FROM hero_section WHERE id = ?", [id]);
      return res.status(200).json((rows as any)[0] || null);
    }

    if (req.method === "PUT") {
      const { title, subtitle, background_image, cta_text, cta_link } = req.body;

      await db.query(
        `UPDATE hero_section
         SET title = ?, subtitle = ?, background_image = ?, cta_text = ?, cta_link = ?
         WHERE id = ?`,
        [title, subtitle, background_image, cta_text, cta_link, id]
      );

      return res.status(200).json({ id, title, subtitle, background_image, cta_text, cta_link });
    }

    if (req.method === "DELETE") {
      await db.query("DELETE FROM hero_section WHERE id = ?", [id]);
      return res.status(200).json({ message: "Hero section deleted" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Hero Section [id] API Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
