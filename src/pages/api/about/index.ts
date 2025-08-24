import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { createRouter } from "next-connect";
import upload from "@/lib/middleware/upload";

interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

router.use(upload.single("image"));

// GET /api/about
router.get(async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM about ORDER BY id DESC");

    // If rows are empty
    if (rows.length === 0) {
      return res.status(404).json({ message: "No about data found" });
    }

    res.status(200).json(rows);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch about items";
    res.status(500).json({ message: errorMessage });
  }
});

// POST /api/about
router.post(async (req, res) => {
  const { title, description, icon } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const [result] = await db.query("INSERT INTO about (title, description, image, icon) VALUES (?, ?, ?, ?)", [
      title,
      description,
      imagePath,
      icon,
    ]);

    // Type assertion for insertId, using the proper result structure
    const insertId = (result as { insertId: number }).insertId;

    res.status(201).json({
      id: insertId,
      title,
      description,
      image: imagePath,
      icon,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create about";
    res.status(500).json({ message: errorMessage });
  }
});

export const config = {
  api: {
    bodyParser: false, // Because we're using file uploads
  },
};

export default router.handler({
  onError(error, req, res) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ message: errorMessage });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: "Method not allowed" });
  },
});
