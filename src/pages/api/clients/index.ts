import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import nc from "next-connect";
import upload from "@/lib/middleware/upload";

interface NextApiRequestWithFile extends NextApiRequest {
  file: Express.Multer.File;
}

const handler = nc({
  onError(error, req, res) {
    res.status(500).json({ message: error.message });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: "Method not allowed" });
  },
});

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const [rows] = await db.query("SELECT * FROM clients ORDER BY created_at DESC");
  res.status(200).json(rows);
});

handler.use(upload.single("logo"));

handler.post(async (req: NextApiRequestWithFile, res: NextApiResponse) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Client name is required" });
  }

  let logoPath = null;
  if (req.file) {
    logoPath = "/uploads/" + req.file.filename;
  }

  const [result] = await db.query(
    "INSERT INTO clients (name, logo) VALUES (?, ?)",
    [name, logoPath]
  );

  res.status(201).json({ id: (result as any).insertId, name, logo: logoPath });
});

export const config = {
  api: {
    bodyParser: false, // Let multer handle multipart/form-data
  },
};

export default handler;
