import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { createRouter } from "next-connect";
import multer from "multer";
import fs from "fs";
import path from "path";

// Multer config
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(process.cwd(), "public/uploads/about");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  }),
});

// Extend NextApiRequest to include file
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

interface AboutRow {
  image: string | null;
}

const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

// Use Multer as middleware in a type-safe way
router.use((req, res, next) => {
  upload.single("image")(req as any, res as any, (err: any) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
});

// PUT /api/about/[id] => update about
router.put(async (req, res) => {
  const { id } = req.query;
  const { title, description, icon } = req.body;

  try {
    // Get existing image
    const [existing] = await db.query("SELECT image FROM about WHERE id = ?", [id]);
    const existingItem = (existing as AboutRow[])[0];

    let imagePath = existingItem?.image || null;

    if (req.file) {
      if (existingItem?.image) {
        const oldPath = path.join(process.cwd(), "public", existingItem.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      imagePath = `/uploads/about/${req.file.filename}`;
    }

    await db.query(
      "UPDATE about SET title = ?, description = ?, image = ?, icon = ? WHERE id = ?",
      [title, description, imagePath, icon, id]
    );

    res.status(200).json({ id, title, description, image: imagePath, icon });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Update failed";
    res.status(500).json({ message: msg });
  }
});

// DELETE /api/about/[id] => delete about
router.delete(async (req, res) => {
  const { id } = req.query;

  try {
    const [rows] = await db.query("SELECT image FROM about WHERE id = ?", [id]);
    const about = (rows as AboutRow[])[0];

    if (about?.image) {
      const imgPath = path.join(process.cwd(), "public", about.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await db.query("DELETE FROM about WHERE id = ?", [id]);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Deletion failed";
    res.status(500).json({ message: msg });
  }
});

export const config = {
  api: {
    bodyParser: false, // Multer handles parsing
  },
};

export default router.handler({
  onError(error, req, res) {
    res.status(500).json({ message: error.message });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: "Method not allowed" });
  },
});
