import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

// Define the HeroSection type
interface HeroSection extends RowDataPacket {
  id: number;
  title: string;
  subtitle: string;
  background_image: string;
  cta_text: string;
  cta_link: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // GET: Fetch all hero sections (latest first)
    if (req.method === "GET") {
      const [rows] = await db.query<HeroSection[]>(
        "SELECT * FROM hero_section ORDER BY id DESC"
      );
      return res.status(200).json(rows);
    }

    // POST: Create a new hero section
    if (req.method === "POST") {
      const {
        title,
        subtitle,
        background_image,
        cta_text,
        cta_link,
      }: Partial<HeroSection> = req.body;

      // Validate inputs
      if (!title || !subtitle || !background_image || !cta_text || !cta_link) {
        return res.status(400).json({
          message:
            "All fields (title, subtitle, background_image, cta_text, cta_link) are required",
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

    // Unsupported HTTP method
    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: unknown) {
    console.error("Hero Section API Error:", err);

    return res.status(500).json({
      message: err instanceof Error ? err.message : "Internal server error",
    });
  }
}
