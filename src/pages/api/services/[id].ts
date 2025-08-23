import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    if (req.method === "PUT") {
      const { title, description, icon } = req.body;
      await db.query(
        "UPDATE services SET title = ?, description = ?, icon = ? WHERE id = ?",
        [title, description, icon, id]
      );
      return res.status(200).json({ id, title, description, icon });
    }

    if (req.method === "DELETE") {
      await db.query("DELETE FROM services WHERE id = ?", [id]);
      return res.status(200).json({ message: "Deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
