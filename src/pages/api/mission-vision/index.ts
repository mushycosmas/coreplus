import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

// Define the expected type of the result from the database query
interface MissionVision {
  id: number;
  title: string;
  description: string;
  icon: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const [rows] = await db.query<MissionVision[]>("SELECT * FROM mission_vision ORDER BY id DESC");
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { title, description, icon } = req.body;
      const [result] = await db.query("INSERT INTO mission_vision (title, description, icon) VALUES (?, ?, ?)", [title, description, icon || null]);
      
      // Cast result to be the correct type
      const insertResult = result as { insertId: number };
      return res.status(201).json({
        id: insertResult.insertId,
        title,
        description,
        icon
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
