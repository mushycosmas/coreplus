import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface ClientData {
  id: number;
  name: string;
  logo?: string | null;
  created_at: string;
}

const getClients = async (req: NextApiRequest, res: NextApiResponse) => {
  const { limit = '12' } = req.query;
  const limitNumber = parseInt(limit as string, 10);
  const finalLimit = isNaN(limitNumber) ? 12 : limitNumber;

  try {
    // Use RowDataPacket[] for typing, then cast to ClientData[]
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT * FROM clients ORDER BY created_at DESC LIMIT ?',
      [finalLimit]
    );

    const clients = rows as ClientData[];

    res.status(200).json({ clients });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch clients';
    res.status(500).json({ message });
  }
};

export default getClients;
