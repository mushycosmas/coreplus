import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";

export const config = {
  api: {
    bodyParser: false, // disable Next.js body parser for file uploads
  },
};

// Wrap formidable parse in a promise
function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

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
    if (req.method === "GET") {
      const [rows] = await db.query("SELECT * FROM about ORDER BY id DESC");
      if (!rows || (rows as any[]).length === 0) {
        return res.status(404).json({ message: "No about data found" });
      }
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { fields, files } = await parseForm(req);

      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const icon = Array.isArray(fields.icon) ? fields.icon[0] : fields.icon;

      const uploadedFile = files.image as File | undefined;
      const imagePath = uploadedFile ? `/uploads/${path.basename(uploadedFile.filepath)}` : null;

      const [result] = await db.query<{ insertId: number }>(
        "INSERT INTO about (title, description, image, icon) VALUES (?, ?, ?, ?)",
        [title, description, imagePath, icon || null]
      );

      return res.status(201).json({
        id: (result as any).insertId,
        title,
        description,
        image: imagePath,
        icon: icon || null,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return res.status(500).json({ message });
  }
}
