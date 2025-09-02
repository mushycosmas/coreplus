import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export const config = { api: { bodyParser: false } };

interface HeroSectionRow extends RowDataPacket {
  id: number;
  title: string;
  subtitle: string;
  background_image?: string | null;
  cta_text: string;
  cta_link: string;
}

// Helper to parse multipart/form-data
const parseForm = (req: NextApiRequest) => {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({ multiples: false, uploadDir, keepExtensions: true });

  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) return res.status(400).json({ message: "Invalid ID" });

  try {
    // GET hero section
    if (req.method === "GET") {
      const [rows] = await db.query<HeroSectionRow[]>("SELECT * FROM hero_section WHERE id = ?", [id]);
      const hero = rows[0];
      if (!hero) return res.status(404).json({ message: "Hero section not found" });
      return res.status(200).json(hero);
    }

    // DELETE hero section
    if (req.method === "DELETE") {
      const [rows] = await db.query<HeroSectionRow[]>("SELECT * FROM hero_section WHERE id = ?", [id]);
      const hero = rows[0];
      if (!hero) return res.status(404).json({ message: "Hero section not found" });

      // Remove old image
      if (hero.background_image) {
        const oldPath = path.join(process.cwd(), "public", hero.background_image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const [result] = await db.query<ResultSetHeader>("DELETE FROM hero_section WHERE id = ?", [id]);
      return res.status(200).json({ message: "Hero section deleted successfully" });
    }

    // PUT (update) hero section
    if (req.method === "PUT") {
      const { fields, files } = await parseForm(req);

      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const subtitle = Array.isArray(fields.subtitle) ? fields.subtitle[0] : fields.subtitle;
      const cta_text = Array.isArray(fields.cta_text) ? fields.cta_text[0] : fields.cta_text;
      const cta_link = Array.isArray(fields.cta_link) ? fields.cta_link[0] : fields.cta_link;

      if (!title || !subtitle || !cta_text || !cta_link)
        return res.status(400).json({ message: "All fields except image are required" });

      // Handle new image
      const uploadedFile = Array.isArray(files.background_image)
        ? files.background_image[0]
        : (files.background_image as File | undefined);

      let imagePath: string | null = null;

      if (uploadedFile) {
        imagePath = `/uploads/${path.basename(uploadedFile.filepath)}`;

        // Delete old image if exists
        const [rows] = await db.query<HeroSectionRow[]>("SELECT * FROM hero_section WHERE id = ?", [id]);
        const existing = rows[0];
        if (existing?.background_image) {
          const oldPath = path.join(process.cwd(), "public", existing.background_image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      // Update DB
      await db.query<ResultSetHeader>(
        "UPDATE hero_section SET title = ?, subtitle = ?, cta_text = ?, cta_link = ?" +
          (imagePath ? ", background_image = ?" : "") +
          " WHERE id = ?",
        imagePath
          ? [title, subtitle, cta_text, cta_link, imagePath, id]
          : [title, subtitle, cta_text, cta_link, id]
      );

      return res.status(200).json({
        id: Number(id),
        title,
        subtitle,
        cta_text,
        cta_link,
        background_image: imagePath ?? undefined,
      });
    }

    // Method not allowed
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } catch (err) {
    console.error("Hero Section [id] API Error:", err);
    return res.status(500).json({ message: err instanceof Error ? err.message : "Internal server error" });
  }
}
