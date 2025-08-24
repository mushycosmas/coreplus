// pages/api/mission-vision/mission-vision.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db"; // adjust path to your db connection
import { RowDataPacket } from "mysql2";

interface MissionVision {
  id: number;
  title: string;
  description: string;
  icon: string;
  created_at: string;
}

interface ResponseData {
  items?: MissionVision[];
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
    // Use RowDataPacket[] to avoid 'any'
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM mission_vision ORDER BY id ASC"
    );

    // Map each row to MissionVision
    const data: MissionVision[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      icon: row.icon,
      created_at: row.created_at,
    }));

    res.status(200).json({ items: data });
  } catch (err: unknown) {
    console.error("Failed to fetch mission & vision:", err);
    res.status(500).json({
      message: err instanceof Error ? err.message : "Internal Server Error",
    });
  }
}
