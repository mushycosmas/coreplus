import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { createRouter } from "next-connect";
import upload from "@/lib/middleware/upload";
import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";

// Extend NextApiRequest to include optional file
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// About row type
interface AboutData {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  icon?: string;
}

// Type-safe multer adapter
const multerMiddleware = (req: NextApiRequestWithFile, res: NextApiResponse, next: NextFunction) => {
  const typedReq = req as unknown as Request;
  const typedRes = res as unknown as Response;
  upload.single("image")(typedReq, typedRes, next);
};

const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

router.use(multerMiddleware);

// PUT /api/about/[id]
router.put(async (req, res) => {
  const { id } = req.query;
  const { title, description, icon } = req.body;

  try {
    const [existingRows] = await db.query<AboutData[]>(
      "SELECT image FROM about WHERE id = ?",
      [id]
    );
    const existing = existingRows[0];

    let imagePath: string | null = existing?.image ?? null;

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
    const [rows] = await db.query<AboutData[]>(
      "SELECT image FROM about WHERE id = ?",
      [id]
    );
    const about = rows[0];

    if (about?.image) {
      const imgPath = path.join(process.cwd(), "public", about.image);
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
    bodyParser: false,
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
