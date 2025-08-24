import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";

export const config = {
  api: {
    bodyParser: false,
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
  const { id } = req.query;

  if (!id) return res.status(400).json({ message: "Missing ID" });

  try {
    if (req.method === "PUT") {
      const { fields, files } = await parseForm(req);

      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const icon = Array.isArray(fields.icon) ? fields.icon[0] : fields.icon;

      // Get existing image path
      const [existingRows] = await db.query<{ image?: string }[]>(
        "SELECT image FROM about WHERE id = ?",
        [id]
      );
      const existing = existingRows[0];

      let imagePath = existing?.image ?? null;

      // Replace image if a new file was uploaded
      const uploadedFile = files.image as File | undefined;
      if (uploadedFile) {
        // Delete old image
        if (existing?.image) {
          const oldPath = path.join(process.cwd(), "public", existing.image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        imagePath = `/uploads/${path.basename(uploadedFile.filepath)}`;
      }

      await db.query(
        "UPDATE about SET title = ?, description = ?, icon = ?, image = ? WHERE id = ?",
        [title, description, icon, imagePath, id]
      );

      return res.status(200).json({ id, title, description, icon, image: imagePath });
    }

    if (req.method === "DELETE") {
      const [rows] = await db.query<{ image?: string }[]>("SELECT image FROM about WHERE id = ?", [id]);
      const about = rows[0];

      if (about?.image) {
        const imgPath = path.join(process.cwd(), "public", about.image);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }

      await db.query("DELETE FROM about WHERE id = ?", [id]);
      return res.status(200).json({ message: "Deleted successfully" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return res.status(500).json({ message });
  }
}
