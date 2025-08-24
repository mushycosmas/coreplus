import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { createRouter } from 'next-connect';
import upload from '@/lib/middleware/upload';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Extend NextApiRequest to support file upload
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// Define service type (based on your table structure)
interface Service extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  icon: string;
  image: string | null;
}

const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

// Middleware to handle file upload
router.use(upload.single('image'));

// GET /api/services
router.get(async (req, res) => {
  try {
    const [rows] = await db.query<Service[]>(
      'SELECT * FROM services ORDER BY id DESC'
    );
    res.status(200).json(rows);
  } catch (error: unknown) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to fetch services',
    });
  }
});

// POST /api/services
router.post(async (req, res) => {
  const { title, description, icon } = req.body;

  // Input validation
  if (!title || !description || !icon) {
    return res.status(400).json({ message: 'Title, description, and icon are required' });
  }

  // Handle optional file upload
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO services (title, description, icon, image) VALUES (?, ?, ?, ?)',
      [title, description, icon, imagePath]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      description,
      icon,
      image: imagePath,
    });
  } catch (error: unknown) {
    console.error('Error creating service:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to create service',
    });
  }
});

export const config = {
  api: {
    bodyParser: false, // Required for multer
  },
};

export default router.handler({
  onError(error, req, res) {
    console.error('API error:', error);
    res
      .status(500)
      .json({ message: error instanceof Error ? error.message : 'Unexpected error' });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: 'Method not allowed' });
  },
});
