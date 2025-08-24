// src/pages/api/about/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { db } from "@/lib/db";

// Extend NextApiRequest to include `file`
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// Multer storage
const storage = multer.diskStorage({
  destination: path.join(process.cwd(), "public/uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Multer upload with typed fileFilter
const upload = multer({
  storage,
  fileFilter: (req: unknown, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
    } else {
      cb(null, true);
    }
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

// Handler
export default async function handler(
  req: NextApiRequestWithFile,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    try {
      // Handle file if uploaded
      let imagePath: string | null = null;
      if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
      }

      const { id } = req.query;
      const { title, description, icon } = req.body;

      await db.query(
        "UPDATE about SET title=?, description=?, icon=?, image=? WHERE id=?",
        [title, description, icon, imagePath, id]
      );

      res.status(200).json({ message: "Updated successfully" });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  } else if (req.method === "DELETE") {
    try {
      const { id } = req.query;
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
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
