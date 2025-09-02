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
  try {
    // GET: Fetch all hero sections
    if (req.method === "GET") {
      const [rows] = await db.query<HeroSectionRow[]>(
        "SELECT * FROM hero_section ORDER BY id DESC"
      );
      return res.status(200).json(rows);
    }

    // POST: Create new hero section
    if (req.method === "POST") {
      const { fields, files } = await parseForm(req);

      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const subtitle = Array.isArray(fields.subtitle) ? fields.subtitle[0] : fields.subtitle;
      const cta_text = Array.isArray(fields.cta_text) ? fields.cta_text[0] : fields.cta_text;
      const cta_link = Array.isArray(fields.cta_link) ? fields.cta_link[0] : fields.cta_link;

      // Handle uploaded image
      const uploadedFile = Array.isArray(files.background_image)
        ? files.background_image[0]
        : (files.background_image as File | undefined);

      const background_image = uploadedFile
        ? `/uploads/${path.basename(uploadedFile.filepath)}`
        : null;

      if (!title || !subtitle || !cta_text || !cta_link || !background_image) {
        return res.status(400).json({
          message: "All fields including background image are required",
        });
      }

      const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO hero_section (title, subtitle, background_image, cta_text, cta_link)
         VALUES (?, ?, ?, ?, ?)`,
        [title, subtitle, background_image, cta_text, cta_link]
      );

      return res.status(201).json({
        id: result.insertId,
        title,
        subtitle,
        background_image,
        cta_text,
        cta_link,
      });
    }

    // Method not allowed
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } catch (err) {
    console.error("Hero Section API Error:", err);
    return res.status(500).json({ message: err instanceof Error ? err.message : "Internal server error" });
  }
}
