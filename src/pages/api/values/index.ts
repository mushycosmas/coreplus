import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

// Define Value type (row from DB)
interface Value extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  icon: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Value[] | Value | { message: string }>
) {
  try {
    if (req.method === "GET") {
      const [rows] = await db.query<Value[]>(
        "SELECT * FROM `values` ORDER BY id DESC"
      );
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { title, description, icon } = req.body;

      if (!title || !description) {
        return res.status(400).json({ message: "Title and description are required" });
      }

      const [result] = await db.query<ResultSetHeader>(
        "INSERT INTO `values` (title, description, icon) VALUES (?, ?, ?)",
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
  } catch (error: unknown) {
    console.error("Error in /api/values:", error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
