// src/pages/api/clients/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const config = {
  api: {
    bodyParser: false, // Disable default parser for file uploads
  },
};

interface ClientData {
  id: number;
  name: string;
  logo?: string | null;
  created_at: string;
}

// Safe parseForm utility
function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    multiples: false,
    uploadDir,
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // GET /api/clients
    if (req.method === "GET") {
      const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM clients ORDER BY created_at DESC");
      return res.status(200).json(rows as ClientData[]);
    }

    // POST /api/clients
    if (req.method === "POST") {
      const { fields, files } = await parseForm(req);

      // Handle client name
      const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
      if (!name || !name.toString().trim()) {
        return res.status(400).json({ message: "Client name is required" });
      }

      // Handle logo file safely
      let logoPath: string | null = null;
      const logoFile = files.logo;

      if (logoFile) {
        if (Array.isArray(logoFile) && logoFile[0]?.filepath) {
          logoPath = `/uploads/${path.basename(logoFile[0].filepath)}`;
        } else if ((logoFile as File).filepath) {
          logoPath = `/uploads/${path.basename((logoFile as File).filepath)}`;
        }
      }

      // Insert into database
      const [result] = await db.query<ResultSetHeader>(
        "INSERT INTO clients (name, logo) VALUES (?, ?)",
        [name.toString(), logoPath]
      );

      return res.status(201).json({
        id: result.insertId,
        name: name.toString(),
        logo: logoPath,
      });
    }

    // Method not allowed
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
