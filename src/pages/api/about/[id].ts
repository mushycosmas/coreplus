import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

// Extend NextApiRequest to include optional file
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

interface AboutData {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  icon?: string;
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

// Helper to run multer as a promise
const runMiddleware = (req: NextApiRequestWithFile, res: NextApiResponse) =>
  new Promise<void>((resolve, reject) => {
    upload.single("image")(req as any, res as any, (err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });

export const config = {
  api: {
    bodyParser: false, // required for file uploads
  },
};

export default async function handler(
  req: NextApiRequestWithFile,
  res: NextApiResponse
) {
  const { id } = req.query;

  try {
    // Run multer middleware only when PUT method
    if (req.method === "PUT") {
      await runMiddleware(req, res);

      const { title, description, icon } = req.body;

      // Get existing row
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT image FROM about WHERE id = ?",
        [id]
      );
      const existing = rows[0] as AboutData | undefined;

      // Compute new image path
      const imagePath: string | null = req.file
        ? (() => {
            if (existing?.image) {
              const oldPath = path.join(process.cwd(), "public", existing.image);
              if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            return `/uploads/${req.file.filename}`;
          })()
        : existing?.image ?? null;

      await db.query(
        "UPDATE about SET title = ?, description = ?, icon = ?, image = ? WHERE id = ?",
        [title, description, icon, imagePath, id]
      );

      return res.status(200).json({ id, title, description, icon, image: imagePath });
    }

    if (req.method === "DELETE") {
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
      return res.status(200).json({ message: "Deleted successfully" });
    }

    res.setHeader("Allow", ["PUT", "DELETE"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ message });
  }
}
