import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { createRouter } from 'next-connect';
import upload from '@/lib/middleware/upload';
import { FieldPacket } from 'mysql2';

interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

// Type for a Client object
interface Client {
  id: number;
  name: string;
  logo?: string;
  created_at: string;
}

const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

// Middleware to handle file uploads
router.use(upload.single('logo'));

// GET /api/clients
router.get(async (req, res) => {
  try {
    const [rows] = await db.query<Client[]>('SELECT * FROM clients ORDER BY created_at DESC');
    res.status(200).json(rows); // Return the clients
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch clients';
    res.status(500).json({ message: errorMessage });
  }
});

// POST /api/clients
router.post(async (req, res) => {
  const { name } = req.body;

  // Ensure the client name is provided
  if (!name) {
    return res.status(400).json({ message: 'Client name is required' });
  }

  // Handle logo file upload path
  const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    // Insert the new client into the database
    const [result] = await db.query<Client[] & FieldPacket[]>(
      'INSERT INTO clients (name, logo) VALUES (?, ?)',
      [name, logoPath]
    );

    // Return the newly created client information
    res.status(201).json({
      id: (result as any).insertId, // Handle the insertId for new client
      name,
      logo: logoPath,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create client';
    res.status(500).json({ message: errorMessage });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser for file uploads
  },
};

export default router.handler({
  onError(error, req, res) {
    // Handle errors in a structured way
    res.status(500).json({ message: error.message });
  },
  onNoMatch(req, res) {
    // Handle unsupported HTTP methods
    res.status(405).json({ message: 'Method not allowed' });
  },
});
