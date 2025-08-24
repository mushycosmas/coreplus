import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

// Row type for SELECT queries
interface WhyChooseUsRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ items: WhyChooseUsRow[] } | { message: string }>
) {
  // Get the limit query parameter, default to 1 if not provided
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 1;

  try {
    // Fetch data from the database
    const [rows] = await db.query<WhyChooseUsRow[]>(
      "SELECT id, title, description FROM why_choose_us ORDER BY id DESC LIMIT ?",
      [limit]
    );

    // If no items are found, return a 404 response
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No 'Why Choose Us' items found." });
    }

    // Respond with the fetched data
    return res.status(200).json({ items: rows });
  } catch (err) {
    console.error("Error fetching 'Why Choose Us' data:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
