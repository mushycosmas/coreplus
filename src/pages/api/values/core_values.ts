import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db"; // Assuming db is set up for your database

interface CoreValue {
  title: string;
  description: string;
  icon: string; // Store icon as a string, and map it to an actual icon in the frontend
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Using backticks to escape the 'values' table name
    const [rows] = await db.query<CoreValue[]>(
      "SELECT title, description, icon FROM `values` ORDER BY id DESC"
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No core values found." });
    }

    // Transform icon string to JSX element (you can handle this in frontend)
    const coreValues = rows.map((row) => ({
      ...row,
      icon: row.icon, // You can map this to an actual icon in frontend
    }));

    res.status(200).json({ coreValues });
  } catch (err) {
    console.error("Error fetching core values:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
