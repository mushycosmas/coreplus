import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { createRouter } from 'next-connect';
import upload from '@/lib/middleware/upload';

interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

router.use(upload.single('image'));

// GET /api/about
router.get(async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM about ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch about items' });
  }
});

// POST /api/about
router.post(async (req, res) => {
  const { title, description, icon } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const [result] = await db.query(
      'INSERT INTO about (title, description, image, icon) VALUES (?, ?, ?, ?)',
      [title, description, imagePath, icon]
    );

    res.status(201).json({
      id: (result as any).insertId,
      title,
      description,
      image: imagePath,
      icon,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create about' });
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
