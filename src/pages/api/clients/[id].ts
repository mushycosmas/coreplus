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

// Middleware for file upload
router.use(upload.single('logo'));

// GET /api/clients/[id]
router.get(async (req, res) => {
  const { id } = req.query;
  const [rows] = await db.query('SELECT * FROM clients WHERE id = ?', [id]);
  res.status(200).json((rows as any)[0] || null);
});

// PUT /api/clients/[id]
router.put(async (req, res) => {
  const { id } = req.query;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Client name is required' });
  }

  const [existingRows] = await db.query('SELECT logo FROM clients WHERE id = ?', [id]);
  const existingClient = (existingRows as any)[0];
  let logoPath = existingClient?.logo || null;

  if (req.file) {
    if (existingClient?.logo) {
      const oldLogoPath = path.join(process.cwd(), 'public', existingClient.logo);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }
    logoPath = '/uploads/' + req.file.filename;
  }

  await db.query('UPDATE clients SET name = ?, logo = ? WHERE id = ?', [name, logoPath, id]);
  res.status(200).json({ id, name, logo: logoPath });
});

// DELETE /api/clients/[id]
router.delete(async (req, res) => {
  const { id } = req.query;

  const [rows] = await db.query('SELECT logo FROM clients WHERE id = ?', [id]);
  const client = (rows as any)[0];

  if (client?.logo) {
    const logoPath = path.join(process.cwd(), 'public', client.logo);
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
    }
  }

  await db.query('DELETE FROM clients WHERE id = ?', [id]);
  res.status(200).json({ message: 'Deleted successfully' });
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
