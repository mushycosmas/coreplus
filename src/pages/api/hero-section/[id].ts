import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface HeroSection {
  id?: number; // optional when inserting
  title: string;
  subtitle: string;
  background_image: string;
  cta_text: string;
  cta_link: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    if (req.method === "GET") {
      const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM hero_section WHERE id = ?", [id]);
      const hero = rows[0] as HeroSection | undefined;

      if (!hero) return res.status(404).json({ message: "Hero section not found" });
      return res.status(200).json(hero);
    }

    if (req.method === "PUT") {
      const { title, subtitle, background_image, cta_text, cta_link } = req.body as HeroSection;

      if (!title || !subtitle || !background_image || !cta_text || !cta_link) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const [result] = await db.query<ResultSetHeader>(
        `UPDATE hero_section 
         SET title = ?, subtitle = ?, background_image = ?, cta_text = ?, cta_link = ? 
         WHERE id = ?`,
        [title, subtitle, background_image, cta_text, cta_link, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Hero section not found" });
      }

      return res.status(200).json({ id, title, subtitle, background_image, cta_text, cta_link });
    }

    if (req.method === "DELETE") {
      const [result] = await db.query<ResultSetHeader>("DELETE FROM hero_section WHERE id = ?", [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Hero section not found" });
      }

      return res.status(200).json({ message: "Hero section deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: unknown) {
    console.error("Hero Section [id] API Error:", err);
    return res.status(500).json({ message: err instanceof Error ? err.message : "Internal server error" });
  }
}
