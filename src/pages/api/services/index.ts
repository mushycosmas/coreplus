import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const [rows] = await db.query("SELECT * FROM services");
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { title, description, icon } = req.body;
      const [result] = await db.query(
        "INSERT INTO services (title, description, icon) VALUES (?, ?, ?)",
        [title, description, icon]
      );
      return res.status(201).json({ id: (result as any).insertId, title, description, icon });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
