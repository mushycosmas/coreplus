// pages/api/mission-vision.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db"; // adjust if you have db connection

interface MissionVision {
  id: number;
  title: string;
  description: string;
  icon: string;
  created_at: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const [rows]: any = await db.query("SELECT * FROM mission_vision ORDER BY id ASC");
    const data: MissionVision[] = rows;
    res.status(200).json({ items: data });
  } catch (err) {
    console.error("Failed to fetch mission & vision:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
