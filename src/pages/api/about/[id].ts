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

router.use(upload.single('image'));

router.put(async (req, res) => {
  const { id } = req.query;
  const { title, description, icon } = req.body;

  try {
    // Fetch existing image
    const [existing] = await db.query('SELECT image FROM about WHERE id = ?', [id]);
    const existingItem = (existing as any)[0];

    let imagePath = existingItem?.image || null;

    if (req.file) {
      if (existingItem?.image) {
        const oldPath = path.join(process.cwd(), 'public', existingItem.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      imagePath = `/uploads/${req.file.filename}`;
    }

    await db.query(
      'UPDATE about SET title = ?, description = ?, image = ?, icon = ? WHERE id = ?',
      [title, description, imagePath, icon, id]
    );

    res.status(200).json({ id, title, description, image: imagePath, icon });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Update failed' });
  }
});

router.delete(async (req, res) => {
  const { id } = req.query;

  try {
    const [rows] = await db.query('SELECT image FROM about WHERE id = ?', [id]);
    const about = (rows as any)[0];

    if (about?.image) {
      const imgPath = path.join(process.cwd(), 'public', about.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await db.query('DELETE FROM about WHERE id = ?', [id]);
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Deletion failed' });
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
