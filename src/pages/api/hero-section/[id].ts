import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

// Define the HeroSection type to ensure that the data has the correct shape.
interface HeroSection {
  title: string;
  subtitle: string;
  background_image: string;
  cta_text: string;
  cta_link: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Check if the ID is valid and not an array
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    if (req.method === "GET") {
      // Query the database for the hero section based on the ID
      const [rows] = await db.query<HeroSection[]>("SELECT * FROM hero_section WHERE id = ?", [id]);

      // If no row is found, return 404
      if (rows.length === 0) {
        return res.status(404).json({ message: "Hero section not found" });
      }

      return res.status(200).json(rows[0]); // Return the first row if found
    }

    if (req.method === "PUT") {
      // Destructure the body and ensure required fields are present
      const { title, subtitle, background_image, cta_text, cta_link }: HeroSection = req.body;

      if (!title || !subtitle || !background_image || !cta_text || !cta_link) {
        return res.status(400).json({ message: "All fields (title, subtitle, background_image, cta_text, cta_link) are required" });
      }

      // Update the hero section in the database
      await db.query(
        `UPDATE hero_section
         SET title = ?, subtitle = ?, background_image = ?, cta_text = ?, cta_link = ?
         WHERE id = ?`,
        [title, subtitle, background_image, cta_text, cta_link, id]
      );

      return res.status(200).json({ id, title, subtitle, background_image, cta_text, cta_link });
    }

    if (req.method === "DELETE") {
      // Delete the hero section based on the ID
      const [result] = await db.query("DELETE FROM hero_section WHERE id = ?", [id]);

      // Check if any row was affected (i.e., the section exists)
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Hero section not found" });
      }

      return res.status(200).json({ message: "Hero section deleted successfully" });
    }

    // Handle unsupported HTTP methods
    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: unknown) {
    // Log the error for debugging
    console.error("Hero Section [id] API Error:", err);

    // Handle errors from database or other unexpected errors
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
}
