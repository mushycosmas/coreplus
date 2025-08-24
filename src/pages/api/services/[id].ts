import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";
import { RowDataPacket } from "mysql2";

interface ServiceRow extends RowDataPacket {
  image?: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid or missing ID" });
  }

  try {
    if (req.method === "PUT") {
      const { title, description, icon, image } = req.body;

      if (!title || !description || !icon) {
        return res.status(400).json({ message: "Title, description, and icon are required" });
      }

      // Get existing service
      const [existingRows] = await db.query<ServiceRow[]>(
        "SELECT image FROM services WHERE id = ?",
        [id]
      );
      const existing = existingRows[0];

      let imagePath = image || existing?.image || null;

      // Delete old image if a new one is provided
      if (image && existing?.image && existing.image !== image) {
        const oldPath = path.join(process.cwd(), "public", existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // Update service in DB
      await db.query(
        "UPDATE services SET title = ?, description = ?, icon = ?, image = ? WHERE id = ?",
        [title, description, icon, imagePath, id]
      );

      return res.status(200).json({ id: Number(id), title, description, icon, image: imagePath });
    }

    if (req.method === "DELETE") {
      // Get existing service
      const [existingRows] = await db.query<ServiceRow[]>(
        "SELECT image FROM services WHERE id = ?",
        [id]
      );
      const existing = existingRows[0];

      if (!existing) {
        return res.status(404).json({ message: "Service not found" });
      }

      // Delete image if exists
      if (existing.image) {
        const oldPath = path.join(process.cwd(), "public", existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // Delete service from DB
      await db.query("DELETE FROM services WHERE id = ?", [id]);

      return res.status(200).json({ message: "Service deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error("Service [id] API error:", err);
    return res.status(500).json({ message });
  }
}
