import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Extend RowDataPacket for SELECT results
interface WhyChooseUsRow extends RowDataPacket {
  id: number;
  icon?: string | null;
  title: string;
  description: string;
  display_order?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    if (req.method === "GET") {
      const [rows] = await db.query<WhyChooseUsRow[]>(
        "SELECT id, icon, title, description, display_order FROM why_choose_us WHERE id = ?",
        [id]
      );

      const item = rows[0];

      if (!item) return res.status(404).json({ message: "Item not found" });

      return res.status(200).json(item);
    }

    if (req.method === "PUT") {
      const { icon, title, description, display_order } = req.body;

      if (!title || !description) {
        return res.status(400).json({ message: "Title and description are required" });
      }

      await db.query<ResultSetHeader>(
        "UPDATE why_choose_us SET icon = ?, title = ?, description = ?, display_order = ? WHERE id = ?",
        [icon || null, title, description, display_order || 0, id]
      );

      return res.status(200).json({
        id: Number(id),
        icon: icon || null,
        title,
        description,
        display_order: display_order || 0,
      });
    }

    if (req.method === "DELETE") {
      await db.query<ResultSetHeader>("DELETE FROM why_choose_us WHERE id = ?", [id]);
      return res.status(200).json({ message: "Item deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("WhyChooseUs [id] API Error:", err);
    return res.status(500).json({ message: err instanceof Error ? err.message : "Internal server error" });
  }
}
