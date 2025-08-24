import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import multer from "multer";
import fs from "fs";
import path from "path";
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
  fileFilter: (_, file, cb: multer.FileFilterCallback) => {
    if (!file.mimetype.startsWith("image/")) cb(new Error("Only images allowed"));
    else cb(null, true);
  },
});

// Adapter for Next-connect to satisfy TypeScript
const uploadMiddleware = (req: NextApiRequestWithFile, res: NextApiResponse, next: () => void) => {
  // Here we cast to Express.Request/Response only internally
  upload.single("image")(req as unknown as Express.Request, res as unknown as Express.Response, next);
};

// Router
const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

router.use(uploadMiddleware);

// PUT /api/about/:id
router.put(async (req, res) => {
  const { id } = req.query;
  try {
    const { title, description, icon } = req.body as { title: string; description: string; icon?: string };

    const [existingRows] = await db.query<{ image?: string }[]>("SELECT image FROM about WHERE id = ?", [id]);
    const existing = existingRows[0];

    let imagePath = existing?.image ?? null;
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    res.status(500).json({ message });
  }
});

// DELETE /api/about/:id
router.delete(async (req, res) => {
  const { id } = req.query;

  try {
    const [rows] = await db.query<{ image?: string }[]>("SELECT image FROM about WHERE id = ?", [id]);
    const about = rows[0];

    if (about?.image) {
      const imgPath = path.join(process.cwd(), "public", about.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await db.query("DELETE FROM about WHERE id = ?", [id]);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Deletion failed";
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
