// src/pages/api/about/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { createRouter } from "next-connect";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

// Extend NextApiRequest to include `file`
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: path.join(process.cwd(), "public/uploads"),
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Typed fileFilter
const upload = multer({
  storage,
  fileFilter: (_req: unknown, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
    } else {
      cb(null, true);
    }
  },
});

// Wrap multer for next-connect
const multerMiddleware = upload.single("image");

// Create router
const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

router.use(multerMiddleware);

// PUT /api/about/:id
router.put(async (req, res) => {
  const { id } = req.query;
  const { title, description, icon } = req.body;

  try {
    // Fetch existing image
    const [rows] = await db.query("SELECT image FROM about WHERE id = ?", [id]);
    const existing = (rows as { image: string }[])[0];

    let imagePath = existing?.image || null;

    if (req.file) {
      // Delete old image if exists
      if (existing?.image) {
        const oldPath = path.join(process.cwd(), "public", existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      imagePath = `/uploads/${req.file.filename}`;
    }

    await db.query(
      "UPDATE about SET title=?, description=?, icon=?, image=? WHERE id=?",
      [title, description, icon, imagePath, id]
    );

    res.status(200).json({ message: "Updated successfully", image: imagePath });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// DELETE /api/about/:id
router.delete(async (req, res) => {
  const { id } = req.query;

  try {
    const [rows] = await db.query("SELECT image FROM about WHERE id=?", [id]);
    const about = (rows as { image: string }[])[0];

    if (about?.image) {
      const imgPath = path.join(process.cwd(), "public", about.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await db.query("DELETE FROM about WHERE id=?", [id]);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for multer
  },
};

export default router.handler({
  onError(error, _req, res) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ message: msg });
  },
  onNoMatch(_req, res) {
    res.status(405).json({ message: "Method not allowed" });
  },
});
