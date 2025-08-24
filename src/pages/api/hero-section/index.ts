import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const [rows] = await db.query("SELECT * FROM hero_section ORDER BY id DESC");
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { title, subtitle, background_image, cta_text, cta_link } = req.body;

      const [result] = await db.query(
        `INSERT INTO hero_section (title, subtitle, background_image, cta_text, cta_link)
         VALUES (?, ?, ?, ?, ?)`,
        [title, subtitle, background_image, cta_text, cta_link]
      );

      return res.status(201).json({
        id: (result as any).insertId,
        title,
        subtitle,
        background_image,
        cta_text,
        cta_link,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Hero Section API Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
