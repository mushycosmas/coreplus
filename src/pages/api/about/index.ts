// src/pages/api/about/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { createRouter } from "next-connect";
import upload from "@/lib/middleware/upload";

// Extend NextApiRequest to include optional `file`
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// Type for About row
interface AboutData {
  id?: number;
  title: string;
  description: string;
  image?: string | null;
  icon?: string | null;
}

const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

// Wrap multer middleware for next-connect
router.use((req, res, next) => {
  upload.single("image")(req as unknown as Express.Request, res as unknown as Express.Response, next);
});

// GET /api/about
router.get(async (req, res) => {
  try {
    const [rows] = await db.query<AboutData[]>("SELECT * FROM about ORDER BY id DESC");

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No about data found" });
    }

    res.status(200).json(rows);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch about items";
    res.status(500).json({ message });
  }
});

// POST /api/about
router.post(async (req, res) => {
  try {
    const body = req.body as { title: string; description: string; icon?: string };
    const { title, description, icon } = body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query<{ insertId: number }>(
      "INSERT INTO about (title, description, image, icon) VALUES (?, ?, ?, ?)",
      [title, description, imagePath, icon || null]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      description,
      image: imagePath,
      icon: icon || null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create about";
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
