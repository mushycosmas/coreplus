import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

// Assuming 'about' table has columns: title, description, image
interface AboutData {
  title: string;
  description: string;
  image: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      // Query data from 'about' table
      const [rows] = await db.query<AboutData[]>("SELECT * FROM about LIMIT 1"); // Adjust query if needed

      if (rows.length === 0) {
        return res.status(404).json({ message: "No About data found." });
      }

      return res.status(200).json(rows[0]); // Return first row since we are assuming one 'About' entry
    } catch (error: unknown) {
      // Handle error properly
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch About data.";
      console.error(errorMessage);
      return res.status(500).json({ message: errorMessage });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
