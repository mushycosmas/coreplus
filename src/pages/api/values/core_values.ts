import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

// Type for a core value
interface CoreValue extends RowDataPacket {
  title: string;
  description: string;
  icon: string | null;
}

// API response type
type ResponseData = { coreValues: CoreValue[] } | { message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Query the 'values' table with correct typing
    const [rows] = await db.query<RowDataPacket[] & CoreValue[]>(
      "SELECT title, description, icon FROM `values` ORDER BY id DESC"
    );

    if (!rows.length) {
      return res.status(404).json({ message: "No core values found." });
    }

    return res.status(200).json({ coreValues: rows });
  } catch (err) {
    console.error("Error fetching core values:", err);
    return res.status(500).json({
      message: err instanceof Error ? err.message : "Internal server error",
    });
  }
}
