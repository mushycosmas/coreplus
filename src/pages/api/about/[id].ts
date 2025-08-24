import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { createRouter } from "next-connect";
import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";

// Extend NextApiRequest to include the file from multer
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "public/uploads/about");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

// Multer instance
const upload = multer({
  storage,
  fileFilter: (req: NextApiRequest, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

interface AboutRow {
  image: string | null;
}

const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

// Type-safe Multer middleware wrapper
const multerMiddleware = upload.single("image");

router.use((req: NextApiRequestWithFile, res: NextApiResponse, next) => {
  multerMiddleware(req, res, (err?: unknown) => {
    if (err instanceof Error) return res.status(400).json({ message: err.message });
    next();
  });
});

// PUT /api/about/[id]
router.put(async (req, res) => {
  const { id } = req.query;
  const { title, description, icon } = req.body;

  try {
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
    const message = error instanceof Error ? error.message : "Update failed";
    res.status(500).json({ message });
  }
});

// DELETE /api/about/[id]
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
    const message = error instanceof Error ? error.message : "Deletion failed";
    res.status(500).json({ message });
  }
});

export const config = {
  api: { bodyParser: false },
};

export default router.handler({
  onError(error, req, res) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Internal error" });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: "Method not allowed" });
  },
});
