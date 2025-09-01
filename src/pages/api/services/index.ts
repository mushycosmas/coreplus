import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const config = {
  api: {
    bodyParser: false, // disable Next.js default parser
  },
};

// Parse multipart/form-data
const parseForm = (req: NextApiRequest) => {
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
};

interface ServiceRow extends RowDataPacket {
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
      const [rows] = await db.query<ServiceRow[]>("SELECT * FROM services ORDER BY id DESC");
      return res.status(200).json(rows);
    }

    // POST new service
    if (req.method === "POST") {
      const { fields, files } = await parseForm(req);

      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const icon = Array.isArray(fields.icon) ? fields.icon[0] : fields.icon;

      if (!title || !icon) return res.status(400).json({ message: "Title and icon are required" });

      // Handle uploaded image
      const uploadedFile = Array.isArray(files.image) ? files.image[0] : (files.image as File | undefined);
      const imagePath = uploadedFile ? `/uploads/${path.basename(uploadedFile.filepath)}` : null;

      const [result] = await db.query<ResultSetHeader>(
        "INSERT INTO services (title, description, icon, image) VALUES (?, ?, ?, ?)",
        [title, description || null, icon, imagePath]
      );

      return res.status(201).json({
        id: result.insertId,
        title,
        description,
        icon,
        image: imagePath,
      });
    }

    // Method not allowed
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("Services API error:", error);
    return res.status(500).json({ message });
  }
}
