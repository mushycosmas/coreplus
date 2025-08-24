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
  // Extract and validate the limit query parameter
  const { limit = '12' } = req.query;
  const limitNumber = parseInt(limit as string, 10);

  // Ensure limit is a valid number, fallback to 12 if not
  const finalLimit = isNaN(limitNumber) ? 12 : limitNumber;

  try {
    // Query the database with the limit
    const [rows] = await db.query<ClientData[]>(
      'SELECT * FROM clients ORDER BY created_at DESC LIMIT ?',
      [finalLimit]
    );

    // Respond with the fetched clients
    res.status(200).json({ clients: rows });
  } catch (error: unknown) {
    // Handle any errors
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch clients';
    res.status(500).json({ message: errorMessage });
  }
};

export default getClients;
