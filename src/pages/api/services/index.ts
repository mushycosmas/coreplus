import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { createRouter } from 'next-connect';
import upload from '@/lib/middleware/upload';

interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

// Middleware to handle file upload
router.use(upload.single('image'));

// GET /api/services
router.get(async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM services ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch services' });
  }
});

// POST /api/services
router.post(async (req, res) => {
  const { title, description, icon } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const [result] = await db.query(
      'INSERT INTO services (title, description, icon, image) VALUES (?, ?, ?, ?)',
      [title, description, icon, imagePath]
    );

    res.status(201).json({
      id: (result as any).insertId,
      title,
      description,
      icon,
      image: imagePath,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create service' });
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
