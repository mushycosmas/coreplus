import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    if (req.method === "PUT") {
      const { title, description, image, icon } = req.body;
      await db.query(
        "UPDATE about SET title = ?, description = ?, image = ?, icon = ? WHERE id = ?",
        [title, description, image || null, icon || null, id]
      );
      return res.status(200).json({ id, title, description, image, icon });
    }

    if (req.method === "DELETE") {
      await db.query("DELETE FROM about WHERE id = ?", [id]);
      return res.status(200).json({ message: "Deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
