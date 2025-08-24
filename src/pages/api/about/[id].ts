import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";
import { RowDataPacket } from "mysql2";

interface AboutRow extends RowDataPacket {
  image?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "PUT") return res.status(405).json({ message: "Method not allowed" });

  try {
    // Query typed correctly
    const [existingRows] = await db.query<AboutRow[]>(
      "SELECT image FROM about WHERE id = ?",
      [id]
    );
    const existing = existingRows[0];

    // Example: deleting old image
    if (existing?.image) {
      const oldPath = path.join(process.cwd(), "public", existing.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // ...continue your update logic here
    res.status(200).json({ message: "Success" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    res.status(500).json({ message });
  }
}
