// pages/api/clients/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export const config = {
  api: { bodyParser: false },
};

function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({ multiples: false, uploadDir, keepExtensions: true });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });
}

interface ClientData extends RowDataPacket {
  id: number;
  name: string;
  logo?: string | null;
  created_at: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const [rows] = await db.query<ClientData[]>("SELECT * FROM clients ORDER BY created_at DESC");
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { fields, files } = await parseForm(req);
      const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
      if (!name) return res.status(400).json({ message: "Client name is required" });

      const uploadedFile = files.logo as File | undefined;
      const logoPath = uploadedFile ? `/uploads/${path.basename(uploadedFile.filepath)}` : null;

      const [result] = await db.query<ResultSetHeader>(
        "INSERT INTO clients (name, logo) VALUES (?, ?)",
        [name, logoPath]
      );

      return res.status(201).json({ id: result.insertId, name, logo: logoPath });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    return res.status(500).json({ message });
  }
}
