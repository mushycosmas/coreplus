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

interface ServiceRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  icon: string;
  image?: string | null;
}

interface ServiceFormFields {
  title?: string[];
  description?: string[];
  icon?: string[];
}

interface ServiceFiles {
  image?: File[];
}

// Helper to parse form
function parseForm(req: NextApiRequest): Promise<{ fields: ServiceFormFields; files: ServiceFiles }> {
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
      else resolve({ fields: fields as ServiceFormFields, files: files as ServiceFiles });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) return res.status(400).json({ message: "Invalid service ID" });

  try {
    // 🔹 UPDATE service (PUT)
    if (req.method === "PUT") {
      const { fields, files } = await parseForm(req);

      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title ?? "";
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description ?? "";
      const icon = Array.isArray(fields.icon) ? fields.icon[0] : fields.icon ?? "";

      if (!title.trim() || !description.trim() || !icon.trim()) {
        return res.status(400).json({ message: "Title, description, and icon are required" });
      }

      // Get existing service
      const [existingRows] = await db.query<ServiceRow[]>("SELECT * FROM services WHERE id = ?", [id]);
      const existing = existingRows[0];
      if (!existing) return res.status(404).json({ message: "Service not found" });

      // Handle new image
      const uploadedFile = files.image?.[0];
      let imagePath: string | null = existing.image || null;
      if (uploadedFile) {
        imagePath = `/uploads/${path.basename(uploadedFile.filepath)}`;

        // Delete old image if exists
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

    // 🔹 DELETE service
    if (req.method === "DELETE") {
      // Check if service exists
      const [rows] = await db.query<ServiceRow[]>("SELECT * FROM services WHERE id = ?", [id]);
      const existing = rows[0];
      if (!existing) return res.status(404).json({ message: "Service not found" });

      // Delete image file if exists
      if (existing.image) {
        const imagePath = path.join(process.cwd(), "public", existing.image);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }

      // Delete from DB
      await db.query<ResultSetHeader>("DELETE FROM services WHERE id = ?", [id]);

      return res.status(200).json({ message: "Service deleted successfully" });
    }

    // If other methods
    res.setHeader("Allow", ["PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("Service API error:", error);
    res.status(500).json({ message });
  }
}
