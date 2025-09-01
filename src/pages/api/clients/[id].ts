import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const config = {
  api: {
    bodyParser: false, // Disable default Next.js body parser
  },
};

interface ClientRow extends RowDataPacket {
  id: number;
  name: string;
  logo?: string | null;
}

interface ClientFormFields {
  name?: string[];
}

interface ClientFiles {
  logo?: File[];
}

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
      if (err) reject(err);
      else resolve({ fields: fields as ClientFormFields, files: files as ClientFiles });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "PUT") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { fields, files } = await parseForm(req);

    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name ?? "";
    if (!name.trim()) return res.status(400).json({ message: "Client name is required" });

    // Get existing client
    const [existingRows] = await db.query<ClientRow[]>("SELECT * FROM clients WHERE id = ?", [id]);
    const existing = existingRows[0];
    if (!existing) return res.status(404).json({ message: "Client not found" });

    // Handle new logo
    const uploadedFile = files.logo?.[0];
    let logoPath: string | null = existing.logo || null;
    if (uploadedFile) {
      logoPath = `/uploads/${path.basename(uploadedFile.filepath)}`;

      // Delete old logo if exists
      if (existing.logo) {
        const oldPath = path.join(process.cwd(), "public", existing.logo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    // Update client in DB
    await db.query<ResultSetHeader>("UPDATE clients SET name = ?, logo = ? WHERE id = ?", [
      name,
      logoPath,
      id,
    ]);

    res.status(200).json({ id, name, logo: logoPath });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("Error updating client:", error);
    res.status(500).json({ message });
  }
}
