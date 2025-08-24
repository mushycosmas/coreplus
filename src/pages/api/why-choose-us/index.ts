import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { ResultSetHeader } from "mysql2";

// Define WhyChooseUs type
interface WhyChooseUs {
  id: number;
  icon: string | null;
  title: string;
  description: string;
  display_order: number;
}

// Response type
type ResponseData = WhyChooseUs[] | { id: number; icon: string | null; title: string; description: string; display_order: number } | { message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    if (req.method === "GET") {
      const [rows] = await db.query<WhyChooseUs[]>(
        "SELECT * FROM why_choose_us ORDER BY display_order ASC, id ASC"
      );
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { icon, title, description, display_order } = req.body;

      if (!title || !description) {
        return res.status(400).json({ message: "Title and description are required" });
      }

      const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO why_choose_us (icon, title, description, display_order)
         VALUES (?, ?, ?, ?)`,
        [icon || null, title, description, display_order || 0]
      );

      return res.status(201).json({
        id: result.insertId,
        icon: icon || null,
        title,
        description,
        display_order: display_order || 0,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error: unknown) {
    console.error("Why Choose Us API Error:", error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
