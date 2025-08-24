import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import multer from "multer";
import fs from "fs";
import path from "path";

// Extend NextApiRequest to include optional file
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// Multer storage & filter
const storage = multer.diskStorage({
  destination: path.join(process.cwd(), "public/uploads"),
  filename: (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  fileFilter: (_, file, cb: multer.FileFilterCallback) => {
    if (!file.mimetype.startsWith("image/")) cb(new Error("Only images allowed"));
    else cb(null, true);
  },
});

// Helper to run multer in Next.js API
const runMiddleware = (req: NextApiRequestWithFile, res: NextApiResponse) =>
  new Promise<void>((resolve, reject) => {
    upload.single("image")(req, res, (err) => (err ? reject(err) : resolve()));
  });

export const config = {
  api: {
    bodyParser: false,
  },
};

// Handler
export default async function handler(req: NextApiRequestWithFile, res: NextApiResponse) {
  const { id } = req.query;

  try {
    if (req.method === "PUT") {
      await runMiddleware(req, res);

      const { title, description, icon } = req.body as {
        title: string;
        description: string;
        icon?: string;
      };

      const [existingRows] = await db.query<{ image?: string }[]>(
        "SELECT image FROM about WHERE id = ?",
        [id]
      );
      const existing = existingRows[0];

      const imagePath = req.file ? `/uploads/${req.file.filename}` : existing?.image ?? null;

      // Delete old image if replaced
      if (req.file && existing?.image) {
        const oldPath = path.join(process.cwd(), "public", existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      await db.query(
        "UPDATE about SET title = ?, description = ?, icon = ?, image = ? WHERE id = ?",
        [title, description, icon, imagePath, id]
      );

      return res.status(200).json({ id, title, description, icon, image: imagePath });
    }

    if (req.method === "DELETE") {
      const [rows] = await db.query<{ image?: string }[]>("SELECT image FROM about WHERE id = ?", [id]);
      const about = rows[0];

      if (about?.image) {
        const imgPath = path.join(process.cwd(), "public", about.image);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }

      await db.query("DELETE FROM about WHERE id = ?", [id]);
      return res.status(200).json({ message: "Deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return res.status(500).json({ message });
  }
}
