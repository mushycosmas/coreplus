import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

// Define WhyChooseUs type (row from DB)
interface WhyChooseUs extends RowDataPacket {
  id: number;
  icon: string | null;
  title: string;
  description: string;
  display_order: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WhyChooseUs | { message: string } | null>
) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  try {
    if (req.method === "GET") {
      const [rows] = await db.query<WhyChooseUs[]>(
        "SELECT * FROM why_choose_us WHERE id = ?",
        [id]
      );
      return res.status(200).json(rows[0] || null);
    }

    if (req.method === "PUT") {
      const { icon, title, description, display_order } = req.body;

      await db.query(
        `UPDATE why_choose_us
         SET icon = ?, title = ?, description = ?, display_order = ?
         WHERE id = ?`,
        [icon, title, description, display_order, id]
      );

      return res.status(200).json({
        id: Number(id),
        icon: icon || null,
        title,
        description,
        display_order,
      });
    }

    if (req.method === "DELETE") {
      await db.query("DELETE FROM why_choose_us WHERE id = ?", [id]);
      return res.status(200).json({ message: "Item deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error: unknown) {
    console.error("Why Choose Us [id] API Error:", error);
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
