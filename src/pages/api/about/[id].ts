import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import formidable, { File } from "formidable";
import path from "path";
import { ResultSetHeader } from "mysql2";

export const config = {
  api: {
    bodyParser: false, // Required for formidable
  },
};

// Define form fields type
interface AboutFormFields {
  title?: string[];
  description?: string[];
  icon?: string[];
}

interface AboutFiles {
  image?: File[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({
    multiples: false,
    uploadDir: path.join(process.cwd(), "public/uploads"),
    keepExtensions: true,
  });

  // Wrap parse in a typed promise
  const parseForm = (): Promise<{ fields: AboutFormFields; files: AboutFiles }> =>
    new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields: fields as AboutFormFields, files: files as AboutFiles });
      });
    });

  try {
    const { fields, files } = await parseForm();

    const id = req.query.id as string;
    const title = fields.title?.[0] ?? "";
    const description = fields.description?.[0] ?? "";
    const icon = fields.icon?.[0] ?? "";

    let imagePath: string | null = null;
    if (files.image && files.image[0]) {
      const uploadedFile = files.image[0];
      imagePath = `/uploads/${path.basename(uploadedFile.filepath)}`;
    }

    // Safe parameterized query to avoid SQL injection
    await db.query<ResultSetHeader>(
      "UPDATE about SET title = ?, description = ?, icon = ?, image = IFNULL(?, image) WHERE id = ?",
      [title, description, icon, imagePath, id]
    );

    return res.status(200).json({ message: "About updated successfully" });
  } catch (error: unknown) {
    console.error("Error updating about:", error);
    const message = error instanceof Error ? error.message : "Unknown server error";
    return res.status(500).json({ message });
  }
}
