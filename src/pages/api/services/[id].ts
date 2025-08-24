import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { createRouter } from 'next-connect';
import upload from '@/lib/middleware/upload';
import fs from 'fs';
import path from 'path';

interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

// Middleware to handle file upload
router.use(upload.single('image'));

// PUT /api/services/[id]
router.put(async (req, res) => {
  const { id } = req.query;
  const { title, description, icon } = req.body;

  // Get existing service
  const [existing] = await db.query('SELECT image FROM services WHERE id = ?', [id]);
  const service = (existing as any)[0];

  let imagePath = service?.image || null;

  if (req.file) {
    // Delete old image if it exists
    if (imagePath) {
      const fullPath = path.join(process.cwd(), 'public', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    imagePath = `/uploads/${req.file.filename}`;
  }

  try {
    await db.query(
      'UPDATE services SET title = ?, description = ?, icon = ?, image = ? WHERE id = ?',
      [title, description, icon, imagePath, id]
    );

    res.status(200).json({ id, title, description, icon, image: imagePath });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update service' });
  }
});

// DELETE /api/services/[id]
router.delete(async (req, res) => {
  const { id } = req.query;

  try {
    // Get service to delete image
    const [rows] = await db.query('SELECT image FROM services WHERE id = ?', [id]);
    const service = (rows as any)[0];

    if (service?.image) {
      const fullPath = path.join(process.cwd(), 'public', service.image);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await db.query('DELETE FROM services WHERE id = ?', [id]);
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete service' });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default router.handler({
  onError(error, req, res) {
    res.status(500).json({ message: error.message });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: 'Method not allowed' });
  },
});
