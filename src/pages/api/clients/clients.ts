import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

// Define the type for client data
interface ClientData {
  id: number;
  name: string;
  logo?: string;
  created_at: string;
}

// Route to fetch clients with an optional limit parameter
const getClients = async (req: NextApiRequest, res: NextApiResponse) => {
  const { limit = '12' } = req.query;
  const limitNumber = parseInt(limit as string, 10);
  const finalLimit = isNaN(limitNumber) ? 12 : limitNumber;

  try {
    const [rows] = await db.query<ClientData[]>(
      'SELECT * FROM clients ORDER BY created_at DESC LIMIT ?',
      [finalLimit]
    );

    res.status(200).json({ clients: rows });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch clients';
    res.status(500).json({ message: errorMessage });
  }
};

export default getClients;
