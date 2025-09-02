// pages/api/hero-section/heroSection.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface HeroSection {
  id: number;
  title: string;
  subtitle: string;
  background_image: string;
  cta_text: string;
  cta_link: string;
  created_at: string;
}

interface ResponseData {
  items?: HeroSection[];
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM hero_section ORDER BY id ASC"
    );

    const data: HeroSection[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      background_image: row.background_image,
      cta_text: row.cta_text,
      cta_link: row.cta_link,
      created_at: row.created_at,
    }));

    res.status(200).json({ items: data });
  } catch (err: unknown) {
    console.error("Failed to fetch hero sections:", err);
    res.status(500).json({
      message: err instanceof Error ? err.message : "Internal Server Error",
    });
  }
}
