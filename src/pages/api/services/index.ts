import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

// Disable Next.js body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Parse multipart/form-data with Formidable
function parseForm(req: NextApiRequest) {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    multiples: false,
    uploadDir,
    keepExtensions: true,
  });

  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

interface ServiceData extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  icon: string;
  image?: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // GET all services
    if (req.method === "GET") {
      const [rows] = await db.query<ServiceData[]>("SELECT * FROM services ORDER BY id DESC");
      return res.status(200).json(rows);
    }

    // POST → create new service
    if (req.method === "POST") {
      const { fields, files } = await parseForm(req);

      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const icon = Array.isArray(fields.icon) ? fields.icon[0] : fields.icon;

      if (!title || !description || !icon) {
        return res.status(400).json({ message: "Title, description, and icon are required" });
      }

      const uploadedFile = Array.isArray(files.image) ? files.image[0] : files.image as File | undefined;
      const imagePath = uploadedFile ? `/uploads/${uploadedFile.newFilename}` : null;

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
  } catch (err) {
    console.error("Services API error:", err);
    const message = err instanceof Error ? err.message : "Server error";
    return res.status(500).json({ message });
  }
}
