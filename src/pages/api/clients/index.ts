import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { createRouter } from "next-connect";
import upload from "@/lib/middleware/upload";
import { ResultSetHeader, RowDataPacket } from "mysql2";

interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// Type for a Client object
interface Client extends RowDataPacket {
  id: number;
  name: string;
  logo: string | null;
  created_at: string;
}

const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

// Middleware to handle file uploads
router.use(upload.single("logo"));

// GET /api/clients
router.get(async (req, res) => {
  try {
    const [rows] = await db.query<Client[]>(
      "SELECT * FROM clients ORDER BY created_at DESC"
    );
    res.status(200).json(rows);
  } catch (error: unknown) {
    console.error("Error fetching clients:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch clients";
    res.status(500).json({ message });
  }
});

// POST /api/clients
router.post(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Client name is required" });
  }

  const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO clients (name, logo) VALUES (?, ?)",
      [name, logoPath]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      logo: logoPath,
    });
  } catch (error: unknown) {
    console.error("Error creating client:", error);
    const message = error instanceof Error ? error.message : "Failed to create client";
    res.status(500).json({ message });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser for file uploads
  },
};

export default router.handler({
  onError(error, req, res) {
    console.error("API error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unexpected server error",
    });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: "Method not allowed" });
  },
});
