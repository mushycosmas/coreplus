import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { createRouter } from 'next-connect';
import upload from '@/lib/middleware/upload';

interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

// Middleware to handle file uploads
router.use(upload.single('logo'));

// GET /api/clients
router.get(async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clients ORDER BY created_at DESC');
    res.status(200).json(rows);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch clients' });
  }
});

// POST /api/clients
router.post(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Client name is required' });
  }

  const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const [result] = await db.query(
      'INSERT INTO clients (name, logo) VALUES (?, ?)',
      [name, logoPath]
    );

    res.status(201).json({
      id: (result as any).insertId,
      name,
      logo: logoPath,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create client' });
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
