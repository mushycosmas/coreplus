import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

// Define the HeroSection type for type safety
interface HeroSection {
  title: string;
  subtitle: string;
  background_image: string;
  cta_text: string;
  cta_link: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      // Fetch all hero sections from the database, ordered by the most recent one
      const [rows] = await db.query<HeroSection[]>("SELECT * FROM hero_section ORDER BY id DESC");
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      // Destructure the body to get the necessary data
      const { title, subtitle, background_image, cta_text, cta_link }: HeroSection = req.body;

      // Validate that all required fields are provided
      if (!title || !subtitle || !background_image || !cta_text || !cta_link) {
        return res.status(400).json({ message: "All fields (title, subtitle, background_image, cta_text, cta_link) are required" });
      }

      // Insert the new hero section into the database
      const [result] = await db.query(
        `INSERT INTO hero_section (title, subtitle, background_image, cta_text, cta_link)
         VALUES (?, ?, ?, ?, ?)`,
        [title, subtitle, background_image, cta_text, cta_link]
      );

      // Return the newly created hero section with its ID
      return res.status(201).json({
        id: (result as any).insertId,
        title,
        subtitle,
        background_image,
        cta_text,
        cta_link,
      });
    }

    // If method is not allowed, return a 405 response
    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    // Log the error for easier debugging
    console.error("Hero Section API Error:", err);

    // If the error is an instance of Error, provide its message
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }

    // Fallback for other types of errors
    return res.status(500).json({ message: "Internal server error" });
  }
}
