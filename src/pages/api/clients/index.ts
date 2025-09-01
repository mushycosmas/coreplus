import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Disable default Next.js body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Interfaces
interface ServiceData extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  icon: string;
  image?: string | null;
}

interface ServiceFormFields {
  title?: string | string[];
  description?: string | string[];
  icon?: string | string[];
}

interface ServiceFiles {
  image?: File | File[];
}

// Helper to parse form
const parseForm = (req: NextApiRequest): Promise<{ fields: ServiceFormFields; files: ServiceFiles }> => {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    multiples: false,
    keepExtensions: true,
    uploadDir,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields: fields as ServiceFormFields, files: files as ServiceFiles });
    });
  });
};

// API handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // GET /api/services
    if (req.method === "GET") {
      const [rows] = await db.query<ServiceData[]>("SELECT * FROM services ORDER BY id DESC");
      return res.status(200).json(rows);
    }

    // POST /api/services
    if (req.method === "POST") {
      const { fields, files } = await parseForm(req);

      // Parse fields
      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const icon = Array.isArray(fields.icon) ? fields.icon[0] : fields.icon;

      if (!title || !description || !icon) {
        return res.status(400).json({ message: "Title, description, and icon are required" });
      }

      // Handle uploaded image
      const uploadedFile = files.image;
      let imagePath: string | null = null;
      if (uploadedFile) {
        const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
        if (file.filepath) {
          imagePath = `/uploads/${path.basename(file.filepath)}`;
        }
      }

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

    // Method not allowed
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Services API error:", error);
    return res.status(500).json({ message });
  }
}
