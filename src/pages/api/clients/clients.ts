import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

// Route to fetch clients with optional limit parameter
const getClients = async (req: NextApiRequest, res: NextApiResponse) => {
  const { limit = 12 } = req.query;  // Default limit to 12 if no limit is provided
  const limitNumber = parseInt(limit as string, 10);  // Convert to integer

  try {
    // Query with LIMIT to restrict the number of clients returned
    const [rows] = await db.query('SELECT * FROM clients ORDER BY created_at DESC LIMIT ?', [limitNumber]);

    // Respond with the fetched clients
    res.status(200).json({ clients: rows });
  } catch (error: any) {
    // Handle any errors
    res.status(500).json({ message: error.message || 'Failed to fetch clients' });
  }
};

export default getClients;
