// src/pages/api/about/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import upload from "@/lib/middleware/upload";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

// Extend NextApiRequest to include optional file
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// Type for About row
interface AboutData {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  icon?: string;
}

const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

// Middleware for file upload
router.use(upload.single("image"));

// PUT /api/about/[id]
router.put(async (req, res) => {
  const { id } = req.query;
  const { title, description, icon } = req.body;

  try {
    // Fetch existing row
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT image FROM about WHERE id = ?",
      [id]
    );
    const existing = rows[0] as AboutData | undefined;

    let imagePath: string | null = existing?.image ?? null;

    // Replace old image if a new file is uploaded
    if (req.file) {
      if (existing?.image) {
        const oldPath = path.join(process.cwd(), "public", existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      imagePath = `/uploads/${req.file.filename}`;
    }

    await db.query(
      "UPDATE about SET title = ?, description = ?, icon = ?, image = ? WHERE id = ?",
      [title, description, icon, imagePath, id]
    );

    res.status(200).json({ id, title, description, icon, image: imagePath });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    res.status(500).json({ message });
  }
});

// DELETE /api/about/[id]
router.delete(async (req, res) => {
  const { id } = req.query;

  try {
    // Fetch existing row to delete image
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT image FROM about WHERE id = ?",
      [id]
    );
    const existing = rows[0] as AboutData | undefined;

    if (existing?.image) {
      const imgPath = path.join(process.cwd(), "public", existing.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await db.query("DELETE FROM about WHERE id = ?", [id]);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Deletion failed";
    res.status(500).json({ message });
  }
});

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

export default router.handler({
  onError(error, _req, res) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ message });
  },
  onNoMatch(_req, res) {
    res.status(405).json({ message: "Method not allowed" });
  },
});
