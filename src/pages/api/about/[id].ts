// src/pages/api/about/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "@/lib/db";

// Extend NextApiRequest to include optional file
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// Multer setup
const storage = multer.diskStorage({
  destination: path.join(process.cwd(), "public/uploads"),
  filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) cb(new Error("Only images allowed"));
    else cb(null, true);
  },
});

// Adapter to wrap multer middleware for Next.js
const multerMiddleware = (req: NextApiRequestWithFile, res: NextApiResponse, next: () => void) => {
  return upload.single("image")(req as unknown as Express.Request, res as unknown as Express.Response, next);
};

export const config = {
  api: {
    bodyParser: false, // required for file uploads
  },
};

export default async function handler(req: NextApiRequestWithFile, res: NextApiResponse) {
  await new Promise<void>((resolve, reject) => {
    multerMiddleware(req, res, (err?: unknown) => {
      if (err) reject(err);
      else resolve();
    });
  });

  const { id } = req.query;

  if (req.method === "PUT") {
    try {
      const { title, description, icon } = req.body;
      const newImagePath: string | null = req.file ? `/uploads/${req.file.filename}` : null;

      const [existingRows] = await db.query("SELECT image FROM about WHERE id=?", [id]);
      const existing = (existingRows as { image?: string }[])[0];

      // Delete old image if replaced
      if (existing?.image && newImagePath) {
        const oldPath = path.join(process.cwd(), "public", existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // Use new image if uploaded, otherwise keep existing
      const imagePathToSave = newImagePath ?? existing?.image ?? null;

      await db.query(
        "UPDATE about SET title=?, description=?, icon=?, image=? WHERE id=?",
        [title, description, icon, imagePathToSave, id]
      );

      res.status(200).json({ message: "Updated successfully" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed";
      res.status(500).json({ message });
    }
  } else if (req.method === "DELETE") {
    try {
      const [rows] = await db.query("SELECT image FROM about WHERE id=?", [id]);
      const about = (rows as { image?: string }[])[0];

      if (about?.image) {
        const imgPath = path.join(process.cwd(), "public", about.image);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }

      await db.query("DELETE FROM about WHERE id=?", [id]);
      res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Deletion failed";
      res.status(500).json({ message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
