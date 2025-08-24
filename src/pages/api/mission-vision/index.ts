import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface MissionVision {
  id?: number; // optional for POST
  title: string;
  description: string;
  icon?: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM mission_vision ORDER BY id DESC"
      );
      return res.status(200).json(rows as MissionVision[]);
    }

    if (req.method === "POST") {
      const { title, description, icon } = req.body as MissionVision;

      if (!title || !description) {
        return res.status(400).json({ message: "Title and description are required" });
      }

      const [result] = await db.query<ResultSetHeader>(
        "INSERT INTO mission_vision (title, description, icon) VALUES (?, ?, ?)",
        [title, description, icon || null]
      );

      return res.status(201).json({
        id: result.insertId,
        title,
        description,
        icon: icon || null,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: unknown) {
    console.error("MissionVision API Error:", err);
    return res.status(500).json({
      message: err instanceof Error ? err.message : "Internal server error",
    });
  }
}
