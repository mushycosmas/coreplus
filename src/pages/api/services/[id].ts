import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { createRouter } from "next-connect";
import upload from "@/lib/middleware/upload";
import fs from "fs";
import path from "path";
import { RowDataPacket } from "mysql2";

interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

interface Service extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  icon: string;
  image: string | null;
}

const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

// Middleware to handle file upload
router.use(upload.single("image"));

// PUT /api/services/[id]
router.put(async (req, res) => {
  const { id } = req.query;
  const { title, description, icon } = req.body;

  if (!id || Array.isArray(id) || !title || !description || !icon) {
    return res
      .status(400)
      .json({ message: "Missing required fields (id, title, description, icon)" });
  }

  try {
    // Get existing service
    const [rows] = await db.query<Service[]>(
      "SELECT image FROM services WHERE id = ?",
      [id]
    );
    const service = rows[0];

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    let imagePath = service.image;

    if (req.file) {
      // Delete old image if exists
      if (imagePath) {
        const fullPath = path.join(process.cwd(), "public", imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      imagePath = `/uploads/${req.file.filename}`;
    }

    // Update DB
    await db.query(
      "UPDATE services SET title = ?, description = ?, icon = ?, image = ? WHERE id = ?",
      [title, description, icon, imagePath, id]
    );

    res
      .status(200)
      .json({ id: Number(id), title, description, icon, image: imagePath });
  } catch (error: unknown) {
    console.error("Error updating service:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to update service",
    });
  }
});

// DELETE /api/services/[id]
router.delete(async (req, res) => {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Service ID is required" });
  }

  try {
    const [rows] = await db.query<Service[]>(
      "SELECT image FROM services WHERE id = ?",
      [id]
    );
    const service = rows[0];

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.image) {
      const fullPath = path.join(process.cwd(), "public", service.image);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await db.query("DELETE FROM services WHERE id = ?", [id]);
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting service:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to delete service",
    });
  }
});

export const config = {
  api: {
    bodyParser: false, // needed for file uploads
  },
};

export default router.handler({
  onError(error, req, res) {
    console.error("API error:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unexpected server error",
    });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: "Method not allowed" });
  },
});
