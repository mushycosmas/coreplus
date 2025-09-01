import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

// Disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Parse multipart/form-data
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

interface ServiceRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  icon: string;
  image?: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) return res.status(400).json({ message: "Invalid service ID" });

  try {
    // GET single service
    if (req.method === "GET") {
      const [rows] = await db.query<ServiceRow[]>("SELECT * FROM services WHERE id = ?", [id]);
      if (!rows || rows.length === 0) return res.status(404).json({ message: "Service not found" });
      return res.status(200).json(rows[0]);
    }

    // PUT → update service
    if (req.method === "PUT") {
      const { fields, files } = await parseForm(req);

      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const icon = Array.isArray(fields.icon) ? fields.icon[0] : fields.icon;

      if (!title || !description || !icon) {
        return res.status(400).json({ message: "Title, description, and icon are required" });
      }

      // Fetch existing service
      const [existingRows] = await db.query<ServiceRow[]>("SELECT image FROM services WHERE id = ?", [id]);
      const existing = existingRows[0];
      if (!existing) return res.status(404).json({ message: "Service not found" });

      // Handle new image
      const uploadedFile = Array.isArray(files.image) ? files.image[0] : files.image as File | undefined;
      let imagePath = existing.image || null;
      if (uploadedFile) {
        imagePath = `/uploads/${uploadedFile.newFilename}`;
        // Delete old image
        if (existing.image) {
          const oldPath = path.join(process.cwd(), "public", existing.image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      // Update DB
      await db.query<ResultSetHeader>(
        "UPDATE services SET title = ?, description = ?, icon = ?, image = ? WHERE id = ?",
        [title, description, icon, imagePath, id]
      );

      return res.status(200).json({ id: Number(id), title, description, icon, image: imagePath });
    }

    // DELETE → delete service
    if (req.method === "DELETE") {
      const [existingRows] = await db.query<ServiceRow[]>("SELECT image FROM services WHERE id = ?", [id]);
      const existing = existingRows[0];
      if (!existing) return res.status(404).json({ message: "Service not found" });

      // Delete image
      if (existing.image) {
        const oldPath = path.join(process.cwd(), "public", existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      await db.query("DELETE FROM services WHERE id = ?", [id]);
      return res.status(200).json({ message: "Service deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("Service [id] API error:", error);
    return res.status(500).json({ message });
  }
}
