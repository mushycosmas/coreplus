// src/pages/api/clients/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for file uploads
  },
};

// Types
interface ClientData extends RowDataPacket {
  id: number;
  name: string;
  logo?: string | null;
  created_at: string;
}

interface ClientFormFields {
  name?: string[];
}

interface ClientFiles {
  logo?: File | File[];
}

// Helper: parse formidable form
function parseForm(req: NextApiRequest): Promise<{ fields: ClientFormFields; files: ClientFiles }> {
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
      resolve({ fields: fields as ClientFormFields, files: files as ClientFiles });
    });
  });
}

// API Handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // GET /api/clients
    if (req.method === "GET") {
      const [rows] = await db.query<ClientData[]>("SELECT * FROM clients ORDER BY created_at DESC");
      return res.status(200).json(rows);
    }

    // POST /api/clients
    if (req.method === "POST") {
      const { fields, files } = await parseForm(req);

      const name = Array.isArray(fields.name) ? fields.name[0] : fields.name?.toString() ?? "";
      if (!name.trim()) {
        return res.status(400).json({ message: "Client name is required" });
      }

      // Handle uploaded logo
      let logoPath: string | null = null;
      const logoFile = files.logo;
      if (logoFile) {
        if (Array.isArray(logoFile) && logoFile[0]?.filepath) {
          logoPath = `/uploads/${path.basename(logoFile[0].filepath)}`;
        } else if ((logoFile as File).filepath) {
          logoPath = `/uploads/${path.basename((logoFile as File).filepath)}`;
        }
      }

      const [result] = await db.query<ResultSetHeader>(
        "INSERT INTO clients (name, logo) VALUES (?, ?)",
        [name, logoPath]
      );

      return res.status(201).json({
        id: result.insertId,
        name,
        logo: logoPath,
      });
    }

    // Method not allowed
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error creating client:", error);
    return res.status(500).json({ message });
  }
}
