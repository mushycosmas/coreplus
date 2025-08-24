import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import fs from "fs";
import path from "path";
import formidable, { File } from "formidable";

// Disable Next.js default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Service type
interface Service {
  id?: number; // optional for POST
  title: string;
  description: string;
  icon: string;
  image?: string | null;
}

// Parse form using formidable
async function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
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
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // GET /api/services
    if (req.method === "GET") {
      const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM services ORDER BY id DESC");
      return res.status(200).json(rows as Service[]);
    }

    // POST /api/services
    if (req.method === "POST") {
      const { fields, files } = await parseForm(req);

      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const icon = Array.isArray(fields.icon) ? fields.icon[0] : fields.icon;

      if (!title || !description || !icon) {
        return res.status(400).json({ message: "Title, description, and icon are required" });
      }

      const uploadedFile = files.image as File | undefined;
      const imagePath = uploadedFile ? `/uploads/${path.basename(uploadedFile.filepath)}` : null;

      const [result] = await db.query<ResultSetHeader>(
        "INSERT INTO services (title, description, icon, image) VALUES (?, ?, ?, ?)",
        [title, description, icon, imagePath]
      );

      return res.status(201).json({
        id: result.insertId,
        title,
        description,
        icon,
        image: imagePath,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: unknown) {
    console.error("Services API Error:", err);
    return res.status(500).json({ message: err instanceof Error ? err.message : "Internal server error" });
  }
}
