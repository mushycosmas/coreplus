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

  // Validate inputs
  if (!id || !title || !description || !icon) {
    return res.status(400).json({ message: 'Missing required fields (id, title, description, icon)' });
  }

  try {
    // Get existing service data
    const [existing] = await db.query('SELECT image FROM services WHERE id = ?', [id]);
    const service = (existing as any)[0];

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    let imagePath = service?.image || null;

    if (req.file) {
      // Delete the old image if it exists
      if (imagePath) {
        const fullPath = path.join(process.cwd(), 'public', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }

      imagePath = `/uploads/${req.file.filename}`;
    }

    // Update the service in the database
    await db.query(
      'UPDATE services SET title = ?, description = ?, icon = ?, image = ? WHERE id = ?',
      [title, description, icon, imagePath, id]
    );

    res.status(200).json({ id, title, description, icon, image: imagePath });
  } catch (error: any) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: error.message || 'Failed to update service' });
  }
});

// DELETE /api/services/[id]
router.delete(async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Service ID is required' });
  }

  try {
    // Get service to delete image
    const [rows] = await db.query('SELECT image FROM services WHERE id = ?', [id]);
    const service = (rows as any)[0];

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service?.image) {
      const fullPath = path.join(process.cwd(), 'public', service.image);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // Delete the service from the database
    await db.query('DELETE FROM services WHERE id = ?', [id]);
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting service:', error);
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
    console.error('API error:', error);
    res.status(500).json({ message: error.message });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: 'Method not allowed' });
  },
});
