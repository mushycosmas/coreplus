import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { createRouter } from 'next-connect';
import upload from '@/lib/middleware/upload';
import fs from 'fs';
import path from 'path';

// Define the types for the client data
interface ClientData {
  id: number;
  name: string;
  logo?: string;
}

interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

// Middleware for file upload
router.use(upload.single('logo'));

// GET /api/clients/[id]
router.get(async (req, res) => {
  const { id } = req.query;

  try {
    const [rows] = await db.query<ClientData[]>('SELECT * FROM clients WHERE id = ?', [id]);
    const client = rows[0] || null;
    res.status(200).json(client);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch client data';
    res.status(500).json({ message: errorMessage });
  }
});

// PUT /api/clients/[id]
router.put(async (req, res) => {
  const { id } = req.query;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Client name is required' });
  }

  try {
    // Check if the client exists
    const [existingRows] = await db.query<ClientData[]>('SELECT logo FROM clients WHERE id = ?', [id]);
    const existingClient = existingRows[0];
    let logoPath = existingClient?.logo || null;

    // If a new logo is uploaded, remove the old logo
    if (req.file) {
      if (existingClient?.logo) {
        const oldLogoPath = path.join(process.cwd(), 'public', existingClient.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath); // Synchronously remove the old logo
        }
      }
      logoPath = '/uploads/' + req.file.filename; // Set the new logo path
    }

    // Update the client in the database
    await db.query('UPDATE clients SET name = ?, logo = ? WHERE id = ?', [name, logoPath, id]);
    res.status(200).json({ id, name, logo: logoPath });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update client';
    res.status(500).json({ message: errorMessage });
  }
});

// DELETE /api/clients/[id]
router.delete(async (req, res) => {
  const { id } = req.query;

  try {
    const [rows] = await db.query<ClientData[]>('SELECT logo FROM clients WHERE id = ?', [id]);
    const client = rows[0];

    // If the client has a logo, delete the image from the file system
    if (client?.logo) {
      const logoPath = path.join(process.cwd(), 'public', client.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath); // Remove the logo file
      }
    }

    // Delete the client from the database
    await db.query('DELETE FROM clients WHERE id = ?', [id]);
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete client';
    res.status(500).json({ message: errorMessage });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disable body parser since we are handling file uploads
  },
};

export default router.handler({
  onError(error, req, res) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ message: errorMessage });
  },
  onNoMatch(req, res) {
    res.status(405).json({ message: 'Method not allowed' });
  },
});
